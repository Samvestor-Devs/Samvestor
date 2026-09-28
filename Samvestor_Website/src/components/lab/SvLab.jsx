'use client';

import { useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INTRO } from './svTiming';
import useMediaQuery from './useMediaQuery';
import './SvLab.css';

gsap.registerPlugin(ScrollTrigger);

// WebGL has no server render — and skipping SSR keeps the canvas out of the
// hydration pass entirely
const SvMonogram = dynamic(() => import('./SvMonogram'), { ssr: false });

/* Every word below already lives on the site: the hero, the About manifesto,
   and the five figures from "Built on Measurable Growth & Execution". */
const STATS = [
    { value: '₹450 Cr+', label: 'Trackable Revenue Managed' },
    { value: '100+', label: 'Full-Time Team Members' },
    { value: '7+', label: 'Years of Operations' },
    { value: '3+', label: 'Years Average Brand Tenure' },
    { value: '11.25%', label: 'Creative Launch Rate' },
];

const RAIL = ['The Mark', 'The Belief', 'The Proof', 'The Invitation'];

/* When each beat owns the screen, as a fraction of the scroll track. The 3D
   choreography reads the same windows — one clock for both. */
const BEATS = [
    { in: [0, 0], out: [0.2, 0.27] },
    { in: [0.26, 0.34], out: [0.46, 0.52] },
    { in: [0.54, 0.62], out: [0.72, 0.77] },
    { in: [0.82, 0.9], out: [1.2, 1.3] }, // past the end: the last beat stays
];

/**
 * The slot a 3D letter stands in. The glyph itself is laid out normally so
 * the line measures and wraps exactly as it would in flat type; it is only
 * painted once the extrusion has left. The zero-width anchor beside it is
 * what the scene measures: an inline-block of height 1em sits its bottom
 * edge on the baseline, which hands over the pen position, the baseline and
 * the em in a single rect — no font metrics to guess at.
 */
function Slot({ letter }) {
    return (
        <span className="svslot" data-slot={letter}>
            <i className="svslot__anchor" aria-hidden="true" />
            <span className="svslot__flat">{letter}</span>
        </span>
    );
}

function SvLab() {
    const rootRef = useRef(null);
    const progress = useRef(0);
    const intro = useRef({ running: false, start: 0 });
    const slots = useRef({ S: null, V: null });
    const staticMode = useMediaQuery('(prefers-reduced-motion: reduce)');

    /* the scene asks for these every frame; re-measured whenever the line
       could have moved (resize, and once the webfont has actually landed) */
    const measure = useCallback(() => {
        const root = rootRef.current;
        if (!root) return;
        root.querySelectorAll('.svslot').forEach((slot) => {
            const anchor = slot.querySelector('.svslot__anchor');
            slots.current[slot.dataset.slot] = anchor.getBoundingClientRect();
        });
    }, []);

    useEffect(() => {
        measure();
        window.addEventListener('resize', measure);
        if (document.fonts?.ready) document.fonts.ready.then(measure);
        return () => window.removeEventListener('resize', measure);
    }, [measure]);

    useEffect(() => {
        if (staticMode) {
            // no pin and no scrub: the beats stack and read as a normal page,
            // with the mark formed and facing the reader behind them
            progress.current = 0.3;
            intro.current.running = true;
            return undefined;
        }

        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(rootRef);
            const beats = q('.svbeat');

            gsap.set(beats.slice(1), { autoAlpha: 0, y: 40 });
            gsap.set([q('.svbeat--hero > *'), q('.svlab__chrome')], { autoAlpha: 0 });
            gsap.set(q('.svslot__flat'), { autoAlpha: 0 });

            // ---- the opening, on the same clock as the scene -------------
            const d = INTRO.duration;
            const open = gsap.timeline({ paused: true });
            open
                // the mark loads alone: the count and the hairline fill under it
                .to('.svload__bar-fill', { scaleX: 1, duration: d * INTRO.holdEnd, ease: 'power1.inOut' }, 0)
                .to('.svload__count', { innerText: 100, duration: d * INTRO.holdEnd, ease: 'power1.inOut', snap: { innerText: 1 } }, 0)
                .to('.svload', { autoAlpha: 0, duration: d * 0.1 }, d * (INTRO.holdEnd + 0.03))
                // the overlay sweeps up over everything...
                .fromTo(
                    '.svwipe',
                    { scaleY: 0, transformOrigin: '50% 100%' },
                    { scaleY: 1, duration: d * 0.11, ease: 'power3.inOut' },
                    d * 0.55
                )
                // ...the letters take their places in the headline behind it,
                // and the hero is simply already there when it lifts
                .set(q('.svbeat--hero > *'), { autoAlpha: 1, y: 0 }, d * 0.66)
                .to('.svwipe', { scaleY: 0, transformOrigin: '50% 0%', duration: d * 0.13, ease: 'power3.inOut' }, d * 0.72)
                .to(q('.svlab__chrome'), { autoAlpha: 1, duration: d * 0.16 }, d * 0.86);

            const start = () => {
                measure(); // the headline is on screen now, so its slots are real
                intro.current.running = true;
                open.play(0);
            };

            // wait for the site splash, if there is one up
            const splashUp = () => {
                const el = document.querySelector('.preloader');
                return el && !el.classList.contains('preloader--exit');
            };
            let mo;
            if (splashUp()) {
                mo = new MutationObserver(() => {
                    if (splashUp()) return;
                    mo.disconnect();
                    start();
                });
                mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
            } else {
                start();
            }

            // ---- the scroll ---------------------------------------------
            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    // Lenis already smooths the scroll itself, so this only
                    // needs enough lag to round off the sampling
                    scrub: 0.4,
                    onUpdate: (self) => {
                        progress.current = self.progress;
                    },
                },
            });

            // the master timeline is exactly 1 long, so every position below
            // reads as a fraction of the whole track
            tl.to({}, { duration: 1 }, 0);

            // the flat glyphs take over as the extrusions leave the words —
            // otherwise the headline is left with two holes in it
            tl.to(q('.svslot__flat'), { autoAlpha: 1, duration: 0.06 }, 0.09);

            beats.forEach((beat, i) => {
                const win = BEATS[i];
                if (i > 0) {
                    tl.fromTo(
                        beat,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: win.in[1] - win.in[0], ease: 'power2.out' },
                        win.in[0]
                    );
                }
                if (win.out[0] < 1) {
                    tl.to(beat, { autoAlpha: 0, y: -40, duration: win.out[1] - win.out[0], ease: 'power2.in' }, win.out[0]);
                }
            });

            // the rail: each label lights while its beat owns the screen
            q('.svrail__item').forEach((item, i) => {
                const win = BEATS[i];
                const startAt = i === 0 ? 0 : win.in[0];
                const endAt = win.out[0] < 1 ? win.out[1] : 1;
                tl.fromTo(item, { opacity: 0.28 }, { opacity: 1, duration: 0.04 }, startAt);
                if (endAt < 1) tl.to(item, { opacity: 0.28, duration: 0.04 }, endAt);
            });

            tl.fromTo(q('.svlab__bar-fill'), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);

            // the figures deal in one after another while the third beat holds
            tl.fromTo(
                q('.svstat'),
                { autoAlpha: 0, y: 26 },
                { autoAlpha: 1, y: 0, duration: 0.04, stagger: 0.018, ease: 'power2.out' },
                0.56
            );

            return () => mo?.disconnect();
        }, rootRef);

        return () => ctx.revert();
    }, [measure, staticMode]);

    return (
        <main className={`svlab${staticMode ? ' svlab--static' : ''}`} ref={rootRef}>
            <div className="svlab__stage">
                <SvMonogram progress={progress} intro={intro} slots={slots} />

                <div className="svlab__grain" aria-hidden="true" />
                <div className="svlab__vignette" aria-hidden="true" />

                <div className="svlab__beats">
                    {/* 1 — the hero the mark resolves into */}
                    <section className="svbeat svbeat--center svbeat--hero">
                        <span className="svbeat__scrim" aria-hidden="true" />
                        <p className="svbeat__eyebrow">Samvestor</p>
                        <h1 className="svbeat__title">
                            Be A <Slot letter="S" />
                            mart
                            <br />
                            In
                            <Slot letter="V" />
                            estor
                        </h1>
                        <span className="svbeat__rule" aria-hidden="true" />
                        <p className="svbeat__sub">
                            Data-led strategy, performance marketing and relentless execution — built
                            into one mark.
                        </p>
                        <p className="svbeat__cue">Scroll</p>
                    </section>

                    {/* 2 — the belief */}
                    <section className="svbeat svbeat--left">
                        <span className="svbeat__scrim" aria-hidden="true" />
                        <p className="svbeat__eyebrow">How we think</p>
                        <h2 className="svbeat__quote">
                            Most agencies celebrate impressions.
                            <em> We celebrate bank transfers.</em>
                        </h2>
                        <p className="svbeat__sub">
                            Every founder who walks through our door gets one promise — we treat your
                            money like it is ours.
                        </p>
                    </section>

                    {/* 3 — the proof */}
                    <section className="svbeat svbeat--right">
                        <span className="svbeat__scrim" aria-hidden="true" />
                        <p className="svbeat__eyebrow">The record</p>
                        <h2 className="svbeat__head">
                            Built on measurable
                            <br />
                            growth &amp; execution
                        </h2>
                        <ul className="svstats">
                            {STATS.map((stat) => (
                                <li className="svstat" key={stat.label}>
                                    <span className="svstat__value">{stat.value}</span>
                                    <span className="svstat__label">{stat.label}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 4 — the invitation */}
                    <section className="svbeat svbeat--center">
                        <span className="svbeat__scrim" aria-hidden="true" />
                        <p className="svbeat__eyebrow">What happens next</p>
                        <h2 className="svbeat__title svbeat__title--close">
                            Growth measured
                            <br />
                            in crores
                        </h2>
                        <span className="svbeat__rule" aria-hidden="true" />
                        <p className="svbeat__sub">Not clicks. If that is the number you care about, you are in the right place.</p>
                        <a className="svbeat__cta" href="#">
                            Book A Call
                        </a>
                    </section>
                </div>

                <div className="svlab__chrome">
                    <ol className="svrail" aria-hidden="true">
                        {RAIL.map((label) => (
                            <li className="svrail__item" key={label}>
                                <i />
                                {label}
                            </li>
                        ))}
                    </ol>

                    <div className="svlab__bar" aria-hidden="true">
                        <span className="svlab__bar-fill" />
                    </div>

                    <p className="svlab__tag" aria-hidden="true">
                        SV — monogram concept
                    </p>
                </div>

                {/* the loading chrome the mark stands over while the page
                    comes up — the mark itself is the preloader */}
                <div className="svload" aria-hidden="true">
                    <p className="svload__label">
                        Loading <span className="svload__count">0</span>
                    </p>
                    <div className="svload__bar">
                        <span className="svload__bar-fill" />
                    </div>
                </div>

                {/* the overlay: it sweeps up over the whole screen while the
                    letters move into the headline, and lifts on the hero. The
                    hand-off happens entirely behind it, so the two states read
                    as one move instead of a cut. */}
                <div className="svwipe" aria-hidden="true" />
            </div>

            {/* the scroll track the whole thing is scrubbed against */}
            <div className="svlab__track" aria-hidden="true" />
        </main>
    );
}

export default SvLab;
