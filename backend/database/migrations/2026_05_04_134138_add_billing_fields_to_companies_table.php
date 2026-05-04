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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('gateway_customer_id')->nullable()->after('status');
            $table->string('gateway_subscription_id')->nullable()->after('gateway_customer_id');
            $table->decimal('subscription_value', 10, 2)->nullable()->after('gateway_subscription_id');
            $table->date('next_billing_date')->nullable()->after('subscription_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['gateway_customer_id', 'gateway_subscription_id', 'subscription_value', 'next_billing_date']);
        });
    }
};
