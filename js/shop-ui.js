/* shop-ui.js */

/* ════════════════════════════════════════
   ІНВЕНТАР-БАР (4 слоти знизу)
════════════════════════════════════════ */
window.renderInventoryBar = function() {
  const labels = { head:'Голова', body:'Тіло', face:'Лице', trinket:'Трінкет' };
  ['head','body','face','trinket'].forEach(slot => {
    const el = document.getElementById('inv-'+slot);
    if (!el) return;
    const id = window.INVENTORY[slot];
    if (id) {
      const item = window.ALL_ITEMS.find(i=>i.id===id);
      el.innerHTML = `<span class="inv-icon">${item.emoji}</span><span class="inv-name">${item.name}</span>`;
      el.classList.add('filled');
    } else {
      el.innerHTML = `<span class="inv-empty">${labels[slot]}</span>`;
      el.classList.remove('filled');
    }
  });
};

/* ════════════════════════════════════════
   РЕНДЕР МАГАЗИНУ
════════════════════════════════════════ */
window.renderShop = function(S) {
  updateShopBalance(S);
  renderShopSkins(S);
  renderShopItems(S);
};

function updateShopBalance(S) {
  const el = document.getElementById('shop-bal');
  if (el) el.textContent = '💰 '+Math.floor(S.clicks).toLocaleString('uk');
}

function renderShopSkins(S) {
  const grid = document.getElementById('shop-skins');
  if (!grid) return;
  grid.innerHTML = '';
  window.SHOP_POOL.skins.forEach(skin => {
    const owned = window.OWNED_SKINS.has(skin.id);
    const c = document.createElement('div');
    c.className = 'sh-skin' + (owned ? ' owned' : '');
    const canBuy = !owned && S.clicks >= skin.price;
    c.innerHTML = `
      <div class="sh-skin-emoji">🐷</div>
      <div class="sh-item-name">${skin.name}</div>
      <div class="sh-item-desc">${skin.desc}</div>
      ${owned
        ? `<button class="sh-btn-equip" data-id="${skin.id}">Одягти сет</button>`
        : `<button class="sh-btn-buy ${canBuy?'afford':''}" data-id="${skin.id}">💰 ${skin.price.toLocaleString('uk')}</button>`}`;
    c.addEventListener('mouseenter', () => onItemHover(skin.desc));
    c.addEventListener('mouseleave', () => onItemLeave());
    const btn = c.querySelector('button');
    btn.addEventListener('click', () => {
      if (owned) { window.equipSkin(skin.id, S); window.renderShop(S); return; }
      if (S.clicks < skin.price) { btn.classList.add('shake'); setTimeout(()=>btn.classList.remove('shake'),400); return; }
      S.clicks -= skin.price;
      window.OWNED_SKINS.add(skin.id);
      /* Одягаємо всі предмети скіна автоматично */
      Object.values(skin.items).forEach(itemId => { if(itemId) window.OWNED_ITEMS.add(itemId); });
      window.equipSkin(skin.id, S);
      window.renderShop(S);
      if (window._updateHUD) window._updateHUD();
    });
    grid.appendChild(c);
  });
}

function renderShopItems(S) {
  const grid = document.getElementById('shop-items');
  if (!grid) return;
  grid.innerHTML = '';
  window.SHOP_POOL.items.forEach(item => {
    const owned    = window.OWNED_ITEMS.has(item.id);
    const equipped = window.INVENTORY[item.slot] === item.id;
    const canBuy   = !owned && S.clicks >= item.price;
    const c = document.createElement('div');
    c.className = 'sh-item' + (equipped ? ' equipped' : '') + (owned ? ' owned' : '');
    c.innerHTML = `
      <div class="sh-item-icon">${item.emoji}</div>
      <div class="sh-item-name">${item.name}</div>
      <div class="sh-slot-tag">${{head:'Голова',body:'Тіло',face:'Лице',trinket:'Трінкет'}[item.slot]}</div>
      <div class="sh-item-desc">${item.desc}</div>
      ${!owned
        ? `<button class="sh-btn-buy ${canBuy?'afford':''}" data-id="${item.id}">💰 ${item.price.toLocaleString('uk')}</button>`
        : equipped
          ? `<button class="sh-btn-unequip" data-slot="${item.slot}">Зняти</button>`
          : `<button class="sh-btn-equip" data-id="${item.id}">Одягти</button>`}`;
    c.addEventListener('mouseenter', () => onItemHover(item.desc));
    c.addEventListener('mouseleave', () => onItemLeave());
    const btn = c.querySelector('button');
    btn.addEventListener('click', () => {
      if (btn.classList.contains('sh-btn-buy')) {
        if (S.clicks < item.price) { btn.classList.add('shake'); setTimeout(()=>btn.classList.remove('shake'),400); return; }
        S.clicks -= item.price; window.OWNED_ITEMS.add(item.id);
        window.equipItem(item.id, S); window.renderShop(S); if(window._updateHUD) window._updateHUD();
      } else if (btn.classList.contains('sh-btn-equip')) {
        window.equipItem(item.id, S); window.renderShop(S);
      } else if (btn.classList.contains('sh-btn-unequip')) {
        window.unequipItem(item.dataset.slot || item.slot, S); window.renderShop(S);
      }
    });
    grid.appendChild(c);
  });
}

/* Містер Свин — таймер бездії */
let _sellerTimer = null;
let _sellerIdle = false;

function sellerSay(txt) {
  const el = document.getElementById('seller-txt');
  if (el) el.textContent = txt;
}

function resetSellerTimer() {
  clearSellerTimer();
  _sellerIdle = false;
  _sellerTimer = setTimeout(() => {
    sellerSay('Вибирай швидше! Не маю цілий день...');
    _sellerIdle = true;
  }, 15000);
}

function clearSellerTimer() {
  if (_sellerTimer) { clearTimeout(_sellerTimer); _sellerTimer = null; }
}

/* При наведенні на предмет — скидаємо таймер */
function onItemHover(desc) {
  sellerSay(desc);
  resetSellerTimer();
}
function onItemLeave() {
  sellerSay('Щось зацікавило? У нас найвища якість товарів.');
  resetSellerTimer();
}

/* ════════════════════════════════════════
   ВІДКРИТИ / ЗАКРИТИ
════════════════════════════════════════ */
window.openShop = function(S) {
  window.renderShop(S);
  document.getElementById('shop-overlay').classList.add('open');
  sellerSay('Щось зацікавило? У нас найвища якість товарів.');
  resetSellerTimer();
};
window.closeShop = function() {
  document.getElementById('shop-overlay').classList.remove('open');
  clearSellerTimer();
};

/* ════════════════════════════════════════
   НІЧ / ПРОПУСТИТИ ДЕНЬ
════════════════════════════════════════ */
const NIGHT_EVENTS = [
  /* нейтральні */
  { type:'neutral', text:'Ніч була тихою. Валера мирно хропів до ранку.' },
  { type:'neutral', text:'Валера дивився у стелю і думав про кнопку. Нічого не сталось.' },
  { type:'neutral', text:'Сусіди галасували, але Валера спав як колода.' },
  /* позитивні */
  { type:'good', text:'Валера під ліжком знайшов заначку!', effect(S){ const b=200+Math.floor(Math.random()*300); S.clicks+=b; return '+'+b+' кліків 💰'; } },
  { type:'good', text:'Валера уві сні навчився нових трюків. Тимчасово +3 до Сили на 60 секунд!', effect(S){ S.statPower+=3; S.recalc(); setTimeout(()=>{S.statPower-=3;S.recalc();}, 60000); return '+3 Сила на 60с ⚔'; } },
  { type:'good', text:'Валера знайшов на підлозі рідкісний предмет!', effect(S){
    const unlocked = window.ALL_ITEMS.filter(i=>!window.OWNED_ITEMS.has(i.id));
    if (!unlocked.length) return null;
    const item = unlocked[Math.floor(Math.random()*unlocked.length)];
    window.OWNED_ITEMS.add(item.id); window.equipItem(item.id, S);
    return `Отримано: ${item.emoji} ${item.name}!`;
  }},
  { type:'good', text:'Валера прокинувся рано і потренувався. +2 до Авто назавжди!', effect(S){ S.statAuto+=2; S.recalc(); return '+2 Авто ⚙'; } },
  /* негативні */
  { type:'bad', text:'Валера вночі впав з ліжка. -2 до Сили на 30 секунд.', effect(S){ S.statPower=Math.max(1,S.statPower-2); S.recalc(); setTimeout(()=>{S.statPower+=2;S.recalc();}, 30000); return '-2 Сила на 30с 😵'; } },
  { type:'bad', text:'Валера з\'їв щось не те. -100 кліків.', effect(S){ S.clicks=Math.max(0,S.clicks-100); return '-100 кліків 🤢'; } },
  { type:'bad', text:'Хтось вкрав кепку Валери. -3 до Удачі на 45 секунд.', effect(S){ S.statLuck=Math.max(1,S.statLuck-3); S.recalc(); setTimeout(()=>{S.statLuck+=3;S.recalc();}, 45000); return '-3 Удача на 45с 😤'; } },
];

window.triggerNight = function(S) {
  window.GAME_DAY++;
  /* Оновлюємо пул магазину */
  window.generateShopPool();

  /* Вибираємо подію */
  const ev = NIGHT_EVENTS[Math.floor(Math.random()*NIGHT_EVENTS.length)];
  let extraText = '';
  if (ev.effect) extraText = ev.effect(S) || '';

  /* Показуємо екран ночі */
  const overlay = document.getElementById('night-overlay');
  document.getElementById('night-day').textContent  = `День ${window.GAME_DAY}`;
  document.getElementById('night-text').textContent = ev.text;
  document.getElementById('night-extra').textContent = extraText;
  overlay.className = 'night-' + ev.type;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('night-visible')));
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('night-visible')));

  if (window._updateHUD) window._updateHUD();
};

window.closeNight = function() {
  const el = document.getElementById('night-overlay');
  el.classList.remove('night-visible');
  setTimeout(() => { el.style.display = 'none'; }, 420);
};
