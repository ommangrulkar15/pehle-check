(function(){
var $=function(id){return document.getElementById(id)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,root=document.documentElement;
var ICON={o:'check',w:'alert',b:'x',u:'help','-':'help'},CLS={o:'ok',w:'warn',b:'bad',u:'unk','-':'off'};
function flip(el,txt,mod){el.className=el.className.replace(/ ?(flip|stop|unk|bad)\b/g,'')+(mod?' '+mod:'');el.innerHTML='<span>'+txt+'</span>';void el.offsetWidth;if(!RM)el.classList.add('flip')}
var PC=window.PC,rg=PC.rg;PC.scrollProg=true;
function inr(n){return '₹'+n.toLocaleString('en-IN')}


/* hero: sample report card. Demo data only; ranges come from price.js (PC.heroR), never from AI. */
var panel=$('panel'),card=$('phone'),busy=[];PC.inr=inr;PC.flip=flip;
var ROWS=['IMEI matches box and bill','Account lock','Battery health','Screen and touch'],IC={ok:'check',warn:'alert',bad:'lock',off:'help',wait:'help'};
var H={fair:{ask:26000,v:'Buy',st:[['ok','OK'],['ok','OK'],['ok','86%'],['ok','OK']]},
 dear:{ask:31000,v:'Negotiate',st:[['ok','OK'],['ok','OK'],['ok','84%'],['ok','OK']]},
 lock:{ask:24000,v:'Walk away',st:[['ok','OK'],['bad','Problem'],['off','Not checked'],['off','Not checked']]}};
var rows=$('rcRows');rows.innerHTML=ROWS.map(function(r){return '<li class="rc-wait"><span class="rc-n">'+r+'</span><span class="pill"><svg class="i" aria-hidden="true"><use href="#i-check"/></svg><b>Checking</b></span></li>'}).join('');
var lis=[].slice.call(rows.children);
function why(k){var e=PC.heroR&&PC.heroR(k).e;
 if(k==='lock')return 'Account lock found. Hard stop, so the price is ignored.';
 if(!e||!e.ok)return '';
 return inr(H[k].ask)+(k==='fair'?' is inside the sample range '+inr(e.sell[0])+' to '+inr(e.sell[1])+'.':' is above the sample range '+inr(e.sell[0])+' to '+inr(e.sell[1])+'. Offer near '+inr(e.buy[1])+'.')}
function setRow(li,s){li.className='rc-'+s[0];li.querySelector('use').setAttribute('href','#i-'+IC[s[0]]);li.querySelector('b').textContent=s[1]}
function show(k,user){var s=H[k],o=$('rcOut'),th=$('thumb');PC.scn=k;busy.forEach(clearTimeout);busy=[];
 $$('.hero .chip').forEach(function(c){c.setAttribute('aria-checked',c.dataset.s===k)});
 $('rcAsk').textContent=inr(s.ask);
 var fin=function(){$('rcAskL').classList.toggle('ign',k==='lock');o.className='rc-out o-'+k;$('rcV').textContent=s.v;$('rcW').textContent=why(k);void o.offsetWidth;if(!RM)o.classList.add('flip');
  if(user)$('hlive').textContent='Sample: '+s.v+'. '+why(k)};
 if(RM){lis.forEach(function(li,i){setRow(li,s.st[i])});th.classList.remove('on');return fin()}
 /* the demo: a thumb taps each check, the result appears under the tap, then the verdict. A hard stop ends the checks early. */
 lis.forEach(function(li){setRow(li,['wait','Checking'])});$('rcAskL').classList.remove('ign');
 o.className='rc-out o-wait';$('rcV').textContent='Checking';$('rcW').textContent='';
 th.classList.remove('press');th.classList.add('on');
 var t=260,taps=k==='lock'?2:4;
 lis.forEach(function(li,i){var p=li.querySelector('.pill');
  if(i<taps){busy.push(setTimeout(function(){th.style.translate=Math.round(p.offsetLeft+p.offsetWidth/2-18)+'px '+Math.round(p.offsetTop+p.offsetHeight/2-18)+'px'},t));
   busy.push(setTimeout(function(){th.classList.add('press');setRow(li,s.st[i]);li.classList.add('popin')},t+400));
   busy.push(setTimeout(function(){th.classList.remove('press')},t+520));t+=640}
  else{busy.push(setTimeout(function(){setRow(li,s.st[i])},t));t+=120}});
 busy.push(setTimeout(function(){th.classList.remove('on');fin()},t+120))}
/* auto-play: Fair price, then Too costly, then Locked phone, on a loop. A chip tap plays that sample and the loop
   resumes from the next one 8 seconds later. The pause button is the stop control (WCAG 2.2.2); hover does not pause. */
var auto=!RM,seen=true,order=['fair','dear','lock'],ai=0,tm=null,pb=$('heroPause');
function pl(){pb.textContent=auto?'Pause sample':'Play sample'}
function next(){clearTimeout(tm);if(!auto)return;if(!seen||document.hidden){tm=setTimeout(next,1000);return}show(order[ai%3]);ai++;tm=setTimeout(next,7000)}
$$('.hero .chip').forEach(function(c){c.onclick=function(){clearTimeout(tm);show(c.dataset.s,1);ai=order.indexOf(c.dataset.s)+1;if(auto)tm=setTimeout(next,8000)}});
$$('.js-sample').forEach(function(l){l.onclick=function(){PC.loadScn&&PC.loadScn(PC.scn)}});
pb.onclick=function(){auto=!auto;pl();if(auto)next();else clearTimeout(tm)};pb.hidden=RM;pl();
if(RM)show('fair');else tm=setTimeout(next,450);
new IntersectionObserver(function(e){seen=e[0].isIntersecting}).observe(panel);
/* subtle pointer tilt on the card, mouse only */
if(!RM&&matchMedia('(hover: hover)').matches){var tx=0,ty=0,x=0,y=0;
 panel.addEventListener('pointermove',function(e){var r=panel.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5});
 panel.addEventListener('pointerleave',function(){tx=ty=0});
 var os=$$('.rc-wrap .o');(function f(){x+=(tx-x)*.08;y+=(ty-y)*.08;if(seen){os.forEach(function(o){var dd=+o.dataset.d;o.style.transform='translate('+(x*dd).toFixed(1)+'px,'+(y*dd).toFixed(1)+'px)'})}if(seen)card.style.transform='perspective(1000px) rotateY('+(x*6).toFixed(2)+'deg) rotateX('+(-y*5).toFixed(2)+'deg)';requestAnimationFrame(f)})()}

/* ticker: the ten checks; tap one to open it in the stepper below */
var C=PC.C,tk=$('tkTrack');[0,1].forEach(function(dup){C.forEach(function(c,i){var b=document.createElement('button');b.type='button';b.innerHTML='<b>'+(i+1)+'</b>'+c[0];if(c[2])b.className='hs-t';
 if(dup){b.setAttribute('aria-hidden','true');b.tabIndex=-1}
 b.onclick=function(){PC.goCheck&&PC.goCheck(i+1);$('how').scrollIntoView({behavior:RM?'auto':'smooth'})};tk.append(b)})});
new IntersectionObserver(function(e){$('ticker').classList.toggle('off',!e[0].isIntersecting)}).observe($('ticker'));

/* scam quiz */
var right=0,done=0;
$$('.qrow').forEach(function(r){$$('.qb',r).forEach(function(b){b.onclick=function(){if(r.dataset.done)return;r.dataset.done=1;done++;
 var ok=b.dataset.a===r.dataset.c;if(ok)right++;b.setAttribute('aria-checked','true');$$('.qb',r).forEach(function(x){x.disabled=x!==b});
 var a=r.querySelector('.ans-t');a.className='ans-t'+(ok?'':' no');a.innerHTML='<svg class="i"><use href="#i-'+(ok?'check':'x')+'"/></svg><span><b>'+(ok?'Correct.':'Not quite.')+'</b> '+(r.dataset.c==='scam'?'This is a scam. ':'This is a real seller. ')+r.dataset.t+'</span>';a.hidden=false;
 if(done===3)$('score').textContent=right+' of 3 right. '+(right===3?'You are ready to meet a seller.':'Read the hard stops above once more.');
 $('quizLive').textContent=a.textContent+(done===3?' '+$('score').textContent:'')}})});

/* closing sentence feeds the price chapter */
var buy=$('buy');function bt(){var v=buy.value.trim()||'phone';buy.style.setProperty('--n',buy.value.length);$('buyT').textContent='Check my '+v}
buy.oninput=bt;bt();$('buyBtn').onclick=function(e){var v=buy.value.trim();if(v&&PC.pickModel){e.preventDefault();PC.pickModel(v.slice(0,60))}};

$$('.hero .chips,.qbtns').forEach(rg);
$('c2steps-t');
/* first-view moments */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('seen');io.unobserve(e.target)}})},{threshold:.35});
$$('.ani,.hard').forEach(function(el){io.observe(el)});

/* scroll-linked motion: progress through the ten checks, drifting type, panel that grows, ticker that follows scroll speed */
{var bws=$$('.bw'),scr=$$('.c2 h2,.hard h2,.scam h2,.close .d'),segs=$$('#prog i'),anim=null,lastY=scrollY,vel=0,run=false,pn=$('panel'),cl=function(n){return Math.max(0,Math.min(1,n))};
 var frame=function(){run=false;var y=scrollY,h=innerHeight,max=document.documentElement.scrollHeight-h,p=max>0?y/max:0;
  segs.forEach(function(s,i){s.classList.toggle('on',p>i/10+.001)});
  bws.forEach(function(el){var r=el.parentNode.getBoundingClientRect(),t=cl((h-r.top)/(h+r.height)),d=+el.dataset.bw,w=el.scrollWidth,room=Math.max(0,w-innerWidth);el.style.transform='translate3d('+(-room*(RM?.25:1)*(d>0?1-t:t)).toFixed(0)+'px,0,0)'});
  if(!RM)scr.forEach(function(el){var r=el.getBoundingClientRect(),t=cl((h-r.top)/(h+r.height));el.style.transform='translate3d('+((t-.5)*-(innerWidth<700?16:70)).toFixed(1)+'px,0,0)'});
  var r=pn.getBoundingClientRect(),g=cl(-r.top/r.height);if(!RM)pn.style.transform='scale('+(1+g*.06).toFixed(3)+')';
  var d=y-lastY;lastY=y;if(RM)return;vel+=(d-vel)*.25;
  if(!RM&&!anim){var a=$('tkTrack').getAnimations();anim=a[0]}
  if(anim){anim.updatePlaybackRate(Math.max(-6,Math.min(8,1+vel*.25)))}
  if(Math.abs(vel)>.05){vel*=.9;sched()}else if(anim){anim.updatePlaybackRate(1)}};
 var sched=function(){if(!run){run=true;requestAnimationFrame(frame)}};
 addEventListener('scroll',sched,{passive:true});addEventListener('resize',sched);sched()}
})();
