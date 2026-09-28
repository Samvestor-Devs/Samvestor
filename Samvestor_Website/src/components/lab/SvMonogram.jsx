'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, Sparkles } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as THREE from 'three';
import { SV_GLYPHS, GLYPH_BOX, BEVEL_SIZE, GLYPH_SCALE } from './svGlyphs';
import { INTRO, UNDOCK } from './svTiming';
import { inkAt } from './svInk';
import useTheme from '../../lib/useTheme';
import useMediaQuery from './useMediaQuery';

/* ============================================================
   The SV monogram, in three lives:

     1. the preloader — the mark alone in the dark while the page
        comes up, then moving back as the overlay clears
     2. the hero — the two letters fly into the headline and BECOME
        the S of SMART and the V of INVESTOR, real extrusions
        standing in the middle of flat type
     3. the section backdrop — on scroll they leave the words, lock
        into a monogram, turn, change matter, and step aside for
        the copy

   Scroll is the single source of truth for life 3; lives 1 and 2
   run on a clock, because nobody has scrolled yet.
   ============================================================ */

/* The metal, per theme. Against an off-white stage the dark-mode gold
   washes out to cream — a polished surface is a picture of its
   surroundings, and those surroundings just got much brighter — so the
   light stage gets a deeper alloy rather than a brighter rig. */
const GOLD = { dark: new THREE.Color('#c9a84c'), light: new THREE.Color('#8f7226') };
const GLASS = new THREE.Color('#f2e2b6');
const BLACK = new THREE.Color(0, 0, 0);

/* the stage behind the mark, per theme */
const STAGE = { dark: '#070b12', light: '#f4f1ea' };

/* Scratch colours: the ramp is sampled every frame, for each letter, at
   three heights (its top, middle and foot), so none of this allocates. */
const INK = {
    S: { top: new THREE.Color(), mid: new THREE.Color(), bot: new THREE.Color() },
    V: { top: new THREE.Color(), mid: new THREE.Color(), bot: new THREE.Color() },
};

/**
 * Gives each letter the heading's vertical gradient.
 *
 * Emissive is what a docked letter is mostly lit by — flat type answers to
 * no studio rig, so neither does this — but emissive is a single colour per
 * material, which left the letter flat while every glyph beside it ran from
 * cream at the cap to gold at the foot. This multiplies it by a ramp keyed
 * to height in the glyph's own local space, so no extra vertex attribute is
 * needed: `position` is already there, and the glyph's extent is a uniform.
 *
 * The ratio is relative to the letter's middle, which the material is
 * already wearing, so when the letter is away being metal and emissive is
 * off, this contributes nothing.
 */
function patchInkRamp(shader, uniforms) {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
        .replace('void main() {', 'uniform float uYTop;\nuniform float uYSpan;\nvarying float vInkH;\nvoid main() {')
        .replace(
            '#include <begin_vertex>',
            '#include <begin_vertex>\n\tvInkH = clamp((uYTop - position.y) / uYSpan, 0.0, 1.0);'
        );

    shader.fragmentShader = shader.fragmentShader
        .replace('void main() {', 'uniform vec3 uRampTop;\nuniform vec3 uRampBot;\nvarying float vInkH;\nvoid main() {')
        .replace(
            'vec3 totalEmissiveRadiance = emissive;',
            'vec3 totalEmissiveRadiance = emissive * mix(uRampTop, uRampBot, vInkH);'
        );
}

/** ramp stop / middle, guarding the divide when a channel is near zero */
function ratio(out, stop, mid) {
    return out.setRGB(
        stop.r / Math.max(mid.r, 1e-4),
        stop.g / Math.max(mid.g, 1e-4),
        stop.b / Math.max(mid.b, 1e-4)
    );
}
const CAMERA_FOV = 34;
const DOCK_CAMERA_Z = 12.2; // the letters are measured against this distance

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t); // smoothstep
const easeOut = (t) => 1 - Math.pow(1 - t, 3); // quick away, long settle
const mix = (a, b, t) => a + (b - a) * t;

/** one glyph -> a bevelled, centred, upright extrusion */
function glyphGeometry(d, depth) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`;
    const shapes = new SVGLoader().parse(svg).paths[0].toShapes(true);

    const geo = new THREE.ExtrudeGeometry(shapes, {
        depth,
        curveSegments: 24,
        bevelEnabled: true,
        bevelThickness: 16,
        bevelSize: BEVEL_SIZE,
        bevelOffset: 0,
        bevelSegments: 5,
    });

    geo.center();
    // the outlines arrive y-down. A half turn about X puts them upright
    // WITHOUT mirroring — scaling by -1 would invert every normal and the
    // gold would light from inside out.
    geo.rotateX(Math.PI);
    geo.computeVertexNormals();
    geo.computeBoundingBox(); // the ink ramp is keyed to the glyph's extent
    return geo;
}

/**
 * Where a letter has to sit, in world units, to land exactly on the empty
 * slot it fills in the headline.
 *
 * The slot carries a zero-width inline-block anchor whose bottom edge sits
 * on the text baseline and whose height is exactly 1em — so one rect gives
 * the pen position, the baseline and the em, with no font metrics to guess
 * at.
 *
 * Measured live, every frame, rather than cached: the line moves under the
 * webfont landing, a resize, a zoom, and the heading's own entrance offset,
 * and a letter standing in a word has to track all of it exactly. Two rect
 * reads a frame, with no DOM writes in between, so nothing is invalidated.
 */
function slotToWorld(el, key, viewport, theme) {
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const em = rect.height;
    const box = GLYPH_BOX[key];

    // centre of the outline, in CSS pixels
    const cx = rect.left + ((box.x1 + box.x2) / 2 / 1000) * em;
    const cy = rect.bottom + ((box.y1 + box.y2) / 2 / 1000) * em;
    // the bevel grows the extrusion past the outline on every side
    const h = ((box.y2 - box.y1 + BEVEL_SIZE * 2) / 1000) * em;

    // the view frustum at the plane the letters sit on
    const visibleH = 2 * Math.tan((CAMERA_FOV / 2) * (Math.PI / 180)) * DOCK_CAMERA_Z;
    const visibleW = visibleH * (viewport.width / viewport.height);

    // Where this letter falls in the heading's gradient, so it wears what
    // its neighbours on the same line are wearing — the S high on the first
    // line and the V lower on the second are not the same colour. Sampled at
    // the glyph's cap, middle and foot, so it carries the ramp within itself
    // as well.
    const head = el.closest('.svbeat__title');
    const ink = INK[key]; // reused: this runs on every frame
    const hr = head ? head.getBoundingClientRect() : null;
    const at = (edge) => (hr ? (edge - hr.top) / (hr.height || 1) : 0.5);
    inkAt(theme, at(cy - h / 2), ink.top);
    inkAt(theme, at(cy), ink.mid);
    inkAt(theme, at(cy + h / 2), ink.bot);

    return {
        x: (cx / viewport.width - 0.5) * visibleW,
        y: -(cy / viewport.height - 0.5) * visibleH,
        // geometry is 1000-unit em tall at scale 1, plus the bevel
        scale: ((h / viewport.height) * visibleH) / (box.y2 - box.y1 + BEVEL_SIZE * 2),
        ink,
    };
}

function Monogram({ progress, intro, slots, quality, pointer, theme }) {
    const group = useRef(null);
    const sRef = useRef(null);
    const vRef = useRef(null);
    const sMat = useRef(null);
    const vMat = useRef(null);
    const damped = useRef({ px: 0, py: 0 });
    const startedAt = useRef(0);

    const [geoS, geoV] = useMemo(() => [glyphGeometry(SV_GLYPHS.S, 200), glyphGeometry(SV_GLYPHS.V, 200)], []);

    /* one set per letter: the shader program is shared, the values are not */
    const ramp = useMemo(() => {
        const make = (geo) => ({
            uYTop: { value: geo.boundingBox.max.y },
            uYSpan: { value: geo.boundingBox.max.y - geo.boundingBox.min.y || 1 },
            uRampTop: { value: new THREE.Color(1, 1, 1) },
            uRampBot: { value: new THREE.Color(1, 1, 1) },
        });
        return { S: make(geoS), V: make(geoV) };
    }, [geoS, geoV]);

    useEffect(
        () => () => {
            geoS.dispose();
            geoV.dispose();
        },
        [geoS, geoV]
    );

    // camera and size come off the frame state rather than useThree(): both
    // are written to every frame, which is not something a render-time value
    // is allowed to be
    useFrame((state, dt) => {
        const { camera, size } = state;
        const p = progress.current;
        const t = state.clock.elapsedTime;

        // ---- life 1 + 2: the clock ------------------------------------
        // the page owns the go signal; the frame it actually arrived on is
        // this component's own business
        if (intro.current.running && !startedAt.current) startedAt.current = t;
        const started = startedAt.current;
        const e = started ? clamp01((t - started) / INTRO.duration) : 0;

        const loading = 1 - ease(range(e, INTRO.holdEnd * 0.55, INTRO.backEnd)); // 1 while it stands alone
        // the letters leave briskly and settle into the words, rather than
        // easing in at both ends and looking like they are being placed
        const toWord = easeOut(range(e, INTRO.wordStart, INTRO.wordEnd));

        // ---- life 3: the scroll ---------------------------------------
        const undock = ease(range(p, UNDOCK[0], UNDOCK[1]));
        const turn = ease(range(p, 0.24, 0.46));
        const shift = ease(range(p, 0.54, 0.72)); // steps aside for the numbers
        const close = ease(range(p, 0.78, 0.96));

        // how much the letters are standing inside the words (1) versus
        // free as a monogram (0)
        const w = toWord * (1 - undock);
        const free = 1 - w;

        // ---- cursor parallax, damped so it has weight ------------------
        damped.current.px = THREE.MathUtils.damp(damped.current.px, pointer.current.x, 3, dt);
        damped.current.py = THREE.MathUtils.damp(damped.current.py, pointer.current.y, 3, dt);
        const d = damped.current;

        // ---- the group -------------------------------------------------
        // every transform here is multiplied by `free`: while the letters
        // are set into the headline the group has to be identity, or they
        // would drift off the glyphs they are standing in for
        const g = group.current;

        // far enough aside to clear the copy, not so far that the second
        // letter walks off the edge of the frame. A phone has no room to
        // step aside at all, so there the mark stays put and sits behind the
        // copy as a watermark instead.
        const aside = quality.compact ? 0.7 : 2.1;
        let x = mix(0, aside, turn);
        x = mix(x, -aside, shift);
        x = mix(x, 0, close);

        let ry = mix(-0.5, 0.42, turn);
        ry = mix(ry, 0.2, shift);
        ry = mix(ry, 0, close);

        let rx = mix(0.12, -0.06, turn);
        rx = mix(rx, 0.04, close);

        const read = quality.compact ? 0.46 : 0.7; // how big it stays while there is copy to read
        let sc = mix(0.8, read, turn);
        sc = mix(sc, read * 0.94, shift);
        sc = mix(sc, quality.compact ? 0.95 : 1.24, close);
        sc = mix(sc, quality.compact ? 1.05 : 1.5, loading); // the preloader mark fills the screen

        g.position.x = x * free;
        g.position.y = (mix(0, 0.35, close) + Math.sin(t * 0.45) * 0.055) * free;
        g.rotation.y = (ry + d.px * 0.22 + Math.sin(t * 0.33) * 0.03 + loading * 0.35) * free;
        g.rotation.x = (rx + d.py * 0.14 + Math.cos(t * 0.41) * 0.02) * free;
        g.scale.setScalar(mix(1, sc, free));

        // ---- the letters ------------------------------------------------
        const slotS = slotToWorld(slots.current.S, 'S', size, theme);
        const slotV = slotToWorld(slots.current.V, 'V', size, theme);

        const place = (mesh, slot, homeX) => {
            const wl = slot ? w : 0; // no measurement yet: stay a monogram
            mesh.position.x = mix(homeX, slot ? slot.x : homeX, wl);
            mesh.position.y = mix(0, slot ? slot.y : 0, wl);
            mesh.position.z = 0;
            mesh.rotation.y = mix(0, 0, wl);
            mesh.rotation.z = 0;
            mesh.scale.setScalar(mix(GLYPH_SCALE, slot ? slot.scale : GLYPH_SCALE, wl));
        };
        place(sRef.current, slotS, -1.42);
        place(vRef.current, slotV, 1.42);

        // ---- matter: solid gold -> smoked gold crystal -> gold again ----
        // On its own window, and a tight one. Half a transmission is neither
        // metal nor glass, it is grey plastic, so the change is made quickly
        // and then held rather than eased across the whole beat.
        const glass = quality.transmission
            ? ease(range(p, 0.29, 0.37)) * (1 - ease(range(p, 0.45, 0.53)))
            : 0;
        // The colour changes on a tighter curve than the travel does. Run on
        // `w` itself, the letters spend most of a long flight as a pale
        // half-thing that reads as neither type nor metal; held back to the
        // last stretch, they are clearly one or the other almost the whole
        // way, and still cross over smoothly.
        const ink = ease(range(w, 0.52, 0.97));

        for (const [m, slot, uni] of [
            [sMat.current, slotS, ramp.S],
            [vMat.current, slotV, ramp.V],
        ]) {
            m.color.copy(theme === 'light' ? GOLD.light : GOLD.dark).lerp(GLASS, glass);
            m.metalness = mix(0.94, 0, glass);
            m.roughness = mix(0.22, 0.04, glass);
            m.transmission = glass;
            m.thickness = mix(0, 3.4, glass);
            m.ior = mix(1.5, 1.72, glass);
            // what it soaks up as light travels through it — the tint is what
            // keeps the glass state reading as the brand's gold, not as water
            m.attenuationDistance = mix(8, 1.6, glass);
            m.envMapIntensity = mix(1.15, 2.4, glass);

            // ---- standing in a word: be the word ------------------------
            // Lit metal in the middle of flat type reads as an object parked
            // in front of the line rather than a letter of it. Docked, it
            // gives up its metal and its reflections and lights itself in the
            // heading's colour — flat type answers to no studio rig, so
            // neither does this. Away from the words it is metal again, and
            // everything in between is the travel.
            if (slot) {
                // Docked, the diffuse is taken all the way out and the letter
                // is ONLY its own emission. A lit surface plus a full emission
                // adds up to half again the colour it is supposed to be, which
                // is what left the docked letters looking bleached beside the
                // flat glyphs. With no diffuse there is nothing to add, and
                // the match stops depending on the rig — or on the theme,
                // whose stages are lit very differently.
                m.color.lerp(BLACK, ink);
                m.emissive.copy(slot.ink.mid);
                ratio(uni.uRampTop.value, slot.ink.top, slot.ink.mid);
                ratio(uni.uRampBot.value, slot.ink.bot, slot.ink.mid);
            }
            m.metalness = mix(m.metalness, 0.05, ink);
            m.roughness = mix(m.roughness, 0.7, ink);
            m.envMapIntensity = mix(m.envMapIntensity, 0.28, ink);
            // just over 1: ACES pulls a bright emission down a little, so
            // feeding it slightly hot lands on the flat colour
            m.emissiveIntensity = slot ? ink * 1.12 : 0;
        }

        // ---- camera: real Z depth, not parallax -------------------------
        // pinned at DOCK_CAMERA_Z while the letters are in the words, since
        // that distance is what their screen positions were solved against
        let cz = mix(17.5, DOCK_CAMERA_Z, ease(range(e, 0.3, INTRO.backEnd)));
        cz = mix(cz, 12, turn);
        cz = mix(cz, 12.6, shift);
        cz = mix(cz, 9.4, close);
        cz = mix(cz, DOCK_CAMERA_Z, w);

        camera.position.z = THREE.MathUtils.damp(camera.position.z, cz, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, (mix(0, 0.5, turn) - d.py * 0.3) * free, 4, dt);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, -d.px * 0.45 * free, 4, dt);
        camera.lookAt(0, 0, 0);
    });

    const material = {
        ior: 1.5,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        reflectivity: 0.9,
        attenuationColor: '#b8873a',
        attenuationDistance: 8,
        emissive: '#e8d3a0',
        emissiveIntensity: 0,
    };

    return (
        <group ref={group}>
            <mesh ref={sRef} geometry={geoS} scale={GLYPH_SCALE}>
                <meshPhysicalMaterial
                    ref={sMat}
                    color={GOLD.dark}
                    metalness={0.94}
                    roughness={0.22}
                    onBeforeCompile={(shader) => patchInkRamp(shader, ramp.S)}
                    {...material}
                />
            </mesh>
            <mesh ref={vRef} geometry={geoV} scale={GLYPH_SCALE}>
                <meshPhysicalMaterial
                    ref={vMat}
                    color={GOLD.dark}
                    metalness={0.94}
                    roughness={0.22}
                    onBeforeCompile={(shader) => patchInkRamp(shader, ramp.V)}
                    {...material}
                />
            </mesh>
        </group>
    );
}

/**
 * Studio rig. Polished metal has almost no diffuse of its own — it is only
 * ever a picture of its surroundings, so the environment has to give it
 * something to reflect or the letters read as black cut-outs. The broad
 * panels fill the faces; the narrow strips rake across the bevels as it turns.
 */
function Rig({ theme }) {
    const light = theme === 'light';
    return (
        <Environment resolution={320}>
            {/* The light stage's black cards. Metal reads as metal because of
                the DARK bands in what it reflects, not the bright ones — an
                all-bright surround gives a uniform reflection and the letters
                come out as flat yellow cut-outs. The dark stage has these for
                free, being mostly dark already. */}
            {light && (
                <>
                    <Lightformer form="rect" intensity={0.05} color="#161b26" position={[-9, 0, 4]} scale={[7, 18, 1]} target={[0, 0, 0]} />
                    <Lightformer form="rect" intensity={0.05} color="#161b26" position={[9, 2, 4]} scale={[6, 18, 1]} target={[0, 0, 0]} />
                    <Lightformer form="rect" intensity={0.08} color="#1d2430" position={[0, -9, 6]} scale={[18, 6, 1]} target={[0, 0, 0]} />
                </>
            )}

            {/* kept warm and well short of white — a bright panel blows gold
                out to grey */}
            <Lightformer form="rect" intensity={2.4} color="#ffe2ae" position={[-7, 5, 9]} scale={[16, 16, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={3} color="#ffcf7d" position={[8, -1, 7]} scale={[13, 13, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={1.3} color="#cfe0ff" position={[0, 2, 12]} scale={[18, 12, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={7} color="#fffaf0" position={[-3, 8, 2]} scale={[1.2, 18, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={5.5} color="#eed9a0" position={[5, -7, 3]} scale={[1, 16, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={1.2} color="#4a6fa5" position={[0, -8, 4]} scale={[16, 5, 1]} target={[0, 0, 0]} />
            <Lightformer form="ring" intensity={3} color="#c9a84c" position={[0, 6, -8]} scale={[9, 9, 1]} target={[0, 0, 0]} />
        </Environment>
    );
}

function Scene(props) {
    const { quality, theme } = props;
    const light = theme === 'light';
    const stage = light ? STAGE.light : STAGE.dark;

    return (
        <>
            <color attach="background" args={[stage]} />
            <fog attach="fog" args={[stage, 13, 38]} />

            <Rig theme={theme} />
            <ambientLight intensity={light ? 0.9 : 0.35} />
            <spotLight position={[7, 9, 9]} angle={0.35} penumbra={1} intensity={light ? 150 : 90} color="#fff2d6" />
            <pointLight position={[-8, -3, 4]} intensity={40} color="#4a6fa5" />

            <Monogram {...props} />

            {quality.sparkles > 0 && (
                <Sparkles
                    count={quality.sparkles}
                    scale={[16, 10, 9]}
                    size={2.4}
                    speed={0.25}
                    opacity={light ? 0.75 : 0.5}
                    color={light ? '#8a6a1f' : '#eed9a0'}
                />
            )}

            {/* the mark casts onto a light stage; on a near-black one there is
                nothing for a shadow to darken */}
            <ContactShadows
                position={[0, -3.4, 0]}
                opacity={light ? 0.34 : 0.5}
                scale={22}
                blur={2.8}
                far={6}
                color="#000000"
            />
        </>
    );
}

/**
 * The canvas layer. It never takes pointer events — the parallax reads the
 * cursor off the window instead, so the copy stays selectable and the links
 * stay clickable.
 */
function SvMonogram({ progress, intro, slots }) {
    const pointer = useRef({ x: 0, y: 0 });
    const small = useMediaQuery('(max-width: 900px)');
    const theme = useTheme();

    const quality = useMemo(
        () => ({
            compact: small,
            // Transmission renders the whole scene a second time — desktop
            // only. And only on the dark stage: glass refracts whatever is
            // behind it, so against an off-white page it turns the mark
            // near-white and the moment simply reads as the letters vanishing.
            transmission: !small && theme !== 'light',
            sparkles: small ? 0 : 60,
            dpr: small ? [1, 1.5] : [1, 1.9],
        }),
        [small, theme]
    );

    useEffect(() => {
        const onMove = (e) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    return (
        <Canvas
            className="svlab__canvas"
            dpr={quality.dpr}
            // a touch under 1: ACES rolls bright gold off toward white, and
            // the darker exposure keeps the metal in its own colour
            gl={{ antialias: true, powerPreference: 'high-performance', toneMappingExposure: 0.92 }}
            camera={{ position: [0, 0, 17.5], fov: CAMERA_FOV }}
        >
            <Scene progress={progress} intro={intro} slots={slots} quality={quality} pointer={pointer} theme={theme} />
        </Canvas>
    );
}

export default SvMonogram;
