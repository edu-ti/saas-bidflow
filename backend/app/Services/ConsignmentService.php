<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\AccountsReceivable;
use App\Models\Consignment;
use App\Models\ConsignmentItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConsignmentService
{
    // ─────────────────────────────────────────────
    //  CREATE  (draft → saved with items)
    // ─────────────────────────────────────────────
    public function create(array $data): Consignment
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $data['user_id']     = Auth::id();
            $data['total_value'] = $this->calcTotal($items);

            $consignment = Consignment::create($data);
            $this->syncItems($consignment, $items);

            $this->audit($consignment, 'created', null, $consignment->status);
            return $consignment->load('consignee', 'user', 'items.product');
        });
    }

    // ─────────────────────────────────────────────
    //  UPDATE  (while still draft)
    // ─────────────────────────────────────────────
    public function update(Consignment $consignment, array $data): Consignment
    {
        if ($consignment->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' => 'Apenas consignações em rascunho podem ser editadas.',
            ]);
        }

        return DB::transaction(function () use ($consignment, $data) {
            $items = $data['items'] ?? null;
            unset($data['items']);

            if ($items !== null) {
                $data['total_value'] = $this->calcTotal($items);
                $this->syncItems($consignment, $items);
            }

            $consignment->update($data);
            $this->audit($consignment, 'updated', null, $consignment->status);
            return $consignment->load('consignee', 'user', 'items.product');
        });
    }

    // ─────────────────────────────────────────────
    //  SEND  (draft → sent + stock deduction)
    // ─────────────────────────────────────────────
    public function send(Consignment $consignment): Consignment
    {
        if ($consignment->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' => 'Apenas rascunhos podem ser enviados.',
            ]);
        }

        $consignee = $consignment->consignee;

        // Validate credit limit
        $openValue = Consignment::where('consignee_id', $consignee->id)
            ->whereIn('status', ['sent', 'partially_returned'])
            ->sum('total_value');

        if (($openValue + $consignment->total_value) > $consignee->credit_limit) {
            throw ValidationException::withMessages([
                'credit_limit' => "Limite de crédito do consignatário seria excedido. Disponível: R$ " .
                    number_format($consignee->credit_limit - $openValue, 2, ',', '.'),
            ]);
        }

        return DB::transaction(function () use ($consignment) {
            // Deduct stock
            foreach ($consignment->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                if (!$product) continue;

                $currentStock = $product->stock ?? 0;
                if ($currentStock < $item->qty_sent) {
                    throw ValidationException::withMessages([
                        'stock' => "Estoque insuficiente para \"{$product->name}\". Disponível: {$currentStock}.",
                    ]);
                }
                $product->decrement('stock', $item->qty_sent);
            }

            $old = $consignment->status;
            $consignment->update(['status' => 'sent', 'issue_date' => now()->toDateString()]);
            $this->audit($consignment, 'status_changed', $old, 'sent');

            return $consignment->load('consignee', 'user', 'items.product');
        });
    }

    // ─────────────────────────────────────────────
    //  RECONCILE  (prestação de contas por item)
    // ─────────────────────────────────────────────
    public function reconcile(Consignment $consignment, array $reconcileData): Consignment
    {
        if (!in_array($consignment->status, ['sent', 'partially_returned'])) {
            throw ValidationException::withMessages([
                'status' => 'Apenas consignações enviadas podem ser conciliadas.',
            ]);
        }

        return DB::transaction(function () use ($consignment, $reconcileData) {
            foreach ($reconcileData as $itemData) {
                $item = ConsignmentItem::where('consignment_id', $consignment->id)
                    ->where('id', $itemData['item_id'])
                    ->firstOrFail();

                $newSold     = (int) ($itemData['qty_sold'] ?? $item->qty_sold);
                $newReturned = (int) ($itemData['qty_returned'] ?? $item->qty_returned);

                if (($newSold + $newReturned) > $item->qty_sent) {
                    throw ValidationException::withMessages([
                        'items' => "Qtd vendida + devolvida excede a qtd enviada para o item #{$item->id}.",
                    ]);
                }

                $item->update([
                    'qty_sold'     => $newSold,
                    'qty_returned' => $newReturned,
                ]);
            }

            // Determine new status
            $consignment->load('items');
            $allResolved = $consignment->items->every(
                fn($i) => ($i->qty_sold + $i->qty_returned) === $i->qty_sent
            );

            $newStatus = 'partially_returned';

            $old = $consignment->status;
            $consignment->update(['status' => $newStatus]);
            $this->audit($consignment, 'reconciled', $old, $newStatus);

            return $consignment->load('consignee', 'user', 'items.product');
        });
    }

    // ─────────────────────────────────────────────
    //  CLOSE  (final settlement + stock + AR)
    // ─────────────────────────────────────────────
    public function close(Consignment $consignment): Consignment
    {
        if (!in_array($consignment->status, ['sent', 'partially_returned'])) {
            throw ValidationException::withMessages([
                'status' => 'Apenas consignações enviadas ou parcialmente devolvidas podem ser fechadas.',
            ]);
        }

        return DB::transaction(function () use ($consignment) {
            $consignee = $consignment->consignee;
            $totalSold = 0;

            foreach ($consignment->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                if (!$product) continue;

                // Return qty_returned to stock (already reconciled returns)
                if ($item->qty_returned > 0) {
                    $product->increment('stock', $item->qty_returned);
                }

                // Any remaining pending qty is also treated as returned
                $qtyPending = $item->qty_sent - $item->qty_returned - $item->qty_sold;
                if ($qtyPending > 0) {
                    $product->increment('stock', $qtyPending);
                    $item->update(['qty_returned' => $item->qty_returned + $qtyPending]);
                }

                $totalSold += $item->qty_sold * (float) $item->agreed_unit_price;
            }

            // Generate Accounts Receivable (net of commission)
            if ($totalSold > 0) {
                $commissionAmt = $totalSold * ((float) $consignee->commission_rate / 100);
                $netAmount     = $totalSold - $commissionAmt;

                AccountsReceivable::create([
                    'company_id'      => $consignment->company_id,
                    'reference_title' => "Consignação #{$consignment->id} – {$consignee->name}",
                    'amount'          => $netAmount,
                    'due_date'        => now()->addDays(3),
                    'status'          => 'Pending',
                ]);
            }

            $old = $consignment->status;
            $consignment->update([
                'status'      => 'closed',
                'total_value' => $totalSold,
            ]);

            $this->audit($consignment, 'closed', $old, 'closed');
            return $consignment->load('consignee', 'user', 'items.product');
        });
    }

    // ─────────────────────────────────────────────
    //  REPORT  – giro por consignatário
    // ─────────────────────────────────────────────
    public function report(): array
    {
        $rows = Consignment::with('consignee')
            ->where('status', 'closed')
            ->get()
            ->groupBy('consignee_id')
            ->map(function ($group) {
                $consignee = $group->first()->consignee;
                $totalSent = 0;
                $totalSold = 0;

                foreach ($group as $c) {
                    foreach ($c->items as $item) {
                        $totalSent += $item->qty_sent;
                        $totalSold += $item->qty_sold;
                    }
                }

                $saleRate = $totalSent > 0 ? round(($totalSold / $totalSent) * 100, 1) : 0;
                $returnRate = 100 - $saleRate;

                return [
                    'consignee_id'   => $consignee->id,
                    'consignee_name' => $consignee->name,
                    'total_ops'      => $group->count(),
                    'total_sent'     => $totalSent,
                    'total_sold'     => $totalSold,
                    'total_returned' => $totalSent - $totalSold,
                    'sale_rate'      => $saleRate,
                    'return_rate'    => $returnRate,
                    'total_revenue'  => $group->sum('total_value'),
                ];
            })
            ->values();

        return $rows->toArray();
    }

    // ─────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────
    private function calcTotal(array $items): float
    {
        return array_reduce($items, fn($carry, $i) =>
            $carry + ((int)($i['qty_sent'] ?? 0) * (float)($i['agreed_unit_price'] ?? 0))
        , 0.0);
    }

    private function syncItems(Consignment $consignment, array $items): void
    {
        $consignment->items()->delete();

        foreach ($items as $item) {
            ConsignmentItem::create([
                'consignment_id'    => $consignment->id,
                'product_id'        => $item['product_id'],
                'qty_sent'          => (int) ($item['qty_sent'] ?? 0),
                'qty_returned'      => 0,
                'qty_sold'          => 0,
                'agreed_unit_price' => (float) ($item['agreed_unit_price'] ?? 0),
            ]);
        }
    }

    private function audit(Consignment $consignment, string $action, ?string $old, ?string $new): void
    {
        AuditLog::create([
            'company_id'      => $consignment->company_id,
            'user_id'         => Auth::id(),
            'auditable_type'  => Consignment::class,
            'auditable_id'    => $consignment->id,
            'action'          => $action,
            'old_value'       => $old,
            'new_value'       => $new,
            'ip_address'      => request()->ip(),
        ]);
    }
}
