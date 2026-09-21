<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaperQaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'min:3', 'max:1000'],
        ];
    }
}
