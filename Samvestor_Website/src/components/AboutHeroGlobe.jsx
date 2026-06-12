import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import createGlobe from 'cobe';
import './AboutHero.css'; // reuse the wordmark / states / pin styles
import './AboutHeroGlobe.css'; // globe-specific styles

gsap.registerPlugin(ScrollTrigger, CustomEase);

// same entrance feel as AboutHero
const RISE_EASE = CustomEase.create('heroRiseGlobe', 'M0,0 C0.16,1 0.3,1 1,1');
const RISE_DURATION = 0.75;
const RISE_STAGGER = 0.025;
const RISE_DELAY = 0.3;
const RISE_OFFSET = 1;
const RISE_LEAN = 11;
const RISE_LEAN_DROP = 30;

const BRAND = 'SAMVESTOR'.split('');

// ===================== GLOBE CONFIG =====================
// Scroll rotates the globe from GLOBE_START to focus on GLOBE_TARGET.
// >>> Replace these lat/lng numbers with the coordinate you want to scroll to.
const GLOBE_TARGET = { lat: 30.901, lng: 75.8573 }; // placeholder: Ludhiana
const GLOBE_START = { phi: 0, theta: 0.18 }; // orientation before any scroll
const GLOBE_MARKERS = [
  { location: [GLOBE_TARGET.lat, GLOBE_TARGET.lng], size: 0.07 },
];
const GLOBE_SMOOTH = 0.09; // 0–1; lower = smoother/laggier follow of the scroll target

// cobe helper: a lat/lng -> the [phi, theta] that brings the point to the front
const locationToAngles = (lat, lng) => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

function AboutHeroGlobe() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  // scroll writes the desired rotation here; the globe eases toward it
  const phiTarget = useRef(GLOBE_START.phi);
  const thetaTarget = useRef(GLOBE_START.theta);

  // ---- build the WebGL globe ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    // track the canvas's rendered size so the globe is never stuck at 0/stale
    let width = canvas.offsetWidth || canvas.clientWidth || 600;
    const ro = new ResizeObserver(() => {
      if (canvas.offsetWidth) width = canvas.offsetWidth;
    });
    ro.observe(canvas);

    let curPhi = GLOBE_START.phi;
    let curTheta = GLOBE_START.theta;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: GLOBE_START.phi,
      theta: GLOBE_START.theta,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: 9,
      baseColor: [0.42, 0.45, 0.52], // brighter landmass so it reads on dark bg
      markerColor: [0.85, 0.7, 0.32], // gold #c9a84c
      glowColor: [0.18, 0.22, 0.3],
      markers: GLOBE_MARKERS,
      onRender: (state) => {
        // ease the live rotation toward the scroll-driven target each frame
        curPhi += (phiTarget.current - curPhi) * GLOBE_SMOOTH;
        curTheta += (thetaTarget.current - curTheta) * GLOBE_SMOOTH;
        state.phi = curPhi;
        state.theta = curTheta;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    // fade the globe in once it's actually drawing
    const t = setTimeout(() => {
      canvas.style.opacity = '1';
    }, 0);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      globe.destroy();
    };
  }, []);

  // ---- entrance + scroll state machine (mirrors AboutHero; globe replaces video) ----
  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(sectionRef);
      const brand = q('.ahero__brand')[0];
      const letters = q('.ahero__letter');
      const s2L = q('.ahero__s2-left')[0];
      const s2R = q('.ahero__s2-right')[0];
      const s3L = q('.ahero__s3-left')[0];
      const s3R = q('.ahero__s3-right')[0];

      gsap.set([s2L, s2R, s3L, s3R], { yPercent: -50 });

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reduceMotion) {
        gsap.set(letters, { y: 0, skewX: 0 });
      } else {
        const last = letters.length - 1;
        const progress = (i) => (last > 0 ? i / last : 0);
        gsap.from(letters, {
          y: (i, target) =>
            target.parentElement.getBoundingClientRect().height * RISE_OFFSET +
            RISE_LEAN_DROP * progress(i),
          skewX: (i) => -RISE_LEAN * progress(i),
          transformOrigin: '0% 100%',
          duration: RISE_DURATION,
          ease: RISE_EASE,
          stagger: RISE_STAGGER,
          delay: RISE_DELAY,
        });
      }

      // the [phi, theta] that faces the target coordinate
      const [focusPhi, focusTheta] = locationToAngles(
        GLOBE_TARGET.lat,
        GLOBE_TARGET.lng
      );

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            // map scroll progress -> rotate the globe from start to the target
            const p = self.progress;
            phiTarget.current =
              GLOBE_START.phi + (focusPhi - GLOBE_START.phi) * p;
            thetaTarget.current =
              GLOBE_START.theta + (focusTheta - GLOBE_START.theta) * p;
          },
        },
      });

      tl.to(brand, { y: -60, autoAlpha: 0, ease: 'power1.in', duration: 1 }, 3.8);
      tl.from(s2L, { xPercent: -135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 0.6);
      tl.from(s2R, { xPercent: 135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 0.6);
      tl.to([s2L, s2R], { autoAlpha: 0, y: -40, ease: 'power2.in', duration: 1 }, 2.6);
      tl.from(s3L, { xPercent: -135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 2.85);
      tl.from(s3R, { xPercent: 135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 2.85);
      tl.to({}, { duration: 0.8 });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="ahero ahero--globe" ref={sectionRef}>
      <div className="ahero__pin">
        <canvas ref={canvasRef} className="ahero__globe" />
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

export default AboutHeroGlobe;
