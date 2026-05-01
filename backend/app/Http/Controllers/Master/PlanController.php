<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::orderBy('monthly_price', 'asc')->get();
        return response()->json($plans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'monthly_price' => 'required|numeric|min:0',
            'max_users' => 'required|integer|min:1',
            'active' => 'boolean',
            'features' => 'nullable|array',
            'features.*' => 'string',
        ]);

        $plan = Plan::create($validated);
        return response()->json($plan, 201);
    }

    public function show(Plan $plan)
    {
        return response()->json($plan);
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'monthly_price' => 'numeric|min:0',
            'max_users' => 'integer|min:1',
            'active' => 'boolean',
            'features' => 'nullable|array',
            'features.*' => 'string',
        ]);

        $plan->update($validated);
        return response()->json($plan);
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();
        return response()->json(['message' => 'Plano removido com sucesso']);
    }
}
