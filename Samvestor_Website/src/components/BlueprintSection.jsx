import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './BlueprintSection.css';

gsap.registerPlugin(ScrollTrigger);

/* Swap with the real photo when ready — drop it into /public and change
   this to e.g. '/blueprint-meeting.jpg'. */
const IMAGE =
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80';

const PITCH =
    'The Step-By-Step System Beginners Use To 20x Their Revenue. Built from ' +
    'real execution, not theory.';

/* The big side heading — one word-group per rotated column (desktop). */
const HEADING_WORDS = ['The', 'Blueprint', 'To Hit 1Cr', 'In A Month'];

const CalendarIcon = () => (
    <svg className="blueprint__demo-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V9h14v10M5 7V5h14v2H5z" />
    </svg>
);

function BlueprintSection() {
    const sectionRef = useRef(null);

    // entry animation: the vertical heading columns rise from below one after
    // another as the section scrolls into view (fade-up for the mobile line)
    useEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            mm.add('(min-width: 901px)', () => {
                gsap.from('.blueprint__word', {
                    y: 140,
                    autoAlpha: 0,
                    duration: 1.1,
                    ease: 'power3.out',
                    stagger: 0.14,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse',
                    },
                });
            });

            mm.add('(max-width: 900px)', () => {
                gsap.from('.blueprint__heading-mobile', {
                    y: 40,
                    autoAlpha: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse',
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="blueprint" ref={sectionRef}>
            <div className="blueprint__inner">
                <div className="blueprint__left">
                    <h2 className="blueprint__pitch">{PITCH}</h2>
                    <a href="#contact-us" className="blueprint__cta">
                        Get the Blueprint Now
                    </a>
                    <div className="blueprint__media">
                        <img className="blueprint__img" src={IMAGE} alt="Meeting in the studio" />
                    </div>
                </div>

                {/* desktop: giant rotated heading, reads bottom-to-top */}
                <h2 className="blueprint__heading" aria-label={HEADING_WORDS.join(' ')}>
                    {HEADING_WORDS.map((word) => (
                        <span className="blueprint__word" key={word} aria-hidden="true">
                            {word}
                        </span>
                    ))}
                </h2>

                {/* mobile: same heading as a normal line */}
                <h2 className="blueprint__heading-mobile">
                    The <strong>Blueprint To Hit 1Cr In A Month</strong>
                </h2>
            </div>

            <div className="blueprint__demo-row">
                <a href="#book-a-call" className="blueprint__demo">
                    Book a Demo
                    <CalendarIcon />
                </a>
            </div>
        </section>
    );
}

export default BlueprintSection;
