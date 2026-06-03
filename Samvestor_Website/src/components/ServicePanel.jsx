import './ServicePanel.css';

/**
 * One stacking service panel.
 * Each panel is `position: sticky; top: 0` so it pins to the top of the
 * viewport and the next panel slides up and stacks over it on scroll.
 */
function ServicePanel({ number, title, paragraphs, image, bg, accent }) {
  return (
    <article className="panel">
      {/* the inner card is what gets the 3D transform — keeping it off the
          sticky element avoids the pin/unpin jump */}
      <div className="panel__card" style={{ background: bg }}>
        <div className="panel__inner">
        {/* heading row: big title + number */}
        <header className="panel__head">
          <h2 className="panel__title">
            {title.split('\n').map((line, i) => (
              <span key={i} className="panel__title-line">
                {line}
              </span>
            ))}
          </h2>
          <span className="panel__number">{number}</span>
        </header>

        {/* content row: text column + image */}
        <div className="panel__body">
          <div className="panel__text">
            {paragraphs.map((p, i) => (
              <p key={i} className="panel__para">
                {p}
              </p>
            ))}
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
              alt={title.replace('\n', ' ')}
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
