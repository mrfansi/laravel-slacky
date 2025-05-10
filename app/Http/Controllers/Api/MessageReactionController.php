<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\MessageReaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageReactionController extends Controller
{
    /**
     * Toggle a reaction on a message.
     *
     * @param Request $request
     * @param Message $message
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggle(Request $request, Message $message)
    {
        $validated = $request->validate([
            'emoji' => ['required', 'string', 'max:50'],
        ]);
        
        $userId = Auth::id();
        $emoji = $validated['emoji'];
        
        // Check if the reaction already exists
        $existingReaction = $message->reactions()
            ->where('user_id', $userId)
            ->where('emoji', $emoji)
            ->first();
            
        if ($existingReaction) {
            // If the reaction exists, remove it
            $existingReaction->delete();
            $action = 'removed';
        } else {
            // If the reaction doesn't exist, add it
            $message->reactions()->create([
                'user_id' => $userId,
                'emoji' => $emoji,
            ]);
            $action = 'added';
        }
        
        // Get updated reactions for the message
        $reactions = $message->reactions()
            ->with('user:id,name')
            ->get()
            ->groupBy('emoji')
            ->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'users' => $group->pluck('user'),
                ];
            });
            
        return response()->json([
            'message' => "Reaction {$action} successfully",
            'reactions' => $reactions,
        ]);
    }
    
    /**
     * Get all reactions for a message.
     *
     * @param Message $message
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Message $message)
    {
        $reactions = $message->reactions()
            ->with('user:id,name')
            ->get()
            ->groupBy('emoji')
            ->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'users' => $group->pluck('user'),
                ];
            });
            
        return response()->json([
            'reactions' => $reactions,
        ]);
    }
}
