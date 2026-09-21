<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComparePaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_a_id' => ['required', 'integer', 'exists:papers,id'],
            'paper_b_id' => ['required', 'integer', 'exists:papers,id', 'different:paper_a_id'],
        ];
    }
}
