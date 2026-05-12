<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->change();
        });
    }

    public function down(): void
    {
        // Não removemos a coluna aqui; migration apenas garante o default.
        // Reversão é opcional e depende do estado anterior do banco.
    }
};
