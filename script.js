'use strict';
const canvas=document.getElementById('heart'),ctx=canvas.getContext('2d');
const initial=['I love you', 'Je t’aime', 'Kanbghik', 'Te amo', 'Ti amo', 'Ich liebe dich', 'أحبك', 'Seni seviyorum', 'Eu te amo', '사랑해', '大好き', 'Я тебя люблю', 'Te iubesc', 'Kocham cię', 'Σ’ αγαπώ', 'Mahal kita', 'Ik hou van jou', 'Jag älskar dig', 'Ninakupenda', 'Wo ai ni', 'Nakupenda', 'Mi amas vin'];
let words=initial.slice(),color='#f12b43',particles=[],width=0,height=0,start=performance.now(),scale=1;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=false,pausedAt=0,frameId=0;
function requestDraw(){if(!frameId&&!document.hidden)frameId=requestAnimationFrame(draw);}
function inside(x,y){return Math.pow(x*x+y*y-1,3)-x*x*y*y*y<=0;}
function random(n){const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);}
function layout(){
 width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 scale=Math.min(width*.345,height*.32,245);particles=[];let seed=0;
 for(let y=1.24;y> -1.02;y-=.083){
  const intervals=[];let left=null;
  for(let x=-1.2;x<=1.205;x+=.005){const hit=inside(x,y);if(hit&&left===null)left=x;if(!hit&&left!==null){intervals.push([left,x-.005]);left=null;}}
  for(const [a,b] of intervals){let x=a*scale;const end=b*scale;let col=0;
   while(x<end){
    const font=scale*(.045+random(seed+5)*.008);ctx.font=`600 ${font}px Arial, sans-serif`;
    let text=words[Math.floor(random(seed+3)*words.length)];let tw=ctx.measureText(text).width;
    if(x+tw>end){let candidate=words.filter(t=>ctx.measureText(t).width<=end-x);if(!candidate.length)break;text=candidate[Math.floor(random(seed+4)*candidate.length)];tw=ctx.measureText(text).width;}
    particles.push({text,x:x+tw/2,y:-y*scale,font,opacity:.7+random(seed+1)*.3,key:random(seed+6),row:y});
    x+=tw+scale*.024;seed++;col++;if(col>40)break;
   }
  }
 }
 particles.sort((a,b)=>(Math.atan2(a.y,a.x)+Math.PI*.7+Math.PI*2)%(Math.PI*2)-(Math.atan2(b.y,b.x)+Math.PI*.7+Math.PI*2)%(Math.PI*2));
 particles.forEach((p,i)=>{p.delay=i/Math.max(particles.length-1,1)*4200+p.key*450;const angle=random(i+39)*Math.PI*2;const distance=scale*(1.4+random(i+99)*1.8);p.fromX=Math.cos(angle)*distance;p.fromY=Math.sin(angle)*distance;p.turn=(random(i+75)-.5)*1.6;});
}
function draw(now){
 frameId=0;if(document.hidden)return;if(paused)now=pausedAt;
 ctx.clearRect(0,0,width,height);const elapsed=(now-start)%19000;
 const phase=now%1450/1450;
 const pulse=Math.exp(-Math.pow((phase-.12)/.065,2))+.55*Math.exp(-Math.pow((phase-.3)/.09,2));
 const beat=reduced.matches?1:1+.055*pulse;
 if(!reduced.matches){
  const glow=ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,scale*1.65);glow.addColorStop(0,color+'12');glow.addColorStop(1,color+'00');ctx.fillStyle=glow;ctx.globalAlpha=.5+pulse*.4;ctx.fillRect(0,0,width,height);ctx.globalAlpha=1;
  for(let i=0;i<35;i++){const x=random(i+81)*width,y=(random(i+198)*height-now*(.006+random(i+61)*.012)+height*100)%height;ctx.globalAlpha=(.12+.25*Math.sin(now*.001+i)**2)*Math.min(1,elapsed/2500);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,.6+random(i)*1.1,0,Math.PI*2);ctx.fill();}
 }
 ctx.save();ctx.translate(width/2,height/2+scale*.025);ctx.scale(beat,beat);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;
 for(const p of particles){const progress=reduced.matches?1:Math.max(0,Math.min(1,(elapsed-p.delay)/1900));if(!progress)continue;
  const ease=1-Math.pow(1-progress,3),exit=reduced.matches?1:1-Math.max(0,Math.min(1,(elapsed-16500)/2200));
  const shimmer=reduced.matches?0:Math.pow(Math.max(0,Math.sin(now*.0017-p.y/scale*2-p.x/scale)),16);
  const drift=reduced.matches?0:Math.sin(now*.0015+p.key*8)*scale*.004;
  ctx.save();ctx.translate(p.x+(p.fromX-p.x)*(1-ease)+(1-exit)*p.fromX*.35,p.y+(p.fromY-p.y)*(1-ease)+drift+(1-exit)*p.fromY*.35);ctx.rotate(p.turn*(1-ease));
  ctx.globalAlpha=progress*p.opacity*exit;ctx.font=`600 ${p.font}px Arial, sans-serif`;ctx.fillStyle=shimmer>.65?'#ffd0d8':color;ctx.shadowColor=color;ctx.shadowBlur=scale*(.014+shimmer*.045+pulse*.01);ctx.fillText(p.text,0,0);ctx.restore();
 }
 ctx.restore();if(!paused&&!reduced.matches)requestDraw();
}
function replay(){start=performance.now();pausedAt=start;requestDraw();}
const panel=document.getElementById('panel'),input=document.getElementById('words'),picker=document.getElementById('color');input.value=words.join('\n');
document.getElementById('settings').addEventListener('click',()=>{panel.hidden=!panel.hidden;if(!panel.hidden)input.focus();});
document.getElementById('close').addEventListener('click',()=>{panel.hidden=true;document.getElementById('settings').focus();});
document.getElementById('apply').addEventListener('click',()=>{const next=input.value.split('\n').map(s=>s.trim().slice(0,60)).filter(Boolean);words=next.length?next:initial.slice();color=picker.value;input.value=words.join('\n');layout();replay();panel.hidden=true;});
canvas.addEventListener('click',replay);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;document.getElementById('settings').focus();}if((e.code==='Space'||e.code==='Enter')&&panel.hidden&&(e.target===document.body||e.target===canvas)){e.preventDefault();replay();}});
const pauseButton=document.getElementById('pause');
pauseButton.onclick=()=>{paused=!paused;if(paused)pausedAt=performance.now();else start+=performance.now()-pausedAt;pauseButton.textContent=paused?'▶':'Ⅱ';pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.setAttribute('aria-label',paused?'Play animation':'Pause animation');requestDraw();};
reduced.addEventListener('change',requestDraw);
document.addEventListener('visibilitychange',requestDraw);
addEventListener('resize',()=>{layout();requestDraw();});layout();requestDraw();

