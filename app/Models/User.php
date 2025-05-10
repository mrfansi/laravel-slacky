<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'last_seen_at',
        'is_online',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'is_online' => 'boolean',
            'password' => 'hashed',
        ];
    }
    
    /**
     * Get the channels that the user has created.
     */
    public function createdChannels(): HasMany
    {
        return $this->hasMany(Channel::class, 'creator_id');
    }
    
    /**
     * Get the channels that the user is a member of.
     */
    public function channels(): BelongsToMany
    {
        return $this->belongsToMany(Channel::class, 'channel_members')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }
    
    /**
     * Get the messages sent by the user.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
    
    /**
     * Check if the user is a member of the given channel.
     */
    public function isMemberOf(Channel $channel): bool
    {
        return $this->channels()->where('channel_id', $channel->id)->exists();
    }
    
    /**
     * Check if the user is an admin of the given channel.
     */
    public function isAdminOf(Channel $channel): bool
    {
        return $this->channels()->where('channel_id', $channel->id)
            ->wherePivot('role', 'admin')
            ->exists();
    }
    
    /**
     * Check if the user is the creator of the given channel.
     */
    public function isCreatorOf(Channel $channel): bool
    {
        return $this->id === $channel->creator_id;
    }
}
