import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { User } from '@/types';
import axios from 'axios';
import { SmilePlus } from 'lucide-react';

interface Reaction {
  emoji: string;
  count: number;
  users: User[];
}

interface MessageReactionsProps {
  messageId: number;
  initialReactions?: Record<string, { count: number; users: User[] }>;
  currentUserId: number;
  onReactionUpdate?: (reactions: Record<string, { count: number; users: User[] }>) => void;
}

// Common emojis for quick access
const commonEmojis = ['👍', '❤️', '😂', '🎉', '🙏', '👀', '🔥', '✅'];

export function MessageReactions({ messageId, initialReactions = {}, currentUserId, onReactionUpdate }: MessageReactionsProps) {
  const [reactions, setReactions] = useState<Record<string, { count: number; users: User[] }>>(initialReactions);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch reactions when the component mounts
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await axios.get(`/api/messages/${messageId}/reactions`);
        setReactions(response.data.reactions || {});
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };

    if (Object.keys(initialReactions).length === 0) {
      fetchReactions();
    } else {
      setReactions(initialReactions);
    }
  }, [messageId, initialReactions]);

  // Toggle a reaction
  const toggleReaction = async (emoji: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/messages/${messageId}/reactions`, { emoji });
      setReactions(response.data.reactions || {});
      if (onReactionUpdate) {
        onReactionUpdate(response.data.reactions || {});
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the current user has reacted with a specific emoji
  const hasUserReacted = (emoji: string) => {
    return reactions[emoji]?.users.some(user => user.id === currentUserId) || false;
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {/* Display existing reactions */}
      {Object.entries(reactions).map(([emoji, { count, users }]) => (
        <TooltipProvider key={emoji}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={hasUserReacted(emoji) ? "secondary" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs gap-1 rounded-full"
                onClick={() => toggleReaction(emoji)}
                disabled={isLoading}
              >
                <span>{emoji}</span>
                <span className="text-xs">{count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                {users.map(user => user.name).join(', ')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* Add reaction button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full"
            disabled={isLoading}
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {commonEmojis.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  toggleReaction(emoji);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
