<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(
            ['name' => UserRole::ADMIN->value],
            ['label' => 'Administrator', 'description' => 'System administrator with full privileges']
        );

        $researcherRole = Role::firstOrCreate(
            ['name' => UserRole::RESEARCHER->value],
            ['label' => 'Researcher', 'description' => 'Academic researcher uploading papers and running analyses']
        );

        $reviewerRole = Role::firstOrCreate(
            ['name' => UserRole::REVIEWER->value],
            ['label' => 'Reviewer', 'description' => 'Peer reviewer assessing papers and providing evaluations']
        );

        // 1. Reviewer: Dr. Pajar Ramdani
        $pajar = User::firstOrCreate(
            ['email' => 'pajarganteng@desputatio.com'],
            [
                'name' => 'Dr. Pajar Ramdani',
                'password' => Hash::make('password123!@#'),
                'email_verified_at' => now(),
            ]
        );
        $pajar->roles()->sync([$reviewerRole->id]);

        // 2. Reviewer: Drs. Syafa Nurisar
        $syafa = User::firstOrCreate(
            ['email' => 'syafa@desputatio.com'],
            [
                'name' => 'Drs. Syafa Nurisar',
                'password' => Hash::make('password123!@#'),
                'email_verified_at' => now(),
            ]
        );
        $syafa->roles()->sync([$reviewerRole->id]);

        // 3. Admin: Lord Resbob
        $admin = User::firstOrCreate(
            ['email' => 'sundabaik@desputatio.com'],
            [
                'name' => 'Lord Resbob',
                'password' => Hash::make('password123!@#'),
                'email_verified_at' => now(),
            ]
        );
        $admin->roles()->sync([$adminRole->id]);
    }
}
