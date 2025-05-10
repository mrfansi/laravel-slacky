import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Channel } from '@/types';
import { Search, Hash, Lock, Users, Plus } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function ChannelSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Channel[]>([]);
    const [joinedChannels, setJoinedChannels] = useState<number[]>([]);
    const [isJoining, setIsJoining] = useState<number | null>(null);

    // Search for channels when query changes
    useEffect(() => {
        const searchChannels = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await axios.get('/api/channels/search', {
                    params: { query: searchQuery }
                });
                setSearchResults(response.data.data || []);

                // Get list of channel IDs the user has already joined
                const joinedResponse = await axios.get('/api/channels/joined');
                setJoinedChannels(joinedResponse.data.map((channel: Channel) => channel.id));
            } catch (error) {
                console.error('Error searching channels:', error);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce search to avoid too many requests
        const debounceTimeout = setTimeout(() => {
            if (searchQuery.trim()) {
                searchChannels();
            }
        }, 300);

        return () => clearTimeout(debounceTimeout);
    }, [searchQuery]);

    // Join a channel
    const joinChannel = async (channelId: number) => {
        setIsJoining(channelId);
        try {
            await axios.post(`/api/channels/${channelId}/join`);
            
            // Navigate to the channel
            router.visit(`/channels/${channelId}`);
        } catch (error) {
            console.error('Error joining channel:', error);
        } finally {
            setIsJoining(null);
        }
    };

    // Navigate to a channel
    const navigateToChannel = (channelId: number) => {
        router.visit(`/channels/${channelId}`);
    };

    return (
        <div className="py-2 px-4">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                />
            </div>

            {searchQuery.trim() !== '' && (
                <ScrollArea className="mt-2 h-[200px]">
                    {isSearching ? (
                        <div className="flex justify-center py-4">
                            <p className="text-sm text-muted-foreground">Searching...</p>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-4 space-y-2">
                            <p className="text-sm text-muted-foreground">No channels found</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {searchResults.map((channel) => {
                                const hasJoined = joinedChannels.includes(channel.id);
                                return (
                                    <div key={channel.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                {channel.type === 'direct' ? (
                                                    <Users className="h-4 w-4" />
                                                ) : channel.is_private ? (
                                                    <Lock className="h-4 w-4" />
                                                ) : (
                                                    <Hash className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{channel.name}</span>
                                                    {channel.is_private && (
                                                        <Badge variant="outline" className="px-1 py-0 text-xs">Private</Badge>
                                                    )}
                                                </div>
                                                {channel.description && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{channel.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant={hasJoined ? "ghost" : "default"}
                                                        size="sm"
                                                        className={cn(
                                                            "ml-2",
                                                            hasJoined ? "text-muted-foreground hover:text-foreground" : ""
                                                        )}
                                                        onClick={() => hasJoined ? navigateToChannel(channel.id) : joinChannel(channel.id)}
                                                        disabled={isJoining === channel.id}
                                                    >
                                                        {isJoining === channel.id ? (
                                                            "Joining..."
                                                        ) : hasJoined ? (
                                                            "Open"
                                                        ) : (
                                                            <>
                                                                <Plus className="mr-1 h-3 w-3" />
                                                                Join
                                                            </>
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">
                                                    <p>{hasJoined ? "Open channel" : "Join channel"}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            )}
        </div>
    );
}
