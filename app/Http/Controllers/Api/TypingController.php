<?php

namespace App\Http\Controllers\Api;

use App\Events\UserTyping;
use App\Http\Controllers\Controller;
use App\Models\Channel;
use Illuminate\Support\Facades\Auth;

class TypingController extends Controller
{
    /**
     * Broadcast that the authenticated user is typing in the channel.
     */
    public function typing(Channel $channel)
    {
        // Check if the user is a member of the channel
        if (! Auth::user()->isMemberOf($channel)) {
            return response()->json(['message' => 'You are not a member of this channel'], 403);
        }

        // Broadcast user typing event
        broadcast(new UserTyping($channel->fresh(), Auth::user()))->toOthers();

        return response()->json(['status' => 'success']);
    }
}
