'use strict';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menu = document.getElementById('menu');
const nav = document.getElementById('nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.textContent = open ? '×' : '☰'; });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = '☰'; }));
document.getElementById('year').textContent = new Date().getFullYear();
const progress = document.getElementById('progress');
function updateProgress(){ const max = document.documentElement.scrollHeight - innerHeight; progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`; }
addEventListener('scroll', updateProgress, {passive:true}); updateProgress();
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduced) { const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);} }), {threshold:.08}); revealItems.forEach(el => io.observe(el)); } else revealItems.forEach(el => el.classList.add('visible'));
const typeEl = document.getElementById('typewriter');
const phrases = ['Rust Programmer.', 'Full-Stack Developer.', 'DevOps Specialist.'];
if (reduced) { typeEl.textContent = phrases.join(' · '); }
else { let phrase=0,pos=0,del=false; function tick(){const full=phrases[phrase];typeEl.textContent=full.slice(0,pos);if(!del && pos<full.length)pos++;else if(!del){del=true;setTimeout(tick,1600);return;}else if(pos>0)pos--;else{del=false;phrase=(phrase+1)%phrases.length;}setTimeout(tick,del?42:85);}tick(); }
const canvas=document.getElementById('particles'),ctx=canvas.getContext('2d');
if(ctx&&!reduced){let dots=[],w=0,h=0,raf;function resize(){w=canvas.width=innerWidth;h=canvas.height=innerHeight;dots=Array.from({length:Math.min(75,Math.floor(w*h/17000))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+.3,s:Math.random()*.25+.08}));}function draw(){ctx.clearRect(0,0,w,h);ctx.fillStyle='#b4ff63';dots.forEach(d=>{d.y-=d.s;if(d.y<0)d.y=h;ctx.globalAlpha=.2+d.r*.22;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();});raf=requestAnimationFrame(draw);}resize();draw();addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else draw();});}

// Subtle ambient flashlight glow on fine-pointer devices only.
const glow=document.getElementById('flashlight');
if(glow && !reduced && matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';glow.classList.add('active');},{passive:true});
  document.addEventListener('pointerleave',()=>glow.classList.remove('active'));
}

// V14: portal transition, no zoom on the original landscape.
(() => {
  const gate = document.getElementById('intro-gate');
  const enter = document.getElementById('intro-enter');
  const streaks = document.getElementById('portal-streaks');
  if (!gate || !enter) return;
  // Stable seeded distribution: no distracting rearrangement when the intro is replayed.
  const sky = gate.querySelector('.intro-stars');
  if (sky) {
    let seed = 62443;
    const rand = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    const stars = document.createDocumentFragment();
    for (let i = 0; i < 105; i++) {
      const star = document.createElement('i');
      star.className = 'sky-star';
      const x = (2 + rand() * 96).toFixed(2) + '%';
      const y = (4 + rand() * 92).toFixed(2) + '%';
      star.style.setProperty('--x', x);
      star.style.setProperty('--y', y);
      star.style.setProperty('--size', (0.7 + rand() * 1.6).toFixed(2) + 'px');
      star.style.setProperty('--alpha', (0.25 + rand() * .52).toFixed(2));
      star.style.setProperty('--duration', (3 + rand() * 5).toFixed(2) + 's');
      star.style.setProperty('--delay', (-rand() * 12).toFixed(2) + 's');
      stars.appendChild(star);
    }
    for (let i = 0; i < 4; i++) {
      const meteor = document.createElement('i');
      meteor.className = 'sky-meteor';
      meteor.style.setProperty('--mx', (8 + rand() * 55).toFixed(2) + '%');
      meteor.style.setProperty('--my', (5 + rand() * 48).toFixed(2) + '%');
      meteor.style.setProperty('--trail', (65 + rand() * 95).toFixed(0) + 'px');
      meteor.style.setProperty('--period', (13 + rand() * 10).toFixed(1) + 's');
      meteor.style.setProperty('--offset', (-rand() * 23).toFixed(1) + 's');
      stars.appendChild(meteor);
    }
    sky.replaceChildren(stars);
  }
  const previousFocus = document.activeElement;
  enter.focus({preventScroll:true});
  let leaving = false;
  const replay = document.getElementById("return-intro");
  const close = () => {
    if (leaving) return;
    leaving = true;
    enter.disabled = true;
    if (!reduced && streaks) {
      const fragment = document.createDocumentFragment();
      for (let i=0;i<46;i++) {
        const star = document.createElement('i');
        star.className = 'portal-streak';
        star.style.setProperty('--angle', (i*137.508%360)+'deg');
        star.style.setProperty('--distance', (Math.max(innerWidth,innerHeight)*(.38+Math.random()*.38))+'px');
        star.style.setProperty('--length', (28+Math.random()*92)+'px');
        star.style.setProperty('--delay', (Math.random()*.35)+'s');
        fragment.appendChild(star);
      }
      streaks.appendChild(fragment);
    }
    gate.classList.add('portal-active');
    const finish = () => {
      document.body.classList.remove('intro-locked');
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
      const target = document.querySelector("main");
      if (target) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); }
    };
    if (reduced) finish(); else setTimeout(finish,1950);
  };
  if (replay) replay.addEventListener('click', () => {
    leaving = false;
    enter.disabled = false;
    gate.classList.remove('portal-active');
    gate.hidden = false;
    gate.removeAttribute('aria-hidden');
    if (streaks) streaks.replaceChildren();
    // Reset the portal animation before it can be replayed.
    gate.style.animation = 'none';
    void gate.offsetWidth;
    gate.style.animation = '';
    document.body.classList.add('intro-locked');
    window.scrollTo({top:0,behavior:'instant'});
    enter.focus({preventScroll:true});
  });
  enter.addEventListener('click',close);
  document.addEventListener('keydown',e=>{
    if(leaving || gate.hidden)return;
    if(e.key==='Enter' && !e.repeat){e.preventDefault();close();}
    if(e.key==='Tab'){e.preventDefault();enter.focus();}
  });
})();
