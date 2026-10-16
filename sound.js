// Sons e música, tudo gerado em código com Web Audio (nada de música com direitos autorais).
// Uso: SIMSOUND.start() depois de um clique; SIMSOUND.play("plim"); SIMSOUND.speak("karine").
(() => {
  let ctx, master, musicBus, sfxBus, nextTime = 0, step = 0, timer = null, melody = [];
  let muted = false;
  try { muted = localStorage.getItem("sims-mudo") === "1"; } catch (e) {}

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const BEAT = 60 / 86; // bossa tranquila
  const EIGHTH = BEAT / 2;

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);

    // Reverb simples (resposta ao impulso gerada na hora)
    const len = ctx.sampleRate * 2.2;
    const imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = imp.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = imp;
    const wet = ctx.createGain();
    wet.gain.value = 0.28;
    reverb.connect(wet).connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    const warm = ctx.createBiquadFilter();
    warm.type = "lowpass";
    warm.frequency.value = 2600;
    musicBus.connect(warm);
    warm.connect(master);
    warm.connect(reverb);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.55;
    sfxBus.connect(master);
    sfxBus.connect(reverb);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
    return true;
  }

  function tone(freq, t, dur, { type = "sine", vol = 0.2, attack = 0.01, dest = sfxBus, slide = 0 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(t, dur, { vol = 0.05, freq = 6000, q = 1, type = "highpass", dest = sfxBus } = {}) {
    const n = ctx.createBufferSource();
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = b;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(dest);
    n.start(t);
  }

  // ---------- Música ----------
  // Fmaj7 · Dm9 · Bbmaj7 · C6/9, com baixo, piano elétrico, kalimba e chocalho
  const CHORDS = [
    { bass: 41, notes: [57, 60, 64, 65] },
    { bass: 38, notes: [57, 60, 62, 65] },
    { bass: 46, notes: [57, 62, 65, 69] },
    { bass: 36, notes: [55, 60, 62, 64] },
  ];
  const SCALE = [65, 67, 69, 72, 74, 77, 79, 81]; // pentatônica de Fá

  function newMelody() {
    // 32 colcheias (4 compassos), passeio aleatório suave com pausas
    let pos = 3;
    melody = Array.from({ length: 32 }, (_, i) => {
      if (Math.random() < (i % 2 ? 0.65 : 0.35)) return null;
      pos = Math.max(0, Math.min(SCALE.length - 1, pos + Math.round((Math.random() - 0.5) * 3)));
      return SCALE[pos];
    });
  }

  function scheduleStep(s, t) {
    const bar = Math.floor(s / 8) % 4, beat8 = s % 8;
    const ch = CHORDS[bar];
    if (s % 32 === 0) newMelody();
    // Baixo: tempo 1, "e" do 2 e tempo 3 (levada de bossa)
    if (beat8 === 0 || beat8 === 3 || beat8 === 4) tone(hz(ch.bass + (beat8 === 4 ? 7 : 0)), t, EIGHTH * 1.8, { vol: 0.16, dest: musicBus, attack: 0.02 });
    // Piano elétrico: acorde sincopado
    if (beat8 === 0 || beat8 === 5) ch.notes.forEach((n, k) => tone(hz(n), t + k * 0.012, BEAT * 1.6, { type: "triangle", vol: 0.035, dest: musicBus, attack: 0.03 }));
    // Kalimba
    const m = melody[s % 32];
    if (m) {
      tone(hz(m), t, 0.9, { vol: 0.07, dest: musicBus });
      tone(hz(m + 12), t, 0.25, { type: "triangle", vol: 0.015, dest: musicBus });
    }
    // Chocalho bem baixinho
    noise(t, 0.05, { vol: beat8 % 2 ? 0.012 : 0.02, dest: musicBus });
  }

  function scheduler() {
    while (nextTime < ctx.currentTime + 0.3) {
      scheduleStep(step++, nextTime);
      nextTime += EIGHTH;
    }
  }

  function startMusic() {
    if (timer) return;
    nextTime = ctx.currentTime + 0.1;
    timer = setInterval(scheduler, 60);
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(0, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 4);
  }

  // ---------- Efeitos ----------
  const SFX = {
    plim(t) { tone(hz(88), t, 0.5, { vol: 0.12 }); tone(hz(93), t + 0.09, 0.7, { vol: 0.12 }); },
    conquista(t) { [72, 76, 79, 84].forEach((n, i) => tone(hz(n), t + i * 0.08, 0.6, { vol: 0.12, type: i === 3 ? "triangle" : "sine" })); },
    pop(t) { tone(380, t, 0.12, { vol: 0.18, slide: 2.2 }); },
    clique(t) { tone(1100, t, 0.05, { vol: 0.08, type: "triangle" }); },
    colher(t) { tone(500, t, 0.1, { vol: 0.2, slide: 2 }); [84, 88, 91].forEach((n, i) => tone(hz(n), t + 0.08 + i * 0.05, 0.3, { vol: 0.06 })); },
    gole(t) { [0, 0.22].forEach(d => tone(300, t + d, 0.14, { vol: 0.2, slide: 2.4 })); },
    oinc(t) {
      // Ronquinho de porquinho: dente-de-serra grave com vibrato rápido, passando por um filtro
      [0, 0.2].forEach((d, k) => {
        const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        const f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(k ? 150 : 175, t + d);
        o.frequency.linearRampToValueAtTime(k ? 110 : 130, t + d + 0.16);
        lfo.frequency.value = 38;
        lg.gain.value = 45;
        lfo.connect(lg).connect(o.frequency);
        f.type = "bandpass";
        f.frequency.value = 850;
        f.Q.value = 2.5;
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.exponentialRampToValueAtTime(0.35, t + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.17);
        o.connect(f).connect(g).connect(sfxBus);
        [o, lfo].forEach(x => { x.start(t + d); x.stop(t + d + 0.2); });
        noise(t + d, 0.15, { vol: 0.08, freq: 900, q: 3, type: "bandpass" });
      });
    },
    latido(t) {
      [0, 0.16].forEach(d => {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = "square";
        o.frequency.setValueAtTime(620, t + d);
        o.frequency.exponentialRampToValueAtTime(330, t + d + 0.1);
        f.type = "bandpass";
        f.frequency.value = 1300;
        f.Q.value = 1.5;
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.exponentialRampToValueAtTime(0.22, t + d + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.11);
        o.connect(f).connect(g).connect(sfxBus);
        o.start(t + d);
        o.stop(t + d + 0.13);
        noise(t + d, 0.08, { vol: 0.05, freq: 1500, q: 1, type: "bandpass" });
      });
    },
    erro(t) { tone(220, t, 0.18, { type: "square", vol: 0.07 }); tone(165, t + 0.16, 0.32, { type: "square", vol: 0.07 }); },
    sininho(t) { [96, 91, 96, 100].forEach((n, i) => tone(hz(n), t + i * 0.1, 0.5, { vol: 0.05 })); },
    vitoria(t) { [65, 69, 72, 77, 81, 84].forEach((n, i) => tone(hz(n), t + i * 0.11, 1.2, { vol: 0.1, type: i % 2 ? "triangle" : "sine" })); },
  };

  // ---------- Simlish (voz do navegador falando "bobagens") ----------
  const FALAS = ["Sul sul!", "Nooboo!", "Vadish!", "Dag dag!", "Fredishay!", "Shoo flay!", "Yibs!", "Wabadebadu!", "Sha na boo!", "Nib nib!", "Hadjibabba!"];
  function speak(who = "karine", text) {
    if (muted || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text || FALAS[Math.floor(Math.random() * FALAS.length)]);
    u.lang = "pt-BR";
    u.pitch = who === "karine" ? 1.7 : 0.8;
    u.rate = 1.15;
    u.volume = 0.6;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function updateButton() {
    const b = document.getElementById("som");
    if (b) {
      b.textContent = muted ? "🔇" : "🔊";
      b.title = muted ? "Ligar som" : "Desligar som";
    }
  }

  window.SIMSOUND = {
    start() {
      if (!init()) return;
      ctx.resume();
      startMusic();
      setTimeout(() => speak("karine", "Sul sul!"), 400);
    },
    play(name) {
      if (!ctx || muted || !SFX[name]) return;
      SFX[name](ctx.currentTime + 0.01);
    },
    speak,
    toggle() {
      muted = !muted;
      try { localStorage.setItem("sims-mudo", muted ? "1" : "0"); } catch (e) {}
      if (ctx) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.1);
      if (muted && window.speechSynthesis) speechSynthesis.cancel();
      updateButton();
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    updateButton();
    const b = document.getElementById("som");
    if (b) b.addEventListener("click", () => {
      if (!ctx) window.SIMSOUND.start();
      window.SIMSOUND.toggle();
    });
  });
})();
