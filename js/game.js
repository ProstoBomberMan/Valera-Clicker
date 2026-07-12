/* game.js */
const S = {
  clicks:0,
  statPower:1, statAuto:1, statLuck:1,
  clickPower:1, autoPerSec:1,
  critChance:0, critMulti:1,
  dvdActive:false,
  pigActive:false, pigSpeed:3.5, pigMulti:2,
  shopUnlocked:false,
  showingUpgrade:false,
  acquiredIds:[],
  milestones:[], milestoneIdx:0,

  recalc() {
    this.clickPower = this.statPower;
    this.autoPerSec = this.statAuto;
    this.critChance = Math.min(0.95, this.statLuck * 0.05);
    rebuildMilestones();
    updateStatUI();
    updateHUD();
  }
};

const BASE_MS = [25,50,100,200,500,1000,2000,5000,10000,25000,50000,100000,200000,500000,1000000];
function rebuildMilestones() { S.milestones = BASE_MS.slice(); }
rebuildMilestones();

/* DOM */
const scoreEl    = document.getElementById('hud-score');
const nextEl     = document.getElementById('hud-next');
const badgesEl   = document.getElementById('badges');
const dvdEl      = document.getElementById('dvd');
const btn        = document.getElementById('clicker-btn');
const overlayEl  = document.getElementById('overlay-wrap');
const cardsRowEl = document.getElementById('upg-cards-row');
const upgSubEl   = document.getElementById('upg-sub');
const statPowerEl= document.getElementById('stat-power');
const statAutoEl = document.getElementById('stat-auto');
const statLuckEl = document.getElementById('stat-luck');
const shopBtn    = document.getElementById('shop-btn');

const dvdObj = { x:120, y:90, vx:1.4, vy:1.0, speed:1.0, bonus:1 };
window.dvdObj = dvdObj;

/* ════════════════════════════════
   СВИН — фіксований рух у всі боки
════════════════════════════════ */
const pig = {
  x:0, y:0,
  vx:0, vy:0,
  /* кут напрямку — змінюємо плавно */
  angle: 0,
  /* таймер до наступного повороту */
  turnTimer: 0,
};

function startPig() {
  pig.x = window.innerWidth  / 2 - 100;
  pig.y = window.innerHeight / 2 - 100;
  /* випадковий початковий кут, але НЕ вертикальний */
  pig.angle = Math.random() * Math.PI * 2;
  /* уникаємо кутів близьких до вертикалі (±80°–100° від горизонталі) */
  if (Math.abs(Math.sin(pig.angle)) > 0.9) pig.angle += Math.PI * 0.4;
  pig.vx = Math.cos(pig.angle) * S.pigSpeed;
  pig.vy = Math.sin(pig.angle) * S.pigSpeed;
  pig.turnTimer = 120 + Math.random() * 180;

  /* Спочатку знімаємо CSS-класи що можуть конфліктувати */
  btn.classList.add('pig-mode');
  /* Скидаємо CSS bottom/transform що тягнуть кнопку вниз */
  btn.style.cssText = `
    position: fixed !important;
    bottom: auto !important;
    left: ${pig.x}px !important;
    top: ${pig.y}px !important;
    transform: none !important;
    opacity: 1 !important;
  `;
}

function pigTick() {
  if (!S.pigActive) return;

  const sp = S.pigSpeed;

  /* Таймер повороту — щоб свин не летів прямо вічно */
  pig.turnTimer--;
  if (pig.turnTimer <= 0) {
    /* повертаємо на випадковий кут ±40–140° */
    const turn = (Math.random() * 1.4 + 0.7) * (Math.random() < 0.5 ? 1 : -1);
    pig.angle += turn;
    pig.turnTimer = 80 + Math.random() * 160;
  }

  pig.vx = Math.cos(pig.angle) * sp;
  pig.vy = Math.sin(pig.angle) * sp;

  pig.x += pig.vx;
  pig.y += pig.vy;

  const W = window.innerWidth, H = window.innerHeight, bS = 200;
  let hit = false;

  if (pig.x <= 0)    { pig.vx = Math.abs(pig.vx); pig.x = 0;    pig.angle = Math.atan2(pig.vy, pig.vx); hit = true; }
  if (pig.x+bS >= W) { pig.vx =-Math.abs(pig.vx); pig.x = W-bS; pig.angle = Math.atan2(pig.vy, pig.vx); hit = true; }
  if (pig.y <= 0)    { pig.vy = Math.abs(pig.vy); pig.y = 0;    pig.angle = Math.atan2(pig.vy, pig.vx); hit = true; }
  if (pig.y+bS >= H) { pig.vy =-Math.abs(pig.vy); pig.y = H-bS; pig.angle = Math.atan2(pig.vy, pig.vx); hit = true; }

  btn.style.setProperty('left', pig.x + 'px', 'important');
  btn.style.setProperty('top',  pig.y + 'px', 'important');

  if (hit && !S.showingUpgrade) {
    S.clicks += S.clickPower;
    spawnFloat('+'+S.clickPower, pig.x+bS/2, pig.y+bS/2, '');
    updateHUD(); checkMilestone();
  }
}

/* HUD */
function updateHUD() {
  scoreEl.textContent = Math.floor(S.clicks).toLocaleString('uk') + ' кліків';
  if (S.showingUpgrade) { nextEl.textContent = ''; return; }
  const nxt = S.milestones[S.milestoneIdx];
  if (nxt == null) { nextEl.textContent = 'максимум!'; return; }
  const rem = Math.max(0, nxt - Math.floor(S.clicks));
  nextEl.textContent = `наступний апгрейд: ${nxt.toLocaleString('uk')}  (ще ${rem.toLocaleString('uk')})`;
}

function updateStatUI() {
  function bump(el, val) {
    el.textContent = val;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 380);
  }
  bump(statPowerEl, S.statPower);
  bump(statAutoEl,  S.statAuto);
  bump(statLuckEl,  S.statLuck);
}

/* Плаваючий текст */
function spawnFloat(txt, x, y, cls) {
  const el = document.createElement('div');
  el.className = 'float-txt' + (cls ? ' '+cls : '');
  el.textContent = txt;
  el.style.left = (x + Math.random()*20 - 10) + 'px';
  el.style.top  = (y - 20) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 980);
}

/* Клік */
function doClick(x, y, manual) {
  if (S.showingUpgrade) return;
  let gain = S.clickPower;
  if (manual && S.pigActive) gain *= S.pigMulti;
  let cls = '';
  if (manual && S.critChance > 0 && Math.random() < S.critChance) {
    gain = Math.round(gain * (S.critMulti > 1 ? S.critMulti : 2));
    cls = 'crit';
  }
  gain = Math.round(gain);
  S.clicks += gain;
  spawnFloat((cls === 'crit' ? '⚡ ' : '+') + gain, x, y, cls);
  updateHUD();
  checkMilestone();
}

document.addEventListener('click', function(e) {
  if (S.showingUpgrade) return;
  if (!btn.contains(e.target) && e.target !== btn) return;
  const r = btn.getBoundingClientRect();
  doClick(r.left + r.width/2, r.top + r.height/2, true);
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 130);
});

/* Мілстоуни */
function checkMilestone() {
  const nxt = S.milestones[S.milestoneIdx];
  if (nxt != null && S.clicks >= nxt && !S.showingUpgrade) {
    S.milestoneIdx++;
    showUpgradeScreen();
  }
}

/* ════════════════════════════════
   МАГАЗИН
════════════════════════════════ */
const SHOP_CHANCE = 0.30; /* 30% що випаде магазин */
let pendingShopOffer = false;

function unlockShop() {
  S.shopUnlocked = true;
  shopBtn.classList.add('visible');
  addBadge('🏪 Магазин відкрито');
}

/* Обробник кнопки магазину */
shopBtn.addEventListener('click', function() {
  /* поки нічого не робить */
  shopBtn.classList.add('shake');
  setTimeout(() => shopBtn.classList.remove('shake'), 400);
});

/* ════════════════════════════════
   ВІКНО АПГРЕЙДІВ
════════════════════════════════ */
function shuffle(arr) {
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

function showUpgradeScreen() {
  S.showingUpgrade = true;
  btn.classList.add('locked');

  /* 30% шанс: замість одного апгрейду — пропозиція магазину */
  const offerShop = !S.shopUnlocked && Math.random() < SHOP_CHANCE;

  const pool = window.getAvailableUpgrades(S.acquiredIds);
  if (!pool.length && !offerShop) { closeUpgrade(); return; }

  const stats   = shuffle(pool.filter(u => u.type === 'stat'));
  const passive = shuffle(pool.filter(u => u.type === 'passive'));
  let picks = [...stats.slice(0,2), ...passive.slice(0,2)];
  if (picks.length < 4) {
    const have = new Set(picks.map(u => u.id));
    picks = [...picks, ...shuffle(pool.filter(u => !have.has(u.id)))].slice(0, 4);
  }

  /* Якщо випав магазин — замінюємо останній слот */
  if (offerShop && picks.length > 0) {
    picks[picks.length - 1] = '__shop__';
  }

  const ms = S.milestones[S.milestoneIdx-1] ?? '?';
  upgSubEl.textContent = `${Number(ms).toLocaleString('uk')} кліків — обери одну здібність`;

  cardsRowEl.innerHTML = '';

  overlayEl.classList.add('show');
  updateHUD();

  /* Картки з'являються через 350мс — щоб не натиснути випадково */
  setTimeout(() => {
    picks.forEach(u => {
      if (u === '__shop__') cardsRowEl.appendChild(makeShopCard());
      else cardsRowEl.appendChild(makeCard(u));
    });
  }, 350);
}

function makeCard(u) {
  const c = document.createElement('div');
  c.className = 'ucard';
  const tierCls = u.tier === 2 ? 'tier2' : u.tier === 1 ? 'tier1' : '';
  const typeTag = u.type === 'passive' ? `<span class="ucard-type passive">Пасивка</span>` : '';
  const media = u.img
    ? `<img class="ucard-img" src="${u.img}" alt="${u.name}">`
    : `<div class="ucard-icon">${u.icon}</div>`;
  c.innerHTML = `${typeTag}${media}<div class="ucard-name ${tierCls}">${u.name}</div><div class="ucard-desc">${u.desc}</div>`;
  c.addEventListener('click', () => pickUpgrade(u));
  return c;
}

function makeShopCard() {
  const c = document.createElement('div');
  c.className = 'ucard shop-card';
  c.innerHTML = `
    <span class="ucard-type passive">Особливе</span>
    <div class="ucard-icon">🏪</div>
    <div class="ucard-name tier2">Магазин</div>
    <div class="ucard-desc">Відкриває магазин у лівому нижньому куті.</div>
    <div class="shop-price">💰 1 000 очок</div>`;
  c.addEventListener('click', () => {
    if (S.clicks < 1000) {
      /* мигаємо червоним — не вистачає грошей */
      c.classList.add('cant-afford');
      setTimeout(() => c.classList.remove('cant-afford'), 500);
      spawnFloat('Не вистачає очок!', window.innerWidth/2, window.innerHeight/2, 'crit');
      return;
    }
    S.clicks -= 1000;
    updateHUD();
    unlockShop();
    closeUpgrade();
  });
  return c;
}

function pickUpgrade(u) {
  u.apply(S);
  S.acquiredIds.push(u.id);
  if (u.id === 'dvd0') startDVD();
  if (u.id === 'pig0') startPig();
  if (u.type === 'passive') addBadge(u.icon + ' ' + u.name);
  closeUpgrade();
}

function closeUpgrade() {
  overlayEl.classList.remove('show');
  S.showingUpgrade = false;
  btn.classList.remove('locked');
  updateHUD();
}

function addBadge(txt) {
  const b = document.createElement('div');
  b.className = 'badge passive';
  b.textContent = txt;
  badgesEl.appendChild(b);
}

/* DVD */
const DVD_COLORS = ['#fff','#ffe066','#66ffd8','#ff99cc','#99ccff','#ffbb66'];
function startDVD() {
  dvdEl.style.display = 'flex';
  dvdObj.x=120; dvdObj.y=90; dvdObj.vx=1.4; dvdObj.vy=1.0;
}
function dvdTick() {
  if (!S.dvdActive) return;
  dvdObj.x += dvdObj.vx * dvdObj.speed;
  dvdObj.y += dvdObj.vy * dvdObj.speed;
  const W=window.innerWidth,H=window.innerHeight,dW=66,dH=36;
  let hit=false;
  if(dvdObj.x<=0)    {dvdObj.vx= Math.abs(dvdObj.vx);dvdObj.x=0;   hit=true;}
  if(dvdObj.x+dW>=W) {dvdObj.vx=-Math.abs(dvdObj.vx);dvdObj.x=W-dW;hit=true;}
  if(dvdObj.y<=0)    {dvdObj.vy= Math.abs(dvdObj.vy);dvdObj.y=0;   hit=true;}
  if(dvdObj.y+dH>=H) {dvdObj.vy=-Math.abs(dvdObj.vy);dvdObj.y=H-dH;hit=true;}
  dvdEl.style.left=dvdObj.x+'px'; dvdEl.style.top=dvdObj.y+'px';
  if(hit&&!S.showingUpgrade){
    S.clicks+=dvdObj.bonus;
    dvdEl.children[0].style.color=DVD_COLORS[Math.floor(Math.random()*DVD_COLORS.length)];
    spawnFloat('+'+dvdObj.bonus,dvdObj.x+dW/2,dvdObj.y+dH/2,'');
    updateHUD();checkMilestone();
  }
}

/* Loop */
let lastTs=null, autoAcc=0;
function loop(ts) {
  const dt = lastTs ? Math.min((ts-lastTs)/1000, 0.1) : 0;
  lastTs = ts;
  dvdTick(); pigTick();
  if (S.autoPerSec > 0 && !S.showingUpgrade) {
    autoAcc += S.autoPerSec * dt;
    if (autoAcc >= 1) {
      const g = Math.floor(autoAcc); autoAcc -= g;
      S.clicks += g; updateHUD(); checkMilestone();
    }
  }
  requestAnimationFrame(loop);
}

S.recalc();
requestAnimationFrame(loop);
