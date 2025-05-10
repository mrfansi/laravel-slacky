import AppLayout from '@/layouts/app-layout';
import { Channel, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Hash, Lock, MessageSquare, Plus, Users } from 'lucide-react';

interface Props {
    auth: {
        user: User;
    };
}

export default function ChannelsIndex({ auth }: Props) {
    const [publicChannels, setPublicChannels] = useState<Channel[]>([]);
    const [privateChannels, setPrivateChannels] = useState<Channel[]>([]);
    const [directMessages, setDirectMessages] = useState<Channel[]>([]);
    const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDescription, setNewChannelDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Extract user ID to use as dependency
    const userId = auth?.user?.id;
    
    // Fetch channels on component mount
    useEffect(() => {
        fetchChannels();
        
        // Set up Echo to listen for channel updates only if Echo is initialized and user is authenticated
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
    
    // Fetch channels from API
    const fetchChannels = async () => {
        if (!userId) {
            console.warn('User not authenticated, cannot fetch channels');
            return;
        }
        
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
    
    // Create a new channel
    const createChannel = async () => {
        if (!newChannelName.trim()) return;
        if (!userId) {
            console.error('User not authenticated, cannot create channel');
            return;
        }
        
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
    
    // Get channel icon based on type
    const getChannelIcon = (channel: Channel) => {
        if (channel.type === 'direct') return <MessageSquare className="h-5 w-5" />;
        return channel.is_private ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" />;
    };
    
    return (
        <AppLayout>
            <Head title="Channels" />
            
            <div className="container py-8 px-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Channels</h1>
                    
                    <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Channel
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
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Public Channels</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {publicChannels.map(channel => (
                                <Card key={channel.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigateToChannel(channel)}>
                                    <CardHeader>
                                        <div className="flex items-center space-x-2">
                                            <Hash className="h-5 w-5" />
                                            <CardTitle>{channel.name}</CardTitle>
                                        </div>
                                        {channel.description && (
                                            <CardDescription>{channel.description}</CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardFooter>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="mr-1 h-4 w-4" />
                                            <span>{channel.members?.length || 0} members</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Private Channels */}
                {privateChannels.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Private Channels</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {privateChannels.map(channel => (
                                <Card key={channel.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigateToChannel(channel)}>
                                    <CardHeader>
                                        <div className="flex items-center space-x-2">
                                            <Lock className="h-5 w-5" />
                                            <CardTitle>{channel.name}</CardTitle>
                                        </div>
                                        {channel.description && (
                                            <CardDescription>{channel.description}</CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardFooter>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="mr-1 h-4 w-4" />
                                            <span>{channel.members?.length || 0} members</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Direct Messages */}
                {directMessages.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Direct Messages</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {directMessages.map(channel => (
                                <Card key={channel.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigateToChannel(channel)}>
                                    <CardHeader>
                                        <div className="flex items-center space-x-2">
                                            <MessageSquare className="h-5 w-5" />
                                            <CardTitle>{channel.name}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardFooter>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="mr-1 h-4 w-4" />
                                            <span>{channel.members?.length || 0} members</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                
                {publicChannels.length === 0 && privateChannels.length === 0 && directMessages.length === 0 && (
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold mb-2">No channels yet</h2>
                        <p className="text-muted-foreground mb-6">Create a channel to start chatting with your team</p>
                        <Button onClick={() => setIsCreateChannelOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Your First Channel
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
