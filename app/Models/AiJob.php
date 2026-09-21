<?php

namespace App\Models;

use App\Enums\AiJobStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_uuid',
        'paper_id',
        'job_type',
        'status',
        'retry_count',
        'max_retries',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => AiJobStatus::class,
            'retry_count' => 'integer',
            'max_retries' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(AiRequest::class);
    }
}
