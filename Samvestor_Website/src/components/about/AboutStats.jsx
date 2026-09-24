'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './reveal';
import './AboutStats.css';

gsap.registerPlugin(ScrollTrigger);

/* Figures from the About Us design. `value` counts up from 0 when the card
   scrolls in; `speed` sets how fast the card drifts past the pinned heading
   (different speeds give the Lusion-style depth). */
const STATS = [
    { value: 450, prefix: '₹', suffix: ' Cr+', label: 'Trackable Revenue Managed', desc: 'In Performance-Driven Revenue', speed: 0.9 },
    { value: 100, suffix: '+', label: 'Full-Time Team Members', desc: 'Across Strategy, Creatives & Performance', speed: 1.35 },
    { value: 7, suffix: '+', label: 'Years of Operations', desc: 'Years Scaling Brands Since 2018', speed: 1.15 },
    { value: 3, suffix: '+', label: 'Brand Tenure', desc: 'Years Minimum Average Brand Partnership Duration', speed: 0.75 },
    { value: 11.25, suffix: '%', decimals: 2, label: 'Creative Launch Rate', desc: 'Average Winning Creative Activation Rate', speed: 1.1 },
];

const format = (stat, v) => `${stat.prefix ?? ''}${v.toFixed(stat.decimals ?? 0)}${stat.suffix ?? ''}`;

/**
 * "Built on Measurable Growth & Execution": the heading pins while five
 * stat cards float past it at different speeds, each number counting up.
 * Phones get a swipeable row instead.
 */
function AboutStats() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(sectionRef);
            const reduce = prefersReducedMotion();

            // count-up, every screen size
            q('.astats__value').forEach((el, i) => {
                const stat = STATS[i];
                if (reduce) return;
                const n = { v: 0 };
                el.textContent = format(stat, 0);
                gsap.to(n, {
                    v: stat.value,
                    duration: 1.6,
                    ease: 'power3.out',
                    onUpdate: () => {
                        el.textContent = format(stat, n.v);
                    },
                    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                });
            });

            if (reduce) return;

            // every card deals itself in: it lands from a tilt, and its gold
            // rule draws out from the middle (same language as the cards in
            // "What We Do Relentlessly")
            q('.astats__card').forEach((card, i) => {
                const inner = card.querySelector('.astats__card-inner');
                gsap.from(inner, {
                    y: 40,
                    rotate: i % 2 ? 4 : -4,
                    scale: 0.9,
                    autoAlpha: 0,
                    duration: 1,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: card, start: 'top 92%', once: true },
                });
                gsap.from(card.querySelector('.astats__rule'), {
                    scaleX: 0,
                    autoAlpha: 0,
                    duration: 0.8,
                    delay: 0.3,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: card, start: 'top 92%', once: true },
                });
            });

            // desktop: the cards also drift past the pinned heading at
            // different speeds, for depth
            const mm = gsap.matchMedia();
            mm.add('(min-width: 901px)', () => {
                q('.astats__card').forEach((card, i) => {
                    const speed = STATS[i].speed;
                    gsap.fromTo(
                        card,
                        { y: 220 * speed },
                        {
                            y: -220 * speed,
                            ease: 'none',
                            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
                        }
                    );
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="astats" ref={sectionRef} aria-labelledby="astats-title">
            <div className="astats__head">
                <h2 className="astats__title" id="astats-title">
                    Built on Measurable Growth &amp; Execution
                </h2>
                <p className="astats__sub">
                    Seven years of scaling D2C brands across India - every number on this page is real, tracked and
                    earned
                </p>
            </div>

            <ul className="astats__field">
                {STATS.map((stat, i) => {
                    const index = String(i + 1).padStart(2, '0');
                    return (
                    <li key={stat.label} className={`astats__card astats__card--${i + 1}`}>
                        {/* same playing-card face as "What We Do Relentlessly" */}
                        <div className="astats__card-inner">
                            <span className="astats__index" aria-hidden="true">
                                {index}
                                <i className="astats__pip" />
                            </span>
                            <span className="astats__index astats__index--flip" aria-hidden="true">
                                {index}
                                <i className="astats__pip" />
                            </span>

                            <span className="astats__value">{format(stat, stat.value)}</span>
                            <span className="astats__rule" aria-hidden="true">
                                <i className="astats__pip" />
                            </span>
                            <span className="astats__text">
                                <strong>{stat.label}</strong>
                                <span>{stat.desc}</span>
                            </span>
                        </div>
                    </li>
                    );
                })}
            </ul>
        </section>
    );
}

export default AboutStats;
