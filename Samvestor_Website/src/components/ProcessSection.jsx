import { useEffect, useRef, useState } from 'react';
import './ProcessSection.css';

/**
 * Each step has its own image. As a step becomes "active" (its top crosses
 * the vertical centre of the viewport) the sticky image crossfades to it and
 * the gold progress bar's leading tip sits at that centre line.
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
      const centerY = window.innerHeight / 2;

      // grow the gold bar so its tip sits at the vertical centre of the screen
      let filled = centerY - trackRect.top;
      filled = Math.max(0, Math.min(filled, trackRect.height));
      fill.style.height = `${filled}px`;

      // the active step = last one whose top has crossed the centre line
      let idx = 0;
      itemRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= centerY) idx = i;
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
          <div className="process__sticky">
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
