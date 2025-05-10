import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Hash, Lock, MessageSquare, Plus } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

import AppLogo from '@/components/app-logo';
import { ChannelSearch } from '@/components/channel-search';
import { OnlineUsers } from '@/components/online-users';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Channel, User } from '@/types';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [publicChannels, setPublicChannels] = useState<Channel[]>([]);
    const [privateChannels, setPrivateChannels] = useState<Channel[]>([]);
    const [directMessages, setDirectMessages] = useState<Channel[]>([]);
    const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDescription, setNewChannelDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeChannelId, setActiveChannelId] = useState<number | null>(null);

    const { url } = usePage();

    // Extract channel ID from URL if present
    useEffect(() => {
        const match = url.match(/\/channels\/(\d+)/);
        if (match && match[1]) {
            setActiveChannelId(parseInt(match[1]));
        }
    }, [url]);

    // Fetch channels from API
    const fetchChannels = async () => {
        try {
            const publicResponse = await axios.get('/api/channels', { params: { type: 'public' } });
            const privateResponse = await axios.get('/api/channels', { params: { type: 'private' } });
            const directResponse = await axios.get('/api/channels', { params: { type: 'direct' } });

            setPublicChannels(publicResponse.data.data || []);
            setPrivateChannels(privateResponse.data.data || []);
            setDirectMessages(directResponse.data.data || []);
        } catch (error) {
            console.error('Error fetching channels:', error);
        }
    };

    // Get auth user outside of useEffect to avoid hooks rules violation
    const { auth } = usePage().props as { auth?: { user?: User } };
    const userId = auth?.user?.id;

    // Fetch channels on component mount
    useEffect(() => {
        fetchChannels();

        // Set up Echo to listen for channel updates if Echo is initialized and user is authenticated
        let echoChannel: any = null;

        if (typeof window !== 'undefined' && window.Echo && userId) {
            try {
                echoChannel = window.Echo.private(`private-user.${userId}`);
                echoChannel
                    .listen('.channel.updated', (e: any) => {
                        fetchChannels();
                    })
                    .listen('.channel.deleted', (e: any) => {
                        fetchChannels();
                    });
            } catch (error) {
                console.error('Error setting up Echo listeners:', error);
            }
        }

        // Clean up function
        return () => {
            if (typeof window !== 'undefined' && window.Echo && userId && echoChannel) {
                window.Echo.leave(`private-user.${userId}`);
            }
        };
    }, [userId]);

    // Create a new channel
    const createChannel = async () => {
        if (!newChannelName.trim()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('/api/channels', {
                name: newChannelName,
                description: newChannelDescription || null,
                is_private: isPrivate,
                type: isPrivate ? 'private' : 'public',
            });

            // Close dialog and reset form
            setIsCreateChannelOpen(false);
            setNewChannelName('');
            setNewChannelDescription('');
            setIsPrivate(false);

            // Refresh channels
            fetchChannels();

            // Navigate to the new channel
            router.visit(`/channels/${response.data.id}`);
        } catch (error) {
            console.error('Error creating channel:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate to a channel
    const navigateToChannel = (channel: Channel) => {
        router.visit(`/channels/${channel.id}`);
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                    {/* Channel Search */}
                    {auth?.user && <ChannelSearch />}

                    <Separator className="my-2" />

                    {/* Online Users Section */}
                    {auth?.user && <OnlineUsers currentUser={auth.user} />}

                    <Separator className="my-2" />

                    <div className="px-4 py-2">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-muted-foreground text-sm font-medium">Channels</h3>
                            <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create a new channel</DialogTitle>
                                        <DialogDescription>
                                            Channels are where your team communicates. They're best organized around a topic.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Channel name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. marketing"
                                                value={newChannelName}
                                                onChange={(e) => setNewChannelName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (optional)</Label>
                                            <Input
                                                id="description"
                                                placeholder="What's this channel about?"
                                                value={newChannelDescription}
                                                onChange={(e) => setNewChannelDescription(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
                                            <Label htmlFor="private">Make private</Label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateChannelOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={createChannel} disabled={!newChannelName.trim() || isLoading}>
                                            {isLoading ? 'Creating...' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Public Channels */}
                        {publicChannels.length > 0 && (
                            <div className="space-y-1">
                                {publicChannels.map((channel) => (
                                    <Button
                                        key={channel.id}
                                        variant="ghost"
                                        className={cn('w-full justify-start', activeChannelId === channel.id && 'bg-accent')}
                                        onClick={() => navigateToChannel(channel)}
                                    >
                                        <Hash className="mr-2 h-4 w-4" />
                                        <span className="truncate">{channel.name}</span>
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Private Channels */}
                        {privateChannels.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-muted-foreground mb-2 text-sm font-medium">Private Channels</h3>
                                <div className="space-y-1">
                                    {privateChannels.map((channel) => (
                                        <Button
                                            key={channel.id}
                                            variant="ghost"
                                            className={cn('w-full justify-start', activeChannelId === channel.id && 'bg-accent')}
                                            onClick={() => navigateToChannel(channel)}
                                        >
                                            <Lock className="mr-2 h-4 w-4" />
                                            <span className="truncate">{channel.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Direct Messages */}
                        {directMessages.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-muted-foreground mb-2 text-sm font-medium">Direct Messages</h3>
                                <div className="space-y-1">
                                    {directMessages.map((channel) => (
                                        <Button
                                            key={channel.id}
                                            variant="ghost"
                                            className={cn('w-full justify-start', activeChannelId === channel.id && 'bg-accent')}
                                            onClick={() => navigateToChannel(channel)}
                                        >
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            <span className="truncate">{channel.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter>
                <Separator className="my-2" />
                {auth?.user && (
                    <div className="px-4 py-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                                <span className="text-primary text-sm font-bold">
                                    {auth.user.name
                                        .split(' ')
                                        .map((n) => n?.[0] || '')
                                        .join('')
                                        .toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{auth.user.name}</span>
                                <span className="text-muted-foreground text-xs">{auth.user.email}</span>
                            </div>
                        </div>
                    </div>
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
