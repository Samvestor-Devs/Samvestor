'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './TeamSection.css';

gsap.registerPlugin(ScrollTrigger);

// flowing background line — Figma draws it as two vectors; here they are
// joined into ONE continuous stroke that follows the same path.
// Coordinates are Figma px of the section frame, so the viewBox matches it.

// desktop (148:179, 1440 x 1197): enters off-screen top-left, dives under the
// small image (where the two Figma vectors meet), loops out past its left
// edge, then waves right and leaves off the right edge
const LINE_DESKTOP = {
  viewBox: '0 0 1440 1197',
  width: 37,
  d:
    'M -8.5 25.1 ' +
    'C 116 41.4, 377.5 152.6, 393.5 457 ' + // Figma "Vector 1"
    'C 395 495, 380 540, 348.5 563.1 ' + // hidden under the image: the join
    'C 279.7 646.3, 220.5 633.3, 171.5 628.6 ' + // Figma "Vector 2" from here
    'C -8 611.6, 58 305.1, 384 288.1 ' +
    'C 710 271.1, 860.5 858.3, 1077 550.1 ' +
    'C 1151.5 425.5, 1312.9 467.5, 1308 599.6 ' +
    'C 1299 841, 1544 908.5, 1544 915.1',
};

// mobile (153:2949, 390 wide): the two Figma vectors already meet end to end
const LINE_MOBILE = {
  viewBox: '0 0 390 520',
  width: 35,
  d:
    'M -42.5 3.9 ' +
    'C 64.8 42.9, 330 179.4, 273.5 380.9 ' + // Figma "Vector 3"
    'C 237.5 486.9, 158.5 500.4, 95 494.4 ' +
    'C -13 486.8, -45.5 302.4, 133 227.4 ' + // Figma "Vector 4"
    // Figma runs on to x625; trimmed (same curve) to just past the 390 edge
    // so none of the scroll-drawn length happens off-screen
    'C 228.8 187.1, 329.2 218.9, 420 270.2',
};

// swap these for your real images
const SMALL_IMG =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80';
const BIG_IMG =
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80';

function TeamSection() {
  const sectionRef = useRef(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // only the line that's actually on screen gets measured and drawn:
      // the other SVG is display:none, where getTotalLength is meaningless
      // and the scrub work is wasted (it cost phones a second live trigger)
      const draw = (index) => () => {
        const path = lineRefs.current[index];
        if (!path) return;
        const length = path.getTotalLength();

        // start fully hidden (line "un-drawn")
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

        // draw it as the section scrolls: start -> end
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            // begins once the section is well on screen, so the growing tip
            // stays visible even as it dips around the bottom of the loop
            start: 'top 40%',
            // finishes as the section's bottom comes into view, so the line's
            // end is drawn while it's on screen (was 'bottom 20%' — too slow,
            // it finished after scrolling out of view)
            end: 'bottom 90%',
            scrub: true,
          },
        });
      };

      mm.add('(min-width: 901px)', draw(0));
      mm.add('(max-width: 900px)', draw(1));
    }, sectionRef);

    return () => ctx.revert(); // clean up triggers on unmount
  }, []);

  return (
    <section className="team" ref={sectionRef}>
      {[LINE_DESKTOP, LINE_MOBILE].map((line, i) => (
        <svg
          key={line.viewBox}
          className={`team__line ${i === 0 ? 'team__line--desktop' : 'team__line--mobile'}`}
          viewBox={line.viewBox}
          aria-hidden="true"
        >
          <defs>
            {/* Figma: the entering stretch is Primary-500, the loop and wave
                Primary-400 — blended into one stroke */}
            <linearGradient
              id={`teamLineGradient${i}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2={i === 0 ? 420 : 300}
              y2={i === 0 ? 470 : 380}
            >
              <stop offset="0%" stopColor="#2e4f80" />
              <stop offset="100%" stopColor="#4a6fa5" />
            </linearGradient>
          </defs>
          <path
            ref={(el) => (lineRefs.current[i] = el)}
            d={line.d}
            fill="none"
            stroke={`url(#teamLineGradient${i})`}
            strokeWidth={line.width}
            strokeLinecap="round"
          />
        </svg>
      ))}

      <div className="team__inner">
        <div className="team__top">
          <h2 className="team__title">The Team Behind Your Growth</h2>
          <p className="team__intro">
            We built this team by finding people who are obsessed with results -
            not just good at their job, but genuinely invested in the brands
            they work on. From the first creative brief to the final conversion
            report, every person here shows up with the same energy and the same
            goal. Your growth.
          </p>
        </div>

        <div className="team__cards">
          <div className="team__card-small">
            <img src={SMALL_IMG} alt="Our team at work" />
          </div>
          <a
            className="team__cta"
            href="https://calendly.com/samvestor/30-minutes-consultation-call"
            target="_blank"
            rel="noreferrer"
          >
            Book A Strategy Call
          </a>
        </div>

        <div className="team__card-big">
          <img src={BIG_IMG} alt="The Samvestor team" />
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
