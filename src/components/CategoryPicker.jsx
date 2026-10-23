import {CATS,HUES} from '../lib/curate.js';
const TONE=['lilac','peach','pink','mint','dark','yellow','blue','orange','green','cream','lilac','pink'];
export default function CategoryPicker({cat,setCat,hue,setHue}){
  return(<section className="panel"><div className="ptitle"><i className="num">02</i><div><h2>Pick a vibe</h2><p>What should your post feel like?</p></div><span className="spark">✦</span></div>
    <div className="vgrid">{CATS.map((c,i)=><button key={c.id} className={`vopt ${TONE[i%TONE.length]} ${cat===c.id?'chosen':''}`} onClick={()=>setCat(c.id)}>
      <span className="vi">{c.e}</span><span><b>{c.t}</b><small>{c.d}</small></span>{c.hot&&<em>🔥</em>}</button>)}</div>
    {cat==='color'&&<div className="cpick"><b>Which colour?</b>
      <div className="sws"><button className={'chip '+(hue===-2?'on':'')} onClick={()=>setHue(-2)}>Auto ✨</button>
        {HUES.map((h,i)=><button key={h} title={h} className={'sw '+(hue===i?'on':'')} style={{background:`hsl(${i*30+15} 75% 62%)`}} onClick={()=>setHue(i)}/>)}
        <button className={'chip '+(hue===-1?'on':'')} onClick={()=>setHue(-1)}>B&amp;W</button></div></div>}
  </section>);
}
