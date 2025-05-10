<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        
        // Create test users
        $testUsers = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
            ],
            [
                'name' => 'Bob Johnson',
                'email' => 'bob@example.com',
            ],
            [
                'name' => 'Alice Williams',
                'email' => 'alice@example.com',
            ],
        ];
        
        foreach ($testUsers as $user) {
            User::create([
                'name' => $user['name'],
                'email' => $user['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
        }
    }
}
