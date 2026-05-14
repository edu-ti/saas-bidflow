<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);
        $products = Product::latest()->where('company_id', Auth::user()->company_id)->get();
        return ProductResource::collection($products);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Product::class);
        $validated = $request->validate([
            'sku' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'base_price' => 'nullable|numeric|min:0',
        ]);

        $validated['company_id'] = Auth::user()->company_id;
        $product = Product::create($validated);
        return new ProductResource($product);
    }

    public function show($id)
    {
        $product = Product::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('view', $product);
        return new ProductResource($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $product);
        $validated = $request->validate([
            'sku' => 'nullable|string|max:255',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'base_price' => 'nullable|numeric|min:0',
        ]);

        $product->update($validated);
        return new ProductResource($product);
    }

    public function destroy($id)
    {
        $product = Product::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('delete', $product);
        $product->delete();
        return response()->noContent();
    }
}
