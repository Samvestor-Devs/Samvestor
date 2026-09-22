'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import createGlobe from 'cobe';
import useTheme from '../lib/useTheme';
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

// globe look per theme (cobe colours are 0–1 RGB)
const GLOBE_LOOK = {
  dark: {
    dark: 1,
    diffuse: 1.4,
    mapBrightness: 9,
    baseColor: [0.42, 0.45, 0.52], // brighter landmass so it reads on dark bg
    markerColor: [0.85, 0.7, 0.32], // gold #c9a84c
    glowColor: [0.18, 0.22, 0.3],
  },
  light: {
    dark: 0,
    diffuse: 1.2,
    mapBrightness: 5,
    baseColor: [0.83, 0.88, 0.94], // pale navy-tinted sphere on white
    markerColor: [0.79, 0.62, 0.2],
    glowColor: [0.93, 0.95, 0.98],
  },
};

// cobe helper: a lat/lng -> the [phi, theta] that brings the point to the front
const locationToAngles = (lat, lng) => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

function AboutHeroGlobe() {
  const theme = useTheme();
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

    // start from wherever scroll has the globe (matters when the theme
    // switches mid-page and the globe is rebuilt)
    let curPhi = phiTarget.current;
    let curTheta = thetaTarget.current;

    const look = GLOBE_LOOK[theme] ?? GLOBE_LOOK.dark;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: curPhi,
      theta: curTheta,
      mapSamples: 16000,
      ...look,
      markers: GLOBE_MARKERS,
    });

    // cobe v2 has no render loop of its own — drive it: ease toward the
    // scroll target, plus a slow idle drift so the scene is always alive
    // (like Lusion's). Paused while the hero is off-screen.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let idle = 0;
    let raf = 0;
    let visible = true;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (!reduceMotion) idle += 0.0012;
      curPhi += (phiTarget.current + idle - curPhi) * GLOBE_SMOOTH;
      curTheta += (thetaTarget.current - curTheta) * GLOBE_SMOOTH;
      globe.update({ phi: curPhi, theta: curTheta, width: width * 2, height: width * 2 });
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    // fade the globe in once it's actually drawing
    const t = setTimeout(() => {
      canvas.style.opacity = '1';
    }, 0);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      globe.destroy();
    };
    // rebuilt when the theme changes — cobe can't recolour a live globe
  }, [theme]);

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
          // the wordmark's rise is a share of the screen height
          invalidateOnRefresh: true,
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

      // Figma order: the wordmark rises to the top of the screen first, the
      // first pair of lines slides in beneath it, then the wordmark leaves
      // and the second pair takes over.
      tl.fromTo(brand, { y: 0 }, { y: () => -window.innerHeight * 0.62, ease: 'power2.inOut', duration: 1.1 }, 0);
      tl.from(s2L, { xPercent: -135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 0.55);
      tl.from(s2R, { xPercent: 135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 0.7);
      tl.to(brand, { autoAlpha: 0, y: () => -window.innerHeight * 0.9, ease: 'power1.in', duration: 0.8 }, 2.3);
      tl.to([s2L, s2R], { autoAlpha: 0, y: -40, ease: 'power2.in', duration: 1 }, 2.6);
      tl.from(s3L, { xPercent: -135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 2.85);
      tl.from(s3R, { xPercent: 135, autoAlpha: 0, ease: 'power3.out', duration: 1.2 }, 3.0);
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
