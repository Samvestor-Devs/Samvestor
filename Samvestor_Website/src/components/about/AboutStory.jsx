'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, revealLines } from './reveal';
import './AboutStory.css';

gsap.registerPlugin(ScrollTrigger);

/* The founder's photo. Drop the file in /public and set the path here
   (e.g. '/team/simarjot.jpg'); until then the design's gold panel shows. */
const CEO_PHOTO = null;

/**
 * "Who We Are & What Drives Us": the founder photo wipes open and drifts
 * (parallax) while the story rises line by line beside it.
 */
function AboutStory() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(sectionRef);

            q('.astory__reveal').forEach((el) => revealLines(el, { stagger: 0.05 }));

            if (prefersReducedMotion()) return;

            const media = q('.astory__media')[0];
            // wipe open from the bottom, like a curtain lifting
            gsap.fromTo(
                media,
                { clipPath: 'inset(100% 0% 0% 0% round 14px)' },
                {
                    clipPath: 'inset(0% 0% 0% 0% round 14px)',
                    duration: 1.4,
                    ease: 'expo.inOut',
                    scrollTrigger: { trigger: media, start: 'top 80%', once: true },
                }
            );
            // then drifts slower than the page
            gsap.fromTo(
                q('.astory__photo')[0],
                { yPercent: -8, scale: 1.12 },
                {
                    yPercent: 8,
                    scale: 1.12,
                    ease: 'none',
                    scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="astory" ref={sectionRef} aria-labelledby="astory-title">
            <figure className="astory__figure">
                <div className="astory__media">
                    {CEO_PHOTO ? (
                        <img className="astory__photo" src={CEO_PHOTO} alt="Simarjot Singh, CEO & Founder of Samvestor" />
                    ) : (
                        <div className="astory__photo astory__photo--placeholder" role="img" aria-label="Photo of Simarjot Singh, coming soon" />
                    )}
                </div>
                <figcaption className="astory__caption">Meet The CEO</figcaption>
            </figure>

            <div className="astory__text">
                <h2 className="astory__title astory__reveal" id="astory-title">
                    Who We Are &amp; What Drives Us
                </h2>
                <p className="astory__reveal">
                    SamVestor started on 1st April 2018 with a simple goal - to build something meaningful and
                    long-lasting. In the early days, we worked with freelancers and remote team members, learning,
                    experimenting, and improving every single day. From the beginning, there was one belief that
                    shaped how we worked.
                </p>
                <blockquote className="astory__quote astory__reveal">
                    &quot;It&apos;s better to execute an idea and learn from it than to do nothing and stay safe&quot;
                </blockquote>
                <p className="astory__reveal">
                    That mindset pushed us to act, test, and move forward - even when things were uncertain. Instead
                    of waiting for the perfect moment, we chose execution. Some ideas worked. Some taught us lessons.
                    But every step made us stronger.
                </p>
                <p className="astory__reveal">
                    In July 2022, we moved into our own office and started building proper departments with clear
                    roles and responsibilities. That shift wasn&apos;t just about space - it was about building
                    stability, accountability, and a stronger foundation for long-term growth.
                </p>
                <p className="astory__reveal">
                    As the company continued to grow and mature, we took a significant step forward. On 24 January
                    2025, the company was officially registered as Samvestor Marketing Pvt. Ltd. This marked our
                    transition into a fully structured private limited company.
                </p>
                <p className="astory__sign astory__reveal">
                    Simarjot Singh (idigitalsam) CEO &amp; Founder, Samvestor Marketing Pvt. Ltd.
                </p>
            </div>
        </section>
    );
}

export default AboutStory;
