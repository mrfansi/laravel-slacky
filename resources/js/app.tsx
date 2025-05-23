import '../css/app.css';

// Import Echo configuration first
import './echo';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { setupAxiosInterceptors, initializeEcho } from './utils/auth-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Set up axios interceptors for handling authentication errors
setupAxiosInterceptors();

// Initialize theme before React components are mounted
initializeTheme();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        // Initialize Echo before mounting React components
        if (typeof window !== 'undefined') {
            initializeEcho();
        }
        
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
