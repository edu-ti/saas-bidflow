<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_brands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->foreignId('parent_id')->nullable()->references('id')->on('inventory_product_categories')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('acro');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_product_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('color')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('color')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_depots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->enum('type', ['Físico', 'Virtual'])->default('Físico');
            $table->json('address')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_movement_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('type');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->foreignId('depot_id')->nullable()->constrained('inventory_depots')->onDelete('set null');
            $table->foreignId('category_id')->nullable()->constrained('inventory_movement_categories')->onDelete('set null');
            $table->enum('type', ['Entrada', 'Saida'])->required();
            $table->integer('quantity')->default(0);
            $table->decimal('unit_cost', 20, 2)->default(0);
            $table->decimal('total_value', 20, 2)->default(0);
            $table->string('entity')->nullable();
            $table->string('document')->nullable();
            $table->text('notes')->nullable();
            $table->date('date');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();
            $table->foreignId('brand_id')->nullable()->constrained('inventory_brands')->onDelete('set null');
            $table->foreignId('category_id')->nullable()->constrained('inventory_product_categories')->onDelete('set null');
            $table->foreignId('unit_id')->nullable()->constrained('inventory_units')->onDelete('set null');
            $table->foreignId('size_id')->nullable()->constrained('inventory_sizes')->onDelete('set null');
            $table->foreignId('status_id')->nullable()->constrained('inventory_product_status')->onDelete('set null');
            $table->foreignId('depot_id')->nullable()->constrained('inventory_depots')->onDelete('set null');
            $table->decimal('cost_price', 20, 2)->default(0);
            $table->decimal('markup', 10, 2)->default(0);
            $table->decimal('sale_price', 20, 2)->default(0);
            $table->decimal('on_hand_qty', 20, 4)->default(0);
            $table->decimal('reserved_qty', 20, 4)->default(0);
            $table->decimal('min_stock', 20, 4)->default(0);
            $table->decimal('max_stock', 20, 4)->default(0);
            $table->string('ncm')->nullable();
            $table->string('cest')->nullable();
            $table->string('origin')->default('0');
            $table->json('label_ids')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_price_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->decimal('markup', 10, 2)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_price_tables');
        Schema::dropIfExists('inventory_products');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('inventory_movement_categories');
        Schema::dropIfExists('inventory_depots');
        Schema::dropIfExists('inventory_labels');
        Schema::dropIfExists('inventory_product_status');
        Schema::dropIfExists('inventory_sizes');
        Schema::dropIfExists('inventory_units');
        Schema::dropIfExists('inventory_product_categories');
        Schema::dropIfExists('inventory_brands');
    }
};