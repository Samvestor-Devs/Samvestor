/* The S and V of the Samvestor wordmark, as outlines.
   Pulled from Anton (SIL Open Font License) — the same face the site loads
   for --font-accent — so the 3D monogram is the brand letterform, not a
   lookalike. Path data is in font units: 1000 to the em, y negative upward
   (SVG convention), which SvMonogram flips with a rotation so the normals
   stay correct. */
export const SV_GLYPHS = {
    S: 'M242.188 7.813Q124.512 7.813 72.510-50.781Q20.508-109.375 20.508-237.305L20.508-321.289L190.430-321.289L190.430-213.867Q190.430-184.082 199.463-167.236Q208.496-150.391 230.957-150.391Q254.395-150.391 263.428-164.062Q272.461-177.734 272.461-208.984Q272.461-248.535 264.648-275.146Q256.836-301.758 237.549-325.928Q218.262-350.098 184.082-382.324L106.934-455.566Q20.508-537.109 20.508-642.090Q20.508-751.953 71.533-809.570Q122.559-867.187 219.238-867.187Q337.402-867.187 386.963-804.199Q436.523-741.211 436.523-612.793L261.719-612.793L261.719-671.875Q261.719-689.453 251.709-699.219Q241.699-708.984 224.609-708.984Q204.102-708.984 194.580-697.510Q185.059-686.035 185.059-667.969Q185.059-649.902 194.824-628.906Q204.590-607.910 233.398-580.566L332.520-485.352Q362.305-457.031 387.207-425.537Q412.109-394.043 427.246-352.295Q442.383-310.547 442.383-250.488Q442.383-129.395 397.705-60.791Q353.027 7.813 242.188 7.813',
    V: 'M351.563 0L117.188 0L11.230-859.863L174.805-859.863L237.793-274.902L293.945-859.863L457.520-859.863',
};

/* Outline bounding boxes in the same 1000-unit em, measured off the font.
   These let the scene drop each 3D letter exactly onto the flat glyph it is
   standing in for: the box centre is the letter's optical centre, and the
   height converts a CSS font-size straight into a world size. */
export const GLYPH_BOX = {
    S: { x1: 20.508, y1: -867.188, x2: 442.383, y2: 7.813 },
    V: { x1: 11.23, y1: -859.863, x2: 457.52, y2: 0 },
};

/* the bevel grows the extrusion this far past the outline, all round */
export const BEVEL_SIZE = 13;

/* font units -> world units, for the free-standing monogram */
export const GLYPH_SCALE = 0.0042;
