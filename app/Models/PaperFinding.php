<?php

namespace App\Models;

use App\Enums\SeverityLevel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperFinding extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_id',
        'severity',
        'category',
        'finding',
        'explanation',
        'evidence',
        'page_number',
        'confidence',
    ];

    protected function casts(): array
    {
        return [
            'severity' => SeverityLevel::class,
            'page_number' => 'integer',
            'confidence' => 'float',
        ];
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
