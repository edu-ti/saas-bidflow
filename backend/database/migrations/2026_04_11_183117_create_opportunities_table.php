<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('title');
            $table->enum('type', ['Sale', 'Bidding'])->default('Sale');
            $table->foreignId('funnel_stage_id')->nullable()->constrained('funnel_stages')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->onDelete('set null');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers');
            $table->decimal('value', 20, 2)->default(0);
            $table->string('pre_proposal_number')->nullable();
            $table->text('notes')->nullable();
            $table->json('bidding_metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
