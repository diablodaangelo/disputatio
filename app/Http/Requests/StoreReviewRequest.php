<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var \App\Models\User $user */
        $user = $this->user();
        return (bool) ($user && $user->hasRole('reviewer'));
    }

    public function rules(): array
    {
        return [
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'recommendation' => ['required', 'string', 'in:ACCEPT,MINOR_REVISION,MAJOR_REVISION,REJECT'],
            'summary' => ['required', 'string'],
            'methodology_review' => ['nullable', 'string'],
            'novelty_review' => ['nullable', 'string'],
            'result_review' => ['nullable', 'string'],
            'reproducibility_review' => ['nullable', 'string'],
            'major_concerns' => ['nullable', 'array'],
            'minor_concerns' => ['nullable', 'array'],
        ];
    }
}
