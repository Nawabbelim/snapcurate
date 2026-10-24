import { useRef, useState, useEffect } from "react";
const OK = (f) =>
  f.type.startsWith("image/") ||
  /\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(f.name);
export default function Dropzone({
  onFiles,
  onClear,
  busy,
  progress,
  photos,
  count,
  note,
}) {
  const ref = useRef(),
    fol = useRef();
  const [over, setOver] = useState(false);
  useEffect(() => {
    if (fol.current) {
      fol.current.setAttribute("webkitdirectory", "");
      fol.current.setAttribute("directory", "");
    }
  }, []);
  // newest photos first, so "folder" = your most recent photos (we keep up to 500 in total)
  const pick = (fs) =>
    onFiles([...fs].filter(OK).sort((a, b) => b.lastModified - a.lastModified));
  const full = count >= 500,
    none = count === 0 && !busy;
  return (
    <section
      className={"panel " + (over ? "dz-over" : "")}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
    >
      <div className="ptitle">
        <i className="num">01</i>
        <div>
          <h2>Upload photos</h2>
          <p>Up to 500 photos · add more any time</p>
        </div>
        <span className="pill">{count}/500</span>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={fol}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
      {none && (
        <div className="drop" onClick={() => ref.current.click()}>
          <div className="upicon">⬆️</div>
          <h3>Tap to choose photos</h3>
          <p>or drag &amp; drop them here · 🔒 stays on your device</p>
        </div>
      )}
      {busy && (
        <div className="dprog">
          <b>
            {progress.done === 0 && progress.msg
              ? progress.msg
              : `Looking at your pics… ${progress.done}/${progress.total}`}
          </b>
          <div className="bar wide">
            <i
              style={{
                width:
                  (progress.total
                    ? (progress.done / progress.total) * 100
                    : 0) + "%",
              }}
            />
          </div>
        </div>
      )}
      <div className="dbtns">
        <button
          className={none ? "btn-dark" : "btn-dark addmore"}
          disabled={busy || full}
          onClick={() => ref.current.click()}
        >
          <span className="plus">＋</span>
          {none ? "Choose photos" : "Add more photos"}
        </button>
        <button
          className="btn-light"
          disabled={busy || full}
          onClick={() => fol.current.click()}
        >
          📁 {none ? "Choose a folder" : "Add a folder"}{" "}
          <small>(newest first)</small>
        </button>
        {count > 0 && (
          <button className="linkbtn" disabled={busy} onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
      {note && <p className="note2">{note}</p>}
      {photos.length > 0 && (
        <div className="thumbs">
          {photos.slice(-6).map((p) => (
            <img key={p.id} src={p.src} alt="" />
          ))}
          {photos.length > 6 && <span>{photos.length}</span>}
        </div>
      )}
      <details className="tech">
        <summary>📱 Tips: selecting lots of photos</summary>
        <small>
          Websites can’t see your gallery, only what you pick. <b>Android:</b>{" "}
          in the picker long-press a photo, then drag across more to select
          many; or pick “Files/Browse”, open a folder, long-press one photo and
          tap “Select all”. <b>iPhone:</b> tap “Select”, then tap photos (or
          slide your finger over several). <b>Folder button:</b> works on
          desktop and most Android browsers; it takes the newest photos first
          and stops at 500.
        </small>
      </details>
    </section>
  );
}
