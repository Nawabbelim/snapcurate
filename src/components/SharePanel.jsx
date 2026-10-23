import {useState,useEffect} from 'react';
import {makeCaption,shareIG,downloadAll} from '../lib/share.js';
export default function SharePanel({picks,cat,handle,setHandle}){
  const [cap,setCap]=useState('');const [msg,setMsg]=useState('');
  useEffect(()=>setCap(makeCaption(cat,handle)),[cat,handle]);
  const share=async()=>{try{setMsg('Preparing…');const ok=await shareIG(picks,cap);setMsg(ok?'Pick Instagram in the share sheet 💌':'Sharing isn\'t supported here — use Download, then add them in Instagram.')}catch(e){setMsg(e.name==='AbortError'?'':'Could not open share sheet.')}};
  return(<section className="panel"><div className="ptitle"><i className="num">📲</i><div><h2>Post to Instagram</h2><p>Your Instagram name makes the caption</p></div></div>
    <label className="field">Instagram username<input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="@yourname"/></label>
    <label className="field">Caption<textarea rows={4} value={cap} onChange={e=>setCap(e.target.value)}/></label>
    <div className="actions"><button className="btn-dark" disabled={!picks.length} onClick={share}>Share to Instagram 📲</button>
      <button className="btn-light" onClick={()=>downloadAll(picks)}>⬇ Download</button>
      <button className="btn-light" onClick={()=>{navigator.clipboard?.writeText(cap);setMsg('Caption copied ✨')}}>Copy caption</button>
      <a className="btn-light" href={handle?`https://instagram.com/${handle.replace('@','')}`:'https://instagram.com'} target="_blank" rel="noreferrer">Open Instagram ↗</a></div>
    {msg&&<p className="msg">{msg}</p>}
    <p className="fine">🔒 We never ask for your password. Websites can't post for you directly; on your phone this opens the share sheet with your photos in order. True auto-posting needs the official Instagram API (Business/Creator account + a server).</p></section>);
}
