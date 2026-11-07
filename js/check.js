/* Check page: one check at a time. Answers live in PC.RES and are saved on this device only (never sent anywhere). */
(function(){
var PC=window.PC,$=PC.$,$$=PC.$$,C=PC.C,K='pc-res',os='i',n=1,W={ok:'OK',prob:'Problem',unk:'Not checked'};
var q=new URLSearchParams(location.search),sample=q.get('sample');
if(!sample){try{var sv=JSON.parse(localStorage.getItem(K)||'{}');Object.keys(sv).forEach(function(k){PC.RES[k]=sv[k]})}catch(e){}}
function save(){if(PC.sample)return;try{localStorage.setItem(K,JSON.stringify(PC.RES))}catch(e){}}
function mode(){var m=$('modeNote');if(m.hidden===!PC.sample&&m.childNodes.length)return;m.hidden=!PC.sample;m.innerHTML=PC.sample?'You are looking at a sample. Your own answers are kept safe and are not changed. <button type="button" class="lnk2" id="ownBtn">Back to my own check</button>':''}
document.addEventListener('click',function(e){if(e.target.id==='ownBtn'){PC.restoreOwn&&PC.restoreOwn();$('stH').focus()}});
function dots(){
 $('stDots').innerHTML=C.map(function(c,i){var k=i+1,r=PC.RES[k];return '<li><button type="button" data-n="'+k+'" class="'+(r||'')+(k===n?' cur':'')+'" aria-label="Check '+k+', '+c[0]+', '+(r?W[r]:'not done')+'"'+(k===n?' aria-current="step"':'')+'>'+k+'</button></li>'}).join('');
 if(!PC.scrollProg)$$('#prog i').forEach(function(s,i){s.classList.toggle('on',!!PC.RES[i+1])})}
function draw(focus){var c=C[n-1],st=(os==='a'&&c[4])||c[3],r=PC.RES[n];
 $('stN').textContent='Check '+n+' of 10';$('stH').textContent=c[0];$('stHs').hidden=!c[2];$('stWhy').textContent=c[1];$('stOs').hidden=!c[4];
 $('stSteps').innerHTML=st.map(function(s){return '<li>'+s+'</li>'}).join('');
 $$('#stRes button').forEach(function(b){b.setAttribute('aria-checked',b.dataset.r===r)});
 $('stMsg').textContent=r==='prob'&&c[2]?'Hard stop. Do not pay for this phone. You can stop here and see the report.':r==='prob'?'Problem noted. It lowers the price.':r==='unk'?'Not checked is never a pass.':'';
 $('stBack').disabled=n===1;$('stNext').textContent=n===10||(r==='prob'&&c[2])?'See my report':'Next check';
 dots();mode();if(focus)$('stH').focus()}
function go(k,kb){var to=Math.max(1,Math.min(10,k)),dir=to>n?1:-1,moved=to!==n&&!kb;n=to;draw(true);
 /* the card slides in from the side you are moving towards; answers never move it */
 var cd=document.querySelector('.st-card');if(moved&&!PC.RM&&cd.animate)cd.animate([{transform:'translateX('+(24*dir)+'px)',opacity:0},{transform:'none',opacity:1}],{duration:240,easing:'cubic-bezier(.16,1,.3,1)'})}
function report(){PC.openReport&&PC.openReport();var t=$('try');t.scrollIntoView({behavior:PC.RM?'auto':'smooth'});var h=t.querySelector('h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}
$$('#stRes button').forEach(function(b){b.onclick=function(){PC.openReport&&PC.openReport();PC.RES[n]=b.dataset.r;save();PC.onRes&&PC.onRes();draw()}});
$$('#stOs button').forEach(function(b){b.onclick=function(){os=b.dataset.os;$$('#stOs button').forEach(function(x){x.setAttribute('aria-checked',x===b)});draw()}});
/* keyboard presses (click detail 0) never animate: they repeat often and motion makes them feel slow */
$('stBack').onclick=function(e){go(n-1,!e.detail)};
$('stNext').onclick=function(e){var c=C[n-1];if(n===10||(PC.RES[n]==='prob'&&c[2]))report();else go(n+1,!e.detail)};
$('stDots').addEventListener('click',function(e){var b=e.target.closest('button');if(b)go(+b.dataset.n,!e.detail)});
$('resetBtn').onclick=function(){if(!confirm('Clear all your answers and the phone details on this device, and start over?'))return;
 Object.keys(PC.RES).forEach(function(k){delete PC.RES[k]});PC.sample=false;try{localStorage.removeItem(K)}catch(e){}PC.resetPrice&&PC.resetPrice();
 if(location.search)history.replaceState(null,'',location.pathname);PC.onRes&&PC.onRes();go(1)};
PC.onChecks=function(){save();draw()};PC.goCheck=go;
PC.rg($('stRes'));PC.rg($('stOs'));
/* start at the first unanswered check */
for(var i=1;i<=10&&PC.RES[i];i++);n=i>10?10:i;draw();
/* after price.js has run: a sample or a model from the Home page */
addEventListener('DOMContentLoaded',function(){
 if(sample&&PC.loadScn&&/^(fair|dear|lock)$/.test(sample)){PC.loadScn(sample);draw();if(location.hash==='#try')setTimeout(report,50)}
 var m=q.get('model');if(m&&PC.pickModel)PC.pickModel(m.slice(0,60));
});
})();
