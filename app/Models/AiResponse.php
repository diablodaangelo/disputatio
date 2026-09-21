<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'ai_request_id',
        'status_code',
        'response_data',
        'execution_time_ms',
    ];

    protected function casts(): array
    {
        return [
            'status_code' => 'integer',
            'response_data' => 'array',
            'execution_time_ms' => 'integer',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(AiRequest::class, 'ai_request_id');
    }
}
