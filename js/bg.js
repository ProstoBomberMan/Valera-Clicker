/* bg.js */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  const COLORS = ['#6b0f0f','#8b1a1a','#a52020','#c0392b','#7d1515','#501010','#b03030','#3d0a0a','#d44040','#400c0c','#922525'];
  const TYPES  = ['circle','rect','triangle','diamond','ring'];
  function resize() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  function mkShape() {
    const size=20+Math.random()*100, spd=0.15+Math.random()*0.5, ang=Math.random()*Math.PI*2;
    return { type:TYPES[Math.floor(Math.random()*TYPES.length)], x:Math.random()*canvas.width, y:Math.random()*canvas.height, size, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, rot:Math.random()*Math.PI*2, rotSpd:(Math.random()-0.5)*0.014, color:COLORS[Math.floor(Math.random()*COLORS.length)], alpha:0.15+Math.random()*0.35, filled:Math.random()>0.38, lw:1.5+Math.random()*2.5 };
  }
  const shapes = Array.from({length:40}, mkShape);
  function draw(s) {
    ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.rot); ctx.globalAlpha=s.alpha;
    s.filled?(ctx.fillStyle=s.color):(ctx.strokeStyle=s.color,ctx.lineWidth=s.lw);
    const h=s.size; ctx.beginPath();
    switch(s.type){
      case 'circle':   ctx.arc(0,0,h/2,0,Math.PI*2); break;
      case 'rect':     ctx.rect(-h/2,-h*0.4,h,h*0.8); break;
      case 'triangle': ctx.moveTo(0,-h/2);ctx.lineTo(h/2,h/2);ctx.lineTo(-h/2,h/2);ctx.closePath(); break;
      case 'diamond':  ctx.moveTo(0,-h/2);ctx.lineTo(h/2.5,0);ctx.lineTo(0,h/2);ctx.lineTo(-h/2.5,0);ctx.closePath(); break;
      case 'ring':     ctx.arc(0,0,h/2,0,Math.PI*2);ctx.arc(0,0,h/2*0.6,0,Math.PI*2,true); break;
    }
    s.filled?ctx.fill():ctx.stroke(); ctx.restore();
  }
  function wrap(s){const p=s.size;if(s.x<-p)s.x=canvas.width+p;if(s.x>canvas.width+p)s.x=-p;if(s.y<-p)s.y=canvas.height+p;if(s.y>canvas.height+p)s.y=-p;}
  (function loop(){ctx.clearRect(0,0,canvas.width,canvas.height);for(const s of shapes){s.x+=s.vx;s.y+=s.vy;s.rot+=s.rotSpd;wrap(s);draw(s);}requestAnimationFrame(loop);})();
})();
