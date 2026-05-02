<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use App\Models\InventoryProduct;
use App\Services\ConsignmentService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ConsignmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private ConsignmentService $service) {}

    /**
     * Listar consignações
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Consignment::class);

        $query = Consignment::with(['consignee', 'user', 'items.product'])->latest();

        if ($request->filled('status'))       $query->where('status', $request->status);
        if ($request->filled('consignee_id')) $query->where('consignee_id', $request->consignee_id);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('consignee', fn($q) => $q->where('name', 'like', "%{$s}%"));
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Criar Consignação (Wizard)
     */
    public function store(Request $request)
    {
        $this->authorize('create', Consignment::class);

        $validated = $request->validate([
            'consignee_id'          => 'required|exists:consignees,id',
            'due_date'              => 'nullable|date',
            'notes'                 => 'nullable|string',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.qty_sent'      => 'required|integer|min:1',
            'items.*.agreed_unit_price' => 'required|numeric|min:0',
        ]);

        $consignment = $this->service->createConsignment($validated);

        return response()->json(['data' => $consignment], 201);
    }

    /**
     * Detalhes
     */
    public function show(Consignment $consignment)
    {
        $this->authorize('view', $consignment);
        $consignment->load('consignee', 'user', 'items.product');

        return response()->json(['data' => $consignment]);
    }

    /**
     * Reconciliação (Acerto)
     */
    public function reconcile(Request $request, Consignment $consignment)
    {
        $this->authorize('update', $consignment);

        $validated = $request->validate([
            'sold_items'     => 'required|array',
            'sold_items.*.product_id' => 'required|integer',
            'sold_items.*.quantity'   => 'required|integer|min:0',
            'returned_items' => 'required|array',
            'returned_items.*.product_id' => 'required|integer',
            'returned_items.*.quantity'   => 'required|integer|min:0',
        ]);

        $consignment = $this->service->reconcileConsignment(
            $consignment->id, 
            $validated['sold_items'], 
            $validated['returned_items']
        );

        return response()->json([
            'message' => 'Consignação reconciliada com sucesso. Faturamento gerado no financeiro.',
            'data' => $consignment
        ]);
    }

    /**
     * Listar produtos disponíveis no inventário para consignação
     */
    public function products()
    {
        $products = InventoryProduct::with('product')
            ->where('on_hand_qty', '>', 0)
            ->get()
            ->map(function ($ip) {
                return [
                    'id' => $ip->product_id,
                    'name' => $ip->product->name,
                    'sku' => $ip->sku,
                    'price' => $ip->sale_price,
                    'stock' => $ip->on_hand_qty,
                ];
            });

        return response()->json(['data' => $products]);
    }

    /**
     * Estatísticas do Dashboard
     */
    public function dashboardStats()
    {
        $totalActive = Consignment::where('status', 'active')->sum('total_value');
        $pendingReconcile = Consignment::where('status', 'active')->count();
        $totalClosed = Consignment::where('status', 'closed')->count();

        return response()->json([
            'data' => [
                'total_active_value' => $totalActive,
                'pending_reconcile_count' => $pendingReconcile,
                'total_closed_count' => $totalClosed,
            ],
        ]);
    }
}
