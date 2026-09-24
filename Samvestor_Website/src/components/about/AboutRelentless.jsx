'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealLines } from './reveal';
import './AboutRelentless.css';

gsap.registerPlugin(ScrollTrigger);

/* The six "playing cards" from the design. Each prints its title again,
   upside down, at the bottom — like a real card. */
const CARDS = [
    {
        title: 'Team Structure',
        sub: '100+ Full-Time Professionals',
        body: "No interns. No part-timers. Every department has dedicated leads and managers - so your account isn't dependent on one person.",
    },
    {
        title: 'Department Leadership',
        sub: 'Clear Ownership Across Teams',
        body: 'Content, Video, Design, Digital Marketing, CRO, Sales, HR, and Operations - each function has defined team leads and managers for accountability.',
    },
    {
        title: 'Retention & Stability',
        sub: '3+ Year Average Brand Tenure',
        body: 'Long-term partnerships built on trust and consistent performance - not short-term experiments.',
    },
    {
        title: 'Creative Review System',
        sub: 'Multi-Stage Approval Process',
        body: 'Videos pass through 8 approvals. Graphics go through 6. Nothing launches unchecked.',
    },
    {
        title: 'Quality Control',
        sub: 'Dedicated QC Team',
        body: 'A team of 3 conducts final checks before anything goes live - ensuring alignment, quality, and readiness.',
    },
    {
        title: 'Performance Accountability',
        sub: 'Measured & Tracked Daily',
        body: "Every campaign is monitored with clear KPIs and structured reporting. We don't rely on assumptions - decisions are made on data.",
    },
];

// how each card sits in the face-down deck before it's dealt (deg)
const DECK_TILT = [-7, 5, -3, 8, -5, 2];

// position of an element relative to an ancestor, ignoring transforms
function offsetWithin(el, ancestor) {
    let x = 0;
    let y = 0;
    let node = el;
    while (node && node !== ancestor) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent;
    }
    return { x, y };
}

/**
 * "What We Do Relentlessly": rings draw themselves behind the headline,
 * and a face-down deck below it deals out on scroll — each card flying to
 * its place in the grid and flipping face-up as it lands. Phones get the
 * cards as a simple stack.
 */
function AboutRelentless() {
    const sectionRef = useRef(null);
    const deckRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(sectionRef);
            const section = sectionRef.current;

            revealLines(q('.arel__title')[0], { stagger: 0.12, duration: 1.2 });

            if (prefersReducedMotion()) return;

            // the rings and flowing lines draw as the section scrolls by
            q('.arel__lines path').forEach((path, i) => {
                const length = path.getTotalLength();
                gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
                gsap.to(path, {
                    strokeDashoffset: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: i === 0 ? 'top 85%' : 'top 30%',
                        end: i === 0 ? 'top -10%' : 'bottom bottom',
                        scrub: 1,
                    },
                });
            });

            const mm = gsap.matchMedia();

            // desktop: deal the deck
            mm.add('(min-width: 901px)', () => {
                const deck = deckRef.current;
                const cards = q('.arel__card-inner');

                // distance from each card's grid slot to the deck's centre
                const toDeck = (card) => {
                    const slot = offsetWithin(card.parentElement, section);
                    const spot = offsetWithin(deck, section);
                    return {
                        x: spot.x + deck.offsetWidth / 2 - (slot.x + card.offsetWidth / 2),
                        y: spot.y + deck.offsetHeight / 2 - (slot.y + card.offsetHeight / 2),
                    };
                };

                const tl = gsap.timeline({
                    defaults: { ease: 'power2.inOut' },
                    scrollTrigger: {
                        trigger: deck,
                        start: 'center 55%',
                        endTrigger: q('.arel__grid')[0],
                        end: 'top 20%',
                        scrub: 1,
                        invalidateOnRefresh: true,
                    },
                });

                cards.forEach((card, i) => {
                    tl.fromTo(
                        card,
                        {
                            x: () => toDeck(card).x,
                            y: () => toDeck(card).y,
                            rotation: DECK_TILT[i],
                            rotationY: 180,
                            scale: 0.9,
                            // the SAME perspective at both ends: if it only
                            // appears in the end state GSAP animates it up
                            // from 0, and mid-flip a card at ~50px
                            // perspective balloons across the whole screen
                            transformPerspective: 1600,
                        },
                        {
                            x: 0,
                            y: 0,
                            rotation: 0,
                            rotationY: 0,
                            scale: 1,
                            duration: 1,
                            transformPerspective: 1600,
                        },
                        i * 0.22
                    );
                });

                // the headline eases back as the cards take over
                gsap.to(q('.arel__title')[0], {
                    scale: 0.94,
                    autoAlpha: 0.35,
                    ease: 'none',
                    scrollTrigger: { trigger: deck, start: 'center 45%', end: 'bottom top', scrub: true },
                });
            });

            // phones: every card starts face-down and turns over as you
            // scroll, finishing while the whole card is on screen
            mm.add('(max-width: 900px)', () => {
                q('.arel__card-inner').forEach((card) => {
                    gsap.fromTo(
                        card,
                        {
                            rotationY: 180,
                            // the SAME perspective at both ends — set on only
                            // one side, GSAP animates it up from 0 and the
                            // card balloons mid-turn. A distant one (2400)
                            // keeps the halfway stretch gentle.
                            transformPerspective: 2400,
                        },
                        {
                            rotationY: 0,
                            transformPerspective: 2400,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: card.parentElement,
                                start: 'top 88%', // the card's top edge appears
                                // done by the time its bottom clears the fold,
                                // so the turn always finishes in full view
                                end: 'bottom 94%',
                                scrub: 0.6,
                                invalidateOnRefresh: true,
                            },
                        }
                    );
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="arel" ref={sectionRef} aria-labelledby="arel-title">
            <svg className="arel__lines" viewBox="0 0 1440 2060" aria-hidden="true">
                <path className="arel__ring" d="M 820 -170 C 1130 -170, 1380 80, 1380 390 C 1380 700, 1130 950, 820 950 C 510 950, 260 700, 260 390 C 260 80, 510 -170, 820 -170" />
                <path className="arel__flow" d="M -40 1130 C 200 1050, 330 1500, 520 1420 C 700 1345, 860 980, 1100 1060 C 1330 1135, 1360 1480, 1500 1360" />
                <path className="arel__flow arel__flow--soft" d="M 300 2100 C 380 1760, 700 1640, 810 1360 C 900 1130, 1230 980, 1310 1240 C 1380 1470, 1200 1720, 1500 1900" />
            </svg>

            <h2 className="arel__title" id="arel-title">
                What We Do
                <br />
                Relentlessly
            </h2>

            {/* where the face-down deck sits before the cards are dealt */}
            <div className="arel__deck" ref={deckRef} aria-hidden="true" />

            <ul className="arel__grid">
                {CARDS.map((card, i) => {
                    const index = String(i + 1).padStart(2, '0');
                    return (
                    <li key={card.title} className="arel__card">
                        <div className="arel__card-inner">
                            <div className="arel__face arel__face--front">
                                {/* playing-card corner indices: number + gold pip */}
                                <span className="arel__index" aria-hidden="true">
                                    {index}
                                    <i className="arel__pip" />
                                </span>
                                <span className="arel__index arel__index--flip" aria-hidden="true">
                                    {index}
                                    <i className="arel__pip" />
                                </span>

                                <div className="arel__card-content">
                                    <h3 className="arel__card-title">{card.title}</h3>
                                    <span className="arel__rule" aria-hidden="true">
                                        <i className="arel__pip" />
                                    </span>
                                    {/* non-breaking hyphens so "Full-Time" never splits across lines */}
                                    <p className="arel__card-sub">{card.sub.replace(/-/g, '‑')}</p>
                                    <p className="arel__card-body">{card.body}</p>
                                </div>
                            </div>
                            <div className="arel__face arel__face--back" aria-hidden="true">
                                <img className="arel__back-logo" src="/sv-logo-white.png" alt="" />
                            </div>
                        </div>
                    </li>
                    );
                })}
            </ul>
        </section>
    );
}

export default AboutRelentless;
