<?php

use App\Http\Controllers\Api\ChannelController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TypingController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// User information
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Apply auth:sanctum middleware to all API routes
Route::middleware('auth:sanctum')->group(function () {
    // Channels
    Route::get('/channels', [ChannelController::class, 'index']);
    Route::post('/channels', [ChannelController::class, 'store']);
    Route::get('/channels/search', [ChannelController::class, 'search']);
    Route::get('/channels/joined', [ChannelController::class, 'joined']);
    Route::get('/channels/{channel}', [ChannelController::class, 'show']);
    Route::put('/channels/{channel}', [ChannelController::class, 'update']);
    Route::delete('/channels/{channel}', [ChannelController::class, 'destroy']);
    Route::post('/channels/{channel}/join', [ChannelController::class, 'join']);
    Route::post('/channels/{channel}/leave', [ChannelController::class, 'leave']);
    Route::get('/channels/{channel}/members', [ChannelController::class, 'members']);
    
    // Messages
    Route::get('/channels/{channel}/messages', [MessageController::class, 'index']);
    Route::post('/channels/{channel}/messages', [MessageController::class, 'store']);
    Route::put('/messages/{message}', [MessageController::class, 'update']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // Typing indicator
    Route::post('/channels/{channel}/typing', [TypingController::class, 'typing']);
    
    // Users
    Route::get('/users/online', [UserController::class, 'online']);
    
    // Direct Messages
    Route::post('/channels/direct', [ChannelController::class, 'createDirectMessage']);
});
