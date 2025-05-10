import { Channel, User } from '@/types';
import { Hash, Lock, MessageSquare, Info, Users, Pin, Bell, Settings } from 'lucide-react';
import { ChannelMembers } from './channel-members';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

interface ChannelHeaderProps {
    channel: Channel;
    currentUser?: User;
}

export function ChannelHeader({ channel, currentUser }: ChannelHeaderProps) {
    // Get channel icon based on type
    const getChannelIcon = () => {
        if (channel.type === 'direct') return <MessageSquare className="h-5 w-5" />;
        return channel.is_private ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" />;
    };
    
    return (
        <header className="border-b bg-card/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                            {getChannelIcon()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">{channel.name}</h1>
                                {channel.is_private && (
                                    <Badge variant="outline" className="px-2 py-0 text-xs">Private</Badge>
                                )}
                            </div>
                            {channel.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-md">{channel.description}</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                                    <Info className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>Channel details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                                    <Pin className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>Pinned messages</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                                    <Bell className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>Notification preferences</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <Separator orientation="vertical" className="mx-1 h-6" />
                    
                    {currentUser && (
                        <div className="flex items-center gap-2">
                            <ChannelMembers channel={channel} currentUser={currentUser} />
                            
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p>Channel settings</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
