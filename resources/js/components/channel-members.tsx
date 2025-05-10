import { Channel, User } from '@/types';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { UserProfile } from './user-profile';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ChannelMembersProps {
    channel: Channel;
    currentUser: User;
}

export function ChannelMembers({ channel, currentUser }: ChannelMembersProps) {
    const [members, setMembers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Fetch channel members
    useEffect(() => {
        fetchMembers();
    }, [channel.id]);
    
    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/channels/${channel.id}/members`);
            setMembers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching channel members:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Search for users to add to the channel
    const searchUsers = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        
        setIsSearching(true);
        try {
            const response = await axios.get('/api/users/search', {
                params: { query: searchQuery }
            });
            
            // Filter out users who are already members
            const memberIds = members.map(member => member.id);
            const filteredResults = response.data.filter((user: User) => !memberIds.includes(user.id));
            
            setSearchResults(filteredResults);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };
    
    // Add a user to the channel
    const addMember = async (userId: number) => {
        try {
            await axios.post(`/api/channels/${channel.id}/members`, { user_id: userId });
            
            // Refresh members list
            fetchMembers();
            
            // Clear search results
            setSearchResults([]);
            setSearchQuery('');
            
            // Close dialog
            setIsAddMemberOpen(false);
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };
    
    // Remove a user from the channel
    const removeMember = async (userId: number) => {
        try {
            await axios.delete(`/api/channels/${channel.id}/members/${userId}`);
            
            // Refresh members list
            fetchMembers();
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };
    
    // Check if current user is the channel creator
    const isCreator = channel.creator_id === currentUser.id;
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Users className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Channel Members</SheetTitle>
                    <SheetDescription>
                        {members.length} {members.length === 1 ? 'member' : 'members'} in #{channel.name}
                    </SheetDescription>
                </SheetHeader>
                
                {/* Add member button (only visible to channel creator) */}
                {isCreator && (
                    <div className="py-4">
                        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Members
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Members</DialogTitle>
                                    <DialogDescription>
                                        Add new members to the #{channel.name} channel.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="search">Search Users</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="search"
                                                placeholder="Search by name or email"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        searchUsers();
                                                    }
                                                }}
                                            />
                                            <Button onClick={searchUsers} disabled={isSearching || !searchQuery.trim()}>
                                                Search
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Search results */}
                                    {searchResults.length > 0 ? (
                                        <ScrollArea className="h-[200px]">
                                            <div className="space-y-4">
                                                {searchResults.map(user => (
                                                    <div key={user.id} className="flex items-center justify-between">
                                                        <UserProfile user={user} showStatus={false} />
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => addMember(user.id)}
                                                        >
                                                            Add
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    ) : searchQuery && !isSearching ? (
                                        <p className="text-center text-muted-foreground py-4">
                                            No users found matching '{searchQuery}'
                                        </p>
                                    ) : null}
                                </div>
                                
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                                        Done
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                
                {/* Members list */}
                {isLoading ? (
                    <div className="py-4 text-center">
                        <p className="text-muted-foreground">Loading members...</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[calc(100vh-200px)]">
                        <div className="space-y-4 py-4">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <UserProfile user={member} />
                                    
                                    {/* Remove button (only visible to creator and not for self) */}
                                    {isCreator && member.id !== currentUser.id && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeMember(member.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </SheetContent>
        </Sheet>
    );
}
