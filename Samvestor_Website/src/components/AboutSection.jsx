import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutSection.css';

gsap.registerPlugin(ScrollTrigger);

const TEXT =
  'Most agencies celebrate impressions. We celebrate bank transfers. Every ' +
  'founder who walks through our door gets one promise - we treat your money ' +
  'like it is ours. We lose sleep over your numbers. We fight over your ' +
  'creatives. We obsess over your funnel. Not because we have to. Because we ' +
  'built Samvestor for founders who are serious about growth - and we take ' +
  'that seriously too.';

const WORDS = TEXT.split(' ');

function AboutSection() {
  const sectionRef = useRef(null);
  const wordRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = wordRefs.current.filter(Boolean);

      // scroll-driven via a sticky track: each word starts fully off-screen to
      // the right (hidden) and flies in to its place as you scroll. fromTo +
      // immediateRender guarantees the hidden start state is committed on load
      // (so nothing flashes into view before the first scroll). No fade — both
      // ends are fully opaque, only the position animates.
      gsap.fromTo(
        words,
        { x: () => window.innerWidth, autoAlpha: 1 },
        {
          x: 0,
          autoAlpha: 1,
          immediateRender: true,
          duration: 1.4,
          ease: 'power2.out',
          // smaller stagger than the duration => several words are mid-flight
          // at once, each starting a little after the last (a smooth cascade)
          stagger: 0.18,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1, // 1s smoothing so motion eases toward the scroll position
            invalidateOnRefresh: true, // re-read window width on resize
          },
        }
      );
    }, sectionRef);

    // fonts load after first paint and shift layout — recompute trigger
    // positions once they're ready so the start state stays correct
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh);
    }
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section className="about" ref={sectionRef}>
      <div className="about__sticky">
        <p className="about__text">
          {WORDS.map((word, i) => (
            <span key={i} className="about__word-wrap">
              <span
                className="about__word"
                ref={(el) => (wordRefs.current[i] = el)}
              >
                {word}
              </span>
              {i < WORDS.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export default AboutSection;
