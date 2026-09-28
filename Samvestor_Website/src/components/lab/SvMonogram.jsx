'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, Sparkles } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as THREE from 'three';
import { SV_GLYPHS, GLYPH_BOX, BEVEL_SIZE, GLYPH_SCALE } from './svGlyphs';
import { INTRO, UNDOCK } from './svTiming';
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

const GOLD = new THREE.Color('#c9a84c');
const GLASS = new THREE.Color('#f2e2b6');
const CANVAS_BG = '#070b12';
const CAMERA_FOV = 34;
const DOCK_CAMERA_Z = 12.2; // the letters are measured against this distance

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t); // smoothstep
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
    return geo;
}

/**
 * Where a letter has to sit, in world units, to land exactly on the flat
 * glyph it replaces in the headline.
 *
 * The slot element carries a zero-width inline-block anchor whose bottom
 * edge sits on the text baseline and whose height is exactly 1em — so one
 * rect gives the pen position, the baseline and the em, with no font
 * metrics to guess at.
 */
function slotToWorld(rect, key, viewport) {
    if (!rect) return null;

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

    return {
        x: (cx / viewport.width - 0.5) * visibleW,
        y: -(cy / viewport.height - 0.5) * visibleH,
        // geometry is 1000-unit em tall at scale 1, plus the bevel
        scale: ((h / viewport.height) * visibleH) / (box.y2 - box.y1 + BEVEL_SIZE * 2),
    };
}

function Monogram({ progress, intro, slots, quality, pointer }) {
    const group = useRef(null);
    const sRef = useRef(null);
    const vRef = useRef(null);
    const sMat = useRef(null);
    const vMat = useRef(null);
    const damped = useRef({ px: 0, py: 0 });
    const startedAt = useRef(0);

    const [geoS, geoV] = useMemo(() => [glyphGeometry(SV_GLYPHS.S, 200), glyphGeometry(SV_GLYPHS.V, 200)], []);

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
        const toWord = ease(range(e, INTRO.wordStart, INTRO.wordEnd));

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
        const slotS = slotToWorld(slots.current.S, 'S', size);
        const slotV = slotToWorld(slots.current.V, 'V', size);

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
        for (const m of [sMat.current, vMat.current]) {
            m.color.copy(GOLD).lerp(GLASS, glass);
            m.metalness = mix(0.94, 0, glass);
            m.roughness = mix(0.22, 0.04, glass);
            m.transmission = glass;
            m.thickness = mix(0, 3.4, glass);
            m.ior = mix(1.5, 1.72, glass);
            // what it soaks up as light travels through it — the tint is what
            // keeps the glass state reading as the brand's gold, not as water
            m.attenuationDistance = mix(8, 1.6, glass);
            m.envMapIntensity = mix(1.15, 2.4, glass);
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
    };

    return (
        <group ref={group}>
            <mesh ref={sRef} geometry={geoS} scale={GLYPH_SCALE}>
                <meshPhysicalMaterial ref={sMat} color={GOLD} metalness={0.94} roughness={0.22} {...material} />
            </mesh>
            <mesh ref={vRef} geometry={geoV} scale={GLYPH_SCALE}>
                <meshPhysicalMaterial ref={vMat} color={GOLD} metalness={0.94} roughness={0.22} {...material} />
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
function Rig() {
    return (
        <Environment resolution={320}>
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
    const { quality } = props;
    return (
        <>
            <color attach="background" args={[CANVAS_BG]} />
            <fog attach="fog" args={[CANVAS_BG, 13, 38]} />

            <Rig />
            <ambientLight intensity={0.35} />
            <spotLight position={[7, 9, 9]} angle={0.35} penumbra={1} intensity={90} color="#fff2d6" />
            <pointLight position={[-8, -3, 4]} intensity={40} color="#4a6fa5" />

            <Monogram {...props} />

            {quality.sparkles > 0 && (
                <Sparkles count={quality.sparkles} scale={[16, 10, 9]} size={2.4} speed={0.25} opacity={0.5} color="#eed9a0" />
            )}

            <ContactShadows position={[0, -3.4, 0]} opacity={0.5} scale={22} blur={2.8} far={6} color="#000000" />
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

    const quality = useMemo(
        () => ({
            compact: small,
            // transmission renders the whole scene a second time — desktop only
            transmission: !small,
            sparkles: small ? 0 : 60,
            dpr: small ? [1, 1.5] : [1, 1.9],
        }),
        [small]
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
            <Scene progress={progress} intro={intro} slots={slots} quality={quality} pointer={pointer} />
        </Canvas>
    );
}

export default SvMonogram;
