import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    last_seen_at: string | null;
    is_online: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Channel {
    id: number;
    name: string;
    description: string | null;
    creator_id: number;
    is_private: boolean;
    type: 'public' | 'private' | 'direct';
    created_at: string;
    updated_at: string;
    creator?: User;
    members?: ChannelMember[];
    pivot?: {
        role: 'admin' | 'member';
        joined_at: string;
    };
    [key: string]: unknown;
}

export interface ChannelMember {
    id: number;
    user_id: number;
    channel_id: number;
    joined_at: string;
    role: 'admin' | 'member';
    created_at: string;
    updated_at: string;
    user?: User;
    [key: string]: unknown;
}

export interface MessageReaction {
    id: number;
    message_id: number;
    user_id: number;
    emoji: string;
    created_at: string;
    updated_at: string;
    user?: User;
    [key: string]: unknown;
}

export interface Message {
    id: number;
    channel_id: number;
    user_id: number;
    parent_message_id: number | null;
    content: string;
    type: 'text' | 'image' | 'file';
    read_at: string | null;
    thread_reply_count: number;
    last_reply_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user?: User;
    attachments?: Attachment[];
    replies?: Message[];
    parent_message?: Message;
    reactions?: MessageReaction[];
    [key: string]: unknown;
}

export interface Attachment {
    id: number;
    message_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Notification {
    id: number;
    user_id: number;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
