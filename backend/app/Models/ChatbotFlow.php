<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id', 'name', 'nodes', 'connections', 'is_active',
])]
class ChatbotFlow extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'nodes' => 'array',
            'connections' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }
}

#[Fillable([
    'company_id', 'chatbot_flow_id', 'contact_name', 'contact_email',
    'contact_phone', 'status', 'channel', 'assigned_to',
])]
class Conversation extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    public const STATUSES = [
        'active' => 'Ativa',
        'closed' => 'Encerrada',
        'pending' => 'Pendente',
    ];

    public const CHANNELS = [
        'whatsapp' => 'WhatsApp',
        'telegram' => 'Telegram',
        'widget' => 'Widget',
        'email' => 'E-mail',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function flow()
    {
        return $this->belongsTo(ChatbotFlow::class, 'chatbot_flow_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function getChannelLabelAttribute(): string
    {
        return self::CHANNELS[$this->channel] ?? $this->channel;
    }
}

#[Fillable([
    'conversation_id', 'sender_id', 'sender_type', 'content',
    'direction', 'message_type', 'metadata', 'read_at',
])]
class Message extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'read_at' => 'datetime',
        ];
    }

    public const DIRECTIONS = [
        'inbound' => 'Recebida',
        'outbound' => 'Enviada',
    ];

    public const TYPES = [
        'text' => 'Texto',
        'image' => 'Imagem',
        'file' => 'Arquivo',
        'audio' => 'Áudio',
        'video' => 'Vídeo',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function getDirectionLabelAttribute(): string
    {
        return self::DIRECTIONS[$this->direction] ?? $this->direction;
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->message_type] ?? $this->message_type;
    }
}