import { useEffect, useState } from 'react';
import './HeroSection.css';

/* ── Hero content ─────────────────────────────────────────────────────────
   Add more phrases to this array and the headline cycles through them
   with the typewriter effect. Use '\n' where the line should break. */
const HEADLINE_PHRASES = [
    'WE BUILD\nREVENUE',
    // 'WE BUILD\nBRANDS',
    // 'WE BUILD\nGROWTH',
];

/* Background video — replace public/hero-bg.mp4 with your own file
   (keep the same name), or drop a new file into /public and update
   this path (e.g. '/my-hero-video.mp4'). */
const HERO_VIDEO_SRC = '/hero-bg.mp4';

const PARAGRAPH =
    'Samvestor blends data-led strategy, performance marketing, and relentless ' +
    'execution to build systems that scale - across Meta, Google, email, funnels ' +
    'and creative. If you want growth measured in crores, not clicks, you are in ' +
    'the right place.';

/* Typewriter timing (ms) */
const TYPE_SPEED = 95;
const DELETE_SPEED = 45;
const HOLD_DELAY = 2400; // pause with the phrase fully typed
const GAP_DELAY = 500; // pause on empty before the next phrase

function useTypewriter(phrases) {
    const [text, setText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const phrase = phrases[phraseIndex % phrases.length];
        let timeout;

        if (!deleting) {
            timeout =
                text.length < phrase.length
                    ? setTimeout(() => setText(phrase.slice(0, text.length + 1)), TYPE_SPEED)
                    : setTimeout(() => setDeleting(true), HOLD_DELAY);
        } else {
            timeout =
                text.length > 0
                    ? setTimeout(() => setText(text.slice(0, -1)), DELETE_SPEED)
                    : setTimeout(() => {
                          setDeleting(false);
                          setPhraseIndex((i) => (i + 1) % phrases.length);
                      }, GAP_DELAY);
        }

        return () => clearTimeout(timeout);
    }, [text, deleting, phraseIndex, phrases]);

    return text;
}

function HeroSection() {
    const typed = useTypewriter(HEADLINE_PHRASES);

    // respect users who turn animations off — show the first phrase statically
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const headline = reducedMotion ? HEADLINE_PHRASES[0] : typed;
    const lines = headline.split('\n');

    return (
        <section className="hero" id="home">
            <video
                className="hero__video"
                src={HERO_VIDEO_SRC}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
            />
            <div className="hero__overlay" />

            <div className="hero__content">
                <h1 className="hero__headline" aria-label={HEADLINE_PHRASES[0].replace('\n', ' ')}>
                    {lines.map((line, i) => (
                        <span className="hero__line" key={i}>
                            {line}
                            {i === lines.length - 1 && !reducedMotion && (
                                <span className="hero__cursor" aria-hidden="true" />
                            )}
                        </span>
                    ))}
                </h1>

                <div className="hero__bottom">
                    <a href="#contact-us" className="hero__cta">
                        Scale Your Revenue
                    </a>
                    <p className="hero__paragraph">{PARAGRAPH}</p>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
