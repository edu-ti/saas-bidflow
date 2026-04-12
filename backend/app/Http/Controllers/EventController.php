<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use App\Http\Resources\EventResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EventController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Event::class);
        $user = Auth::user();

        // Get standard events
        $events = Event::where('user_id', $user->id)
            ->orWhereNull('user_id') // Company-wide events
            ->get();
            
        $eventsData = EventResource::collection($events)->resolve();

        // Get opportunities to mix into calendar
        $opportunities = Opportunity::where('user_id', $user->id)
            ->orWhereIn('role', ['Admin', 'Manager'] ? [$user->role] : []) // If admin, load all? Let's just load the ones the user can see.
            ->get();
            
        // Assuming we have a due date in bidding_metadata or we just use created_at for now
        // A better approach is checking if 'bidding_metadata->due_date' exists, but let's map what we have.
        foreach ($opportunities as $opp) {
            $dueDate = $opp->bidding_metadata['due_date'] ?? $opp->created_at->addDays(7)->format('Y-m-d H:i:s');
            $eventsData[] = [
                'id' => 'opp_' . $opp->id,
                'title' => '[Licitação] ' . $opp->title,
                'start_date' => $dueDate,
                'end_date' => $dueDate,
                'type' => 'opportunity',
            ];
        }

        return response()->json(['data' => $eventsData]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Event::class);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'reminder_type' => 'nullable|string|max:50',
        ]);
        
        $validated['user_id'] = Auth::id();

        $event = Event::create($validated);
        return new EventResource($event);
    }

    public function show(Event $event)
    {
        $this->authorize('view', $event);
        return new EventResource($event);
    }

    public function update(Request $request, Event $event)
    {
        $this->authorize('update', $event);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'reminder_type' => 'nullable|string|max:50',
        ]);

        $event->update($validated);
        return new EventResource($event);
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);
        $event->delete();
        return response()->noContent();
    }
}
