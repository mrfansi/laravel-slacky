import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { Channel, type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { BookOpen, Hash, Lock, MessageSquare, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import { NavUser } from './nav-user';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

export function AppSidebar() {
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
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };
    const userId = auth?.user?.id;
    
    // Fetch channels on component mount
    useEffect(() => {
        fetchChannels();
        
        // Set up Echo to listen for channel updates if Echo is initialized and user is authenticated
        let echoChannel: any = null;
        
        if (typeof window !== 'undefined' && window.Echo && userId) {
            try {
                echoChannel = window.Echo.private(`private-user.${userId}`);
                echoChannel.listen('.channel.updated', (e: any) => {
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
                type: isPrivate ? 'private' : 'public'
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
        <Sidebar collapsible="icon" variant="inset">
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
                    <div className="px-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Channels</h3>
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
                                            <Switch 
                                                id="private" 
                                                checked={isPrivate}
                                                onCheckedChange={setIsPrivate}
                                            />
                                            <Label htmlFor="private">Make private</Label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateChannelOpen(false)}>Cancel</Button>
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
                                        className={cn(
                                            'w-full justify-start',
                                            activeChannelId === channel.id && 'bg-accent'
                                        )}
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
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Private Channels</h3>
                                <div className="space-y-1">
                                    {privateChannels.map((channel) => (
                                        <Button
                                            key={channel.id}
                                            variant="ghost"
                                            className={cn(
                                                'w-full justify-start',
                                                activeChannelId === channel.id && 'bg-accent'
                                            )}
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
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Direct Messages</h3>
                                <div className="space-y-1">
                                    {directMessages.map((channel) => (
                                        <Button
                                            key={channel.id}
                                            variant="ghost"
                                            className={cn(
                                                'w-full justify-start',
                                                activeChannelId === channel.id && 'bg-accent'
                                            )}
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
