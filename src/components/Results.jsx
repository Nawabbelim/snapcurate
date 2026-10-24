import {CATS} from '../lib/curate.js';
import ReserveTray from './ReserveTray.jsx';
import AllPhotos from './AllPhotos.jsx';
import SharePanel from './SharePanel.jsx';
export default function Results({human,setHuman,aiErr,picks,setPicks,pool,res,cat,photos,back,handle,setHandle}){
  const c=CATS.find(x=>x.id===cat);
  const move=(i,d)=>{const j=i+d;if(j<0||j>=picks.length)return;const n=[...picks];[n[i],n[j]]=[n[j],n[i]];setPicks(n)};
  const swap=i=>{const nx=pool.find(p=>!picks.includes(p));if(!nx)return alert('No more matches 🙈');const n=[...picks];n[i]=nx;setPicks(n)};
  return(<div className="results"><button className="back" onClick={back}>← Back</button>
    <div className="rhead"><p className="kicker">YOUR BEST {picks.length}</p><h1>{c.e} {c.t}</h1><p>Ranked by looks + vibe match. Slide 1 is your cover.</p>
      <div className="pills"><span>📥 {photos.length} analysed</span><span>🗑 {res.rejected} junk removed</span><span>✅ {res.pool.length} matched</span></div>
      <div className="sws hm"><span>Person in every slide?</span><button className={'chip '+(!human?'on':'')} onClick={()=>setHuman(false)}>🎨 Mixed</button><button className={'chip '+(human?'on':'')} onClick={()=>setHuman(true)}>🙋 Human in every slide</button></div></div>
    {res.needsAI&&<div className="warn">⚠️ This vibe needs the AI vision, which didn't load{aiErr?` (${aiErr})`:''}. Go back and tap Retry once your internet works.</div>}
    {picks.length===0&&<div className="warn">Nothing matched this vibe 😢 Try another one.</div>}
    <div className="rgrid">{picks.map((p,i)=><article key={p.id} className="rcard" style={{'--r':(i%2?1:-1)*(1+i%3)*.6+'deg'}}>
      <div className="rimg"><img src={p.src} alt=""/><b className="sn">{i+1}</b>{p.reserve?<em className="badge lib">✦ reserve</em>:p.me?<em className="badge me">⭐ YOU</em>:<em className="badge you">YOURS</em>}</div>
      <div className="tools"><button onClick={()=>move(i,-1)}>◀</button>{!p.reserve&&!p.me&&<button title="swap" onClick={()=>swap(i)}>🔄</button>}<button onClick={()=>setPicks(picks.filter((_,k)=>k!==i))}>✕</button><button onClick={()=>move(i,1)}>▶</button></div></article>)}</div>
    <AllPhotos photos={photos} picks={picks} setPicks={setPicks} info={res.info}/>
    <ReserveTray picks={picks} setPicks={setPicks}/><SharePanel {...{picks,cat,handle,setHandle}}/></div>);
}
