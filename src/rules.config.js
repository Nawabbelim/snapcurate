// =====================================================================================
//  SNAPCURATE RULES  —  3 simple layers.  Edit the numbers, save, done.   (Guide: HOW_TO_EDIT.md)
//    LAYER 1  GLOBAL_REJECT   : photos thrown out of EVERY vibe (injections, guns, screenshots...)
//    LAYER 2  CATEGORY_RULES  : which photos BELONG in each vibe (dogs -> Animals, flowers -> Flowers...)
//    LAYER 3  RANKING         : which accepted photos are the BEST (sharp, well lit, great faces...)
//  Percentages are decimals: .25 = 25%.      [a, b] = [strict first try, looser second try]
// =====================================================================================
export const SETS = {
  // reusable groups of subjects — use a set name anywhere you'd use one subject
  faces: ["face", "selfie"],
  people: [
    "face",
    "selfie",
    "pcar",
    "pbike",
    "pgarden",
    "pcoffee",
    "ppet",
    "pscene",
    "family",
    "child",
  ],
  kids: ["family", "child"],
  notHuman: [
    "toy",
    "art",
    "bigcat",
    "dog",
    "cat",
    "bird",
    "animal",
    "flowers",
    "moto",
    "car",
    "sportscar",
    "bicycle",
  ],
  plants: [
    "flowers",
    "garden",
    "plants",
    "leaf",
    "oneflower",
    "smallplant",
    "branch",
  ],
  home: [
    "living",
    "bedroom",
    "kitchen",
    "house",
    "furniture",
    "appliance",
    "tv",
    "fridge",
    "ac",
    "fan",
    "decor",
  ],
};

// ───────────────────────── LAYER 1 · GLOBAL REJECT (every vibe) ─────────────────────────
// 'thing': how sure the AI must be before the photo is thrown out.  SMALLER number = stricter (rejects more).
// To block something new: add its name here. (Names come from prompts.js: SUBJECT or JUNK lists.)
export const GLOBAL_REJECT = {
  floor: 0.2,
  injection: 0.25,
  medical: 0.3, // syringes, needles, pills, hospital
  gun: 0.3,
  target: 0.3,
  tech: 0.3,
  tools: 0.4, // weapons, red target/hit-marker, electronics, machinery
  shot: 0.35,
  game: 0.35,
  qr: 0.3,
  doc: 0.35, // screenshots, game screens, QR codes, documents
  poster: 0.5,
  meme: 0.45,
  screen: 0.45,
  chart: 0.45,
  ad: 0.5, // posters, memes, monitors, charts, ads
  blurry: 0.5,
  ugly: 0.5, // blurry / ugly / meaningless
  // shoes:.5,                                     // <- example: remove the // to reject shoe photos everywhere
};
// Plain picture checks (no AI): reject tiny, flat, blurry, too-dark, burnt-out images and bad file names.
export const GLOBAL_PIXEL = {
  tinySide: 220,
  flatColours: 45,
  blurry: 10,
  tooDark: 0.04,
  tooBright: 0.94,
  badFileNames: [
    "screenshot",
    "screen_shot",
    "screen shot",
    "whatsapp",
    "chat",
    "qr",
    "barcode",
    "scan",
    "meme",
    "poster",
    "flyer",
    "receipt",
    "game",
    "snap_",
    "telegram",
  ],
};
// "Human in every slide" mode (the popup after 'Curate'): a photo counts as having a human if the face-detector
// finds a face OR the AI is at least this sure there's a person.
export const HUMAN_REQUIRED = { minPeople: 0.15 };

// ───────────────────────── LAYER 2 · CATEGORY RULES (what belongs where) ─────────────────────────
//  include   : subjects this vibe WANTS (add one = accept more)
//  withHuman : extra subjects accepted ONLY in "human" mode (e.g. a person in a garden counts as garden)
//  top       : 'top1' = AI's #1 guess must be in include | 'top2' = #1 or #2 | 'any' = no check
//  minMatch  : how sure the AI must be.                        BIGGER = stricter
//  exclude   : { thing: max }  reject if photo has MORE of "thing".    SMALLER = stricter
//  need      : { thing: min }  reject if photo has LESS of "thing".    BIGGER = stricter
//  pixel     : plain facts  L=brightness  sat=colour strength  std=contrast  warm=orange amount  mono=colourless amount
//  topIn     : main subject must be one of these
//  dropLeastPretty : throw away the least pretty share of your photos (.25 = worst 25%)
export const CATEGORY_RULES = {
  perfect: { dropLeastPretty: [0.4, 0.4], minFaceScore: 0.8 }, // any photo with a face must have a face score of at least this (eyes open, straight, smile, size)
  color: { dropLeastPretty: [0.25, 0.25] },
  portrait: {
    include: [
      "face",
      "selfie",
      "pscene",
      "pcoffee",
      "clothes",
      "jewel",
      "hair",
    ],
    top: "top1",
    minMatch: [0, 0],
    need: { faces: [0.35, 0.22] },
    exclude: { kids: 0.2, notHuman: 0.2 },
    dropLeastPretty: [0.1, 0],
    faceRules: { minEyesOpen: 0.45, maxYaw: 40, maxFaces: 2, minScore: 0.5 }, // strict try only
    // If the face-detector says it's a GREAT portrait, skip the subject/“faces %” checks above:
    waiver: {
      score: 0.6, // face score at least this (smile + pose + straight + eyes)
      fullFace: true, // whole face inside the photo (not cut off)
      neckRoom: 0.08,
    },
  }, // some space below the chin (neck/shoulders visible). Lower = more forgiving
  animals: {
    include: ["dog", "cat", "bird", "animal", "bigcat"],
    withHuman: ["ppet"],
    minMatch: [0.25, 0.12],
    exclude: { faces: 0.2, kids: 0.2 },
  },
  garden: {
    include: ["plants"],
    withHuman: ["pgarden"],
    top: "top2",
    minMatch: [0.2, 0.1],
    exclude: { people: 0.25 },
  },
  nature: {
    include: [
      "landscape",
      "beach",
      "sky",
      "moon",
      "sunset",
      "goldensky",
      "mountains",
      "forest",
      "water",
      "field",
    ],
    withHuman: ["pscene"],
    minMatch: [0.2, 0.12],
    exclude: { people: 0.4 },
  },
  golden: {
    include: ["sunset", "goldensky"],
    withHuman: ["pscene"],
    minMatch: [0.25, 0.12],
    pixel: { warm: [0.1, 1] },
  },
  cars: {
    include: ["car", "sportscar", "moto", "bicycle", "pcar", "pbike"],
    minMatch: [0.25, 0.12],
  },
  food: {
    include: ["coffee", "food", "dessert", "drink"],
    withHuman: ["pcoffee"],
    minMatch: [0.25, 0.12],
    exclude: { people: 0.25 },
  },
  home: {
    include: ["home"],
    top: "top2",
    minMatch: [0.2, 0.1],
    exclude: { people: 0.3 },
  },
  pastel: { pixel: { L: [0.5, 1], sat: [0, 0.6] } },
  moody: {
    ai: true,
    pixel: { L: [0, 0.5], std: [30, 999] },
    topIn: [
      "landscape",
      "face",
      "selfie",
      "city",
      "night",
      "living",
      "sky",
      "moon",
      "car",
      "sportscar",
      "moto",
      "coffee",
      "pscene",
      "bigcat",
      "art",
      "flowers",
      "garden",
      "dog",
      "cat",
      "bird",
      "animal",
    ],
  },
  bw: { pixel: { mono: [0.85, 1] }, dropLeastPretty: [0.1, 0.1] }, // mono = share of colourless pixels (real B&W photos ≈ .95)
  dump: {},
};

// ───────────────────────── LAYER 3 · RANKING (who wins among accepted photos) ─────────────────────────
export const RANKING = {
  matchWeight: 0.5,
  beautyWeight: 0.5, // final order = how well it fits the vibe  +  how pretty it is
  blend: { aiTaste: 0.35, pixelLook: 0.65 }, // "pretty" = AI's taste + the picture's own look (should add to 1)
  pixelLook: {
    sharpness: 0.22,
    exposure: 0.14,
    contrast: 0.18,
    vividColour: 0.2,
    subjectPop: 0.14,
    palette: 0.12,
  }, // add to 1: sharp, well lit, vivid, subject stands out
  faceQuality: {
    eyesOpen: 0.32,
    smile: 0.18,
    straight: 0.28,
    tilt: 0.1,
    size: 0.12,
  }, // add to 1: what makes a perfect face
  duplicateDistance: 6, // photos this similar (0-64) count as duplicates; bigger = removes more
  perCategory: {
    perfect: {
      groupPenalty: {
        vehicle: 0.15,
        food: 0.05,
        home: 0.07,
        city: 0.05,
        other: 0.1,
      }, // points removed from kinds you want LOWER priority
      groupCap: { vehicle: 1, default: 2 }, // max photos of one kind in your 10
      faceWeight: 0.5,
    }, // how much face quality counts for photos with faces
    portrait: { boost: { faces: 1 }, faceWeight: 1.5 }, // clearer face = higher rank
    dump: { groupCap: { default: 2 } },
  },
};
