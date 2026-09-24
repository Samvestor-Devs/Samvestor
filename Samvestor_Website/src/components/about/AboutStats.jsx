'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealLines } from './reveal';
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

            // the heading card deals itself in like one of the stat cards,
            // and its title rises line by line behind a mask
            const head = q('.astats__head-card')[0];
            if (head) {
                gsap.from(head, {
                    y: 46,
                    rotate: -2.2,
                    scale: 0.92,
                    autoAlpha: 0,
                    duration: 1.1,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: head, start: 'top 88%', once: true },
                });
                revealLines(q('.astats__title')[0], { start: 'top 85%', stagger: 0.1, duration: 1 });
                gsap.from(q('.astats__rule')[0], {
                    scaleX: 0,
                    duration: 0.9,
                    delay: 0.25,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: head, start: 'top 88%', once: true },
                });
            }

            // desktop: parallax drift + a soft settle as each card arrives
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
                    gsap.from(card.querySelector('.astats__card-inner'), {
                        rotate: i % 2 ? 4 : -4,
                        scale: 0.9,
                        autoAlpha: 0,
                        duration: 1,
                        ease: 'expo.out',
                        scrollTrigger: { trigger: card, start: 'top 95%', once: true },
                    });
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="astats" ref={sectionRef} aria-labelledby="astats-title">
            <div className="astats__head">
                {/* the heading sits on the same white card as the figures
                    below it, so the section reads as one deck */}
                <div className="astats__head-card">
                    <h2 className="astats__title" id="astats-title">
                        Built on Measurable Growth &amp; Execution
                    </h2>
                    <span className="astats__rule" aria-hidden="true" />
                    <p className="astats__sub">
                        Seven years of scaling D2C brands across India - every number on this page is real, tracked and
                        earned
                    </p>
                </div>
            </div>

            <ul className="astats__field">
                {STATS.map((stat, i) => (
                    <li key={stat.label} className={`astats__card astats__card--${i + 1}`}>
                        <div className="astats__card-inner">
                            <span className="astats__value">{format(stat, stat.value)}</span>
                            <span className="astats__text">
                                <strong>{stat.label}</strong>
                                <span>{stat.desc}</span>
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default AboutStats;
