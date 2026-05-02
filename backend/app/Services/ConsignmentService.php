<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Consignment;
use App\Models\ConsignmentItem;
use App\Models\InventoryProduct;
use App\Models\InventoryMovement;
use App\Models\AccountsReceivable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConsignmentService
{
    public function __construct(private FinancialEngineService $financialService) {}

    /**
     * Passo 1: Criação da Consignação e Reserva de Estoque
     */
    public function createConsignment(array $data): Consignment
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $data['user_id'] = Auth::id();
            $data['status'] = 'active'; // Inicia como ativo conforme solicitado
            $data['total_value'] = $this->calcTotal($items);

            $consignment = Consignment::create($data);

            foreach ($items as $itemData) {
                $inventoryProduct = InventoryProduct::where('company_id', $consignment->company_id)
                    ->where('product_id', $itemData['product_id'])
                    ->firstOrFail();

                if ($inventoryProduct->on_hand_qty < $itemData['qty_sent']) {
                    throw ValidationException::withMessages([
                        'stock' => "Estoque insuficiente para o produto ID {$itemData['product_id']}. Disponível: {$inventoryProduct->on_hand_qty}"
                    ]);
                }

                // Deduz do estoque disponível e move para "em consignação" (poderíamos ter um campo específico, mas vamos apenas deduzir e registrar o movimento)
                $inventoryProduct->decrement('on_hand_qty', $itemData['qty_sent']);
                
                // Opcional: Incrementar um campo 'consigned_qty' se existisse. Como não existe, vamos registrar o movimento.
                InventoryMovement::create([
                    'company_id' => $consignment->company_id,
                    'inventory_product_id' => $inventoryProduct->id,
                    'user_id' => Auth::id(),
                    'type' => 'out',
                    'quantity' => $itemData['qty_sent'],
                    'reason' => "Remessa em Consignação #{$consignment->id}",
                ]);

                ConsignmentItem::create([
                    'consignment_id' => $consignment->id,
                    'product_id' => $itemData['product_id'],
                    'qty_sent' => $itemData['qty_sent'],
                    'qty_returned' => 0,
                    'qty_sold' => 0,
                    'agreed_unit_price' => $itemData['agreed_unit_price'],
                ]);
            }

            $this->audit($consignment, 'created_active', null, 'active');

            return $consignment->load('consignee', 'items.product');
        });
    }

    /**
     * Passo 2: Reconciliação (Acerto)
     */
    public function reconcileConsignment(int $consignmentId, array $soldItems, array $returnedItems): Consignment
    {
        return DB::transaction(function () use ($consignmentId, $soldItems, $returnedItems) {
            $consignment = Consignment::findOrFail($consignmentId);

            if ($consignment->status !== 'active') {
                throw ValidationException::withMessages([
                    'status' => 'Esta consignação já foi reconciliada ou não está ativa.'
                ]);
            }

            $totalSoldAmount = 0;

            // Processar Devoluções
            foreach ($returnedItems as $ret) {
                $item = ConsignmentItem::where('consignment_id', $consignmentId)
                    ->where('product_id', $ret['product_id'])
                    ->first();

                if ($item) {
                    $item->increment('qty_returned', $ret['quantity']);
                    
                    // Volta para o estoque disponível
                    $inventoryProduct = InventoryProduct::where('company_id', $consignment->company_id)
                        ->where('product_id', $ret['product_id'])
                        ->first();
                    
                    if ($inventoryProduct) {
                        $inventoryProduct->increment('on_hand_qty', $ret['quantity']);
                        
                        InventoryMovement::create([
                            'company_id' => $consignment->company_id,
                            'inventory_product_id' => $inventoryProduct->id,
                            'user_id' => Auth::id(),
                            'type' => 'in',
                            'quantity' => $ret['quantity'],
                            'reason' => "Retorno de Consignação #{$consignment->id}",
                        ]);
                    }
                }
            }

            // Processar Vendas
            foreach ($soldItems as $sold) {
                $item = ConsignmentItem::where('consignment_id', $consignmentId)
                    ->where('product_id', $sold['product_id'])
                    ->first();

                if ($item) {
                    $item->increment('qty_sold', $sold['quantity']);
                    $totalSoldAmount += ($sold['quantity'] * $item->agreed_unit_price);
                    
                    // Baixa definitiva (já foi removido do on_hand_qty na criação, então aqui apenas registramos a venda se necessário ou mantemos como está)
                    // No fluxo atual, o estoque já foi baixado na saída. Se fôssemos precisos, teríamos uma conta de "Estoque em Consignação".
                    // Como não temos, o decrement já ocorreu no 'create'.
                }
            }

            // Gatilho Financeiro: Gerar Conta a Receber
            if ($totalSoldAmount > 0) {
                $this->financialService->createReceivable([
                    'company_id' => $consignment->company_id,
                    'reference_title' => "Acerto de Consignação #{$consignment->id} - {$consignment->consignee->name}",
                    'amount' => $totalSoldAmount,
                    'due_date' => now()->addDays(7),
                    'status' => 'Pending',
                    'description' => "Faturamento automático referente a itens vendidos em consignação.",
                ]);
            }

            $consignment->update(['status' => 'closed']);
            $this->audit($consignment, 'reconciled', 'active', 'closed');

            return $consignment->load('consignee', 'items.product');
        });
    }

    private function calcTotal(array $items): float
    {
        return array_reduce($items, fn($carry, $i) => 
            $carry + ($i['qty_sent'] * $i['agreed_unit_price']), 0.0);
    }

    private function audit(Consignment $consignment, string $action, ?string $old, ?string $new): void
    {
        AuditLog::create([
            'company_id' => $consignment->company_id,
            'user_id' => Auth::id(),
            'auditable_type' => Consignment::class,
            'auditable_id' => $consignment->id,
            'action' => $action,
            'old_value' => $old,
            'new_value' => $new,
            'ip_address' => request()->ip(),
        ]);
    }
}
