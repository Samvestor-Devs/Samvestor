'use client';

import { useEffect, useRef, useState } from 'react';
import './ProcessSection.css';

/**
 * Each step has its own image. As a step becomes "active" (its top crosses
 * the activation line, below the centre of the viewport) the sticky image
 * crossfades to it and the gold progress bar's leading tip sits at that line.
 *
 * Swap the `image` URLs for your real per-step images.
 */
const STEPS = [
  {
    title: 'Discovery & Direction',
    subtitle: 'Brand Audit & Growth Mapping',
    body: 'We start by understanding your brand, audience, competitors and current performance. This is where we find the gaps, identify the opportunities and define exactly what needs to happen to scale.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1100&q=80',
  },
  {
    title: 'Strategy & Creative Thinking',
    subtitle: 'Positioning, Funnels & Creative Angles',
    body: 'We shape your data into a clear growth strategy. From ad angles and funnel structure to messaging and creative direction - everything is built before a single rupee is spent.',
    image:
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1100&q=80',
  },
  {
    title: 'Campaign Execution & Optimisation',
    subtitle: 'Launch, Test & Improve Daily',
    body: 'We go live with precision across Meta, Google and email. Every creative, audience and funnel step is tested, tracked and refined daily until performance compounds.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1100&q=80',
  },
  {
    title: 'Results, Scaling & Growth',
    subtitle: "Scale What Works. Cut What Doesn't.",
    body: 'When the numbers speak, we move fast. Budgets shift to what is working, weak points get fixed, and revenue grows consistently month on month.',
    image:
      'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1100&q=80',
  },
];

function ProcessSection() {
  const trackRef = useRef(null);
  const stickyRef = useRef(null);
  const fillRef = useRef(null);
  const itemRefs = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = null;

    const update = () => {
      raf = null;
      const track = trackRef.current;
      const fill = fillRef.current;
      if (!track || !fill) return;

      const trackRect = track.getBoundingClientRect();

      // the bar starts filling when the track's top reaches 65% down the
      // screen, so steps light up well before they reach the centre
      const lineY = window.innerHeight * 0.65;
      const trackH = trackRect.height;
      const items = itemRefs.current;

      // on desktop the bar fills a little faster than you scroll, so it is
      // completely full exactly when the pinned image lets go (the left
      // column's bottom reaching the image's bottom). The last step stays
      // highlighted with its image while the bar finishes filling.
      let travel = trackH;
      const sticky = stickyRef.current;
      if (sticky && getComputedStyle(sticky).position === 'sticky') {
        const imgBottom = parseFloat(getComputedStyle(sticky).top) + sticky.offsetHeight;
        const left = track.parentElement;
        const colBelowTrack = left.getBoundingClientRect().bottom - trackRect.bottom;
        travel = Math.max(trackH + colBelowTrack + lineY - imgBottom, trackH * 0.3);
      }

      let filled = ((lineY - trackRect.top) * trackH) / travel;
      filled = Math.max(0, Math.min(filled, trackH));
      fill.style.height = `${filled}px`;

      // the active step = last one the bar's tip has reached
      let idx = 0;
      items.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top - trackRect.top <= filled) idx = i;
      });
      setActive((prev) => (prev === idx ? prev : idx));
    };

    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="process">
      <div className="process__head">
        <span className="process__eyebrow">Our process, Your Advantage</span>
        <h2 className="process__title">From Strategy To Revenue</h2>
        <p className="process__intro">
          We don&apos;t run campaigns and hope for the best. Every step is built
          with one goal - measurable, scalable revenue for your brand.
        </p>
      </div>

      <div className="process__body">
        {/* left: progress track + steps */}
        <div className="process__left">
          <div className="process__track" ref={trackRef}>
            <div className="process__track-line" />
            <div className="process__track-fill" ref={fillRef} />
          </div>

          <ol className="process__list">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                ref={(el) => (itemRefs.current[i] = el)}
                className={`process__item ${
                  i === active ? 'is-active' : ''
                }`}
              >
                <h3 className="process__item-title">{step.title}</h3>
                <h4 className="process__item-sub">{step.subtitle}</h4>
                <p className="process__item-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* right: sticky crossfading image */}
        <div className="process__media">
          <div className="process__sticky" ref={stickyRef}>
            {STEPS.map((step, i) => (
              <img
                key={step.title}
                className={`process__img ${i === active ? 'is-active' : ''}`}
                src={step.image}
                alt={step.title}
              />
            ))}
          </div>
        </div>
      </div>

      <a
        className="process__cta"
        href="https://calendly.com/samvestor/30-minutes-consultation-call"
        target="_blank"
        rel="noreferrer"
      >
        Book A Strategy Call
      </a>
    </section>
  );
}

export default ProcessSection;
