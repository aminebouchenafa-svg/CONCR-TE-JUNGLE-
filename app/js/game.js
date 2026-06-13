// Concrete Jungle — moteur de jeu (logique pure, sans DOM).
// API : window.CJ_GAME

(function () {
  const { DISTRICTS, ROLES, ROLE_ORDER, CLANS, CONFIG } = window.CJ_DATA;

  function clanById(id) { return CLANS.find(c => c.id === id); }
  function district(id) { return DISTRICTS.find(d => d.id === id); }

  // --- Création de la partie -------------------------------------------------
  // players: [{ clanId, name, isAI }]
  function createGame(players) {
    const state = {
      players: players.map((p, idx) => {
        const clan = clanById(p.clanId);
        return {
          idx,
          name: p.name,
          isAI: !!p.isAI,
          clanId: p.clanId,
          clanName: clan.name,
          color: clan.color,
          emoji: clan.emoji,
          money: CONFIG.startMoney,
          pr: 0,
          reserve: ROLE_ORDER.map(role => ({
            role,
            name: clan.names[role],
            influence: ROLES[role].influence,
          })),
          prison: [], // membres arrêtés, reviennent en réserve à la manche suivante
        };
      }),
      board: DISTRICTS.map(d => ({ id: d.id, pawns: [], heat: 0, protectedThisRound: false })),
      round: 1,
      current: 0,
      passed: players.map(() => false),
      phase: "placement", // placement | end
      pending: null,      // sélection de cible en cours
      log: [],
      winner: null,
    };
    state.log.push(`Manche 1 — la guerre commence.`);
    return state;
  }

  function tile(state, id) { return state.board.find(t => t.id === id); }

  // --- Calcul d'influence ----------------------------------------------------
  function clanInfluenceInTile(t, playerIdx) {
    const mine = t.pawns.filter(p => p.playerIdx === playerIdx);
    if (mine.length === 0) return 0;
    const hasChef = mine.some(p => p.role === "chef");
    let inf = 0;
    for (const p of mine) inf += ROLES[p.role].influence + (hasChef ? 1 : 0);
    return inf;
  }

  // renvoie { leader: playerIdx|null, contested: bool, scores: {idx:inf} }
  function tileControl(state, t) {
    const scores = {};
    for (const pl of state.players) {
      const inf = clanInfluenceInTile(t, pl.idx);
      if (inf > 0) scores[pl.idx] = inf;
    }
    let leader = null, best = 0, contested = false;
    for (const idx in scores) {
      const v = scores[idx];
      if (v > best) { best = v; leader = +idx; contested = false; }
      else if (v === best) { contested = true; }
    }
    return { leader: contested ? null : leader, contested, scores };
  }

  // --- Validité d'un déploiement --------------------------------------------
  function tileHasFreeSlot(state, id) {
    return tile(state, id).pawns.length < district(id).slots;
  }
  function reserveMember(state, playerIdx, role) {
    return state.players[playerIdx].reserve.find(m => m.role === role);
  }

  // --- Déploiement -----------------------------------------------------------
  // Retourne { ok, pending? , error? }
  function deploy(state, playerIdx, role, districtId) {
    if (state.phase !== "placement") return { ok: false, error: "Phase invalide." };
    if (state.current !== playerIdx) return { ok: false, error: "Ce n'est pas ton tour." };
    if (state.pending) return { ok: false, error: "Résous d'abord l'action en cours." };
    const member = reserveMember(state, playerIdx, role);
    if (!member) return { ok: false, error: "Membre indisponible." };
    if (!tileHasFreeSlot(state, districtId)) return { ok: false, error: "Quartier plein." };

    // retire de la réserve, pose sur le plateau
    const pl = state.players[playerIdx];
    pl.reserve = pl.reserve.filter(m => m.role !== role);
    const t = tile(state, districtId);
    const pawn = { playerIdx, role, name: member.name };
    t.pawns.push(pawn);
    state.log.push(`${pl.emoji} ${member.name} (${ROLES[role].label}) débarque à ${district(districtId).name}.`);

    const pending = applyDeployPower(state, playerIdx, pawn, t);
    if (pending) { state.pending = pending; return { ok: true, pending }; }
    return { ok: true };
  }

  // Applique l'effet immédiat ; renvoie un objet "pending" si une cible est requise.
  function applyDeployPower(state, playerIdx, pawn, t) {
    const pl = state.players[playerIdx];
    switch (pawn.role) {
      case "cuisinier":
        pl.money += 3;
        t.heat = Math.max(0, t.heat - 1);
        state.log.push(`${pl.emoji} Blanchiment : +3 argent, -1 chaleur à ${district(t.id).name}.`);
        return null;
      case "corrupteur":
        t.heat = Math.max(0, t.heat - 2);
        state.log.push(`${pl.emoji} Corruption : -2 chaleur à ${district(t.id).name}.`);
        return null;
      case "protecteur":
        t.protectedThisRound = true;
        state.log.push(`${pl.emoji} ${district(t.id).name} est désormais intouchable ce tour.`);
        return null;
      case "tueur": {
        if (t.protectedThisRound) return null;
        const targets = t.pawns
          .map((p, i) => ({ p, i }))
          .filter(o => o.p.playerIdx !== playerIdx);
        if (targets.length === 0) return null;
        return { type: "kill", playerIdx, districtId: t.id,
                 options: targets.map(o => o.i) };
      }
      case "chauffeur": {
        // pions du joueur situés dans d'AUTRES quartiers
        const movable = [];
        for (const tt of state.board) {
          if (tt.id === t.id) continue;
          tt.pawns.forEach((p, i) => { if (p.playerIdx === playerIdx) movable.push({ from: tt.id, i }); });
        }
        if (movable.length === 0) return null;
        if (!tileHasFreeSlot(state, t.id)) return null; // (le tueur vient de prendre la place ? non, slot déjà vérifié)
        return { type: "move", playerIdx, districtId: t.id, options: movable };
      }
      default:
        return null; // chef / soldat : pas d'effet au déploiement (aura gérée au calcul)
    }
  }

  // --- Résolution d'une cible (kill / move) ---------------------------------
  function resolveTarget(state, choice) {
    const pend = state.pending;
    if (!pend) return { ok: false, error: "Aucune action en attente." };

    if (pend.type === "kill") {
      // choice = index du pion dans le quartier
      const t = tile(state, pend.districtId);
      const victim = t.pawns[choice];
      if (!victim || victim.playerIdx === pend.playerIdx) return { ok: false, error: "Cible invalide." };
      t.pawns.splice(choice, 1);
      sendToPrison(state, victim);
      t.heat += CONFIG.killHeat;
      state.log.push(`☠️ ${victim.name} est éliminé à ${district(t.id).name}. (+${CONFIG.killHeat} chaleur)`);
      state.pending = null;
      return { ok: true };
    }

    if (pend.type === "move") {
      // choice = { from, i }
      const from = tile(state, choice.from);
      const pawn = from.pawns[choice.i];
      if (!pawn || pawn.playerIdx !== pend.playerIdx) return { ok: false, error: "Cible invalide." };
      if (!tileHasFreeSlot(state, pend.districtId)) { state.pending = null; return { ok: false, error: "Quartier plein." }; }
      from.pawns.splice(choice.i, 1);
      tile(state, pend.districtId).pawns.push(pawn);
      state.log.push(`🚗 ${pawn.name} est rapatrié vers ${district(pend.districtId).name}.`);
      state.pending = null;
      return { ok: true };
    }
    return { ok: false, error: "Type inconnu." };
  }

  // Le joueur peut renoncer au pouvoir optionnel (tueur/chauffeur)
  function skipPending(state) {
    if (state.pending) { state.log.push(`Pouvoir non utilisé.`); state.pending = null; }
    return { ok: true };
  }

  function sendToPrison(state, pawn) {
    const owner = state.players[pawn.playerIdx];
    owner.prison.push({ role: pawn.role, name: pawn.name, influence: ROLES[pawn.role].influence });
  }

  // --- Passer / avancer le tour ---------------------------------------------
  function pass(state, playerIdx) {
    if (state.current !== playerIdx) return { ok: false, error: "Pas ton tour." };
    if (state.pending) return { ok: false, error: "Action en attente." };
    state.passed[playerIdx] = true;
    state.log.push(`${state.players[playerIdx].emoji} ${state.players[playerIdx].name} passe.`);
    return { ok: true };
  }

  function everyonePassed(state) {
    // un joueur sans réserve est considéré comme ayant passé
    return state.players.every((pl, i) => state.passed[i] || pl.reserve.length === 0);
  }

  // avance au prochain joueur actif ; renvoie true si la phase de placement continue
  function advanceTurn(state) {
    if (everyonePassed(state)) return false;
    let n = state.players.length, i = state.current;
    do { i = (i + 1) % n; } while (state.passed[i] || state.players[i].reserve.length === 0);
    state.current = i;
    return true;
  }

  // --- Fin de manche : police puis contrôle ---------------------------------
  function resolvePolice(state) {
    const events = [];
    for (const t of state.board) {
      if (t.heat >= CONFIG.raidThreshold) {
        // clan(s) avec le plus de pions
        const counts = {};
        for (const p of t.pawns) counts[p.playerIdx] = (counts[p.playerIdx] || 0) + 1;
        let max = 0; for (const k in counts) max = Math.max(max, counts[k]);
        const losers = Object.keys(counts).filter(k => counts[k] === max).map(Number);
        for (const li of losers) {
          // retire un pion (de préférence pas le chef)
          const idxs = t.pawns.map((p, i) => ({ p, i })).filter(o => o.p.playerIdx === li);
          idxs.sort((a, b) => (a.p.role === "chef" ? 1 : 0) - (b.p.role === "chef" ? 1 : 0));
          const target = idxs[0];
          if (target) {
            const victim = t.pawns.splice(target.i, 1)[0];
            sendToPrison(state, victim);
            events.push(`🚨 Rafle à ${district(t.id).name} : ${state.players[li].emoji} ${victim.name} arrêté.`);
          }
        }
        t.heat = Math.max(0, t.heat - CONFIG.raidHeatRelief);
      }
    }
    if (events.length === 0) events.push("Aucune rafle cette manche.");
    return events;
  }

  function resolveControl(state) {
    const events = [];
    for (const t of state.board) {
      const d = district(t.id);
      const { leader, contested } = tileControl(state, t);
      if (leader !== null) {
        const pl = state.players[leader];
        pl.pr += d.value;
        pl.money += d.revenue;
        events.push(`${pl.emoji} contrôle ${d.name} : +${d.value} PR, +${d.revenue} argent.`);
      } else if (contested) {
        t.heat += 1;
        events.push(`⚔️ ${d.name} est contesté : personne ne marque (+1 chaleur).`);
      }
    }
    return events;
  }

  // libère les prisons, réinitialise protections, prépare la manche suivante
  function endRound(state) {
    for (const pl of state.players) {
      if (pl.prison.length) {
        pl.reserve.push(...pl.prison);
        pl.prison = [];
      }
    }
    for (const t of state.board) t.protectedThisRound = false;

    if (state.round >= CONFIG.rounds) {
      finalizeGame(state);
      return;
    }
    state.round += 1;
    state.passed = state.players.map(() => false);
    // premier joueur tournant
    state.current = (state.round - 1) % state.players.length;
    state.log.push(`— Manche ${state.round} —`);
  }

  function finalizeGame(state) {
    // bonus joyau (Manhattan) au contrôleur final
    const jewel = state.board.find(t => district(t.id).jewel);
    const { leader } = tileControl(state, jewel);
    if (leader !== null) {
      state.players[leader].pr += CONFIG.jewelBonus;
      state.log.push(`${state.players[leader].emoji} tient Manhattan : +${CONFIG.jewelBonus} PR (joyau).`);
    }
    // argent restant -> PR
    for (const pl of state.players) {
      const bonus = Math.floor(pl.money / CONFIG.moneyPerPR);
      if (bonus) { pl.pr += bonus; state.log.push(`${pl.emoji} convertit son argent : +${bonus} PR.`); }
    }
    // vainqueur
    let win = null, best = -1;
    for (const pl of state.players) {
      const ctrl = state.board.filter(t => tileControl(state, t).leader === pl.idx).length;
      pl._tieCtrl = ctrl;
      if (pl.pr > best || (pl.pr === best && win && ctrl > win._tieCtrl)) { best = pl.pr; win = pl; }
    }
    state.winner = win ? win.idx : null;
    state.phase = "end";
    state.log.push(`🏆 ${win ? win.name + " (" + win.clanName + ")" : "personne"} devient maître de la Concrete Jungle !`);
  }

  // --- IA (mode solo & remplissage) -----------------------------------------
  // Joue un coup complet pour un joueur IA (deploy + éventuelle cible) ou passe.
  function aiPlay(state, playerIdx) {
    const pl = state.players[playerIdx];
    if (pl.reserve.length === 0) { return pass(state, playerIdx); }

    // évaluer chaque (rôle, quartier) candidat
    let bestScore = -Infinity, bestMove = null;
    const freeTiles = state.board.filter(t => tileHasFreeSlot(state, t.id));
    for (const t of freeTiles) {
      const d = district(t.id);
      const ctrl = tileControl(state, t);
      const myInf = ctrl.scores[playerIdx] || 0;
      const oppMax = Math.max(0, ...Object.entries(ctrl.scores)
        .filter(([k]) => +k !== playerIdx).map(([, v]) => v));
      const deficit = oppMax - myInf;
      for (const m of pl.reserve) {
        let score = d.value;
        const gain = ROLES[m.role].influence + (t.pawns.some(p => p.playerIdx === playerIdx && p.role === "chef") || m.role === "chef" ? 1 : 0);
        // prendre/garder la tête est précieux
        if (myInf + gain > oppMax) score += 3;
        if (deficit > 0 && deficit <= gain) score += 2;
        // le tueur adore les quartiers où l'ennemi domine
        if (m.role === "tueur" && oppMax > 0 && deficit > 0 && !t.protectedThisRound) score += 3;
        if (m.role === "soldat") score += 1;
        if (m.role === "cuisinier" && pl.money < 2) score += 1;
        // un peu de bruit pour éviter le déterminisme total
        score += Math.random() * 0.5;
        if (score > bestScore) { bestScore = score; bestMove = { role: m.role, districtId: t.id }; }
      }
    }
    if (!bestMove) return pass(state, playerIdx);

    // si le meilleur coup est faible et qu'on a peu d'intérêt, passer parfois en fin de manche
    const r = deploy(state, playerIdx, bestMove.role, bestMove.districtId);
    if (r.pending) {
      if (r.pending.type === "kill") {
        // tuer le pion adverse le plus fort (soldat/chef en priorité)
        const t = tile(state, r.pending.districtId);
        let pick = r.pending.options[0], pri = -1;
        for (const i of r.pending.options) {
          const p = t.pawns[i];
          const w = ROLES[p.role].influence + (p.role === "chef" ? 2 : 0);
          if (w > pri) { pri = w; pick = i; }
        }
        resolveTarget(state, pick);
      } else if (r.pending.type === "move") {
        // rapatrier un pion d'un quartier où l'on est déjà perdant
        resolveTarget(state, r.pending.options[0]);
      }
    }
    return { ok: true };
  }

  window.CJ_GAME = {
    createGame, deploy, resolveTarget, skipPending, pass,
    advanceTurn, everyonePassed, resolvePolice, resolveControl, endRound,
    tileControl, clanInfluenceInTile, tileHasFreeSlot, aiPlay,
    helpers: { clanById, district },
  };
})();
