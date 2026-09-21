<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperQa extends Model
{
    protected $fillable = [
        'paper_id',
        'user_id',
        'question',
        'answer',
        'evidence',
        'found',
    ];

    protected $casts = [
        'evidence' => 'array',
        'found' => 'boolean',
    ];

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}