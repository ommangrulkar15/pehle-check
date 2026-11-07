/* Phone and price. Demo only: COMPS holds invented sample prices, not real market data.
   Needed for real estimates: see DATA-NEEDS.md. The numbers come from percentiles of comparable sold prices, never from a language model. */
(function(){
var PC=window.PC,$=function(i){return document.getElementById(i)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))},inr=function(n){return '₹'+Math.round(n).toLocaleString('en-IN')};
var DATE='4 Nov 2026 (prototype build)';
var COMPS={
 'iPhone 13':{'128':{sold:[24000,24500,25000,25500,26000,26500,27000,27500,28000,28500,29000],ask:[27000,28000,29000,29500,30000,31000,32000,33000]},'256':{sold:[28500,29000,29500,30000,30500,31000,31500],ask:[31500,32500,33500,34000]}},
 'iPhone 12':{'64':{sold:[17500,18000,18500,19000,19500,20000,21000],ask:[20000,21000,22000,23000]},'128':{sold:[19500,20000,20500,21000,21500,22000,23000],ask:[22000,23000,24000,25000]}},
 'Redmi Note 11':{'64':{sold:[7500,8000,8200,8500,8800,9000,9500],ask:[8800,9300,9800,10500]},'128':{sold:[8800,9200,9500,9800,10000,10500,11000],ask:[10000,10500,11000,12000]}},
 'Galaxy M31':{'128':{sold:[6500,6800,7000,7300,7500,7800,8200],ask:[7500,8000,8500,9000]}},
 'Pixel 6a':{'128':{sold:[13500,14500],ask:[15500,16000,17000]}}};
var LOCS=['Mumbai','Delhi NCR','Bengaluru','Pune','Hyderabad','Other'];
var OPT={age:[['u1','Under 1 year',1.06],['y12','1 to 2 years',1],['y23','2 to 3 years',.95],['y3','Over 3 years',.9]],
 cond:[['new','Like new',1.06],['good','Good',1],['worn','Worn, scratches',.92],['dmg','Cracked or damaged',.75]],
 batt:[['b90','90% or more',1.03],['b80','80 to 89%',1],['b79','Under 80%',.94],['unk','Not checked',1]],
 rep:[['none','No repairs',1],['part','Screen or battery replaced',.93],['unk','Not known',1]]};
var ACC=['Box','Charger','Bill'];
var CH=[{n:1,k:'IMEI matches the box and bill'},{n:2,k:'No account lock (Find My or Google)'},{n:3,k:'No pending EMI or loan (you asked the seller)'},{n:10,k:'Seller did not ask for money before you inspected'}];
var HARD={1:'IMEI problem',2:'Account lock',3:'EMI or loan pending',10:'Seller wants money first'},TODO={1:'IMEI match',2:'account lock',3:'EMI or loan',10:'how the seller wants to be paid'};
function notDone(u){return u.length+' of 4 safety checks '+(u.length===1?'is':'are')+' not done'}
var ST={t:{},model:'Other model',modelText:'',sto:'128',loc:'Not given',age:'y12',ask:0,cond:'good',batt:'b80',rep:'none',acc:['Charger'],src:{cond:'s',batt:'s',rep:'s'}};
/* the buyer's own form is saved apart from samples, so a sample can never overwrite it */
var ST0=JSON.stringify(ST),KS='pc-st2',lastAnn=null;
if(!/[?&]sample=/.test(location.search)){try{var s0=JSON.parse(localStorage.getItem(KS)||'null');if(s0)Object.assign(ST,s0)}catch(e){}}
function saveST(){if(PC.sample)return;try{localStorage.setItem(KS,JSON.stringify(ST))}catch(e){}}
function announce(t){if(t!==lastAnn&&lastAnn!==null)$('scnNote').textContent=t;lastAnn=t}
var PRE={fair:{ask:26000,lock:'ok'},dear:{ask:31000,lock:'ok'},lock:{ask:24000,lock:'prob'}};
var NAMES={fair:'Fair price',dear:'Too costly',lock:'Locked phone'};
function norm(t){return String(t).toLowerCase().replace(/\b\d+\s?gb\b/g,'').replace(/\b(apple|samsung|xiaomi|google|mi)\b/g,'').replace(/[^a-z0-9]/g,'')}
function match(t){var n=norm(t);if(!n)return null;return Object.keys(COMPS).filter(function(k){return norm(k)===n})[0]||null}
function mname(){return ST.modelText||(ST.model==='Other model'?'':ST.model)}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function stoList(){var o=COMPS[ST.model]?Object.keys(COMPS[ST.model]):['64','128','256'];if(o.indexOf(ST.sto)<0)ST.sto=o[0];return o}
function stoHTML(){return radios('sto','Storage',stoList().map(function(x){return [x,x+' GB']}),ST.sto)}
function hint(){var h=$('mHint');if(!h)return;h.textContent=!ST.modelText.trim()?'':COMPS[ST.model]?'Matched sample data for '+ST.model+'.':'No sample data for this phone. The estimate will say not enough data. Model variants such as Pro or Plus count as different phones.'}
function setModel(t){ST.modelText=t;ST.model=match(t)||'Other model';var b=$('stoBox');if(b)b.innerHTML=stoHTML();range();hint();render()}
function opt(g,k){return OPT[g].filter(function(o){return o[0]===k})[0]}
function pct(a,q){var s=a.slice().sort(function(x,y){return x-y}),i=(s.length-1)*q,l=Math.floor(i),h=Math.ceil(i);return s[l]+(s[h]-s[l])*(i-l)}
function r5(x){return Math.round(x/500)*500}
/* the estimate: percentiles of completed sales for the same model and storage, times documented adjustment factors */
function est(s,res){res=res||{};var c=(COMPS[s.model]||{})[s.sto];
 if(!c)return {ok:false,why:'No comparable data for '+(s.modelText||s.model)+'.'};
 if(c.sold.length<5)return {ok:false,why:'Only '+c.sold.length+' completed sales in the sample data. At least 5 are needed.',nAsk:c.ask.length,nSold:c.sold.length};
 var batt=res[7]==='prob'?'b79':s.batt,rp=res[8]==='prob'?'part':s.rep,fa=[['Age',opt('age',s.age)],['Condition',opt('cond',s.cond)],['Battery',opt('batt',batt)],['Repairs',opt('rep',rp)]].concat([4,5,6,9].filter(function(n){return res[n]==='prob'}).map(function(n){return [PC.C[n-1][0]+' problem',[0,'Problem found',.93]]})),
  accF=s.acc.length>=3?1.02:s.acc.length===0?.97:1,f=fa.reduce(function(m,x){return m*x[1][2]},1)*accF,
  unk=(batt==='unk'?1:0)+(rp==='unk'?1:0),p25=pct(c.sold,.25),p50=pct(c.sold,.5),p75=pct(c.sold,.75);
 return {ok:true,nSold:c.sold.length,nAsk:c.ask.length,askMed:pct(c.ask,.5),f:f,unk:unk,fa:fa,accF:accF,base:[p25,p50,p75],
  sell:[r5(p25*f),r5(p75*f)],buy:[r5(p25*f*(1-.04*unk)),r5(p50*f)]}}
function fitOf(a,e){var lo=e.sell[0],hi=e.sell[1];
 if(a<lo*.8)return {k:'cheap',pl:'Too cheap?',cls:'unk',v:'Check why it is cheap',t:'The asking price is far below the sample range. Check for a lock, a pending EMI or a stolen phone before anything else.'};
 if(a<=e.buy[1])return {k:'fair',pl:'In range',cls:'',v:'Buy',t:'The asking price is inside or below your offer range.'};
 if(a<=hi*1.15)return {k:'neg',pl:'Above range',cls:'',v:'Negotiate',t:'The asking price is above your offer range. Offer near '+inr(e.buy[1])+'.'};
 return {k:'high',pl:'Too high',cls:'bad',v:'Walk away',t:'The asking price is far above the sample range. Walk away unless the seller comes down a lot.'}}
PC.heroR=function(k){var x=Object.assign({},ST,{ask:PRE[k].ask,model:'iPhone 13',sto:'128',age:'y12',cond:'good',batt:'b80',rep:'none',acc:['Charger']}),e=est(x);return {p:inr(PRE[k].ask),r:k==='lock'?'Hard stop. Price does not matter.':'Sample range '+inr(e.sell[0])+' to '+inr(e.sell[1]),e:e}};
if(!$('pform'))return; /* Home only needs heroR; the form lives on check.html */

/* form */
function radios(name,legend,list,cur,extra){return '<fieldset class="fs"><legend>'+legend+'</legend><div class="opts">'+list.map(function(o){return '<label><input type="radio" name="'+name+'" value="'+o[0]+'"'+(o[0]===cur?' checked':'')+'><span>'+o[1]+'</span></label>'}).join('')+'</div>'+(extra||'')+'</fieldset>'}
function srcRow(g){return '<div class="opts src" role="radiogroup" aria-label="Who said this?">'+[['s','Seller said'],['b','I checked']].map(function(o){return '<label><input type="radio" name="src_'+g+'" value="'+o[0]+'"'+(ST.src[g]===o[0]?' checked':'')+'><span>'+o[1]+'</span></label>'}).join('')+'</div>'}
function build(){var m=Object.keys(COMPS);stoList();
 var mm=COMPS[ST.model]?pct(COMPS[ST.model][ST.sto].sold,.5):26000,lo=r5(mm*.5),hi=r5(mm*1.6);
 $('pform').innerHTML='<h3 class="fh">1. The phone</h3>'+
 '<div class="fs"><label class="lb" for="fModel">Phone model (type it)</label><input id="fModel" type="text" list="dlModel" autocomplete="off" spellcheck="false" placeholder="For example iPhone 13" value="'+esc(mname())+'"><datalist id="dlModel">'+m.map(function(x){return '<option value="'+x+'">'}).join('')+'</datalist><small id="mHint"></small></div>'+
 '<div id="stoBox">'+stoHTML()+'</div>'+
 '<div class="fs"><label class="lb" for="askN">Asking price in rupees</label><input id="askN" type="number" inputmode="numeric" min="1000" step="500" value="'+(ST.ask||'')+'"><input id="askR" class="rng2" type="range" min="'+lo+'" max="'+hi+'" step="500" value="'+Math.max(lo,Math.min(hi,ST.ask))+'" aria-label="Asking price slider"><small id="askS"></small></div>'+
 '<h3 class="fh">2. Safety checks</h3><p class="hint" id="chkHint"></p>'+
 
 '<details class="more"><summary>Make the estimate more accurate (optional)</summary>'+
 '<div class="fs"><label class="lb" for="fLoc">Where you are buying (type it)</label><input id="fLoc" type="text" list="dlLoc" autocomplete="off" placeholder="City or town" value="'+esc(ST.loc==='Not given'?'':ST.loc)+'"><datalist id="dlLoc">'+LOCS.map(function(x){return '<option value="'+x+'">'}).join('')+'</datalist><small>Recorded only. The sample data is not city-specific.</small></div>'+
 radios('age','Age of the phone',OPT.age,ST.age)+
 radios('cond','Condition',OPT.cond,ST.cond,srcRow('cond'))+radios('batt','Battery health',OPT.batt,ST.batt,srcRow('batt'))+radios('rep','Repairs and parts',OPT.rep,ST.rep,srcRow('rep'))+
 '<fieldset class="fs"><legend>Included with the phone</legend><div class="opts">'+ACC.map(function(a){return '<label><input type="checkbox" name="acc" value="'+a+'"'+(ST.acc.indexOf(a)>-1?' checked':'')+'><span>'+a+'</span></label>'}).join('')+'</div></fieldset>'+
 '<details class="paste"><summary>Paste a seller’s listing (optional)</summary><label class="lb" for="lst">Listing text</label><textarea id="lst" rows="4"></textarea><button class="btn" type="button" id="lstB">Fill the form</button><p class="hint" id="lstM">Runs in your browser only. Nothing is sent anywhere. Remove phone numbers and IMEI first.</p></details>'+
 '</details>';
 sliderText()}
function sliderText(){var e=est(ST,PC.RES),r=$('askR'),v=+$('askN').value||ST.ask;if(!r)return;
 var t=inr(v)+(e.ok?'. Seller market range '+inr(e.sell[0])+' to '+inr(e.sell[1])+'. Your offer range '+inr(e.buy[0])+' to '+inr(e.buy[1])+'. Sample data.':'. Not enough data to estimate a range.');
 r.setAttribute('aria-valuetext',t);$('askN').setAttribute('aria-describedby','askS');$('askS').textContent=e.ok?'Seller market range '+inr(e.sell[0])+' to '+inr(e.sell[1])+' (sample).':'Not enough data to show a range.'}

function range(){var r=$('askR'),mm=COMPS[ST.model]?pct(COMPS[ST.model][ST.sto].sold,.5):26000;r.min=r5(mm*.5);r.max=r5(mm*1.6);r.value=Math.max(r.min,Math.min(r.max,ST.ask))}
/* output */
function T(f){return !ST.t[f]?['a','Assumed']:ST.src[f]==='b'?['b','You checked']:['s','Seller said']}
function tag(src){return '<span class="tg '+src[0]+'">'+src[1]+'</span>'}
function render(){var e=est(ST,PC.RES),hard=[],unk=[];
 CH.forEach(function(c){var v=PC.RES[c.n];if(v==='prob')hard.push(c.n);else if(v!=='ok')unk.push(c.n)});
 var probs=[4,5,6,7,8,9].filter(function(n){return PC.RES[n]==='prob'}).map(function(n){return PC.C[n-1][0]}),pt=probs.length?' Problems found: '+probs.join(', ')+'. They lower the price.':'';
 var need=!ST.modelText.trim()||!ST.ask,fit=e.ok&&!need?fitOf(ST.ask,e):null,ov;
 if(hard.length)ov={w:'Walk away',cls:'stop',t:'Hard stop: '+hard.map(function(n){return HARD[n]}).join(', ')+'. No price fixes this. Do not pay.'};
 else if(unk.length)ov={w:'Not ready to pay',cls:'unk',t:notDone(unk)+'. Not checked is never a pass.'};
 else if(need)ov={w:'Add phone and price',cls:'unk',t:'No problems found in the checks you did. Type the phone model and asking price to judge the price.'};
 else if(!e.ok)ov={w:'No price estimate',cls:'unk',t:'No problems found in the checks you did, but there is not enough data to judge the price.'};
 else ov={w:fit.v,cls:fit.cls,t:fit.t+(probs.length?' The range is lowered for: '+probs.join(', ')+'.':'')+' This is a price judgment only.'};
 var dev=hard.length?{w:'Hard stop',cls:'stop',t:'A critical check failed. Price does not matter.'}:unk.length?{w:'Not checked',cls:'unk',t:'Not checked yet: '+unk.map(function(n){return TODO[n]}).join(', ')+'.'+pt}:probs.length?{w:'Problems found',cls:'',t:'No hard stop in the checks you did.'+pt}:{w:'No problems found',cls:'',t:'No problems in the checks you did. This is not proof the phone is safe. It only means these four checks passed.'};
 var rows=CH.map(function(c){var v=PC.RES[c.n]||'unk';return '<li><b>'+({ok:'OK',prob:'Problem',unk:'Not checked'}[v])+'</b> '+c.k+'</li>'}).join('');
 var pr;
 if(hard.length)pr={w:'Ignored',cls:'unk',t:'Price is ignored while a hard stop is open.'};
 else if(need)pr={w:'Add phone and price',cls:'unk',t:'Type the model and asking price above.'};
 else if(!e.ok)pr={w:'Not enough data',cls:'unk',t:'Not enough data to estimate. '+e.why};
 else pr={w:fit.pl,cls:fit.cls,t:fit.t,r:'<p class="amt">'+inr(e.buy[0])+' to '+inr(e.buy[1])+'</p><small>Your offer range (sample data)</small>'};
 var est_='';
 if(need)est_='<p>Add the phone model and asking price to see the ranges.</p>';
 else if(e.ok){est_='<div class="rg2"><div><h4>Seller market range</h4><p class="amt">'+inr(e.sell[0])+' to '+inr(e.sell[1])+'</p><small>What phones like this sold for. Not this seller’s minimum, which nobody can know.</small></div><div><h4>Your offer range</h4><p class="amt">'+inr(e.buy[0])+' to '+inr(e.buy[1])+'</p><small>Where to start and stop when you negotiate.'+(e.unk?' Widened '+e.unk*4+'% because '+e.unk+' detail'+(e.unk>1?'s are':' is')+' unknown.':'')+'</small></div></div>'}
 else if(!e.ok)est_='<p class="amt">Not enough data to estimate</p><p>'+e.why+(e.nAsk?' Asking prices ('+e.nAsk+') are not used on their own.':'')+'</p>';
 var prov='<dl class="prov"><dt>Source</dt><dd>Sample dataset, invented for this prototype. No live source is connected.</dd><dt>Date</dt><dd>'+DATE+'</dd><dt>Comparables</dt><dd>'+(e.nSold!=null?e.nSold+' completed sales (sample)'+(e.nAsk?' and '+e.nAsk+' asking prices, '+(e.ok?'median '+inr(e.askMed)+', shown for reference and not used':'not used')+'.':''):'none')+'</dd><dt>Market</dt><dd>India, not city-specific. You chose '+ST.loc+'.</dd><dt>Price type</dt><dd>Completed sales. Asking prices are kept separate.</dd></dl>';
 var how='<details><summary>How we got this range</summary><ol class="how"><li>Take the 25th, 50th and 75th percentile of completed sales for '+mname()+' '+ST.sto+' GB'+(e.ok?': '+inr(e.base[0])+', '+inr(e.base[1])+', '+inr(e.base[2])+'.':'.')+'</li>'+(e.ok?'<li>Multiply by adjustments: '+e.fa.map(function(x){return x[0]+' ×'+x[1][2]}).join(', ')+', accessories ×'+e.accF+'. Together ×'+e.f.toFixed(2)+'.</li><li>Seller range is the adjusted 25th to 75th. Offer range is the adjusted 25th to median, lowered 4% for each unknown detail.</li>':'')+'<li>No AI sets any rupee value. A language model may only reword this explanation.</li></ol></details>';
 var known='<section class="card"><h3>What we know</h3><ul class="cl">'+[
  ['Model and storage',mname()?mname()+' '+ST.sto+' GB':'Not given',mname()?['s','Seller said']:['u','Not given']],['Asking price',ST.ask?inr(ST.ask):'Not given',ST.ask?['s','Seller said']:['u','Not given']],['Age',opt('age',ST.age)[1],T('age')],
  ['Condition',opt('cond',ST.cond)[1],T('cond')],['Battery',PC.RES[7]==='prob'?'Problem found in check 7':opt('batt',ST.batt)[1],PC.RES[7]==='prob'?['b','You checked']:ST.batt==='unk'?['u','Not checked']:T('batt')],['Repairs',PC.RES[8]==='prob'?'Problem found in check 8':opt('rep',ST.rep)[1],PC.RES[8]==='prob'?['b','You checked']:ST.rep==='unk'?['u','Not checked']:T('rep')]
 ].map(function(x){return '<li><b>'+x[0]+':</b> '+x[1]+' '+tag(x[2])+'</li>'}).join('')+CH.map(function(c){var v=PC.RES[c.n];return '<li><b>'+HARD[c.n]+':</b> '+(v==='ok'?'OK':v==='prob'?'Problem':'Not checked')+' '+tag(v?['b','You checked']:['u','Not checked'])+'</li>'}).join('')+[4,5,6,9].filter(function(n){return PC.RES[n]==='prob'}).map(function(n){return '<li><b>'+PC.C[n-1][0]+':</b> Problem '+tag(['b','You checked'])+'</li>'}).join('')+'<li><b>Official verification:</b> none. No IMEI, finance or lock check is connected. '+tag(['u','Not verified'])+'</li></ul></section>';
 var msg='';
 if(!hard.length&&unk.length)msg='<section class="card msg"><h3>Next step</h3><p>Finish the safety checks first: '+unk.map(function(n){return TODO[n]}).join(', ')+'. Then make your offer.</p></section>';
 else if(!hard.length&&e.ok&&!need){var off=e.buy[1];msg='<section class="card msg"><h3>Your message to the seller</h3><p id="msgT">'+(fit.k==='fair'?'Hi, I would like to buy your '+mname()+' for '+inr(Math.min(ST.ask,off))+'. Can we meet in daylight at a shop so I can check it before I pay?':'Hi, I am interested in your '+mname()+'. Would you take '+inr(off)+'? I will check it in person before I pay.')+'</p><small>The offer comes from the sample range, not from the seller’s minimum.</small><button class="btn" id="copy" type="button">Copy message</button></section>'}
 else if(hard.length)msg='<section class="card msg"><h3>Next step</h3><p>Do not pay. Tell the seller you are leaving. If you already paid, call 1930.</p></section>';
 $('pout').innerHTML='<div class="v-all"><div class="plate xl '+ov.cls+'"><span>'+ov.w+'</span></div><p>'+ov.t+'</p></div>'+
 '<div class="two"><section class="card c-dev '+dev.cls+'"><h3>Device check</h3><div class="plate '+dev.cls+'"><span>'+dev.w+'</span></div><p>'+dev.t+'</p></section>'+
 '<section class="card c-pr '+(hard.length?'dim':'')+'"><h3>Price fit</h3><div class="plate '+pr.cls+'"><span>'+pr.w+'</span></div><p>'+pr.t+'</p>'+(pr.r&&!hard.length?pr.r:'')+'</section></div>'+msg+
 '<details class="more more2"><summary>How we got this: ranges, sources and what we know</summary><section class="est card"><h3>Estimated ranges <span class="tg d">Sample data</span></h3>'+est_+prov+how+'</section>'+known+'</details>'+
 '<div class="fb" id="fb"><span>Was this clear?</span><button class="ibtn" data-v="1" type="button"><svg class="i" aria-hidden="true"><use href="#i-up"/></svg>Yes</button><button class="ibtn" data-v="0" type="button"><svg class="i" aria-hidden="true"><use href="#i-down"/></svg>No</button></div>';
 var done=CH.filter(function(c){return PC.RES[c.n]==='ok'||PC.RES[c.n]==='prob'}).length,ch=$('chkHint');if(ch)ch.innerHTML=done+' of 4 safety checks done. They come from the steps above. <a href="#how">Go to the checks</a>';
 var sm=$('stSum');if(sm){sm.className='st-sum '+ov.cls;sm.innerHTML='<span class="st-sum-w">'+ov.w+'</span><span class="st-sum-t">'+ov.t.split('. ')[0].replace(/\.$/,'')+'.</span><a class="lnk2" href="#pout">See full report</a>'}
 saveST();announce('Result: '+ov.w+'. '+ov.t.split('. ')[0]);
 var vb=$('vbar');vb.className='vbar'+(ov.cls==='stop'?' stop':'');vb.innerHTML='<span class="vw">'+ov.w+'</span><span class="vt">'+ov.t.split('. ')[0].replace(/\.$/,'')+'</span><a href="#pout">Details</a>';
 sliderText()}

/* events */
var form=$('pform');
form.addEventListener('change',function(e){var t=e.target,n=t.name;
 if(t.id==='fModel'||t.id==='fLoc')return;
 if(n==='sto')ST.sto=t.value;
 else if(n==='acc')ST.acc=$$('input[name=acc]:checked',form).map(function(i){return i.value});
 else if(n&&n.indexOf('src_')===0){ST.src[n.slice(4)]=t.value;ST.t[n.slice(4)]=1}
 else if(n&&n.indexOf('chk')===0){PC.RES[+n.slice(3)]=t.value;PC.syncRes&&PC.syncRes()}
 else if(n){ST[n]=t.value;ST.t[n]=1}
 if(n==='sto')range();
 render()});
form.addEventListener('input',function(e){var t=e.target;if(t.id==='fModel'){setModel(t.value);return}if(t.id==='fLoc'){ST.loc=t.value.trim()||'Not given';render();return}
 if(t.id==='askN'){ST.ask=Math.max(0,Math.round(+t.value)||0);var r=$('askR');if(r)r.value=ST.ask;render()}
 else if(t.id==='askR'){ST.ask=+t.value;$('askN').value=ST.ask;render()}});
/* typing a battery or repair value is a buyer check only if the buyer says so; default stays seller-stated */
$('pout').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.id==='copy'){var t=$('msgT').textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='Copied'},function(){b.textContent='Select the text to copy'})}
 else if(b.dataset.v!=null)$('fb').innerHTML='<span>'+(b.dataset.v==='1'?'Thanks. Glad it was clear.':'Thanks. We will make this plainer.')+' (Kept on this page only.)</span>'});
form.addEventListener('click',function(e){if(e.target.id!=='lstB')return;var t=$('lst').value,m=$('lstM');
 if(/(^|\D)\d(?:[ -]?\d){14}(?!\d)/.test(t)){m.textContent='That looks like an IMEI. Remove it and try again. IMEI never goes into this form.';return}
 var got=[],low=t.toLowerCase(),md=Object.keys(COMPS).filter(function(k){return low.indexOf(k.toLowerCase())>-1})[0];
 if(md){ST.model=md;ST.modelText=md;got.push('model')}
 var g=t.match(/(\d{2,3})\s?gb/i);if(g&&COMPS[ST.model]&&COMPS[ST.model][g[1]]){ST.sto=g[1];got.push('storage')}
 var p=t.match(/(?:₹|rs\.?|inr)\s?([\d,]{4,7})/i);if(p){ST.ask=+p[1].replace(/,/g,'');got.push('price')}
 var b=t.match(/(\d{2,3})\s?%/);if(b){ST.batt=+b[1]>=90?'b90':+b[1]>=80?'b80':'b79';ST.src.batt='s';got.push('battery')}
 build();render();$('lstM').textContent=got.length?'Filled: '+got.join(', ')+'. All marked Seller said. Check each one yourself.':'Could not find a model, price or battery in that text. Fill the form by hand.'});
/* shared check state with the Check 2 screen */
PC.onRes=function(){$$('input[name^=chk]',form).forEach(function(i){i.checked=i.value===(PC.RES[+i.name.slice(3)]||'unk')});render()};
PC.syncRes=function(){PC.onChecks&&PC.onChecks()};
/* scenarios: chosen sample loads its own result */
function clearRes(){for(var i=1;i<=10;i++)delete PC.RES[i]}
function load(k,quiet){var p=PRE[k];PC.sample=true;clearRes();ST.t={};ST.model=ST.modelText='iPhone 13';ST.sto='128';ST.ask=p.ask;ST.age='y12';ST.cond='good';ST.batt='b80';ST.rep='none';ST.acc=['Charger'];
 PC.RES[1]='ok';PC.RES[2]=p.lock;PC.RES[3]='ok';PC.RES[10]='ok';
 /* match the hero phone: battery and screen were checked in the fair and costly samples */
 if(k!=='lock'){PC.RES[4]=PC.RES[7]='ok';ST.src={cond:'s',batt:'b',rep:'s'};ST.t={batt:1}}
 build();render();
 $('scnNote').textContent='Sample loaded: '+NAMES[k]+'. '+lastAnn;$$('#exs button').forEach(function(b){b.setAttribute('aria-checked',b.dataset.s===k)});PC.syncRes()}
PC.loadScn=function(k){PC.openReport();load(k)};
PC.openReport=function(){var t=$('try');if(!t.hidden)return;t.hidden=false;
 /* one reveal, the first time the report is on screen: the stripe draws across, the verdict rises in */
 if(!PC.RM&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){t.classList.add('in');io.disconnect();setTimeout(function(){t.classList.remove('in')},900)}},{threshold:.15});io.observe(t)}};
document.addEventListener('click',function(e){if(e.target.closest('a[href="#try"],a[href="#pout"]'))PC.openReport()});
PC.restoreOwn=function(){clearRes();try{var r=JSON.parse(localStorage.getItem('pc-res')||'{}');Object.keys(r).forEach(function(k){PC.RES[k]=r[k]})}catch(e){}
 Object.assign(ST,JSON.parse(ST0));try{var s1=JSON.parse(localStorage.getItem(KS)||'null');if(s1)Object.assign(ST,s1)}catch(e){}
 PC.sample=false;$$('#exs button').forEach(function(x){x.setAttribute('aria-checked','false')});build();hint();render();$('scnNote').textContent='Back to your own check. '+lastAnn;PC.syncRes()};
PC.resetPrice=function(){Object.assign(ST,JSON.parse(ST0));try{localStorage.removeItem(KS)}catch(e){}build();hint();render()};
PC.pickModel=function(v){PC.openReport();ST.modelText=v.trim()||ST.modelText;ST.model=match(v)||'Other model';build();hint();render();var f=$('fModel');if(f)f.focus()};
$('exs').innerHTML=['fair','dear','lock'].map(function(k){return '<button class="chip ex" type="button" data-s="'+k+'" aria-checked="false">'+NAMES[k]+'</button>'}).join('')+'<button class="chip ex" type="button" data-s="nodata" aria-checked="false">Not enough data</button>';
$('exs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;PC.openReport();if(b.dataset.s==='nodata'){PC.sample=true;clearRes();ST.model=ST.modelText='Pixel 6a';ST.sto='128';ST.ask=15000;PC.RES[1]=PC.RES[2]=PC.RES[3]=PC.RES[10]='ok';build();render();$('scnNote').textContent='Sample loaded: not enough data. '+lastAnn;$$('#exs button').forEach(function(x){x.setAttribute('aria-checked',x===b)});PC.syncRes()}else load(b.dataset.s)});
PC.rg($('exs'));
var inTry=false,inOut=false;function vis(){$('vbar').hidden=!(inTry&&!inOut&&innerWidth<1000)}
new IntersectionObserver(function(e){inTry=e[0].isIntersecting;vis()}).observe($('try'));
new IntersectionObserver(function(e){inOut=e[0].isIntersecting;vis()},{threshold:.25}).observe($('pout'));addEventListener('resize',vis);
/* initial state: the report stays closed until the buyer starts, unless they already have saved answers */
build();hint();render();if(Object.keys(PC.RES).length||ST.modelText)PC.openReport();
})();
