import { ChannelHeader } from '@/components/channel-header';
import { MessageInput } from '@/components/message-input';
import { MessageItem } from '@/components/message-item';
import { TypingIndicator } from '@/components/typing-indicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLayout from '@/layouts/app-layout';
import { Channel, Message, User } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

interface Props {
    auth: {
        user: User;
    };
    channel: Channel;
}

export default function ChannelView({ auth, channel }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
    const [typingUsers, setTypingUsers] = useState<User[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Extract channel ID and user ID to use as dependencies
    const channelId = channel?.id;
    const userId = auth?.user?.id;

    // Fetch messages on component mount and when channel changes
    useEffect(() => {
        if (!channelId) return;

        fetchMessages();

        // Clean up function to leave channels when component unmounts
        return () => {
            if (typeof window !== 'undefined' && window.Echo) {
                window.Echo.leave(`private-channel.${channelId}`);
                window.Echo.leave(`presence-channel.${channelId}`);
            }
        };
    }, [channelId]);

    // Set up Echo listeners in a separate effect to avoid recreating them on every message fetch
    useEffect(() => {
        // Only set up Echo if it's available
        if (typeof window === 'undefined' || !window.Echo || !channelId || !userId) return;

        console.log('Setting up Echo listeners for channel:', channelId);
        
        try {
            // Set up Echo to listen for new messages
            const privateChannel = window.Echo.private(`private-channel.${channelId}`);
            
            // Debug listener registration
            console.log('Registered listeners on private channel:', `private-channel.${channelId}`);
            
            privateChannel.listen('.message.sent', (e: any) => {
                console.log('Received message.sent event:', e);
                if (e.sender.id !== userId) {
                    setMessages((prev) => [...prev, e.message]);
                    scrollToBottom();
                }
            });
            
            privateChannel.listen('.message.updated', (e: any) => {
                console.log('Received message.updated event:', e);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === e.message.id ? { ...msg, content: e.message.content, updated_at: e.message.updated_at } : msg,
                    ),
                );
            });
            
            privateChannel.listen('.message.deleted', (e: any) => {
                console.log('Received message.deleted event:', e);
                setMessages((prev) => prev.filter((msg) => msg.id !== e.message_id));
            });

            // Set up presence channel for typing indicators
            const presenceChannel = window.Echo.join(`presence-channel.${channelId}`);
            
            // Debug presence channel
            console.log('Joined presence channel:', `presence-channel.${channelId}`);
            
            presenceChannel.here((users: any) => {
                console.log('Users in channel:', users);
            });
            
            presenceChannel.listen('.user.typing', (e: any) => {
                console.log('Received user.typing event:', e);
                if (e.user.id !== userId) {
                    const typingUser = e.user;
                    setTypingUsers((prev) => {
                        if (!prev.some((user) => user.id === typingUser.id)) {
                            return [...prev, typingUser];
                        }
                        return prev;
                    });

                    // Remove typing indicator after 3 seconds
                    setTimeout(() => {
                        setTypingUsers((prev) => prev.filter((user) => user.id !== typingUser.id));
                    }, 3000);
                }
            });
        } catch (error) {
            console.error('Error setting up Echo listeners:', error);
        }

        // Clean up function
        return () => {
            if (typeof window !== 'undefined' && window.Echo) {
                try {
                    // Leave the channels when component unmounts
                    window.Echo.leave(`private-channel.${channelId}`);
                    window.Echo.leave(`presence-channel.${channelId}`);
                } catch (error) {
                    console.error('Error cleaning up Echo listeners:', error);
                }
            }
        };
    }, [channelId, userId]);

    // Fetch messages from API
    const fetchMessages = async () => {
        if (!channelId) return;

        try {
            const response = await axios.get(`/api/channels/${channelId}/messages`);
            setMessages(response.data.data || []);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Handle replying to a message
    const handleReply = (message: Message) => {
        setReplyToMessage(message);
    };

    // Handle typing notification
    const handleTyping = () => {
        if (!channelId) return;
        axios.post(`/api/channels/${channelId}/typing`);
    };

    // Filter parent messages (not replies)
    const parentMessages = messages.filter((message) => !message.parent_message_id);

    // Group replies with their parent messages
    const messagesWithReplies = parentMessages.map((message) => {
        const replies = messages.filter((m) => m.parent_message_id === message.id);
        return { ...message, replies };
    });

    return (
        <AppLayout>
            <Head title={`Channel: ${channel.name}`} />

            <div className="mx-4 my-2 flex h-[calc(100vh-5rem)] flex-col">
                {/* Channel Header */}
                <ChannelHeader channel={channel} currentUser={auth.user} />

                {/* Messages Area */}
                <ScrollArea className="my-4 flex-1 rounded-md border p-6">
                    <div className="space-y-6">
                        {messagesWithReplies.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                                <p className="text-muted-foreground">No messages yet</p>
                                <p className="text-muted-foreground text-sm">Be the first to send a message!</p>
                            </div>
                        ) : (
                            messagesWithReplies.map((message) => (
                                <MessageItem key={message.id} message={message} currentUser={auth.user} onReply={handleReply} />
                            ))
                        )}

                        <TypingIndicator typingUsers={typingUsers} />

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Reply indicator */}
                {replyToMessage && (
                    <div className="bg-muted/50 mx-4 mb-2 rounded-md border p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-muted-foreground text-sm">Replying to </span>
                                <span className="text-sm font-medium">{replyToMessage.user?.name}</span>
                            </div>
                            <button
                                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1"
                                onClick={() => setReplyToMessage(null)}
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-muted-foreground mt-1 truncate text-sm">{replyToMessage.content}</p>
                    </div>
                )}

                {/* Message Input */}
                <MessageInput
                    channel={channel}
                    onMessageSent={fetchMessages}
                    parentMessageId={replyToMessage?.id || null}
                    placeholder={replyToMessage ? `Reply to ${replyToMessage.user?.name}...` : undefined}
                    onTyping={handleTyping}
                />
            </div>
        </AppLayout>
    );
}
