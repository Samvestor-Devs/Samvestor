import { useEffect, useState } from 'react';
import './Preloader.css';
import logo from '../assets/sv-logo.png';

/**
 * Instagram-style preloader: the SamVestor wordmark is "drawn on" by a
 * travelling beam, a metallic shimmer sweeps across it, then the whole
 * screen scales up and fades away to reveal the site.
 */
function Preloader({ onFinish }) {
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // when the exit (scale + fade) should begin, and how long it lasts
    const holdFor = reduceMotion ? 600 : 2600;
    const exitFor = reduceMotion ? 300 : 700;

    // lock scrolling while the splash is up
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const startExit = window.setTimeout(() => setExiting(true), holdFor);
    const finish = window.setTimeout(() => {
      setHidden(true);
      document.body.style.overflow = prevOverflow;
      onFinish?.();
    }, holdFor + exitFor);

    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(finish);
      document.body.style.overflow = prevOverflow;
    };
  }, [onFinish]);

  if (hidden) return null;

  return (
    <div
      className={`preloader${exiting ? ' preloader--exit' : ''}`}
      role="status"
      aria-label="Loading SamVestor"
      style={{ '--sv-logo': `url(${logo})` }}
    >
      <div className="preloader__stage">
        <div className="preloader__reveal">
          <img className="preloader__img" src={logo} alt="SamVestor" />
          <span className="preloader__shine" aria-hidden="true" />
        </div>
        <span className="preloader__beam" aria-hidden="true" />
      </div>
    </div>
  );
}

export default Preloader;
