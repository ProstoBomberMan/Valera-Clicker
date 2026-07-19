/* upgrades.js */
window.ALL_UPGRADES = [
  /* СТАТИ */
  {id:'pow0',type:'stat',group:'pow',tier:0,icon:'⚔',img:null,name:'Сила +2',desc:'+2 до Сили.',req:[],apply(S){S.statPower+=2;S.recalc();}},
  {id:'pow1',type:'stat',group:'pow',tier:1,icon:'⚔',img:null,name:'Сила +2',desc:'+2 до Сили.',req:['pow0'],apply(S){S.statPower+=2;S.recalc();}},
  {id:'pow2',type:'stat',group:'pow',tier:2,icon:'⚔',img:null,name:'Сила +2',desc:'+2 до Сили.',req:['pow1'],apply(S){S.statPower+=2;S.recalc();}},
  {id:'aut0',type:'stat',group:'aut',tier:0,icon:'⚙',img:null,name:'Авто +2',desc:'+2 до Авто.',req:[],apply(S){S.statAuto+=2;S.recalc();}},
  {id:'aut1',type:'stat',group:'aut',tier:1,icon:'⚙',img:null,name:'Авто +2',desc:'+2 до Авто.',req:['aut0'],apply(S){S.statAuto+=2;S.recalc();}},
  {id:'aut2',type:'stat',group:'aut',tier:2,icon:'⚙',img:null,name:'Авто +2',desc:'+2 до Авто.',req:['aut1'],apply(S){S.statAuto+=2;S.recalc();}},
  {id:'lck0',type:'stat',group:'lck',tier:0,icon:'🎲',img:null,name:'Удача +2',desc:'+2 до Удачі. Кожна одиниця = +5% крит.',req:[],apply(S){S.statLuck+=2;S.recalc();}},
  {id:'lck1',type:'stat',group:'lck',tier:1,icon:'🎲',img:null,name:'Удача +2',desc:'+2 до Удачі.',req:['lck0'],apply(S){S.statLuck+=2;S.recalc();}},
  {id:'lck2',type:'stat',group:'lck',tier:2,icon:'🎲',img:null,name:'Удача +2',desc:'+2 до Удачі.',req:['lck1'],apply(S){S.statLuck+=2;S.recalc();}},

  /* ПАСИВКИ */
  {id:'dvd0',type:'passive',group:'dvd',tier:0,icon:'📀',img:'img/upg_dvd.png',name:'DVD логотип',desc:'DVD відскакує від країв. Кожен удар +1.',req:[],apply(S){S.dvdActive=true;}},
  {id:'dvd1',type:'passive',group:'dvd',tier:1,icon:'📀',img:'img/upg_dvd.png',name:'DVD логотип +',desc:'DVD швидший, удар +3.',req:['dvd0'],apply(S){window.dvdObj.speed*=1.6;window.dvdObj.bonus=3;}},
  {id:'dvd2',type:'passive',group:'dvd',tier:2,icon:'📀',img:'img/upg_dvd.png',name:'DVD логотип ++',desc:'DVD дуже швидкий, удар +7.',req:['dvd1'],apply(S){window.dvdObj.speed*=1.9;window.dvdObj.bonus=7;}},
  {id:'crit0',type:'passive',group:'crit',tier:0,icon:'💥',img:'img/upg_crit.png',name:'Крит! ×2',desc:'Критичний удар дає ×2.',req:[],apply(S){S.critMulti=2;}},
  {id:'crit1',type:'passive',group:'crit',tier:1,icon:'💥',img:'img/upg_crit.png',name:'Крит! ×3',desc:'Крит дає ×3.',req:['crit0'],apply(S){S.critMulti=3;}},
  {id:'crit2',type:'passive',group:'crit',tier:2,icon:'💥',img:'img/upg_crit.png',name:'Крит! ×4',desc:'Крит дає ×4.',req:['crit1'],apply(S){S.critMulti=4;}},
  {id:'pig0',type:'passive',group:'pig',tier:0,icon:'🐷',img:'img/upg_pig.png',name:'Свин ти куда?',desc:'Кнопка літає. Удар об стіну = авто-клік. Ручний ×2.',req:[],apply(S){S.pigActive=true;S.pigSpeed=3.5;S.pigMulti=2;}},
  {id:'pig1',type:'passive',group:'pig',tier:1,icon:'🐷',img:'img/upg_pig.png',name:'Свин ти куда? +',desc:'Швидша. Ручний ×3.',req:['pig0'],apply(S){S.pigSpeed=6.0;S.pigMulti=3;}},
  {id:'pig2',type:'passive',group:'pig',tier:2,icon:'🐷',img:'img/upg_pig.png',name:'Свин ти куда? ++',desc:'Дуже швидка. Ручний ×5.',req:['pig1'],apply(S){S.pigSpeed=10.0;S.pigMulti=5;}},

  /* МАГАЗИН — спеціальний (з'являється з 30% шансом замість звичайного) */
  /* ПРОПУСТИТИ ДЕНЬ — з'являється після покупки магазину */
];

window.getAvailableUpgrades = function(acquired) {
  return window.ALL_UPGRADES.filter(u =>
    !acquired.includes(u.id) && u.req.every(r => acquired.includes(r))
  );
};
