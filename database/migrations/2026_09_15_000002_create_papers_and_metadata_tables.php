<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('papers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('abstract')->nullable();
            $table->unsignedSmallInteger('publication_year')->nullable();
            $table->string('journal')->nullable();
            $table->string('doi')->nullable()->index();
            $table->json('keywords')->nullable();
            $table->string('file_path');
            $table->string('file_hash', 64)->nullable()->index();
            $table->unsignedBigInteger('file_size_bytes')->default(0);
            $table->string('status')->default('UPLOADED')->index();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('paper_authors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete();
            $table->string('name');
            $table->string('affiliation')->nullable();
            $table->string('email')->nullable();
            $table->unsignedSmallInteger('order')->default(1);
            $table->timestamps();
        });

        Schema::create('paper_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete();
            $table->string('title');
            $table->longText('content');
            $table->unsignedSmallInteger('section_order')->default(1);
            $table->unsignedSmallInteger('page_start')->nullable();
            $table->unsignedSmallInteger('page_end')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_sections');
        Schema::dropIfExists('paper_authors');
        Schema::dropIfExists('papers');
    }
};
