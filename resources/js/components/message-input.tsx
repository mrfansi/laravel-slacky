import { Channel } from '@/types';
import { Send, Paperclip, X, Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useRef, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface MessageInputProps {
    channel: Channel | number;  // Can accept either Channel object or channel ID
    onMessageSent?: () => void;
    onSendMessage?: (content: string, attachments?: File[]) => void;  // Alternative callback for thread replies
    parentMessageId?: number | null;
    placeholder?: string;
    onTyping?: () => void;
    compact?: boolean;  // For more compact display in thread view
}

export function MessageInput({ 
    channel, 
    onMessageSent, 
    onSendMessage,
    parentMessageId = null,
    placeholder = 'Type a message...',
    onTyping,
    compact = false
}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Get channel ID from either Channel object or direct ID
    const getChannelId = (): number => {
        return typeof channel === 'number' ? channel : channel.id;
    };
    
    // Handle sending a message
    const sendMessage = async () => {
        if (!message.trim() && files.length === 0) return;
        
        setIsLoading(true);
        
        try {
            // If we have a direct callback for sending messages (used in thread replies)
            if (onSendMessage) {
                await onSendMessage(message, files.length > 0 ? files : undefined);
                setMessage('');
                setFiles([]);
                return;
            }
            
            const channelId = getChannelId();
            const formData = new FormData();
            formData.append('content', message);
            formData.append('type', 'text');
            
            if (parentMessageId) {
                formData.append('parent_message_id', parentMessageId.toString());
            }
            
            // Add any files as attachments
            files.forEach(file => {
                formData.append('attachments[]', file);
            });
            
            await axios.post(`/api/channels/${channelId}/messages`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // Clear the input and files
            setMessage('');
            setFiles([]);
            
            // Notify parent component that a message was sent
            if (onMessageSent) {
                onMessageSent();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle file selection
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };
    
    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };
    
    // Remove a file from the list
    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    // Handle typing notification
    const handleTyping = () => {
        if (onTyping) {
            onTyping();
        }
    };
    
    // Track typing timeout
    useEffect(() => {
        let typingTimeout: NodeJS.Timeout | null = null;
        
        if (message.trim() && onTyping) {
            typingTimeout = setTimeout(() => {
                handleTyping();
            }, 500);
        }
        
        return () => {
            if (typingTimeout) clearTimeout(typingTimeout);
        };
    }, [message]);
    
    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    
    // Get channel name for placeholder
    const getChannelName = (): string => {
        if (typeof channel === 'number') {
            return 'channel';
        }
        return channel.name || 'channel';
    };
    
    return (
        <div className="relative">
            {/* File input (hidden) */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileChange}
            />
            
            {/* File preview */}
            {files.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 pl-2"
                        >
                            <Paperclip className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() => removeFile(index)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
            
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <Input
                        placeholder={placeholder || `Message #${getChannelName()}`}
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            compact ? 'h-9 px-3 py-1' : 'h-10',
                            'pr-24'
                        )}
                        disabled={isLoading}
                    />
                    
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        {/* Only show file attachment button on non-compact view or on larger screens */}
                        {(!compact || (typeof window !== 'undefined' && window.innerWidth > 640)) && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-foreground rounded-full"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isLoading}
                                        >
                                            <Paperclip className={cn(
                                                compact ? 'h-4 w-4' : 'h-5 w-5'
                                            )} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Attach files</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        
                        {/* Only show emoji button on non-compact view or on larger screens */}
                        {(!compact || (typeof window !== 'undefined' && window.innerWidth > 768)) && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-foreground rounded-full"
                                            disabled={isLoading}
                                        >
                                            <Smile className={cn(
                                                compact ? 'h-4 w-4' : 'h-5 w-5'
                                            )} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Add emoji</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
                
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="submit"
                                size={compact ? 'sm' : 'icon'}
                                onClick={sendMessage}
                                disabled={isLoading || (!message.trim() && files.length === 0)}
                                className={cn(
                                    "flex-shrink-0 rounded-full",
                                    (!message.trim() && files.length === 0) ? "opacity-50" : "opacity-100"
                                )}
                            >
                                <Send className={cn(
                                    compact ? 'h-4 w-4' : 'h-5 w-5'
                                )} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Send message</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
