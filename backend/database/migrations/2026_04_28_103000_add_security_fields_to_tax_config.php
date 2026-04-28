<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tax_configurations', function (Blueprint $table) {
            $table->text('certificado_password')->nullable()->after('certificado_path');
            $table->boolean('permite_saldo_negativo')->default(false)->after('aliquota_padrao');
        });
    }

    public function down(): void
    {
        Schema::table('tax_configurations', function (Blueprint $table) {
            $table->dropColumn(['certificado_password', 'permite_saldo_negativo']);
        });
    }
};
