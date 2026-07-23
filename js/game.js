/* game.js */

/* ════════════════════════════════
   СТАН
════════════════════════════════ */
const S = {
  clicks:0, statPower:1, statAuto:1, statLuck:1,
  clickPower:1, autoPerSec:1,
  critChance:0, critMulti:1,
  dvdActive:false,
  pigActive:false, pigSpeed:3.5, pigMulti:2,
  shopUnlocked:false, skipDayUnlocked:false,
  chainBonus:0, glassesBonus:0,
  maskActive:false, diceActive:false, tieBonus:false,
  _diceMulti:1,
  showingUpgrade:false, showingNight:false,
  acquiredIds:[],
  milestones:[], milestoneIdx:0,

  recalc() {
    this.clickPower  = this.statPower;
    this.autoPerSec  = this.statAuto;
    this.critChance  = Math.min(0.95, this.statLuck * 0.05);
    rebuildMilestones();
    updateStatUI();
    updateHUD();
  }
};

window._gameState = S;

const BASE_MS = [25,50,100,200,500,1000,2000,5000,10000,25000,50000,100000,200000,500000,1000000];
function rebuildMilestones() {
  S.milestones = BASE_MS.slice();
}
rebuildMilestones();

/* ════════════════════════════════
   АУДІО
════════════════════════════════ */
const sfxClick = document.getElementById('sfx-click');
const bgm = document.getElementById("bgm");
const shopBgm = document.getElementById("shop-bgm");
let musicStarted = false;

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  bgm.volume = 0.35;
  bgm.play().catch(()=>{});
}
function playClick() {
  sfxClick.currentTime = 0;
  sfxClick.volume = 0.7;
  sfxClick.play().catch(()=>{});
}

/* ════════════════════════════════
   DOM
════════════════════════════════ */
const scoreEl     = document.getElementById('hud-score');
const nextEl      = document.getElementById('hud-next');
const dayEl       = document.getElementById('hud-day');
const badgesEl    = document.getElementById('badges');
const dvdEl       = document.getElementById('dvd');
const btn         = document.getElementById('clicker-btn');
const overlayEl   = document.getElementById('overlay-wrap');
const cardsRowEl  = document.getElementById('upg-cards-row');
const upgSubEl    = document.getElementById('upg-sub');
const statPowerEl = document.getElementById('stat-power');
const statAutoEl  = document.getElementById('stat-auto');
const statLuckEl  = document.getElementById('stat-luck');
const shopBtnEl   = document.getElementById('shop-btn');
const skipDayBtn  = document.getElementById('skip-day-btn');

const dvdObj = {x:120,y:90,vx:1.4,vy:1.0,speed:1.0,bonus:1};
window.dvdObj = dvdObj;
const pig = {x:0,y:0,vx:0,vy:0,angle:0,turnTimer:0};

/* Desktop detection — slowdown тільки на ПК */
const IS_DESKTOP = !('ontouchstart' in window) && window.innerWidth > 768;
/* Стан уповільнення свина */
const pigSlow = { active:false, timer:0, cooldown:0 };

/* ════════════════════════════════
   HUD
════════════════════════════════ */
function updateHUD() {
  scoreEl.textContent = Math.floor(S.clicks).toLocaleString('uk') + ' кліків';
  const bal = document.getElementById('shop-bal');
  if (bal) bal.textContent = '💰 '+Math.floor(S.clicks).toLocaleString('uk');
  if (dayEl) dayEl.textContent = 'День ' + window.GAME_DAY;
  if (S.showingUpgrade || S.showingNight) { nextEl.textContent=''; return; }
  const nxt = S.milestones[S.milestoneIdx];
  if (!nxt) { nextEl.textContent='максимум!'; return; }
  const rem = Math.max(0, nxt - Math.floor(S.clicks));
  nextEl.textContent = `наступний апгрейд: ${nxt.toLocaleString('uk')} (ще ${rem.toLocaleString('uk')})`;
}
window._updateHUD = updateHUD;

function updateStatUI() {
  function bump(el,v){el.textContent=v;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');setTimeout(()=>el.classList.remove('bump'),380);}
  bump(statPowerEl, S.statPower);
  bump(statAutoEl,  S.statAuto);
  bump(statLuckEl,  S.statLuck);
}

/* ════════════════════════════════
   FLOAT TEXT
════════════════════════════════ */
function spawnFloat(txt, x, y, cls) {
  const el = document.createElement('div');
  el.className = 'float-txt'+(cls?' '+cls:'');
  el.textContent = txt;
  el.style.left = (x+Math.random()*20-10)+'px';
  el.style.top  = (y-20)+'px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 980);
}
window._spawnFloat = spawnFloat;

/* ════════════════════════════════
   КЛІК
════════════════════════════════ */
function doClick(x, y, manual) {
  if (S.showingUpgrade || S.showingNight) return;
  let gain = S.clickPower;
  if (manual && S.pigActive) gain *= S.pigMulti;
  if (S._diceMulti > 1) gain *= S._diceMulti;
  const totalCrit = Math.min(0.95, S.critChance + S.chainBonus + S.glassesBonus);
  let cls = '';
  if (manual && totalCrit > 0 && Math.random() < totalCrit) {
    gain = Math.round(gain * (S.critMulti > 1 ? S.critMulti : 2));
    cls = 'crit';
  }
  gain = Math.round(gain);
  S.clicks += gain;
  spawnFloat((cls==='crit'?'⚡ ':'+')+gain, x, y, cls);
  updateHUD();
  checkMilestone();
}

document.addEventListener('click', e => {
  if (S.showingUpgrade || S.showingNight) return;
  if (!btn.contains(e.target) && e.target !== btn) return;
  startMusic(); playClick();
  const r = btn.getBoundingClientRect();
  doClick(r.left+r.width/2, r.top+r.height/2, true);
  btn.classList.add('flash');
  setTimeout(()=>btn.classList.remove('flash'), 130);
});

/* ════════════════════════════════
   МІЛСТОУНИ
════════════════════════════════ */
function checkMilestone() {
  const nxt = S.milestones[S.milestoneIdx];
  if (nxt != null && S.clicks >= nxt && !S.showingUpgrade && !S.showingNight) {
    S.milestoneIdx++;
    showUpgradeScreen();
  }
}

/* ════════════════════════════════
   АПГРЕЙДИ
════════════════════════════════ */
function shuffle(arr) {
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
  return arr;
}

function showUpgradeScreen() {
  S.showingUpgrade = true;
  btn.classList.add('locked');

  const pool    = window.getAvailableUpgrades(S.acquiredIds);
  const stats   = shuffle(pool.filter(u=>u.type==='stat'));
  const passive = shuffle(pool.filter(u=>u.type==='passive'));
  let picks     = shuffle([...stats.slice(0,2), ...passive.slice(0,2)]).slice(0,4);

  /* Шанс магазину/сну — базово 30%, але якщо досягнуто саме поріг 2000/5000 — 85% */
  const thisMilestone = S.milestones[S.milestoneIdx - 1] ?? 0;
  const shopChance = !S.shopUnlocked
    ? (thisMilestone >= 2000 ? 0.85 : 0.30)
    : 0;
  const skipChance = (S.shopUnlocked && !S.skipDayUnlocked)
    ? (thisMilestone >= 5000 ? 0.85 : 0.30)
    : 0;
  const offerShop = shopChance > 0 && Math.random() < shopChance;
  const offerSkip = !offerShop && skipChance > 0 && Math.random() < skipChance;

  if ((offerShop || offerSkip) && picks.length > 0) picks[picks.length-1] = offerShop ? '__shop__' : '__skip__';

  const ms = S.milestones[S.milestoneIdx-1] ?? '?';
  upgSubEl.textContent = `${Number(ms).toLocaleString('uk')} кліків — обери одну здібність`;
  cardsRowEl.innerHTML = '';

  overlayEl.classList.add('show');
  updateHUD();

  /* Затримка 350мс щоб не натиснути випадково */
  setTimeout(() => {
    picks.forEach(u => {
      if (u==='__shop__') cardsRowEl.appendChild(makeSpecialCard('shop'));
      else if (u==='__skip__') cardsRowEl.appendChild(makeSpecialCard('skip'));
      else cardsRowEl.appendChild(makeCard(u));
    });
  }, 350);
}

function makeCard(u) {
  const c = document.createElement('div');
  const isPassive = u.type==='passive';
  c.className = 'ucard'+(isPassive?' is-passive':'');
  const tierCls = u.tier===2?'tier2':u.tier===1?'tier1':'';
  const typeBadge = isPassive
    ? `<div class="ucard-type-badge passive">Пасивка</div>`
    : `<div class="ucard-type-badge stat">Стат</div>`;
  const media = u.img
    ? `<img src="${u.img}" alt="${u.name}">`
    : `<div class="ucard-emoji">${u.icon}</div>`;

  c.innerHTML = `
    <div class="ucard-inner">
      <div class="ucard-scroll"><div class="ucard-scroll-title ${tierCls}">${u.name}</div></div>
      <div class="ucard-frame"><div class="ucard-icon-wrap">${media}</div></div>
      <div class="ucard-paper">${typeBadge}<div class="ucard-desc-text">${u.desc}</div></div>
    </div>`;

  /* 3D tilt */
  const inner = c.querySelector('.ucard-inner');
  c.addEventListener('mousemove', e => {
    const r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
    inner.style.transform=`rotateY(${x*(isPassive?22:14)}deg) rotateX(${-y*(isPassive?10:6)}deg) scale(1.05)`;
    inner.style.filter=isPassive?'brightness(0.86)':'brightness(1.06)';
    inner.style.transition='transform 0.08s ease,filter 0.08s ease';
  });
  c.addEventListener('mouseleave',()=>{inner.style.transform='';inner.style.filter='';inner.style.transition='transform 0.4s cubic-bezier(0.23,1,0.32,1),filter 0.4s ease';});
  c.addEventListener('click', ()=>pickUpgrade(u));
  return c;
}

function makeSpecialCard(type) {
  const isShop = type==='shop';
  const c = document.createElement('div');
  c.className = 'ucard is-passive';
  const cfg = isShop
    ? { title:'Магазин',       icon:'🏪', price:2000, tier:'tier2', desc:'Відкриває крамницю Валери.' }
    : { title:'Пропустити день', icon:'🌙', price:5000, tier:'tier2', desc:'Валера спить, а вранці щось відбувається...' };

  c.innerHTML = `
    <div class="ucard-inner">
      <div class="ucard-scroll"><div class="ucard-scroll-title ${cfg.tier}">${cfg.title}</div></div>
      <div class="ucard-frame"><div class="ucard-icon-wrap"><div class="ucard-emoji">${cfg.icon}</div></div></div>
      <div class="ucard-paper">
        <div class="ucard-type-badge passive">Особливе</div>
        <div class="ucard-desc-text">${cfg.desc}</div>
        <div class="shop-price">💰 ${cfg.price.toLocaleString('uk')}</div>
      </div>
    </div>`;

  const inner = c.querySelector('.ucard-inner');
  c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5;inner.style.transform=`rotateY(${x*22}deg) rotateX(${-y*10}deg) scale(1.05)`;inner.style.filter='brightness(0.86)';inner.style.transition='transform 0.08s ease,filter 0.08s ease';});
  c.addEventListener('mouseleave',()=>{inner.style.transform='';inner.style.filter='';inner.style.transition='transform 0.4s cubic-bezier(0.23,1,0.32,1),filter 0.4s ease';});
  c.addEventListener('click',()=>{
    if (S.clicks < cfg.price) {
      spawnFloat('Не вистачає кліків!', window.innerWidth/2, window.innerHeight/2, 'crit');
      c.style.animation='shake 0.3s ease'; setTimeout(()=>c.style.animation='',300);
      return;
    }
    S.clicks -= cfg.price;
    if (isShop) {
      S.shopUnlocked = true;
      shopBtnEl.classList.add('visible');
      document.getElementById('inventory-bar').classList.add('visible');
      window.generateShopPool();
      window.renderInventoryBar();
      addBadge('🏪 Магазин відкрито');
    } else {
      S.skipDayUnlocked = true;
      skipDayBtn.classList.add('visible');
      addBadge('🌙 Пропустити день');
    }
    closeUpgrade();
    updateHUD();
  });
  return c;
}

function pickUpgrade(u) {
  u.apply(S);
  S.acquiredIds.push(u.id);
  if (u.id==='dvd0') startDVD();
  if (u.id==='pig0') startPig();
  if (u.type==='passive') addBadge(u.icon+' '+u.name);
  closeUpgrade();
}

function closeUpgrade() {
  overlayEl.classList.remove('show');
  S.showingUpgrade = false;
  btn.classList.remove('locked');
  updateHUD();
}

function addBadge(txt) {
  const b=document.createElement('div');
  b.className='badge passive';
  b.textContent=txt;
  badgesEl.appendChild(b);
}

/* ════════════════════════════════
   МАГАЗИН
════════════════════════════════ */
shopBtnEl.addEventListener('click', () => { startMusic(); window.openShop(S); });
document.getElementById('shop-close-btn').addEventListener('click', ()=>window.closeShop());

/* ════════════════════════════════
   ПРОПУСТИТИ ДЕНЬ
════════════════════════════════ */
skipDayBtn.addEventListener('click', () => {
  S.showingNight = true;
  btn.classList.add('locked');
  window.triggerNight(S);
  updateHUD();
});
document.getElementById('night-next-btn').addEventListener('click', () => {
  window.closeNight();
  S.showingNight = false;
  btn.classList.remove('locked');
  updateHUD();
});

/* ════════════════════════════════
   DVD
════════════════════════════════ */
const DVD_COLORS=['#fff','#ffe066','#66ffd8','#ff99cc','#99ccff','#ffbb66'];
function startDVD(){dvdEl.style.display='flex';dvdObj.x=120;dvdObj.y=90;dvdObj.vx=1.4;dvdObj.vy=1.0;}
function dvdTick(){
  if(!S.dvdActive)return;
  dvdObj.x+=dvdObj.vx*dvdObj.speed; dvdObj.y+=dvdObj.vy*dvdObj.speed;
  const W=window.innerWidth,H=window.innerHeight,dW=66,dH=36;
  let hit=false;
  if(dvdObj.x<=0){dvdObj.vx=Math.abs(dvdObj.vx);dvdObj.x=0;hit=true;}
  if(dvdObj.x+dW>=W){dvdObj.vx=-Math.abs(dvdObj.vx);dvdObj.x=W-dW;hit=true;}
  if(dvdObj.y<=0){dvdObj.vy=Math.abs(dvdObj.vy);dvdObj.y=0;hit=true;}
  if(dvdObj.y+dH>=H){dvdObj.vy=-Math.abs(dvdObj.vy);dvdObj.y=H-dH;hit=true;}
  dvdEl.style.left=dvdObj.x+'px'; dvdEl.style.top=dvdObj.y+'px';
  if(hit&&!S.showingUpgrade&&!S.showingNight){
    S.clicks+=dvdObj.bonus;
    dvdEl.children[0].style.color=DVD_COLORS[Math.floor(Math.random()*DVD_COLORS.length)];
    spawnFloat('+'+dvdObj.bonus,dvdObj.x+dW/2,dvdObj.y+dH/2,'');
    updateHUD();checkMilestone();
  }
}

/* ════════════════════════════════
   СВИН (pig-mode)
════════════════════════════════ */
function startPig(){
  pig.x=window.innerWidth/2-100; pig.y=window.innerHeight/2-100;
  pig.angle=Math.random()*Math.PI*2;
  pig.vx=Math.cos(pig.angle)*S.pigSpeed; pig.vy=Math.sin(pig.angle)*S.pigSpeed;
  pig.turnTimer=120+Math.random()*180;
  btn.classList.add('pig-mode');
  btn.style.cssText=`position:fixed!important;bottom:auto!important;left:${pig.x}px!important;top:${pig.y}px!important;transform:none!important;opacity:1!important;`;
}
function pigTick(){
  if(!S.pigActive)return;

  /* Уповільнення тільки на десктопі */
  if (IS_DESKTOP) {
    if (pigSlow.active) {
      pigSlow.timer--;
      if (pigSlow.timer <= 0) {
        pigSlow.active = false;
        /* Cooldown 8-16 секунд (при 60fps) перед наступним уповільненням */
        pigSlow.cooldown = (8 + Math.random() * 8) * 60;
      }
    } else if (pigSlow.cooldown > 0) {
      pigSlow.cooldown--;
    } else {
      /* 0.4% шанс кожен кадр уповільнитись (≈кожні 4-10 секунд) */
      if (Math.random() < 0.004) {
        pigSlow.active = true;
        pigSlow.timer = (2 + Math.random() * 3) * 60; /* 2-5 секунд */
      }
    }
  }

  const currentSpeed = (IS_DESKTOP && pigSlow.active) ? S.pigSpeed * 0.18 : S.pigSpeed;

  pig.turnTimer--;
  if(pig.turnTimer<=0){
    pig.angle+=(Math.random()*1.4+0.7)*(Math.random()<0.5?1:-1);
    pig.turnTimer=80+Math.random()*160;
  }
  pig.vx=Math.cos(pig.angle)*currentSpeed; pig.vy=Math.sin(pig.angle)*currentSpeed;
  pig.x+=pig.vx; pig.y+=pig.vy;
  const W=window.innerWidth,H=window.innerHeight,bS=200;
  let hit=false;
  if(pig.x<=0){pig.vx=Math.abs(pig.vx);pig.x=0;pig.angle=Math.atan2(pig.vy,pig.vx);hit=true;}
  if(pig.x+bS>=W){pig.vx=-Math.abs(pig.vx);pig.x=W-bS;pig.angle=Math.atan2(pig.vy,pig.vx);hit=true;}
  if(pig.y<=0){pig.vy=Math.abs(pig.vy);pig.y=0;pig.angle=Math.atan2(pig.vy,pig.vx);hit=true;}
  if(pig.y+bS>=H){pig.vy=-Math.abs(pig.vy);pig.y=H-bS;pig.angle=Math.atan2(pig.vy,pig.vx);hit=true;}
  btn.style.setProperty('left',pig.x+'px','important');
  btn.style.setProperty('top',pig.y+'px','important');
  if(hit&&!S.showingUpgrade&&!S.showingNight){
    S.clicks+=S.clickPower; spawnFloat('+'+S.clickPower,pig.x+bS/2,pig.y+bS/2,'');
    updateHUD();checkMilestone();
  }
}

/* ════════════════════════════════
   LOOP
════════════════════════════════ */
let lastTs=null, autoAcc=0;
function loop(ts){
  const dt=lastTs?Math.min((ts-lastTs)/1000,0.1):0;
  lastTs=ts;
  dvdTick(); pigTick();
  if(S.autoPerSec>0&&!S.showingUpgrade&&!S.showingNight){
    autoAcc+=S.autoPerSec*dt;
    if(autoAcc>=1){
      const g=Math.floor(autoAcc); autoAcc-=g;
      const bonus=S.tieBonus?Math.round(g*1.2):g;
      S.clicks+=bonus; updateHUD(); checkMilestone();
    }
  }
  requestAnimationFrame(loop);
}

S.recalc();
window.generateShopPool();
requestAnimationFrame(loop);

function playGameMusic() {
    shopBgm.pause();
    shopBgm.currentTime = 0;

    bgm.loop = true;
    bgm.volume = 0.35;
    bgm.play().catch(() => {});
}

function playShopMusic() {
    bgm.pause();
    bgm.currentTime = 0;

    shopBgm.loop = true;
    shopBgm.volume = 0.35;
    shopBgm.play().catch(() => {});
}