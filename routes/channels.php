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
