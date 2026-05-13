<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['company_id', 'role_id', 'name', 'email', 'phone', 'password', 'position', 'status', 'fixed_salary', 'commission_percentage', 'quarterly_bonus', 'is_admin', 'is_superadmin'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_superadmin' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class)->withTrashed();
    }

    public function isAdmin(): bool
    {
        return $this->is_admin || $this->is_superadmin;
    }

    public function isSuperAdmin(): bool
    {
        return $this->is_superadmin;
    }

    /**
     * Override getAttribute to resolve the conflict between the 'role' database column
     * and the 'role' Eloquent relationship. When role_id is set, the relationship wins.
     */
    public function getAttribute($key)
    {
        if ($key === 'role') {
            // If the relationship is already loaded, return it
            if ($this->relationLoaded('role')) {
                return $this->relations['role'];
            }
            // If role_id is set, try to load and return the relationship
            if ($this->role_id) {
                $relationValue = $this->getRelationValue('role');
                if ($relationValue !== null) {
                    return $relationValue;
                }
            }
        }
        return parent::getAttribute($key);
    }
}
