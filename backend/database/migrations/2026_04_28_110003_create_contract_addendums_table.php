<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_addendums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('contract_id')->constrained('contracts')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['valor', 'prazo', 'valor_e_prazo', 'outros'])->default('outros');
            $table->decimal('old_value', 20, 2)->nullable();
            $table->decimal('new_value', 20, 2)->nullable();
            $table->date('old_end_date')->nullable();
            $table->date('new_end_date')->nullable();
            $table->date('effective_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_addendums');
    }
};
