
(() => {
  const $ = (id) => document.getElementById(id);
  const screens = ["home-screen", "briefing-screen", "office-screen", "investigation-screen"];
  const show = (id) => screens.forEach((screen) => $(screen).classList.toggle("hidden", screen !== id));
  const modal = $("files-modal");
  $("start-case").addEventListener("click", () => show("briefing-screen"));
  $("back-home").addEventListener("click", () => show("home-screen"));
  $("enter-office").addEventListener("click", () => show("office-screen"));
  $("back-briefing").addEventListener("click", () => show("briefing-screen"));
  $("open-investigation").addEventListener("click", () => show("investigation-screen"));
  $("leave-investigation").addEventListener("click", () => show("office-screen"));
  $("open-files").addEventListener("click", () => modal.classList.remove("hidden"));
  $("close-files").addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.classList.add("hidden"); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") modal.classList.add("hidden"); });

  const evidence = {
    cup: { title:"فنجان القهوة", number:"01 / OBJECT", description:"فنجان قهوة متروك على سطح المكتب. لا توجد علامة واضحة تشرح متى شُربت القهوة أو من لمس الفنجان. يمكن حفظه لفحص البصمات لاحقاً.", caution:"وجود بصمة على الفنجان — إن وُجدت — يثبت اللمس فقط، ولا يثبت القتل." },
    phone: { title:"هاتف سليم", number:"02 / OBJECT", description:"هاتف سليم مقفل برمز من أربعة أرقام. الشاشة لا تعرض محتوى الرسائل، ولا يمكن معرفة ما حُذف أو ما بقي قبل فتحه بالطريقة الصحيحة.", caution:"لا تحاول تخمين محتوى الهاتف. الرمز يحتاج إلى حل من قرائن القضية." },
    paper: { title:"ورقة ممزقة", number:"03 / OBJECT", description:"قصاصة ورقية ممزقة قرب المكتب. بقيت عليها أجزاء من كتابة غير مكتملة؛ لا تكفي وحدها لاستعادة الجملة أو معرفة من مزّقها.", caution:"القصاصة قرينة ناقصة، وليست دليلاً على هوية الفاعل." },
    clock: { title:"ساعة الحائط", number:"04 / OBJECT", description:"عقارب الساعة متوقفة عند 01:40. هذه ملاحظة من مسرح الجريمة، لكنها لا تثبت أن الوفاة حدثت في تلك الدقيقة.", caution:"ساعة متوقفة ليست ساعة وفاة مؤكدة. سنقارنها ببقية الأدلة والسجلات." }
  };
  const storageKey = "thecase-case01-evidence";
  let collected = [];
  try { collected = JSON.parse(localStorage.getItem(storageKey) || "[]").filter(id => evidence[id]); } catch (_) { collected = []; }
  let selected = null;
  const empty = $("inspection-empty"), details = $("inspection-details");
  const count = $("evidence-count"), fill = $("progress-fill"), list = $("collected-items");
  function renderCollected() {
    count.textContent = collected.length + " / 4";
    fill.style.width = (collected.length / 4 * 100) + "%";
    $("collected-label").textContent = collected.length ? "تم حفظ " + collected.length + " أدلة" : "لا توجد أدلة بعد";
    list.innerHTML = "";
    collected.forEach(id => { const li = document.createElement("li"); li.textContent = evidence[id].title; list.appendChild(li); });
    document.querySelectorAll(".scene-object").forEach(button => {
      const done = collected.includes(button.dataset.evidence);
      button.classList.toggle("collected", done);
      const badge = button.querySelector("small"); badge.textContent = done ? "✓" : String(Object.keys(evidence).indexOf(button.dataset.evidence)+1).padStart(2,"0");
    });
  }
  function inspect(id) {
    selected = id;
    const item = evidence[id];
    empty.classList.add("hidden"); details.classList.remove("hidden");
    $("detail-number").textContent = item.number;
    $("detail-title").textContent = item.title;
    $("detail-description").textContent = item.description;
    $("detail-caution").textContent = item.caution;
    const already = collected.includes(id);
    $("collect-evidence").disabled = already;
    $("collect-evidence").textContent = already ? "✓ محفوظ في ملف الأدلة" : "＋ إضافة إلى ملف الأدلة";
    document.querySelectorAll(".scene-object").forEach(button => button.classList.toggle("selected",button.dataset.evidence===id));
  }
  document.querySelectorAll(".scene-object").forEach(button => button.addEventListener("click", () => inspect(button.dataset.evidence)));
  $("collect-evidence").addEventListener("click", () => {
    if (!selected || collected.includes(selected)) return;
    collected.push(selected);
    localStorage.setItem(storageKey, JSON.stringify(collected));
    renderCollected(); inspect(selected);
  });
  renderCollected();

  let soundOn = localStorage.getItem("thecase-sound") !== "off";
  let audioContext;
  const soundButton = $("sound-toggle");
  const renderSound = () => { soundButton.textContent = soundOn ? "♫" : "♪̸"; soundButton.style.opacity = soundOn ? "1" : ".55"; };
  const tick = () => {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = "sine"; oscillator.frequency.setValueAtTime(620, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(390, audioContext.currentTime + .07);
      gain.gain.setValueAtTime(.035, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .08);
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + .08);
    } catch (_) {}
  };
  soundButton.addEventListener("click", () => { soundOn = !soundOn; localStorage.setItem("thecase-sound", soundOn ? "on" : "off"); renderSound(); tick(); });
  document.querySelectorAll("button").forEach(button => { if (button !== soundButton) button.addEventListener("click", tick); });
  renderSound();
})();
