<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recommendation')->index();
            $table->text('summary');
            $table->text('methodology_review')->nullable();
            $table->text('novelty_review')->nullable();
            $table->text('result_review')->nullable();
            $table->text('reproducibility_review')->nullable();
            $table->json('major_concerns')->nullable();
            $table->json('minor_concerns')->nullable();
            $table->boolean('is_ai_generated')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('review_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained('reviews')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('comment');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_comments');
        Schema::dropIfExists('reviews');
    }
};
