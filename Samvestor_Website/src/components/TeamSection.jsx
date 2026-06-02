import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './TeamSection.css';

gsap.registerPlugin(ScrollTrigger);

// flowing background line — ONE continuous "pigtail" stroke (viewBox 2000 x 1288):
// enters top-left -> single clean loop on the left (one crossover at its top)
// -> flows straight out into the S-wave (trough, crest) -> tail off bottom-right
const LINE_PATH =
  'M 20 60 ' +
  'C 200 200, 400 380, 510 470 ' + // enter from top-left, down toward the loop
  'C 560 510, 575 560, 540 620 ' + // short right shoulder of the loop
  'C 480 730, 320 800, 190 740 ' + // bottom of the loop
  'C 70 685, 60 540, 170 480 ' + // up the left side of the loop
  'C 250 440, 360 445, 460 475 ' + // over the top, crossing the entry once
  'C 620 520, 760 560, 980 600 ' + // flow straight out to the right
  'C 1180 635, 1250 760, 1340 805 ' + // dip into the trough
  'C 1470 860, 1600 700, 1730 665 ' + // rise to the crest
  'C 1840 645, 1895 850, 1925 1030 ' + // roll over the crest, heading down
  'C 1948 1155, 1965 1230, 1995 1285'; // tail off the bottom-right

// swap these for your real images
const SMALL_IMG =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80';
const BIG_IMG =
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80';

function TeamSection() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;
      const length = path.getTotalLength();

      // start fully hidden (line "un-drawn")
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      // draw it as the section scrolls: left end -> right end
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%', // begins as the section enters the viewport
          end: 'bottom 20%', // finishes near the end of the section
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert(); // clean up triggers on unmount
  }, []);

  return (
    <section className="team" ref={sectionRef}>
      <svg
        className="team__line"
        viewBox="0 0 2000 1288"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="teamLineGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a6fa5" />
            <stop offset="100%" stopColor="#2e4f80" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d={LINE_PATH}
          fill="none"
          stroke="url(#teamLineGradient)"
          strokeWidth="26"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

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
