/* The heading's gradient, per theme.
   ------------------------------------------------------------------
   One source of truth on purpose. The flat type is painted with this
   as a CSS gradient and the 3D letters standing in the same line are
   coloured by sampling it, so if the two were written out separately
   they would drift apart the first time either was touched.

   Stops are plain sRGB bytes, and are interpolated in sRGB — the way a
   browser paints a gradient. Interpolating in a renderer's linear
   working space instead pulls the middle noticeably darker than the
   CSS it is supposed to match. */

export const INK_RAMPS = {
    // cream falling to gold, on the near-black stage
    dark: [
        { at: 0.12, rgb: [255, 246, 228] },
        { at: 0.52, rgb: [227, 205, 149] },
        { at: 1, rgb: [184, 151, 63] },
    ],
    // deeper gold falling to bronze: light gold on an off-white stage is
    // too pale to read, so the light ramp starts where the dark one ends
    light: [
        { at: 0.12, rgb: [168, 134, 47] },
        { at: 0.52, rgb: [133, 105, 31] },
        { at: 1, rgb: [92, 71, 19] },
    ],
};

/** the same ramp as a CSS gradient, for the flat type */
export function inkGradient(theme) {
    const stops = (INK_RAMPS[theme] ?? INK_RAMPS.dark)
        .map((s) => `rgb(${s.rgb.join(' ')}) ${(s.at * 100).toFixed(0)}%`)
        .join(', ');
    return `linear-gradient(180deg, ${stops})`;
}

/** the ramp sampled at `t`, 0 at the top of the heading and 1 at its foot */
export function inkAt(theme, t, out) {
    const stops = INK_RAMPS[theme] ?? INK_RAMPS.dark;
    const first = stops[0];
    const last = stops[stops.length - 1];

    if (t <= first.at) return setSrgb(out, first.rgb);
    if (t >= last.at) return setSrgb(out, last.rgb);

    for (let i = 0; i < stops.length - 1; i += 1) {
        const a = stops[i];
        const b = stops[i + 1];
        if (t >= a.at && t <= b.at) {
            const k = (t - a.at) / (b.at - a.at);
            return setSrgb(out, [
                a.rgb[0] + (b.rgb[0] - a.rgb[0]) * k,
                a.rgb[1] + (b.rgb[1] - a.rgb[1]) * k,
                a.rgb[2] + (b.rgb[2] - a.rgb[2]) * k,
            ]);
        }
    }
    return out;
}

/* `out` is a THREE.Color; taking it as an argument keeps the per-frame
   sampling free of allocation. SRGBColorSpace is what converts the byte
   values into the renderer's linear working space. */
function setSrgb(out, rgb) {
    return out.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 'srgb');
}
