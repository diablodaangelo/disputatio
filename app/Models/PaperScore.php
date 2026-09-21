<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_id',
        'methodology_score',
        'novelty_score',
        'clarity_score',
        'evidence_score',
        'reproducibility_score',
        'writing_quality_score',
        'overall_score',
        'explanations',
    ];

    protected function casts(): array
    {
        return [
            'methodology_score' => 'integer',
            'novelty_score' => 'integer',
            'clarity_score' => 'integer',
            'evidence_score' => 'integer',
            'reproducibility_score' => 'integer',
            'writing_quality_score' => 'integer',
            'overall_score' => 'integer',
            'explanations' => 'array',
        ];
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
