// Concrete Jungle — contrôleur d'interface (carte + page de quartier).
(function () {
  const D = window.CJ_DATA, G = window.CJ_GAME;
  const { DISTRICTS, CLANS } = D;
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const tile = id => state.board.find(t => t.id === id);
  const distById = id => DISTRICTS.find(d => d.id === id);

  let state = null;
  let selected = null;          // code du membre choisi
  let view = "map";             // map | district
  let currentDistrict = null;   // id du quartier ouvert
  let setup = { mode: "local", count: 2, rows: [] };

  function show(id) { $$(".screen").forEach(s => s.classList.toggle("active", s.id === id)); }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]");
    if (!a) return;
    if (a.dataset.action === "goto-setup") { buildSetup(); show("screen-setup"); }
    if (a.dataset.action === "goto-title") { show("screen-title"); }
    if (a.dataset.action === "start-game") { startGame(); }
    if (a.dataset.action === "rules") { showRules(); }
  });

  function showRules() {
    const html = `<div class="rules">
      <p><b>🎯 But.</b> Avoir le plus de <b>Réputation (PR)</b> après <b>4 manches</b> → maître de New York.</p>
      <p><b>🔄 Ton tour.</b> Touche un <b>quartier</b>, puis <b>déploie 1 membre</b> (son pouvoir s'active), ou appuie sur <b>Passer</b>. On tourne jusqu'à ce que tout le monde ait passé.</p>
      <p><b>⭐ Influence.</b> Le clan qui en a le plus dans un quartier le <b>contrôle</b>. Ton <b>chef</b> donne +1 influence à tes pions de son quartier.</p>
      <p><b>🚨 Fin de manche.</b> 1) <b>Police</b> : un quartier à <b>🔥 3+</b> subit une rafle (le clan le plus présent y perd un pion, qui revient la manche suivante). 2) <b>Contrôle</b> : le clan dominant gagne les <b>PR + 💵</b> du quartier (égalité = personne ne marque).</p>
      <p><b>💵 Argent.</b> Sert aux pouvoirs et au score final (3 💵 = 1 PR). <b>🔥 Chaleur.</b> Les meurtres la font monter → attire la police.</p>
      <p><b>🏆 Fin (après la 4ᵉ manche).</b> +2 PR pour qui tient <b>Manhattan</b>, +1 PR par 3 💵, le plus de PR gagne.</p>
      <p><b>🥊 Coups bas.</b> Selon les pouvoirs : éliminer un rival, déplacer un pion, intimider, voler de l'argent, protéger un quartier, éviter une rafle…</p>
    </div>`;
    openOverlay("📖 Règles du jeu", html, "Fermer", closeOverlay);
  }

  // ---------- CONFIGURATION ----------
  function buildSetup() {
    $$("#mode-seg .seg-btn").forEach(b => {
      b.onclick = () => {
        $$("#mode-seg .seg-btn").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        setup.mode = b.dataset.mode;
        $("#count-field").style.display = setup.mode === "solo" ? "none" : "block";
        if (setup.mode === "solo") setup.count = 2;
        buildPlayerRows();
      };
    });
    const seg = $("#count-seg"); seg.innerHTML = "";
    for (let n = 2; n <= 6; n++) {
      const b = document.createElement("button");
      b.className = "seg-btn" + (n === setup.count ? " active" : "");
      b.textContent = n;
      b.onclick = () => {
        setup.count = n;
        $$("#count-seg .seg-btn").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        buildPlayerRows();
      };
      seg.appendChild(b);
    }
    $("#count-field").style.display = setup.mode === "solo" ? "none" : "block";
    buildPlayerRows();
  }

  function buildPlayerRows() {
    const wrap = $("#player-list"); wrap.innerHTML = "";
    const isSolo = setup.mode === "solo";
    const total = isSolo ? 2 : setup.count;
    setup.rows = [];
    for (let i = 0; i < total; i++) {
      const isAI = isSolo && i === 1;
      const defClan = CLANS[i % CLANS.length];
      const row = document.createElement("div");
      row.className = "player-row";
      const dot = document.createElement("span"); dot.className = "pdot"; dot.style.background = defClan.color;
      const name = document.createElement("input");
      name.value = isAI ? "La Pègre" : (isSolo ? "Toi" : "Joueur " + (i + 1));
      name.maxLength = 14; if (isAI) name.disabled = true;
      const sel = document.createElement("select");
      CLANS.forEach(c => {
        const o = document.createElement("option");
        o.value = c.id; o.textContent = c.emoji + " " + c.name;
        if (c.id === defClan.id) o.selected = true;
        sel.appendChild(o);
      });
      sel.onchange = () => { dot.style.background = CLANS.find(c => c.id === sel.value).color; };
      row.append(dot, name, sel);
      wrap.appendChild(row);
      setup.rows.push({ name, sel, isAI });
    }
  }

  function startGame() {
    const players = setup.rows.map(r => ({ clanId: r.sel.value, name: r.name.value.trim() || "Joueur", isAI: r.isAI }));
    state = G.createGame(players);
    selected = null; view = "map"; currentDistrict = null;
    startTurn();
  }

  // ---------- Boucle de tour ----------
  function currentCanAct() {
    const pl = state.players[state.current];
    return !state.passed[state.current] && pl.reserve.length > 0;
  }
  function startTurn() {
    if (G.everyonePassed(state)) { endPlacement(); return; }
    if (!currentCanAct()) { G.advanceTurn(state); }
    selected = null; currentDistrict = null; view = "map";
    show("screen-game"); renderMap(); maybeAI();
  }
  function maybeAI() {
    const pl = state.players[state.current];
    if (pl.isAI && state.phase === "placement") {
      renderMap();
      setTimeout(() => { G.aiPlay(state, state.current); afterAction(); }, 700);
    }
  }
  // après une action terminée (deploy/pass/cible résolue)
  function afterAction() {
    if (state.pending) { renderDistrict(); return; }
    const pl = state.players[state.current];
    if (pl.extraDeploy && pl.reserve.length > 0) {  // Le Cousin : 2e déploiement gratuit
      pl.extraDeploy = false; selected = null; currentDistrict = null; view = "map";
      show("screen-game"); renderMap();
      if (!pl.isAI) toast("Le Cousin : déploie un 2ᵉ membre gratuitement !");
      maybeAI(); return;
    }
    pl.extraDeploy = false;
    G.advanceTurn(state); startTurn();
  }

  function openDistrict(id) {
    if (state.players[state.current].isAI) return;
    currentDistrict = id; view = "district"; selected = null;
    show("screen-district"); renderDistrict();
  }
  function closeDistrict() {
    if (state.pending) { toast("Résous d'abord l'action en cours."); return; }
    view = "map"; currentDistrict = null; selected = null;
    show("screen-game"); renderMap();
  }

  function endPlacement() {
    const police = G.resolvePolice(state);
    const control = G.resolveControl(state);
    const last = state.round >= D.CONFIG.rounds;
    const events = [
      "<b>Police</b>", ...police.map(e => `<div class="ev">${e}</div>`),
      "<b>Contrôle des quartiers</b>", ...control.map(e => `<div class="ev">${e}</div>`),
    ].join("");
    openOverlay(`Fin de la manche ${state.round}`, events + standingsHTML(),
      last ? "Voir les résultats" : "Manche suivante",
      () => {
        G.endRound(state);
        if (state.phase === "end") showResults();
        else { closeOverlay(); startTurn(); }
      });
  }

  function showResults() {
    const sorted = [...state.players].sort((a, b) => b.pr - a.pr);
    const win = state.players[state.winner];
    let body = `<div class="winner">🏆 ${win ? win.emoji + " " + win.name + " — " + win.clanName : "Égalité"}</div><div class="standings">`;
    sorted.forEach(p => body += `<div class="srow"><span class="pdot" style="background:${p.color}"></span>${p.emoji} ${p.name} <b>${p.pr} PR</b></div>`);
    body += `</div>`;
    openOverlay("Maître de la Concrete Jungle", body, "Rejouer", () => { closeOverlay(); buildSetup(); show("screen-setup"); });
  }

  // ---------- HUD ----------
  function renderHUD() {
    const pl = state.players[state.current];
    const mini = state.players.map(p =>
      `<span style="color:${p.idx === state.current ? p.color : 'var(--muted)'}">${p.emoji}${p.pr}</span>`).join(" · ");
    $("#game-hud").innerHTML = `
      <div class="turn"><span class="pdot" style="background:${pl.color}"></span>${pl.name}${pl.isAI ? " 🤖" : ""}</div>
      <span class="round-chip">Manche ${state.round}/${D.CONFIG.rounds}</span>
      <button id="hud-rules" class="hud-rules">📖</button>
      <div class="meta" style="flex-basis:100%;justify-content:space-between">
        <span>💵 <b>${pl.money}</b> · 🃏 <b>${pl.reserve.length}</b></span>
        <span>${mini}</span>
      </div>`;
    const rb = $("#hud-rules"); if (rb) rb.onclick = showRules;
  }

  // ---------- CARTE (plateau) ----------
  function renderMap() {
    renderHUD();
    const board = $("#board");
    board.innerHTML = `<div class="board-art" id="board-art"></div>`;
    const art = $("#board-art");
    const pl = state.players[state.current];
    for (const d of DISTRICTS) {
      const t = tile(d.id);
      const ctrl = G.tileControl(state, t);
      const leader = ctrl.leader != null ? state.players[ctrl.leader] : null;
      const lab = document.createElement("button");
      lab.className = "map-label" + (d.jewel ? " jewel" : "");
      lab.style.left = d.bx + "%"; lab.style.top = d.by + "%";
      lab.innerHTML = `
        <span class="ml-name">${d.jewel ? "👑 " : ""}${d.name}</span>
        <span class="ml-meta">
          ${leader ? `<img src="assets/clans/${leader.clanId}/emblem.png" alt="" onerror="this.remove()">` : ""}
          ${t.pawns.length ? `<b>${t.pawns.length}/${d.slots}</b>` : ""}
          ${t.heat ? ` 🔥${t.heat > 1 ? t.heat : ""}` : ""}
        </span>`;
      if (!pl.isAI) lab.onclick = () => openDistrict(d.id);
      art.appendChild(lab);
    }
    const act = $("#actions"); act.innerHTML = "";
    if (pl.isAI) { act.innerHTML = `<div class="ai-turn">🤖 ${pl.name} joue…</div>`; return; }
    act.appendChild(btn("Passer le tour", "", () => { G.pass(state, state.current); afterAction(); }));
  }

  // ---------- PAGE QUARTIER ----------
  function renderDistrict() {
    const d = distById(currentDistrict);
    const t = tile(currentDistrict);
    $("#district-title").textContent = (d.jewel ? "👑 " : "") + d.name;
    $("#district-art").innerHTML = `
      <img class="district-img" src="assets/districts/${d.code}.jpg" alt=""
           onerror="if(this.src.endsWith('.jpg')){this.src=this.src.slice(0,-4)+'.png'}else{this.remove()}">
      <div class="district-art-overlay"><span>${d.name}</span></div>`;
    const ctrl = G.tileControl(state, t);
    const leader = ctrl.leader != null ? state.players[ctrl.leader] : null;
    $("#district-info").innerHTML = `
      <span>💎 ${d.value} PR</span><span>💵 ${d.revenue}</span>
      <span>🔥 ${t.heat}</span><span>${t.pawns.length}/${d.slots} places</span>
      <span>${leader ? "Contrôle " + leader.emoji : "Libre"}</span>
      ${t.protectedThisRound ? "<span>🛡️ protégé</span>" : ""}${t.raidShield ? "<span>🦅 guet</span>" : ""}`;

    const pe = $("#district-pawns"); pe.innerHTML = "";
    if (!t.pawns.length) pe.innerHTML = `<div class="empty">Personne ici pour l'instant.</div>`;
    t.pawns.forEach(p => {
      const owner = state.players[p.playerIdx];
      const tok = document.createElement("div"); tok.className = "dpawn";
      tok.innerHTML = `<span class="pawn" style="background:${owner.color}">
          <span class="pawn-icon">${p.icon}</span>
          <img class="pawn-img" src="assets/clans/${owner.clanId}/emblem.png" alt="" onerror="this.remove()"></span>
        <span class="dpawn-name">${p.name}</span>`;
      pe.appendChild(tok);
    });

    renderDistrictHand();
    renderDistrictActions();
  }

  function renderDistrictHand() {
    const hand = $("#district-hand"); hand.innerHTML = "";
    const pl = state.players[state.current];
    if (state.pending) { hand.innerHTML = `<div class="hand-empty">${pendingHint(state.pending)} ↓</div>`; return; }
    if (!pl.reserve.length) { hand.innerHTML = `<div class="hand-empty">Plus personne en réserve. Tu peux passer.</div>`; return; }
    pl.reserve.forEach(m => {
      const c = document.createElement("div");
      c.className = "card";
      c.innerHTML = `
        <div class="c-banner">
          <img class="c-banner-emblem" src="assets/clans/${pl.clanId}/emblem.png" alt="" onerror="this.remove()">
          <span>${pl.clanName}</span>
        </div>
        <div class="c-media">
          <span class="c-icon">${m.icon}</span>
          <img class="c-portrait" src="assets/clans/${pl.clanId}/${m.code}.jpg" alt=""
               onerror="if(this.src.endsWith('.jpg')){this.src=this.src.slice(0,-4)+'.png'}else{this.remove()}">
          <span class="c-inf">${m.inf}★</span>
        </div>
        <div class="c-name">${m.name}</div>
        <div class="c-role">${m.role}</div>
        <div class="c-pow"><span class="c-pow-label">Pouvoir</span>${m.desc}</div>`;
      c.onclick = () => deployHere(m.code);
      hand.appendChild(c);
    });
  }

  function deployHere(code) {
    const r = G.deploy(state, state.current, code, currentDistrict);
    if (!r.ok) { toast(r.error); return; }
    selected = null;
    if (r.pending) { toast(pendingHint(r.pending)); renderDistrict(); }
    else afterAction();
  }

  function renderDistrictActions() {
    const act = $("#district-actions"); act.innerHTML = "";
    const pend = state.pending;
    if (pend) {
      pend.options.forEach(opt => {
        let label, fn;
        if (pend.type === "kill") {
          const pw = tile(pend.districtId).pawns[opt];
          label = `✖ ${pw.name} ${state.players[pw.playerIdx].emoji}`;
          fn = () => { G.resolveTarget(state, opt); afterAction(); };
        } else {
          const pw = tile(opt.from).pawns[opt.i];
          const dn = distById(opt.from).name;
          label = `${pend.type === "buff" ? "🖋️" : "🚗"} ${pw.name} (${dn})`;
          fn = () => { G.resolveTarget(state, opt); afterAction(); };
        }
        act.appendChild(btn(label, "", fn));
      });
      act.appendChild(btn("Renoncer", "warn", () => { G.skipPending(state); afterAction(); }));
      return;
    }
    act.appendChild(btn("Passer le tour", "", () => { G.pass(state, state.current); afterAction(); }));
  }

  function pendingHint(p) {
    if (p.type === "kill") return "Choisis la cible à éliminer";
    if (p.type === "move") return "Choisis le pion à faire venir";
    if (p.type === "buff") return "Choisis le pion à renforcer";
    return "";
  }

  function btn(label, cls, fn) { const b = document.createElement("button"); b.textContent = label; if (cls) b.className = cls; b.onclick = fn; return b; }

  // ---------- Overlay & toast ----------
  function standingsHTML() {
    const sorted = [...state.players].sort((a, b) => b.pr - a.pr);
    return `<div class="standings"><b>Classement</b>` + sorted.map(p =>
      `<div class="srow"><span class="pdot" style="background:${p.color}"></span>${p.emoji} ${p.name} <b>${p.pr} PR</b></div>`).join("") + `</div>`;
  }
  function openOverlay(title, bodyHTML, btnText, onClick) {
    $("#overlay-title").textContent = title; $("#overlay-body").innerHTML = bodyHTML;
    const b = $("#overlay-btn"); b.textContent = btnText; b.onclick = onClick;
    $("#overlay").classList.add("show");
  }
  function closeOverlay() { $("#overlay").classList.remove("show"); }

  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  // back depuis la page quartier
  $("#district-back").onclick = () => closeDistrict();
})();
