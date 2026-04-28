<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'name',
    'channel',
    'status',
    'sent',
    'open_rate',
    'message',
    'recipients',
    'scheduled_at',
    'sent_at',
])]
class Campaign extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'recipients' => 'array',
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public const CHANNELS = [
        'whatsapp' => 'WhatsApp',
        'email' => 'E-mail',
        'sms' => 'SMS',
    ];

    public const STATUSES = [
        'draft' => 'Rascunho',
        'active' => 'Ativa',
        'scheduled' => 'Agendada',
        'paused' => 'Pausada',
        'completed' => 'Concluída',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function getChannelLabelAttribute(): string
    {
        return self::CHANNELS[$this->channel] ?? $this->channel;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }
}