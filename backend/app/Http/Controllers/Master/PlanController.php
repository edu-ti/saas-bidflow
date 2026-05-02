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
        try {
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
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar plano: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Plan $plan)
    {
        return response()->json($plan);
    }

    public function update(Request $request, Plan $plan)
    {
        try {
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
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar plano: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();
        return response()->json(['message' => 'Plano removido com sucesso']);
    }
}
