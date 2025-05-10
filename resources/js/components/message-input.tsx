import { Channel } from '@/types';
import { Send, Paperclip, X, Smile, Image } from 'lucide-react';
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
            
            await axios.post(`/api/channels/${channel.id}/messages`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Clear input and files after sending
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
    
    return (
        <div className="border rounded-lg p-4 shadow-sm bg-card">
            {/* File attachments preview */}
            {files.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                        <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 py-1.5 px-3"
                        >
                            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="max-w-[150px] truncate text-xs">{file.name}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="ml-1 h-4 w-4 rounded-full hover:bg-destructive/10 hover:text-destructive" 
                                onClick={() => removeFile(index)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
            
            {/* Message input */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handleFileSelect}
                                    disabled={isLoading}
                                    className="text-muted-foreground hover:text-foreground rounded-full"
                                >
                                    <Paperclip className="h-5 w-5" />
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        multiple 
                                        onChange={handleFileChange}
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Attach files</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-muted-foreground hover:text-foreground rounded-full"
                                    disabled={isLoading}
                                >
                                    <Image className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Add image</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                
                <Input
                    placeholder={placeholder || `Message #${channel.name}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    disabled={isLoading}
                    className={cn(
                        "flex-1 border-muted bg-background/50 focus-visible:ring-1 focus-visible:ring-ring",
                        "transition-all duration-200 ease-in-out"
                    )}
                />
                
                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-muted-foreground hover:text-foreground rounded-full"
                                    disabled={isLoading}
                                >
                                    <Smile className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Add emoji</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    onClick={sendMessage} 
                                    disabled={(!message.trim() && files.length === 0) || isLoading}
                                    variant="default"
                                    size="icon"
                                    className={cn(
                                        "rounded-full transition-all duration-200",
                                        (!message.trim() && files.length === 0) ? "opacity-50" : "opacity-100"
                                    )}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Send message</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}
