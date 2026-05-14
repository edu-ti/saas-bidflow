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

        // Get events from the last 3 months to next 6 months (performance)
        $startWindow = now()->subMonths(3)->startOfMonth();
        $endWindow = now()->addMonths(6)->endOfMonth();

        $events = Event::where('company_id', $user->company_id)
            ->whereBetween('start_date', [$startWindow, $endWindow])
            ->orderBy('start_date')
            ->get();

        $eventsData = EventResource::collection($events)->resolve();

        // Get only opportunities with due dates in the window
        $opportunities = Opportunity::where('company_id', $user->company_id)
            ->whereNotNull('bidding_metadata')
            ->whereRaw("(bidding_metadata->>'due_date')::date BETWEEN ? AND ?", [$startWindow, $endWindow])
            ->limit(500)
            ->get();

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
        $validated['company_id'] = Auth::user()->company_id;

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
