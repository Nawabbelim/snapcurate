export default function Switch({on,set,label,sub,emoji='✨'}){
  return(<button type="button" role="switch" aria-checked={on} className={'sw2 '+(on?'on':'')} onClick={()=>set(!on)}>
    <span className="track"><span className="knob">{on?emoji:'🌙'}</span><i/><i/><i/><i/></span>
    <span className="sl"><b>{label}</b>{sub&&<small>{sub}</small>}</span></button>);
}
