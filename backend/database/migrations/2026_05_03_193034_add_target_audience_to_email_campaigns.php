<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->string('target_audience')->nullable()->after('body');
        });
    }

    public function down(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropColumn('target_audience');
        });
    }
};
