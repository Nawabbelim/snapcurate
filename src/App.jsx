import { useEffect, useMemo, useRef, useState } from "react";
import Home from "./components/Home.jsx";
import Dropzone from "./components/Dropzone.jsx";
import CategoryPicker from "./components/CategoryPicker.jsx";
import MePanel from "./components/MePanel.jsx";
import Results from "./components/Results.jsx";
import Switch from "./components/Switch.jsx";
import Floaties from "./components/Floaties.jsx";
import {
  analyze,
  loadClip,
  resetClip,
  skipClip,
  onClipProgress,
  getClipErr,
  friendly,
} from "./lib/analyze.js";
import { curate, CATS } from "./lib/curate.js";
import { reserveFor, RESERVES } from "./lib/reserves.js";
export default function App() {
  const [view, setView] = useState("home");
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState({ done: 0, total: 0 });
  const [cat, setCat] = useState("perfect");
  const [hue, setHue] = useState(-2);
  const [useRes, setUseRes] = useState(true);
  const [picks, setPicks] = useState([]);
  const [handle, setHandle] = useState("");
  const [ai, setAi] = useState({ status: "idle", err: "" });
  const [pg, setPg] = useState({ pct: 0, mb: 0, tot: 0 });
  const [files, setFiles] = useState([]);
  const [me, setMe] = useState([]);
  const [meOn, setMeOn] = useState(false);
  const [mePos, setMePos] = useState("first");
  const [burst, setBurst] = useState(0);
  const res = useMemo(
    () => (photos.length ? curate(photos, cat, { hue }) : null),
    [photos, cat, hue],
  );
  useEffect(() => {
    if (!res) return;
    const mine = meOn ? me : [];
    const n = 10 - mine.length;
    let p = res.pool.slice(0, n);
    if (useRes && p.length < n)
      p = [
        ...p,
        ...reserveFor(cat, res.hue)
          .slice(0, n - p.length)
          .map((r) => ({ ...r, reserve: true })),
      ];
    const at = mePos === "first" ? 0 : mePos === "second" ? 1 : p.length;
    p.splice(Math.min(at, p.length), 0, ...mine);
    setPicks(p);
  }, [res, useRes, cat, me, meOn, mePos]);
  const io = useRef(null);
  useEffect(() => {
    if (!io.current)
      io.current = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.current.unobserve(e.target);
            }
          }),
        { threshold: 0.05 },
      );
    document
      .querySelectorAll(".step,.rule,.panel,.strip div,.rcard,.block h2")
      .forEach((el, i) => {
        if (!el.classList.contains("rv")) {
          el.classList.add("rv");
          el.style.transitionDelay = (i % 5) * 70 + "ms";
          setTimeout(() => {
            el.style.transitionDelay = "";
          }, 1200);
        }
        if (!el.classList.contains("in")) io.current.observe(el);
      });
    const t = setTimeout(
      () =>
        document.querySelectorAll(".rv:not(.in)").forEach((e) => {
          if (e.getBoundingClientRect().top < innerHeight + 80)
            e.classList.add("in");
        }),
      1500,
    );
    return () => clearTimeout(t);
  });
  const st = () => {
    const e = getClipErr();
    return e
      ? { status: e.startsWith("Skipped") ? "skipped" : "failed", err: e }
      : { status: "ready", err: "" };
  };
  const prepAI = async () => {
    setAi({ status: "loading", err: "" });
    await loadClip();
    setAi(st());
  };
  useEffect(() => onClipProgress(setPg), []);
  useEffect(() => {
    if (view === "setup" && ai.status === "idle") prepAI();
  }, [view]);
  async function onFiles(files) {
    if (!files.length) return;
    setBusy(true);
    setProg({ done: 0, total: files.length });
    setFiles(files);
    resetClip();
    if (ai.status !== "ready") setAi({ status: "loading", err: "" });
    await loadClip();
    setAi(st());
    const out = [];
    let i = 0;
    const w = async () => {
      while (i < files.length) {
        const k = i++;
        try {
          out[k] = await analyze(files[k], "p" + k);
        } catch {}
        setProg((s) => ({ ...s, done: s.done + 1 }));
      }
    };
    await Promise.all([w(), w()]);
    setPhotos(out.filter(Boolean));
    setBusy(false);
    setAi(st());
  }
  const go = (v) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (v === "results") setBurst((b) => b + 1);
  };
  const prev = RESERVES.slice(0, 3);
  return (
    <div className="app">
      <div className="grain" />
      <Floaties />
      {burst > 0 && view === "results" && (
        <div className="confetti" key={burst}>
          {Array.from({ length: 26 }, (_, i) => (
            <span
              key={i}
              style={{
                left: ((i * 37) % 100) + "%",
                animationDelay: (i % 7) * 0.12 + "s",
              }}
            >
              {["🌸", "✨", "💖", "🦋", "⭐"][i % 5]}
            </span>
          ))}
        </div>
      )}
      <header className="topwrap">
        <nav className="top">
          <a className="brand" onClick={() => go("home")}>
            <span className="cam">📷</span>Snap
            <span className="grad">Curate</span>
          </a>
          <div className="navr">
            <a
              href="#rules"
              onClick={() => view !== "home" && go("home")}
              className="navlink"
            >
              Rules
            </a>
            <button className="btn-dark sm shine" onClick={() => go("setup")}>
              Start ✨
            </button>
          </div>
        </nav>
      </header>
      <main>
        {view === "home" && <Home start={() => go("setup")} />}
        {view === "setup" && (
          <div className="setup">
            <div className="shead">
              <button className="back" onClick={() => go("home")}>
                ← Back
              </button>
              <p className="kicker">LET'S CURATE</p>
              <h1>
                Make your <span className="pop">carousel</span>
              </h1>
            </div>
            {ai.status !== "idle" && (
              <div className={"warn " + (ai.status === "ready" ? "okb" : "")}>
                {ai.status === "ready" &&
                  "🤖 AI vision ready — smart filtering is ON"}
                {ai.status === "loading" && (
                  <>
                    <b>
                      🤖 Downloading AI vision (first time only, ~150MB)…{" "}
                      {pg.pct}%
                    </b>
                    <div className="bar wide">
                      <i style={{ width: pg.pct + "%" }} />
                    </div>
                    <small>
                      {pg.mb}/{pg.tot || 150} MB · it is cached afterwards.{" "}
                    </small>
                    <button className="chip" onClick={skipClip}>
                      Skip AI (basic mode)
                    </button>
                  </>
                )}
                {ai.status === "skipped" && (
                  <>
                    Basic mode: AI skipped, so subject vibes (animals, flowers…)
                    are off.{" "}
                  </>
                )}
                {ai.status === "failed" && (
                  <>
                    <b>⚠️ {friendly(ai.err)}</b>{" "}
                    <details className="tech">
                      <summary>Technical details</summary>
                      <small>{ai.err}</small>
                    </details>
                  </>
                )}
                {(ai.status === "failed" || ai.status === "skipped") && (
                  <button
                    className="chip on"
                    onClick={() => {
                      resetClip(true);
                      setAi({ status: "idle", err: "" });
                      files.length ? onFiles(files) : prepAI();
                    }}
                  >
                    Retry ↻
                  </button>
                )}
              </div>
            )}
            <div className="layout">
              <div className="col">
                <Dropzone
                  {...{ onFiles, busy, photos }}
                  progress={{
                    ...prog,
                    msg:
                      ai.status === "loading"
                        ? `Downloading AI vision… ${pg.pct}% (${pg.mb}/${pg.tot || 150} MB)`
                        : "",
                  }}
                />
                <CategoryPicker {...{ cat, setCat, hue, setHue }} />
                <MePanel
                  {...{ me, setMe }}
                  on={meOn}
                  setOn={setMeOn}
                  pos={mePos}
                  setPos={setMePos}
                />
              </div>
              <aside>
                <div className="sticky card-prev">
                  <div className="collage">
                    {prev.map((r, i) => (
                      <img key={r.id} src={r.src} className={"c" + i} />
                    ))}
                    <span className="sticker cs">🌸</span>
                  </div>
                  <b>{CATS.find((c) => c.id === cat).t}</b>
                  <small>
                    {photos.length
                      ? `${photos.length} photos ready`
                      : "Upload to begin"}
                  </small>
                  <Switch
                    on={useRes}
                    set={setUseRes}
                    emoji="🎁"
                    label="Cute reserve pics"
                    sub="Fill empty slots with illustrated extras"
                  />
                  <button
                    className="btn-dark wide shine"
                    disabled={!photos.length || busy}
                    onClick={() => go("results")}
                  >
                    Curate my best 10 ✨
                  </button>
                  <p className="fine">
                    🔒 Photos are analysed on your device only.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}
        {view === "results" && res && (
          <Results
            {...{ picks, setPicks, res, cat, photos, handle, setHandle }}
            aiErr={ai.err}
            pool={res.pool}
            back={() => go("setup")}
          />
        )}
      </main>
      <footer>
        <span>© SnapCurate</span>
        <span>Made with 💖 for your feed</span>
      </footer>
    </div>
  );
}
