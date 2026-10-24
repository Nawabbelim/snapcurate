import {useState,useEffect,useRef} from 'react';
import {makeCaption,cleanHandle,toFiles,makeZip,saveBlob,saveEach} from '../lib/share.js';
export default function SharePanel({picks,cat,handle,setHandle}){
  const [cap,setCap]=useState('');const [msg,setMsg]=useState('');const [ready,setReady]=useState(false);const files=useRef([]);
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
  useEffect(()=>setCap(makeCaption(cat,handle)),[cat,handle]);
  // prepare the image files in advance: phones only allow the share sheet to open straight from a tap
  useEffect(()=>{let live=true;setReady(false);toFiles(picks).then(f=>{if(live){files.current=f;setReady(true)}}).catch(()=>live&&setMsg('Could not prepare the photos 😢'));return()=>{live=false}},[picks]);
  const copy=()=>{try{navigator.clipboard.writeText(cap).catch(()=>{})}catch{}};
  const share=()=>{
    copy();const data={files:files.current,text:cap};
    if(navigator.canShare&&navigator.canShare(data)){
      navigator.share(data).then(()=>setMsg(ios?'Tip: choose “Save Images”, then open Instagram → + → pick them in order. Caption is copied ✨':'Choose Instagram → Feed/Post. Your caption is copied — just paste it ✨')).catch(e=>{if(e.name!=='AbortError')setMsg('Share failed: '+e.message)});
    }else setMsg('This browser can’t share photos directly (common on desktop). Use “Download ZIP”, then add them in Instagram. Caption copied ✅');
  };
  const zip=async()=>{try{setMsg('Making your ZIP…');const cf=new File([cap],'caption.txt',{type:'text/plain'});saveBlob(await makeZip([...files.current,cf]),'snapcurate-carousel.zip');setMsg('ZIP saved to your Downloads ✅ (unzip, then pick the photos in Instagram)')}catch(e){setMsg('ZIP failed: '+e.message)}};
  return(<section className="panel"><div className="ptitle"><i className="num">📲</i><div><h2>Post to Instagram</h2><p>Share sheet, ZIP download, caption & hashtags</p></div></div>
    <label className="field">Your Instagram username<input value={handle} placeholder="@yourname" inputMode="text" autoCapitalize="none" onChange={e=>{const v=cleanHandle(e.target.value);setHandle(v);try{localStorage.setItem('sc_handle',v)}catch{}}}/></label>
    <label className="field">Caption<textarea rows={4} value={cap} onChange={e=>setCap(e.target.value)}/></label>
    <div className="actions">
      <button className="btn-dark shine" disabled={!ready||!picks.length} onClick={share}>{ready?'Share to Instagram 📲':'Preparing photos…'}</button>
      <button className="btn-light" disabled={!ready||!picks.length} onClick={zip}>⬇ Download ZIP</button>
      <button className="btn-light" disabled={!ready||!picks.length} onClick={()=>{setMsg('Saving photos one by one… allow multiple downloads if asked');saveEach(files.current)}}>⬇ One by one</button>
      <button className="btn-light" onClick={()=>{copy();setMsg('Caption copied ✨')}}>Copy caption</button>
      <a className="btn-light" href="instagram://camera">Open Instagram app</a>
      {handle&&<a className="btn-light" href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer">My profile ↗</a>}
    </div>
    {msg&&<p className="msg">{msg}</p>}
    <p className="fine">🔒 Websites can’t post for you or log in to Instagram (and we never ask for your password). The Share button hands your photos to your phone’s own share menu. Android: Instagram appears there. iPhone: choose “Save Images”, then add them inside Instagram.</p></section>);
}
