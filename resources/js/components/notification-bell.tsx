import { Notification, User } from '@/types';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Link } from '@inertiajs/react';

interface NotificationBellProps {
    user: User;
}

export function NotificationBell({ user }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    
    // Fetch notifications on component mount
    useEffect(() => {
        fetchNotifications();
        
        // Set up Echo to listen for new notifications if Echo is initialized
        let echoChannel: any = null;
        
        if (typeof window !== 'undefined' && window.Echo && user?.id) {
            try {
                echoChannel = window.Echo.private(`private-user.${user.id}`);
                echoChannel.listen('.notification.created', (e: any) => {
                    setNotifications(prev => [e.notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            } catch (error) {
                console.error('Error setting up Echo listener:', error);
            }
        }
        
        // Clean up function
        return () => {
            if (typeof window !== 'undefined' && window.Echo && user?.id && echoChannel) {
                window.Echo.leave(`private-user.${user.id}`);
            }
        };
    }, [user?.id]);
    
    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications');
            setNotifications(response.data.data || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
    
    // Mark notifications as read when popover is opened
    useEffect(() => {
        if (isOpen && unreadCount > 0) {
            markAllAsRead();
        }
    }, [isOpen]);
    
    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await axios.post('/api/notifications/mark-all-read');
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };
    
    // Format notification time
    const formatTime = (timestamp: string) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };
    
    // Get notification link based on type
    const getNotificationLink = (notification: Notification) => {
        switch (notification.type) {
            case 'message':
                return `/channels/${notification.data.channel_id}`;
            case 'channel_invitation':
                return `/channels/${notification.data.channel_id}`;
            default:
                return '#';
        }
    };
    
    // Get notification content based on type
    const getNotificationContent = (notification: Notification) => {
        switch (notification.type) {
            case 'message':
                return (
                    <div>
                        <p className="font-medium">{notification.data.sender_name} mentioned you in #{notification.data.channel_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{notification.data.message_preview}</p>
                    </div>
                );
            case 'channel_invitation':
                return (
                    <div>
                        <p className="font-medium">You were added to #{notification.data.channel_name}</p>
                        <p className="text-sm text-muted-foreground">by {notification.data.inviter_name}</p>
                    </div>
                );
            default:
                return <p>{notification.data.message || 'New notification'}</p>;
        }
    };
    
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b p-3">
                    <h4 className="font-medium">Notifications</h4>
                    {notifications.length > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map(notification => (
                                <Link 
                                    key={notification.id} 
                                    href={getNotificationLink(notification)}
                                    className="block p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            {getNotificationContent(notification)}
                                            <p className="text-xs text-muted-foreground">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>
                                        
                                        {!notification.read_at && (
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
