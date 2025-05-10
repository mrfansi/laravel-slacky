import { Channel, PresenceChannel } from 'laravel-echo';

interface Echo {
    private(channel: string): Channel;
    join(channel: string): PresenceChannel;
    leave(channel: string): void;
}

declare global {
    interface Window {
        Echo: Echo;
    }
}
