import { useState, useEffect, useRef } from 'react';
import { Message, User } from '@/types';
import { MessageItem } from './message-item';
import { MessageInput } from './message-input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from './ui/sheet';
import { MessageSquare, X } from 'lucide-react';
import axios from 'axios';

interface ThreadRepliesProps {
  message: Message;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ThreadReplies({ message, currentUser, isOpen, onClose }: ThreadRepliesProps) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch thread replies when the component mounts or the message changes
  useEffect(() => {
    const fetchReplies = async () => {
      if (!message?.id || !isOpen) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/messages/${message.id}/replies`);
        setReplies(response.data.data || []);
      } catch (error) {
        console.error('Error fetching thread replies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
  }, [message?.id, isOpen]);

  // Scroll to bottom when new replies are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [replies]);

  // Handle sending a reply
  const handleSendReply = async (content: string, attachments?: File[]) => {
    if (!message?.id) return;
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append('attachments[]', file);
        });
      }
      
      const response = await axios.post(`/api/messages/${message.id}/replies`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Add the new reply to the list
      setReplies(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[400px] md:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Thread
              </SheetTitle>
              <SheetDescription className="text-sm mt-1">
                {message?.thread_reply_count || 0} replies
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Original message */}
          <div className="p-4 border-b bg-muted/30">
            <MessageItem 
              message={message} 
              currentUser={currentUser} 
              showThread={false}
              isThreadView
            />
          </div>
          
          {/* Replies */}
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <p className="text-sm text-muted-foreground">Loading replies...</p>
                </div>
              ) : replies.length === 0 ? (
                <div className="flex justify-center py-4">
                  <p className="text-sm text-muted-foreground">No replies yet. Start the conversation!</p>
                </div>
              ) : (
                replies.map(reply => (
                  <MessageItem 
                    key={reply.id} 
                    message={reply} 
                    currentUser={currentUser} 
                    showThread={false}
                    isThreadView
                  />
                ))
              )}
            </div>
          </ScrollArea>
          
          {/* Reply input */}
          <div className="p-4 border-t mt-auto">
            <MessageInput 
              channelId={message?.channel_id} 
              placeholder="Reply in thread..."
              onSendMessage={handleSendReply}
              compact
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
