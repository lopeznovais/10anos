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
    <button class="hud-achv" id="hud-achv" title="Conquistas">🏆 <span id="hud-achv-n"></span></button>
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
  // Senha: aparece como "código de registro" no fim do carregamento.
  // Depois de acertar uma vez, o navegador lembra e não pede de novo.
  const SENHA_KEY = "sims-liberado";
  let liberado = !S.senha;
  try { liberado = liberado || localStorage.getItem(SENHA_KEY) === "1"; } catch (e) {}
  let somIniciado = false;
  const iniciarSom = () => { if (!somIniciado) { somIniciado = true; window.SIMSOUND?.start(); } };
  setTimeout(() => {
    if (liberado) return $("#start").classList.remove("hidden");
    clearInterval(tipTimer);
    $("#loader").classList.add("unlocked");
    $("#gate").classList.remove("hidden");
    $("#gate-input").focus();
  }, 5000);

  const norm = s => s.trim().toLowerCase().replace(/\s+/g, "");
  let erros = 0;
  $("#gate").addEventListener("submit", e => {
    e.preventDefault();
    const gate = $("#gate"), inp = $("#gate-input");
    if (norm(inp.value) !== norm(S.senha)) {
      const dicas = S.dicasSenha || ["Código de registro inválido."];
      $("#gate-msg").textContent = dicas[Math.min(erros++, dicas.length - 1)];
      gate.classList.remove("erro");
      void gate.offsetWidth;
      gate.classList.add("erro");
      inp.select();
      return;
    }
    try { localStorage.setItem(SENHA_KEY, "1"); } catch (err) {}
    inp.blur();
    gate.classList.add("hidden");
    iniciarSom();
    window.SIMSOUND?.play("conquista");
    mostrarMensagem();
  });

  // A mensagem aparece parágrafo por parágrafo, e só depois o botão de jogar
  function mostrarMensagem() {
    const paras = [...(S.mensagemInicial || []), `— ${S.ele.nome}`];
    $("#welcome-text").innerHTML = paras.map((p, i) => `<p class="${i === paras.length - 1 ? "sign" : ""}">${p}</p>`).join("");
    $("#welcome").classList.remove("hidden");
    const ps = $$("#welcome-text p");
    ps.forEach((p, i) => setTimeout(() => p.classList.add("in"), 500 + i * 1800));
    setTimeout(() => {
      $("#start").classList.remove("hidden");
      $("#start").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 500 + ps.length * 1800);
  }

  $("#start").addEventListener("click", () => {
    clearInterval(tipTimer);
    $("#loader").classList.add("gone");
    document.body.classList.remove("locked");
    $("#hud").classList.add("show");
    iniciarSom();
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
  // Cada conquista destrava quando ela descobre um segredo (achieve("id")).
  // O progresso fica salvo no navegador, então recarregar a página não perde nada.
  const ACHV_KEY = "sims-conquistas";
  let achieved = new Set();
  try { achieved = new Set(JSON.parse(localStorage.getItem(ACHV_KEY)) || []); } catch (e) {}
  const total = S.conquistas.length;

  $("#conquistas").innerHTML = S.conquistas.map(c => `
    <div class="achv-card reveal" data-achv="${c.id}">
      <div class="achv-ico">${c.icone}<span class="lock">🔒</span></div>
      <h3>${c.titulo}</h3>
      <p><span class="achv-dica">💡 ${c.dica}</span><span class="achv-texto">${c.texto}</span></p>
    </div>`).join("");

  function paintAchv(id) {
    const card = $(`.achv-card[data-achv="${id}"]`);
    if (!card) return;
    card.classList.add("unlocked");
    $(".lock", card).textContent = "🏆";
  }
  function paintCount() {
    const n = S.conquistas.filter(c => achieved.has(c.id)).length;
    $("#hud-achv-n").textContent = `${n}/${total}`;
    $("#achv-count").textContent = n === total
      ? `Todas as ${total} conquistas desbloqueadas. Platina! 💎`
      : `${n} de ${total} segredos encontrados. Explore o site (e o lote 3D) para desbloquear o resto.`;
    return n;
  }

  // Desbloqueia uma de cada vez, para as notificações não chegarem todas juntas
  const unlockQueue = [];
  let unlocking = false;
  function nextUnlock() {
    const c = unlockQueue.shift();
    if (!c) return (unlocking = false);
    unlocking = true;
    paintAchv(c.id);
    const n = paintCount();
    toast("Conquista desbloqueada!", `${c.titulo} (${n}/${total})`, "🏆");
    $("#hud-achv").classList.remove("pulse");
    void $("#hud-achv").offsetWidth;
    $("#hud-achv").classList.add("pulse");
    if (n === total) setTimeout(() => {
      toast("Platina! 💎", `${S.ela.apelido} encontrou todos os segredos. Ninguém conhece esse jogo melhor que você.`, "💎");
      confetti(60, ["🏆", "💎", "💚", "✨"]);
    }, 1200);
    setTimeout(nextUnlock, 1600);
  }
  function achieve(id) {
    const c = S.conquistas.find(x => x.id === id);
    if (!c || achieved.has(id)) return;
    achieved.add(id);
    try { localStorage.setItem(ACHV_KEY, JSON.stringify([...achieved])); } catch (e) {}
    unlockQueue.push(c);
    if (!unlocking) setTimeout(nextUnlock, 300);
  }
  achieved.forEach(paintAchv);
  paintCount();
  $("#hud-achv").addEventListener("click", () => $("#aspiracao").scrollIntoView({ behavior: "smooth" }));

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
    achieve(pieWho === "pedro" ? "pedro" : "quimica");
    if (pieWho === "karine" && o.anim === "agua") achieve("agua");
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
      if (famTries >= S.errosFamilia.length) achieve("familias");
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
    setTimeout(() => achieve("eterno"), 2500);
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

  // ---------- Rádio ARMY (YouTube) ----------
  // O ARMY Bomb (ou o cheat "borahae") liga o tema roxo e toca a playlist do data.js.
  const radio = $("#radio"), rTitle = $("#radio-title"), rPlay = $("#radio-play"), rTap = $("#radio-tap");
  let yt = null, ytReady = false, ytApi = null, radioTimer = null, danced = false, shuffle = false;
  let vol = 80;
  try { vol = +(localStorage.getItem("sims-radio-vol") ?? 80); } catch (e) {}
  $("#radio-vol").value = vol;
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const loadYT = () => ytApi || (ytApi = new Promise((ok, fail) => {
    if (window.YT && YT.Player) return ok();
    window.onYouTubeIframeAPIReady = ok;
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => { ytApi = null; fail(); };
    document.head.appendChild(s);
  }));

  // Título comprido rola de um lado pro outro
  function setTitle(t) {
    rTitle.textContent = t;
    const box = rTitle.parentElement;
    box.classList.remove("scroll");
    requestAnimationFrame(() => {
      const extra = rTitle.offsetWidth - box.clientWidth;
      if (extra <= 0) return;
      box.style.setProperty("--shift", `${-extra}px`);
      box.style.setProperty("--dur", `${Math.max(6, extra / 18)}s`);
      box.classList.add("scroll");
    });
  }

  // Tempo, barra de progresso e "música X de Y"
  function radioTick() {
    if (!ytReady) return;
    const cur = yt.getCurrentTime() || 0, dur = yt.getDuration() || 0;
    $("#radio-time").textContent = `${mmss(cur)} / ${mmss(dur)}`;
    $("#radio-bar").style.width = dur ? `${(cur / dur) * 100}%` : "0";
    const list = yt.getPlaylist();
    $("#radio-count").textContent = list ? `· ${yt.getPlaylistIndex() + 1} de ${list.length}` : "";
  }

  function onState(e) {
    const st = e.data, playing = st === YT.PlayerState.PLAYING;
    radio.classList.toggle("playing", playing);
    rPlay.textContent = playing ? "⏸" : "▶";
    if (playing) {
      rTap.classList.add("hidden");
      setTitle(yt.getVideoData().title || "Rádio ARMY");
      // Na primeira música, os Sims dançam no lote 3D
      if (!danced) {
        danced = true;
        window.dispatchEvent(new CustomEvent("sims:interacao", { detail: { anim: "danca", quem: "karine" } }));
      }
    }
    radioTick();
  }

  function radioOn() {
    let video, list;
    try { const u = new URL(S.musicaArmy); video = u.searchParams.get("v"); list = u.searchParams.get("list"); } catch (e) { return; }
    radio.classList.remove("hidden");
    window.SIMSOUND?.musica(false);
    danced = false;
    clearInterval(radioTimer);
    radioTimer = setInterval(radioTick, 500);
    if (yt) return ytReady && yt.playVideo();
    setTitle("Sintonizando...");
    loadYT().then(() => {
      yt = new YT.Player("radio-player", {
        videoId: video || undefined,
        playerVars: { autoplay: 1, playsinline: 1, controls: 0, rel: 0, iv_load_policy: 3, ...(list ? { list, listType: "playlist" } : {}) },
        events: {
          onReady: e => {
            ytReady = true;
            e.target.setVolume(vol);
            if (window.SIMSOUND?.mudo) e.target.mute();
            e.target.playVideo();
            // Celular às vezes bloqueia o autoplay: aí mostra o aviso pra tocar no vídeo
            setTimeout(() => { if (e.target.getPlayerState() !== YT.PlayerState.PLAYING) rTap.classList.remove("hidden"); }, 2500);
          },
          onStateChange: onState,
          onError: e => e.target.nextVideo(), // vídeo que não pode tocar fora do YouTube: pula pro próximo
        },
      });
    }).catch(() => {
      radioOff();
      toast("Rádio fora do ar", "Sem internet pra tocar BTS agora. 😢", "📻");
    });
  }
  function radioOff() {
    radio.classList.add("hidden");
    radio.classList.remove("playing");
    clearInterval(radioTimer);
    if (ytReady) yt.pauseVideo();
    window.SIMSOUND?.musica(true);
  }
  function setBorahae(on) {
    document.body.classList.toggle("borahae", on);
    window.dispatchEvent(new CustomEvent("sims:cheat", { detail: { cmd: "borahae", arg: on } }));
    toast(on ? "보라해 💜" : "Modo normal", on ? "I purple you. Frase criada pelo V, o bias dela. Tema ARMY ativado. 🎶" : "De volta ao azul do Modo Viver.", "💜");
    if (on) { confetti(40, ["💜", "🫰", "✨"]); achieve("borahae"); }
    if (S.musicaArmy) on ? radioOn() : radioOff();
  }

  // Controles
  const ytDo = fn => () => { if (ytReady) fn(); };
  $("#radio-close").addEventListener("click", () => setBorahae(false));
  rPlay.addEventListener("click", ytDo(() => yt.getPlayerState() === YT.PlayerState.PLAYING ? yt.pauseVideo() : yt.playVideo()));
  $("#radio-next").addEventListener("click", ytDo(() => yt.nextVideo()));
  $("#radio-prev").addEventListener("click", ytDo(() => (yt.getCurrentTime() > 5 ? yt.seekTo(0, true) : yt.previousVideo())));
  $("#radio-shuffle").addEventListener("click", ytDo(() => {
    shuffle = !shuffle;
    yt.setShuffle(shuffle);
    $("#radio-shuffle").classList.toggle("on", shuffle);
    toast(shuffle ? "Modo aleatório" : "Ordem normal", shuffle ? "A próxima música é surpresa. 🔀" : "De volta à ordem da playlist.", "📻");
  }));
  $("#radio-vol").addEventListener("input", e => {
    vol = +e.target.value;
    if (ytReady) { yt.setVolume(vol); if (vol && !window.SIMSOUND?.mudo) yt.unMute(); }
    try { localStorage.setItem("sims-radio-vol", vol); } catch (err) {}
  });
  $("#radio-progress").addEventListener("click", e => {
    if (!ytReady) return;
    const r = e.currentTarget.getBoundingClientRect();
    yt.seekTo(((e.clientX - r.left) / r.width) * yt.getDuration(), true);
    setTimeout(radioTick, 100);
  });
  // O botão 🔊/🔇 do topo também muta o rádio
  $("#som").addEventListener("click", () => setTimeout(() => {
    if (ytReady) window.SIMSOUND?.mudo ? yt.mute() : yt.unMute();
  }));

  // Arrastar o rádio pelo cabeçalho (só no computador; no celular ele fica fixo embaixo)
  let drag = null;
  $("#radio-head").addEventListener("pointerdown", e => {
    if (innerWidth <= 760 || e.target.closest("button")) return;
    const r = radio.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    radio.classList.add("dragging");
    e.currentTarget.setPointerCapture(e.pointerId);
  });
  $("#radio-head").addEventListener("pointermove", e => {
    if (!drag) return;
    const x = Math.min(Math.max(8, e.clientX - drag.dx), innerWidth - radio.offsetWidth - 8);
    const y = Math.min(Math.max(8, e.clientY - drag.dy), innerHeight - radio.offsetHeight - 8);
    Object.assign(radio.style, { left: `${x}px`, top: `${y}px`, right: "auto", bottom: "auto" });
  });
  const endDrag = () => { drag = null; radio.classList.remove("dragging"); };
  $("#radio-head").addEventListener("pointerup", endDrag);
  $("#radio-head").addEventListener("pointercancel", endDrag);
  addEventListener("resize", () => { if (innerWidth <= 760) radio.removeAttribute("style"); });

  // ---------- Cheats ----------
  // Os mesmos códigos do The Sims (1 ao 4), com o efeito adaptado ao site.
  // Como no jogo: alguns só funcionam depois de "testingcheats true".
  const cheat = $("#cheat"), input = $("#cheat-input"), cheatOut = $("#cheat-out");
  const cheatHistory = [];
  let histPos = 0;
  const openCheat = () => { cheat.classList.remove("hidden"); cheatOut.classList.add("hidden"); input.value = ""; histPos = cheatHistory.length; input.focus(); };
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      cheat.classList.contains("hidden") ? openCheat() : cheat.classList.add("hidden");
    }
  });
  $("#cheat-hint").addEventListener("click", openCheat);
  let pbTaps = 0;
  $("#hud-pb").addEventListener("click", () => { if (++pbTaps >= 5) { pbTaps = 0; openCheat(); } });

  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lote = (cmd, arg) => window.dispatchEvent(new CustomEvent("sims:cheat", { detail: { cmd, arg } }));
  const onOff = a => !["off", "false", "0"].includes(a); // "on", "true" ou nada = ligado
  let testing = false;
  const needTesting = fn => args => testing ? fn(args)
    : toast("Cheat bloqueado", "Este cheat precisa de <b>testingcheats true</b> primeiro. (Igualzinho ao jogo.)", "🔒");

  function setMoney(n) { addMoney(Math.max(0, Math.round(n)) - money); }

  // Necessidades: enche a barra (fillmotive) e atualiza o painel
  const MOTIVES = { hunger: "Fome", energy: "Energia", fun: "Diversão", social: "Social", bladder: "Bexiga", comfort: "Conforto", hydration: "Hidratação", thirst: "Hidratação" };
  function fillNeed(i) {
    const n = S.necessidades[i], el = $$("#needs .need")[i];
    n.valor = 100;
    if (!el) return;
    $(".pct", el).textContent = "100%";
    const f = $(".fill", el);
    f.dataset.w = 100;
    f.style.width = "100%";
    f.classList.remove("low", "mid");
  }

  // Humores (sims.add_buff)
  const BUFFS = {
    flirty: ["😘", "Paquerando"], happy: ["😊", "Feliz"], energized: ["⚡", "Energizada"], inspired: ["🤩", "Inspirada"],
    confident: ["😎", "Confiante"], playful: ["😜", "Brincalhona"], focused: ["🧐", "Focada"], sad: ["🥺", "Triste"],
    angry: ["😤", "Irritada"], tense: ["😬", "Tensa"], embarrassed: ["😳", "Envergonhada"], uncomfortable: ["😣", "Desconfortável"],
  };
  const NEGATIVE = ["sad", "angry", "tense", "embarrassed", "uncomfortable"];

  const HELP = [
    "<b>Dinheiro:</b> motherlode · kaching · rosebud · klapaucius · money 9999 · freerealestate on",
    "<b>Sims:</b> testingcheats true · sims.fill_all_commodities · fillmotive motive_hunger · sims.add_buff flirty · sims.remove_all_buffs · resetsim karine",
    "<b>Mundo:</b> headlineeffects off · clock.advance_game_time 3 0 0 · aging off · death.toggle false · fps on",
    "<b>Construir:</b> bb.moveobjects on · bb.showhiddenobjects · bb.enablefreebuild · cas.fulleditmode",
    "<b>Vida:</b> careers.promote · stats.set_skill_level major_gardening 10 · modifyrelationship · aspirations.complete_current_milestone",
    "<b>Daqui:</b> borahae · alohomora · sulsul",
  ].join("<br>");

  const CHEATS = {
    // A lista é grande demais pra uma notificação: aparece dentro do console, que fica aberto
    help: () => { cheat.classList.remove("hidden"); cheatOut.innerHTML = HELP; cheatOut.classList.remove("hidden"); return "manter-aberto"; },

    // ----- Dinheiro -----
    motherlode: () => { addMoney(50000); toast("Motherlode!", "+§50.000. Mas nada compra o que a gente tem.", "💰"); },
    kaching: () => { addMoney(1000); toast("Kaching!", "+§1.000. Suficiente pra um tteokbokki.", "💸"); },
    rosebud: () => { addMoney(1000); toast("Rosebud!", "Clássico. Que nem a gente.", "🌹"); },
    klapaucius: () => { addMoney(1000); toast("Klapaucius!", "+§1.000. Cheat raiz do The Sims 1. Respeite os mais velhos.", "💾"); },
    money: ([v]) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return toast("Uso: money 9999", "Diga quanto. Ex.: <b>money 1000000</b>", "❓");
      setMoney(n);
      toast("Simoleons definidos", `§${fmt(Math.max(0, n))}. Mas a gente sabe que a maior riqueza aqui não é essa.`, "💰");
    },
    freerealestate: ([a]) => toast(onOff(a) ? "Imóveis grátis!" : "Imóveis pagos de novo",
      onOff(a) ? "Pode escolher qualquer casa da vizinhança. Mas a casa certa é onde ela estiver." : "Ok, ok. Ninguém vai se mudar mesmo.", "🏡"),

    // ----- Testing cheats -----
    testingcheats: ([a]) => {
      testing = onOff(a);
      toast(testing ? "Testing cheats ativados" : "Testing cheats desativados",
        testing ? "Mas esse amor é 100% legítimo. Nenhuma trapaça foi usada nesses 10 anos." : "Modo normal. Do jeito que a gente sempre jogou.", testing ? "✅" : "⛔");
    },

    // ----- Necessidades -----
    "sims.fill_all_commodities": needTesting(() => {
      S.necessidades.forEach((n, i) => { if (!n.especial) fillNeed(i); });
      setMood({ emoji: "😊", nome: "Satisfeita" });
      toast("Necessidades no máximo", "Fome, Energia, Hidratação... tudo cheio. Dura uns 15 minutos (a Fome, 5).", "📊");
    }),
    fillmotive: needTesting(([m = ""]) => {
      const nome = MOTIVES[m.replace(/^motive_/, "")];
      if (m.replace(/^motive_/, "") === "hygiene") return toast("Higiene", "Essa barra nem aparece. Skincare de 10 passos, lembra?", "🧴");
      const i = S.necessidades.findIndex(n => n.nome === nome);
      if (i < 0) return toast("Uso: fillmotive motive_hunger", "Opções: motive_hunger · motive_energy · motive_fun · motive_social · motive_bladder · motive_comfort · motive_hydration", "❓");
      fillNeed(i);
      const piadas = { Fome: "Cheia! (Pergunta de novo daqui a 20 minutos.)", Energia: "Energia cheia. Mesmo assim às 21h ela dorme.", Hidratação: "Ela bebeu? Não. Mas a barra encheu.", Bexiga: "Barra cheia. O filme pode começar em paz." };
      toast(`${nome} no máximo`, piadas[nome] || "Barra cheia!", "📊");
    }),

    // ----- Humores -----
    "sims.add_buff": ([b = ""]) => {
      const k = b.replace(/^(e_)?buff_/, "");
      const buff = BUFFS[k];
      if (!buff) return toast("Uso: sims.add_buff flirty", `Humores: ${Object.keys(BUFFS).join(" · ")}`, "❓");
      if (NEGATIVE.includes(k)) {
        setMood({ emoji: "😍", nome: "Apaixonada" });
        return toast("Humor recusado", `${S.ela.nome} rejeitou o humor "${buff[1]}". Ela tá com você, não tem como.`, "🙅");
      }
      setMood({ emoji: buff[0], nome: buff[1] }, 15000);
      toast("Humor adicionado", `${S.ela.nome} está ${buff[1]} ${buff[0]}`, buff[0]);
    },
    "sims.remove_all_buffs": () => {
      setMood(DEFAULT_MOOD);
      toast("Humores removidos", "Todos menos um: \"Apaixonada\" é permanente. Já tentaram.", "💚");
    },
    "sims.remove_buff": () => CHEATS["sims.remove_all_buffs"](),

    // ----- Sims e mundo -----
    resetsim: ([nome = S.ela.nome.toLowerCase()]) => {
      const quem = nome === S.ele.nome.toLowerCase() ? "pedro" : nome === S.ela.nome.toLowerCase() ? "karine" : null;
      if (!quem) return toast("Sim não encontrado", `Nessa casa só tem ${S.ela.nome} e ${S.ele.nome} (e a ${S.pet.nome}, mas ela não trava).`, "❓");
      lote("resetsim", quem);
      toast("Sim resetado", `${quem === "pedro" ? S.ele.nome : S.ela.nome} voltou pro quintal, novinho em folha.`, "🔄");
    },
    headlineeffects: ([a]) => {
      const on = onOff(a);
      document.body.classList.toggle("no-headline", !on);
      lote("headlineeffects", on);
      toast(on ? "Plumbobs de volta" : "Plumbobs escondidos", on ? "Agora dá pra ver de novo quem está no controle." : "Pra tirar print sem o diamante na cabeça. 📸", "💎");
    },
    "clock.advance_game_time": ([h = "1", m = "0"]) => {
      const min = (Number(h) || 0) * 60 + (Number(m) || 0);
      if (min <= 0) return toast("Uso: clock.advance_game_time 3 0 0", "Horas, minutos, segundos.", "❓");
      lote("advance_time", min);
      toast("Relógio adiantado", `+${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")} no lote. Cuidado com as 21h.`, "⏩");
    },
    aging: ([a]) => toast(onOff(a) ? "Envelhecimento... não." : "Envelhecimento desativado",
      onOff(a) ? "Esse cheat foi bloqueado. Jovem Adulta pra sempre, tá no perfil." : "Jovem Adulta pra sempre. (Já estava, mas agora é oficial.)", "⏳"),
    "aging.toggle": ([a]) => CHEATS.aging([a]),
    "death.toggle": ([a]) => toast(onOff(a) ? "Morte ativada?" : "Morte desativada",
      onOff(a) ? "Negado. Ninguém sai desse jogo." : "Ninguém sai desse jogo. Nem a Meg, nem o Pedro, nem o dorama favorito.", "👻"),
    fps: ([a]) => toggleFps(onOff(a)),

    // ----- Construir / CAS -----
    "bb.moveobjects": ([a]) => toast(onOff(a) ? "Mover objetos: ligado" : "Mover objetos: desligado",
      onOff(a) ? "Pode mover qualquer coisa. Menos a coberta: ela pertence à Karine." : "Tudo de volta no lugar.", "🛋️"),
    move_objects: a => CHEATS["bb.moveobjects"](a),
    "bb.showhiddenobjects": () => toast("Objetos escondidos", "Encontrado: 1 coberta roubada, 3 garrafinhas de água cheias (nunca abertas) e 1 controle remoto.", "🔍"),
    "bb.showliveeditobjects": () => CHEATS["bb.showhiddenobjects"](),
    "bb.enablefreebuild": () => toast("Construção livre", "Pode construir onde quiser. Sugestão: mais um quarto pra ela criar famílias.", "🧱"),
    "bb.ignoregameplayunlocksentitlement": () => toast("Tudo desbloqueado", "Inclusive a recompensa final. Mas ela tem que aceitar primeiro. 💍", "🔓"),
    "cas.fulleditmode": needTesting(() => {
      $("#cas").scrollIntoView({ behavior: "smooth" });
      toast("Criar um Sim: edição total", "Abrindo... Nada pra editar. Esse Sim já veio perfeito de fábrica.", "✨");
    }),

    // ----- Vida -----
    "careers.promote": () => toast("Promoção!", `${S.ela.nome} foi promovida a Diretora da Casa ${S.ela.nome}. Salário: abraços ilimitados.`, "💼"),
    "stats.set_skill_level": ([skill = "", nivel = "10"]) => {
      const nome = skill.replace(/^(major|minor|adultmajor)_/, "").replace(/_/g, " ") || "?";
      toast(`Habilidade: ${esc(nome)}`, `Nível ${esc(nivel)}. ${nome.includes("garden") ? "Ela já era nível 10 em Stardew." : "Igual a ela: no máximo."}`, "📈");
    },
    modifyrelationship: () => toast("Relacionamento", "Não dá pra modificar: Amizade 100, Romance 100, travados desde 2016.", "💞"),
    "relationship.introduce_sim_to_all": () => toast("Apresentações feitas", `${S.ela.nome} agora conhece todo mundo da ${S.vizinhanca}. Já sabe a fofoca de todos.`, "👋"),
    "aspirations.complete_current_milestone": () => toast("Cheat recusado", "A aspiração Amor Eterno não aceita atalhos. 10 anos, zero cheats, lembra? Vai ter que descobrir os segredos.", "🏆"),

    // ----- Exclusivos deste jogo -----
    borahae: () => setBorahae(!document.body.classList.contains("borahae")),
    alohomora: () => { toast("Mensagem secreta desbloqueada", S.segredo, "🗝️"); achieve("alohomora"); },
    sulsul: () => toast("Sul Sul!", "Nooboo! Vadish! (Tradução: te amo muito.)", "👋"),
  };

  // Contador de FPS, igual ao "fps on" do jogo
  let fpsEl = null;
  function toggleFps(on) {
    if (!on) { fpsEl?.remove(); fpsEl = null; return; }
    if (fpsEl) return;
    fpsEl = document.createElement("div");
    fpsEl.className = "fps";
    document.body.appendChild(fpsEl);
    let frames = 0, t0 = performance.now();
    const loop = now => {
      if (!fpsEl) return;
      frames++;
      if (now - t0 >= 500) { fpsEl.textContent = `FPS: ${Math.round((frames * 1000) / (now - t0))} · 💚 100%`; frames = 0; t0 = now; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Aceita "testingcheats true", "money 500", "fillmotive motive_hunger", em qualquer caixa
  function runCheat(raw) {
    const [name, ...args] = raw.trim().toLowerCase().split(/\s+/);
    if (!name) return;
    const fn = CHEATS[name];
    if (fn) return fn(args);
    toast("Cheat desconhecido", `"${esc(raw.trim())}" não existe. Tente "help".`, "❓");
  }
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      histPos = Math.min(cheatHistory.length, Math.max(0, histPos + (e.key === "ArrowUp" ? -1 : 1)));
      input.value = cheatHistory[histPos] || "";
      return;
    }
    if (e.key !== "Enter") return;
    const cmd = input.value.trim();
    input.value = "";
    if (cmd) cheatHistory.push(cmd);
    histPos = cheatHistory.length;
    if (cmd && runCheat(cmd) === "manter-aberto") return;
    cheat.classList.add("hidden");
    cheatOut.classList.add("hidden");
  });

  // API usada pelo lote 3D (lot3d.js)
  window.SIMS = {
    toast, setMood, confetti, achieve,
    openPieAt: (x, y, who) => openPie({ left: x, top: y, width: 0, height: 0 }, who),
    cheat: runCheat,
  };
})();
