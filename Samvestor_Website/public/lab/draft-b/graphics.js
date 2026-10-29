/* ─────────────────────────────────────────────────────────────────────
   Service diagrams

   Six drawings, one per service, in the brand's own colours.

   Stock photography was the obvious thing to put here and the wrong
   one: six pictures of people at laptops say nothing about paid
   acquisition that six different pictures of people at laptops would
   not also say. A diagram of the actual mechanism is both honest and
   more interesting to look at — and it is drawn rather than licensed,
   so it belongs to the brand.

   Every path carries pathLength="1", so the draw-in animation is one
   dasharray value for every shape regardless of its real length.
   ───────────────────────────────────────────────────────────────────── */

const W = 168;
const H = 120;

const wrap = (inner) =>
    `<svg class="dia" viewBox="0 0 ${W} ${H}" fill="none" aria-hidden="true" focusable="false">${inner}</svg>`;

/* 01 — Paid acquisition.
   Scattered audience, concentric rings tightening onto the few that
   convert. The dots outside the rings are the point: most of what you
   can reach is not what you are looking for. */
const acquisition = () => {
    const dots = [];
    for (let i = 0; i < 26; i++) {
        const a = (i * 2.399) % (Math.PI * 2);
        const r = 26 + ((i * 7) % 38);
        dots.push(
            `<circle class="d" cx="${(84 + Math.cos(a) * r).toFixed(1)}" cy="${(60 + Math.sin(a) * r * 0.62).toFixed(1)}" r="1.3"/>`
        );
    }
    return wrap(`
      <g class="dim">${dots.join('')}</g>
      <ellipse class="s" cx="84" cy="60" rx="56" ry="35" pathLength="1"/>
      <ellipse class="s g" cx="84" cy="60" rx="34" ry="21" pathLength="1"/>
      <ellipse class="s g" cx="84" cy="60" rx="14" ry="9" pathLength="1"/>
      <circle class="dot" cx="84" cy="60" r="2.6"/>
    `);
};

/* 02 — Creative & production.
   A test grid. Three cells carry a result; the rest were the cost of
   finding them, which is the part people leave out. */
const creative = () => {
    const cells = [];
    const win = new Set([2, 6, 9]);
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            const i = r * 4 + c;
            cells.push(
                `<rect class="s${win.has(i) ? ' g' : ' dim'}" x="${18 + c * 34}" y="${22 + r * 27}" width="27" height="21" rx="1.5" pathLength="1"/>`
            );
        }
    }
    return wrap(cells.join(''));
};

/* 03 — Funnel & CRO.
   Four stages, each narrower, with the gold bar marking the step where
   the drop is steepest — the one worth fixing before buying more
   traffic. */
const funnel = () =>
    wrap(`
      <path class="s" d="M14 20 H154 L124 50 H44 Z" pathLength="1"/>
      <path class="s" d="M44 56 H124 L110 82 H58 Z" pathLength="1"/>
      <path class="s g" d="M58 88 H110 L100 108 H68 Z" pathLength="1"/>
      <line class="s dim" x1="128" y1="50" x2="152" y2="50" pathLength="1"/>
      <line class="s dim" x1="114" y1="82" x2="152" y2="82" pathLength="1"/>
      <circle class="dot" cx="156" cy="50" r="2"/>
      <circle class="dot" cx="156" cy="82" r="2"/>
    `);

/* 04 — Email & WhatsApp.
   One trigger, a branch, and the flows that run whether or not anyone
   sends a campaign that week. */
const flows = () =>
    wrap(`
      <circle class="dot g" cx="20" cy="60" r="4"/>
      <path class="s" d="M26 60 H52 C60 60 60 30 68 30 H96" pathLength="1"/>
      <path class="s" d="M26 60 H52 C60 60 60 60 68 60 H96" pathLength="1"/>
      <path class="s" d="M26 60 H52 C60 60 60 90 68 90 H96" pathLength="1"/>
      <rect class="s g" x="98" y="21" width="48" height="18" rx="1.5" pathLength="1"/>
      <rect class="s" x="98" y="51" width="48" height="18" rx="1.5" pathLength="1"/>
      <rect class="s dim" x="98" y="81" width="48" height="18" rx="1.5" pathLength="1"/>
    `);

/* 05 — Measurement.
   Axes, a read, and the line through it. The gold mark is the number
   the rest of the site keeps saying is the only one that counts. */
const measure = () => {
    const bars = [34, 52, 40, 66, 58, 82, 74].map(
        (h, i) =>
            `<rect class="s${i === 5 ? ' g' : ' dim'}" x="${26 + i * 19}" y="${104 - h}" width="11" height="${h}" pathLength="1"/>`
    );
    return wrap(`
      <line class="s" x1="16" y1="12" x2="16" y2="104" pathLength="1"/>
      <line class="s" x1="16" y1="104" x2="158" y2="104" pathLength="1"/>
      ${bars.join('')}
      <path class="s g" d="M31 74 L50 58 L69 66 L88 42 L107 48 L126 26 L145 32" pathLength="1"/>
    `);
};

/* 06 — Retention.
   Cohorts down, months across. The gold row is the one that came back,
   which is what decides how much the first order was allowed to cost. */
const retention = () => {
    const cells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
            const strength = Math.max(0, 1 - c * 0.17 - r * 0.08);
            cells.push(
                `<rect class="cell${r === 1 ? ' g' : ''}" x="${18 + c * 24}" y="${24 + r * 20}" width="20" height="16" rx="1" opacity="${(0.12 + strength * 0.68).toFixed(2)}"/>`
            );
        }
    }
    return wrap(`
      ${cells.join('')}
      <path class="s g" d="M22 112 C60 112 74 96 100 92 C124 88 140 86 160 85" pathLength="1"/>
    `);
};

export const DIAGRAMS = {
    'Paid acquisition': acquisition,
    'Creative & production': creative,
    'Funnel & CRO': funnel,
    'Email & WhatsApp': flows,
    Measurement: measure,
    Retention: retention,
};

export const diagramFor = (name) => (DIAGRAMS[name] ? DIAGRAMS[name]() : '');
