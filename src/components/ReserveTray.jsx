import {RESERVES} from '../lib/reserves.js';
export default function ReserveTray({picks,setPicks}){
  return(<section className="panel"><div className="ptitle"><i className="num">🎁</i><div><h2>Cute reserve pics</h2><p>Tap to add extra illustrated slides</p></div></div>
    <div className="tray">{RESERVES.map(r=>{const u=picks.some(p=>p.id===r.id);return(<button key={r.id} disabled={u} onClick={()=>setPicks([...picks,{...r,reserve:true}])}><img src={r.src} alt=""/><span>{u?'added ✓':r.name}</span></button>)})}</div></section>);
}
