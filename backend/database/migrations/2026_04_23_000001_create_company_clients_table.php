<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('corporate_name');
            $table->string('fantasy_name')->nullable();
            $table->string('cnpj')->nullable();
            $table->string('municipal_registration')->nullable();
            $table->string('state_registration')->nullable();
            $table->text('address')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_position')->nullable();
            $table->string('contact_phone')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'cnpj']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_clients');
    }
};