<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'user_id',
    'title',
    'description',
    'due_date',
    'priority',
    'status',
    'assignee',
    'parent_id',
])]
class Task extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }

    public const PRIORITIES = [
        'high' => 'Alta',
        'medium' => 'Média',
        'low' => 'Baixa',
    ];

    public const STATUSES = [
        'pending' => 'Pendente',
        'completed' => 'Concluída',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function subtasks()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function getPriorityLabelAttribute(): string
    {
        return self::PRIORITIES[$this->priority] ?? $this->priority;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isOverdue(): bool
    {
        return $this->due_date && $this->due_date->isPast() && $this->status === 'pending';
    }
}