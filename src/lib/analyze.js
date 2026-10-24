const ld=s=>new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=s});
import {SUBJECT,JUNK,MOOD,BEAUTY,FACE} from './prompts.js';
import {GLOBAL_PIXEL as GP,RANKING} from '../rules.config.js';
import {faceInfo} from './face.js';
let clip,clipErr='',loading=null,skipFn=null;
const subs=new Set();
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export const getClipErr=()=>clipErr;
export function friendly(raw=''){
  const r=raw.toLowerCase();
  if(r.includes('skipped'))return 'You skipped the AI helper, so smart filtering is off.';
  if(/stalled|fetch|network|load failed|could not locate|unauthorized|404|timeout/.test(r))return "We couldn't download the AI helper. Your internet may be slow, or huggingface.co is blocked on your network.";
  return 'The AI helper had a small hiccup while starting. Tap Retry. If it keeps happening, use basic mode.';
}
export const onClipProgress=f=>{subs.add(f);return()=>subs.delete(f)};
export const resetClip=force=>{if(clip===null&&(force||!clipErr.startsWith('Skipped'))){clip=undefined;clipErr='';loading=null}};
export const skipClip=()=>{if(clip===undefined){clip=null;clipErr='Skipped - basic mode';skipFn&&skipFn(null)}};
// CLIP (zero-shot AI) is loaded at runtime from a CDN. Model files (~150MB, first time only) come from Hugging Face and are cached by the browser.
export function loadClip(){
  if(clip!==undefined)return Promise.resolve(clip);
  if(loading)return loading;
  loading=new Promise(res=>{
    let last=Date.now();skipFn=res;const files={};
    const cb=d=>{last=Date.now();if(d.file&&d.total)files[d.file]={l:d.loaded||0,t:d.total};
      const v=Object.values(files),L=v.reduce((s,x)=>s+x.l,0),T=v.reduce((s,x)=>s+x.t,0);
      subs.forEach(f=>f({pct:T?Math.min(99,Math.round(L/T*100)):0,mb:Math.round(L/1e6),tot:Math.round(T/1e6)}))};
    const iv=setInterval(()=>{if(Date.now()-last>75000){clipErr='Download stalled for 75s (huggingface.co may be blocked, or the internet is very slow)';if(clip===undefined)clip=null;res(null)}},4000);
    const tk=p=>p.then(x=>{last=Date.now();return x});
    (async()=>{try{
      const T=await tk(import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'));
      T.env.allowLocalModels=false;T.env.useBrowserCache=true;try{T.env.backends.onnx.wasm.numThreads=1}catch{}
      const id='Xenova/clip-vit-base-patch32',O=()=>({progress_callback:cb});
      const [tok,tm,proc,vm]=await Promise.all([tk(T.AutoTokenizer.from_pretrained(id,O())),tk(T.CLIPTextModelWithProjection.from_pretrained(id,O())),tk(T.AutoProcessor.from_pretrained(id,O())),tk(T.CLIPVisionModelWithProjection.from_pretrained(id,O()))]);
      const emb=async arr=>(await tm(await tok(arr,{padding:true,truncation:true}))).text_embeds.normalize().tolist();
      const mk=Object.entries({...SUBJECT,...JUNK}),mo=Object.entries(MOOD);
      const E={mk:mk.map(x=>x[0]),mkE:await emb(mk.map(x=>x[1])),mo:mo.map(x=>x[0]),moE:await emb(mo.map(x=>x[1])),beE:await emb(BEAUTY.flat()),faE:await emb(FACE.flat())};
      // feed the AI a 224x224 centre crop drawn from the already-decoded <img> (avoids the library's own image decoder)
      const ri=img=>{const c=document.createElement('canvas');c.width=c.height=224;const x=c.getContext('2d',{willReadFrequently:true}),w=img.naturalWidth,h=img.naturalHeight,s=Math.min(w,h);
        x.drawImage(img,(w-s)/2,(h-s)/2,s,s,0,0,224,224);return new T.RawImage(new Uint8ClampedArray(x.getImageData(0,0,224,224).data),224,224,4)};
      const obj={async run(img){
        const e=(await vm(await proc(ri(img)))).image_embeds.normalize().tolist()[0];
        const sm=M=>{const l=M.map(t=>100*dot(e,t)),m=Math.max(...l),x=l.map(v=>Math.exp(v-m)),s=x.reduce((a,b)=>a+b);return x.map(v=>v/s)};
        const main={},mood={};sm(E.mkE).forEach((v,i)=>main[E.mk[i]]=v);sm(E.moE).forEach((v,i)=>mood[E.mo[i]]=v);
        const b=E.beE,f=E.faE;return{main,mood,fq:(sm(f.slice(0,2))[0]+sm(f.slice(2,4))[0]+sm(f.slice(4,6))[0])/3,pb:(sm(b.slice(0,2))[0]+sm(b.slice(2,4))[0]+sm(b.slice(4,6))[0])/3};}};
      if(clip===undefined){clip=obj;clipErr=''}
    }catch(err){clipErr=String(err&&err.message||err);console.warn('CLIP failed',err);if(clip===undefined)clip=null}
    finally{clearInterval(iv);res(clip)}})();
  });
  return loading;
}
function hsl(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2,d=M-m;let h=0,s=0;
  if(d){s=d/(1-Math.abs(2*l-1));h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360}return[h,s,l]}
const JUNK_NAME=new RegExp(GP.badFileNames.join('|'),'i');
export async function analyze(file,id){
  const src=URL.createObjectURL(file),img=await ld(src);
  const W0=img.naturalWidth,H0=img.naturalHeight,k=160/Math.max(W0,H0);
  const w=Math.max(8,Math.round(W0*k)),h=Math.max(8,Math.round(H0*k));
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);
  const d=x.getImageData(0,0,w,h).data,n=w*h,g=new Float32Array(n),bins=new Float32Array(12),cols=new Set();
  let sL=0,sS=0,green=0,skin=0,dark=0,bright=0,mid=0,warm=0,mg=0,a1=0,a2=0,a3=0,a4=0,mono=0;
  for(let i=0;i<n;i++){
    const r=d[i*4],gg=d[i*4+1],b=d[i*4+2],[H,S,L]=hsl(r,gg,b);
    g[i]=.299*r+.587*gg+.114*b;mg+=g[i];sL+=L;sS+=S;{const rg=r-gg,yb=.5*(r+gg)-b;a1+=rg;a2+=rg*rg;a3+=yb;a4+=yb*yb}if(Math.max(r,gg,b)-Math.min(r,gg,b)<14)mono++;
    if(S>.15&&L>.1&&L<.95)bins[Math.floor(H/30)%12]+=S;
    if(H>70&&H<165&&S>.2&&L>.12)green++;
    if(H<50&&S>.2&&S<.7&&L>.25&&L<.85&&r>gg&&gg>b)skin++;
    if((H<55||H>340)&&S>.25)warm++;
    if(g[i]<40)dark++;else if(g[i]>215)bright++;else mid++;
    cols.add((r>>4)<<8|(gg>>4)<<4|(b>>4));
  }
  mg/=n;let v=0;for(let i=0;i<n;i++)v+=(g[i]-mg)**2;const std=Math.sqrt(v/n);
  let ls=0,l2=0,m=0,cE=0,cN=0;
  for(let y=1;y<h-1;y++)for(let xx=1;xx<w-1;xx++){const i=y*w+xx,l=4*g[i]-g[i-1]-g[i+1]-g[i-w]-g[i+w];ls+=l;l2+=l*l;m++;if(xx>w*.25&&xx<w*.75&&y>h*.25&&y<h*.75){cE+=l*l;cN++}}
  const sharpVar=l2/m-(ls/m)**2;const cf=Math.min(1,((cE/(cN||1))/((l2/m)+1e-6))/1.4);
  // 8x8 average hash to remove near-duplicates
  const hc=document.createElement('canvas');hc.width=hc.height=8;const hx=hc.getContext('2d',{willReadFrequently:true});hx.drawImage(img,0,0,8,8);
  const hd=hx.getImageData(0,0,8,8).data,gs=[];for(let i=0;i<64;i++)gs.push(hd[i*4]*.3+hd[i*4+1]*.59+hd[i*4+2]*.11);
  const av=gs.reduce((a,b)=>a+b)/64,hash=gs.map(t=>t>av?1:0).join('');
  const L=sL/n,S=sS/n,ar=W0/H0,minSide=Math.min(W0,H0);
  const neutral=S<.1||mono/n>.9,hue=bins.indexOf(Math.max(...bins));
  // ---- junk detection: screenshots, QR codes, flat graphics, posters, blurry/dark shots
  const junk=[];
  if(JUNK_NAME.test(file.name))junk.push('looks like a screenshot/poster by name');
  if(minSide<GP.tinySide)junk.push('image too tiny');
  if(cols.size<GP.flatColours)junk.push('flat graphic / game UI / poster');
  if((dark+bright)/n>.92&&mid/n<.08)junk.push('QR / text-only image');
  if(Math.min(ar,1/ar)<.52&&cols.size<600)junk.push('phone screenshot shape');
  if(sharpVar<GP.blurry)junk.push('too blurry');
  if(L<GP.tooDark)junk.push('too dark');if(L>GP.tooBright)junk.push('overexposed');
  // ---- quality score 0..1
  const bs=[...bins].sort((x,y)=>y-x),harm=(bs[0]+bs[1])/(bs.reduce((x,y)=>x+y)||1);
  const colorful=Math.min(1,(Math.sqrt(a2/n-(a1/n)**2+a4/n-(a3/n)**2)+.3*Math.sqrt((a1/n)**2+(a3/n)**2))/85);
  const expo=Math.min(1,L/.12)*Math.min(1,(1-L)/.12)*(dark/n>.85?.4:1);
  // aesthetic score: detail, good exposure (dark dramatic shots allowed), contrast, vivid colour, subject separation, colour harmony
  const W=RANKING.pixelLook,q=W.sharpness*Math.min(1,Math.log1p(sharpVar)/Math.log1p(400))+W.exposure*expo+W.contrast*Math.min(1,std/60)+W.vividColour*colorful+W.subjectPop*cf+W.palette*harm;
  const cm=await loadClip();let cl=null;
  if(cm){try{cl=await cm.run(img)}catch(e){console.warn('AI skipped one photo:',file.name,e)}}
  let face=null;try{face=await faceInfo(img)}catch{}
  return{id,name:file.name,face,fq:cl?cl.fq:.5,src,w:W0,h:H0,q,L,sat:S,hue,neutral,mono:mono/n,green:green/n,skin:skin/n,warm:warm/n,std,hash,junk,hasModel:!!cl,main:cl?cl.main:{},mood:cl?cl.mood:{},pb:cl?cl.pb:.5};
}
