import { Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Paperclip, Reply } from 'lucide-react';
import { Button } from './ui/button';

interface MessageItemProps {
    message: Message;
    currentUser: User;
    onReply?: (message: Message) => void;
}

export function MessageItem({ message, currentUser, onReply }: MessageItemProps) {
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
    
    return (
        <div className={`flex items-start space-x-3 ${isCurrentUser ? 'justify-end' : ''}`}>
            {!isCurrentUser && (
                <Avatar>
                    <AvatarImage src={message.user?.avatar} />
                    <AvatarFallback>{getInitials(message.user?.name || 'User')}</AvatarFallback>
                </Avatar>
            )}
            
            <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : ''}`}>
                <div className="flex items-baseline space-x-2">
                    {!isCurrentUser && <span className="font-medium">{message.user?.name}</span>}
                    <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                </div>
                
                <div className={`mt-1 rounded-lg p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p>{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {message.attachments.map(attachment => (
                                <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                                    <Paperclip className="h-4 w-4" />
                                    <a 
                                        href={`/storage/${attachment.file_path}`} 
                                        target="_blank" 
                                        className={`hover:underline ${isCurrentUser ? 'text-primary-foreground' : 'text-blue-500'}`}
                                    >
                                        {attachment.file_name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {onReply && (
                    <div className="mt-1 flex justify-end">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs" 
                            onClick={() => onReply(message)}
                        >
                            <Reply className="mr-1 h-3 w-3" />
                            Reply
                        </Button>
                    </div>
                )}
                
                {/* Show replies if any */}
                {message.replies && message.replies.length > 0 && (
                    <div className="mt-2 space-y-2 pl-4 border-l-2 border-muted">
                        {message.replies.map(reply => (
                            <div key={reply.id} className="flex items-start space-x-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={reply.user?.avatar} />
                                    <AvatarFallback className="text-xs">{getInitials(reply.user?.name || 'User')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-sm font-medium">{reply.user?.name}</span>
                                        <span className="text-xs text-muted-foreground">{formatTime(reply.created_at)}</span>
                                    </div>
                                    <p className="text-sm">{reply.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {isCurrentUser && (
                <Avatar>
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
