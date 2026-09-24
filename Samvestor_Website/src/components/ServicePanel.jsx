'use client';

import { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './ServicePanel.css';

/**
 * One stacking service panel.
 * Each panel is `position: sticky; top: 0` so it pins to the top of the
 * viewport and the next panel slides up and stacks over it on scroll.
 */
function ServicePanel({ number, title, paragraphs, image, bg, light = {}, accent }) {
  // Phones only. The full copy is far too long for a card that has to fit the
  // screen, so the card always shows a short extract and "Read more" opens the
  // rest in a sheet over the page. Growing the card in place fought the
  // stack — it had to be un-pinned, which moved the card under the reader's
  // thumb, and every scroll position below it shifted. The sheet leaves the
  // page completely untouched.
  const [open, setOpen] = useState(false);

  // while the sheet is up: lock the page behind it and let Escape close it
  useEffect(() => {
    if (!open) return undefined;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const plainTitle = title.replace(/[\n|]/g, ' ').replace(/\s+/g, ' ').trim();
  const panelColors = {
    '--panel-bg': bg,
    '--panel-bg-light': light.bg,
    '--panel-ink-light': light.ink,
    '--panel-text-light': light.text,
  };

  const sheet = (
    <div className="panel-sheet" role="dialog" aria-modal="true" aria-label={plainTitle}>
      <button
        type="button"
        className="panel-sheet__scrim"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <div className="panel-sheet__card" style={panelColors}>
        <div className="panel-sheet__grip" aria-hidden="true" />
        <header className="panel-sheet__head">
          <span className="panel-sheet__number">{number}</span>
          <h2 className="panel-sheet__title">{plainTitle}</h2>
          <button
            type="button"
            className="panel-sheet__close"
            onClick={() => setOpen(false)}
            aria-label={`Close ${plainTitle}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="panel-sheet__body">
          <img className="panel-sheet__img" src={image} alt="" />
          {paragraphs.map((p, i) => (
            <p key={i} className="panel-sheet__para">
              {p}
            </p>
          ))}
          <a className={`panel__cta panel__cta--${accent} panel-sheet__cta`} href="#">
            Book A Call
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <article className="panel">
      {/* the inner card is what gets the 3D transform — keeping it off the
          sticky element avoids the pin/unpin jump */}
      <div className="panel__card" style={panelColors}>
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
            <div className="panel__copy">
              {paragraphs.map((p, i) => (
                <p key={i} className="panel__para">
                  {p}
                </p>
              ))}
            </div>
            <button type="button" className="panel__more" onClick={() => setOpen(true)}>
              Read more
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
              alt={plainTitle}
            />
          </div>
        </div>
        </div>
        {/* darkens as the card recedes — adds depth */}
        <div className="panel__overlay" />
      </div>

      {/* the sheet goes on <body>: the card itself carries a 3D transform
          while it recedes, and a fixed child of a transformed element is
          trapped inside it instead of covering the screen */}
      {/* `open` only ever becomes true from a click, so there is a document
          here — no need to track mounting for the server render */}
      {open && createPortal(sheet, document.body)}
    </article>
  );
}

export default ServicePanel;
