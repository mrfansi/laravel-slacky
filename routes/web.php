<?php

use App\Http\Controllers\ChannelViewController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Channel routes
    Route::get('channels', [ChannelViewController::class, 'index'])->name('channels.index');
    Route::get('channels/create', [ChannelViewController::class, 'create'])->name('channels.create');
    Route::get('channels/{channel}', [ChannelViewController::class, 'show'])->name('channels.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
