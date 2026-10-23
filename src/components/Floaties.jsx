const E=['🌸','✨','🦋','💖','☁️','🍓','⭐','🌿'];
export default function Floaties(){return <div className="floaties">{Array.from({length:14},(_,i)=><span key={i} style={{left:(i*29+7)%100+'%',animationDelay:-(i*1.7)+'s',animationDuration:14+i%5*3+'s',fontSize:14+i%4*6}}>{E[i%E.length]}</span>)}</div>}
