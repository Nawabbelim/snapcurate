import {useRef} from 'react';
import Switch from './Switch.jsx';
export default function MePanel({me,setMe,on,setOn,pos,setPos}){
  const ref=useRef();
  const add=fs=>setMe([...me,...[...fs].filter(f=>f.type.startsWith('image/')).map((f,i)=>({id:'me'+Date.now()+i,name:f.name,src:URL.createObjectURL(f),me:true}))].slice(0,3));
  return(<section className="panel"><div className="ptitle"><i className="num">03</i><div><h2>Add your portrait?</h2><p>Slip yourself into any vibe you pick</p></div>
    <Switch on={on} set={setOn} emoji="🧑‍🎤" label={on?'Yes!':'No'}/></div>
    {on&&<><input ref={ref} type="file" accept="image/*" multiple hidden onChange={e=>add(e.target.files)}/>
      <div className="mine">{me.map(m=><div key={m.id}><img src={m.src}/><button onClick={()=>setMe(me.filter(x=>x!==m))}>✕</button></div>)}
        {me.length<3&&<button className="addme" onClick={()=>ref.current.click()}>＋<small>your photo</small></button>}</div>
      <div className="sws"><small>Place it:</small>{[['first','Cover'],['second','Slide 2'],['last','Last']].map(([k,l])=><button key={k} className={'chip '+(pos===k?'on':'')} onClick={()=>setPos(k)}>{l}</button>)}</div></>}
  </section>);
}
