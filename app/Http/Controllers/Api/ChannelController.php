<?php

namespace App\Http\Controllers\Api;

use App\Events\ChannelDeleted;
use App\Events\ChannelUpdated;
use App\Events\UserJoinedChannel;
use App\Events\UserLeftChannel;
use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\ChannelMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ChannelController extends Controller
{
    /**
     * Display a listing of the channels.
     */
    public function index(Request $request)
    {
        $channels = Channel::forUser(Auth::user())
            ->with('creator')
            ->when($request->has('type'), function ($query) use ($request) {
                return $query->where('type', $request->type);
            })
            ->latest()
            ->paginate(15);
            
        return response()->json($channels);
    }

    /**
     * Store a newly created channel in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_private' => ['sometimes', 'boolean'],
            'type' => ['sometimes', Rule::in(['public', 'private', 'direct'])],
        ]);

        $channel = new Channel([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_private' => $validated['is_private'] ?? false,
            'type' => $validated['type'] ?? 'public',
            'creator_id' => Auth::id(),
        ]);

        $channel->save();

        // Add the creator as a member with admin role
        $channel->members()->attach(Auth::id(), [
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        return response()->json($channel->load('creator'), 201);
    }

    /**
     * Display the specified channel.
     */
    public function show(Channel $channel)
    {
        // Check if the user is a member of the channel
        if (!Auth::user()->isMemberOf($channel)) {
            return response()->json(['message' => 'You are not a member of this channel'], 403);
        }

        return response()->json($channel->load(['creator', 'members']));
    }

    /**
     * Update the specified channel in storage.
     */
    public function update(Request $request, Channel $channel)
    {
        // Check if the user is the creator of the channel
        if (Auth::id() !== $channel->creator_id) {
            return response()->json(['message' => 'Only the channel creator can update the channel'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_private' => ['sometimes', 'boolean'],
        ]);

        $channel->update($validated);

        // Broadcast channel updated event
        broadcast(new ChannelUpdated($channel))->toOthers();

        return response()->json($channel);
    }

    /**
     * Remove the specified channel from storage.
     */
    public function destroy(Channel $channel)
    {
        // Check if the user is the creator of the channel
        if (Auth::id() !== $channel->creator_id) {
            return response()->json(['message' => 'Only the channel creator can delete the channel'], 403);
        }

        $channelId = $channel->id;
        $channel->delete();

        // Broadcast channel deleted event
        broadcast(new ChannelDeleted($channelId));

        return response()->noContent();
    }

    /**
     * Join a public channel.
     */
    public function join(Channel $channel)
    {
        // Check if the channel is public
        if ($channel->is_private) {
            return response()->json(['message' => 'Cannot join a private channel'], 403);
        }

        // Check if the user is already a member
        if (Auth::user()->isMemberOf($channel)) {
            return response()->json(['message' => 'You are already a member of this channel'], 400);
        }

        // Add the user as a member
        $channel->members()->attach(Auth::id(), [
            'role' => 'member',
            'joined_at' => now(),
        ]);

        // Broadcast user joined event
        broadcast(new UserJoinedChannel($channel->fresh(), Auth::user()))->toOthers();

        return response()->json(['message' => 'Joined channel successfully'], 201);
    }

    /**
     * Leave a channel.
     */
    public function leave(Channel $channel)
    {
        // Check if the user is a member
        if (!Auth::user()->isMemberOf($channel)) {
            return response()->json(['message' => 'You are not a member of this channel'], 400);
        }

        // Check if the user is the creator
        if (Auth::id() === $channel->creator_id) {
            return response()->json(['message' => 'The creator cannot leave the channel. Transfer ownership or delete the channel instead.'], 400);
        }

        // Remove the user from the channel
        $channel->members()->detach(Auth::id());

        // Broadcast user left event
        broadcast(new UserLeftChannel($channel->fresh(), Auth::user()))->toOthers();

        return response()->noContent();
    }

    /**
     * List members of a channel.
     */
    public function members(Channel $channel)
    {
        // Check if the user is a member
        if (!Auth::user()->isMemberOf($channel)) {
            return response()->json(['message' => 'You are not a member of this channel'], 403);
        }

        $members = $channel->members()
            ->withPivot(['role', 'joined_at'])
            ->paginate(20);

        return response()->json($members);
    }
}
