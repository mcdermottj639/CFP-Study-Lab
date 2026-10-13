/* Measures visible, active study time in the app, readers and decks. No analytics server. */
(function(){
  'use strict';
  var LS='cfpStudyHome.v1', isReader=/\/apps\//.test(location.pathname), last=Date.now(), interaction=Date.now(), lastFlush=Date.now();
  var session='time-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2), bucketDay='', accumulated=0;
  function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function visible(el){return el&&!el.classList.contains('hidden');}
  function studying(){
    if(document.visibilityState==='hidden')return false;
    if(isReader)return true;
    return visible(document.getElementById('coach'))&&typeof S!=='undefined'&&S.coach&&S.coach.active || visible(document.getElementById('study'))&&document.getElementById('studyArea').textContent.trim().length>0 || mediaPlaying();
  }
  function mediaPlaying(){return Array.from(document.querySelectorAll('audio,video')).some(function(m){return !m.paused&&!m.ended;}) || !!(window.speechSynthesis&&speechSynthesis.speaking&&!speechSynthesis.paused);}
  function flush(){
    if(!accumulated)return;
    try{
      var main=typeof S!=='undefined',raw=localStorage.getItem(LS),s=main?S:JSON.parse(raw||'{}');
      if(!main&&(!raw||!Array.isArray(s.attempts))){accumulated=0;return;}
      s.coach=s.coach||{};s.coach.time=s.coach.time||{};
      var id=session+'-'+bucketDay,old=s.coach.time[id];
      s.coach.time[id]={day:bucketDay,ms:(old?old.ms:0)+accumulated,at:Date.now(),kind:isReader?'reader':'study'};
      accumulated=0;
      if(main&&typeof save==='function')save();else localStorage.setItem(LS,JSON.stringify(s));
      lastFlush=Date.now();
    }catch(e){}
  }
  function tick(){
    var now=Date.now(),delta=now-last,d=today();last=now;
    if(bucketDay&&d!==bucketDay)flush();bucketDay=d;
    if(delta>0&&delta<=12000&&studying()&&(now-interaction<90000||mediaPlaying()))accumulated+=delta;
    if(now-lastFlush>=15000)flush();
  }
  ['pointerdown','keydown','scroll','touchstart'].forEach(function(evt){document.addEventListener(evt,function(){interaction=Date.now();},{passive:true});});
  document.addEventListener('visibilitychange',function(){tick();flush();last=Date.now();});
  window.addEventListener('pagehide',function(){tick();flush();});
  window.CFPActivity={flush:function(){tick();flush();}};setInterval(tick,5000);
  if(isReader&&sessionStorage.getItem('cfpCoachReturn')){
    var a=document.createElement('a');a.href='../index.html#coach';a.textContent='Return to my study session →';a.style.cssText='display:block;position:relative;z-index:10;padding:12px 18px;background:#254c3b;color:#fffdf6;font:600 13px system-ui;text-align:center;text-decoration:none';document.body.insertBefore(a,document.body.firstChild);
  }
})();
