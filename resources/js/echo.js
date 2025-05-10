import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Enable debug mode for troubleshooting
Pusher.logToConsole = true;

// Determine if we're in a development environment
const isDev = window.location.hostname === 'laravel-slacky.test' || 
              window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1';

// Configure Echo based on environment
const options = {
    broadcaster: 'pusher',
    key: 'i7tjdhzh6ozqjwgc1u2p',
    // Always provide a cluster value (required by Pusher)
    cluster: 'mt1',
    // Use direct connection to local Reverb server in development
    wsHost: isDev ? '127.0.0.1' : import.meta.env.VITE_REVERB_HOST,
    wsPort: isDev ? 6001 : import.meta.env.VITE_REVERB_PORT,
    // No TLS for local development
    forceTLS: !isDev,
    encrypted: !isDev,
    disableStats: true,
    enabledTransports: isDev ? ['ws'] : ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    // Add CORS support
    cors: true
};

console.log('Echo configuration:', options);

window.Echo = new Echo(options);
