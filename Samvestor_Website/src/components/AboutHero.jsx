import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import './AboutHero.css';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// Heavy, decelerating ease — the exact cubic-bezier(0.16, 1, 0.3, 1).
// To change the easing feel, edit the 4 control numbers in the SVG path:
// 'M0,0 C<x1>,<y1> <x2>,<y2> 1,1'  (i.e. cubic-bezier(x1, y1, x2, y2)).
const RISE_EASE = CustomEase.create('heroRise', 'M0,0 C0.16,1 0.3,1 1,1');

// ---- entrance feel: tweak these knobs to fine-tune ----
const RISE_DURATION = 0.75; // per-letter travel time, seconds (try 0.7–0.85)
const RISE_STAGGER = 0.025; // gap between letters, seconds (try 0.02–0.03; near-together)
const RISE_DELAY = 0.3; // beat before it starts, after the hero is visible
const RISE_OFFSET = 1; // start depth in mask-heights (1 = exactly hidden; raise to start lower)
// progressive lean: a stiff sheet hinged at the bottom-left. The left letter is
// upright (0); the lean grows with index so the RIGHT end leans most + drops
// most, swinging up last. Both settle to 0 on the same ease.
const RISE_LEAN = 11; // max skewX (deg) at the right end; left ~0 (try 8–12)
const RISE_LEAN_DROP = 30; // max extra px drop at the right end (bigger arc); left ~0

// swap for your real footage later
const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

const BRAND = 'SAMVESTOR'.split('');

function AboutHero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(sectionRef);
      const brand = q('.ahero__brand')[0];
      const letters = q('.ahero__letter');
      const s2L = q('.ahero__s2-left')[0];
      const s2R = q('.ahero__s2-right')[0];
      const s3L = q('.ahero__s3-left')[0];
      const s3R = q('.ahero__s3-right')[0];

      // centre the State 2/3 text blocks vertically on their anchor
      gsap.set([s2L, s2R, s3L, s3R], { yPercent: -50 });

      // ---- intro on load: LUSION-style masked rise. Each letter starts fully
      // hidden below its clip mask and slides straight up into place, staggered
      // left to right with a heavy ease-out. Transform-only, plays once. ----
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reduceMotion) {
        // accessibility: skip the rise, leave the word at rest (upright, y 0)
        gsap.set(letters, { y: 0, skewX: 0 });
      } else {
        // from() commits the hidden start state via immediateRender, then each
        // letter rises up AND un-leans to settle. The start lean/drop scale with
        // index (progress 0 at the left, 1 at the right), so the word reveals
        // like a stiff sheet hinged at its bottom-left: left edge anchored and
        // already upright, the lean increasing toward the right, the far end
        // travelling the largest arc and (via the L->R stagger) settling last.
        // Horizontal skewX shear leaves the vertical mask clip intact.
        const last = letters.length - 1;
        const progress = (i) => (last > 0 ? i / last : 0);

        gsap.from(letters, {
          // base offset keeps every letter fully below the hard cut at t=0;
          // the per-index extra makes the right end start lower (bigger arc)
          y: (i, target) =>
            target.parentElement.getBoundingClientRect().height * RISE_OFFSET +
            RISE_LEAN_DROP * progress(i),
          // negative skewX (with the bottom-left origin) leans the top to the
          // RIGHT; 0 on the left, full angle on the right
          skewX: (i) => -RISE_LEAN * progress(i),
          transformOrigin: '0% 100%', // hinge at the bottom-left corner
          duration: RISE_DURATION,
          ease: RISE_EASE,
          stagger: RISE_STAGGER, // L -> R, so the leaned right end settles last
          delay: RISE_DELAY,
        });
      }

      // ---- scroll-driven state machine (sticky track + scrub) ----
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          // scrub the background video with scroll progress
          onUpdate: (self) => {
            const v = videoRef.current;
            if (v && v.duration) v.currentTime = self.progress * v.duration;
          },
        },
      });

      // State 1 (SAMVESTOR) stays fixed at the bottom for most of the scroll,
      // then gently drifts up + fades only near the END of the pinned range.
      // (No per-letter re-animation — the whole wordmark moves as one.)
      tl.to(
        brand,
        { y: -60, autoAlpha: 0, ease: 'power1.in', duration: 1 },
        3.8
      );
      // State 2 slides in from the sides
      tl.from(s2L, { xPercent: -135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 0.6);
      tl.from(s2R, { xPercent: 135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 0.6);
      // State 2 out
      tl.to([s2L, s2R], { autoAlpha: 0, y: -40, ease: 'power2.in', duration: 1 }, 2.6);
      // State 3 slides in
      tl.from(s3L, { xPercent: -135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 2.85);
      tl.from(s3R, { xPercent: 135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 2.85);
      // a little tail so the last state holds before the section releases
      tl.to({}, { duration: 0.8 });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // prime the video so it can be seeked (some browsers need a play/pause first)
  const handleLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && p.then) p.then(() => v.pause()).catch(() => {});
  };

  return (
    <section className="ahero" ref={sectionRef}>
      <div className="ahero__pin">
        <video
          ref={videoRef}
          className="ahero__video"
          src={SAMPLE_VIDEO}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoaded}
        />
        <div className="ahero__overlay" />

        {/* State 1 */}
        <h1 className="ahero__brand">
          {BRAND.map((ch, i) => (
            <span key={i} className="ahero__letter-mask">
              <span className="ahero__letter">{ch}</span>
            </span>
          ))}
        </h1>

        {/* State 2 */}
        <p className="ahero__text ahero__s2-left">
          FROM A BEDROOM IN LUDHIANA TO RS. 450+ CR.
        </p>
        <p className="ahero__text ahero__s2-right">
          IN CLIENTELE REVENUE AND STILL COUNTING
        </p>

        {/* State 3 */}
        <p className="ahero__text ahero__s3-left">
          A tight team of specialists in performance marketing, content and
          strategy
        </p>
        <p className="ahero__text ahero__s3-right">
          working together to help brands grow faster and scale bigger.
        </p>
      </div>
    </section>
  );
}

export default AboutHero;
