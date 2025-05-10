import { User } from '@/types';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { MessageSquare } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface OnlineUsersProps {
    currentUser: User;
}

export function OnlineUsers({ currentUser }: OnlineUsersProps) {
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch online users
    useEffect(() => {
        const fetchOnlineUsers = async () => {
            try {
                const response = await axios.get('/api/users/online');
                // Filter out current user from the list
                const filteredUsers = response.data.data.filter((user: User) => user.id !== currentUser.id);
                setOnlineUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching online users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOnlineUsers();

        // Set up Echo to listen for user presence
        if (typeof window !== 'undefined' && window.Echo) {
            try {
                const presenceChannel = window.Echo.join('presence-global');
                
                // When a user joins
                presenceChannel.here((users: User[]) => {
                    const filteredUsers = users.filter(user => user.id !== currentUser.id);
                    setOnlineUsers(filteredUsers);
                });
                
                // When a user joins after we've joined
                presenceChannel.joining((user: User) => {
                    if (user.id !== currentUser.id) {
                        setOnlineUsers(prev => {
                            if (!prev.some(u => u.id === user.id)) {
                                return [...prev, user];
                            }
                            return prev;
                        });
                    }
                });
                
                // When a user leaves
                presenceChannel.leaving((user: User) => {
                    setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
                });

                return () => {
                    if (window.Echo) {
                        window.Echo.leave('presence-global');
                    }
                };
            } catch (error) {
                console.error('Error setting up presence channel:', error);
            }
        }
    }, [currentUser.id]);

    // Start a direct message with a user
    const startDirectMessage = async (user: User) => {
        try {
            setLoading(true);
            // Check if a DM channel already exists
            const response = await axios.post('/api/channels/direct', {
                user_id: user.id
            });
            
            // Navigate to the channel
            if (response.data && response.data.id) {
                router.visit(`/channels/${response.data.id}`);
            }
        } catch (error) {
            console.error('Error starting direct message:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="py-2">
            <div className="flex items-center justify-between px-4 py-2">
                <h3 className="text-sm font-medium">Online Users</h3>
                <Badge variant="secondary" className="text-xs">{onlineUsers.length}</Badge>
            </div>
            
            <ScrollArea className="h-[150px]">
                <div className="space-y-1 px-1">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <p className="text-sm text-muted-foreground">Loading users...</p>
                        </div>
                    ) : onlineUsers.length === 0 ? (
                        <div className="flex justify-center py-4">
                            <p className="text-sm text-muted-foreground">No users online</p>
                        </div>
                    ) : (
                        onlineUsers.map(user => (
                            <TooltipProvider key={user.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className="w-full justify-start px-2 py-1.5 h-auto" 
                                            onClick={() => startDirectMessage(user)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={user.avatar} alt={user.name} />
                                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                                                </div>
                                                <span className="text-sm truncate">{user.name}</span>
                                            </div>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <div className="flex flex-col">
                                            <p>Message {user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
