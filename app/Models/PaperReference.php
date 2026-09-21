<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperReference extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_id',
        'raw_citation',
        'title',
        'authors',
        'year',
        'is_cited_in_body',
        'missing_from_bibliography',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'is_cited_in_body' => 'boolean',
            'missing_from_bibliography' => 'boolean',
        ];
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
