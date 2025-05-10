<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->when($request->has('read'), function ($query) use ($request) {
                return $request->read ? $query->read() : $query->unread();
            })
            ->latest()
            ->paginate(15);

        return response()->json($notifications);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        // Check if the notification belongs to the authenticated user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        return response()->json($notification);
    }

    /**
     * Mark all unread notifications for the authenticated user as read.
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
