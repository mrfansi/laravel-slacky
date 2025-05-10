import { useState } from 'react';
import { Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Paperclip, Reply, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageReactions } from './message-reactions';
import { ThreadReplies } from './thread-replies';
import { FilePreview } from './file-preview';

interface MessageItemProps {
    message: Message;
    currentUser: User;
    onReply?: (message: Message) => void;
    showThread?: boolean;
    isThreadView?: boolean;
}

export function MessageItem({ message, currentUser, onReply, showThread = true, isThreadView = false }: MessageItemProps) {
    const [isThreadOpen, setIsThreadOpen] = useState(false);
    const [reactions, setReactions] = useState<Record<string, { count: number; users: User[] }>>({});
    
    // Format timestamp
    const formatTime = (timestamp: string) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };
    
    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };
    
    // Check if the message is from the current user
    const isCurrentUser = message.user_id === currentUser.id;
    
    // Handle opening thread replies
    const handleOpenThread = () => {
        setIsThreadOpen(true);
    };
    
    // Handle reaction updates
    const handleReactionUpdate = (updatedReactions: Record<string, { count: number; users: User[] }>) => {
        setReactions(updatedReactions);
    };
    
    return (
        <>
            <div className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''} md:flex-row md:gap-3`}>
                <div className="flex-shrink-0 hidden md:block">
                    <Avatar>
                        <AvatarImage src={isCurrentUser ? currentUser.avatar : message.user?.avatar} />
                        <AvatarFallback>{getInitials(isCurrentUser ? currentUser.name : (message.user?.name || 'User'))}</AvatarFallback>
                    </Avatar>
                </div>
                
                <div className={`flex-1 max-w-full md:max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="md:hidden">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={isCurrentUser ? currentUser.avatar : message.user?.avatar} />
                                    <AvatarFallback className="text-xs">{getInitials(isCurrentUser ? currentUser.name : (message.user?.name || 'User'))}</AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="font-medium text-sm">{isCurrentUser ? 'You' : message.user?.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                        {message.updated_at !== message.created_at && (
                            <span className="text-xs text-muted-foreground italic">(edited)</span>
                        )}
                    </div>
                    
                    <div className={`mt-1 rounded-lg p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} break-words`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {/* File attachments with preview */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {message.attachments.map(attachment => (
                                <FilePreview key={attachment.id} attachment={attachment} />
                            ))}
                        </div>
                    )}
                    
                    {/* Message reactions */}
                    <MessageReactions 
                        messageId={message.id} 
                        initialReactions={reactions} 
                        currentUserId={currentUser.id} 
                        onReactionUpdate={handleReactionUpdate}
                    />
                    
                    {/* Thread and reply actions */}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        {showThread && !isThreadView && message.thread_reply_count && message.thread_reply_count > 0 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs" 
                                onClick={handleOpenThread}
                            >
                                <MessageSquare className="mr-1 h-3 w-3" />
                                {message.thread_reply_count} {message.thread_reply_count === 1 ? 'reply' : 'replies'}
                            </Button>
                        )}
                        
                        {onReply && !isThreadView && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs" 
                                onClick={() => onReply(message)}
                            >
                                <Reply className="mr-1 h-3 w-3" />
                                Reply
                            </Button>
                        )}
                        
                        {showThread && !isThreadView && (!message.thread_reply_count || message.thread_reply_count === 0) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs" 
                                onClick={handleOpenThread}
                            >
                                <MessageSquare className="mr-1 h-3 w-3" />
                                Start thread
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Thread replies dialog */}
            {showThread && !isThreadView && (
                <ThreadReplies 
                    message={message} 
                    currentUser={currentUser} 
                    isOpen={isThreadOpen} 
                    onClose={() => setIsThreadOpen(false)} 
                />
            )}
        </>
    );
}
