
(() => {
  const $ = id => document.getElementById(id);
  const screens = ["home-screen","briefing-screen","office-screen","investigation-screen"];
  const show = id => screens.forEach(s => $(s).classList.toggle("hidden",s!==id));
  const modal = $("files-modal");
  $("start-case").addEventListener("click",()=>show("briefing-screen"));
  $("back-home").addEventListener("click",()=>show("home-screen"));
  $("enter-office").addEventListener("click",()=>show("office-screen"));
  $("back-briefing").addEventListener("click",()=>show("briefing-screen"));
  $("open-investigation").addEventListener("click",()=>{show("investigation-screen");startAmbience();});
  $("leave-investigation").addEventListener("click",()=>show("office-screen"));
  $("open-files").addEventListener("click",()=>modal.classList.remove("hidden"));
  $("close-files").addEventListener("click",()=>modal.classList.add("hidden"));
  modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")modal.classList.add("hidden")});

  const evidence={
    cup:{title:"فنجان القهوة",number:"01 / TRACE EVIDENCE",description:"فنجان خزفي تُرك على الطرف الأيسر من المكتب. بقيت آثار سائل داكن في قاعه، ولا يظهر من النظرة الأولى إن كان قد شُرب قبل المواجهة أم بعدها. حافته سليمة ولا توجد شظايا حوله.",caution:"ما يمكن إثباته الآن: وجود الفنجان في المكان. البصمات، إن استُخرجت، تثبت ملامسة شخص له في وقت غير محدد؛ لا تثبت وجوده ساعة الوفاة."},
    phone:{title:"هاتف سليم",number:"02 / DIGITAL EVIDENCE",description:"هاتف ذكي أسود، شاشته مطفأة ومقفلة برمز من أربعة أرقام. لا توجد معاينة للرسائل أو سجل المكالمات قبل فتحه. موضعه على المكتب لا يخبرنا من استخدمه آخر مرة.",caution:"الهاتف يحتاج إلى حل الرمز من قرائن أخرى. لن نختلق محتوى غير متاح، ولن نعتبر ملكية الهاتف دليلاً على آخر من لمسه."},
    paper:{title:"أوراق على المكتب",number:"03 / DOCUMENT TRACE",description:"ورقتان فوق حافظة جلدية. إحداهما تحمل أرقاماً مكتوبة بخط اليد، والأخرى ممزقة من طرفها. لا تكفي المعاينة الحالية لترتيب الأرقام أو استعادة الجزء المفقود.",caution:"وجود كتابة بخط سليم لا يحدد متى كُتبت. سنحتاج إلى مقارنة الأرقام بملفات الشركة قبل استنتاج معناها."},
    clock:{title:"ساعة الحائط",number:"04 / SCENE DETAIL",description:"ساعة حائط دائرية متوقفة عند 01:40. لا نعرف إن كانت توقفت بسبب عطل أو صدمة أو نفاد البطارية. لا يوجد حتى الآن ما يثبت أنها ضُبطت على الوقت الصحيح.",caution:"01:40 ليست وقت وفاة مؤكداً. يجب مقارنتها بالتسجيلات وسجلات الحركة والتقدير الطبي."}
  };
  const key="thecase-case01-evidence";
  let collected=[];try{collected=JSON.parse(localStorage.getItem(key)||"[]").filter(id=>evidence[id])}catch(_){}
  let selected=null;
  const empty=$("inspection-empty"),details=$("inspection-details"),list=$("collected-items");
  function render(){
    $("evidence-count").textContent=collected.length+" / 4";
    $("progress-fill").style.width=(collected.length*25)+"%";
    $("collected-label").textContent=collected.length+" / 4";
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
    $("detail-number").textContent=item.number;$("detail-title").textContent=item.title;
    $("detail-description").textContent=item.description;$("detail-caution").textContent=item.caution;
    const done=collected.includes(id);$("collect-evidence").disabled=done;
    $("collect-evidence").textContent=done?"✓ موثّق في ملف القضية":"＋ توثيق في ملف القضية";
    document.querySelectorAll(".scene-object").forEach(btn=>btn.classList.toggle("selected",btn.dataset.evidence===id));
  }
  document.querySelectorAll(".scene-object").forEach(btn=>btn.addEventListener("click",()=>inspect(btn.dataset.evidence)));
  $("collect-evidence").addEventListener("click",()=>{
    if(!selected||collected.includes(selected))return;
    collected.push(selected);localStorage.setItem(key,JSON.stringify(collected));render();inspect(selected);
  });
  render();

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
