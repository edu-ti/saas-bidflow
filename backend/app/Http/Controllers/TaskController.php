<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $this->authorize('viewAny', Task::class);

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
        $this->authorize('create', Task::class);

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
        $task = Task::with(['subtasks', 'user'])->where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('view', $task);
        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = Task::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $task);

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
        $task = Task::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('delete', $task);
        $task->delete();

        return response()->json(['message' => 'Tarefa excluída']);
    }

    public function toggleStatus(Request $request, $id)
    {
        $task = Task::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $task);

        $newStatus = $task->status === 'pending' ? 'completed' : 'pending';
        $task->update(['status' => $newStatus]);

        return response()->json([
            'message' => 'Status alterado',
            'task' => $task,
        ]);
    }

    public function stats(Request $request)
    {
        $this->authorize('viewAny', Task::class);

        $companyId = $request->user()->company_id;
        $userId = $request->user()->id;
        $userName = $request->user()->name;
        $today = now()->toDateString();

        $query = Task::where('company_id', $companyId);

        if (!$request->user()->isAdmin()) {
            $query->where(function ($q) use ($userId, $userName) {
                $q->where('user_id', $userId)
                    ->orWhere('assignee', $userName);
            });
        }

        // Uma única query com CASE para contar tudo de uma vez
        $stats = $query->selectRaw('
            COUNT(*) as total,
            COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending,
            COUNT(CASE WHEN status = \'completed\' THEN 1 END) as completed,
            COUNT(CASE WHEN status = \'pending\' AND due_date < ? THEN 1 END) as overdue,
            COUNT(CASE WHEN status = \'pending\' AND due_date = ? THEN 1 END) as due_today
        ', [$today, $today])->first();

        return response()->json([
            'total' => (int) $stats->total,
            'pending' => (int) $stats->pending,
            'completed' => (int) $stats->completed,
            'overdue' => (int) $stats->overdue,
            'due_today' => (int) $stats->due_today,
        ]);
    }
}