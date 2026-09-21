<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        $researcherRole = Role::where('name', UserRole::RESEARCHER->value)->first();
        if ($researcherRole) {
            $user->roles()->attach($researcherRole->id);
        }

        AuditLogger::log('USER_REGISTERED', $user, [
            'email' => $user->email,
            'default_role' => UserRole::RESEARCHER->value,
        ]);

        return $user;
    }
}
