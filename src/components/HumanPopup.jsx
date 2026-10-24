export default function HumanPopup({onPick,onClose}){
  return(<div className="modal" onClick={onClose}><div className="mcard" onClick={e=>e.stopPropagation()}>
    <span className="sticker msk">💖</span><h2>One quick question ✨</h2><p>Do you want a person in your post?</p>
    <button className="mopt" onClick={()=>onPick(true)}><span>🙋</span><div><b>Human in every slide</b><small>Every photo must contain a person. Cute illustration extras are turned off.</small></div></button>
    <button className="mopt alt" onClick={()=>onPick(false)}><span>🎨</span><div><b>Mixed — just the best</b><small>Normal results: the best photos for your vibe, with or without people.</small></div></button>
    <button className="linkbtn mclose" onClick={onClose}>Cancel</button></div></div>);
}
