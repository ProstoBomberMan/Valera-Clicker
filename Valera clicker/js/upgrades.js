/* upgrades.js */
window.ALL_UPGRADES = [

  /* ══ СТАТИ (просто +2, без підписів tier) ══ */

  // Сила
  { id:'pow0', type:'stat', group:'pow', tier:0, icon:'⚔', img:null,
    name:'Сила +2', desc:'+2 до Сили.\nОчки за один клік.',
    req:[], apply(S){ S.statPower+=2; S.recalc(); } },
  { id:'pow1', type:'stat', group:'pow', tier:1, icon:'⚔', img:null,
    name:'Сила +2', desc:'+2 до Сили.',
    req:['pow0'], apply(S){ S.statPower+=2; S.recalc(); } },
  { id:'pow2', type:'stat', group:'pow', tier:2, icon:'⚔', img:null,
    name:'Сила +2', desc:'+2 до Сили.',
    req:['pow1'], apply(S){ S.statPower+=2; S.recalc(); } },

  // Авто
  { id:'aut0', type:'stat', group:'aut', tier:0, icon:'⚙', img:null,
    name:'Авто +2', desc:'+2 до Авто.\nАвтокліки в секунду.',
    req:[], apply(S){ S.statAuto+=2; S.recalc(); } },
  { id:'aut1', type:'stat', group:'aut', tier:1, icon:'⚙', img:null,
    name:'Авто +2', desc:'+2 до Авто.',
    req:['aut0'], apply(S){ S.statAuto+=2; S.recalc(); } },
  { id:'aut2', type:'stat', group:'aut', tier:2, icon:'⚙', img:null,
    name:'Авто +2', desc:'+2 до Авто.',
    req:['aut1'], apply(S){ S.statAuto+=2; S.recalc(); } },

  // Удача (замість Швидкості)
  { id:'lck0', type:'stat', group:'lck', tier:0, icon:'🎲', img:null,
    name:'Удача +2', desc:'+2 до Удачі.\nКожна одиниця = +5% шанс крита.',
    req:[], apply(S){ S.statLuck+=2; S.recalc(); } },
  { id:'lck1', type:'stat', group:'lck', tier:1, icon:'🎲', img:null,
    name:'Удача +2', desc:'+2 до Удачі.',
    req:['lck0'], apply(S){ S.statLuck+=2; S.recalc(); } },
  { id:'lck2', type:'stat', group:'lck', tier:2, icon:'🎲', img:null,
    name:'Удача +2', desc:'+2 до Удачі.',
    req:['lck1'], apply(S){ S.statLuck+=2; S.recalc(); } },

  /* ══ ПАСИВКИ ══ */

  // DVD
  { id:'dvd0', type:'passive', group:'dvd', tier:0, icon:'📀', img:null,
    name:'DVD логотип', desc:'DVD відскакує від країв.\nКожен удар +1.',
    req:[], apply(S){ S.dvdActive=true; } },
  { id:'dvd1', type:'passive', group:'dvd', tier:1, icon:'📀', img:null,
    name:'DVD логотип +', desc:'DVD швидший, удар +3.',
    req:['dvd0'], apply(S){ window.dvdObj.speed*=1.6; window.dvdObj.bonus=3; } },
  { id:'dvd2', type:'passive', group:'dvd', tier:2, icon:'📀', img:null,
    name:'DVD логотип ++', desc:'DVD дуже швидкий, удар +7.',
    req:['dvd1'], apply(S){ window.dvdObj.speed*=1.9; window.dvdObj.bonus=7; } },

  // Крит — тепер підвищує УРОН від крита ×2 (200%)
  { id:'crit0', type:'passive', group:'crit', tier:0, icon:'💥', img:null,
    name:'Крит! ×2', desc:'Критичний удар тепер дає ×2 очок.',
    req:[], apply(S){ S.critMulti=2; } },
  { id:'crit1', type:'passive', group:'crit', tier:1, icon:'💥', img:null,
    name:'Крит! ×2 +', desc:'Крит тепер дає ×3 очок.',
    req:['crit0'], apply(S){ S.critMulti=3; } },
  { id:'crit2', type:'passive', group:'crit', tier:2, icon:'💥', img:null,
    name:'Крит! ×2 ++', desc:'Крит тепер дає ×4 очок.',
    req:['crit1'], apply(S){ S.critMulti=4; } },

  // Свин
  { id:'pig0', type:'passive', group:'pig', tier:0, icon:'🐷', img:null,
    name:'Свин ти куда?', desc:'Кнопка літає. Удар об стіну = авто-клік. Ручний ×2.',
    req:[], apply(S){ S.pigActive=true; S.pigSpeed=1.3; S.pigMulti=2; } },
  { id:'pig1', type:'passive', group:'pig', tier:1, icon:'🐷', img:null,
    name:'Свин ти куда? +', desc:'Швидша. Ручний ×3.',
    req:['pig0'], apply(S){ S.pigSpeed=2.4; S.pigMulti=3; } },
  { id:'pig2', type:'passive', group:'pig', tier:2, icon:'🐷', img:null,
    name:'Свин ти куда? ++', desc:'Дуже швидка. Ручний ×5.',
    req:['pig1'], apply(S){ S.pigSpeed=4.0; S.pigMulti=5; } },
];

window.getAvailableUpgrades = function(acquired) {
  return window.ALL_UPGRADES.filter(u =>
    !acquired.includes(u.id) && u.req.every(r => acquired.includes(r))
  );
};
