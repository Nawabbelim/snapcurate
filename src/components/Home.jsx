import {RESERVES} from '../lib/reserves.js';
import Sticker from './Sticker.jsx';
import {CATS} from '../lib/curate.js';
import RulesPanel from './RulesPanel.jsx';
const R=id=>RESERVES.find(r=>r.id===id).src;
const STEPS=[['📸','Drop your roll','50–500 photos. They never leave your phone.'],['🪄','Pick a vibe','Colour, portrait, coffee, golden hour… we find the prettiest matches.'],['💌','Post it','Reorder, swap, add stickers-y reserves, then share to Instagram.']];
export default function Home({start}){return(<>
  <section className="hero">
    <div className="hero-copy">
      <p className="eyebrow"><i className="live-dot"/> BEST-OF-10 CAROUSEL MAKER</p>
      <h1>Your camera roll, <span className="scribble">but</span> <span className="pop">cuter.</span></h1>
      <p className="lede">We skip screenshots, QR codes and blurry shots, then pick the <em>prettiest photos that match your vibe</em>.</p>
      <div className="hero-actions"><button className="btn-dark big" onClick={start}>Start curating ✨</button><a href="#rules" className="quiet">▶ How it picks</a></div>
      <div className="proof"><span className="avs"><b>🌸</b><b>☕</b><b>🌿</b><b>🌇</b></span><p><b>Made for Gen-Z feeds</b><small>private · free · no login</small></p></div>
    </div>
    <div className="hero-art"><div className="orbit"/><div className="orbit o2"/>
      <figure className="pc back"><img src={R('r2')}/><figcaption>garden day</figcaption></figure>
      <figure className="pc mid"><img src={R('r3')}/><figcaption>golden hr</figcaption></figure>
      <figure className="pc front"><img src={R('r1')}/><figcaption><small>VIBE CHECK</small><b>Latte Time ☕</b></figcaption></figure>
      <div className="note">10/10 ✨<br/><small>would post</small></div>
      <Sticker e="🌸" c="#e5defe" cls="s1"/><Sticker e="🦋" c="#d8ead5" cls="s2"/><Sticker e="💖" c="#ffd9b0" cls="s3"/>
    </div>
  </section>
  <div className="marquee"><div>{[...CATS,...CATS].map((c,i)=><span key={i}>{c.e} {c.t}</span>)}</div></div>
  <section className="strip"><div><b>14</b><span>vibes to choose</span></div><div><b>0</b><span>uploads to servers</span></div><div><b>10</b><span>best pics</span></div></section>
  <section className="block"><p className="kicker">HOW IT WORKS</p><h2>Three taps to a pretty post</h2>
    <div className="steps">{STEPS.map(([e,t,d],i)=><div key={t} className={'step s'+i}><div className="stop"><b>0{i+1}</b><Sticker e={e}/></div><h3>{t}</h3><p>{d}</p></div>)}</div></section>
  <RulesPanel/>
</>)}
