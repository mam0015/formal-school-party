(()=>{
const cfg=window.FORMAL_INVITE_CONFIG||{};
const endpoint=cfg.FORM_ENDPOINT||'';
const owner=cfg.YOUR_NAME||'Ali';
const invitee=cfg.INVITEE_NAME||'Formal invite recipient';

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const target=document.getElementById(id);
  if(target){
    target.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }
}

document.querySelectorAll('[data-next]').forEach(btn=>{
  btn.addEventListener('click',()=>showScreen(btn.dataset.next));
});

function formspreeReady(){
  return endpoint.startsWith('https://formspree.io/f/');
}

async function sendAnswer(answer){
  const now=new Date();
  const payload={
    event: answer==='YES' ? 'FORMAL_INVITE_ACCEPTED' : 'FORMAL_INVITE_DECLINED',
    answer,
    invitee,
    invite_owner:owner,
    answered_at_melbourne:now.toLocaleString('en-AU',{
      timeZone:'Australia/Melbourne',
      dateStyle:'full',
      timeStyle:'long'
    }),
    answered_at_iso:now.toISOString(),
    message: answer==='YES'
      ? 'She clicked YES on the Formal invitation.'
      : 'She chose NO on the Formal invitation.'
  };

  if(!formspreeReady()){
    console.info('Formspree is not configured yet:',payload);
    return {configured:false,ok:false};
  }

  try{
    const response=await fetch(endpoint,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Accept':'application/json'
      },
      body:JSON.stringify(payload),
      keepalive:true
    });
    return {configured:true,ok:response.ok};
  }catch(error){
    console.error('Formspree submission failed:',error);
    return {configured:true,ok:false};
  }
}

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
  if(!no||!runawayActive) return;
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
  if(!no||runawayActive) return;
  runawayActive=true;
  no.classList.add('runaway-no');
  moveNoAround();
  // Slower than before so the No button is still realistically tappable.
  noMoveTimer=setInterval(moveNoAround,700);
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

    if(clicks<=3){
      no.style.setProperty('--no-scale',String(Math.max(.82,1-clicks*.06)));
      yes.style.transform=`scale(${1+clicks*.055})`;
      if(msg) msg.textContent=msgs[clicks];
      return;
    }

    if(clicks===4){
      if(questionBear) questionBear.classList.add('crying');
      no.style.setProperty('--no-scale','.76');
      yes.style.transform='scale(1.22)';
      if(msg) msg.textContent=msgs[4];
      startRunawayNo();
      return;
    }

    if(clicks===5){
      if(questionBear) questionBear.classList.add('crying');
      no.style.setProperty('--no-scale','.68');
      yes.style.transform='scale(1.28)';
      if(msg) msg.textContent=msgs[5];
      moveNoAround();
      return;
    }

    // Sixth No is the real answer.
    stopRunawayNo();
    no.style.setProperty('--no-scale','.68');
    showScreen('noFinalScreen');

    const status=document.getElementById('noSendStatus');
    if(status) status.textContent='Saving your answer...';
    const result=await sendAnswer('NO');
    if(status){
      status.textContent=!result.configured
        ? 'Preview mode: notifications are not connected yet.'
        : result.ok ? 'Sent ✓' : 'Your answer was selected, but the notification failed.';
    }
  });

  yes.addEventListener('click',async()=>{
    stopRunawayNo();
    showScreen('yesScreen');

    const status=document.getElementById('yesSendStatus');
    if(status) status.textContent='Saving your answer...';
    const result=await sendAnswer('YES');
    if(status){
      status.textContent=!result.configured
        ? 'Preview mode: notifications are not connected yet.'
        : result.ok ? 'Sent ✓' : 'Your answer was selected, but the notification failed.';
    }
  });
}
})();
