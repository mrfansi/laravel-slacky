<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Channel extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'creator_id',
        'is_private',
        'type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the creator of the channel.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the members of the channel.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'channel_members')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    /**
     * Get the messages in the channel.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Scope a query to only include channels the user is a member of.
     */
    public function scopeForUser($query, User $user)
    {
        return $query->whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        });
    }

    /**
     * Scope a query to only include public channels.
     */
    public function scopePublic($query)
    {
        return $query->where('is_private', false);
    }

    /**
     * Scope a query to only include private channels.
     */
    public function scopePrivate($query)
    {
        return $query->where('is_private', true);
    }

    /**
     * Scope a query to only include direct message channels.
     */
    public function scopeDirect($query)
    {
        return $query->where('type', 'direct');
    }
}
