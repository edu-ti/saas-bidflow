<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropForeign(['opportunity_id']);
            $table->dropColumn('opportunity_id');

            $table->enum('status', ['draft', 'under_review', 'approved', 'sent_for_signature', 'active', 'finished', 'cancelled'])
                ->default('draft')->change();

            $table->renameColumn('total_value', 'value');
            $table->decimal('value', 20, 2)->change();

            $table->foreignId('contract_template_id')->nullable()->constrained('contract_templates')->nullOnDelete();
            $table->text('generated_content')->nullable();

            $table->morphIndex('contractable');
            $table->unsignedBigInteger('contractable_id')->nullable();
            $table->string('contractable_type')->nullable();

            $table->text('payment_terms')->nullable();
            $table->string('renewal_type')->default('manual');
            $table->string('external_signature_id')->nullable();
            $table->string('contract_number')->nullable()->change();

            $table->unsignedBigInteger('approved_by_user_id')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('signed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropMorphColumns('contractable');
            $table->dropColumn([
                'contract_template_id',
                'generated_content',
                'payment_terms',
                'renewal_type',
                'external_signature_id',
                'approved_by_user_id',
                'approved_at',
                'signed_at',
            ]);

            $table->foreignId('opportunity_id')->constrained('opportunities')->onDelete('cascade');
            $table->renameColumn('value', 'total_value');
            $table->enum('status', ['Ativo', 'Finalizado', 'Aditivado'])->default('Ativo')->change();
        });
    }
};
