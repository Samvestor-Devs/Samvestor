import { useRef, useState } from 'react';
import WorkCard from './WorkCard';
import './WorkSection.css';

/**
 * The data for each card. Swap these out / add more freely —
 * every entry becomes one <WorkCard /> instance.
 * Each card has: name, tags, link, image (+ optional index, year).
 */
const PROJECTS = [
  {
    index: '01',
    name: 'Fashion & Style Brands',
    tags: 'Meta / Funnels / Email / Retention / CRO',
    year: '2024',
    link: '#',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
  },
  {
    index: '02',
    name: 'FMCG / Masala Brand',
    tags: 'Meta / FMCG / Creative Angles / Retargeting',
    year: '2024',
    link: '#',
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&q=80',
  },
  {
    index: '03',
    name: 'Bedding & Home Comfort',
    tags: 'Meta / Creative Testing / Retargeting / CRO',
    year: '2024',
    link: '#',
    image:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80',
  },
  {
    index: '04',
    name: 'Footwear & Lifestyle',
    tags: 'Optimization / Funnels / Scaling / Google / Meta',
    year: '2024',
    link: '#',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80',
  },
];

function WorkSection() {
  const sectionRef = useRef(null);
  const cursorRef = useRef(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorLarge, setCursorLarge] = useState(false);

  // move the custom cursor with the mouse, positioned relative to the section
  const handleMouseMove = (e) => {
    const cursor = cursorRef.current;
    const section = sectionRef.current;
    if (!cursor || !section) return;
    const rect = section.getBoundingClientRect();
    cursor.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top
      }px) translate(-50%, -50%)`;

    // grow only while hovering an anchor (card or button)
    setCursorLarge(!!e.target.closest('a'));
  };

  return (
    <section
      ref={sectionRef}
      className="work-section"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setCursorVisible(true)}
      onMouseLeave={() => setCursorVisible(false)}
    >
      {/* the big 40x40 circle cursor with a blend filter */}
      <div
        ref={cursorRef}
        className={`work-cursor ${cursorVisible ? 'is-visible' : ''} ${cursorLarge ? 'is-large' : ''
          }`}
      />

      <div className="work-section__list">
        {PROJECTS.map((project) => (
          <WorkCard key={project.name} {...project} />
        ))}
      </div>

      <div className="work-section__cta">
        <a className="work-section__button" href="#">
          Discover More
        </a>
      </div>
    </section>
  );
}

export default WorkSection;
