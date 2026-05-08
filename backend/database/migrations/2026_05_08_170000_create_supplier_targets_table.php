<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supplier_targets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('supplier');
            $table->string('uf', 2);
            $table->integer('month');
            $table->integer('year');
            $table->decimal('value', 15, 2)->default(0);
            $table->timestamps();

            $table->unique(['company_id', 'supplier', 'uf', 'month', 'year'], 'supplier_target_unique');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->index(['company_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_targets');
    }
};