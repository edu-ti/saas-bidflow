<?php

namespace App\Http\Controllers;

use App\Models\InventoryProduct;
use App\Models\InventoryBrand;
use App\Models\InventoryProductCategory;
use App\Models\InventoryUnit;
use App\Models\InventorySize;
use App\Models\InventoryProductStatus;
use App\Models\InventoryLabel;
use App\Models\InventoryDepot;
use App\Models\InventoryMovement;
use App\Models\InventoryMovementCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryProduct::with(['brand', 'category', 'unit', 'status', 'depot']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhereHas('product', fn($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status_id', $request->status);
        }

        $products = $query->orderBy('id', 'desc')->paginate(20);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'sku' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:50',
            'brand_id' => 'nullable|exists:inventory_brands,id',
            'category_id' => 'nullable|exists:inventory_product_categories,id',
            'unit_id' => 'nullable|exists:inventory_units,id',
            'size_id' => 'nullable|exists:inventory_sizes,id',
            'status_id' => 'nullable|exists:inventory_product_status,id',
            'depot_id' => 'nullable|exists:inventory_depots,id',
            'cost_price' => 'nullable|numeric|min:0',
            'markup' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'on_hand_qty' => 'nullable|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'ncm' => 'nullable|string|max:10',
            'cest' => 'nullable|string|max:10',
        ]);

        $companyId = $request->user()->company_id;

        $validated['company_id'] = $companyId;
        $validated['markup'] = $validated['markup'] ?? 0;

        if (!empty($validated['cost_price']) && !empty($validated['markup'])) {
            $validated['sale_price'] = $validated['cost_price'] * (1 + $validated['markup'] / 100);
        }

        $product = InventoryProduct::create($validated);

        return response()->json([
            'message' => 'Produto criado com sucesso',
            'product' => $product->load(['brand', 'category', 'unit', 'status']),
        ], 201);
    }

    public function show($id)
    {
        $product = InventoryProduct::with([
            'brand', 'category', 'unit', 'size', 'status', 'depot', 'product'
        ])->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = InventoryProduct::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'sku' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:50',
            'brand_id' => 'nullable|exists:inventory_brands,id',
            'category_id' => 'nullable|exists:inventory_product_categories,id',
            'unit_id' => 'nullable|exists:inventory_units,id',
            'size_id' => 'nullable|exists:inventory_sizes,id',
            'status_id' => 'nullable|exists:inventory_product_status,id',
            'depot_id' => 'nullable|exists:inventory_depots,id',
            'cost_price' => 'nullable|numeric|min:0',
            'markup' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'on_hand_qty' => 'nullable|numeric|min:0',
            'reserved_qty' => 'nullable|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'ncm' => 'nullable|string|max:10',
            'cest' => 'nullable|string|max:10',
        ]);

        if (isset($validated['cost_price']) && isset($validated['markup'])) {
            $validated['sale_price'] = $validated['cost_price'] * (1 + $validated['markup'] / 100);
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Produto atualizado',
            'product' => $product->fresh(['brand', 'category', 'unit', 'status']),
        ]);
    }

    public function destroy($id)
    {
        $product = InventoryProduct::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Produto excluído']);
    }

    public function brands(Request $request)
    {
        $brands = InventoryBrand::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json($brands);
    }

    public function categories(Request $request)
    {
        $categories = InventoryProductCategory::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function units(Request $request)
    {
        $units = InventoryUnit::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json($units);
    }

    public function sizes(Request $request)
    {
        $sizes = InventorySize::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json($sizes);
    }

    public function statuses(Request $request)
    {
        $statuses = InventoryProductStatus::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json($statuses);
    }

    public function labels(Request $request)
    {
        $labels = InventoryLabel::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json($labels);
    }

    public function depots(Request $request)
    {
        $depots = InventoryDepot::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json($depots);
    }

    public function movements(Request $request)
    {
        $query = InventoryMovement::with(['product', 'depot', 'category'])
            ->where('company_id', $request->user()->company_id);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $movements = $query->orderBy('date', 'desc')->paginate(50);

        return response()->json($movements);
    }

    public function createMovement(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:inventory_products,id',
            'depot_id' => 'nullable|exists:inventory_depots,id',
            'category_id' => 'nullable|exists:inventory_movement_categories,id',
            'type' => 'required|in:Entrada,Saida',
            'quantity' => 'required|numeric|min:1',
            'unit_cost' => 'nullable|numeric|min:0',
            'entity' => 'nullable|string|max:255',
            'document' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $companyId = $request->user()->company_id;
        $validated['company_id'] = $companyId;
        $validated['total_value'] = ($validated['quantity'] ?? 0) * ($validated['unit_cost'] ?? 0);

        $movement = InventoryMovement::create($validated);

        if ($movement->type === 'Entrada') {
            DB::statement("UPDATE inventory_products SET on_hand_qty = on_hand_qty + ? WHERE id = ?", 
                [$validated['quantity'], $validated['product_id']]);
        } else {
            DB::statement("UPDATE inventory_products SET on_hand_qty = GREATEST(0, on_hand_qty - ?) WHERE id = ?", 
                [$validated['quantity'], $validated['product_id']]);
        }

        return response()->json([
            'message' => 'Movimentação registrada',
            'movement' => $movement->load(['product', 'depot', 'category']),
        ], 201);
    }

    public function dashboard(Request $request)
    {
        $companyId = $request->user()->company_id;

        $totalProducts = InventoryProduct::where('company_id', $companyId)->count();
        $totalValue = InventoryProduct::where('company_id', $companyId)
            ->selectRaw('SUM(on_hand_qty * cost_price) as total')
            ->value('total') ?? 0;
        $lowStock = InventoryProduct::where('company_id', $companyId)
            ->whereRaw('on_hand_qty <= min_stock')
            ->count();
        $outOfStock = InventoryProduct::where('company_id', $companyId)
            ->where('on_hand_qty', '<=', 0)
            ->count();

        $recentMovements = InventoryMovement::with(['product', 'category'])
            ->where('company_id', $companyId)
            ->orderBy('date', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'total_products' => $totalProducts,
            'total_value' => $totalValue,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'recent_movements' => $recentMovements,
        ]);
    }

    public function createBrand(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $brand = InventoryBrand::create($validated);

        return response()->json(['message' => 'Marca criada', 'brand' => $brand], 201);
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20',
            'parent_id' => 'nullable|exists:inventory_product_categories,id',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $category = InventoryProductCategory::create($validated);

        return response()->json(['message' => 'Categoria criada', 'category' => $category], 201);
    }

    public function createUnit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'acro' => 'required|string|max:10',
            'active' => 'nullable|boolean',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $unit = InventoryUnit::create($validated);

        return response()->json(['message' => 'Unidade criada', 'unit' => $unit], 201);
    }

    public function createSize(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'active' => 'nullable|boolean',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $size = InventorySize::create($validated);

        return response()->json(['message' => 'Tamanho criado', 'size' => $size], 201);
    }

    public function createStatus(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:20',
            'active' => 'nullable|boolean',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $status = InventoryProductStatus::create($validated);

        return response()->json(['message' => 'Status criado', 'status' => $status], 201);
    }

    public function createDepot(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|in:Físico,Virtual',
            'address' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $depot = InventoryDepot::create($validated);

        return response()->json(['message' => 'Depósito criado', 'depot' => $depot], 201);
    }

    public function createLabel(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:20',
            'active' => 'nullable|boolean',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $label = InventoryLabel::create($validated);

        return response()->json(['message' => 'Etiqueta criada', 'label' => $label], 201);
    }
}