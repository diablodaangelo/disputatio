<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_jobs', function (Blueprint $table) {
            $table->id();
            $table->uuid('job_uuid')->unique();
            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete();
            $table->string('job_type')->index();
            $table->string('status')->default('PENDING')->index();
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->unsignedTinyInteger('max_retries')->default(3);
            $table->longText('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_job_id')->nullable()->constrained('ai_jobs')->nullOnDelete();
            $table->uuid('request_uuid')->unique();
            $table->string('endpoint');
            $table->json('payload');
            $table->timestamps();
        });

        Schema::create('ai_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_request_id')->constrained('ai_requests')->cascadeOnDelete();
            $table->unsignedSmallInteger('status_code');
            $table->json('response_data')->nullable();
            $table->unsignedInteger('execution_time_ms')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_responses');
        Schema::dropIfExists('ai_requests');
        Schema::dropIfExists('ai_jobs');
    }
};
