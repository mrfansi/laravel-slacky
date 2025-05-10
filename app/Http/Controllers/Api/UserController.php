<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Get online users
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function online()
    {
        // Get users who have been active in the last 5 minutes
        $onlineUsers = User::where('last_seen_at', '>=', now()->subMinutes(5))
            ->orWhere('is_online', true)
            ->get();

        return response()->json([
            'data' => $onlineUsers,
            'message' => 'Online users retrieved successfully',
        ]);
    }
}
