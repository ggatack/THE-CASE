
(() => {
  const $ = id => document.getElementById(id);
  const screens = ["home-screen","briefing-screen","office-screen","investigation-screen","evidence-board-screen","interview-screen"];
  const show = id => screens.forEach(s => $(s).classList.toggle("hidden",s!==id));
  const modal = $("files-modal");
  $("start-case").addEventListener("click",()=>show("briefing-screen"));
  $("back-home").addEventListener("click",()=>show("home-screen"));
  $("enter-office").addEventListener("click",()=>show("office-screen"));
  $("leave-interview").addEventListener("click",()=>show("office-screen"));
  $("open-interview").addEventListener("click",()=>{renderInterview();show("interview-screen")});

  $("back-briefing").addEventListener("click",()=>show("briefing-screen"));
  $("open-investigation").addEventListener("click",()=>{show("investigation-screen");startAmbience();});
  $("leave-investigation").addEventListener("click",()=>show("office-screen"));
  $("leave-board").addEventListener("click",()=>show("office-screen"));
  $("open-board").addEventListener("click",()=>{renderBoard();show("evidence-board-screen")});
  $("open-board-from-scene").addEventListener("click",()=>{renderBoard();show("evidence-board-screen")});
  $("open-files").addEventListener("click",()=>modal.classList.remove("hidden"));
  $("close-files").addEventListener("click",()=>modal.classList.add("hidden"));
  modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")modal.classList.add("hidden")});

  const evidence={
    cup:{title:"فنجان القهوة",number:"01 / TRACE EVIDENCE",description:"فنجان خزفي تُرك على الطرف الأيسر من المكتب. بقيت آثار سائل داكن في قاعه، ولا يظهر من النظرة الأولى إن كان قد شُرب قبل المواجهة أم بعدها. حافته سليمة ولا توجد شظايا حوله.",caution:"ما يمكن إثباته الآن: وجود الفنجان في المكان. البصمات، إن استُخرجت، تثبت ملامسة شخص له في وقت غير محدد؛ لا تثبت وجوده ساعة الوفاة."},
    phone:{title:"هاتف سليم",number:"02 / DIGITAL EVIDENCE",description:"هاتف ذكي أسود عُثر عليه فوق المكتب. بعد تجاوز القفل، أمكن استعادة معاينات رسائل وسجل مكالمات جزئي من ذاكرته المحلية.",caution:"محتويات الهاتف تسجل أسماء محفوظة وتوقيتات محلية، لا هوية مؤكدة للشخص الذي استخدم الجهاز أو التحويلة. يلزم corroboration من سجلات مستقلة."},
    "phone-data":{title:"محتويات الهاتف",number:"05 / DIGITAL FORENSICS",description:"استُعيدت أربع معاينات رسائل وثلاثة سجلات مكالمات. يظهر تواصل مع مازن، ورسالة من تحويلة داخلية 204 عند 01:28، ومكالمة واردة من التحويلة نفسها عند 01:32.",caution:"هذه سجلات محلية جزئية. اسم جهة الاتصال ليس إثبات هوية، والتحويلة قد يستخدمها أكثر من شخص. كما أن وقت الجهاز قابل للتعديل ولا يثبت وحده ترتيب الأحداث."},
    paper:{title:"أوراق على المكتب",number:"03 / DOCUMENT TRACE",description:"ورقتان فوق حافظة جلدية. إحداهما تحمل أرقاماً مكتوبة بخط اليد، والأخرى ممزقة من طرفها. لا تكفي المعاينة الحالية لترتيب الأرقام أو استعادة الجزء المفقود.",caution:"وجود كتابة بخط سليم لا يحدد متى كُتبت. سنحتاج إلى مقارنة الأرقام بملفات الشركة قبل استنتاج معناها."},
    clock:{title:"ساعة الحائط",number:"04 / SCENE DETAIL",description:"ساعة حائط دائرية متوقفة عند 01:40. لا نعرف إن كانت توقفت بسبب عطل أو صدمة أو نفاد البطارية. لا يوجد حتى الآن ما يثبت أنها ضُبطت على الوقت الصحيح.",caution:"01:40 ليست وقت وفاة مؤكداً. يجب مقارنتها بالتسجيلات وسجلات الحركة والتقدير الطبي."}
  };
  const key="thecase-case01-evidence";
  let collected=[];try{collected=JSON.parse(localStorage.getItem(key)||"[]").filter(id=>evidence[id])}catch(_){}
  let selected=null;
  const empty=$("inspection-empty"),details=$("inspection-details"),list=$("collected-items");
  function render(){
    const total=Object.keys(evidence).length;
    $("evidence-count").textContent=collected.length+" / "+total;
    $("progress-fill").style.width=(collected.length*100/total)+"%";
    $("collected-label").textContent=collected.length+" / "+total;
    list.innerHTML="";
    collected.forEach(id=>{const li=document.createElement("li");li.textContent=evidence[id].title;list.appendChild(li)});
    document.querySelectorAll(".scene-object").forEach(btn=>{
      const done=collected.includes(btn.dataset.evidence);
      btn.classList.toggle("collected",done);
      btn.querySelector("span").textContent=done?"✓":String(Object.keys(evidence).indexOf(btn.dataset.evidence)+1).padStart(2,"0");
    });
  }
  function inspect(id){
    selected=id;const item=evidence[id];empty.classList.add("hidden");details.classList.remove("hidden");
    // Inspecting a scene hotspot records it automatically; no hidden second step.
    if(!collected.includes(id)){
      collected.push(id);
      localStorage.setItem(key,JSON.stringify(collected));
      render();
      renderBoard();
    }
    $("detail-number").textContent=item.number;$("detail-title").textContent=item.title;
    $("detail-description").textContent=item.description;$("detail-caution").textContent=item.caution;
    $("collect-evidence").disabled=true;
    $("collect-evidence").textContent="✓ تمت إضافة الدليل إلى ملف القضية";
    document.querySelectorAll(".scene-object").forEach(btn=>btn.classList.toggle("selected",btn.dataset.evidence===id));
    $("phone-puzzle").classList.toggle("hidden",id!=="phone");
    if(id==="phone")renderPhonePuzzle();
  }
  document.querySelectorAll(".scene-object").forEach(btn=>btn.addEventListener("click",()=>inspect(btn.dataset.evidence)));
  $("collect-evidence").addEventListener("click",()=>{if(selected)inspect(selected)});
  render();

  // Phone puzzle: the player combines the floor number with the date reference.
  const phoneCode="0714",phoneKey="thecase-case01-phone-open";
  let phoneDigits="";
  let phoneOpened=localStorage.getItem(phoneKey)==="yes";
  function renderPhoneCode(){
    const display=$("phone-code-display");
    display.setAttribute("dir","ltr");
    display.style.direction="ltr";
    display.style.unicodeBidi="isolate";
    display.textContent="\u2066"+phoneDigits.padEnd(4,"_").split("").join(" ")+"\u2069";
  }
  function renderPhonePuzzle(){
    const ready=collected.includes("paper")&&collected.includes("clock");
    if(phoneOpened&&!collected.includes("phone-data")){
      collected.push("phone-data");localStorage.setItem(key,JSON.stringify(collected));render();renderBoard();
    }
    $("phone-puzzle-intro").textContent=phoneOpened?"تم تجاوز قفل الجهاز. عُثر على مسودة محفوظة محلياً.":ready?"القرائن اللازمة أصبحت متاحة. اقرأها ثم أدخل الرمز المكوّن من أربعة أرقام.":"لفتح الهاتف، وثّق أولاً الأوراق والساعة؛ فهما يحملان القرائن اللازمة.";
    $("phone-clues").classList.toggle("hidden",!ready||phoneOpened);
    $("phone-keypad").classList.toggle("hidden",!ready||phoneOpened);
    $("phone-code-display").classList.toggle("hidden",!ready||phoneOpened);
    $("phone-feedback").classList.toggle("hidden",!ready||phoneOpened);
    $("phone-unlocked").classList.toggle("hidden",!phoneOpened);
    renderInterview();
    renderPhoneCode();
    $("phone-feedback").textContent="";
  }
  document.querySelectorAll("[data-phone-tab]").forEach(tab=>tab.addEventListener("click",()=>{
    const target=tab.dataset.phoneTab;
    document.querySelectorAll("[data-phone-tab]").forEach(t=>{
      const active=t===tab;t.classList.toggle("active",active);t.setAttribute("aria-selected",active?"true":"false");
    });
    $("phone-messages-panel").classList.toggle("hidden",target!=="messages");
    $("phone-calls-panel").classList.toggle("hidden",target!=="calls");
  }));
  $("phone-keypad").addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b||phoneOpened)return;
    if(b.dataset.digit!==undefined){if(phoneDigits.length<4)phoneDigits+=b.dataset.digit;}
    else if(b.dataset.action==="clear")phoneDigits="";
    else if(b.dataset.action==="enter"){
      if(phoneDigits.length!==4){$("phone-feedback").textContent="أدخل أربعة أرقام أولاً.";return}
      if(phoneDigits.replace(/[^0-9]/g,"")===phoneCode){
        phoneOpened=true;localStorage.setItem(phoneKey,"yes");renderPhonePuzzle();
      }else{
        $("phone-feedback").textContent="رمز غير صحيح. راجع ترتيب القرائن؛ لا توجد عقوبة على المحاولة.";
        phoneDigits="";
      }
    }
    renderPhoneCode();
  });

  // Witness interview: answers are recorded as statements, not treated as proof.
  const interviewKey="thecase-case01-mazen-interview";
  let asked=[];try{asked=JSON.parse(localStorage.getItem(interviewKey)||"[]")}catch(_){}
  const interviewAnswers={
    argument:{label:"الخلاف مع سليم",text:"«نعم، اختلفنا. كان يظن أنني أخفي عنه شيئاً. لم يكن شجاراً على المال؛ حاولت أن أقنعه أن يتوقف عن البحث وحده. خفت أن يورّط نفسه.»",note:"أقرّ بوجود خلاف، لكنه يصفه كتحذير لا كتهديد."},
    records:{label:"سجلات الصلاحيات",text:"«رأيت اختلافاً بين النسخة المطبوعة والسجل الأصلي. قلت لسليم ألا يعتمد على التقرير. لم أملك صلاحية تعديل السجلات، ولم ألمس جهازه.»",note:"يؤكد وجود اختلاف في السجلات، وينفي امتلاكه صلاحية تعديلها."},
    warning:{label:"شعور سليم بالمراقبة",text:"«كان يعتقد أن أحداً داخل الشركة يعرف متى يفتح الملفات. لم يقل لي اسماً. آخر مرة تحدثنا قال إن المشكلة من شخص يملك صلاحية الوصول، لا من شخص يراقب الباب.»",note:"يقول إن سليم اشتبه بشخص يملك صلاحيات داخلية، دون تسمية أحد."},
    timeline:{label:"وقت المغادرة",text:"«غادرت الطابق عند 01:12. كنت قد أنهيت عملي. أعرف أن سليم بقي هناك، لكنني لم أعد إلى مكتبه بعد ذلك.»",note:"إفادة مازن: غادر عند 01:12. تحتاج إلى مطابقة مستقلة مع سجل المصعد أو الكاميرات."},
    message:{label:"رسالة الهاتف 00:54",text:"«هذه رسالتي. أرسلتها لأنني اكتشفت اختلاف النسختين. أما عبارة لا تعتمد على التقرير المطبوع فكانت تحذيراً، لا اتفاقاً على إخفاء شيء. لم أكن أعرف من غيّر السجل.»",note:"طابق مازن الرسالة بنفسه، لكن ذلك لا يثبت وحده أنه لم يشارك في التلاعب."}
  };
  function renderInterview(){
    $("interview-card-state").textContent=collected.includes("phone-data")?"متاحة للمراجعة ←":"تُفتح بعد فحص الهاتف ←";
    $("open-interview").disabled=!collected.includes("phone-data");
    $("question-message").classList.toggle("hidden",!collected.includes("phone-data"));
    const host=$("interview-notes");host.innerHTML="";
    if(!asked.length){const li=document.createElement("li");li.textContent="لم تُسجّل إجابات بعد.";host.appendChild(li)}
    asked.forEach(k=>{const li=document.createElement("li");li.textContent=interviewAnswers[k].label+" — "+interviewAnswers[k].note;host.appendChild(li)});
  }
  $("dialogue-options").addEventListener("click",e=>{
    const button=e.target.closest("[data-question]");if(!button)return;
    const key=button.dataset.question,answer=interviewAnswers[key];
    if(!answer||asked.includes(key))return;
    if(key==="message"&&!collected.includes("phone-data"))return;
    $("dialogue-response").textContent=answer.text;
    $("dialogue-note").textContent="ملاحظة آدم: "+answer.note;
    asked.push(key);localStorage.setItem(interviewKey,JSON.stringify(asked));
    button.disabled=true;button.classList.add("asked");
    renderInterview();
  });
  document.querySelectorAll("[data-question]").forEach(button=>{if(asked.includes(button.dataset.question)){button.disabled=true;button.classList.add("asked")}});
  renderInterview();

  // Player-authored evidence links are hypotheses, never automatic conclusions.
  const theoryKey="thecase-case01-theories";
  let theories=[];try{theories=JSON.parse(localStorage.getItem(theoryKey)||"[]")}catch(_){}
  let pair=[];
  const boardGrid=$("board-evidence-grid"),note=$("theory-note"),saveTheory=$("save-theory");
  function renderBoard(){
    $("board-evidence-count").textContent=collected.length;
    $("board-card-state").textContent=collected.length>=2?"افتح لوحة التحليل ←":"تُفتح بعد جمع دليلين ←";
    $("board-empty").classList.toggle("hidden",collected.length>=2);
    boardGrid.innerHTML="";
    collected.forEach(id=>{
      const item=evidence[id],card=document.createElement("button");
      card.type="button";card.className="board-evidence-card"+(pair.includes(id)?" chosen":"");
      const no=String(Object.keys(evidence).indexOf(id)+1).padStart(2,"0");
      card.innerHTML='<span class="board-card-no">'+no+' / EVIDENCE</span><b></b><small>موثّق في ملف القضية</small>';
      card.querySelector("b").textContent=item.title;
      card.addEventListener("click",()=>selectBoardEvidence(id));
      boardGrid.appendChild(card);
    });
    $("slot-one").textContent=pair[0]?evidence[pair[0]].title:"لم يُحدّد";
    $("slot-two").textContent=pair[1]?evidence[pair[1]].title:"لم يُحدّد";
    saveTheory.disabled=pair.length!==2||note.value.trim().length<8;
    renderTheories();
  }
  function selectBoardEvidence(id){
    if(pair.includes(id))pair=pair.filter(x=>x!==id);
    else if(pair.length<2)pair.push(id);
    else pair=[id];
    renderBoard();
  }
  function renderTheories(){
    const host=$("theory-list");host.innerHTML="";
    $("theory-count").textContent=theories.length+" فرضيات";
    if(!theories.length){const p=document.createElement("p");p.className="no-theories";p.textContent="لم تسجّل أي روابط بعد.";host.appendChild(p);return}
    theories.forEach((t,index)=>{
      const card=document.createElement("article");card.className="theory-card";
      const head=document.createElement("div");head.className="theory-pair";
      head.textContent=evidence[t.a].title+"  ↔  "+evidence[t.b].title;
      const body=document.createElement("p");body.textContent=t.note;
      const foot=document.createElement("small");foot.textContent="فرضية اللاعب · "+(index+1);
      card.append(head,body,foot);host.appendChild(card);
    });
  }
  note.addEventListener("input",()=>{saveTheory.disabled=pair.length!==2||note.value.trim().length<8});
  saveTheory.addEventListener("click",()=>{
    if(pair.length!==2||note.value.trim().length<8)return;
    theories.push({a:pair[0],b:pair[1],note:note.value.trim(),createdAt:Date.now()});
    localStorage.setItem(theoryKey,JSON.stringify(theories));pair=[];note.value="";renderBoard();
  });
  renderBoard();

  let soundOn=localStorage.getItem("thecase-sound")!=="off",audioContext,ambienceGain,ambienceSource;
  const soundButton=$("sound-toggle");
  function renderSound(){soundButton.textContent=soundOn?"♫":"♪̸";soundButton.style.opacity=soundOn?"1":".55";}
  function startAmbience(){
    if(!soundOn||ambienceSource)return;
    try{
      audioContext ||= new(window.AudioContext||window.webkitAudioContext)();
      if(audioContext.state==="suspended")audioContext.resume();
      const length=audioContext.sampleRate*3,buffer=audioContext.createBuffer(1,length,audioContext.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*.18;
      const source=audioContext.createBufferSource(),filter=audioContext.createBiquadFilter(),gain=audioContext.createGain();
      source.buffer=buffer;source.loop=true;filter.type="lowpass";filter.frequency.value=680;gain.gain.value=.12;
      source.connect(filter);filter.connect(gain);gain.connect(audioContext.destination);source.start();
      ambienceSource=source;ambienceGain=gain;
    }catch(_){}
  }
  function stopAmbience(){if(ambienceSource){try{ambienceSource.stop()}catch(_){}ambienceSource=null;ambienceGain=null}}
  soundButton.addEventListener("click",()=>{
    soundOn=!soundOn;localStorage.setItem("thecase-sound",soundOn?"on":"off");renderSound();
    if(soundOn&& !$("investigation-screen").classList.contains("hidden"))startAmbience();else stopAmbience();
  });
  document.querySelectorAll("button").forEach(btn=>{if(btn!==soundButton)btn.addEventListener("click",()=>{
    if(!soundOn)return;
    try{audioContext ||= new(window.AudioContext||window.webkitAudioContext)();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type="sine";o.frequency.setValueAtTime(540,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(360,audioContext.currentTime+.065);g.gain.setValueAtTime(.025,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.075);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.08)}catch(_){}
  })});
  renderSound();
})();
