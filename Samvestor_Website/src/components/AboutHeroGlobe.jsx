'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import createGlobe from 'cobe';
import useTheme from '../lib/useTheme';
import './AboutHero.css'; // reuse the wordmark / states / pin styles
import './AboutHeroGlobe.css'; // globe-specific styles

gsap.registerPlugin(ScrollTrigger);

// wordmark entrance once the intro wipes away: each letter swings up out of
// the floor in 3D, stretched and fanned, then settles — a wave left to right
const RISE_DURATION = 1.6;
const RISE_STAGGER = 0.06;
const RISE_TILT = -80; // rotationX the letters start at (deg)
const RISE_FAN = 3; // extra lean per letter away from the centre (deg)
const RISE_PERSPECTIVE = 900; // same value at both ends of the tween

// calls back as the site preloader starts fading out (or right away if it
// isn't up, e.g. after a client-side navigation), so the wordmark rises into
// view instead of playing hidden under the splash
function whenSplashLeaves(callback) {
  const splashUp = () => {
    const el = document.querySelector('.preloader');
    return el && !el.classList.contains('preloader--exit');
  };
  if (!splashUp()) {
    callback();
    return () => {};
  }
  const mo = new MutationObserver(() => {
    if (splashUp()) return;
    mo.disconnect();
    callback();
  });
  mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
}

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
    let stopWaiting = () => {};
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
        gsap.set(letters, { clearProps: 'transform' });
      } else {
        const mid = (letters.length - 1) / 2;
        const entrance = gsap.fromTo(
          letters,
          {
            yPercent: 115,
            rotationX: RISE_TILT,
            rotation: (i) => (i - mid) * RISE_FAN,
            scaleY: 1.35,
            transformOrigin: '50% 100%',
            transformPerspective: RISE_PERSPECTIVE,
          },
          {
            yPercent: 0,
            rotationX: 0,
            rotation: 0,
            scaleY: 1,
            transformPerspective: RISE_PERSPECTIVE,
            duration: RISE_DURATION,
            ease: 'expo.out',
            stagger: RISE_STAGGER,
            paused: true,
          }
        );
        stopWaiting = whenSplashLeaves(() => entrance.play());
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

    return () => {
      stopWaiting();
      ctx.revert();
    };
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
