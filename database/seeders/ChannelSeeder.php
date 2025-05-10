<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\User;
use Illuminate\Database\Seeder;

class ChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run UserSeeder first.');

            return;
        }

        $admin = $users->first();

        // Create public channels
        $generalChannel = Channel::create([
            'name' => 'general',
            'description' => 'General discussions for the team',
            'creator_id' => $admin->id,
            'is_private' => false,
            'type' => 'public',
        ]);

        $randomChannel = Channel::create([
            'name' => 'random',
            'description' => 'Random stuff, memes, and fun',
            'creator_id' => $admin->id,
            'is_private' => false,
            'type' => 'public',
        ]);

        $announcementsChannel = Channel::create([
            'name' => 'announcements',
            'description' => 'Important announcements for the team',
            'creator_id' => $admin->id,
            'is_private' => false,
            'type' => 'public',
        ]);

        // Create a private channel
        $devChannel = Channel::create([
            'name' => 'developers',
            'description' => 'Private channel for the development team',
            'creator_id' => $admin->id,
            'is_private' => true,
            'type' => 'private',
        ]);

        // Add all users to public channels
        foreach ($users as $user) {
            $generalChannel->members()->attach($user->id, [
                'role' => $user->id === $admin->id ? 'admin' : 'member',
                'joined_at' => now(),
            ]);

            $randomChannel->members()->attach($user->id, [
                'role' => $user->id === $admin->id ? 'admin' : 'member',
                'joined_at' => now(),
            ]);

            $announcementsChannel->members()->attach($user->id, [
                'role' => $user->id === $admin->id ? 'admin' : 'member',
                'joined_at' => now(),
            ]);
        }

        // Add only admin and one other user to the private channel
        $devChannel->members()->attach($admin->id, [
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        if ($users->count() > 1) {
            $devChannel->members()->attach($users[1]->id, [
                'role' => 'member',
                'joined_at' => now(),
            ]);
        }

        // Create direct message channels between users if there are at least 2 users
        if ($users->count() >= 2) {
            for ($i = 0; $i < $users->count(); $i++) {
                for ($j = $i + 1; $j < $users->count(); $j++) {
                    $dmChannel = Channel::create([
                        'name' => $users[$i]->name.' & '.$users[$j]->name,
                        'description' => null,
                        'creator_id' => $users[$i]->id,
                        'is_private' => true,
                        'type' => 'direct',
                    ]);

                    $dmChannel->members()->attach([
                        $users[$i]->id => [
                            'role' => 'member',
                            'joined_at' => now(),
                        ],
                        $users[$j]->id => [
                            'role' => 'member',
                            'joined_at' => now(),
                        ],
                    ]);
                }
            }
        }
    }
}
