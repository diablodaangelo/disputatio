<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'], // max 20MB
            'title' => ['nullable', 'string', 'max:255'],
            'abstract' => ['nullable', 'string'],
            'publication_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'journal' => ['nullable', 'string', 'max:255'],
            'doi' => ['nullable', 'string', 'max:255'],
            'authors' => ['nullable', 'array'],
            'authors.*' => ['string', 'max:255'],
        ];
    }
}
