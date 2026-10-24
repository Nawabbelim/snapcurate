import {useState} from 'react';
const TABS=[['all','All'],['selected','In carousel'],['lower','Matched, not used'],['rejected','Rejected']];
export default function AllPhotos({photos,picks,setPicks,info}){
  const [tab,setTab]=useState('all'),[lim,setLim]=useState(48);
  const rows=photos.map(p=>{const sel=picks.includes(p),i=info[p.id]||{s:'rejected',r:'Not checked'};return{p,s:sel?'selected':i.s,r:sel?'In your carousel':i.r}});
  const n=k=>k==='all'?rows.length:rows.filter(x=>x.s===k).length,shown=rows.filter(x=>tab==='all'||x.s===tab);
  const add=p=>picks.length>=20?alert('Instagram allows max 20 slides'):setPicks([...picks,p]);
  return(<details className="panel rej"><summary>📋 All {photos.length} photos &amp; why — tap to add or remove any</summary>
    <div className="sws">{TABS.map(([k,l])=><button key={k} className={'chip '+(tab===k?'on':'')} onClick={()=>{setTab(k);setLim(48)}}>{l} ({n(k)})</button>)}</div>
    <div className="rejg">{shown.slice(0,lim).map(({p,s,r})=><figure key={p.id} className={'st-'+s}><img loading="lazy" src={p.src} alt=""/><em>{s==='selected'?'✓ In carousel':s==='lower'?'Matched':'Rejected'}</em><small>{r}</small>
      {s==='selected'?<button className="rm" onClick={()=>setPicks(picks.filter(x=>x!==p))}>Remove</button>:<button onClick={()=>add(p)}>＋ Add</button>}</figure>)}</div>
    {shown.length>lim&&<button className="btn-light morebtn" onClick={()=>setLim(lim+48)}>Show more ({shown.length-lim})</button>}
  </details>);
}
