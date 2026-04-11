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
        Schema::create('funnel_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('funnel_id')->constrained('funnels')->onDelete('cascade');
            $table->string('name');
            $table->integer('order')->default(0);
            $table->string('color')->nullable();
            $table->integer('probability')->default(0);
            $table->boolean('is_final_win')->default(false);
            $table->boolean('is_final_loss')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funnel_stages');
    }
};
