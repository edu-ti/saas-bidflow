<?php

namespace App\Events;

use App\Models\Opportunity;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OpportunityUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $opportunity;
    public $action;

    /**
     * Create a new event instance.
     */
    public function __construct(Opportunity $opportunity, string $action = 'updated')
    {
        $this->opportunity = $opportunity->load(['stage', 'user']);
        $this->action = $action;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('company.' . $this->opportunity->company_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'opportunity.updated';
    }

    /**
     * Get the data to send along with the broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'opportunity' => [
                'id' => $this->opportunity->id,
                'title' => $this->opportunity->title,
                'status' => $this->opportunity->status,
                'funnel_stage_id' => $this->opportunity->funnel_stage_id,
                'estimated_value' => $this->opportunity->estimated_value,
            ],
            'action' => $this->action,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
