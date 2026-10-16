(() => {
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => Math.floor(n).toLocaleString("pt-BR");

  const PLUMBOB = `<svg viewBox="0 0 60 120" aria-hidden="true">
    <polygon class="base" points="30,2 58,56 30,118 2,56"/>
    <polygon points="30,2 2,56 30,64" fill="#fff" opacity=".4"/>
    <polygon points="30,2 58,56 30,64" fill="#fff" opacity=".15"/>
    <polygon points="2,56 30,118 30,64" fill="#000" opacity=".06"/>
    <polygon points="58,56 30,118 30,64" fill="#000" opacity=".22"/>
  </svg>`;
  const paintPlumbobs = () => $$(".plumbob:empty").forEach(el => (el.innerHTML = PLUMBOB));

  const initials = name => name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const avatar = (p, size = "") => `
    <div class="avatar ${size}" style="--av:${p.cor}">
      <span>${initials(p.nome)}</span>
      ${p.foto ? `<img src="${p.foto}" alt="${p.nome}" onerror="this.remove()">` : ""}
    </div>`;

  const startDate = new Date(S.inicio);
  const daysTogether = () => Math.max(0, (Date.now() - startDate) / 864e5);

  // ---------- Notificações ----------
  function toast(title, text, icon = "💬") {
    const box = $("#toasts");
    const t = document.createElement("div");
    t.className = "toast";
    window.SIMSOUND?.play(icon === "🏆" ? "conquista" : "plim");
    t.innerHTML = `<div class="toast-icon">${icon}</div><div><strong>${title}</strong><p>${text}</p></div>`;
    box.prepend(t);
    $$(".toast", box).slice(3).forEach(x => x.remove());
    setTimeout(() => t.classList.add("out"), 5200);
    setTimeout(() => t.remove(), 5700);
  }

  // ---------- HUD ----------
  const DEFAULT_MOOD = { emoji: "😍", nome: "Apaixonada" };
  let money = 20000;
  let moodTimer;
  $("#hud").innerHTML = `
    <div class="hud-av"><span class="plumbob" id="hud-pb" title="?"></span>${avatar(S.ela, "sm")}</div>
    <div class="hud-txt"><b>${S.ela.apelido}</b><small id="hud-mood"></small></div>
    <div class="hud-money">§ <span id="hud-money">${fmt(money)}</span></div>`;

  function setMood(m, ms = 6000) {
    $("#hud-mood").textContent = `${m.emoji} ${m.nome}`;
    clearTimeout(moodTimer);
    if (m !== DEFAULT_MOOD) moodTimer = setTimeout(() => setMood(DEFAULT_MOOD), ms);
  }
  function addMoney(n) {
    const from = money, to = (money += n), t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 900);
      $("#hud-money").textContent = fmt(from + (to - from) * k);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  setMood(DEFAULT_MOOD);

  // ---------- Loader ----------
  $("#loader-sub").textContent = `${S.ela.nome} & ${S.ele.nome}`;
  const tips = S.dicasLoading;
  let ti = 0;
  $("#tip").textContent = tips[0];
  const tipTimer = setInterval(() => {
    $("#tip").classList.add("fade");
    setTimeout(() => {
      ti = (ti + 1) % tips.length;
      $("#tip").textContent = tips[ti];
      $("#tip").classList.remove("fade");
    }, 250);
  }, 1500);
  setTimeout(() => $("#start").classList.remove("hidden"), 5000);
  $("#start").addEventListener("click", () => {
    clearInterval(tipTimer);
    $("#loader").classList.add("gone");
    document.body.classList.remove("locked");
    $("#hud").classList.add("show");
    window.SIMSOUND?.start();
    setTimeout(() => toast(`Sul Sul, ${S.ela.apelido}!`, "Bem-vinda de volta ao seu jogo salvo favorito.", "💚"), 700);
    // Igual na vida real: o Pedro lembrando ela de beber água de tempos em tempos
    const lembretes = ["Amor, bebe água! 💧", "Já bebeu água hoje? (Gole de café não conta.)", "Pausa para hidratação. Eu espero.", "Sua barra de Hidratação está no vermelho!"];
    let li = 0;
    const lembrar = () => { toast(`Lembrete do ${S.ele.nome}`, lembretes[li++ % lembretes.length], "💧"); setMood({ emoji: "💧", nome: "Com sede" }); };
    setTimeout(() => { lembrar(); setInterval(lembrar, 4 * 60 * 1000); }, 75 * 1000);
  });

  // ---------- Jogo salvo ----------
  $("#save-art").innerHTML = `
    <div class="sim"><span class="plumbob"></span>${avatar(S.ela)}</div>
    <div class="sim"><span class="plumbob"></span>${avatar(S.ele)}</div>`;
  $("#save-info").innerHTML = `
    <small>Jogo salvo</small>
    <h2>${S.ela.nome} & ${S.ele.nome}</h2>
    <ul>
      <li>⏱️ Tempo de jogo: <b id="playtime"></b></li>
      <li>🏡 Vizinhança: <b>${S.vizinhanca}</b></li>
      <li>👥 Na casa: <b>2 Sims + ${S.extraCasa}</b></li>
      <li>🔄 Famílias que ${S.ela.nome} criou e trocou: <b>incontáveis</b></li>
      <li>💾 Último save: <b>hoje, com muito amor</b></li>
    </ul>
    <a class="btn btn-green" href="#lote">Continuar ▶</a>
    <button class="btn btn-gray" data-familias style="margin-left:8px">🔄 Trocar de família</button>`;

  // ---------- Necessidades ----------
  $("#needs-name").textContent = S.ela.nome;
  $("#needs").innerHTML = S.necessidades.map(n => {
    const cls = n.especial ? "love" : n.valor < 35 ? "low" : n.valor < 60 ? "mid" : "";
    return `<div class="need">
      <div class="need-top"><span>${n.icone}</span>${n.nome}<span class="pct">${n.valor}%</span></div>
      <div class="bar"><div class="fill ${cls}" data-w="${n.valor}"></div></div>
      <p>${n.texto}</p>
    </div>`;
  }).join("");

  // ---------- Criar um Sim ----------
  const P = S.perfil;
  const info = [
    ["Idade", P.idade], ["Aspiração", P.aspiracao], ["Voz", P.voz], ["Estilo de andar", P.andar],
    ["Signo", P.signo], ["Casa de Hogwarts", P.casa], ["Bias", P.bias],
  ];
  $("#cas-body").innerHTML = `
    <div class="cas-portrait">
      <span class="plumbob big"></span>
      <div style="display:flex;justify-content:center">${avatar(S.ela, "lg")}</div>
      <div class="pedestal"></div>
      <h3>${S.ela.nome}</h3>
    </div>
    <div>
      <div class="info">${info.map(([k, v]) => `<div><small>${k}</small><span>${v}</span></div>`).join("")}</div>
      <h4>Traços de personalidade</h4>
      <div class="traits">${S.tracos.map(t => `
        <div class="trait"><div class="ico">${t.icone}</div><b>${t.nome}</b><p>${t.texto}</p></div>`).join("")}
      </div>
    </div>`;

  // ---------- Humores ----------
  $("#moods").innerHTML = S.humores.map(m => `
    <div class="mood" style="--c:${m.cor}">
      <div class="em">${m.emoji}</div>
      <div><b>${m.nome}</b><p>${m.texto}</p><div class="meta">${m.efeito} · ${m.dura}</div></div>
    </div>`).join("");

  // ---------- Relacionamento ----------
  $("#rel").innerHTML = `
    <div class="couple">
      <button class="sim clickable" data-interact aria-label="Interagir com ${S.ela.nome}">
        <span class="plumbob"></span>${avatar(S.ela)}
        <span class="sim-name">${S.ela.nome}</span>
        <span class="click-hint">👆 Clique para interagir</span>
      </button>
      <div class="heart">💚</div>
      <button class="sim clickable" data-interact="pedro" aria-label="Interagir com ${S.ele.nome}">
        <span class="plumbob"></span>${avatar(S.ele)}
        <span class="sim-name">${S.ele.nome}</span>
        <span class="click-hint">👆 Ele também</span>
      </button>
    </div>
    <div class="rel-bars">
      <div><label><span>🤝 Amizade</span><span>100 / 100</span></label><div class="bar"><div class="fill" data-w="100"></div></div></div>
      <div><label><span>💘 Romance</span><span>100 / 100</span></label><div class="bar"><div class="fill romance" data-w="100"></div></div></div>
    </div>
    <div class="tags">${S.statusRelacionamento.map(t => `<span class="tag">${t}</span>`).join("")}</div>
    <div class="counter">
      <div><b id="c-d">0</b><small>dias</small></div>
      <div><b id="c-h">0</b><small>horas</small></div>
      <div><b id="c-m">0</b><small>minutos</small></div>
      <div><b id="c-s">0</b><small>segundos</small></div>
    </div>
    <ul class="stats">${S.estatisticas.map((e, i) => `
      <li><span>${e.icone}</span><span>${e.rotulo}</span><b id="stat-${i}">${e.valor ?? ""}</b></li>`).join("")}
    </ul>`;

  function tick() {
    const diff = Math.max(0, Date.now() - startDate);
    const d = Math.floor(diff / 864e5);
    $("#c-d").textContent = fmt(d);
    $("#c-h").textContent = Math.floor(diff / 36e5) % 24;
    $("#c-m").textContent = Math.floor(diff / 6e4) % 60;
    $("#c-s").textContent = Math.floor(diff / 1e3) % 60;
    $("#playtime").textContent = `${fmt(diff / 36e5)} horas`;
    S.estatisticas.forEach((e, i) => { if (e.porDia) $(`#stat-${i}`).textContent = fmt(d * e.porDia); });
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Conquistas ----------
  $("#conquistas").innerHTML = S.conquistas.map(c => `
    <div class="achv-card reveal" data-achv="${c.titulo}">
      <div class="achv-ico">${c.icone}<span class="lock">🔒</span></div>
      <h3>${c.titulo}</h3>
      <p>${c.texto}</p>
    </div>`).join("");

  // Desbloqueia uma de cada vez, para as notificações não chegarem todas juntas
  const unlockQueue = [];
  let unlocking = false;
  function nextUnlock() {
    const card = unlockQueue.shift();
    if (!card) return (unlocking = false);
    unlocking = true;
    card.classList.add("unlocked");
    $(".lock", card).textContent = "🏆";
    toast("Conquista desbloqueada!", card.dataset.achv, "🏆");
    setTimeout(nextUnlock, 700);
  }
  const unlockObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      unlockObs.unobserve(e.target);
      unlockQueue.push(e.target);
    });
    if (!unlocking && unlockQueue.length) setTimeout(nextUnlock, 400);
  }, { threshold: 0.8 });
  $$(".achv-card").forEach(c => unlockObs.observe(c));

  // ---------- Carta final ----------
  $("#letter").innerHTML = S.carta.map(p => `<p>${p}</p>`).join("") + `<p class="sign">${S.assinatura}</p>`;

  // ---------- Revelar ao rolar / barras ----------
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$(".fill[data-w]", e.target).forEach(f => (f.style.width = f.dataset.w + "%"));
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach(el => revealObs.observe(el));

  paintPlumbobs();

  // ---------- Menu de interação ----------
  const pie = $("#pie");
  const PIES = {
    karine: { pessoa: S.ela, rotulo: S.ela.apelido, opts: S.interacoes },
    pedro: { pessoa: S.ele, rotulo: S.ele.nome, opts: S.interacoesPedro },
  };
  let pieWho = "karine";
  function openPie(r, who = "karine") {
    pieWho = PIES[who] ? who : "karine";
    const P = PIES[pieWho];
    const R = innerWidth < 500 ? 118 : 150;
    const padX = Math.min(R + 80, innerWidth / 2), padY = Math.min(R + 30, innerHeight / 2);
    const cx = Math.min(Math.max(r.left + r.width / 2, padX), innerWidth - padX);
    const cy = Math.min(Math.max(r.top + r.height / 2, padY), innerHeight - padY);
    const opts = P.opts;
    pie.innerHTML = `<div class="pie-center" style="left:${cx}px;top:${cy}px">${avatar(P.pessoa, "sm")}<div>${P.rotulo}</div></div>` +
      opts.map((o, i) => {
        const a = (-90 + (i * 360) / opts.length) * Math.PI / 180;
        return `<button class="pie-opt ${o.final ? "special" : ""}" data-i="${i}"
          style="left:${cx + Math.cos(a) * R}px;top:${cy + Math.sin(a) * R}px;animation-delay:${i * 40}ms">${o.icone} ${o.nome}</button>`;
      }).join("");
    pie.classList.remove("hidden");
    window.SIMSOUND?.play("pop");
  }
  const closePie = () => pie.classList.add("hidden");

  document.addEventListener("click", e => {
    const trg = e.target.closest("[data-interact]");
    if (trg) return openPie(trg.getBoundingClientRect(), trg.dataset.interact || "karine");
  });
  pie.addEventListener("click", e => {
    const btn = e.target.closest(".pie-opt");
    closePie();
    if (!btn) return;
    const o = PIES[pieWho].opts[btn.dataset.i];
    window.SIMSOUND?.play("clique");
    window.SIMSOUND?.speak(pieWho);
    if (o.final) {
      $("#evento").scrollIntoView({ behavior: "smooth" });
      toast(o.titulo, "Um evento especial está acontecendo...", "💍");
      return;
    }
    toast(o.titulo, o.resposta, o.icone);
    if (o.humor) setMood(o.humor);
    window.dispatchEvent(new CustomEvent("sims:interacao", { detail: { ...o, quem: pieWho } }));
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closePie(); $("#cheat").classList.add("hidden"); $("#familias").classList.add("hidden"); } });

  // ---------- Trocar de família ----------
  const fam = $("#familias"), famMsg = $("#fam-msg");
  let famTries = 0;
  $("#fam-grid").innerHTML =
    `<button class="fam-card atual" data-atual><span class="em">⭐</span><b>${S.ela.nome}, ${S.ele.nome} & ${S.pet.nome}</b><small>Em jogo há 10 anos</small></button>` +
    S.familias.map(f => `<button class="fam-card"><span class="em">${f.emoji}</span><b>${f.nome}</b><small>${f.info}</small></button>`).join("");
  document.addEventListener("click", e => {
    if (!e.target.closest("[data-familias]")) return;
    famMsg.textContent = "Escolha uma família para jogar.";
    fam.classList.remove("hidden");
    window.SIMSOUND?.play("pop");
  });
  const closeFam = () => fam.classList.add("hidden");
  $("#fam-close").addEventListener("click", closeFam);
  fam.addEventListener("click", e => {
    if (e.target === fam) return closeFam();
    const card = e.target.closest(".fam-card");
    if (!card) return;
    if ("atual" in card.dataset) {
      closeFam();
      toast("Boa escolha!", "A única família certa. Continuando o jogo...", "💚");
      confetti(30, ["💚", "🐶", "✨"]);
      return;
    }
    card.classList.remove("erro");
    card.classList.add("loading");
    famMsg.textContent = "Carregando família...";
    window.SIMSOUND?.play("clique");
    setTimeout(() => {
      card.classList.remove("loading");
      card.classList.add("erro");
      famMsg.textContent = S.errosFamilia[famTries++ % S.errosFamilia.length];
      window.SIMSOUND?.play("erro");
    }, 1100);
  });

  // ---------- Pergunta final ----------
  const recusar = $("#recusar");
  const fugas = ["Tem certeza?", "Botão com defeito", "Erro: opção inválida", "Removido pela EA", "Nem pensar", "Tenta o verde 💚"];
  let fi = 0;
  const fugir = e => {
    e.preventDefault();
    const box = $(".q-buttons").getBoundingClientRect();
    const maxX = Math.max(40, box.width / 2 - 70);
    recusar.style.transform = `translate(${(Math.random() * 2 - 1) * maxX}px, ${(Math.random() * 2 - 1) * 40}px)`;
    recusar.textContent = fugas[fi++ % fugas.length];
  };
  recusar.addEventListener("mouseenter", fugir);
  recusar.addEventListener("touchstart", fugir, { passive: false });
  recusar.addEventListener("click", fugir);

  $("#aceitar").addEventListener("click", () => {
    $("#question").classList.add("hidden");
    $("#final-msg").classList.remove("hidden");
    paintPlumbobs();
    document.body.classList.add("love");
    setMood({ emoji: "💖", nome: "Apaixonada pra sempre" }, 1e9);
    addMoney(100000);
    window.dispatchEvent(new CustomEvent("sims:final"));
    window.SIMSOUND?.play("vitoria");
    setTimeout(() => window.SIMSOUND?.speak("karine", "Sul sul! Borahae!"), 900);
    toast("Aspiração concluída!", "Amor Eterno: +10 anos (renováveis automaticamente).", "💖");
    confetti();
  });

  function confetti(n = 90, set = ["💚", "💖", "✨", "💎", "💜"]) {
    const box = $("#confetti");
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.textContent = set[i % set.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.fontSize = 14 + Math.random() * 22 + "px";
      s.style.animationDuration = 2.5 + Math.random() * 3 + "s";
      s.style.animationDelay = Math.random() * 1.2 + "s";
      box.appendChild(s);
      setTimeout(() => s.remove(), 7000);
    }
  }

  // ---------- Cheats ----------
  const cheat = $("#cheat"), input = $("#cheat-input");
  const openCheat = () => { cheat.classList.remove("hidden"); input.value = ""; input.focus(); };
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") { e.preventDefault(); openCheat(); }
  });
  $("#cheat-hint").addEventListener("click", openCheat);
  let pbTaps = 0;
  $("#hud-pb").addEventListener("click", () => { if (++pbTaps >= 5) { pbTaps = 0; openCheat(); } });

  const CHEATS = {
    help: () => toast("Cheats disponíveis", "motherlode · kaching · rosebud · testingcheats true · borahae · alohomora · sulsul", "🔧"),
    motherlode: () => { addMoney(50000); toast("Motherlode!", "+§50.000. Mas nada compra o que a gente tem.", "💰"); },
    kaching: () => { addMoney(1000); toast("Kaching!", "+§1.000. Suficiente pra um tteokbokki.", "💸"); },
    rosebud: () => { addMoney(1000); toast("Rosebud!", "Clássico. Que nem a gente.", "🌹"); },
    "testingcheats true": () => toast("Cheats ativados", "Mas esse amor é 100% legítimo. Nenhuma trapaça foi usada nesses 10 anos.", "✅"),
    borahae: () => {
      const on = document.body.classList.toggle("borahae");
      toast(on ? "보라해 💜" : "Modo normal", on ? "I purple you. Frase criada pelo V, o bias dela. Tema ARMY ativado." : "De volta ao azul do Modo Viver.", "💜");
      if (on) confetti(40, ["💜", "🫰", "✨"]);
    },
    alohomora: () => toast("Mensagem secreta desbloqueada", S.segredo, "🗝️"),
    sulsul: () => toast("Sul Sul!", "Nooboo! Vadish! (Tradução: te amo muito.)", "👋"),
  };
  input.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const cmd = input.value.trim().toLowerCase();
    (CHEATS[cmd] || (() => toast("Cheat desconhecido", `"${cmd}" não existe. Tente "help".`, "❓")))();
    cheat.classList.add("hidden");
  });

  // API usada pelo lote 3D (lot3d.js)
  window.SIMS = {
    toast, setMood, confetti,
    openPieAt: (x, y, who) => openPie({ left: x, top: y, width: 0, height: 0 }, who),
    cheat: name => CHEATS[name]?.(),
  };
})();
