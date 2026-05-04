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
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('goal_type'); // 'user', 'supplier', 'global'
            $table->integer('target_id')->nullable(); // ID of user or supplier
            $table->string('uf', 2)->nullable();
            $table->integer('month');
            $table->integer('year');
            $table->decimal('target_revenue', 15, 2)->default(0);
            $table->integer('target_wins')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
