<?php

use App\Models\Channel;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel-specific events
Broadcast::channel('private-channel.{channelId}', function (User $user, $channelId) {
    $channel = Channel::find($channelId);
    return $channel && $user->channels()->where('channel_id', $channelId)->exists();
});

// Channel-specific presence events
Broadcast::channel('presence-channel.{channelId}', function (User $user, $channelId) {
    $channel = Channel::find($channelId);
    
    if ($channel && $user->channels()->where('channel_id', $channelId)->exists()) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar_url' => $user->profile_photo_url ?? null,
        ];
    }
    
    return false;
});

// User-specific notifications
Broadcast::channel('private-user.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Global presence channel for tracking online users
Broadcast::channel('presence-global', function (User $user) {
    // Update user's last_seen_at timestamp
    $user->update([
        'last_seen_at' => now(),
        'is_online' => true
    ]);
    
    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'avatar' => $user->avatar,
        'last_seen_at' => $user->last_seen_at
    ];
});
