// Face quality check with MediaPipe FaceLandmarker (runs in the browser, loaded from CDN, ~15MB once).
// Measures: eyes open, smile, head angle (straight?), face size. If it can't load, the app falls back to AI text prompts.
import {RANKING} from '../rules.config.js';
let FP=null;
const V='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
export const loadFace=()=>FP||(FP=(async()=>{try{
  const M=await import(/* @vite-ignore */ V+'/vision_bundle.mjs');
  const fs=await M.FilesetResolver.forVisionTasks(V+'/wasm');
  return await M.FaceLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'},runningMode:'IMAGE',numFaces:4,outputFaceBlendshapes:true,outputFacialTransformationMatrixes:true});
}catch(e){console.warn('face model not loaded',e);return null}})());
export async function faceInfo(img){
  const lm=await loadFace();if(!lm)return null;
  try{
    const k=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');
    c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const r=lm.detect(c),n=r.faceLandmarks.length;if(!n)return{n:0};
    let bi=0,bw=0;r.faceLandmarks.forEach((l,i)=>{const xs=l.map(p=>p.x),w=Math.max(...xs)-Math.min(...xs);if(w>bw){bw=w;bi=i}});
    const bl=Object.fromEntries(r.faceBlendshapes[bi].categories.map(x=>[x.categoryName,x.score]));
    const eyes=1-((bl.eyeBlinkLeft||0)+(bl.eyeBlinkRight||0))/2,smile=((bl.mouthSmileLeft||0)+(bl.mouthSmileRight||0))/2;
    const m=r.facialTransformationMatrixes[bi].data,D=180/Math.PI;
    const yaw=Math.abs(Math.atan2(-m[2],Math.hypot(m[0],m[1]))*D);let pitch=Math.abs(Math.atan2(m[6],m[10])*D);if(pitch>90)pitch=180-pitch;
    const eyesS=Math.min(1,Math.max(0,(eyes-.3)/.5)),smileS=smile>=.12?(smile<=.85?1:.7):.5+smile*4,yawS=1-Math.min(1,yaw/40),pitchS=1-Math.min(1,pitch/35),sizeS=bw<.1?.3:bw>.7?.7:1;
    const Q=RANKING.faceQuality,L=r.faceLandmarks[bi],full=L.every(q=>q.x>.005&&q.x<.995&&q.y>.005&&q.y<.995),chinRoom=1-L[152].y;
    return{n,eyes,smile,yaw,pitch,w:bw,full,chinRoom,score:Q.eyesOpen*eyesS+Q.smile*smileS+Q.straight*yawS+Q.tilt*pitchS+Q.size*sizeS};
  }catch(e){return null}
}
