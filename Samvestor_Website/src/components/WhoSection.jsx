import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './WhoSection.css';

gsap.registerPlugin(ScrollTrigger);

// DOM order = the order they fly in (left, right, then the centre card on top).
const CARDS = [
  {
    key: 'creative',
    title: 'Creative\nCollectives',
    body: 'All-in-one solutions for creative work from concept to launch.',
    bg: '#e2c87a',
    rot: -14,
    x: -128,
    y: 0,
    z: 1,
  },
  {
    key: 'scaling',
    title: 'Scaling Brands',
    body: 'Turning ideas into visuals that define brands, stories and values.',
    bg: '#d4b86a',
    rot: 14,
    x: 128,
    y: 0,
    z: 2,
  },
  {
    key: 'ambitious',
    title: 'Ambitious Operators',
    body: 'Founders who understand that real growth comes from strategy, creativity, and execution working together - not just boosting posts.',
    bg: '#eed9a0',
    rot: 0,
    x: 0,
    y: -32,
    z: 3,
  },
];

function WhoSection() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
          <h2 className="who__title">WHO IT&apos;S FOR</h2>
          <p className="who__tag">Creatives create, We calculate</p>
        </div>

        <div className="who__stage">
          {CARDS.map((card, i) => (
            <article
              key={card.key}
              ref={(el) => (cardRefs.current[i] = el)}
              className="who__card"
              style={{
                left: `calc(50% + ${card.x}px)`,
                top: `calc(50% + ${card.y}px)`,
                zIndex: card.z,
                background: card.bg,
              }}
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
