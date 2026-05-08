<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->decimal('meta_mensal', 15, 2)->default(0);
            $table->decimal('salario_fixo', 15, 2)->default(0);
            $table->decimal('percentual_comissao', 5, 2)->default(1.00);
            $table->boolean('ativo')->default(true);
            $table->integer('year');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['company_id', 'user_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_configs');
    }
};
