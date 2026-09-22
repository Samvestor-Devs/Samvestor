'use client';

import { useSyncExternalStore } from 'react';

/* The current theme ('dark' | 'light'), live — it lives on <html data-theme>
   (set by the init script in app/layout.jsx and by ThemeToggle). Use this
   when something drawn in JS, like a WebGL globe, has to follow the theme. */
const subscribe = (onChange) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
};
const getTheme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
const getServerTheme = () => 'dark';

export default function useTheme() {
    return useSyncExternalStore(subscribe, getTheme, getServerTheme);
}
