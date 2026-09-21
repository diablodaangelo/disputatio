<?php

namespace App\Models;

use App\Enums\PaperStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Paper extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'abstract',
        'publication_year',
        'journal',
        'doi',
        'keywords',
        'file_path',
        'file_hash',
        'file_size_bytes',
        'status',
        'uploaded_by',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function booted(): void
    {
        static::creating(function (Paper $paper) {
            if (empty($paper->slug)) {
                $baseSlug = \Illuminate\Support\Str::slug($paper->title ?: 'makalah') ?: 'makalah';
                $paper->slug = $baseSlug . '-' . \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(6));
            }
        });
    }

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
            'publication_year' => 'integer',
            'file_size_bytes' => 'integer',
            'status' => PaperStatus::class,
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function authors(): HasMany
    {
        return $this->hasMany(PaperAuthor::class)->orderBy('order');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(PaperSection::class)->orderBy('section_order');
    }

    public function analysis(): HasOne
    {
        return $this->hasOne(PaperAnalysis::class);
    }

    public function score(): HasOne
    {
        return $this->hasOne(PaperScore::class);
    }

    public function findings(): HasMany
    {
        return $this->hasMany(PaperFinding::class);
    }

    public function references(): HasMany
    {
        return $this->hasMany(PaperReference::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function aiJobs(): HasMany
    {
        return $this->hasMany(AiJob::class);
    }

    public function qas(): HasMany
    {
        return $this->hasMany(PaperQa::class)->orderBy('created_at', 'asc');
    }
}
