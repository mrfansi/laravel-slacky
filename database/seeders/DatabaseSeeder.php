<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in the correct order
        $this->call([
            UserSeeder::class,     // First create users
            ChannelSeeder::class,  // Then create channels
            MessageSeeder::class,   // Finally add messages
        ]);
    }
}
