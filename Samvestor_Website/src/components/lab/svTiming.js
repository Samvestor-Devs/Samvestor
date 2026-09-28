/* One clock for the opening, shared by the WebGL scene and the DOM copy.
   Both start on the same signal (the site splash leaving) and read these
   same numbers, so the overlay can never uncover the mark early or late. */

export const INTRO = {
    duration: 3.4, // seconds, start to hero
    // fractions of `duration`
    holdEnd: 0.36, // the mark stands alone, loading
    backEnd: 0.58, // it has moved back to its hero distance
    // the travel into the headline is the whole point of the opening, so it
    // is given room and played in the open — nothing covers it
    wordStart: 0.56,
    wordEnd: 0.88,
};

/* Where the letters leave the words again and lock into the monogram, as a
   fraction of the scroll track. Reversible by construction: every value in
   the scene is a function of scroll position, so scrolling back up walks the
   letters straight back into the headline. The heading holds a moment past
   this window on the way down, so their two gaps are seen before it goes. */
export const UNDOCK = [0.05, 0.2];
