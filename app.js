(() => {
  const $ = (id) => document.getElementById(id);
  const screens = ["home-screen", "briefing-screen", "office-screen"];
  const show = (id) => screens.forEach((screen) => $(screen).classList.toggle("hidden", screen !== id));
  const modal = $("files-modal");
  $("start-case").addEventListener("click", () => show("briefing-screen"));
  $("back-home").addEventListener("click", () => show("home-screen"));
  $("enter-office").addEventListener("click", () => show("office-screen"));
  $("back-briefing").addEventListener("click", () => show("briefing-screen"));
  $("open-files").addEventListener("click", () => modal.classList.remove("hidden"));
  $("close-files").addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.classList.add("hidden"); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") modal.classList.add("hidden"); });

  // Small tactile UI sounds, generated locally; no external audio files are required yet.
  let soundOn = localStorage.getItem("thecase-sound") !== "off";
  let audioContext;
  const soundButton = $("sound-toggle");
  const renderSound = () => { soundButton.textContent = soundOn ? "♫" : "♪̸"; soundButton.style.opacity = soundOn ? "1" : ".55"; };
  const tick = () => {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(620, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(390, audioContext.currentTime + .07);
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .08);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + .08);
    } catch (_) { /* Audio is optional on unsupported browsers. */ }
  };
  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    localStorage.setItem("thecase-sound", soundOn ? "on" : "off");
    renderSound();
    tick();
  });
  document.querySelectorAll("button").forEach((button) => {
    if (button !== soundButton) button.addEventListener("click", tick);
  });
  renderSound();
})();