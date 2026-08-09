(()=>{
const cfg=window.FORMAL_INVITE_CONFIG||{},endpoint=cfg.FORM_ENDPOINT||'',owner=cfg.YOUR_NAME||'Ali';
const state={answer:null,transport:null,pickupTime:null,pickupAddress:null};

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const t=document.getElementById(id);
  if(t){
    t.classList.add('active');
    scrollTo({top:0,behavior:'smooth'});
  }
}

document.querySelectorAll('[data-next]').forEach(b=>{
  b.addEventListener('click',()=>showScreen(b.dataset.next));
});

const ready=()=>endpoint.startsWith('https://formspree.io/f/');

async function sendEmail(payload){
  if(!ready()){
    console.info('Formspree not configured',payload);
    return {configured:false,ok:false};
  }
  try{
    const r=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({...payload,invite_owner:owner,sent_at:new Date().toISOString()}),
      keepalive:true
    });
    return {configured:true,ok:r.ok};
  }catch(e){
    return {configured:true,ok:false};
  }
}

// Formal Yes / No flow
const yes=document.getElementById('yesBtn');
const no=document.getElementById('noBtn');
const msg=document.getElementById('noMessage');
const questionBear=document.getElementById('questionBear');

let clicks=0;
let noMoveTimer=null;
let runawayActive=false;

const msgs=[
  'I wanted to ask you properly ♡',
  'Are you sureee? 🥺',
  'Still no? 😭',
  'Okay okay… I’m still hoping for a yes 🥹',
  'Maybe just one little yes? 💗',
  'At this point, even the bear is rooting for a yes 😭🧸💗'
];

function moveNoAround(){
  if(!no || !runawayActive) return;

  const rect=no.getBoundingClientRect();
  const margin=18;
  const maxLeft=Math.max(margin,window.innerWidth-rect.width-margin);
  const maxTop=Math.max(90,window.innerHeight-rect.height-90);

  const left=margin+Math.random()*Math.max(1,maxLeft-margin);
  const top=90+Math.random()*Math.max(1,maxTop-90);

  no.style.left=`${left}px`;
  no.style.top=`${top}px`;
}

function startRunawayNo(){
  if(!no || runawayActive) return;
  runawayActive=true;
  no.classList.add('runaway-no');
  moveNoAround();

  // Fast enough to feel playful, slow enough that it is still genuinely tappable.
  noMoveTimer=setInterval(moveNoAround,650);
}

function stopRunawayNo(){
  runawayActive=false;
  if(noMoveTimer){
    clearInterval(noMoveTimer);
    noMoveTimer=null;
  }
  if(no){
    no.classList.remove('runaway-no');
    no.classList.add('no-stopped');
    no.style.left='';
    no.style.top='';
  }
}

if(no&&yes){
  no.addEventListener('click',async()=>{
    clicks++;

    // Taps 1–3: normal playful shrinking.
    if(clicks<=3){
      no.style.setProperty('--no-scale',String(Math.max(.82,1-clicks*.06)));
      yes.style.transform=`scale(${1+clicks*.055})`;
      if(msg) msg.textContent=msgs[clicks];
      return;
    }

    // 4th tap: crying bear + moving No begins.
    if(clicks===4){
      if(questionBear) questionBear.classList.add('crying');
      no.style.setProperty('--no-scale','.76');
      yes.style.transform='scale(1.22)';
      if(msg) msg.textContent=msgs[4];
      startRunawayNo();
      return;
    }

    // 5th tap: smaller again and keep running around.
    if(clicks===5){
      if(questionBear) questionBear.classList.add('crying');
      no.style.setProperty('--no-scale','.68');
      yes.style.transform='scale(1.28)';
      if(msg) msg.textContent=msgs[5];
      moveNoAround();
      return;
    }

    // 6th tap: No stops moving and becomes the real answer.
    stopRunawayNo();
    no.style.setProperty('--no-scale','.68');
    state.answer='NO';
    showScreen('noFinalScreen');

    const status=document.getElementById('noSendStatus');
    if(status) status.textContent='Saving your answer...';

    const r=await sendEmail({
      event:'FORMAL_INVITE_DECLINED',
      answer:'NO',
      message:'She chose No after the playful invitation sequence.'
    });

    if(status){
      status.textContent=!r.configured
        ?"Preview mode: email notifications aren't connected yet."
        :r.ok
          ?'Sent ✓'
          :'Her answer was selected, but the email could not be sent.';
    }
  });

  // Extra evasive movement while in runaway mode.
  no.addEventListener('pointerenter',()=>{
    if(runawayActive) moveNoAround();
  });

  no.addEventListener('touchstart',()=>{
    if(runawayActive && Math.random()<0.35) moveNoAround();
  },{passive:true});

  yes.addEventListener('click',()=>{
    stopRunawayNo();
    state.answer='YES';
    sendEmail({
      event:'FORMAL_INVITE_ACCEPTED',
      answer:'YES 💗',
      message:'She clicked YES on the Formal invitation.'
    });
    showScreen('yesScreen');
  });
}

// Transport flow
const pickupOption=document.getElementById('pickupOption');
if(pickupOption){
  pickupOption.addEventListener('click',()=>{
    state.transport='PICKUP';
    showScreen('timeScreen');
  });
}

const ownWayOption=document.getElementById('ownWayOption');
if(ownWayOption){
  ownWayOption.addEventListener('click',async()=>{
    state.transport='OWN_WAY';
    showScreen('ownWayCompleteScreen');

    const s=document.getElementById('ownWaySendStatus');
    if(s) s.textContent='Saving your answer...';

    const r=await sendEmail({
      event:'FORMAL_FINAL_RESPONSE',
      answer:'YES 💗',
      transport:"I'll make my own way there",
      pickup_time:'Not required',
      pickup_address:'Not required',
      message:'She said YES and will make her own way to Formal.'
    });

    if(s){
      s.textContent=!r.configured
        ?"Preview mode: email notifications aren't connected yet."
        :r.ok
          ?'Sent ✓'
          :'The answer was selected, but the email could not be sent.';
    }
  });
}

function pretty(v){
  const[h,m]=v.split(':').map(Number),d=new Date();
  d.setHours(h,m,0,0);
  return d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
}

// Time
const time=document.getElementById('pickupTime');
const timeBtn=document.getElementById('timeNextBtn');
const timeVal=document.getElementById('timeValidation');

if(timeBtn&&time){
  timeBtn.addEventListener('click',()=>{
    if(!time.value){
      if(timeVal) timeVal.textContent='Choose a time first 💗';
      time.focus();
      return;
    }
    state.pickupTime=pretty(time.value);
    if(timeVal) timeVal.textContent='';
    showScreen('addressScreen');
  });
}

// Address
const addr=document.getElementById('pickupAddress');
const addrBtn=document.getElementById('addressSubmitBtn');
const addrVal=document.getElementById('addressValidation');

if(addrBtn&&addr){
  addrBtn.addEventListener('click',async()=>{
    const a=addr.value.trim();

    if(a.length<3){
      if(addrVal) addrVal.textContent='Add the pick-up place first 💗';
      addr.focus();
      return;
    }

    state.pickupAddress=a;
    if(addrVal) addrVal.textContent='';
    addrBtn.disabled=true;
    addrBtn.textContent='Sending... 💗';

    const sumTime=document.getElementById('summaryTime');
    const sumAddr=document.getElementById('summaryAddress');
    if(sumTime) sumTime.textContent=state.pickupTime||'—';
    if(sumAddr) sumAddr.textContent=state.pickupAddress||'—';

    showScreen('pickupCompleteScreen');

    const s=document.getElementById('pickupSendStatus');
    if(s) s.textContent='Saving your answer...';

    const r=await sendEmail({
      event:'FORMAL_FINAL_RESPONSE',
      answer:'YES 💗',
      transport:'Pick me up',
      pickup_time:state.pickupTime,
      pickup_address:state.pickupAddress,
      message:`She said YES. Pick-up time: ${state.pickupTime}. Pick-up from: ${state.pickupAddress}.`
    });

    if(s){
      s.textContent=!r.configured
        ?"Preview mode: email notifications aren't connected yet."
        :r.ok
          ?'Sent ✓'
          :'Details selected, but the email could not be sent.';
    }
  });
}
})();