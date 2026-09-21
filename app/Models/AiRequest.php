<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AiRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'ai_job_id',
        'request_uuid',
        'endpoint',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(AiJob::class, 'ai_job_id');
    }

    public function response(): HasOne
    {
        return $this->hasOne(AiResponse::class);
    }
}
