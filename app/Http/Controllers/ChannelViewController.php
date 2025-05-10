<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChannelViewController extends Controller
{
    /**
     * Display a listing of the channels.
     */
    public function index()
    {
        return Inertia::render('channels/index');
    }

    /**
     * Display the specified channel.
     */
    public function show(Channel $channel)
    {
        // Check if the user is a member of the channel
        if (!Auth::user()->isMemberOf($channel)) {
            return redirect()->route('channels.index')->with('error', 'You are not a member of this channel');
        }

        return Inertia::render('channels/channel', [
            'channel' => $channel->load('creator'),
        ]);
    }

    /**
     * Show the form for creating a new channel.
     */
    public function create()
    {
        return Inertia::render('channels/create');
    }
}
