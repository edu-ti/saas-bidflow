<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'company_id',
    'title',
    'type',
    'user_id',
    'organization_id',
    'supplier_id',
    'funnel_stage_id',
    'value',
    'pre_proposal_number',
    'notes',
    'bidding_metadata',
    'individual_client_id',
    'contact_id',
    'forward_to',
])]
class Opportunity extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string|class-string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'bidding_metadata' => AsArrayObject::class,
        ];
    }

    /**
     * Accessor and Mutator for uasg_code via metadata JSON.
     */
    protected function uasgCode(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->bidding_metadata['uasg_code'] ?? null,
            set: function (?string $value) {
                $meta = $this->bidding_metadata ?? new \Illuminate\Database\Eloquent\Casts\ArrayObject();
                $meta['uasg_code'] = $value;
                $this->bidding_metadata = $meta;
            }
        );
    }

    /**
     * Accessor and Mutator for edital_pdf_path via metadata JSON.
     */
    protected function editalPdfPath(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->bidding_metadata['edital_pdf_path'] ?? null,
            set: function (?string $value) {
                $meta = $this->bidding_metadata ?? new \Illuminate\Database\Eloquent\Casts\ArrayObject();
                $meta['edital_pdf_path'] = $value;
                $this->bidding_metadata = $meta;
            }
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function funnelStage()
    {
        return $this->belongsTo(FunnelStage::class);
    }

    /**
     * Moves the opportunity to a new funnel stage, ensuring both belong to the same tenant.
     */
    public function move_to_stage(int $stageId): bool
    {
        $stage = FunnelStage::where('id', $stageId)
            ->where('company_id', $this->company_id)
            ->first();

        if (!$stage) {
            return false;
        }

        $this->funnel_stage_id = $stage->id;
        return $this->save();
    }

    public function items()
    {
        return $this->hasMany(OpportunityItem::class);
    }
}
