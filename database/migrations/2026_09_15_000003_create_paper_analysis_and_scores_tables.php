<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paper_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->unique()->constrained('papers')->cascadeOnDelete();
            $table->string('paper_type')->nullable();
            $table->string('research_domain')->nullable()->index();
            $table->json('research_questions')->nullable();
            $table->text('research_objective')->nullable();
            $table->json('methodology')->nullable();
            $table->json('key_findings')->nullable();
            $table->json('limitations')->nullable();
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->json('raw_ai_payload')->nullable();
            $table->timestamps();
        });

        Schema::create('paper_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->unique()->constrained('papers')->cascadeOnDelete();
            $table->unsignedTinyInteger('methodology_score')->default(0);
            $table->unsignedTinyInteger('novelty_score')->default(0);
            $table->unsignedTinyInteger('clarity_score')->default(0);
            $table->unsignedTinyInteger('evidence_score')->default(0);
            $table->unsignedTinyInteger('reproducibility_score')->default(0);
            $table->unsignedTinyInteger('writing_quality_score')->default(0);
            $table->unsignedTinyInteger('overall_score')->default(0);
            $table->json('explanations')->nullable();
            $table->timestamps();
        });

        Schema::create('paper_findings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete();
            $table->string('severity')->default('LOW')->index();
            $table->string('category')->index();
            $table->text('finding');
            $table->text('explanation');
            $table->text('evidence')->nullable();
            $table->unsignedSmallInteger('page_number')->nullable();
            $table->decimal('confidence', 4, 3)->nullable();
            $table->timestamps();
        });

        Schema::create('paper_references', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete();
            $table->text('raw_citation');
            $table->string('title')->nullable();
            $table->string('authors')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->boolean('is_cited_in_body')->default(true);
            $table->boolean('missing_from_bibliography')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_references');
        Schema::dropIfExists('paper_findings');
        Schema::dropIfExists('paper_scores');
        Schema::dropIfExists('paper_analyses');
    }
};
