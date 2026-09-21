<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_id',
        'title',
        'content',
        'section_order',
        'page_start',
        'page_end',
    ];

    protected function casts(): array
    {
        return [
            'section_order' => 'integer',
            'page_start' => 'integer',
            'page_end' => 'integer',
        ];
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
