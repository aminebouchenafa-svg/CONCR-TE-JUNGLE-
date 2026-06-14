// Concrete Jungle — contrôleur d'interface (DOM + interactions tactiles).
(function () {
  const D = window.CJ_DATA, G = window.CJ_GAME;
  const { DISTRICTS, ROLES, ROLE_ORDER, CLANS } = D;
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  let state = null;          // état de partie
  let selectedRole = null;   // membre choisi dans la main
  let setup = { mode: "local", count: 2, rows: [] };

  // ---------- Navigation d'écrans ----------
  function show(id) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]");
    if (!a) return;
    const act = a.dataset.action;
    if (act === "goto-setup") { buildSetup(); show("screen-setup"); }
    if (act === "goto-title") { show("screen-title"); }
    if (act === "start-game") { startGame(); }
  });

  // ---------- CONFIGURATION ----------
  function buildSetup() {
    // mode
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
    // compteur 2..6
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
    const players = setup.rows.map(r => ({
      clanId: r.sel.value,
      name: r.name.value.trim() || "Joueur",
      isAI: r.isAI,
    }));
    state = G.createGame(players);
    selectedRole = null;
    show("screen-game");
    startPlacementTurn();
  }

  // ---------- Boucle de tour ----------
  function currentCanAct() {
    const pl = state.players[state.current];
    return !state.passed[state.current] && pl.reserve.length > 0;
  }

  function startPlacementTurn() {
    if (G.everyonePassed(state)) { endPlacement(); return; }
    if (!currentCanAct()) { G.advanceTurn(state); }
    selectedRole = null;
    render();
    maybeAI();
  }

  function maybeAI() {
    const pl = state.players[state.current];
    if (pl.isAI && state.phase === "placement") {
      render();
      setTimeout(() => {
        G.aiPlay(state, state.current); // déploie + résout cible, ou passe
        proceed();
      }, 750);
    }
  }

  // appelé après toute action humaine terminée (sans pending)
  function proceed() {
    if (state.pending) { render(); return; }
    if (G.everyonePassed(state)) { endPlacement(); return; }
    G.advanceTurn(state);
    selectedRole = null;
    render();
    maybeAI();
  }

  function endPlacement() {
    const police = G.resolvePolice(state);
    const control = G.resolveControl(state);
    const last = state.round >= D.CONFIG.rounds;
    const events = [
      "<b>Police</b>", ...police.map(e => `<div class="ev">${e}</div>`),
      "<b>Contrôle des quartiers</b>", ...control.map(e => `<div class="ev">${e}</div>`),
    ].join("");
    openOverlay(
      `Fin de la manche ${state.round}`,
      events + standingsHTML(),
      last ? "Voir les résultats" : "Manche suivante",
      () => {
        G.endRound(state);
        if (state.phase === "end") { showResults(); }
        else { closeOverlay(); startPlacementTurn(); }
      }
    );
  }

  function showResults() {
    const sorted = [...state.players].sort((a, b) => b.pr - a.pr);
    const win = state.players[state.winner];
    let body = `<div class="winner">🏆 ${win ? win.emoji + " " + win.name + " — " + win.clanName : "Égalité"}</div>`;
    body += `<div class="standings">`;
    sorted.forEach(p => {
      body += `<div class="srow"><span class="pdot" style="background:${p.color}"></span>${p.emoji} ${p.name} <b>${p.pr} PR</b></div>`;
    });
    body += `</div>`;
    openOverlay("Maître de la Concrete Jungle", body, "Rejouer", () => {
      closeOverlay(); buildSetup(); show("screen-setup");
    });
  }

  // ---------- RENDU ----------
  function render() {
    if (!state) return;
    renderHUD();
    renderBoard();
    renderHand();
    renderActions();
  }

  function renderHUD() {
    const pl = state.players[state.current];
    const mini = state.players.map(p =>
      `<span style="color:${p.idx === state.current ? p.color : 'var(--muted)'}">${p.emoji}${p.pr}</span>`
    ).join(" · ");
    $("#game-hud").innerHTML = `
      <div class="turn"><span class="pdot" style="background:${pl.color}"></span>${pl.name}${pl.isAI ? " 🤖" : ""}</div>
      <span class="round-chip">Manche ${state.round}/${D.CONFIG.rounds}</span>
      <div class="meta" style="flex-basis:100%;justify-content:space-between">
        <span>💵 <b>${pl.money}</b> · 🃏 <b>${pl.reserve.length}</b> en réserve</span>
        <span>${mini}</span>
      </div>`;
  }

  function renderBoard() {
    const board = $("#board"); board.innerHTML = "";
    const pend = state.pending;
    for (const d of DISTRICTS) {
      const t = state.board.find(x => x.id === d.id);
      const ctrl = G.tileControl(state, t);
      const el = document.createElement("div");
      el.className = "tile" + (d.jewel ? " jewel" : "");
      const canPlace = !pend && selectedRole && G.tileHasFreeSlot(state, d.id);
      if (canPlace) el.classList.add("selectable");
      const leader = ctrl.leader != null ? state.players[ctrl.leader] : null;
      el.innerHTML = `
        <div class="tile-head">
          <span class="tile-name">${d.name}${d.protectedThisRound ? " 🛡️" : ""}</span>
          <span class="tile-val">${d.value}★ ${d.revenue}$</span>
        </div>
        <div class="tile-heat">${t.heat ? "🔥".repeat(Math.min(t.heat, 5)) + (t.heat > 5 ? t.heat : "") : ""}</div>
        ${leader ? `<span class="tile-leader" style="color:${leader.color}">${leader.emoji}</span>` : ""}
        <div class="pawns"></div>
        <span class="tile-slots">${t.pawns.length}/${d.slots}</span>`;
      const pawnsEl = el.querySelector(".pawns");
      t.pawns.forEach((p, i) => {
        const pl = state.players[p.playerIdx];
        const pe = document.createElement("span");
        pe.className = "pawn";
        pe.style.background = pl.color;
        pe.innerHTML = `<span class="pawn-icon">${ROLES[p.role].icon}</span>` +
          `<img class="pawn-img" src="assets/clans/${pl.clanId}/emblem.png" alt="" onerror="this.remove()">`;
        pe.title = p.name;
        // ciblage
        let targetable = false;
        if (pend && pend.type === "kill" && pend.districtId === d.id && p.playerIdx !== pend.playerIdx) targetable = true;
        if (pend && pend.type === "move" && p.playerIdx === pend.playerIdx &&
            pend.options.some(o => o.from === d.id && o.i === i)) targetable = true;
        if (targetable) {
          pe.classList.add("targetable");
          pe.onclick = (ev) => {
            ev.stopPropagation();
            if (pend.type === "kill") { G.resolveTarget(state, i); }
            else { G.resolveTarget(state, { from: d.id, i }); }
            proceed();
          };
        }
        pawnsEl.appendChild(pe);
      });
      if (canPlace) {
        el.onclick = () => {
          const r = G.deploy(state, state.current, selectedRole, d.id);
          if (!r.ok) { toast(r.error); return; }
          selectedRole = null;
          if (r.pending) { toast(pendingHint(r.pending)); render(); }
          else proceed();
        };
      }
      board.appendChild(el);
    }
  }

  function pendingHint(p) {
    if (p.type === "kill") return "Choisis un pion adverse à éliminer";
    if (p.type === "move") return "Choisis un de tes pions à rapatrier";
    return "";
  }

  function renderHand() {
    const hand = $("#hand"); hand.innerHTML = "";
    const pl = state.players[state.current];
    if (pl.isAI) { hand.innerHTML = `<div class="hand-empty">🤖 La Pègre réfléchit…</div>`; return; }
    if (state.pending) { hand.innerHTML = `<div class="hand-empty">${pendingHint(state.pending)} (ou renonce ci-dessous)</div>`; return; }
    if (pl.reserve.length === 0) { hand.innerHTML = `<div class="hand-empty">Plus personne en réserve. Tu peux passer.</div>`; return; }
    // ordre stable des rôles
    const ordered = ROLE_ORDER.map(r => pl.reserve.find(m => m.role === r)).filter(Boolean);
    ordered.forEach(m => {
      const role = ROLES[m.role];
      const c = document.createElement("div");
      c.className = "card" + (selectedRole === m.role ? " selected" : "");
      c.innerHTML = `
        <span class="c-inf">${role.influence}★</span>
        <div class="c-media">
          <span class="c-icon">${role.icon}</span>
          <img class="c-portrait" src="assets/clans/${pl.clanId}/${m.role}.jpg" alt="" onerror="this.remove()">
        </div>
        <div class="c-name">${m.name}</div>
        <div class="c-role">${role.label}</div>
        <div class="c-desc">${role.desc}</div>`;
      c.onclick = () => { selectedRole = (selectedRole === m.role) ? null : m.role; render(); };
      hand.appendChild(c);
    });
  }

  function renderActions() {
    const act = $("#actions"); act.innerHTML = "";
    const pl = state.players[state.current];
    if (pl.isAI) return;
    if (state.pending) {
      const skip = btn("Renoncer au pouvoir", "warn", () => { G.skipPending(state); proceed(); });
      act.appendChild(skip);
      return;
    }
    if (selectedRole) {
      act.appendChild(btn("Annuler", "", () => { selectedRole = null; render(); }));
    }
    act.appendChild(btn("Passer", "", () => { G.pass(state, state.current); proceed(); }));
  }

  function btn(label, cls, fn) {
    const b = document.createElement("button");
    b.textContent = label; if (cls) b.className = cls; b.onclick = fn; return b;
  }

  // ---------- Overlay & toast ----------
  function standingsHTML() {
    const sorted = [...state.players].sort((a, b) => b.pr - a.pr);
    return `<div class="standings"><b>Classement</b>` + sorted.map(p =>
      `<div class="srow"><span class="pdot" style="background:${p.color}"></span>${p.emoji} ${p.name} <b>${p.pr} PR</b></div>`
    ).join("") + `</div>`;
  }
  function openOverlay(title, bodyHTML, btnText, onClick) {
    $("#overlay-title").textContent = title;
    $("#overlay-body").innerHTML = bodyHTML;
    const b = $("#overlay-btn");
    b.textContent = btnText; b.onclick = onClick;
    $("#overlay").classList.add("show");
  }
  function closeOverlay() { $("#overlay").classList.remove("show"); }

  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }
})();
