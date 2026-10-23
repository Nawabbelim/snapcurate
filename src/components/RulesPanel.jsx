import {RULES,SOURCES} from '../lib/rules.js';
export default function RulesPanel(){
  return(<section className="block" id="rules"><p className="kicker">THE RULES WE FOLLOW</p><h2>What makes a post look good</h2>
    <div className="rules">{RULES.map(r=><div key={r.t} className="rule"><span>{r.i}</span><div><b>{r.t}</b><p>{r.d}</p><small>{r.k}</small></div></div>)}</div>
    <p className="src">Check latest rules: {SOURCES.map(([t,u])=><a key={u} href={u} target="_blank" rel="noreferrer">{t}</a>)}</p></section>);
}
