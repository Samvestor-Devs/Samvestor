'use client';

import { useId, useSyncExternalStore } from 'react';
import './ThemeToggle.css';

const STORAGE_KEY = 'sv-theme';

/* the theme lives on <html data-theme>; every toggle on the page (navbar +
   mobile menu) reads it from there, so they always agree */
const subscribe = (onChange) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
};
const getTheme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
const getServerTheme = () => 'dark';

export function setTheme(theme) {
    const root = document.documentElement;
    // ease colours across the whole page only while switching
    root.classList.add('theme-switching');
    root.dataset.theme = theme;
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // storage blocked (private mode) — the switch still applies for this visit
    }
    window.setTimeout(() => root.classList.remove('theme-switching'), 500);
}

/**
 * Sun / moon button that morphs between the two: in dark mode the sun's
 * core grows into a full disc, a masked circle slides in to carve the
 * crescent and the rays fold away; light mode reverses it.
 */
function ThemeToggle({ className = '' }) {
    const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
    const maskId = `theme-toggle-mask-${useId().replace(/:/g, '')}`;
    const next = theme === 'dark' ? 'light' : 'dark';

    return (
        <button
            type="button"
            className={`theme-toggle theme-toggle--${theme} ${className}`}
            aria-label={`Switch to ${next} mode`}
            title={`Switch to ${next} mode`}
            onClick={() => setTheme(next)}
        >
            <svg className="theme-toggle__svg" viewBox="0 0 24 24" aria-hidden="true">
                <mask id={maskId}>
                    <rect x="0" y="0" width="24" height="24" fill="#fff" />
                    <circle className="theme-toggle__cut" cx="18" cy="6" r="7" fill="#000" />
                </mask>
                <circle
                    className="theme-toggle__core"
                    cx="12"
                    cy="12"
                    r="8"
                    fill="currentColor"
                    mask={`url(#${maskId})`}
                />
                <g className="theme-toggle__rays" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <line x1="12" y1="2" x2="12" y2="4.5" />
                    <line x1="12" y1="19.5" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="4.5" y2="12" />
                    <line x1="19.5" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" />
                    <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" />
                    <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" />
                    <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" />
                </g>
            </svg>
        </button>
    );
}

export default ThemeToggle;
