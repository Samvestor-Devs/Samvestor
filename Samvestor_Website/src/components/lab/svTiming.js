/* One clock for the opening, shared by the WebGL scene and the DOM copy.
   Both start on the same signal (the site splash leaving) and read these
   same numbers, so the overlay can never uncover the mark early or late. */

export const INTRO = {
    duration: 3.2, // seconds, start to hero
    // fractions of `duration`
    holdEnd: 0.4, // the mark stands alone, loading
    backEnd: 0.64, // it has moved back to its hero distance
    wordStart: 0.6, // the letters set off for their places in the headline
    wordEnd: 0.78, // ...and are standing in them before the overlay lifts
};

/* Where the letters leave the words again and lock into the monogram,
   as a fraction of the scroll track. */
export const UNDOCK = [0.04, 0.18];
