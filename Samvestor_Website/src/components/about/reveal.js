import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Lusion-style text reveal: the element is split into lines, each line
   masked, and the lines rise into view one after another as the element
   scrolls in. Re-splits on resize (autoSplit), so wrapping stays correct.
   Call inside a gsap.context so it's cleaned up with the component. */
export function revealLines(el, { start = 'top 85%', stagger = 0.08, duration = 1 } = {}) {
    if (!el) return null;
    if (prefersReducedMotion()) return null;
    return SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
            gsap.from(self.lines, {
                yPercent: 110,
                duration,
                stagger,
                ease: 'expo.out',
                scrollTrigger: { trigger: el, start, once: true },
            }),
    });
}

/* Scramble text into place (the "TEAM" treatment): random glyphs settle
   left to right into the real word. */
export function scrambleIn(el, { duration = 1.1, chars = '!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ' } = {}) {
    if (!el) return;
    const final = el.textContent;
    if (prefersReducedMotion()) {
        el.textContent = final;
        return;
    }
    const state = { p: 0 };
    gsap.to(state, {
        p: 1,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
            const settled = Math.floor(state.p * final.length);
            el.textContent = final
                .split('')
                .map((ch, i) => (i < settled || ch === ' ' ? ch : chars[Math.floor(Math.random() * chars.length)]))
                .join('');
        },
        onComplete: () => {
            el.textContent = final;
        },
    });
}
