<?php

namespace App\Models;

use App\Enums\ReviewRecommendation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_id',
        'reviewer_id',
        'score',
        'recommendation',
        'summary',
        'methodology_review',
        'novelty_review',
        'result_review',
        'reproducibility_review',
        'major_concerns',
        'minor_concerns',
        'is_ai_generated',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'recommendation' => ReviewRecommendation::class,
            'major_concerns' => 'array',
            'minor_concerns' => 'array',
            'is_ai_generated' => 'boolean',
        ];
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ReviewComment::class);
    }
}
