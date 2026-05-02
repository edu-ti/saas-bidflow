<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'contract_template_id',
    'contract_number',
    'value',
    'start_date',
    'end_date',
    'status',
    'contractable_id',
    'contractable_type',
    'generated_content',
    'payment_terms',
    'renewal_type',
    'external_signature_id',
    'approved_by_user_id',
    'approved_at',
    'signed_at',
])]
class Contract extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'value' => 'decimal:2',
            'approved_at' => 'datetime',
            'signed_at' => 'datetime',
        ];
    }

    public const STATUSES = [
        'draft' => 'Rascunho',
        'under_review' => 'Em Revisão',
        'approved' => 'Aprovado',
        'sent_for_signature' => 'Enviado para Assinatura',
        'active' => 'Ativo',
        'finished' => 'Finalizado',
        'cancelled' => 'Cancelado',
    ];

    public const RENEWAL_TYPES = [
        'manual' => 'Renovação Manual',
        'automatic' => 'Renovação Automática',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function template()
    {
        return $this->belongsTo(ContractTemplate::class, 'contract_template_id');
    }

    public function contractable()
    {
        return $this->morphTo();
    }

    public function approvals()
    {
        return $this->hasMany(ContractApproval::class);
    }

    public function addendums()
    {
        return $this->hasMany(ContractAddendum::class);
    }

    public function receivables()
    {
        return $this->hasMany(AccountsReceivable::class);
    }

    public function payables()
    {
        return $this->hasMany(AccountsPayable::class);
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function getClientNameAttribute(): ?string
    {
        if (!$this->contractable) {
            return null;
        }

        return match ($this->contractable_type) {
            IndividualClient::class => $this->contractable->name,
            CompanyClient::class => $this->contractable->corporate_name,
            Supplier::class => $this->contractable->name,
            Organization::class => $this->contractable->name,
            default => null,
        };
    }

    public function getClientDocumentAttribute(): ?string
    {
        if (!$this->contractable) {
            return null;
        }

        return match ($this->contractable_type) {
            IndividualClient::class => $this->contractable->cpf,
            CompanyClient::class => $this->contractable->cnpj,
            Supplier::class => $this->contractable->document_number,
            Organization::class => $this->contractable->document_number,
            default => null,
        };
    }

    public function isPendingApproval(): bool
    {
        return in_array($this->status, ['draft', 'under_review']);
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, ['draft']);
    }

    public function canBeApproved(): bool
    {
        return in_array($this->status, ['draft', 'under_review']);
    }

    public function canBeActivated(): bool
    {
        return in_array($this->status, ['approved', 'sent_for_signature']);
    }

    public function daysUntilExpiry(): ?int
    {
        if (!$this->end_date) {
            return null;
        }

        return now()->diffInDays($this->end_date, false);
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        $daysUntil = $this->daysUntilExpiry();

        return $daysUntil !== null && $daysUntil > 0 && $daysUntil <= $days;
    }

    public function isExpired(): bool
    {
        return $this->end_date && $this->end_date->isPast();
    }
}
