<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id', 'name', 'subject', 'body', 'status',
    'recipient_count', 'sent_count', 'open_count', 'click_count',
    'scheduled_at', 'sent_at', 'error_message',
])]
class EmailCampaign extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public const STATUSES = [
        'draft' => 'Rascunho',
        'scheduled' => 'Agendada',
        'sending' => 'Enviando',
        'sent' => 'Enviada',
        'failed' => 'Falhou',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function recipients()
    {
        return $this->hasMany(EmailRecipient::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function getOpenRateAttribute(): float
    {
        if ($this->sent_count == 0) {
            return 0;
        }
        return ($this->open_count / $this->sent_count) * 100;
    }

    public function getClickRateAttribute(): float
    {
        if ($this->sent_count == 0) {
            return 0;
        }
        return ($this->click_count / $this->sent_count) * 100;
    }
}

#[Fillable([
    'company_id', 'email_campaign_id', 'email', 'name', 'status',
    'sent_at', 'opened_at', 'clicked_at', 'error',
])]
class EmailRecipient extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'opened_at' => 'datetime',
            'clicked_at' => 'datetime',
        ];
    }

    public const STATUSES = [
        'pending' => 'Pendente',
        'sent' => 'Enviado',
        'delivered' => 'Entregue',
        'opened' => 'Aberto',
        'clicked' => 'Clique',
        'failed' => 'Falhou',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function campaign()
    {
        return $this->belongsTo(EmailCampaign::class, 'email_campaign_id');
    }
}