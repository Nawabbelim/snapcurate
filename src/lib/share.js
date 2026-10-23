const TAGS={color:'#colorstory #aesthetic #palette',portrait:'#portrait #portraitphotography #faces',mixed:'#lifestyle #candid #vibes',cars:'#cars #carsofinstagram #drive',garden:'#garden #nature #greenery',food:'#coffee #foodie #cafevibes',home:'#homedecor #cozyhome #interior',pastel:'#pastelaesthetic #softvibes #dreamy',moody:'#moody #cinematic #darkaesthetic',golden:'#goldenhour #sunsetvibes #warmtones',bw:'#blackandwhite #monochrome #filmlook',dump:'#photodump #camerarolldump #carousel'};
export const makeCaption=(cat,handle)=>`✨ swipe for the vibes ➡️\n\n${handle?`📸 @${handle.replace('@','')}\n`:''}${TAGS[cat]||TAGS.dump} #instagood`;
async function toFile(p,i){
  if(!p.reserve){const b=await (await fetch(p.src)).blob();return new File([b],`${i+1}.jpg`,{type:b.type||'image/jpeg'})}
  const img=new Image();img.src=p.src;await img.decode();const c=document.createElement('canvas');c.width=1080;c.height=1350;c.getContext('2d').drawImage(img,0,0,1080,1350);
  const b=await new Promise(r=>c.toBlob(r,'image/png'));return new File([b],`${i+1}.png`,{type:'image/png'});
}
export async function shareIG(picks,text){
  const files=await Promise.all(picks.map(toFile));
  if(navigator.canShare&&navigator.canShare({files})){await navigator.share({files,text});return true}
  return false;
}
export async function downloadAll(picks){
  const files=await Promise.all(picks.map(toFile));
  files.forEach(f=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;a.click()});
}
