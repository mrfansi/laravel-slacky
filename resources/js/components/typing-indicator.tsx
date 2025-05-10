import { User } from '@/types';
import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
    typingUsers: User[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    const [dots, setDots] = useState('.');
    
    // Animate the dots
    useEffect(() => {
        if (typingUsers.length === 0) return;
        
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '.') return '..';
                if (prev === '..') return '...';
                return '.';
            });
        }, 500);
        
        return () => clearInterval(interval);
    }, [typingUsers.length]);
    
    if (typingUsers.length === 0) return null;
    
    // Format the typing message based on the number of users typing
    const getTypingMessage = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0].name} is typing${dots}`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].name} and ${typingUsers[1].name} are typing${dots}`;
        } else if (typingUsers.length === 3) {
            return `${typingUsers[0].name}, ${typingUsers[1].name}, and ${typingUsers[2].name} are typing${dots}`;
        } else {
            return `${typingUsers.length} people are typing${dots}`;
        }
    };
    
    return (
        <div className="text-sm text-muted-foreground italic py-2">
            {getTypingMessage()}
        </div>
    );
}
