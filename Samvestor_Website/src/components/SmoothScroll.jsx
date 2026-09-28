'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling, desktop only.
 *
 * Lenis moves the real scroll position rather than transforming a wrapper,
 * so `position: sticky` keeps working — which matters here, because the
 * service cards, the process image and the footer wordmark are all sticky.
 *
 * Touch is left alone on purpose: smoothing there fights the OS momentum and
 * the rubber-band at the ends of the page, and phones already feel right.
 *
 * Other components reach the instance through window.__lenis: the header's
 * section link scrolls through it, and the phone "Read more" sheet stops it
 * while the sheet is open.
 */
function SmoothScroll() {
    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return undefined;

        const mm = gsap.matchMedia();

        mm.add('(min-width: 901px) and (hover: hover)', () => {
            const lenis = new Lenis({
                duration: 0.9, // seconds to catch up to the real scroll position
                smoothWheel: true,
                syncTouch: false, // phones keep native scrolling
            });

            window.__lenis = lenis;

            // ScrollTrigger reads scroll on Lenis's beat, and Lenis runs on
            // gsap's ticker so there is one loop driving everything
            lenis.on('scroll', ScrollTrigger.update);
            const raf = (time) => lenis.raf(time * 1000);
            gsap.ticker.add(raf);
            // no catch-up frames after a stall — they make the scroll jump
            gsap.ticker.lagSmoothing(0);

            return () => {
                gsap.ticker.remove(raf);
                gsap.ticker.lagSmoothing(500, 33); // gsap's default
                lenis.destroy();
                if (window.__lenis === lenis) delete window.__lenis;
            };
        });

        return () => mm.revert();
    }, []);

    return null;
}

export default SmoothScroll;
