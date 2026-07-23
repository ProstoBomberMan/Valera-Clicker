/* shop-ui.js */

const SLOT_LABELS = { head:'Голова', body:'Тіло', face:'Лице', trinket:'Трінкет' };

/* ════════════════════════════════════════
   ІНВЕНТАР-БАР (4 слоти знизу)
════════════════════════════════════════ */
window.renderInventoryBar = function() {
  ['head','body','face','trinket'].forEach(slot => {
    const el = document.getElementById('inv-'+slot);
    if (!el) return;
    const id = window.INVENTORY[slot];
    if (id) {
      const item = window.ALL_ITEMS.find(i=>i.id===id);
      el.innerHTML = `<span class="inv-icon">${item.emoji}</span><span class="inv-name">${item.name}</span>`;
      el.classList.add('filled');
    } else {
      el.innerHTML = `<span class="inv-empty">${SLOT_LABELS[slot]}</span>`;
      el.classList.remove('filled');
    }
  });
};

/* ════════════════════════════════════════
   РЕНДЕР МАГАЗИНУ — товари на поличках
   Скіни та предмети змішані в один потік,
   максимум 3 товари на одній поличці.
════════════════════════════════════════ */
window.renderShop = function(S) {
  updateShopBalance(S);
  renderShopShelves(S);
};

function updateShopBalance(S) {
  const el = document.getElementById('shop-bal');
  if (el) el.textContent = Math.floor(S.clicks).toLocaleString('uk');
}

function buildShopEntries() {
  const entries = [];
  window.SHOP_POOL.skins.forEach(skin => entries.push({ kind:'skin', data:skin }));
  window.SHOP_POOL.items.forEach(item => entries.push({ kind:'item', data:item }));
  return entries;
}

function chunk(arr, size) {
  const out = [];
  for (let i=0; i<arr.length; i+=size) out.push(arr.slice(i, i+size));
  return out;
}

function renderShopShelves(S) {
  const wrap = document.getElementById('shop-shelves');
  if (!wrap) return;
  wrap.innerHTML = '';

  const entries = buildShopEntries();
  const shelves = chunk(entries, 3);

  shelves.forEach(shelfEntries => {
    const shelf = document.createElement('div');
    shelf.className = 'shop-shelf';

    const plank = document.createElement('img');
    plank.className = 'shop-shelf-plank';
    plank.src = 'img/shop/shelf.png';
    plank.alt = '';
    shelf.appendChild(plank);

    const itemsRow = document.createElement('div');
    itemsRow.className = 'shop-shelf-items';

    shelfEntries.forEach(entry => {
      itemsRow.appendChild(entry.kind === 'skin' ? buildSkinEl(entry.data, S) : buildItemEl(entry.data, S));
    });

    shelf.appendChild(itemsRow);
    wrap.appendChild(shelf);
  });
}

function buildSkinEl(skin, S) {
  const owned = window.OWNED_SKINS.has(skin.id);
  const el = document.createElement('div');
  el.className = 'shelf-item' + (owned ? ' owned' : '');
  const canBuy = !owned && S.clicks >= skin.price;

  el.innerHTML = `
    <div class="shelf-item-icon-wrap"><span class="emoji">🐷</span></div>
    <div class="shelf-item-name">${skin.name}</div>
    ${owned
      ? `<div class="shelf-item-tag owned-tag">Одягти сет</div>`
      : `<div class="shelf-item-tag ${canBuy?'afford':'cant-afford'}">💰 ${skin.price.toLocaleString('uk')}</div>`}
  `;

  el.addEventListener('mouseenter', () => onItemHover(skin.desc));
  el.addEventListener('mouseleave', () => onItemLeave());

  el.addEventListener('click', () => {
    if (owned) {
      window.equipSkin(skin.id, S);
      window.renderShop(S);
      sellerSay(`Гарний вибір! Сет "${skin.name}" — на тобі!`);
      resetSellerTimer();
      return;
    }
    if (S.clicks < skin.price) {
      el.classList.add('shake');
      setTimeout(()=>el.classList.remove('shake'), 400);
      sellerSay('Не вистачає копійчини...');
      resetSellerTimer();
      return;
    }
    S.clicks -= skin.price;
    window.OWNED_SKINS.add(skin.id);
    Object.values(skin.items).forEach(itemId => { if (itemId) window.OWNED_ITEMS.add(itemId); });
    window.equipSkin(skin.id, S);
    window.renderShop(S);
    sellerSay(`Продано! Сет "${skin.name}" тепер твій.`);
    resetSellerTimer();
    if (window._updateHUD) window._updateHUD();
  });

  return el;
}

function buildItemEl(item, S) {
  const owned    = window.OWNED_ITEMS.has(item.id);
  const equipped = window.INVENTORY[item.slot] === item.id;
  const canBuy   = !owned && S.clicks >= item.price;

  const el = document.createElement('div');
  el.className = 'shelf-item' + (owned ? ' owned' : '') + (equipped ? ' equipped' : '');

  let tagHtml;
  if (!owned) {
    tagHtml = `<div class="shelf-item-tag ${canBuy?'afford':'cant-afford'}">💰 ${item.price.toLocaleString('uk')}</div>`;
  } else if (equipped) {
    tagHtml = `<div class="shelf-item-tag equipped-tag">Одягнено</div>`;
  } else {
    tagHtml = `<div class="shelf-item-tag owned-tag">Одягти</div>`;
  }

  el.innerHTML = `
    <div class="shelf-item-icon-wrap"><span class="emoji">${item.emoji}</span></div>
    <div class="shelf-item-name">${item.name}</div>
    ${tagHtml}
  `;

  el.addEventListener('mouseenter', () => onItemHover(item.desc));
  el.addEventListener('mouseleave', () => onItemLeave());

  el.addEventListener('click', () => {
    if (!owned) {
      if (S.clicks < item.price) {
        el.classList.add('shake');
        setTimeout(()=>el.classList.remove('shake'), 400);
        sellerSay('Не вистачає копійчини...');
        resetSellerTimer();
        return;
      }
      S.clicks -= item.price;
      window.OWNED_ITEMS.add(item.id);
      window.equipItem(item.id, S);
      window.renderShop(S);
      sellerSay(`Забирай, "${item.name}" — якісна річ!`);
      resetSellerTimer();
      if (window._updateHUD) window._updateHUD();
    } else if (equipped) {
      window.unequipItem(item.slot, S);
      window.renderShop(S);
      sellerSay('Зняв. Як скажеш.');
      resetSellerTimer();
    } else {
      window.equipItem(item.id, S);
      window.renderShop(S);
      sellerSay(`Одягнув "${item.name}". Пасує!`);
      resetSellerTimer();
    }
  });

  return el;
}

/* ════════════════════════════════════════
   МІСТЕР СВИН — продавець, таймер бездії
════════════════════════════════════════ */
let _sellerTimer = null;

function sellerSay(txt) {
  const el = document.getElementById('seller-bubble-text');
  if (el) el.textContent = txt;
}

function resetSellerTimer() {
  clearSellerTimer();
  _sellerTimer = setTimeout(() => {
    sellerSay('Вибирай швидше! Не маю цілий день...');
  }, 15000);
}

function clearSellerTimer() {
  if (_sellerTimer) { clearTimeout(_sellerTimer); _sellerTimer = null; }
}

function onItemHover(desc) {
  sellerSay(desc);
  resetSellerTimer();
}
function onItemLeave() {
  sellerSay('Щось зацікавило? У нас найвища якість товарів.');
  resetSellerTimer();
}

/* ════════════════════════════════════════
   ПІКСЕЛЬНА ХМАРИНКА МОВЛЕННЯ (SVG)
   Генерується один раз, текст оновлюється
   окремим HTML-шаром поверх.
════════════════════════════════════════ */
function buildBubbleSVG() {
  return `
  <svg class="seller-bubble-svg" viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- контур (чорний) -->
    <polygon fill="#241008" points="
      16,8 168,8 168,16 176,16 176,24 184,24 184,64 176,64 176,72 168,72
      168,80 120,80 112,92 108,80 32,80 32,72 16,72 16,64 8,64 8,24 16,24
    "/>
    <!-- заливка (світла) -->
    <polygon fill="#f2e9da" points="
      20,12 164,12 164,20 172,20 172,28 180,28 180,60 172,60 172,68 164,68
      164,76 118,76 112,86 106,76 36,76 36,68 20,68 20,60 12,60 12,28 20,28
    "/>
    <!-- легка тінь всередині -->
    <polygon fill="#ddccae" opacity="0.55" points="20,60 172,60 172,68 164,68 164,76 118,76 112,86 106,76 36,76 36,68 20,68"/>
  </svg>`;
}

function ensureBubble() {
  const wrap = document.getElementById('seller-bubble-wrap');
  if (!wrap) return;
  if (!wrap.querySelector('.seller-bubble-svg')) {
    wrap.innerHTML = buildBubbleSVG() + '<div class="seller-bubble-text" id="seller-bubble-text"></div>';
  }
}

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
  window.generateShopPool();

  const ev = NIGHT_EVENTS[Math.floor(Math.random()*NIGHT_EVENTS.length)];
  let extraText = '';
  if (ev.effect) extraText = ev.effect(S) || '';

  const overlay = document.getElementById('night-overlay');
  document.getElementById('night-day').textContent  = `День ${window.GAME_DAY}`;
  document.getElementById('night-text').textContent = ev.text;
  document.getElementById('night-extra').textContent = extraText;
  overlay.className = 'night-' + ev.type;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('night-visible')));

  if (window._updateHUD) window._updateHUD();
};

window.closeNight = function() {
  const el = document.getElementById('night-overlay');
  el.classList.remove('night-visible');
  setTimeout(() => { el.style.display = 'none'; }, 420);
};

/* ════════════════════════════════════════
   ВІДКРИТИ / ЗАКРИТИ МАГАЗИН
════════════════════════════════════════ */
window.openShop = function(S) {
  ensureBubble();
  window.renderShop(S);

  playShopMusic(); // ← додай

  document.getElementById('shop-overlay').classList.add('open');
  sellerSay('Щось зацікавило? У нас найвища якість товарів.');
  resetSellerTimer();
};
window.closeShop = function() {
  playGameMusic(); // ← додай

  document.getElementById('shop-overlay').classList.remove('open');
  clearSellerTimer();
};
