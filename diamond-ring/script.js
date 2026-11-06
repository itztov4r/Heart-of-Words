/**
 * LOVE ME — Diamond Ring of Light
 * A dependency-free 3D particle scene. The included background sound is ORIGINAL
 * synthesized ambience, not an existing commercial song.
 *
 * If you have permission to use your own audio, change the path below to a
 * hosted audio file (e.g. './assets/love-me.mp3'). Browsers normally block
 * audible autoplay until the visitor interacts with the page.
 */
'use strict';
const TRACK_URL = ''; // A licensed user-supplied file; empty uses original ambient music.
const canvas = document.querySelector('#universe');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const stage = document.querySelector('#stage');
const musicButton = document.querySelector('#music-toggle');
const musicAction = document.querySelector('#music-action');
const musicState = document.querySelector('#music-state');
const toast = document.querySelector('#toast');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const pointer = {x:0, y:0, dx:0, dy:0};
const scene = {w:0, h:0, dpr:1, time:0, spin:0, pulse:0, last:0, frame:0};
const TAU = Math.PI * 2;
let seed = 1007;
function random(){seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296;}
function between(a,b){return a + (b-a)*random();}
const points=[], lines=[], dust=[];
function addPoint(x,y,z,a=1,sz=1,kind=0){points.push({x,y,z,a,sz,kind,phase:random()*TAU});}
function addLine(a,b,bright=1){lines.push({a,b,bright});}
function sprinkleLine(a,b,count,alpha=.95,size=1){addLine(a,b,alpha);for(let i=0;i<count;i++){const t=i/(count-1);addPoint(a[0]+(b[0]-a[0])*t+between(-.009,.009),a[1]+(b[1]-a[1])*t+between(-.009,.009),a[2]+(b[2]-a[2])*t,alpha*between(.48,1.1),size,2);}}
function makeRing(){
  // A multi-row torus gives the close-packed silver glitter of the reference.
  for(let i=0;i<3300;i++){
    const u=random()*TAU, v=random()*TAU;
    const R=1.04, r=.116;
    let x=(R+r*Math.cos(v))*Math.cos(u), y=(R+r*Math.cos(v))*Math.sin(u), z=.12*Math.sin(v);
    x+=between(-.009,.009);y+=between(-.009,.009);z+=between(-.01,.01);
    let shine=.28+.7*random();
    if(v > Math.PI*.15 && v < Math.PI*.8) shine*=.65;
    addPoint(x,y,z,shine,between(.56,1.65),1);
  }
  for(let stripe=0;stripe<3;stripe++){
    const radius=[.949,1.038,1.153][stripe];
    for(let i=0;i<600;i++){
      const u=TAU*i/600;
      addPoint(radius*Math.cos(u),radius*Math.sin(u),stripe===1?.11:0,between(.4,.9),between(.5,1.3),2);
    }
  }
  // Four tapered prongs connect the silver ring to the diamond.
  for(const x of [-.29,-.16,.16,.29])sprinkleLine([x*.55,.91,.02],[x,1.52,.03],45,.85,.7);
  // Faceted brilliant diamond, defined as distinct top, girdle and pavilion rims.
  const N=10;
  const girdle=[], table=[], lower=[];
  for(let k=0;k<N;k++){
    const a=TAU*k/N;
    girdle.push([.42*Math.cos(a),1.53,.34*Math.sin(a)]);
    table.push([.24*Math.cos(a),1.92,.195*Math.sin(a)]);
    lower.push([.29*Math.cos(a),1.37,.24*Math.sin(a)]);
  }
  for(let k=0;k<N;k++){
    const next=(k+1)%N;
    sprinkleLine(girdle[k],girdle[next],40,.8,.9);
    sprinkleLine(table[k],table[next],26,.92,.87);
    sprinkleLine(girdle[k],table[k],42,.98,.93);
    sprinkleLine(girdle[k],table[next],36,.47,.74);
    sprinkleLine(girdle[k],lower[k],17,.57,.72);
    sprinkleLine(lower[k],[0,1.15,0],24,.72,.8);
  }
  // Small facets: distributed sparkles on the crown and along the pavilion.
  for(let i=0;i<1150;i++){
    const a=random()*TAU, t=random();
    const x=(.42-.19*t)*Math.cos(a), y=1.53+.39*t, z=(.34-.145*t)*Math.sin(a);
    addPoint(x,y,z,between(.2,1),between(.5,1.8),3);
  }
  for(let i=0;i<250;i++){
    const a=random()*TAU,t=random();
    addPoint((.42-.42*t)*Math.cos(a),1.53-.38*t,(.34-.34*t)*Math.sin(a),between(.25,.7),between(.5,1.4),3);
  }
  // Off-axis elliptical orbits and sparse drifting dust beyond the ring.
  for(let i=0;i<1050;i++){
    const a=random()*TAU,rad=between(1.45,2.85);
    dust.push({x:Math.cos(a)*rad,y:Math.sin(a)*rad*.65,z:between(-1.5,1.5),p:random()*TAU,s:between(.3,1.25),alpha:between(.06,.4)});
  }
}
makeRing();
const stars=Array.from({length:190},()=>({x:random(),y:random(),r:between(.3,1.6),t:random()*TAU,a:between(.08,.57)}));
function resize(){
  scene.w=window.innerWidth;scene.h=window.innerHeight;
  scene.dpr=Math.min(window.devicePixelRatio||1,1.75);
  canvas.width=Math.round(scene.w*scene.dpr);canvas.height=Math.round(scene.h*scene.dpr);
  ctx.setTransform(scene.dpr,0,0,scene.dpr,0,0);
}
resize();
addEventListener('resize',resize,{passive:true});
function rotate(x,y,z,ay,ax){
  let cy=Math.cos(ay), sy=Math.sin(ay), cx=Math.cos(ax),sx=Math.sin(ax);
  let nx=x*cy+z*sy,nz=-x*sy+z*cy;
  return [nx,y*cx-nz*sx,y*sx+nz*cx];
}
function project(x,y,z,angle,tilt,cx,cy,s){
  const p=rotate(x,y,z,angle,tilt),perspective=4.7/(4.7-p[2]);
  return {x:cx+p[0]*s*perspective,y:cy-p[1]*s*perspective,z:p[2],k:perspective};
}
function render(now){
  const elapsed=Math.min((now-scene.last)/1000,.05)||0; scene.last=now;
  if(!reduceMotion.matches)scene.time+=elapsed;
  scene.spin+=elapsed*.31;
  scene.pulse=Math.max(0,scene.pulse-elapsed*.76);
  const w=scene.w,h=scene.h;
  ctx.globalCompositeOperation='source-over';ctx.fillStyle='#050608';ctx.fillRect(0,0,w,h);
  const grad=ctx.createRadialGradient(w*.5,h*.44,10,w*.5,h*.44,Math.max(w,h)*.65);
  grad.addColorStop(0,'#11151d');grad.addColorStop(.4,'#080b11');grad.addColorStop(1,'#030405');
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  // Small distant stars, shared between mobile and desktop.
  for(const star of stars){
    const shimmer=.65+.35*Math.sin(scene.time*.7+star.t);
    ctx.fillStyle=`rgba(197,213,240,${star.a*shimmer})`;
    ctx.fillRect(star.x*w,star.y*h,star.r,star.r);
  }
  const rect=stage.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height*.49;
  const scale=Math.min(rect.width*.245,rect.height*.31,124);
  pointer.dx+=(pointer.x-pointer.dx)*.035;pointer.dy+=(pointer.y-pointer.dy)*.035;
  const ang=scene.spin+pointer.dx*.25,tilt=.11+Math.sin(scene.time*.27)*.065+pointer.dy*.14;
  ctx.globalCompositeOperation='lighter';
  // Dust is deliberately dim so the ring remains the visual focal point.
  for(const dot of dust){
    const a=scene.time*.055+dot.p;
    const dx=dot.x*Math.cos(a)-dot.z*Math.sin(a), dz=dot.x*Math.sin(a)+dot.z*Math.cos(a);
    const p=project(dx,dot.y,dz,ang*.3,tilt,cx,cy,scale);
    if(p.x<0||p.x>w||p.y<0||p.y>h)continue;
    ctx.fillStyle=`rgba(162,177,209,${dot.alpha*(.65+.35*Math.sin(scene.time+dot.p))})`;
    ctx.fillRect(p.x,p.y,dot.s,dot.s);
  }
  // Draw projected facet outlines behind the particle cloud.
  ctx.lineWidth=.55;
  const projectedLinePoint = p => project(p[0],p[1],p[2],ang,tilt,cx,cy,scale);
  for(const line of lines){
    const a=projectedLinePoint(line.a),b=projectedLinePoint(line.b);
    ctx.strokeStyle=`rgba(197,217,247,${line.bright*.12})`;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  // Project once; order by depth for a subtle 3D appearance.
  const sample=scene.w<560?1.35:1;
  const projected=[];
  for(let i=0;i<points.length;i+=sample>1?2:1){
    const pt=points[i],p=project(pt.x,pt.y,pt.z,ang,tilt,cx,cy,scale);
    const shimmer=.65+.3*Math.sin(scene.time*(pt.kind===3?2.9:1.35)+pt.phase);
    const highlight=Math.max(.32,Math.min(1.3,1+p.z*.21));
    const alpha=pt.a*shimmer*highlight;
    projected.push({x:p.x,y:p.y,z:p.z,alpha,size:pt.sz*(.75+.25*p.k),kind:pt.kind});
  }
  projected.sort((a,b)=>a.z-b.z);
  for(const p of projected){
    if(p.x<0||p.x>w||p.y<0||p.y>h)continue;
    const tint=p.kind===3?'202,219,248':'211,221,239';
    ctx.fillStyle=`rgba(${tint},${Math.min(.98,p.alpha)})`;
    ctx.fillRect(p.x,p.y,p.size,p.size);
  }
  // Occasional high-intensity points with a small optical cross.
  const sparks=reduceMotion.matches?15:22;
  for(let i=0;i<sparks;i++){
    const idx=Math.floor((i*171+Math.floor(scene.time*5)*97)%points.length),pt=points[idx];
    if(pt.a<.5)continue;
    const p=project(pt.x,pt.y,pt.z,ang,tilt,cx,cy,scale);
    const phase=Math.sin(scene.time*3.8+pt.phase+i);
    if(phase<.83)continue;
    const radius=betweenSpark(i)*(.8+scene.pulse*2.2);
    ctx.fillStyle=`rgba(233,241,255,${(phase-.83)*4.5})`;
    ctx.fillRect(p.x-radius,p.y,2*radius,.45);ctx.fillRect(p.x,p.y-radius,.45,2*radius);
  }
  ctx.globalCompositeOperation='source-over';
  requestAnimationFrame(render);
}
function betweenSpark(i){return 2.2+(i%5)*.7;}
requestAnimationFrame(render);
addEventListener('pointermove',event=>{
  pointer.x=Math.max(-1,Math.min(1,(event.clientX/window.innerWidth-.5)*2));
  pointer.y=Math.max(-1,Math.min(1,(event.clientY/window.innerHeight-.5)*2));
},{passive:true});
stage.addEventListener('pointerdown',()=>{
  scene.pulse=1;announce('A little sparkle, just for you ✧');
},{passive:true});
let toastHandle;
function announce(message){
  clearTimeout(toastHandle);toast.textContent=message;toast.classList.add('show');
  toastHandle=setTimeout(()=>toast.classList.remove('show'),2200);
}

// Music: original ambient chords, with optional licensed audio file override.
let audioContext, master, ambientTimer, playing=false;
let fileAudio=null;
if(TRACK_URL){fileAudio=new Audio(TRACK_URL);fileAudio.loop=true;fileAudio.preload='none';fileAudio.volume=.33;}
const chords=[
  [220,261.63,329.63,440],
  [174.61,220,261.63,349.23],
  [196,246.94,293.66,392],
  [164.81,196,246.94,329.63]
];
let chordIndex=0;
function chord(){
  if(!audioContext||audioContext.state!=='running')return;
  const start=audioContext.currentTime;
  const freqs=chords[chordIndex++%chords.length];
  freqs.forEach((freq,i)=>{
    const osc=audioContext.createOscillator(),envelope=audioContext.createGain();
    osc.type=i===0?'sine':'triangle';osc.frequency.value=freq/2;
    envelope.gain.setValueAtTime(.00001,start);
    envelope.gain.exponentialRampToValueAtTime(i===0?.043:.022,start+1.2);
    envelope.gain.setTargetAtTime(.00001,start+2.2,1.2);
    osc.connect(envelope);envelope.connect(master);
    osc.start(start);osc.stop(start+6.4);
    osc.onended=()=>{osc.disconnect();envelope.disconnect();};
  });
}
async function startMusic(){
  try{
    if(fileAudio){await fileAudio.play();}
    else{
      if(!audioContext){
        const AudioContextCtor=window.AudioContext||window.webkitAudioContext;
        if(!AudioContextCtor)throw new Error('Web Audio not supported');
        audioContext=new AudioContextCtor();master=audioContext.createGain();master.gain.value=.32;
        const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;
        master.connect(filter);filter.connect(audioContext.destination);
        chord();ambientTimer=setInterval(chord,3750);
      }
      await audioContext.resume();
      // The first chord needs scheduling after resume on Safari.
      if(audioContext.state==='running' && chordIndex===0)chord();
    }
    playing=true;setMusicUI();return true;
  }catch(err){playing=false;setMusicUI();return false;}
}
async function stopMusic(){
  if(fileAudio)fileAudio.pause();
  else if(audioContext)await audioContext.suspend();
  playing=false;setMusicUI();
}
function setMusicUI(){
  musicButton.setAttribute('aria-pressed',String(playing));
  musicButton.setAttribute('aria-label',playing?'Pause background music':'Play background music');
  musicAction.textContent=playing?'PAUSE MUSIC':'PLAY MUSIC';
  musicState.textContent=playing?'SOUND ON':'SOUND OFF';
}
musicButton.addEventListener('click',async event=>{
  event.stopPropagation();
  if(playing)await stopMusic();
  else if(!(await startMusic()))announce('Tap to enable music in your browser');
});
// Try automatically first. Audio-blocking browsers start after the first real
// pointer/keyboard interaction, which is the closest standards-compliant option.
startMusic();
function firstInteraction(event){
  if(playing || (event.target && event.target.closest('#music-toggle')))return;
  startMusic();
}
document.addEventListener('pointerdown',firstInteraction,{passive:true});
document.addEventListener('keydown',firstInteraction);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden && playing && audioContext)audioContext.suspend();
  else if(!document.hidden && playing && audioContext)audioContext.resume().catch(()=>{});
});