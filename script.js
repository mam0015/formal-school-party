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
const msgs=[
  'I wanted to ask you properly ♡',
  'Are you sureee? 🥺',
  'Still no? 😭',
  'Okay okay… I’m still hoping for a yes 🥹',
  'Maybe just one little yes? 💗',
  'At this point, even the bear is rooting for a yes 😭🧸💗'
];

if(no&&yes){
  no.addEventListener('click',async()=>{
    clicks++;

    // Clicks 1–5 are playful
    if(clicks<=5){
      no.style.transform=`scale(${Math.max(.62,1-clicks*.075)})`;
      yes.style.transform=`scale(${1+Math.min(clicks*.055,.30)})`;

      if(msg){
        msg.textContent=msgs[Math.min(clicks,msgs.length-1)];
      }

      // On the 5th No tap, turn the bear into the crying bear
      if(questionBear&&clicks>=5){
        questionBear.classList.add('crying');
      }
      return;
    }

    // Click 6+ is treated as the final real No
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

  yes.addEventListener('click',()=>{
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