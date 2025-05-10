import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileProps {
    user: User;
    showStatus?: boolean;
}

export function UserProfile({ user, showStatus = true }: UserProfileProps) {
    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };
    
    // Format last seen time
    const formatLastSeen = (timestamp: string | null) => {
        if (!timestamp) return 'Never';
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };
    
    return (
        <div className="flex items-center space-x-4">
            <div className="relative">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                
                {showStatus && (
                    <div 
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`}
                    />
                )}
            </div>
            
            <div>
                <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{user.name}</h4>
                    {user.is_online && showStatus && (
                        <Badge variant="outline" className="px-1 py-0 text-xs bg-green-500/10 text-green-500 border-green-500/20">
                            Online
                        </Badge>
                    )}
                </div>
                
                {!user.is_online && user.last_seen_at && showStatus && (
                    <p className="text-xs text-muted-foreground">
                        Last seen {formatLastSeen(user.last_seen_at)}
                    </p>
                )}
                
                {user.email && (
                    <p className="text-xs text-muted-foreground">
                        {user.email}
                    </p>
                )}
            </div>
        </div>
    );
}
