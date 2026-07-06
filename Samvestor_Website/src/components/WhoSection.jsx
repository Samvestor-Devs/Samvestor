import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './WhoSection.css';

gsap.registerPlugin(ScrollTrigger);

// DOM order = the order they fly in (left, right, then the centre card on top).
// Positioning/colors live in WhoSection.css per card class (desktop fan vs
// mobile sticky stack differ).
const CARDS = [
  {
    key: 'creative',
    title: 'Creative\nCollectives',
    body: 'All-in-one solutions for creative work from concept to launch.',
    rot: -14,
  },
  {
    key: 'scaling',
    title: 'Scaling Brands',
    body: 'Turning ideas into visuals that define brands, stories and values.',
    rot: 14,
  },
  {
    key: 'ambitious',
    title: 'Ambitious Operators',
    body: 'Founders who understand that real growth comes from strategy, creativity, and execution working together - not just boosting posts.',
    rot: 0,
  },
];

function WhoSection() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // the fan + fly-in sequence is desktop-only; on mobile the cards are a
      // CSS-driven sticky stack (see WhoSection.css)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
        const cards = cardRefs.current.filter(Boolean);

        // resting state: centred on their anchor + final rotation, visible
        cards.forEach((card, i) => {
          gsap.set(card, {
            xPercent: -50,
            yPercent: -50,
            rotation: CARDS[i].rot,
            transformOrigin: '50% 50%',
            autoAlpha: 1,
          });
        });

        // scroll-driven via a sticky track: the tall outer section provides the
        // scroll distance, the inner wrapper stays stuck on screen, and this
        // scrubbed timeline brings the cards up one at a time (left -> right ->
        // centre) exactly as far as you scroll.
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });

        cards.forEach((card) => {
          tl.from(card, { y: 720, autoAlpha: 0, rotation: 0, duration: 1 }, '+=0.4');
        });

        // recalculate once everything (incl. fonts) has settled
        ScrollTrigger.refresh();
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="who" ref={sectionRef}>
      <div className="who__sticky">
        <div className="who__head">
          <span className="who__badge">
            PERFORMANCE MARKETING FOR D2C BRANDS
          </span>
          <h2 className="who__title">Who It&apos;s For</h2>
          <p className="who__tag">Creatives create, We calculate</p>
        </div>

        <div className="who__stage">
          {CARDS.map((card, i) => (
            <article
              key={card.key}
              ref={(el) => (cardRefs.current[i] = el)}
              className={`who__card who__card--${card.key}`}
            >
              <h3 className="who__card-title">
                {card.title.split('\n').map((line, j) => (
                  <span key={j}>{line}</span>
                ))}
              </h3>
              <p className="who__card-body">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhoSection;
