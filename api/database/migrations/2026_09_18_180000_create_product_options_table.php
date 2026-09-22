<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->enum('type', ['color', 'size']);
            $table->string('value', 50);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index(['product_id', 'type', 'sort_order']);
            $table->unique(['product_id', 'type', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_options');
    }
};