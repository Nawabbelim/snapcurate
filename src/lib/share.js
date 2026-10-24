const TAGS={color:'#colorstory #aesthetic #palette',portrait:'#portrait #portraitphotography #faces',animals:'#animals #petsofinstagram #wildlife',cars:'#cars #bikes #ride',garden:'#flowers #garden #plants',nature:'#nature #sky #landscape',food:'#coffee #foodie #cafevibes',home:'#homedecor #cozyhome #interior',pastel:'#pastelaesthetic #softvibes #dreamy',moody:'#moody #cinematic #darkaesthetic',golden:'#goldenhour #sunset #warmtones',bw:'#blackandwhite #monochrome #filmlook',perfect:'#photography #aesthetic #bestshots',dump:'#photodump #camerarolldump #carousel'};
export const cleanHandle=h=>(h||'').replace(/^@/,'').replace(/[^a-zA-Z0-9._]/g,'').slice(0,30);
export const makeCaption=(cat,handle)=>`✨ swipe for the vibes ➡️\n\n${handle?`📸 @${cleanHandle(handle)}\n`:''}${TAGS[cat]||TAGS.dump} #instagood`;
const ext=t=>({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[t]||'jpg');
// Turn picks into real image Files (done BEFORE the user taps, so the share sheet opens instantly inside the tap)
export async function toFiles(picks){
  return Promise.all(picks.map(async(p,i)=>{
    const n='slide-'+String(i+1).padStart(2,'0');
    if(!p.reserve){const b=await (await fetch(p.src)).blob();return new File([b],`${n}.${ext(b.type)}`,{type:b.type||'image/jpeg'})}
    const img=new Image();img.src=p.src;await img.decode();const c=document.createElement('canvas');c.width=1080;c.height=1350;c.getContext('2d').drawImage(img,0,0,1080,1350);
    const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));return new File([b],`${n}.jpg`,{type:'image/jpeg'});
  }));
}
// ---- tiny ZIP maker (no library): one file download works on phones & desktops
const T=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc=u=>{let c=-1;for(let i=0;i<u.length;i++)c=T[(c^u[i])&255]^(c>>>8);return (c^-1)>>>0};
export async function makeZip(files){
  const enc=new TextEncoder(),parts=[],cd=[];let off=0;
  for(const f of files){
    const d=new Uint8Array(await f.arrayBuffer()),nm=enc.encode(f.name),c=crc(d);
    const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,c,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);
    parts.push(h.buffer,nm,d);
    const e=new DataView(new ArrayBuffer(46));e.setUint32(0,0x02014b50,true);e.setUint16(4,20,true);e.setUint16(6,20,true);e.setUint16(8,0x0800,true);e.setUint16(14,0x21,true);e.setUint32(16,c,true);e.setUint32(20,d.length,true);e.setUint32(24,d.length,true);e.setUint16(28,nm.length,true);e.setUint32(42,off,true);
    cd.push(e.buffer,nm);off+=30+nm.length+d.length;
  }
  const size=cd.reduce((s,b)=>s+b.byteLength,0),end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,size,true);end.setUint32(16,off,true);
  return new Blob([...parts,...cd,end.buffer],{type:'application/zip'});
}
export function saveBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),8000)}
export async function saveEach(files){for(const f of files){saveBlob(f,f.name);await new Promise(r=>setTimeout(r,600))}}
