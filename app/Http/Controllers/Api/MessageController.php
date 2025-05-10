<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    /**
     * Display a listing of the messages for a channel.
     */
    public function index(Request $request, Channel $channel)
    {
        // Check if the user is a member of the channel
        if (!Auth::user()->isMemberOf($channel)) {
            return response()->json(['message' => 'You are not a member of this channel'], 403);
        }

        $messages = $channel->messages()
            ->with(['user', 'attachments'])
            ->when($request->has('parent_message_id'), function ($query) use ($request) {
                return $query->where('parent_message_id', $request->parent_message_id);
            }, function ($query) {
                return $query->whereNull('parent_message_id');
            })
            ->latest()
            ->paginate(25);

        return response()->json($messages);
    }

    /**
     * Store a newly created message in storage.
     */
    public function store(Request $request, Channel $channel)
    {
        // Check if the user is a member of the channel
        if (!Auth::user()->isMemberOf($channel)) {
            return response()->json(['message' => 'You are not a member of this channel'], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
            'parent_message_id' => ['nullable', 'exists:messages,id'],
            'type' => ['sometimes', Rule::in(['text', 'image', 'file'])],
            'attachments' => ['sometimes', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB max file size
        ]);

        $message = new Message([
            'channel_id' => $channel->id,
            'user_id' => Auth::id(),
            'parent_message_id' => $validated['parent_message_id'] ?? null,
            'content' => $validated['content'],
            'type' => $validated['type'] ?? 'text',
        ]);

        $message->save();

        // Handle attachments if any
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('attachments/' . $channel->id, 'public');
                
                $message->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        $message->load(['user', 'attachments']);

        // Broadcast message sent event
        broadcast(new MessageSent($message, Auth::user()))->toOthers();

        return response()->json($message, 201);
    }

    /**
     * Update the specified message in storage.
     */
    public function update(Request $request, Message $message)
    {
        // Check if the user is the author of the message
        if (Auth::id() !== $message->user_id) {
            return response()->json(['message' => 'You can only edit your own messages'], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $message->update([
            'content' => $validated['content'],
        ]);

        // Broadcast message updated event
        broadcast(new MessageUpdated($message))->toOthers();

        return response()->json($message);
    }

    /**
     * Remove the specified message from storage.
     */
    public function destroy(Message $message)
    {
        // Check if the user is the author of the message or an admin of the channel
        $isAuthor = Auth::id() === $message->user_id;
        $isAdmin = Auth::user()->isAdminOf($message->channel);
        $isCreator = Auth::user()->isCreatorOf($message->channel);

        if (!$isAuthor && !$isAdmin && !$isCreator) {
            return response()->json(['message' => 'You do not have permission to delete this message'], 403);
        }

        $messageId = $message->id;
        $channelId = $message->channel_id;

        // Delete attachments if any
        foreach ($message->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $message->delete();

        // Broadcast message deleted event
        broadcast(new MessageDeleted($messageId, $channelId))->toOthers();

        return response()->noContent();
    }
}
