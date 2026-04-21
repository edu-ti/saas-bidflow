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
        Schema::create('opportunity_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opportunity_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('description');
            $table->string('manufacturer')->nullable();
            $table->string('image_path')->nullable();
            $table->string('model')->nullable();
            $table->string('status')->default('Venda');
            $table->text('detailed_description')->nullable();
            
            $table->json('additional_parameters')->nullable();
            
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->string('unit_measure')->default('Unidade');
            $table->decimal('subtotal', 15, 2)->default(0);
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunity_items');
    }
};
