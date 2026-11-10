
(() => {
  const $ = id => document.getElementById(id);
  const screens = ["home-screen","briefing-screen","office-screen","investigation-screen","evidence-board-screen","interview-screen","logs-screen","timeline-screen","archive-screen","crosscheck-screen","server-forensics-screen","layan-screen","suspect-interviews-screen","case-review-screen","case-ending-screen"];
  const show = id => {
    screens.forEach(s => $(s).classList.toggle("hidden",s!==id));
    const active=$(id);
    if(active){
      active.classList.remove("screen-enter");
      void active.offsetWidth;
      active.classList.add("screen-enter");
      window.setTimeout(()=>active.classList.remove("screen-enter"),420);
    }
  };
  const modal = $("files-modal");
  $("start-case").addEventListener("click",()=>show("briefing-screen"));
  $("back-home").addEventListener("click",()=>show("home-screen"));
  $("enter-office").addEventListener("click",()=>show("office-screen"));
  $("leave-interview").addEventListener("click",()=>show("office-screen"));
  $("open-interview").addEventListener("click",()=>{renderInterview();show("interview-screen")});
  $("leave-logs").addEventListener("click",()=>show("office-screen"));
  $("open-logs").addEventListener("click",()=>{show("logs-screen");selectLog(null)});
  $("leave-timeline").addEventListener("click",()=>show("office-screen"));
  $("open-timeline").addEventListener("click",()=>{renderTimeline();show("timeline-screen");selectTimelineEvent(null)});
  $("leave-archive").addEventListener("click",()=>show("office-screen"));
  $("leave-crosscheck").addEventListener("click",()=>show("office-screen"));
  $("leave-server-forensics").addEventListener("click",()=>show("office-screen"));
  $("leave-layan").addEventListener("click",()=>show("office-screen"));
  $("open-layan-interview").addEventListener("click",()=>{renderLayanInterview();show("layan-screen")});
  $("open-server-forensics").addEventListener("click",()=>{renderServerForensics();show("server-forensics-screen");selectForensic(null)});
  $("open-crosscheck").addEventListener("click",()=>{renderCrosscheck();show("crosscheck-screen");resetCrosscheck()});
  $("open-archive").addEventListener("click",()=>{renderArchive();show("archive-screen");selectArchiveDoc(null)});

  $("back-briefing").addEventListener("click",()=>show("briefing-screen"));
  $("open-investigation").addEventListener("click",()=>{show("investigation-screen");startAmbience();});
  $("leave-investigation").addEventListener("click",()=>show("office-screen"));
  $("leave-board").addEventListener("click",()=>show("office-screen"));
  $("open-board").addEventListener("click",()=>{renderBoard();show("evidence-board-screen")});
  $("open-board-from-scene").addEventListener("click",()=>{renderBoard();show("evidence-board-screen")});
  $("open-files").addEventListener("click",()=>modal.classList.remove("hidden"));
  $("home-settings").addEventListener("click",()=>alert("الإعدادات — سيتم تخصيصها لاحقاً."));
  $("home-exit").addEventListener("click",()=>{if(confirm("هل تريد مغادرة اللعبة؟")){window.location.href="about:blank";}});
  $("close-files").addEventListener("click",()=>modal.classList.add("hidden"));
  $("select-case-001").addEventListener("click",()=>{modal.classList.add("hidden");$("start-case").click();});
  modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")modal.classList.add("hidden")});

  const evidence={
    cup:{title:"فنجان القهوة",number:"01 / TRACE EVIDENCE",description:"فنجان خزفي تُرك على الطرف الأيسر من المكتب. بقيت آثار سائل داكن في قاعه، ولا يظهر من النظرة الأولى إن كان قد شُرب قبل المواجهة أم بعدها. حافته سليمة ولا توجد شظايا حوله.",caution:"ما يمكن إثباته الآن: وجود الفنجان في المكان. البصمات، إن استُخرجت، تثبت ملامسة شخص له في وقت غير محدد؛ لا تثبت وجوده ساعة الوفاة."},
    phone:{title:"هاتف سليم",number:"02 / DIGITAL EVIDENCE",description:"هاتف ذكي أسود عُثر عليه فوق المكتب. بعد تجاوز القفل، أمكن استعادة معاينات رسائل وسجل مكالمات جزئي من ذاكرته المحلية.",caution:"محتويات الهاتف تسجل أسماء محفوظة وتوقيتات محلية، لا هوية مؤكدة للشخص الذي استخدم الجهاز أو التحويلة. يلزم corroboration من سجلات مستقلة."},
    "phone-data":{title:"محتويات الهاتف",number:"05 / DIGITAL FORENSICS",description:"استُعيدت أربع معاينات رسائل وثلاثة سجلات مكالمات. يظهر تواصل مع مازن، ورسالة من تحويلة داخلية 204 عند 01:28، ومكالمة واردة من التحويلة نفسها عند 01:32.",caution:"هذه سجلات محلية جزئية. اسم جهة الاتصال ليس إثبات هوية، والتحويلة قد يستخدمها أكثر من شخص. كما أن وقت الجهاز قابل للتعديل ولا يثبت وحده ترتيب الأحداث."},
    "archive-permissions":{title:"طلب توسيع صلاحيات الوصول",number:"07 / ARCHIVE DOCUMENT",description:"نسخة من طلب داخلي مؤرخ قبل ثلاث سنوات، يطلب توسيع صلاحيات الوصول إلى قواعد بيانات المستخدمين وربطها بواجهة تصدير خارجية. خانة مقدم الطلب تحمل اسم فارس الكيلاني.",caution:"النسخة تشير إلى أن فارس بدأ مسار توسيع الصلاحيات، لكنها لا تثبت وحدها أن البيانات بيعت أو أنه نفذ ذلك بنفسه. يلزم سجل تنفيذ مستقل."},
    "archive-payments":{title:"كشف التحويلات إلى المورد",number:"08 / FINANCIAL TRACE",description:"كشف يربط دفعات شهرية متكررة بمورد تقني يحمل اسماً تجارياً لا يظهر في قائمة الموردين المعتادة. بدأت الدفعات بعد طلب الصلاحيات بفترة قصيرة، ورمز الاعتماد الإداري يعود إلى وحدة فارس.",caution:"تزامن الدفعات مع الصلاحيات ورمز الوحدة يثيران شبهة وجود مخطط منظم، لكن اسم المورد وحده لا يثبت المستفيد الحقيقي ولا طبيعة الخدمة."},
    "forensic-audit":{title:"سجل تدقيق قارئ غرفة الخوادم",number:"11 / DIGITAL FORENSICS",description:"نسخة من سجل التدقيق تُظهر أن حدث استخدام بطاقة سليم عند 01:43 أُنشئ في النظام بوقته المسجل، ثم عُدّلت خانة مصدر المزامنة عند 02:06 عبر حساب خدمة إداري.",caution:"التعديل يثبت أن سجل الحدث لم يبقَ دون تغيير. حساب الخدمة قد تستخدمه أكثر من جهة، ولا يحدد هذا المستخرج من نفّذ التعديل أو إن كان التعديل لإخفاء دخول غير مشروع."},
    "forensic-camera":{title:"إطار كاميرا ممر الخوادم",number:"12 / VIDEO TRACE",description:"إطار منخفض الدقة عند 01:44 يُظهر شخصاً بملابس داكنة يغادر نطاق باب غرفة الخوادم. الوجه خارج مجال الرؤية، ولا تظهر بطاقة تعريف أو علامة شخصية واضحة.",caution:"الإطار يثبت وجود شخص في الممر ضمن تلك اللحظة إذا صحت سلامة التسجيل، لكنه لا يثبت هويته ولا يثبت أنه دخل الغرفة أو استخدم بطاقة سليم."},
    "forensic-trace":{title:"أثر مادي قرب قارئ البطاقة",number:"13 / TRACE EVIDENCE",description:"أثناء فحص محيط القارئ، سُجل خدش حديث على الغطاء المعدني وألياف داكنة دقيقة عالقة بحافته. لم تُجرَ بعد مقارنة مخبرية مع ملابس أو أدوات أي شخص.",caution:"الخدش والألياف قد ينتجان عن صيانة أو احتكاك عادي. لا توجد مطابقة نوعية أو بصمة تربطهما بشخص محدد."},
     "layan-statement":{title:"إفادة ليان سالم التكميلية",number:"14 / WITNESS STATEMENT",description:"تقر ليان بأنها عادت إلى الطابق بعد مغادرتها المسجلة عند 01:05، ولمست هاتف سليم بعد الوفاة وحذفت رسالة كانت قد وصلته. تقول إن فارس طلب منها حذفها، وإنها خافت أن تُتهم بإخفاء معلومات.",caution:"الإفادة اعتراف بسلوك لاحق لا بجريمة القتل. يجب التحقق من عودة ليان وطلب فارس ومحتوى الرسالة من سجلات مستقلة؛ لا توجد نسخة مستعادة من الرسالة حتى الآن."},
    "archive-crosscheck":{title:"تقرير المطابقة التقاطعية",number:"10 / CROSS-REFERENCE REPORT",description:"مقارنة بين طلب توسيع الصلاحيات وكشف التحويلات والمذكرة التنفيذية. تُظهر الوثائق تسلسلاً إدارياً يبدأ بتوسيع الوصول، ثم مدفوعات تحمل رمز وحدة فارس، ثم وصول تقرير الاستثناءات إلى مكتب المدير التنفيذي.",caution:"التقرير يلخص روابط بين نسخ أرشيفية. لا يثبت المستفيد النهائي من الأموال، ولا يثبت أن نادر أصدر أمراً أو أن فارس ارتكب جريمة القتل."},
    "archive-executive":{title:"مذكرة مراجعة تنفيذية",number:"09 / EXECUTIVE MEMO",description:"مذكرة محدودة التداول تشير إلى أن تقريراً عن حركة البيانات عُرض على مكتب المدير التنفيذي نادر القيسي بعد بدء التحويلات. على الهامش عبارة بخط اليد: «تُراجع الاستثناءات قبل إيقاف الخدمة»، وبجانبها أحرف N.Q.",caution:"قد تعني المذكرة أن نادر علم بالمشكلة لاحقاً، لكنها لا تثبت أنه وافق على البيع أو أمر بإيذاء سليم. نحتاج إلى أصل المذكرة وبيانات تداولها ومصدر مستقل."},
    "access-log":{title:"مستخرج سجل الحركة والدخول",number:"06 / ACCESS CONTROL",description:"مستخرج أولي يجمع ستة أحداث من نظام البطاقات وحساسات الأبواب خلال الفترة 01:12–01:47. يتضمن خروج مازن، وحالة باب غرفة الاجتماعات، ووصول بطاقة فارس، واستخدام بطاقة سليم لدخول غرفة الخوادم.",caution:"السجل يثبت أن بيانات بطاقة معينة استُخدمت أو أن حساس الباب تغيّر؛ لا يثبت وحده هوية حامل البطاقة. يجب مقارنة التوقيت بمصدر مستقل وبالإفادات."},
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

  // Company access-control extract: raw credential events, not person identification.
  const logFacts={
    mazen:{title:"01:12 — خروج مازن",text:"يسجل النظام استخدام بطاقة مازن العابد عند بوابة الطابق السابع للخروج.",caution:"هذا يدعم توقيت مغادرته المعلن، لكنه لا يستبعد استخدام شخص آخر للبطاقة أو وجوده في مكان آخر لاحقاً."},
    "door-open":{title:"01:18 — فتح باب غرفة الاجتماعات",text:"سجل حساس الباب انتقاله إلى حالة الفتح. لا يوجد في هذا السطر رقم بطاقة أو اسم مستخدم.",caution:"لا نعرف من فتح الباب، ولا نعرف إن كان الداخل شخصاً واحداً أو أكثر."},
    "door-close":{title:"01:24 — إغلاق باب غرفة الاجتماعات",text:"سجل الحساس عودة الباب إلى حالة الإغلاق بعد ست دقائق.",caution:"مدة بقاء الباب مغلقاً لا تكشف هوية من كان داخل الغرفة، ولا تثبت أن الباب لم يُفتح من الداخل."},
    fares:{title:"01:26 — وصول بطاقة فارس",text:"استخدمت بيانات بطاقة فارس الكيلاني عند قارئ المصعد المتجه إلى الطابق السابع.",caution:"يثبت السجل استخدام بيانات بطاقته، لا أنه كان ممسكاً بها بنفسه. يلزم فحص الكاميرات أو شاهد مستقل."},
    server:{title:"01:43 — بطاقة سليم في غرفة الخوادم",text:"سجل قارئ غرفة الخوادم استخدام بطاقة سليم ناصر للدخول، بعد وقت قصير من المواجهة المفترضة.",caution:"هذه نقطة غير عادية: سليم كان قد يكون مصاباً أو ميتاً حينها. لا تستنتج أنه دخل بنفسه؛ قد تكون البطاقة انتقلت إلى شخص آخر."},
    exit:{title:"01:47 — خروج بطاقة فارس",text:"سجل قارئ مصعد الخدمة استخدام بيانات بطاقة فارس للخروج من الطابق.",caution:"تسلسل الوصول والخروج يضع استخدام بطاقته في نافذة زمنية مهمة، لكنه لا يثبت وحده ما فعله بين الحدثين."}
  };
  let selectedLog=null;
  function selectLog(id){
    selectedLog=id;
    $("log-detail-title").textContent=id?logFacts[id].title:"اختر حدثاً من القائمة";
    $("log-detail-text").textContent=id?logFacts[id].text:"لا تتعامل مع السجل كأنه تسجيل مرئي. إنه أثر إلكتروني يحتاج إلى تفسير ومقارنة.";
    $("log-detail-caution").textContent=id?logFacts[id].caution:"البيانات الخام لا تجيب وحدها عن سؤال: من كان هنا فعلياً؟";
    $("record-log-evidence").disabled=!id||collected.includes("access-log");
    $("record-log-evidence").textContent=collected.includes("access-log")?"✓ التقرير موثّق بالفعل":"＋ توثيق التقرير في ملف القضية";
    $("log-recorded").classList.toggle("hidden",!collected.includes("access-log"));
    document.querySelectorAll("[data-log]").forEach(btn=>btn.classList.toggle("selected",btn.dataset.log===id));
  }
  document.querySelectorAll("[data-log]").forEach(btn=>btn.addEventListener("click",()=>selectLog(btn.dataset.log)));
  $("record-log-evidence").addEventListener("click",()=>{
    if(collected.includes("access-log"))return;
    collected.push("access-log");localStorage.setItem(key,JSON.stringify(collected));
    render();renderBoard();selectLog(selectedLog);
  });

  // Timeline reconstruction: distinguish source quality from the player's interpretation.
  const timelineData={
    mazen:{time:"01:12",title:"مغادرة مازن للطابق",text:"سجل البوابة استخدام بطاقة مازن للخروج، ومازن قال في المقابلة إنه غادر عند الوقت نفسه.",source:"سجل بطاقة + إفادة مازن. مصدران متوافقان، لكنهما لا يثبتان استحالة عودته أو انتقال بطاقته."},
    "meeting-open":{time:"01:18",title:"فتح باب غرفة الاجتماعات",text:"حساس الباب سجّل انتقاله إلى حالة الفتح. لا يظهر اسم مستخدم أو رقم بطاقة.",source:"حساس باب فقط؛ لا يحدد من فتحه أو من دخل."},
    "meeting-close":{time:"01:24",title:"إغلاق باب غرفة الاجتماعات",text:"عاد الحساس إلى حالة الإغلاق بعد ست دقائق. لا نعرف ما حدث داخل الغرفة خلال تلك الفترة.",source:"حساس باب فقط؛ لا يثبت هوية الموجودين أو عددهم."},
    "fares-arrive":{time:"01:26",title:"وصول بطاقة فارس للطابق",text:"سجل المصعد استخدام بيانات بطاقة فارس للوصول إلى الطابق السابع.",source:"سجل بطاقة؛ يثبت استخدام بيانات الاعتماد ولا يثبت حاملها."},
    corridor:{time:"01:30",title:"مرور محتمل عبر الممر الداخلي",text:"هذا توقيت ضمن إعادة البناء الأولية، وليس لدينا حتى الآن تسجيل مرئي موثق يثبت مرور شخص بعينه.",source:"فرضية زمنية مبنية على نافذة الحركة؛ نحتاج إلى كاميرا أو شاهد مستقل."},
    draft:{time:"01:36",title:"آخر مسودة محفوظة على الهاتف",text:"المسودة غير مرسلة وتحمل توقيتاً محلياً قدره 01:36. قد تساعد في ترتيب الأحداث لكنها لا تثبت وحدها أن سليم كان يمسك الهاتف عند ذلك الوقت.",source:"بيانات محلية مستعادة من الهاتف؛ التوقيت قابل للتعديل ويحتاج إلى مطابقة."},
    confrontation:{time:"01:39",title:"بداية مواجهة محتملة",text:"قد تكون المواجهة بدأت في هذه النافذة، لكن لا يوجد حتى الآن شاهد مباشر أو تسجيل صوتي كامل يحدد بدايتها.",source:"استنتاج مؤقت من المسودة وسجلات الحركة؛ لا يُعامل كحدث مثبت."},
    death:{time:"~01:40",title:"الوفاة المقدّرة",text:"الساعة المتوقفة تشير إلى 01:40، لكنها ليست ساعة موثوقة بعد. وقت الوفاة يجب أن يبقى نطاقاً تقديرياً إلى أن يظهر تقرير طبي أو دليل مستقل.",source:"قرينة مشهد + تقدير أولي؛ لا يوجد توقيت قطعي."},
    server:{time:"01:43",title:"استخدام بطاقة سليم بالخوادم",text:"قارئ غرفة الخوادم سجّل استخدام بطاقة سليم. هذا لا يعني أن سليم نفسه دخل؛ ربما استُخدمت بطاقته بواسطة شخص آخر.",source:"سجل قارئ باب؛ هوية حامل البطاقة مجهولة."},
    "fares-exit":{time:"01:47",title:"خروج بطاقة فارس",text:"سجل مصعد الخدمة استخدام بيانات بطاقة فارس للخروج من الطابق.",source:"سجل بطاقة؛ يثبت استخدام بيانات الاعتماد ولا يثبت حاملها."}
  };
  const timelineKey="thecase-case01-timeline";
  let timelineMarks={};try{timelineMarks=JSON.parse(localStorage.getItem(timelineKey)||"{}")}catch(_){}
  let selectedTimeline=null;
  function renderTimeline(){
    $("timeline-progress-count").textContent=Object.keys(timelineMarks).filter(k=>timelineData[k]&&timelineMarks[k]).length+" / "+Object.keys(timelineData).length;
    document.querySelectorAll("[data-event]").forEach(btn=>{
      const mark=timelineMarks[btn.dataset.event];
      btn.classList.toggle("reviewed",!!mark);
      const label=mark?({verified:"موثق",witness:"إفادة",inference:"استنتاج",unknown:"غير محسوم"}[mark]):"لم يُراجع";
      let badge=btn.querySelector(".timeline-mark");
      if(!badge){badge=document.createElement("small");badge.className="timeline-mark";btn.querySelector("span").appendChild(badge)}
      badge.textContent=label;
      badge.dataset.kind=mark||"";
    });
  }
  function selectTimelineEvent(id){
    selectedTimeline=id;
    const item=id?timelineData[id]:null;
    $("timeline-detail-title").textContent=item?item.time+" — "+item.title:"اختر حدثاً من التسلسل";
    $("timeline-detail-text").textContent=item?item.text:"كل توقيت يحتاج إلى مصدر. بعض الأحداث لم تُثبت بعد، حتى لو بدت منطقية.";
    $("timeline-source").textContent=item?"المصدر: "+item.source:"المصدر: لم يُحدّد";
    $("timeline-classification").value=id?(timelineMarks[id]||""):"";
    $("save-timeline").disabled=!id||!$("timeline-classification").value;
    $("timeline-feedback").textContent=id&&timelineMarks[id]?"تصنيفك الحالي: "+({verified:"سجل أو أثر موثق",witness:"إفادة شخص",inference:"استنتاج يحتاج إلى اختبار",unknown:"غير محسوم"}[timelineMarks[id]]):"اختر التصنيف الذي يطابق قوة المصدر، لا ما تتمنى أن يكون صحيحاً.";
    document.querySelectorAll("[data-event]").forEach(btn=>btn.classList.toggle("selected",btn.dataset.event===id));
  }
  document.querySelectorAll("[data-event]").forEach(btn=>btn.addEventListener("click",()=>selectTimelineEvent(btn.dataset.event)));
  $("timeline-classification").addEventListener("change",()=>{$("save-timeline").disabled=!selectedTimeline||!$("timeline-classification").value});
  $("save-timeline").addEventListener("click",()=>{
    if(!selectedTimeline||!$("timeline-classification").value)return;
    timelineMarks[selectedTimeline]=$("timeline-classification").value;
    localStorage.setItem(timelineKey,JSON.stringify(timelineMarks));
    renderTimeline();selectTimelineEvent(selectedTimeline);
    $("timeline-feedback").textContent="تم حفظ تصنيفك. يمكنك تغييره متى ظهرت قرائن جديدة.";
  });
  renderTimeline();

  // Archive cabinet: each document is independently reviewed and saved as evidence.
  const archiveDocs={
    permissions:{evidence:"archive-permissions",title:"طلب توسيع صلاحيات الوصول",intro:"الطلب مؤرخ قبل ثلاث سنوات، ويصف توسيع نطاق الوصول إلى بيانات المستخدمين وإتاحة تصديرها.",extract:"مقدم الطلب: فارس الكيلاني.\nالجهة: إدارة الأبحاث المالية.\nالمطلوب: صلاحيات موسعة على قاعدة بيانات المستخدمين وواجهة تصدير خارجية.\nملاحظة اعتماد: «للاستخدام التحليلي الداخلي».",caution:"اسم فارس في الطلب يربطه ببداية مسار الصلاحيات، لا يثبت وحده ما حدث للبيانات بعد ذلك."},
    payments:{evidence:"archive-payments",title:"كشف التحويلات إلى المورد",intro:"دفعات متكررة بدأت بعد طلب الصلاحيات. اسم المورد غير مألوف في قائمة الموردين الأساسية.",extract:"المورد: Northbridge Data Services.\nنمط الدفع: شهري، بمبالغ متقاربة.\nبداية النشاط: بعد اعتماد الصلاحيات الموسعة.\nرمز الاعتماد: FIN-RD / F.K.",caution:"التطابق الزمني ورمز الوحدة قرينتان تستحقان التتبع. لا تكشف هذه النسخة المالك الحقيقي للمورد أو وجهة الأموال."},
    executive:{evidence:"archive-executive",title:"مذكرة مراجعة تنفيذية",intro:"مذكرة داخلية تشير إلى وصول تقرير حركة البيانات إلى مكتب المدير التنفيذي بعد بدء النشاط.",extract:"المستلم: مكتب المدير التنفيذي — نادر القيسي.\nالموضوع: استثناءات تصدير البيانات.\nملاحظة هامشية: «تُراجع الاستثناءات قبل إيقاف الخدمة».\nالأحرف بجانب الملاحظة: N.Q.",caution:"قد تثبت المذكرة أن الأمر وصل إلى مكتب نادر، لكنها لا تثبت أنه أصبح شريكاً في المخطط أو أنه أصدر أمراً ضد سليم."}
  };
  let selectedArchive=null;
  function renderArchive(){
    const ready=collected.includes("access-log");
    $("archive-card-state").textContent=ready?"افتح خزانة الأرشيف ←":"تُفتح بعد توثيق سجل الدخول ←";
    $("open-archive").disabled=!ready;
    document.querySelectorAll("[data-archive]").forEach(btn=>{
      const id=btn.dataset.archive,done=collected.includes(archiveDocs[id].evidence);
      btn.classList.toggle("document-recorded",done);
      let state=btn.querySelector(".archive-doc-state");
      if(!state){state=document.createElement("small");state.className="archive-doc-state";btn.appendChild(state)}
      state.textContent=done?"✓ محفوظ في ملف القضية":"لم يُوثّق بعد";
    });
  }
  function selectArchiveDoc(id){
    selectedArchive=id;
    const doc=id?archiveDocs[id]:null;
    $("archive-title").textContent=doc?doc.title:"اختر ملفاً من الخزانة";
    $("archive-text").textContent=doc?doc.intro:"بعض الأوراق قد تبدو إدارية وعادية. اقرأ التواريخ والأسماء والصلاحيات قبل أن تربطها بالقضية.";
    $("archive-extract").textContent=doc?doc.extract:"لم يُفتح مستند بعد.";
    $("archive-caution").textContent=doc?doc.caution:"لا تعتبر نسخة الأرشيف دليلاً مكتملاً قبل التحقق من مصدرها وسلامة سجلها.";
    const done=doc&&collected.includes(doc.evidence);
    $("record-archive").disabled=!doc||done;
    $("record-archive").textContent=done?"✓ المستند محفوظ بالفعل":"＋ إضافة المستند إلى ملف القضية";
    $("archive-recorded").classList.toggle("hidden",!done);
    document.querySelectorAll("[data-archive]").forEach(btn=>btn.classList.toggle("selected",btn.dataset.archive===id));
  }
  document.querySelectorAll("[data-archive]").forEach(btn=>btn.addEventListener("click",()=>selectArchiveDoc(btn.dataset.archive)));
  $("record-archive").addEventListener("click",()=>{
    if(!selectedArchive)return;
    const id=archiveDocs[selectedArchive].evidence;
    if(collected.includes(id))return;
    collected.push(id);localStorage.setItem(key,JSON.stringify(collected));
    render();renderBoard();renderArchive();selectArchiveDoc(selectedArchive);
  });
  renderArchive();


  // Cross-reference archive records without turning correlation into proof.
  const crossSources={
    permissions:{label:"طلب الصلاحيات",title:"توسيع الوصول سبق التحويلات",text:"طلب فارس توسيع صلاحيات الوصول إلى بيانات المستخدمين قبل بدء الدفعات إلى المورد. هذا يضعه في بداية المسار الإداري الذي أتاح التصدير.",limits:"ما لا يثبته: أن الطلب استُخدم فعلاً للبيع، أو أن فارس كان المستفيد من الأموال. نحتاج إلى سجلات تنفيذ وأصل مالي."},
    payments:{label:"كشف التحويلات",title:"رمز الوحدة يربط الدفعات بمسار فارس",text:"تظهر الدفعات بعد طلب الصلاحيات، ويحمل رمز اعتمادها FIN-RD / F.K. هذا يربط المعاملة بوحدة الأبحاث المالية ورمز فارس.",limits:"ما لا يثبته: مالك المورد الحقيقي أو من وقّع التحويل فعلياً. الرمز قد يكون اعتماداً إدارياً لا توقيعاً شخصياً."},
    executive:{label:"المذكرة التنفيذية",title:"تقرير الاستثناءات وصل إلى مكتب نادر",text:"المذكرة تشير إلى أن تقرير حركة البيانات وصل إلى مكتب المدير التنفيذي بعد بدء النشاط المالي. هذا يجعل احتمال علم الإدارة العليا مساراً يستحق التحقيق.",limits:"ما لا يثبته: أن نادر قرأ المذكرة بنفسه أو وافق على المخطط أو أصدر أمراً ضد سليم. نحتاج إلى أصل المذكرة وسجل تداول مستقل."}
  };
  let crossPair=[];
  let crossResult=null;
  function renderCrosscheck(){
    const ready=["archive-permissions","archive-payments","archive-executive"].every(id=>collected.includes(id));
    $("crosscheck-card-state").textContent=ready?"افتح مساحة المطابقة ←":"تُفتح بعد توثيق مستندات الأرشيف ←";
    $("open-crosscheck").disabled=!ready;
    document.querySelectorAll("[data-cross]").forEach(btn=>{
      const done=collected.includes("archive-"+btn.dataset.cross);
      btn.disabled=!ready||!done;
      btn.classList.toggle("selected",crossPair.includes(btn.dataset.cross));
      btn.classList.toggle("source-saved",done);
    });
    $("cross-one").textContent=crossPair[0]?crossSources[crossPair[0]].label:"لم يُحدّد";
    $("cross-two").textContent=crossPair[1]?crossSources[crossPair[1]].label:"لم يُحدّد";
    $("run-crosscheck").disabled=crossPair.length!==2;
    const saved=collected.includes("archive-crosscheck");
    $("record-crosscheck").disabled=!crossResult||saved;
    $("record-crosscheck").textContent=saved?"✓ التقرير محفوظ بالفعل":"＋ حفظ تقرير المطابقة في ملف القضية";
    $("cross-saved").classList.toggle("hidden",!saved);
  }
  function resetCrosscheck(){
    crossPair=[];crossResult=null;
    $("cross-title").textContent="اختر وثيقتين للبدء";
    $("cross-text").textContent="قد تكشف التواريخ ورموز الاعتماد مساراً مشتركاً، لكن انتبه إلى ما لا تثبته الوثائق.";
    $("cross-limits").textContent="لم تُجرَ مقارنة بعد.";
    renderCrosscheck();
  }
  document.querySelectorAll("[data-cross]").forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.disabled)return;
    const id=btn.dataset.cross;
    if(crossPair.includes(id))crossPair=crossPair.filter(x=>x!==id);
    else if(crossPair.length<2)crossPair.push(id);
    else crossPair=[id];
    renderCrosscheck();
  }));
  $("run-crosscheck").addEventListener("click",()=>{
    if(crossPair.length!==2)return;
    const a=crossSources[crossPair[0]],b=crossSources[crossPair[1]];
    crossResult={a:crossPair[0],b:crossPair[1]};
    $("cross-title").textContent=a.title+" + "+b.title;
    $("cross-text").textContent=a.text+" "+b.text;
    $("cross-limits").textContent=a.limits+" "+b.limits;
    // Completing a comparison records its report automatically and unlocks the next step.
    if(!collected.includes("archive-crosscheck")){
      collected.push("archive-crosscheck");
      localStorage.setItem(key,JSON.stringify(collected));
      render();renderBoard();
    }
    renderCrosscheck();renderServerForensics();
  });
  $("record-crosscheck").addEventListener("click",()=>{
    if(!crossResult||collected.includes("archive-crosscheck"))return;
    collected.push("archive-crosscheck");localStorage.setItem(key,JSON.stringify(collected));
    render();renderBoard();renderCrosscheck();
  });
  renderCrosscheck();


  // Server-room forensic review: independent traces with explicit evidentiary limits.
  const forensicItems={
    audit:{evidence:"forensic-audit",title:"سجل تدقيق قارئ الباب",description:"حدث استخدام بطاقة سليم عند 01:43، ثم تعديل خانة مصدر المزامنة عند 02:06 بواسطة حساب خدمة إداري.",observation:"المادة تسجل تعديلًا لاحقًا على بيانات الحدث. يلزم الحصول على سجل الخادم الأصلي وسجل صلاحيات حساب الخدمة.",limit:"لا نعرف من استخدم حساب الخدمة، ولا نعرف إن كان التعديل متعمداً لإخفاء هوية الداخل. التعديل وحده لا يثبت من دخل."},
    camera:{evidence:"forensic-camera",title:"إطار كاميرا الممر",description:"إطار عند 01:44 يظهر شخصاً بملابس داكنة يغادر نطاق باب غرفة الخوادم. الوجه خارج مجال الرؤية.",observation:"يمكن مقارنة اتجاه الحركة والوقت مع سجل الدخول والخروج، لكن جودة الصورة لا تسمح بتحديد ملامح أو هوية.",limit:"لا يثبت الإطار أن الشخص دخل الغرفة أو حمل بطاقة سليم. لا تستخدم لون الملابس كتعريف لشخص بعينه."},
    trace:{evidence:"forensic-trace",title:"أثر قرب قارئ البطاقة",description:"خدش حديث على الغطاء المعدني وألياف داكنة دقيقة عالقة بحافته. لا توجد نتيجة تحليل مخبري حتى الآن.",observation:"الأثر يستحق الحفظ والفحص المجهري ومقارنته بعينات مرجعية موثقة.",limit:"قد يكون الأثر ناتجاً عن صيانة أو احتكاك عادي. لا توجد مطابقة تربطه بفارس أو بأي شخص آخر."}
  };
  let selectedForensic=null;
  function renderServerForensics(){
    const ready=collected.includes("archive-crosscheck");
    $("server-card-state").textContent=ready?"افتح محطة الفحص ←":"تُفتح بعد تقرير المطابقة ←";
    $("open-server-forensics").disabled=!ready;
    const count=Object.values(forensicItems).filter(x=>collected.includes(x.evidence)).length;
    $("forensic-progress").textContent=count+" / 3";
    document.querySelectorAll("[data-forensic]").forEach(btn=>{
      const item=forensicItems[btn.dataset.forensic];
      btn.classList.toggle("forensic-done",collected.includes(item.evidence));
    });
  }
  function selectForensic(id){
    selectedForensic=id;
    const item=id?forensicItems[id]:null,done=item&&collected.includes(item.evidence);
    $("forensic-title").textContent=item?item.title:"اختر مادة للفحص";
    $("forensic-description").textContent=item?item.description:"كل مادة قد تضيف تفصيلاً، لكنها لا تجيب وحدها عن هوية الشخص الذي دخل غرفة الخوادم.";
    $("forensic-observation").textContent=item?item.observation:"لم تُفحص مادة بعد.";
    $("forensic-limit").textContent=item?item.limit:"افصل بين ما تراه وما تستنتجه.";
    $("record-forensic").disabled=!item||done;
    $("record-forensic").textContent=done?"✓ المادة موثّقة بالفعل":"＋ توثيق المادة في ملف القضية";
    $("forensic-recorded").classList.toggle("hidden",!done);
    document.querySelectorAll("[data-forensic]").forEach(btn=>btn.classList.toggle("selected",btn.dataset.forensic===id));
    renderServerForensics();
  }
  document.querySelectorAll("[data-forensic]").forEach(btn=>btn.addEventListener("click",()=>selectForensic(btn.dataset.forensic)));
  $("record-forensic").addEventListener("click",()=>{
    if(!selectedForensic)return;
    const evidenceId=forensicItems[selectedForensic].evidence;
    if(collected.includes(evidenceId))return;
    collected.push(evidenceId);localStorage.setItem(key,JSON.stringify(collected));
    render();renderBoard();renderServerForensics();renderLayanInterview();selectForensic(selectedForensic);
  });
  renderServerForensics();

  // Layan's supplemental interview opens only after two independent server-room traces are documented.
  const layanInterviewKey="thecase-case01-layan-interview";
  let layanAsked=[];try{layanAsked=JSON.parse(localStorage.getItem(layanInterviewKey)||"[]")}catch(_){}
  const layanAnswers={
    return:{label:"العودة إلى الطابق",text:"«نعم. غادرت عند 01:05 كما يظهر في السجل، لكنني عدت من مدخل الخدمة بعد الثانية. لم أستخدم بطاقتي؛ اتصلت بأحدهم وفتح لي الباب. لم أقل ذلك للشرطة لأنني لم أكن أملك إذناً بالعودة.»",note:"تقر ليان بعودة غير مسجلة بعد الثانية. يلزم تحديد من فتح لها الباب ومراجعة كاميرا مدخل الخدمة."},
    message:{label:"الرسالة المحذوفة",text:"«رأيت إشعار رسالة على هاتف سليم عندما عدت. لم أفتح المحادثة كاملة. حذفت الإشعار والمحادثة من الشاشة لأنني خفت أن يُعرف أنني عدت إلى المكتب.»",note:"تقر بلمس الهاتف وحذف محتوى، لكنها لا تقدم نسخة من الرسالة ولا تثبت توقيتها أو مرسلها."},
    fares:{label:"طلب فارس",text:"«فارس هو من اتصل بي. قال إن وجود الرسالة سيجرّني إلى مشكلة، وطلب مني أن أحذفها وألا أذكر عودتي. لم يقل إنه قتل سليم. أنا صدقته عندما قال إن الأمر إداري.»",note:"تسمي فارس كمصدر الطلب، لكن المكالمة لم تُطابق بعد بسجل اتصالات مستقل. لا تعتبر ذلك إثباتاً للأمر أو للقتل."},
    time:{label:"وقت لمس الهاتف",text:"«كان ذلك بعد الثانية بقليل، وقبل أن أغادر المبنى نهائياً. لا أستطيع تحديد الدقيقة. لم أقترب من غرفة الخوادم ولم أحمل بطاقة سليم.»",note:"تضع ليان فعل الحذف بعد تعديل سجل الخدمة عند 02:06 أو قريباً منه، لكن تقديرها غير دقيق ولا يثبت التسلسل."}
  };
  function renderLayanInterview(){
    const traces=["forensic-audit","forensic-camera","forensic-trace"].filter(id=>collected.includes(id)).length;
    const ready=traces>=2;
    $("layan-card-state").textContent=ready?"افتح المقابلة التكميلية ←":"تُفتح بعد توثيق أثرين جنائيين ←";
    $("open-layan-interview").disabled=!ready;
    const host=$("layan-notes");host.innerHTML="";
    if(!layanAsked.length){const li=document.createElement("li");li.textContent="لم تُسجّل إجابات بعد.";host.appendChild(li)}
    layanAsked.forEach(k=>{const li=document.createElement("li");li.textContent=layanAnswers[k].label+" — "+layanAnswers[k].note;host.appendChild(li)});
    document.querySelectorAll("[data-layan-question]").forEach(button=>{
      const done=layanAsked.includes(button.dataset.layanQuestion);
      button.disabled=done;button.classList.toggle("asked",done);
    });
  }
  $("layan-options").addEventListener("click",e=>{
    const button=e.target.closest("[data-layan-question]");if(!button)return;
    const id=button.dataset.layanQuestion,answer=layanAnswers[id];
    if(!answer||layanAsked.includes(id))return;
    $("layan-response").textContent=answer.text;
    $("layan-note").textContent="ملاحظة آدم: "+answer.note;
    layanAsked.push(id);localStorage.setItem(layanInterviewKey,JSON.stringify(layanAsked));
    renderLayanInterview();
    renderSuspectInterview();
  });
  renderLayanInterview();


  // Evidence-gated suspect confrontations
  const suspectKey="thecase-case01-suspect-interviews";
  let suspectAsked={fares:[],nader:[]};try{suspectAsked=Object.assign(suspectAsked,JSON.parse(localStorage.getItem(suspectKey)||"{}"))}catch(_){}
  let activeSuspect="fares";
  const suspectQuestions={
   fares:{
    permissions:{label:"طلب توسيع الصلاحيات",requires:()=>collected.includes("archive-permissions"),text:"«كان طلباً إدارياً عادياً. كل مدير قسم يطلب صلاحيات إضافية عندما تتوسع المشاريع.»",note:"لم ينكر تقديم الطلب، لكنه يصفه كإجراء إداري. يلزم ربط الطلب بسجل التنفيذ."},
    payments:{label:"الدفعات إلى Northbridge",requires:()=>collected.includes("archive-payments"),text:"«رمز الوحدة لا يعني أنني أجريت التحويل. فريق المالية يستخدم رموز الأقسام، اطلبوا سجل الاعتماد الأصلي.»",note:"دفع المسؤولية نحو آلية القسم. تفسير قابل للفحص وليس نفياً موثقاً."},
    arrival:{label:"وجودك في الطابق عند 01:26",requires:()=>collected.includes("access-log")&&collected.includes("forensic-camera"),text:"«مررت بالطابق، نعم. كان لدي اجتماع قصير، ولم أدخل مكتب سليم. الكاميرا لا تظهر وجهي، أليس كذلك؟»",note:"أقرّ بالوجود في الطابق لكنه ينفي دخول المكتب. الإطار لا يثبت هويته وحده."},
    layan:{label:"طلبك من ليان حذف الرسالة",requires:()=>layanAsked.includes("fares"),text:"«طلبت منها ألا تعبث بهاتف موظف متوفى. لم أطلب حذف دليل.»",note:"لم ينكر التواصل معها، لكنه ينازع في معنى الطلب. نحتاج إلى سجل المكالمة."}
   },
   nader:{
    memo:{label:"المذكرة التي وصلت إلى مكتبك",requires:()=>collected.includes("archive-executive"),text:"«مكتبي يستقبل عشرات المذكرات. وجود الأحرف الأولى لا يثبت أنني قرأتها أو وافقت عليها. أين سجل الاستلام؟»",note:"يفصل بين وصول الورقة للمكتب واطلاعه الشخصي. لا توجد مصادقة على الاستلام."},
    exports:{label:"استمرار تصدير البيانات",requires:()=>collected.includes("archive-crosscheck"),text:"«لم أكن أدير العمليات اليومية. المسؤولية تقع على من نفذ التحويلات وأخفى مسارها.»",note:"ينقل المسؤولية للمستوى الأدنى. التقرير لا يثبت علمه الشخصي أو موافقته."},
    fares:{label:"دور فارس في المخطط",requires:()=>suspectAsked.fares.includes("payments")&&suspectAsked.fares.includes("permissions"),text:"«فارس كان مسؤولاً عن الأبحاث المالية. لا تخلط بين الإشراف الإداري والمشاركة في فعل غير قانوني.»",note:"يقر بمسؤولية فارس الوظيفية لكنه ينفي أن يكون ذلك دليلاً على شراكة نادر."},
    order:{label:"من أصدر الأمر بإسكات سليم؟",requires:()=>suspectAsked.fares.includes("arrival")&&layanAsked.includes("fares"),text:"«هذا اتهام خطير. لم تقدم رسالة موثقة أو تسجيلاً يثبت أنني أصدرت أمراً كهذا.»",note:"يرفض السؤال لغياب دليل مباشر. هذه فجوة تحقيق وليست براءة أو إدانة."}
   }
  };
  function suspectReady(id){return id==="fares"?(["return","message","fares","time"].every(q=>layanAsked.includes(q))):(collected.includes("archive-executive")&&collected.includes("archive-crosscheck")&&suspectAsked.fares.length>=3)}
  function renderSuspectInterview(){
   const fr=suspectReady("fares"),nr=suspectReady("nader");
   $("open-suspect-interviews").disabled=!fr;
   $("suspect-card-state").textContent=fr?(nr?"مواجهات متاحة · فارس ونادر ←":"استجواب فارس متاح ←"):"تُفتح بعد استكمال محاور إفادة ليان الأربعة ←";
   document.querySelectorAll("[data-suspect]").forEach(b=>{const id=b.dataset.suspect,ready=id==="fares"?fr:nr;b.disabled=!ready;b.classList.toggle("selected",id===activeSuspect);b.querySelector("small").textContent=ready?(suspectAsked[id].length+" / 4 محاور سُئلت"):"المواجهة غير متاحة بعد"});
   const names={fares:["فارس الكيلاني","نائب مدير الأبحاث المالية","المواجهة الأولى · الصلاحيات والحركة"],nader:["نادر القيسي","المدير التنفيذي لشركة نواة","المواجهة الثانية · المسؤولية والأمر"]},info=names[activeSuspect];
   $("suspect-name").textContent=info[0];$("suspect-role").textContent=info[1];$("suspect-stage").textContent=info[2];const portrait=$("suspect-focus-portrait");portrait.src=activeSuspect==="fares"?"assets/portraits/fares.webp":"assets/portraits/nader.webp";portrait.alt="صورة "+info[0];
   const host=$("suspect-question-list");host.innerHTML="";
   Object.entries(suspectQuestions[activeSuspect]).forEach(([id,q])=>{const b=document.createElement("button");b.type="button";b.className="suspect-question";const ready=q.requires(),asked=suspectAsked[activeSuspect].includes(id);b.disabled=!ready||asked;b.textContent=(asked?"✓ ":"")+q.label+(ready?"":" · يتطلب دليلاً");b.addEventListener("click",()=>askSuspect(id));host.appendChild(b)});
   const notes=$("suspect-notes");notes.innerHTML="";let count=0;
   ["fares","nader"].forEach(person=>suspectAsked[person].forEach(id=>{const q=suspectQuestions[person][id];if(!q)return;count++;const li=document.createElement("li");li.textContent=(person==="fares"?"فارس: ":"نادر: ")+q.label+" — "+q.note;notes.appendChild(li)}));
   $("suspect-question-count").textContent=count+" إجابات موثقة";if(!count){const li=document.createElement("li");li.textContent="لم تُسجّل أي مواجهة بعد.";notes.appendChild(li)}
  }
  function askSuspect(id){const q=suspectQuestions[activeSuspect][id];if(!q||!q.requires()||suspectAsked[activeSuspect].includes(id))return;$("suspect-response").textContent=q.text;$("suspect-observation").textContent="ملاحظة آدم: "+q.note;suspectAsked[activeSuspect].push(id);localStorage.setItem(suspectKey,JSON.stringify(suspectAsked));renderSuspectInterview()}
  document.querySelectorAll("[data-suspect]").forEach(b=>b.addEventListener("click",()=>{if(!b.disabled){activeSuspect=b.dataset.suspect;renderSuspectInterview()}}));
  $("leave-suspect-interviews").addEventListener("click",()=>show("office-screen"));
  $("open-suspect-interviews").addEventListener("click",()=>{activeSuspect="fares";renderSuspectInterview();show("suspect-interviews-screen")});
  renderSuspectInterview();

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


  // Final evidence-led decision: unlock only when every investigation strand has been reviewed.
  const reviewDecisionKey="thecase-case01-final-decision";
  const reviewRequiredEvidence=["archive-permissions","archive-payments","archive-executive","archive-crosscheck","forensic-audit","forensic-camera","forensic-trace"];
  const reviewRequiredTimeline=["mazen","meeting-open","meeting-close","fares-arrive","corridor","draft","confrontation","death","server","fares-exit"];
  let savedReview=null;let editingReview=false;try{savedReview=JSON.parse(localStorage.getItem(reviewDecisionKey)||"null")}catch(_){}
  function caseReviewReady(){
    return reviewRequiredEvidence.every(id=>collected.includes(id)) &&
      ["return","message","fares","time"].every(id=>layanAsked.includes(id)) &&
      ["permissions","payments","arrival","layan"].every(id=>suspectAsked.fares.includes(id)) &&
      ["memo","exports","fares","order"].every(id=>suspectAsked.nader.includes(id)) &&
      reviewRequiredTimeline.every(id=>!!timelineMarks[id]);
  }
  function renderCaseReview(){
    const ready=caseReviewReady();$("open-case-review").disabled=!ready;
    $("case-review-state").textContent=ready?"كل مسارات التحقيق مكتملة · ابدأ المراجعة ←":"تتطلب الأدلة والمقابلات ومراجعة الأحداث العشرة ←";
    if(savedReview&&!editingReview){
      $("review-perpetrator").value=savedReview.perpetrator||"";$("review-order").value=savedReview.order||"";$("review-audit").value=savedReview.audit||"";
      showCaseReviewResult(savedReview);
    }
    updateReviewSubmit();
  }
  function updateReviewSubmit(){
    $("submit-case-review").disabled=!["review-perpetrator","review-order","review-audit"].every(id=>$(id).value);
  }
  function showCaseReviewResult(answer){
    const correct=answer.perpetrator==="fares"&&answer.order==="nader"&&answer.audit==="edited";
    $("case-review-result").classList.remove("hidden");
    $("review-result-title").textContent=correct?"الصورة اتضحت... لكن الملف لم يُغلق بعد.":"بعض الخيوط ما زالت في غير موضعها.";
    $("review-result-text").textContent=correct?
      "يرجّح تسلسل الوقائع أن فارس هو من واجه سليم وتسبب في سقوطه، وأن نادر كان مصدر الأمر. لكن قوة الاستنتاج ليست واحدة: دور فارس تدعمه حركة البطاقة وإطار الكاميرا وإفادة ليان والقرائن المتقاطعة، بينما أمر نادر ما زال استنتاجاً تدعمه المذكرة وسياق التسجيل ولا يرقى وحده إلى إثبات قضائي قاطع.":
      "راجع الفارق بين المنفّذ المباشر وصاحب الأمر، ولا تمنح سجل التدقيق أكثر مما يقول. يمكنك تعديل اختياراتك قبل تثبيت النسخة النهائية من القرار.";
    $("continue-to-ending").classList.remove("hidden");
    $("review-next-note").textContent=correct?
      "ملاحظة مهمة: سجل 02:06 يثبت تعديل خانة في السجل عبر حساب خدمة إداري، لكنه لا يحدد الشخص الذي استخدم الحساب. ليان اعترفت بحذف الرسالة، لا بالقتل. القضية تقود إلى خيوط أوسع من حادثة الطابق السابع.":
      "تذكّر: استخدام بيانات البطاقة لا يثبت هوية حاملها، والمذكرة التي وصلت إلى مكتب نادر لا تثبت وحدها أنه أصدر أمراً. افصل بين القرينة والواقعة.";
  }
  ["review-perpetrator","review-order","review-audit"].forEach(id=>$(id).addEventListener("change",updateReviewSubmit));
  $("open-case-review").addEventListener("click",()=>{renderCaseReview();show("case-review-screen")});
  $("leave-case-review").addEventListener("click",()=>show("office-screen"));
  $("edit-case-review").addEventListener("click",()=>{
    editingReview=true;savedReview=null;localStorage.removeItem(reviewDecisionKey);
    $("case-review-result").classList.add("hidden");$("continue-to-ending").classList.add("hidden");
    $("submit-case-review").classList.remove("hidden");updateReviewSubmit();
  });
  $("submit-case-review").addEventListener("click",()=>{
    if(!caseReviewReady())return;
    editingReview=false;
    savedReview={perpetrator:$("review-perpetrator").value,order:$("review-order").value,audit:$("review-audit").value,submittedAt:Date.now()};
    localStorage.setItem(reviewDecisionKey,JSON.stringify(savedReview));showCaseReviewResult(savedReview);
  });
  renderCaseReview();

  // The ending is a deliberate three-beat sequence: report, archive photograph, then the next case hook.
  $("continue-to-ending").addEventListener("click",()=>show("case-ending-screen"));
  $("leave-ending").addEventListener("click",()=>show("case-review-screen"));
  $("open-ending-attachment").addEventListener("click",()=>{
    $("ending-report-stage").classList.add("hidden");
    $("ending-photo-stage").classList.remove("hidden");
    show("case-ending-screen");
  });
  $("inspect-ending-photo").addEventListener("click",()=>{
    $("photo-inspection").classList.remove("hidden");
    $("ending-photo-stage").classList.add("photo-inspected");
    $("ending-photo-stage").insertAdjacentHTML("beforeend",'<div class="ending-photo-continue"><span class="ending-step">مرفق تم فحصه · 02 / 02</span><button class="ending-primary" id="receive-ending-message">متابعة <b>←</b></button></div>');
    $("inspect-ending-photo").disabled=true;
    $("receive-ending-message").addEventListener("click",()=>{
      $("ending-photo-stage").classList.add("hidden");
      $("ending-teaser-stage").classList.remove("hidden");
      show("case-ending-screen");
    });
  });
  $("return-ending-office").addEventListener("click",()=>show("office-screen"));
  // Refresh the review lock after any evidence, interview, or timeline action.
  document.addEventListener("click",()=>window.setTimeout(renderCaseReview,0));
  document.addEventListener("change",()=>window.setTimeout(renderCaseReview,0));

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
