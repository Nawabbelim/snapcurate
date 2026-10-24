import { BORING, SUBJECT, JUNK } from "./prompts.js";
import {
  SETS,
  CATEGORY_RULES,
  GLOBAL_REJECT,
  HUMAN_REQUIRED,
  RANKING,
} from "../rules.config.js";
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
const ex = (n) => SETS[n] || [n];
const S = (p, names) =>
  names.flatMap(ex).reduce((s, x) => s + (p.main[x] || 0), 0);
const rk = (p) => Object.entries(p.main).sort((a, b) => b[1] - a[1]);
const top = (p) => (rk(p)[0] || [])[0];
const GRP = {};
const G = (g, a) => a.forEach((k) => (GRP[k] = g));
G("people", SETS.people);
G("animal", ["dog", "cat", "bird", "animal", "bigcat"]);
G("plant", SETS.plants);
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
G("home", SETS.home);
G("art", ["art", "toy"]);
G("city", ["city", "night"]);
const grp = (p) => (p.hasModel ? GRP[top(p)] || "other" : "h" + p.hue);
const fsc = (p) =>
  p.face && p.face.n
    ? p.face.score
    : p.hasModel
      ? p.fq == null
        ? 0.5
        : p.fq
      : 0.5;
const isHuman = (p) =>
  (p.face && p.face.n > 0) || S(p, ["people"]) >= HUMAN_REQUIRED.minPeople;
const hasFace = (p) => (p.face && p.face.n > 0) || grp(p) === "people";
export const CATS = [
  {
    id: "perfect",
    e: "💎",
    t: "Most perfect",
    d: "Prettiest shots of ANY subject",
  },
  { id: "color", e: "🎨", t: "Colour match", d: "Best photos of ONE colour" },
  {
    id: "portrait",
    e: "🧑",
    t: "Portrait faces",
    d: "Best human faces & poses",
  },
  { id: "animals", e: "🐶", t: "Animals", d: "Pets and wildlife" },
  {
    id: "garden",
    e: "🌸",
    t: "Flowers & plants",
    d: "Flowers, leaves, gardens, plants",
  },
  { id: "nature", e: "🏔️", t: "Nature & sky", d: "Landscapes, beach, skies" },
  { id: "golden", e: "🌇", t: "Sunset / sunrise", d: "Golden skies only" },
  {
    id: "cars",
    e: "🏍️",
    t: "Cars & rides",
    d: "Vehicles, or you with a vehicle",
  },
  { id: "food", e: "☕", t: "Coffee & food", d: "Cafe, drinks, desserts" },
  {
    id: "home",
    e: "🏡",
    t: "Cozy home",
    d: "Rooms, sofa, bed, TV, fridge, AC, fan",
  },
  { id: "pastel", e: "🧁", t: "Soft pastel", d: "Light, airy, dreamy" },
  {
    id: "moody",
    e: "🌙",
    t: "Dark & moody",
    d: "Cinematic, beautiful shadows",
  },
  { id: "bw", e: "🎞️", t: "Black & white", d: "True monochrome / film" },
  { id: "dump", e: "📸", t: "Photo dump", d: "Varied best-of mix" },
].map((c) => ({
  ...c,
  ai: !!(CATEGORY_RULES[c.id].include || CATEGORY_RULES[c.id].ai),
}));
const TH = {
  color: (p) => 0.3 + 0.7 * Math.min(1, p.sat * 1.6),
  pastel: (p) =>
    p.hasModel ? Math.min(1, (p.mood.pastel || 0) * 1.5 + 0.1) : p.L,
  moody: (p) => p.mood.moody || 0,
  bw: (p) => (p.hasModel ? 0.5 + 0.5 * (p.mood.bw || 0) : 1),
  perfect: () => 1,
  dump: () => 0.5,
};
const v = (x, t) => (Array.isArray(x) ? x[t] : x);
const pct = (x) => Math.round(x * 100) + "%";
const lab = (k) =>
  (SUBJECT[k] || JUNK[k] || k || "unknown").replace(/^(a|an) /, "");
const ham = (a, b) => {
  let d = 0;
  for (let i = 0; i < 64; i++) if (a[i] !== b[i]) d++;
  return d;
};
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
// ===== LAYER 1: global rejection (same for every vibe) =====
function globalWhy(p) {
  if (p.junk.length) return "Global reject (picture check): " + p.junk[0];
  for (const [k, t] of Object.entries(GLOBAL_REJECT)) {
    const s = p.main[k] || 0;
    if (s > t)
      return `Global reject: looks like “${lab(k)}” (${pct(s)}; limit ${pct(t)})`;
  }
  return null;
}
// ===== LAYER 2: category rules — plain-English reason if the photo does NOT belong, else null =====
function why(p, id, cfg, t, opts, cutVal, b) {
  if (b < cutVal)
    return "Not as pretty/sharp as your better photos (below the quality cut)";
  if (opts.human && !isHuman(p))
    return "Human mode: no person found in this photo";
  const tp = top(p),
    mm = cfg.minMatch || [0.25, 0.12],
    W = cfg.waiver,
    F = p.face;
  const great = !!(
    W &&
    F &&
    F.n >= 1 &&
    F.score >= W.score &&
    (!W.fullFace || F.full) &&
    F.chinRoom >= W.neckRoom
  ); // detector says: great portrait -> skip subject checks
  if (cfg.include) {
    const incN = [...cfg.include, ...(opts.human ? cfg.withHuman || [] : [])],
      inc = incN.flatMap(ex),
      m = S(p, incN),
      mode = cfg.top || "top1";
    if (!great) {
      if (
        mode !== "any" &&
        !rk(p)
          .slice(0, mode === "top2" ? 2 : 1)
          .some((x) => inc.includes(x[0]))
      )
        return `Main subject looks like “${lab(tp)}” (${pct(p.main[tp] || 0)}), not this vibe`;
      if (m < v(mm, t))
        return `Only ${pct(m)} match for this vibe (needs ${pct(v(mm, t))})`;
    }
  } else if (p.hasModel && cfg.skipBoring !== false && BORING.includes(tp))
    return `Unclear/boring subject: “${lab(tp)}”`;
  if (cfg.topIn && !cfg.topIn.includes(tp))
    return `Main subject “${lab(tp)}” does not suit this vibe`;
  for (const [n, mx] of Object.entries(cfg.exclude || {})) {
    if (opts.human && (n === "people" || n === "faces")) continue;
    const s = S(p, [n]);
    if (s >= v(mx, t))
      return `Contains too much “${n}” (${pct(s)}; limit ${pct(v(mx, t))})`;
  }
  for (const [n, mn] of Object.entries(cfg.need || {})) {
    if (great && n === "faces") continue;
    const s = S(p, [n]);
    if (s < v(mn, t))
      return `Not enough “${n}” visible (${pct(s)}; needs ${pct(v(mn, t))})`;
  }
  for (const [f, [lo, hi]] of Object.entries(cfg.pixel || {}))
    if (p[f] < lo || p[f] > hi)
      return `Picture “${f}” (${(+p[f]).toFixed(2)}) is outside this vibe's range ${lo}–${hi}`;
  if (id === "color") {
    if (opts.hue === -1) {
      if (!p.neutral) return "Not black & white / neutral";
    } else if (p.neutral || p.hue !== opts.hue)
      return `Colour is not ${HUES[opts.hue]}`;
  }
  const fr = cfg.faceRules;
  if (fr && t === 0 && F) {
    if (F.n === 0) return "No clear human face found";
    if (F.n > fr.maxFaces) return `Too many faces (${F.n})`;
    if (F.eyes < fr.minEyesOpen) return "Eyes look closed or half-closed";
    if (F.yaw > fr.maxYaw) return `Face turned away (${Math.round(F.yaw)}°)`;
    if (F.score < fr.minScore) return "Pose / expression not flattering enough";
  }
  if (cfg.minFaceScore && hasFace(p) && fsc(p) < cfg.minFaceScore)
    return "Face not perfect enough (eyes / angle / smile) for this vibe";
  return null;
}
export function curate(photos, id, o) {
  const cat = CATS.find((c) => c.id === id),
    cfg = CATEGORY_RULES[id] || {},
    rc = (RANKING.perCategory || {})[id] || {},
    opts = { ...o },
    info = {};
  const clean = [];
  photos.forEach((p) => {
    const r = globalWhy(p);
    if (r) info[p.id] = { s: "rejected", r };
    else clean.push(p);
  });
  if (id === "color" && opts.hue === -2) {
    const n = {};
    clean
      .filter((p) => !p.neutral)
      .forEach((p) => (n[p.hue] = (n[p.hue] || 0) + 1));
    const t = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
    opts.hue = t ? +t[0] : -1;
  }
  const needsAI =
    (!!cat.ai && !photos.some((p) => p.hasModel)) ||
    (!!opts.human &&
      !photos.some((p) => p.hasModel || (p.face && p.face.n > 0)));
  // ===== LAYER 3: ranking — beauty = AI taste + picture look, compared fairly between subject types =====
  const BL = RANKING.blend,
    raw = (p) => (p.hasModel ? BL.aiTaste * p.pb + BL.pixelLook * p.q : p.q);
  const gs = {};
  clean.forEach((p) => (gs[grp(p)] = gs[grp(p)] || []).push(raw(p)));
  const gAll = mean(clean.map(raw));
  const adj = (p) => {
    const g = grp(p),
      a = gs[g];
    let b = raw(p) - (a && a.length >= 4 ? 0.7 * (mean(a) - gAll) : 0);
    if (rc.groupPenalty) b -= rc.groupPenalty[g] || 0;
    if (rc.faceWeight && !cfg.include && hasFace(p))
      b = (1 - rc.faceWeight) * b + rc.faceWeight * fsc(p);
    return b;
  };
  const bs = clean.map(adj).sort((a, b) => a - b),
    diverse = !!rc.groupCap;
  const inc = cfg.include
    ? [...cfg.include, ...(opts.human ? cfg.withHuman || [] : [])]
    : null;
  const th = (p) =>
    inc
      ? S(p, inc) +
        Object.entries(rc.boost || {}).reduce(
          (s, [k, w]) => s + w * S(p, [k]),
          0,
        )
      : TH[id](p);
  const fw = cfg.include ? rc.faceWeight || 0 : 0;
  const rank = (a) =>
    diverse && !cfg.include
      ? a.b
      : RANKING.matchWeight * a.t +
        RANKING.beautyWeight * a.b +
        fw * fsc(a.p) * (a.p.face && a.p.face.n ? 1 : 0.3);
  const skipR = {},
    DD = RANKING.duplicateDistance;
  const pick = (sorted) => {
    let pool = [];
    for (const m of [1, 2, 99]) {
      const cnt = {};
      pool = [];
      for (const k in skipR) delete skipR[k];
      for (const a of sorted) {
        const g = grp(a.p),
          gc = rc.groupCap || {},
          cap = (gc[g] ?? gc.default ?? 99) * m;
        if ((cnt[g] || 0) >= cap) {
          skipR[a.p.id] =
            `Matched, but you already have enough “${g}” photos — kept the best`;
          continue;
        }
        if (!pool.every((q) => ham(q.hash, a.p.hash) > DD)) {
          skipR[a.p.id] = "Matched, but very similar to a better photo";
          continue;
        }
        pool.push(a.p);
        cnt[g] = (cnt[g] || 0) + 1;
        if (pool.length >= 10) break;
      }
      if (pool.length >= 10 || !rc.groupCap) break;
    }
    return pool;
  };
  // tier 0 = strict; if fewer than 6 photos pass, tier 1 (looser numbers) is tried so normal photos are not forgotten
  let pool = [],
    sorted = [],
    fails = {};
  for (const t of [0, 1]) {
    const q = v(
        cfg.dropLeastPretty || (cfg.include ? [0.1, 0] : [0.25, 0.25]),
        t,
      ),
      cutVal = q <= 0 ? -9 : bs[Math.floor(bs.length * q)] || -9;
    fails = {};
    sorted = [];
    for (const p of clean) {
      const b = adj(p),
        r = needsAI
          ? "The AI helper is not loaded, so this vibe cannot judge the photo"
          : why(p, id, cfg, t, opts, cutVal, b);
      if (r) fails[p.id] = r;
      else sorted.push({ p, t: th(p), b });
    }
    sorted.sort((x, y) => rank(y) - rank(x));
    pool = pick(sorted);
    if (pool.length >= 6) break;
  }
  clean.forEach((p) => {
    if (fails[p.id]) info[p.id] = { s: "rejected", r: fails[p.id] };
    else {
      const i = pool.indexOf(p);
      info[p.id] = {
        s: "lower",
        r:
          i >= 0
            ? `Matched this vibe — rank #${i + 1} (the carousel uses the top 10)`
            : skipR[p.id] || "Matched, but ranked lower than better photos",
      };
    }
  });
  const extra = sorted
    .map((a) => a.p)
    .filter(
      (p) => !pool.includes(p) && pool.every((q) => ham(q.hash, p.hash) > DD),
    )
    .slice(0, 20);
  return {
    pool: [...pool, ...extra],
    hue: opts.hue,
    rejected: photos.length - clean.length,
    needsAI,
    info,
  };
}
