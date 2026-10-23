import {useRef,useState} from 'react';
export default function Dropzone({onFiles,busy,progress,photos}){
  const ref=useRef();const [over,setOver]=useState(false);
  const pick=fs=>onFiles([...fs].filter(f=>f.type.startsWith('image/')).slice(0,500));
  return(<section className="panel"><div className="ptitle"><i className="num">01</i><div><h2>Upload photos</h2><p>50–500 photos · JPG, PNG, WebP</p></div>{photos.length>0&&<span className="pill">{photos.length} added</span>}</div>
    <div className={'drop '+(over?'over':'')} onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();setOver(false);pick(e.dataTransfer.files)}}>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={e=>pick(e.target.files)}/>
      <div className="upicon">⬆️</div>
      {busy?<><h3>{progress.done===0&&progress.msg?progress.msg:`Looking at your pics… ${progress.done}/${progress.total}`}</h3><div className="bar"><i style={{width:progress.done/progress.total*100+'%'}}/></div></>
      :<><h3>Tap to choose photos</h3><p>or drag &amp; drop them here 🔒 stays on your device</p></>}
    </div>
    {photos.length>0&&!busy&&<div className="thumbs">{photos.slice(0,6).map(p=><img key={p.id} src={p.src}/>)}{photos.length>6&&<span>+{photos.length-6}</span>}</div>}</section>);
}
