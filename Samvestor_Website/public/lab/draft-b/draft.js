/* ─────────────────────────────────────────────────────────────────────
   Samvestor — draft B

   Same content file as draft A, different page. Everything here is in
   service of one structural idea borrowed from the reference: the page
   is a stack of islands on a coloured ground, each one framed like an
   instrument, and exactly one of them flips the colour.

   Three interactions carry it:

     · a wireframe globe behind the hero, turning on its own and
       leaning toward the pointer;
     · a floating preview that follows the cursor down the row lists,
       which is the reference's strongest single move;
     · an accordion, a marquee and a drawn timeline, all cheap.

   The renderer stops once the hero leaves, so the rest of the page
   costs nothing on the GPU.
   ───────────────────────────────────────────────────────────────────── */

import * as THREE from 'three';
import { HERO, SECTIONS, CONTACT, META, STRIP, BREAK } from './content.js';
import { diagramFor } from './graphics.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const find = (id) => SECTIONS.find((s) => s.id === id);

/* Small shared pieces. */
const arrow =
    '<s><svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" stroke-width="1.6"/></svg></s>';

const hud = '<div class="hud"><i></i><i></i><i></i><i></i></div>';

const head = (n, text) =>
    `<p class="head mono" data-rise><b>${esc(n)}</b><span>${esc(text)}</span><i></i></p>`;

const lines = (arr) => arr.map((t) => `<span>${esc(t)}</span>`).join('');

/* ── Build ─────────────────────────────────────────────────────────── */

const app = document.getElementById('app');
const nav = document.getElementById('nav');

const position = find('position');
const services = find('services');
const process = find('process');
const fit = find('fit');
const work = find('work');
const engagement = find('engagement');
const questions = find('questions');

/* Hero. The display line owns the full width of its panel; everything
   else in here is small, mono and out of its way. */
const hero = `
<section class="hero" id="hero">
  <canvas id="globe"></canvas>
  ${hud}
  <div class="rule rule--top"></div>
  <div class="rule rule--bot"></div>

  <div class="hero__top mono">${esc(HERO.eyebrow)}</div>

  <div class="hero__mid">
    <b class="hero__name mono">${esc(META.name)}</b>
    <h1 class="giant hero__title">${lines(HERO.title)}</h1>
    <p class="lede hero__lede">${esc(HERO.lede)}</p>
    <div class="hero__acts">
      ${HERO.actions
          .map(
              (a) =>
                  `<a class="btn${a.primary ? ' btn--solid' : ''}" href="${esc(a.href)}">${esc(a.label)}${arrow}</a>`
          )
          .join('')}
    </div>
  </div>

  <div class="hero__foot mono">
    <span>© ${new Date().getFullYear()} ${esc(META.name)} — ${esc(META.located)}</span>
    <span class="clock" id="clock"><b></b><span id="clockT">--:--:--</span> IST</span>
  </div>
</section>`;

/* The tape. Two identical tracks, because one snaps back visibly at
   the loop and the second starts exactly where the first ends. */
const tapeTrack = (hidden) =>
    `<div class="tape__track"${hidden ? ' aria-hidden="true"' : ''}>${STRIP.map(
        (s) => `<span>${esc(s)}</span><i></i>`
    ).join('')}</div>`;

const tape = `<div class="tape"><div class="tape__row">${tapeTrack(false)}${tapeTrack(true)}</div></div>`;

/* Position — the one statement section, set as big as it will go. */
const statement = `
<section class="pan pan--navy" id="position" data-watch>
  ${hud}
  ${head(position.n, position.kicker)}
  <div class="state">
    <h2 class="big state__t" data-rise>${lines(position.title)}</h2>
    <p class="lede" data-rise>${esc(position.body)}</p>
  </div>
</section>`;

/* Services — six cards, each carrying the drawing of its own
   mechanism rather than a photograph of somebody at a laptop. */
const svcs = `
<section class="pan" id="services" data-watch>
  ${hud}
  ${head(services.n, services.kicker)}
  <div class="state" style="margin-bottom:clamp(30px,3.8vw,52px)">
    <h2 class="big" data-rise>${lines(services.title)}</h2>
    <p class="lede" data-rise>${esc(services.intro)}</p>
  </div>
  <div class="svcs">
    ${services.items
        .map(
            (it, i) => `
      <article class="svc" data-rise>
        <span class="svc__n mono">(${String(i + 1).padStart(2, '0')})</span>
        ${diagramFor(it.name)}
        <h3 class="svc__name">${esc(it.name)}</h3>
        <span class="svc__meta mono">${esc(it.meta)}</span>
        <p class="svc__body">${esc(it.body)}</p>
      </article>`
        )
        .join('')}
  </div>
</section>`;

/* The colour flip. The reference puts its client logos here; we put
   the thing we can actually say, on the loudest ground on the page. */
const fitSec = `
<section class="pan pan--gold" id="fit" data-watch>
  ${hud}
  ${head(fit.n, fit.kicker)}
  <div class="state">
    <h2 class="big" data-rise>${lines(fit.title)}</h2>
    <p class="lede" data-rise>${esc(fit.intro)}</p>
  </div>
  <div class="fit">
    <div class="fit__col fit__col--yes" data-rise>
      <h3 class="fit__h">${esc(fit.yes.head)}</h3>
      <ul>${fit.yes.items.map((t, i) => `<li><em>0${i + 1}</em>${esc(t)}</li>`).join('')}</ul>
    </div>
    <div class="fit__col fit__col--no" data-rise>
      <h3 class="fit__h">${esc(fit.no.head)}</h3>
      <ul>${fit.no.items.map((t, i) => `<li><em>0${i + 1}</em>${esc(t)}</li>`).join('')}</ul>
    </div>
  </div>
</section>`;

/* Row lists. Process and work are the same module with different
   furniture — a numbered row that lights on hover and floats its
   photograph next to the cursor. */
const rowList = (sec, tagsOf) => `
<section class="pan${sec.id === 'work' ? ' pan--navy' : ''}" id="${esc(sec.id)}" data-watch>
  ${hud}
  ${head(sec.n, sec.kicker)}
  <div class="state" style="margin-bottom:clamp(20px,2.6vw,34px)">
    <h2 class="big" data-rise>${lines(sec.title)}</h2>
    <p class="lede" data-rise>${esc(sec.intro)}</p>
  </div>
  <div class="rows">
    ${sec.items
        .map(
            (it, i) => `
      <article class="row" data-rise data-img="${esc(it.img || '')}">
        <span class="row__n mono">(${String(i + 1).padStart(2, '0')})</span>
        <h3 class="row__name">${esc(it.name)}</h3>
        <p class="row__body">${esc(it.body)}</p>
        <div class="row__tags mono">${tagsOf(it)
            .map((t) => `<span>${esc(t)}</span>`)
            .join('')}</div>
      </article>`
        )
        .join('')}
  </div>
</section>`;

const steps = rowList(process, (it) => [it.tag, it.meta].filter(Boolean));
const works = rowList(work, (it) => it.meta.split('·').map((s) => s.trim()));

/* One pause in a long page. */
const brk = `
<section class="break" data-watch>
  <img class="break__bg" src="${esc(BREAK.img)}" alt="" data-parallax loading="lazy" />
  <div>
    <h2 class="big break__q" data-rise>${BREAK.quote
        .map((t, i) => `<span${i === BREAK.gold ? ' class="g"' : ''}>${esc(t)}</span>`)
        .join('')}</h2>
    <p class="break__by mono" data-rise>${esc(BREAK.by)}</p>
  </div>
</section>`;

const timeline = `
<section class="pan" id="engagement" data-watch>
  ${hud}
  ${head(engagement.n, engagement.kicker)}
  <div class="state" style="margin-bottom:clamp(34px,4.4vw,60px)">
    <h2 class="big" data-rise>${lines(engagement.title)}</h2>
    <p class="lede" data-rise>${esc(engagement.intro)}</p>
  </div>
  <div class="track" id="track">
    ${engagement.items
        .map(
            ([n, name, body]) => `
      <div class="stop" data-rise>
        <b class="mono">${esc(n)}</b>
        <h3>${esc(name)}</h3>
        <p>${esc(body)}</p>
      </div>`
        )
        .join('')}
  </div>
</section>`;

const faq = `
<section class="pan pan--navy" id="questions" data-watch>
  ${hud}
  ${head(questions.n, questions.kicker)}
  <div class="state" style="margin-bottom:clamp(20px,2.6vw,34px)">
    <h2 class="big" data-rise>${lines(questions.title)}</h2>
  </div>
  <div class="faq">
    ${questions.items
        .map(
            ([q, a]) => `
      <details class="qa">
        <summary>${esc(q)}<i></i></summary>
        <div class="qa__a"><p>${esc(a)}</p></div>
      </details>`
        )
        .join('')}
  </div>
</section>`;

const end = `
<section class="pan end" id="contact" data-watch>
  ${hud}
  <div class="rule rule--top"></div>
  ${head(CONTACT.n, CONTACT.kicker)}
  <h2 class="giant end__t" data-rise>${lines(CONTACT.title)}</h2>
  <p class="lede" style="margin:clamp(24px,3vw,40px) auto 0;text-align:center" data-rise>${esc(CONTACT.body)}</p>
  <a class="end__mail" href="mailto:${esc(CONTACT.email)}" data-rise>${esc(CONTACT.email)}</a>
  <p class="end__note mono" data-rise>${esc(CONTACT.note)}</p>
</section>

<footer class="foot mono">
  <span>© ${new Date().getFullYear()} ${esc(META.name)}</span>
  <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a>
  <span>Draft B — not live</span>
</footer>`;

app.innerHTML =
    hero + tape + statement + svcs + fitSec + steps + brk + works + timeline + faq + end;

nav.innerHTML = SECTIONS.filter((s) => s.nav)
    .map((s) => `<a href="#${esc(s.id)}" data-for="${esc(s.id)}">${esc(s.nav)}</a>`)
    .join('');

/* ── Loader ────────────────────────────────────────────────────────── */

const load = document.getElementById('load');
const loadN = document.getElementById('loadN');
const loadBar = document.getElementById('loadBar');

if (REDUCED) {
    load.classList.add('is-done');
} else {
    /* Time-driven rather than asymptotic: a lerp toward 100 never
       reaches its own threshold and the loader sits there at 99. */
    let pct = 0;
    let last = performance.now();
    const step = (now) => {
        pct = Math.min(100, pct + ((now - last) / 1000) * 72);
        last = now;
        loadN.textContent = String(Math.floor(pct)).padStart(2, '0');
        loadBar.style.width = pct + '%';
        if (pct < 100) requestAnimationFrame(step);
        else setTimeout(() => load.classList.add('is-done'), 220);
    };
    requestAnimationFrame(step);
}

/* ── Clock ─────────────────────────────────────────────────────────── */

const clockT = document.getElementById('clockT');

const tickClock = () => {
    clockT.textContent = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date());
};

tickClock();
setInterval(tickClock, 1000);

/* ── Reveals ───────────────────────────────────────────────────────── */

const seen = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-in');
            seen.unobserve(e.target);
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);

document.querySelectorAll('[data-watch], .track').forEach((el) => seen.observe(el));

/* ── Accordion ────────────────────────────────────────────────────────
   <details> animates nothing on its own, so the panel's height is
   measured and driven by hand. Opening one closes the others, which
   keeps the section a readable length. */

document.querySelectorAll('.qa').forEach((qa) => {
    const panel = qa.querySelector('.qa__a');
    const sum = qa.querySelector('summary');

    const setH = (open) => {
        panel.style.height = open ? panel.scrollHeight + 'px' : '0px';
    };

    sum.addEventListener('click', (ev) => {
        ev.preventDefault();
        const opening = !qa.open;

        if (opening) {
            document.querySelectorAll('.qa[open]').forEach((other) => {
                if (other === qa) return;
                other.querySelector('.qa__a').style.height = '0px';
                setTimeout(() => other.removeAttribute('open'), 320);
            });
            qa.open = true;
            requestAnimationFrame(() => setH(true));
        } else {
            setH(false);
            setTimeout(() => qa.removeAttribute('open'), 480);
        }
    });

    window.addEventListener('resize', () => {
        if (qa.open) setH(true);
    });
});

/* ── The floating preview ──────────────────────────────────────────── */

const peek = document.getElementById('peek');
const peekImg = peek.querySelector('img');
const want = { x: 0, y: 0 };
const at = { x: 0, y: 0 };
let peeking = false;

document.querySelectorAll('.row[data-img]').forEach((row) => {
    const src = row.dataset.img;
    if (!src) return;

    row.addEventListener('pointerenter', (ev) => {
        if (ev.pointerType === 'touch') return;
        peekImg.src = src;
        peeking = true;
        at.x = want.x = ev.clientX;
        at.y = want.y = ev.clientY;
        peek.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, -50%)`;
        peek.classList.add('is-on');
        startChase();
    });

    row.addEventListener('pointermove', (ev) => {
        want.x = ev.clientX;
        want.y = ev.clientY;
    });

    row.addEventListener('pointerleave', () => {
        peeking = false;
        peek.classList.remove('is-on');
    });
});

/* ── Parallax ──────────────────────────────────────────────────────── */

const para = [...document.querySelectorAll('[data-parallax]')];

function runParallax() {
    const vh = window.innerHeight;
    para.forEach((el) => {
        const box = el.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        const t = clamp01((vh - box.top) / (vh + box.height));
        el.style.transform = `translate3d(0, ${((t - 0.5) * 11).toFixed(2)}%, 0)`;
    });
}

/* ── Masthead ──────────────────────────────────────────────────────── */

const top = document.getElementById('top');
const navLinks = [...nav.querySelectorAll('[data-for]')];
const marks = navLinks
    .map((a) => ({ a, el: document.getElementById(a.dataset.for) }))
    .filter((m) => m.el);

let lastY = 0;

function onScroll() {
    const y = window.scrollY;

    /* Out of the way going down, back on the way up — but never while
       still inside the hero, where it is part of the composition. */
    top.classList.toggle('is-gone', y > window.innerHeight * 0.6 && y > lastY + 4);
    lastY = y;

    let on = null;
    for (const m of marks) {
        if (m.el.getBoundingClientRect().top <= window.innerHeight * 0.4) on = m.a;
    }
    navLinks.forEach((a) => a.classList.toggle('on', a === on));

    runParallax();
}

addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ── The globe ────────────────────────────────────────────────────────
   A wireframe sphere, turning slowly, leaning a few degrees toward the
   pointer. It is scenery and it knows it: no labels, no data claim, no
   legend — a globe pretending to plot something would be a lie told in
   geometry.

   It stops rendering the moment the hero leaves the viewport. */

const canvas = document.getElementById('globe');
let renderer = null;
let scene = null;
let camera = null;
let rig = null;
let running = false;
const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

function buildGlobe() {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 7.2;

    rig = new THREE.Group();
    scene.add(rig);

    const geo = new THREE.IcosahedronGeometry(2.6, 3);

    rig.add(
        new THREE.LineSegments(
            new THREE.WireframeGeometry(geo),
            new THREE.LineBasicMaterial({
                color: new THREE.Color('#4a6fa5'),
                transparent: true,
                opacity: 0.17,
            })
        )
    );

    rig.add(
        new THREE.Points(
            geo,
            new THREE.PointsMaterial({
                color: new THREE.Color('#c9a84c'),
                size: 0.032,
                transparent: true,
                opacity: 0.62,
                sizeAttenuation: true,
            })
        )
    );

    /* A second, larger shell turning the other way. One sphere alone
       reads as a logo; two reads as a volume. */
    const outer = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.45, 1)),
        new THREE.LineBasicMaterial({
            color: new THREE.Color('#c9a84c'),
            transparent: true,
            opacity: 0.1,
        })
    );
    outer.name = 'outer';
    scene.add(outer);

    sizeGlobe();
}

function sizeGlobe() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* Keep the globe roughly the same share of the panel at every
       width rather than letting a narrow viewport crop it. */
    camera.position.z = w < 760 ? 9.4 : 7.2;
    camera.updateProjectionMatrix();
}

addEventListener('pointermove', (ev) => {
    tilt.tx = (ev.clientY / innerHeight - 0.5) * 0.34;
    tilt.ty = (ev.clientX / innerWidth - 0.5) * 0.5;
});

addEventListener('resize', () => renderer && sizeGlobe());

let prev = 0;

function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt = Math.min(0.05, (now - prev) / 1000) || 0.016;
    prev = now;

    tilt.x = lerp(tilt.x, tilt.tx, 0.045);
    tilt.y = lerp(tilt.y, tilt.ty, 0.045);

    rig.rotation.y += dt * 0.07;
    rig.rotation.x = tilt.x;
    rig.rotation.z = tilt.y * 0.3;

    const outer = scene.getObjectByName('outer');
    outer.rotation.y -= dt * 0.035;
    outer.rotation.x = -tilt.x * 0.6;

    scene.rotation.y = tilt.y * 0.35;

    /* The preview chases the pointer here rather than in its own
       loop — one rAF for the whole page. */
    if (peeking) {
        at.x = lerp(at.x, want.x, 0.16);
        at.y = lerp(at.y, want.y, 0.16);
        peek.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, -50%)`;
    }

    renderer.render(scene, camera);
}

const heroWatch = new IntersectionObserver(
    (entries) => {
        const vis = entries[0].isIntersecting;
        if (vis && !running) {
            if (!renderer) buildGlobe();
            running = true;
            prev = performance.now();
            requestAnimationFrame(frame);
        } else if (!vis) {
            running = false;
        }
    },
    { threshold: 0 }
);

if (!REDUCED) heroWatch.observe(document.getElementById('hero'));

/* The row lists live well below the hero, where the globe's loop has
   already stopped. This one runs only while a row is actually being
   hovered — a marketing page should not hold a rAF open to move an
   element nobody is looking at. */
let chasing = false;

function chaseFrame() {
    if (!peeking || running) {
        chasing = false;
        return;
    }
    requestAnimationFrame(chaseFrame);
    at.x = lerp(at.x, want.x, 0.16);
    at.y = lerp(at.y, want.y, 0.16);
    peek.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, -50%)`;
}

function startChase() {
    if (chasing || running) return;
    chasing = true;
    requestAnimationFrame(chaseFrame);
}

/* ── Dev probe ─────────────────────────────────────────────────────── */

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.__draft = {
        read: () => ({
            errors: [],
            sections: document.querySelectorAll('.pan, .hero, .break').length,
            diagrams: document.querySelectorAll('.dia').length,
            rows: document.querySelectorAll('.row').length,
            globe: !!renderer,
            running,
        }),
    };
}
