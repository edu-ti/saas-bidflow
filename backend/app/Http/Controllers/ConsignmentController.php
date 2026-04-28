<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use App\Models\Product;
use App\Services\ConsignmentService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ConsignmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private ConsignmentService $service) {}

    // ── LIST ────────────────────────────────────
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

    // ── CREATE (draft) ──────────────────────────
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

        $validated['status'] = 'draft';
        $consignment = $this->service->create($validated);

        return response()->json(['data' => $consignment], 201);
    }

    // ── SHOW ─────────────────────────────────────
    public function show(Consignment $consignment)
    {
        $this->authorize('view', $consignment);
        $consignment->load('consignee', 'user', 'items.product');

        return response()->json(['data' => $consignment]);
    }

    // ── UPDATE ───────────────────────────────────
    public function update(Request $request, Consignment $consignment)
    {
        $this->authorize('update', $consignment);

        $validated = $request->validate([
            'consignee_id'              => 'sometimes|exists:consignees,id',
            'due_date'                  => 'nullable|date',
            'notes'                     => 'nullable|string',
            'items'                     => 'sometimes|array|min:1',
            'items.*.product_id'        => 'required_with:items|exists:products,id',
            'items.*.qty_sent'          => 'required_with:items|integer|min:1',
            'items.*.agreed_unit_price' => 'required_with:items|numeric|min:0',
        ]);

        $consignment = $this->service->update($consignment, $validated);
        return response()->json(['data' => $consignment]);
    }

    // ── DELETE ───────────────────────────────────
    public function destroy(Consignment $consignment)
    {
        $this->authorize('delete', $consignment);

        if ($consignment->status !== 'draft') {
            return response()->json(['message' => 'Apenas rascunhos podem ser excluídos.'], 422);
        }

        $consignment->delete();
        return response()->noContent();
    }

    // ── SEND (draft → sent) ──────────────────────
    public function send(Consignment $consignment)
    {
        $this->authorize('update', $consignment);
        $consignment = $this->service->send($consignment);

        return response()->json(['data' => $consignment]);
    }

    // ── RECONCILE ────────────────────────────────
    public function reconcile(Request $request, Consignment $consignment)
    {
        $this->authorize('update', $consignment);

        $validated = $request->validate([
            'items'               => 'required|array|min:1',
            'items.*.item_id'     => 'required|integer',
            'items.*.qty_sold'    => 'required|integer|min:0',
            'items.*.qty_returned'=> 'required|integer|min:0',
        ]);

        $consignment = $this->service->reconcile($consignment, $validated['items']);
        return response()->json(['data' => $consignment]);
    }

    // ── CLOSE ─────────────────────────────────────
    public function close(Consignment $consignment)
    {
        $this->authorize('update', $consignment);
        $consignment = $this->service->close($consignment);

        return response()->json(['data' => $consignment]);
    }

    // ── PRODUCTS (for item selection) ─────────────
    public function products()
    {
        $products = Product::select('id', 'name', 'sku', 'base_price', 'stock')
            ->where('stock', '>', 0)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $products]);
    }

    // ── REPORT ────────────────────────────────────
    public function report()
    {
        return response()->json(['data' => $this->service->report()]);
    }

    // ── DASHBOARD STATS ───────────────────────────
    public function dashboardStats()
    {
        $today = now()->toDateString();

        $totalRua = Consignment::whereIn('status', ['sent', 'partially_returned'])->sum('total_value');
        $vencendoHoje = Consignment::whereIn('status', ['sent', 'partially_returned'])
            ->whereDate('due_date', $today)->count();
        $pendentes = Consignment::whereIn('status', ['sent', 'partially_returned'])->count();
        $totalClosed = Consignment::where('status', 'closed')->count();

        return response()->json([
            'data' => compact('totalRua', 'vencendoHoje', 'pendentes', 'totalClosed'),
        ]);
    }
}
