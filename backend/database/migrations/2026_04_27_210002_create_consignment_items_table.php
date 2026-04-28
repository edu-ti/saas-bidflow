<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consignment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('qty_sent')->default(0);
            $table->integer('qty_returned')->default(0);
            $table->integer('qty_sold')->default(0);
            $table->decimal('agreed_unit_price', 15, 2)->default(0);
            $table->timestamps();

            $table->index(['consignment_id']);
            $table->index(['product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consignment_items');
    }
};
