
(() => {
  const $ = id => document.getElementById(id);
  const screens = ["home-screen","briefing-screen","office-screen","investigation-screen","evidence-board-screen","interview-screen","logs-screen","timeline-screen","archive-screen"];
  const show = id => screens.forEach(s => $(s).classList.toggle("hidden",s!==id));
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
  $("open-archive").addEventListener("click",()=>{renderArchive();show("archive-screen");selectArchiveDoc(null)});

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
    "archive-permissions":{title:"طلب توسيع صلاحيات الوصول",number:"07 / ARCHIVE DOCUMENT",description:"نسخة من طلب داخلي مؤرخ قبل ثلاث سنوات، يطلب توسيع صلاحيات الوصول إلى قواعد بيانات المستخدمين وربطها بواجهة تصدير خارجية. خانة مقدم الطلب تحمل اسم فارس الكيلاني.",caution:"النسخة تشير إلى أن فارس بدأ مسار توسيع الصلاحيات، لكنها لا تثبت وحدها أن البيانات بيعت أو أنه نفذ ذلك بنفسه. يلزم سجل تنفيذ مستقل."},
    "archive-payments":{title:"كشف التحويلات إلى المورد",number:"08 / FINANCIAL TRACE",description:"كشف يربط دفعات شهرية متكررة بمورد تقني يحمل اسماً تجارياً لا يظهر في قائمة الموردين المعتادة. بدأت الدفعات بعد طلب الصلاحيات بفترة قصيرة، ورمز الاعتماد الإداري يعود إلى وحدة فارس.",caution:"تزامن الدفعات مع الصلاحيات ورمز الوحدة يثيران شبهة وجود مخطط منظم، لكن اسم المورد وحده لا يثبت المستفيد الحقيقي ولا طبيعة الخدمة."},
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
