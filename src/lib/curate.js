import { BORING } from "./prompts.js";
export const HUES = [
  "Red",
  "Orange",
  "Yellow",
  "Lime",
  "Green",
  "Mint",
  "Cyan",
  "Blue",
  "Violet",
  "Purple",
  "Pink",
  "Rose",
];
const S = (p, k) => k.reduce((s, x) => s + (p.main[x] || 0), 0);
const top = (p) => Object.entries(p.main).sort((a, b) => b[1] - a[1])[0]?.[0];
const GRP = {};
const G = (g, a) => a.forEach((k) => (GRP[k] = g));
const PEOPLE = [
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
];
G("people", PEOPLE);
G("animal", ["dog", "cat", "bird", "animal", "bigcat"]);
G("plant", ["flowers", "garden", "plants"]);
G("nature", [
  "landscape",
  "beach",
  "sky",
  "sunset",
  "goldensky",
  "moon",
  "mountains",
  "forest",
  "water",
  "field",
]);
G("vehicle", ["car", "sportscar", "moto", "bicycle"]);
G("food", ["coffee", "food", "dessert", "drink"]);
G("home", ["living", "bedroom", "kitchen", "house"]);
G("art", ["art", "toy"]);
G("city", ["city", "night"]);
const grp = (p) => (p.hasModel ? GRP[top(p)] || "other" : "h" + p.hue);
const K = {
  portrait: ["face", "selfie"],
  mixed: ["pcar", "pbike", "pgarden", "pcoffee", "ppet", "pscene"],
  animals: ["dog", "cat", "bird", "animal", "bigcat"],
  garden: ["flowers", "garden", "plants"],
  nature: [
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
  cars: ["car", "sportscar", "moto", "bicycle", "pcar", "pbike"],
  food: ["coffee", "food", "dessert", "drink"],
  home: ["living", "bedroom", "kitchen", "house"],
  golden: ["sunset", "goldensky"],
};
const np = (p) => S(p, PEOPLE) < 0.25;
// "keyed" vibes: the photo's MAIN subject (AI's #1 guess) must belong to the vibe, so random stuff can't sneak in
const sub = (k, gate) => ({ ai: 1, keys: K[k], th: (p) => S(p, K[k]), gate });
export const CATS = [
  {
    id: "perfect",
    e: "💎",
    t: "Most perfect",
    d: "Prettiest shots of ANY subject",
    hot: 1,
    th: () => 1,
  },
  {
    id: "color",
    e: "🎨",
    t: "Colour match",
    d: "Best photos of ONE colour",
    hot: 1,
    th: (p) => 0.3 + 0.7 * Math.min(1, p.sat * 1.6),
    gate: (p, o) => (o.hue === -1 ? p.neutral : !p.neutral && p.hue === o.hue),
  },
  {
    id: "portrait",
    e: "🧑",
    t: "Portrait faces",
    d: "One person, face in focus",
    ai: 1,
    th: (p) => S(p, ["face", "selfie"]) + 0.4 * S(p, K.mixed),
    pass: (p, ms) =>
      S(p, ["face", "selfie"]) >= ms + 0.1 &&
      [
        "face",
        "selfie",
        "pscene",
        "pcoffee",
        "clothes",
        "jewel",
        "hair",
      ].includes(top(p)) &&
      S(p, [
        "family",
        "child",
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
      ]) < 0.2,
  },

  {
    id: "mixed",
    e: "🧍",
    t: "Face + things",
    d: "person with a car, bike, coffee, pet…",
    ...sub(
      "mixed",
      (p) => S(p, ["family", "child", "flowers", "garden", "plants"]) < 0.2,
    ),
  },
  {
    id: "animals",
    e: "🐶",
    t: "Animals",
    d: "Pets and wildlife",
    ...sub("animals", (p) => S(p, ["face", "selfie", "family", "child"]) < 0.2),
  },
  {
    id: "garden",
    e: "🌸",
    t: "Flowers & plants",
    d: "Blooms, gardens, greenery",
    ...sub("garden", np),
  },
  {
    id: "nature",
    e: "🏔️",
    t: "Nature & sky",
    d: "Landscapes, beach, skies",
    ...sub("nature", (p) => S(p, PEOPLE) < 0.4),
    min: 0.2,
  },
  {
    id: "golden",
    e: "🌇",
    t: "Sunset / sunrise",
    d: "Golden skies only",
    hot: 1,
    ...sub("golden", (p) => p.warm > 0.1),
  },
  {
    id: "cars",
    e: "🏍️",
    t: "Cars & rides",
    d: "Vehicles, or you with a vehicle",
    ...sub("cars", () => true),
  },
  {
    id: "food",
    e: "☕",
    t: "Coffee & food",
    d: "Cafe, drinks, desserts",
    hot: 1,
    ...sub("food", np),
  },
  {
    id: "home",
    e: "🏡",
    t: "Cozy home",
    d: "Pretty rooms & decor",
    ...sub("home", (p) => S(p, PEOPLE) < 0.3),
  },
  {
    id: "pastel",
    e: "🧁",
    t: "Soft pastel",
    d: "Light, airy, dreamy",
    hot: 1,
    th: (p) =>
      p.hasModel ? Math.min(1, (p.mood.pastel || 0) * 1.5 + 0.1) : p.L,
    gate: (p) => p.L > 0.5 && p.sat < 0.6,
  },
  {
    id: "moody",
    e: "🌙",
    t: "Dark & moody",
    d: "Cinematic, beautiful shadows",
    ai: 1,
    hot: 1,
    th: (p) => p.mood.moody || 0,
    gate: (p) =>
      p.L < 0.5 &&
      p.std > 30 &&
      [
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
      ].includes(top(p)),
  },
  {
    id: "bw",
    e: "🎞️",
    t: "Black & white",
    d: "True monochrome / film",
    th: (p) => (p.hasModel ? 0.5 + 0.5 * (p.mood.bw || 0) : 1),
    gate: (p) => p.mono > 0.88 && (!p.hasModel || (p.mood.bw || 0) > 0.3),
  },
  {
    id: "dump",
    e: "📸",
    t: "Photo dump",
    d: "Varied best-of mix",
    hot: 1,
    th: (p) => 0.5,
  },
];
const ham = (a, b) => {
  let d = 0;
  for (let i = 0; i < 64; i++) if (a[i] !== b[i]) d++;
  return d;
};
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
export function curate(photos, id, o) {
  const cat = CATS.find((c) => c.id === id),
    opts = { ...o };
  const clean = photos.filter((p) => !p.junk.length);
  if (id === "color" && opts.hue === -2) {
    const n = {};
    clean
      .filter((p) => !p.neutral)
      .forEach((p) => (n[p.hue] = (n[p.hue] || 0) + 1));
    const t = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
    opts.hue = t ? +t[0] : -1;
  }
  const needsAI = !!cat.ai && !photos.some((p) => p.hasModel);
  // beauty: pixel look (vivid colour, contrast, subject pop, palette harmony) + AI taste. Normalised per subject so faces can't win just for being faces.
  const raw = (p) => (p.hasModel ? 0.35 * p.pb + 0.65 * p.q : p.q);
  const gs = {};
  clean.forEach((p) => (gs[grp(p)] = gs[grp(p)] || []).push(raw(p)));
  const gAll = mean(clean.map(raw));
  const adj = (p) => {
    const a = gs[grp(p)];
    return raw(p) - (a && a.length >= 4 ? 0.7 * (mean(a) - gAll) : 0);
  };
  const bs = clean.map(adj).sort((a, b) => a - b);
  const diverse = id === "perfect" || id === "dump",
    rank = (a) => (diverse ? a.b : 0.5 * a.t + 0.5 * a.b);
  const pick = (sorted) => {
    let pool = [];
    for (const cap of diverse ? [2, 4, 99] : [99]) {
      const cnt = {};
      pool = [];
      for (const a of sorted) {
        const g = grp(a.p);
        if ((cnt[g] || 0) >= cap) continue;
        if (pool.every((q) => ham(q.hash, a.p.hash) > 6)) {
          pool.push(a.p);
          cnt[g] = (cnt[g] || 0) + 1;
          if (pool.length >= 10) break;
        }
      }
      if (pool.length >= 10) break;
    }
    return pool;
  };
  // tier 1 = strict; if fewer than 6 found, tier 2 relaxes (lower match score, no beauty cut) so your normal clicked photos are not forgotten
  const keyed = cat.keys || cat.pass,
    tiers = keyed
      ? [
          [cat.min || 0.25, 0.1],
          [0.12, 0],
        ]
      : [[0, 0.25]];
  let pool = [],
    sorted = [];
  for (const [ms, qq] of tiers) {
    const cut = id === "perfect" ? -9 : bs[Math.floor(bs.length * qq)] || 0;
    sorted = needsAI
      ? []
      : clean
          .filter(
            (p) =>
              adj(p) >= cut &&
              (cat.pass
                ? cat.pass(p, ms)
                : cat.keys
                  ? cat.keys.includes(top(p)) && S(p, cat.keys) >= ms
                  : !(p.hasModel && BORING.includes(top(p)))) &&
              (!cat.gate || cat.gate(p, opts)),
          )
          .map((p) => ({ p, t: cat.th(p, opts), b: adj(p) }))
          .sort((x, y) => rank(y) - rank(x));
    pool = pick(sorted);
    if (pool.length >= 6) break;
  }
  const extra = sorted
    .map((a) => a.p)
    .filter(
      (p) => !pool.includes(p) && pool.every((q) => ham(q.hash, p.hash) > 6),
    )
    .slice(0, 20);
  return {
    pool: [...pool, ...extra],
    hue: opts.hue,
    rejected: photos.length - clean.length,
    needsAI,
  };
}
