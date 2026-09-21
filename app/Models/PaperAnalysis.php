<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_id',
        'paper_type',
        'research_domain',
        'research_questions',
        'research_objective',
        'methodology',
        'key_findings',
        'limitations',
        'strengths',
        'weaknesses',
        'raw_ai_payload',
    ];

    protected function casts(): array
    {
        return [
            'research_questions' => 'array',
            'methodology' => 'array',
            'key_findings' => 'array',
            'limitations' => 'array',
            'strengths' => 'array',
            'weaknesses' => 'array',
            'raw_ai_payload' => 'array',
        ];
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
