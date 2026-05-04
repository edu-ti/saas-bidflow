<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'goal_type' => 'required|string|in:global,user,supplier',
            'target_id' => 'nullable|integer',
            'uf' => 'nullable|string|max:2',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            'target_revenue' => 'required|numeric',
            'target_wins' => 'required|integer',
        ]);

        $companyId = Auth::user()->company_id;

        // Upsert logic: find existing goal for same target/period or create new
        $goal = Goal::updateOrCreate(
            [
                'company_id' => $companyId,
                'goal_type' => $validated['goal_type'],
                'target_id' => $validated['target_id'],
                'uf' => $validated['uf'],
                'month' => $validated['month'],
                'year' => $validated['year'],
            ],
            [
                'target_revenue' => $validated['target_revenue'],
                'target_wins' => $validated['target_wins'],
            ]
        );

        return response()->json($goal);
    }
}
