'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INTRO, UNDOCK } from './svTiming';
import { inkGradient } from './svInk';
import useTheme from '../../lib/useTheme';
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

/* The hero's copy — everything the opening fades in. Explicitly NOT the
   scrim, which is a child of the same beat but is scheduled against the
   scroll instead: fading it in with the copy would drop a dark veil over
   the canvas, and the two letters standing in the headline sit under that
   veil while every letter beside them sits above it. */
const HERO_COPY = '.svbeat--hero > *:not(.svbeat__scrim)';

/* When each beat owns the screen, as a fraction of the scroll track. The 3D
   choreography reads the same windows — one clock for both. */
const BEATS = [
    { in: [0, 0], out: [0.22, 0.3] },
    { in: [0.26, 0.34], out: [0.46, 0.52] },
    { in: [0.54, 0.62], out: [0.72, 0.77] },
    { in: [0.82, 0.9], out: [1.2, 1.3] }, // past the end: the last beat stays
];

/**
 * The gap a 3D letter stands in.
 *
 * The glyph is laid out but never painted: the extrusion IS this letter, so
 * the place it belongs stays empty whether it is standing there or away
 * being a monogram. Keeping the glyph in the flow is what holds the line's
 * width and wrapping, so nothing reflows when the letter leaves.
 *
 * The zero-width anchor is what the scene measures: an inline-block of
 * height 1em sits its bottom edge on the baseline, which hands over the pen
 * position, the baseline and the em in a single rect — no font metrics to
 * guess at.
 */
function Slot({ letter }) {
    return (
        <span className="svslot" data-slot={letter}>
            <i className="svslot__anchor" />
            <span className="svslot__space">{letter}</span>
        </span>
    );
}

function SvLab() {
    const rootRef = useRef(null);
    const progress = useRef(0);
    const intro = useRef({ running: false, start: 0 });
    const slots = useRef({ S: null, V: null });
    const staticMode = useMediaQuery('(prefers-reduced-motion: reduce)');
    const theme = useTheme();
    // painted from the same stops the 3D letters sample, so the flat glyphs
    // and the extrusions standing between them can never disagree
    const inkStyle = { backgroundImage: inkGradient(theme) };

    /* The scene is handed the anchor ELEMENTS, not their measurements, and
       reads them itself on every frame. A rect taken once is stale the moment
       the webfont lands or the window is resized, and a letter standing in a
       word has to track its place exactly. */
    useEffect(() => {
        const root = rootRef.current;
        root.querySelectorAll('.svslot').forEach((slot) => {
            slots.current[slot.dataset.slot] = slot.querySelector('.svslot__anchor');
        });
    }, []);

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
            gsap.set([q(HERO_COPY), q('.svlab__chrome')], { autoAlpha: 0 });
            // The scrim is a dark veil over the canvas, and the two letters
            // standing in the headline are UNDER it while every letter beside
            // them is above it — which is exactly what made them look dull.
            // While they are in the words there is nothing behind the copy to
            // protect, so it starts at nothing and arrives with the monogram.
            gsap.set(q('.svbeat--hero .svbeat__scrim'), { opacity: 0 });

            // ---- the opening, on the same clock as the scene -------------
            const d = INTRO.duration;
            const open = gsap.timeline({ paused: true });
            open
                // the mark loads alone: the count and the hairline fill under it
                .to('.svload__bar-fill', { scaleX: 1, duration: d * INTRO.holdEnd, ease: 'power1.inOut' }, 0)
                .to('.svload__count', { innerText: 100, duration: d * INTRO.holdEnd, ease: 'power1.inOut', snap: { innerText: 1 } }, 0)
                .to('.svload', { autoAlpha: 0, duration: d * 0.1 }, d * (INTRO.holdEnd + 0.02))
                // the headline arrives first, with the two gaps already in it,
                // so you watch the letters fly in and fill their own places
                .fromTo(
                    q(HERO_COPY),
                    { autoAlpha: 0, y: 22 },
                    { autoAlpha: 1, y: 0, duration: d * 0.16, stagger: d * 0.03, ease: 'power2.out' },
                    d * 0.48
                )
                .to(q('.svlab__chrome'), { autoAlpha: 1, duration: d * 0.14 }, d * 0.88);

            // The site header is fixed and lives outside this page, so during
            // the opening it sits on top of the mark that IS the preloader.
            // It waits with everything else and arrives with the chrome.
            document.body.classList.add('svlab-opening');
            open.eventCallback('onComplete', () => document.body.classList.remove('svlab-opening'));

            const start = () => {
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

            // ...and it fades in exactly as the letters leave and the mark
            // forms up behind the heading
            tl.fromTo(
                q('.svbeat--hero .svbeat__scrim'),
                { opacity: 0 },
                { opacity: 1, duration: UNDOCK[1] - UNDOCK[0], ease: 'power1.in' },
                UNDOCK[0]
            );

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

        return () => {
            document.body.classList.remove('svlab-opening');
            ctx.revert();
        };
    }, [staticMode]);

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
                        {/* the two glyphs are never painted, so the heading is
                            labelled rather than read off the text */}
                        <h1 className="svbeat__title" style={inkStyle} aria-label="Be A Smart Investor">
                            <span aria-hidden="true">
                                Be A <Slot letter="S" />
                                mart
                                <br />
                                In
                                <Slot letter="V" />
                                estor
                            </span>
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
                        <h2 className="svbeat__title svbeat__title--close" style={inkStyle}>
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
            </div>

            {/* the scroll track the whole thing is scrubbed against */}
            <div className="svlab__track" aria-hidden="true" />
        </main>
    );
}

export default SvLab;
