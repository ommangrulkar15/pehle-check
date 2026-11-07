/* Shared by every page: state object, radio-group helper, theme, language, the ten checks. */
(function(){
var $=function(id){return document.getElementById(id)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,root=document.documentElement;
var PC=window.PC={RES:{},scn:'dear'};
function rg(el){el.setAttribute('role','radiogroup');var bs=$$('button',el);bs.forEach(function(b){b.setAttribute('role','radio')});
 function on(b){return b.getAttribute('aria-checked')==='true'}
 function sync(){var any=bs.some(on);bs.forEach(function(b){b.tabIndex=(on(b)||(!any&&b===bs[0]))?0:-1})}
 el.addEventListener('keydown',function(e){var k={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(!k)return;e.preventDefault();var i=(bs.indexOf(document.activeElement)+k+bs.length)%bs.length;bs[i].focus();bs[i].click()});
 new MutationObserver(sync).observe(el,{subtree:true,attributes:true,attributeFilter:['aria-checked','disabled']});sync()}
PC.rg=rg;
PC.$=$;PC.$$=$$;PC.RM=RM;PC.inr=function(n){return '₹'+Math.round(n).toLocaleString('en-IN')};
var C=[['IMEI match','The number on the box, the bill and *#06# must match.',1,['Dial *#06#','Match it to the box and bill','SMS KYM and the IMEI to 14422']],
 ['Account lock','A locked phone can be switched off from afar.',1,['Settings, your name','Find My is off','Sign out in front of you'],['Settings, Accounts','Remove the Google account','Reset in front of you']],
 ['Bill, seller and finance','A bill shows where the phone came from. A pending EMI can get a phone locked later.',1,['Ask for the bill','Ask: is any EMI or loan still pending?','Ask for proof it is closed. This site cannot check it']],
 ['Screen and touch','Dead spots and marks hide on a dark screen.',0,['Open a white page','Drag an icon edge to edge','Look for marks and spots']],
 ['Body and buttons','Dents and loose buttons show how it was used.',0,['Press every button','Check the frame corners','Shake gently and listen']],
 ['Cameras, audio, SIM','Test what you will use every day.',0,['Take a front and back photo','Make a call and record audio','Put in your own SIM']],
 ['Battery','Battery health changes a fair price.',0,['Settings, Battery','Read the health number','Below 80 means a lower offer'],['Settings, Battery','Open battery info','Note how it drains in 5 minutes']],
 ['Parts history','Changed parts lower the price.',0,['Settings, General, About','Look for Parts and service','Ask what was changed'],['Ask for repair bills','Check the screen edges','Ask what was changed']],
 ['Charging','A loose port means a repair soon.',0,['Plug in your own cable','Wiggle it gently','Check it starts charging']],
 ['Pay safely','Pay only after every check, in person.',1,['No money before you inspect','Pay by UPI in front of them','Get a dated bill']]];;
PC.C=C;
/* theme: cross-fade where supported */
var tb=$('themeBtn');
function dark(){return root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches}
function tlabel(){tb.setAttribute('aria-label','Switch to '+(dark()?'light':'dark')+' theme')}tlabel();
tb.onclick=function(){var t=(PC.th||(dark()?'dark':'light'))==='dark'?'light':'dark';PC.th=t;var go=function(){root.dataset.theme=t;tlabel()};
 if(document.startViewTransition&&!RM){var vt=document.startViewTransition(go);[vt.ready,vt.finished,vt.updateCallbackDone].forEach(function(p){p&&p.catch(function(){})})}else go();try{localStorage.setItem('theme',t)}catch(e){}};

/* language popover (sheet on phones) */
var lb=$('langBtn'),lp=$('langPop'),sc=$('scrim'),note=$('langNote');
function lang(o){lp.classList.toggle('open',o);lb.closest('.hdr').classList.toggle('pop-open',o);sc.classList.toggle('open',o&&innerWidth<700);lb.setAttribute('aria-expanded',o);if(o)(lp.querySelector('[aria-checked=true]')||lp).focus()}
lb.onclick=function(e){e.stopPropagation();lang(!lp.classList.contains('open'))};
$('langX').onclick=function(){lang(false);lb.focus()};sc.onclick=function(){lang(false)};
document.addEventListener('click',function(e){if(!lp.contains(e.target)&&e.target!==lb)lang(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lp.classList.contains('open')){lang(false);lb.focus()}});
$$('[role=menuitemradio]',lp).forEach(function(b){b.onclick=function(){
 $$('[role=menuitemradio]',lp).forEach(function(x){x.setAttribute('aria-checked',x===b)});$('langLbl').textContent=b.dataset.l;
 note.textContent=b.dataset.l==='English'?'':'Draft translation. The '+b.dataset.l+' page comes in the next build.'}});
$('notify').onclick=function(){note.textContent='Noted. We will show more languages here first.'};
})();
