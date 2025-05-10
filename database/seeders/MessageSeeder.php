<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all channels and users
        $channels = Channel::all();
        $users = User::all();

        if ($channels->isEmpty()) {
            $this->command->info('No channels found. Please run ChannelSeeder first.');

            return;
        }

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run UserSeeder first.');

            return;
        }

        // Sample messages for the general channel
        $generalChannel = $channels->where('name', 'general')->first();

        if ($generalChannel) {
            // Welcome message from the first user (admin)
            $welcomeMessage = Message::create([
                'channel_id' => $generalChannel->id,
                'user_id' => $users->first()->id,
                'content' => 'Welcome to the general channel! This is where we discuss general topics.',
                'type' => 'text',
            ]);

            // Add some replies to the welcome message
            if ($users->count() > 1) {
                Message::create([
                    'channel_id' => $generalChannel->id,
                    'user_id' => $users[1]->id,
                    'parent_message_id' => $welcomeMessage->id,
                    'content' => 'Thanks for setting this up! Looking forward to working with everyone.',
                    'type' => 'text',
                ]);
            }

            if ($users->count() > 2) {
                Message::create([
                    'channel_id' => $generalChannel->id,
                    'user_id' => $users[2]->id,
                    'parent_message_id' => $welcomeMessage->id,
                    'content' => 'Hello everyone! Excited to be part of this team.',
                    'type' => 'text',
                ]);
            }

            // Add some regular messages
            foreach ($users as $index => $user) {
                Message::create([
                    'channel_id' => $generalChannel->id,
                    'user_id' => $user->id,
                    'content' => 'This is a test message from '.$user->name.'. Message #'.($index + 1).'.',
                    'type' => 'text',
                ]);
            }
        }

        // Sample messages for the random channel
        $randomChannel = $channels->where('name', 'random')->first();

        if ($randomChannel) {
            // Add some fun messages
            $messages = [
                'Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat!',
                'Just found this hilarious meme: [imagine a funny meme here]',
                'Random fact of the day: A day on Venus is longer than a year on Venus. Venus rotates so slowly that it takes 243 Earth days to complete one rotation, but it only takes 225 Earth days to orbit the Sun.',
                'What do you call a fake noodle? An impasta!',
                'Just saw the new movie everyone\'s talking about. No spoilers, but the ending was mind-blowing!',
            ];

            foreach ($messages as $index => $content) {
                $userIndex = $index % $users->count();
                Message::create([
                    'channel_id' => $randomChannel->id,
                    'user_id' => $users[$userIndex]->id,
                    'content' => $content,
                    'type' => 'text',
                ]);
            }
        }

        // Sample messages for the announcements channel
        $announcementsChannel = $channels->where('name', 'announcements')->first();

        if ($announcementsChannel) {
            // Add some announcements from the admin
            $announcements = [
                'Important: Team meeting scheduled for next Monday at 10 AM.',
                'New project kickoff will be on Wednesday. Please prepare your ideas.',
                'Reminder: Quarterly reports are due by the end of this week.',
                'We have a new team member joining us next week. Please give them a warm welcome!',
            ];

            foreach ($announcements as $content) {
                Message::create([
                    'channel_id' => $announcementsChannel->id,
                    'user_id' => $users->first()->id, // Admin user
                    'content' => $content,
                    'type' => 'text',
                ]);
            }
        }

        // Sample messages for the private developers channel
        $devChannel = $channels->where('name', 'developers')->first();

        if ($devChannel) {
            $devMessages = [
                'Has anyone started working on the new API integration?',
                'I found a bug in the authentication module. Working on a fix now.',
                'The new feature is ready for testing. Please check it out and provide feedback.',
                'We need to update our dependencies to fix some security vulnerabilities.',
            ];

            // Get the members of the dev channel
            $devMembers = $devChannel->members;

            foreach ($devMessages as $index => $content) {
                $userIndex = $index % $devMembers->count();
                Message::create([
                    'channel_id' => $devChannel->id,
                    'user_id' => $devMembers[$userIndex]->id,
                    'content' => $content,
                    'type' => 'text',
                ]);
            }
        }

        // Sample messages for direct message channels
        $directChannels = $channels->where('type', 'direct');

        foreach ($directChannels as $dmChannel) {
            // Get the members of this DM channel
            $members = $dmChannel->members;

            if ($members->count() >= 2) {
                // Create a conversation between the two users
                $conversation = [
                    [$members[0]->id, 'Hey there! How are you doing?'],
                    [$members[1]->id, 'I\'m doing well, thanks for asking! How about you?'],
                    [$members[0]->id, 'Pretty good. Working on that project we discussed.'],
                    [$members[1]->id, 'Nice! Let me know if you need any help with it.'],
                    [$members[0]->id, 'Will do. Thanks!'],
                ];

                foreach ($conversation as $index => $msg) {
                    Message::create([
                        'channel_id' => $dmChannel->id,
                        'user_id' => $msg[0],
                        'content' => $msg[1],
                        'type' => 'text',
                        'created_at' => now()->addMinutes($index), // Space out the messages in time
                    ]);
                }
            }
        }
    }
}
