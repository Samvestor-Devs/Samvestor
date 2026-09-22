'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealLines, scrambleIn } from './reveal';
import './AboutTeam.css';

gsap.registerPlugin(ScrollTrigger);

// tick heights for the measuring-tape rulers (Lusion's "TEAM" motif):
// a tall tick every 5th, like a ruler
const TICKS = Array.from({ length: 21 }, (_, i) => (i % 5 === 0 ? 1 : 0.45));
const DOTS = Array.from({ length: 12 });

function Ruler({ className = '' }) {
    return (
        <div className={`ateam__ruler ${className}`} aria-hidden="true">
            {TICKS.map((h, i) => (
                <span key={i} className="ateam__tick" style={{ '--h': h }} />
            ))}
        </div>
    );
}

/**
 * "TEAM" — the Lusion-style interlude after the hero: measuring-tape rulers
 * draw themselves in, the word scrambles into place and the leadership
 * paragraph rises line by line.
 */
function AboutTeam() {
    const sectionRef = useRef(null);
    const wordRef = useRef(null);
    const copyRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(sectionRef);
            const reduce = prefersReducedMotion();

            if (!reduce) {
                // rulers: ticks grow up from their baseline, left to right
                q('.ateam__ruler').forEach((ruler) => {
                    gsap.from(ruler.querySelectorAll('.ateam__tick'), {
                        scaleY: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        stagger: 0.025,
                        scrollTrigger: { trigger: ruler, start: 'top 90%', once: true },
                    });
                    // and drift with the scroll, like a tape being pulled
                    gsap.to(ruler, {
                        xPercent: -8,
                        ease: 'none',
                        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
                    });
                });

                gsap.from(q('.ateam__dot'), {
                    autoAlpha: 0,
                    duration: 0.4,
                    stagger: 0.04,
                    scrollTrigger: { trigger: wordRef.current, start: 'top 85%', once: true },
                });

                ScrollTrigger.create({
                    trigger: wordRef.current,
                    start: 'top 85%',
                    once: true,
                    onEnter: () => scrambleIn(wordRef.current),
                });

                // the section index counts up to 001
                const counter = q('.ateam__count')[0];
                const n = { v: 0 };
                gsap.to(n, {
                    v: 1,
                    duration: 1.2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        counter.textContent = String(Math.round(n.v)).padStart(3, '0');
                    },
                    scrollTrigger: { trigger: counter, start: 'top 90%', once: true },
                });
            }

            revealLines(copyRef.current);
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="ateam" ref={sectionRef} aria-labelledby="ateam-title">
            <div className="ateam__row ateam__row--top">
                <Ruler className="ateam__ruler--top" />
                <div className="ateam__heading">
                    <span className="ateam__dots" aria-hidden="true">
                        {DOTS.map((_, i) => (
                            <span key={i} className="ateam__dot" />
                        ))}
                    </span>
                    <h2 className="ateam__word" id="ateam-title" ref={wordRef}>
                        Team
                    </h2>
                </div>
            </div>

            <div className="ateam__row ateam__row--copy">
                <span className="ateam__index" aria-hidden="true">
                    [ <span className="ateam__count">001</span> ]
                </span>
                <p className="ateam__copy" ref={copyRef}>
                    Every department at Samvestor is led by someone who has spent years actually doing the job - not
                    just managing people who do it. Our leads have run campaigns, written copy, built funnels and
                    fixed what was broken long before they started leading teams. So when they work on your brand,
                    they know exactly what to do and exactly what to avoid.
                </p>
            </div>

            <Ruler className="ateam__ruler--bottom" />
        </section>
    );
}

export default AboutTeam;
