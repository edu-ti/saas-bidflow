<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::where('company_id', $request->user()->company_id);

        if (!$request->user()->isAdmin()) {
            $query->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                    ->orWhere('assignee', $request->user()->name);
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $tasks = $query->orderBy('due_date', 'asc')
            ->orderBy('priority', 'desc')
            ->paginate(20);

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:high,medium,low',
            'status' => 'nullable|in:pending,completed',
            'assignee' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:tasks,id',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $validated['user_id'] = $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'pending';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        $task = Task::create($validated);

        return response()->json([
            'message' => 'Tarefa criada com sucesso',
            'task' => $task,
        ], 201);
    }

    public function show($id)
    {
        $task = Task::with(['subtasks', 'user'])->findOrFail($id);
        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:high,medium,low',
            'status' => 'nullable|in:pending,completed',
            'assignee' => 'nullable|string|max:255',
        ]);

        $task->update($validated);

        return response()->json([
            'message' => 'Tarefa atualizada',
            'task' => $task,
        ]);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Tarefa excluída']);
    }

    public function toggleStatus(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $newStatus = $task->status === 'pending' ? 'completed' : 'pending';
        $task->update(['status' => $newStatus]);

        return response()->json([
            'message' => 'Status alterado',
            'task' => $task,
        ]);
    }

    public function stats(Request $request)
    {
        $companyId = $request->user()->company_id;
        $userId = $request->user()->id;

        $query = Task::where('company_id', $companyId);

        if (!$request->user()->isAdmin()) {
            $query->where(function ($q) use ($userId, $request) {
                $q->where('user_id', $userId)
                    ->orWhere('assignee', $request->user()->name);
            });
        }

        $total = $query->count();
        $pending = $query->where('status', 'pending')->count();
        $completed = $query->where('status', 'completed')->count();
        $overdue = $query->where('status', 'pending')
            ->where('due_date', '<', now()->toDateString())
            ->count();
        $dueToday = $query->where('status', 'pending')
            ->where('due_date', now()->toDateString())
            ->count();

        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'completed' => $completed,
            'overdue' => $overdue,
            'due_today' => $dueToday,
        ]);
    }
}