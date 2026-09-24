'use client';

import { Fragment, useId, useLayoutEffect, useRef, useState } from 'react';
import './ServicePanel.css';

/**
 * One stacking service panel.
 * Each panel is `position: sticky; top: 0` so it pins to the top of the
 * viewport and the next panel slides up and stacks over it on scroll.
 */
function ServicePanel({ number, title, paragraphs, image, bg, light = {}, accent }) {
  // phones only: the full copy is a long read on a narrow screen, so it starts
  // clamped to a few lines behind a "Read more". The CSS reveals the toggle
  // under 900px and leaves the copy fully open above it.
  const [open, setOpen] = useState(false);
  const copyId = useId();
  const articleRef = useRef(null);
  const anchorRef = useRef(null);

  // remember where the card sits on screen before the toggle, so the jump
  // below can be undone
  const toggle = () => {
    anchorRef.current = articleRef.current?.getBoundingClientRect().top ?? null;
    setOpen((v) => !v);
  };

  useLayoutEffect(() => {
    const el = articleRef.current;
    if (!el || anchorRef.current === null) return;

    // opening un-pins the card (see the CSS), so a card that was stuck to the
    // top of the screen snaps down to its place in the flow — on a phone that
    // threw the heading right off screen. Scroll by the same amount to keep
    // the card exactly where the reader left it.
    const drift = el.getBoundingClientRect().top - anchorRef.current;
    if (drift) window.scrollBy(0, drift);
    anchorRef.current = null;

    // the page just grew or shrank by a few hundred pixels, so every scroll
    // position measured below this card is now wrong
    window.dispatchEvent(new CustomEvent('sv:panel-toggle'));
  }, [open]);

  return (
    <article className={`panel${open ? ' panel--open' : ''}`} ref={articleRef}>
      {/* the inner card is what gets the 3D transform — keeping it off the
          sticky element avoids the pin/unpin jump */}
      <div
        className="panel__card"
        style={{
          '--panel-bg': bg,
          '--panel-bg-light': light.bg,
          '--panel-ink-light': light.ink,
          '--panel-text-light': light.text,
        }}
      >
        <div className="panel__inner">
        {/* heading row: big title + number */}
        <header className="panel__head">
          <h2 className="panel__title">
            {title.split('\n').map((line, i) => (
              <span key={i} className="panel__title-line">
                {line.split('|').map((part, j, parts) =>
                  j < parts.length - 1 ? (
                    <Fragment key={j}>
                      {part}{' '}
                      <br className="panel__title-br" />
                    </Fragment>
                  ) : (
                    part
                  )
                )}
              </span>
            ))}
          </h2>
          <span className="panel__number">{number}</span>
        </header>

        {/* content row: text column + image */}
        <div className="panel__body">
          <div className="panel__text">
            <div
              className={`panel__copy${open ? ' panel__copy--open' : ''}`}
              id={copyId}
            >
              {paragraphs.map((p, i) => (
                <p key={i} className="panel__para">
                  {p}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="panel__more"
              aria-expanded={open}
              aria-controls={copyId}
              onClick={toggle}
            >
              {open ? 'Read less' : 'Read more'}
            </button>
            <a
              className={`panel__cta panel__cta--${accent}`}
              href="#"
            >
              Book A Call
            </a>
          </div>

          <div className="panel__media">
            <img
              className="panel__img"
              src={image}
              alt={title.replace(/[\n|]/g, ' ')}
            />
          </div>
        </div>
        </div>
        {/* darkens as the card recedes — adds depth */}
        <div className="panel__overlay" />
      </div>
    </article>
  );
}

export default ServicePanel;
