<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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