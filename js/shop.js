/* shop.js */

/* ════════════════════════════════════════
   ДЕНЬ / МІСЯЦЬ
════════════════════════════════════════ */
window.GAME_DAY = 1;

/* ════════════════════════════════════════
   ПРЕДМЕТИ
   slot: head | body | face | trinket
   Зображення НАЛІПЛЮЮТЬСЯ на свина через
   абсолютне позиціонування поверх .btn-char
════════════════════════════════════════ */
window.ALL_ITEMS = [
  /* ── Голова ── */
  { id:'crown',   slot:'head',    name:'Корона',       emoji:'👑', img:null, price:300,  desc:'Корона королів. +3 до Сили.', onEquip(S){S.statPower+=3;S.recalc();}, onUnequip(S){S.statPower-=3;S.recalc();} },
  { id:'cap',     slot:'head',    name:'Кепка ATG',    emoji:'🧢', img:null, price:150,  desc:'Фірмова кепка. +2 до Удачі.', onEquip(S){S.statLuck+=2;S.recalc();},  onUnequip(S){S.statLuck-=2;S.recalc();}  },
  { id:'helmet',  slot:'head',    name:'Каска',        emoji:'⛑',  img:null, price:600,  desc:'Залізна каска. +5 до Авто.',  onEquip(S){S.statAuto+=5;S.recalc();},  onUnequip(S){S.statAuto-=5;S.recalc();}  },
  { id:'tophat',  slot:'head',    name:'Циліндр',      emoji:'🎩', img:null, price:900,  desc:'Елегантний циліндр. +5 Сила +3 Удача.', onEquip(S){S.statPower+=5;S.statLuck+=3;S.recalc();}, onUnequip(S){S.statPower-=5;S.statLuck-=3;S.recalc();} },

  /* ── Тіло ── */
  { id:'tshirt',  slot:'body',    name:'Футболка ATG', emoji:'👕', img:null, price:200,  desc:'Брендова. +4 до Сили.',       onEquip(S){S.statPower+=4;S.recalc();}, onUnequip(S){S.statPower-=4;S.recalc();} },
  { id:'tie',     slot:'body',    name:'Краватка',     emoji:'👔', img:null, price:350,  desc:'Офісний вигляд. Авто дає +20% бонус.', onEquip(S){S.tieBonus=true;},  onUnequip(S){S.tieBonus=false;} },
  { id:'chain',   slot:'body',    name:'Золотий ланцюг',emoji:'⛓',img:null, price:800,  desc:'Блискучо. +10% шанс крита.',  onEquip(S){S.chainBonus=0.10;},         onUnequip(S){S.chainBonus=0;} },
  { id:'armor',   slot:'body',    name:'Броня',        emoji:'🛡', img:null, price:1200, desc:'Важка броня. +8 Авто +6 Сила.',onEquip(S){S.statAuto+=8;S.statPower+=6;S.recalc();}, onUnequip(S){S.statAuto-=8;S.statPower-=6;S.recalc();} },

  /* ── Лице ── */
  { id:'glasses', slot:'face',    name:'Окуляри',      emoji:'🕶', img:null, price:350,  desc:'Бачить крити здалеку. +15% крит.', onEquip(S){S.glassesBonus=0.15;}, onUnequip(S){S.glassesBonus=0;} },
  { id:'rednose', slot:'face',    name:'Червоний ніс', emoji:'🤡', img:null, price:100,  desc:'Таємнича річ. +1 до всього.',  onEquip(S){S.statPower+=1;S.statAuto+=1;S.statLuck+=1;S.recalc();}, onUnequip(S){S.statPower-=1;S.statAuto-=1;S.statLuck-=1;S.recalc();} },
  { id:'mask',    slot:'face',    name:'Маска',        emoji:'🎭', img:null, price:700,  desc:'Загадковий вигляд. Кожні 30с +10-50 бонус.', onEquip(S){S.maskActive=true;}, onUnequip(S){S.maskActive=false;} },
  { id:'monocle', slot:'face',    name:'Монокль',      emoji:'🧐', img:null, price:500,  desc:'Інтелігент. +4 Удача +3 Сила.', onEquip(S){S.statLuck+=4;S.statPower+=3;S.recalc();}, onUnequip(S){S.statLuck-=4;S.statPower-=3;S.recalc();} },

  /* ── Трінкет ── */
  { id:'coin',    slot:'trinket', name:'Монетка удачі',emoji:'🪙', img:null, price:250,  desc:'Стара монетка. +3 до Удачі.', onEquip(S){S.statLuck+=3;S.recalc();},  onUnequip(S){S.statLuck-=3;S.recalc();}  },
  { id:'dice',    slot:'trinket', name:'Кубик',        emoji:'🎲', img:null, price:500,  desc:'Кожні 30с — випадковий х1-5 на 5 секунд.', onEquip(S){S.diceActive=true;}, onUnequip(S){S.diceActive=false;} },
  { id:'star',    slot:'trinket', name:'Зірка',        emoji:'⭐', img:null, price:900,  desc:'Магічна зірка. +1 до множника критів.', onEquip(S){S.critMulti+=1;}, onUnequip(S){S.critMulti=Math.max(1,S.critMulti-1);} },
  { id:'rabbit',  slot:'trinket', name:'Лапка кролика',emoji:'🐇', img:null, price:1100, desc:'Дуже щаслива. +5 Удача.', onEquip(S){S.statLuck+=5;S.recalc();}, onUnequip(S){S.statLuck-=5;S.recalc();} },
];

/* ════════════════════════════════════════
   СКІНИ = сети предметів
════════════════════════════════════════ */
window.ALL_SKINS = [
  { id:'skin_atg',    name:'ATG Класик',   price:0,    desc:'Стандартний Валера в кепці ATG.', items:{ head:'cap', body:'tshirt', face:null, trinket:null } },
  { id:'skin_boss',   name:'Бос',          price:800,  desc:'Краватка, циліндр, монокль. +бонуси.', items:{ head:'tophat', body:'tie', face:'monocle', trinket:'coin' } },
  { id:'skin_warrior',name:'Воїн',         price:1500, desc:'Каска, броня, зірка. Максимальний бій.', items:{ head:'helmet', body:'armor', face:null, trinket:'star' } },
  { id:'skin_lucky',  name:'Щасливчик',    price:1200, desc:'Монокль, кролик, червоний ніс. Максимальна удача.', items:{ head:null, body:null, face:'monocle', trinket:'rabbit' } },
];

/* ════════════════════════════════════════
   СТАН ІНВЕНТАРЮ
════════════════════════════════════════ */
window.INVENTORY = { head:null, body:null, face:null, trinket:null };
window.OWNED_ITEMS = new Set();
window.OWNED_SKINS = new Set(['skin_atg']);
window.SHOP_UNLOCKED = false;

/* Поточний пул магазину (4 предмети + 2 скіни) */
window.SHOP_POOL = { items:[], skins:[] };

/* Генеруємо пул магазину */
window.generateShopPool = function() {
  const allItems = [...window.ALL_ITEMS];
  const allSkins = window.ALL_SKINS.filter(s => s.id !== 'skin_atg');
  shuffle(allItems); shuffle(allSkins);
  window.SHOP_POOL.items = allItems.slice(0, 4);
  window.SHOP_POOL.skins = allSkins.slice(0, 2);
};

function shuffle(arr) {
  for (let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
  return arr;
}

/* ════════════════════════════════════════
   ЕКІПІРУВАННЯ
════════════════════════════════════════ */
window.equipItem = function(itemId, S) {
  const item = window.ALL_ITEMS.find(i=>i.id===itemId);
  if (!item) return;
  /* Знімаємо поточний */
  const prev = window.INVENTORY[item.slot];
  if (prev) {
    const p = window.ALL_ITEMS.find(i=>i.id===prev);
    if (p?.onUnequip) p.onUnequip(S);
  }
  window.INVENTORY[item.slot] = itemId;
  if (item.onEquip) item.onEquip(S);
  window.renderInventoryBar();
  window.updateEquippedLayers();
};

window.unequipItem = function(slot, S) {
  const prev = window.INVENTORY[slot];
  if (!prev) return;
  const item = window.ALL_ITEMS.find(i=>i.id===prev);
  if (item?.onUnequip) item.onUnequip(S);
  window.INVENTORY[slot] = null;
  window.renderInventoryBar();
  window.updateEquippedLayers();
};

window.equipSkin = function(skinId, S) {
  /* Знімаємо всі поточні */
  ['head','body','face','trinket'].forEach(slot => {
    if (window.INVENTORY[slot]) window.unequipItem(slot, S);
  });
  const skin = window.ALL_SKINS.find(s=>s.id===skinId);
  if (!skin) return;
  /* Одягаємо предмети скіну */
  Object.entries(skin.items).forEach(([slot, itemId]) => {
    if (itemId) window.equipItem(itemId, S);
  });
};

/* ════════════════════════════════════════
   ШАРИ ПРЕДМЕТІВ НА СВИНІ
   Кожен предмет — це абсолютний елемент
   поверх .btn-char на кнопці
════════════════════════════════════════ */
window.updateEquippedLayers = function() {
  /* Очищаємо старі шари */
  document.querySelectorAll('.item-layer').forEach(el => el.remove());

  const btn = document.getElementById('clicker-btn');
  if (!btn) return;

  /* Позиції шарів відносно кнопки */
  const layerConfig = {
    head:    { bottom:'72%', left:'50%', width:'50%', transform:'translateX(-50%)' },
    body:    { bottom:'20%', left:'50%', width:'70%', transform:'translateX(-50%)' },
    face:    { bottom:'55%', left:'50%', width:'38%', transform:'translateX(-50%)' },
    trinket: { bottom:'5%',  left:'70%', width:'28%', transform:'none' },
  };

  Object.entries(window.INVENTORY).forEach(([slot, itemId]) => {
    if (!itemId) return;
    const item = window.ALL_ITEMS.find(i=>i.id===itemId);
    if (!item) return;
    const cfg = layerConfig[slot];

    const layer = document.createElement('div');
    layer.className = 'item-layer';
    layer.style.cssText = `
      position:absolute;
      bottom:${cfg.bottom};
      left:${cfg.left};
      width:${cfg.width};
      transform:${cfg.transform};
      pointer-events:none;
      z-index:3;
      font-size:clamp(18px, ${parseInt(cfg.width)}*0.4px, 36px);
      text-align:center;
      line-height:1;
      filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      transition:bottom 0.07s ease;
    `;

    if (item.img) {
      layer.innerHTML = `<img src="${item.img}" style="width:100%;object-fit:contain">`;
    } else {
      /* emoji — розмір залежить від слоту */
      const sizes = { head:'28px', body:'32px', face:'22px', trinket:'18px' };
      layer.style.fontSize = sizes[slot];
      layer.textContent = item.emoji;
    }

    btn.appendChild(layer);
  });
};

/* ════════════════════════════════════════
   МАСКА — бонус кожні 30с
════════════════════════════════════════ */
setInterval(() => {
  const S = window._gameState;
  if (!S || !S.maskActive) return;
  const b = 10 + Math.floor(Math.random()*41);
  S.clicks += b;
  if (window._spawnFloat) window._spawnFloat('🎭 +'+b, window.innerWidth/2, window.innerHeight/2, 'crit');
}, 30000);

/* КУБИК — кожні 30с */
setInterval(() => {
  const S = window._gameState;
  if (!S || !S.diceActive) return;
  const m = 1 + Math.floor(Math.random()*5);
  S._diceMulti = m;
  if (window._spawnFloat) window._spawnFloat('🎲 ×'+m+'!', window.innerWidth/2, window.innerHeight*0.35, 'crit');
  setTimeout(() => { if(S._diceMulti===m) S._diceMulti=1; }, 5000);
}, 30000);
