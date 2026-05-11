<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proposal_items', function (Blueprint $table) {
            $table->string('status')->default('VENDA')->after('model');
            $table->integer('meses_locacao')->nullable()->after('status');
            $table->decimal('desconto_percent', 5, 2)->default(0)->after('meses_locacao');
            $table->string('unidade_medida')->default('Unidade')->after('desconto_percent');
            $table->json('parametros')->nullable()->after('unidade_medida');
            $table->text('descricao_detalhada')->nullable()->after('parametros');
            $table->string('imagem_url')->nullable()->after('descricao_detalhada');
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->string('numero_proposta')->nullable()->after('id');
            $table->date('data_validade')->nullable()->after('status');
            $table->string('motivo_status')->nullable()->after('data_validade');
            $table->text('faturamento')->nullable()->after('notes');
            $table->text('treinamento')->nullable()->after('faturamento');
            $table->string('condicoes_pagamento')->nullable()->after('treinamento');
            $table->string('prazo_entrega')->nullable()->after('condicoes_pagamento');
            $table->string('garantia_equipamentos')->nullable()->after('prazo_entrega');
            $table->string('garantia_acessorios')->nullable()->after('garantia_equipamentos');
            $table->text('instalacao')->nullable()->after('garantia_acessorios');
            $table->text('assistencia_tecnica')->nullable()->after('instalacao');
            $table->string('frete_tipo')->default('CIF')->after('assistencia_tecnica');
            $table->decimal('frete_valor', 15, 2)->default(0)->after('frete_tipo');
        });
    }

    public function down(): void
    {
        Schema::table('proposal_items', function (Blueprint $table) {
            $table->dropColumn(['status', 'meses_locacao', 'desconto_percent', 'unidade_medida', 'parametros', 'descricao_detalhada', 'imagem_url']);
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn(['numero_proposta', 'data_validade', 'motivo_status', 'faturamento', 'treinamento', 'condicoes_pagamento', 'prazo_entrega', 'garantia_equipamentos', 'garantia_acessorios', 'instalacao', 'assistencia_tecnica', 'frete_tipo', 'frete_valor']);
        });
    }
};
