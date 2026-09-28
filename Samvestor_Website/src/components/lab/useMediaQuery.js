'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reads a media query as React state.
 *
 * Subscribing rather than setting state inside an effect: the query is an
 * external store, and writing it into state on mount costs a second render
 * on every page that asks.
 *
 * The server snapshot is always false — there is no viewport to measure
 * during the server render, and every caller here treats false as the
 * desktop / full-motion default.
 */
export default function useMediaQuery(query) {
    const subscribe = useCallback(
        (onChange) => {
            const mq = window.matchMedia(query);
            mq.addEventListener('change', onChange);
            return () => mq.removeEventListener('change', onChange);
        },
        [query]
    );

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
        () => false
    );
}
