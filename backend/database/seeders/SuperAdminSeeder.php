<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $company = \App\Models\Company::firstOrCreate(
            ['document' => '00000000000100'],
            [
                'name' => 'BidFlow Master',
                'domain' => 'master.bidflow.com',
            ]
        );

        User::updateOrCreate(
            ['email' => 'master@bidflow.com'],
            [
                'company_id' => $company->id,
                'name' => 'Super Administrador',
                'password' => Hash::make('bidflow123'),
                'role' => 'Admin',
                'status' => 'Active',
                'is_superadmin' => true,
            ]
        );
    }
}
