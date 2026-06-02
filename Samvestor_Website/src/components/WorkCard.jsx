import { useEffect, useRef, useState } from 'react';
import './WorkCard.css';

// milder pool used for the toned-down scramble on the tags line
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/.-';

/**
 * A single project row.
 *
 * Props:
 *  - index : string  -> the small number on the left (e.g. "01")
 *  - name  : string  -> the big title (e.g. "Fashion & Style Brands")
 *  - tags  : string  -> the meta line on the right (e.g. "Meta / Funnels / Email")
 *  - year  : string  -> small text under the tags (optional, e.g. "2024")
 *  - link  : string  -> href the card points to
 *  - image : string  -> background image revealed on hover
 */
function WorkCard({ index, name, tags, year, link, image }) {
  const [tagText, setTagText] = useState(tags);
  const frameRef = useRef(0);
  const rafRef = useRef(null);

  // keep the visible tags in sync if the prop ever changes
  useEffect(() => {
    setTagText(tags);
  }, [tags]);

  // clean up any running animation on unmount
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // toned-down decrypt scramble on the tags: resolves left-to-right,
  // and only a short run of characters scrambles at a time
  const scramble = () => {
    cancelAnimationFrame(rafRef.current);
    frameRef.current = 0;

    const tick = () => {
      const revealed = Math.floor(frameRef.current / 2); // reveal speed
      let out = '';
      for (let i = 0; i < tags.length; i++) {
        const ch = tags[i];
        // keep spaces/slashes intact, and only scramble the next few chars
        if (i < revealed || ch === ' ' || i > revealed + 4) {
          out += ch;
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setTagText(out);
      frameRef.current += 1;

      if (revealed <= tags.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTagText(tags); // settle on the real text
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setTagText(tags);
  };

  return (
    <a
      className="work-card"
      href={link}
      onMouseEnter={scramble}
      onMouseLeave={reset}
    >
      {/* image revealed on hover */}
      <div
        className="work-card__image"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* dark veil so the text stays readable on top of the image */}
      <div className="work-card__veil" />

      <div className="work-card__inner">
        <div className="work-card__left">
          {index && <span className="work-card__index">{index}</span>}
          <h3 className="work-card__name">{name}</h3>
        </div>

        <div className="work-card__right">
          <span className="work-card__tags">{tagText}</span>
          {year && <span className="work-card__year">{year}</span>}
        </div>
      </div>
    </a>
  );
}

export default WorkCard;
