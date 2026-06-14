// Concrete Jungle — moteur de jeu (v0.2 : pouvoirs uniques par personnage).
(function () {
  const { DISTRICTS, CLANS, CONFIG } = window.CJ_DATA;
  const clanById = id => CLANS.find(c => c.id === id);
  const district = id => DISTRICTS.find(d => d.id === id);

  // --- Création -------------------------------------------------------------
  function createGame(players) {
    const state = {
      players: players.map((p, idx) => {
        const clan = clanById(p.clanId);
        return {
          idx, name: p.name, isAI: !!p.isAI,
          clanId: p.clanId, clanName: clan.name, color: clan.color, emoji: clan.emoji,
          money: CONFIG.startMoney, pr: 0,
          reserve: clan.members.map(mm => ({ ...mm })),
          prison: [],
          noHeatRound: false, coldBlood: false, shieldClan: false,
          earnOnKill: false, extraDeploy: false,
        };
      }),
      board: DISTRICTS.map(d => ({ id: d.id, pawns: [], heat: 0,
        protectedThisRound: false, raidShield: false, mods: [], tieWin: null })),
      round: 1, current: 0, passed: players.map(() => false),
      phase: "placement", pending: null, log: [], winner: null,
    };
    state.log.push("Manche 1 — la guerre commence.");
    return state;
  }

  const tile = (s, id) => s.board.find(t => t.id === id);
  const countPawns = (s, p) => s.board.reduce((n, t) => n + t.pawns.filter(x => x.playerIdx === p).length, 0);
  const tileHasFreeSlot = (s, id) => tile(s, id).pawns.length < district(id).slots;

  // --- Influence ------------------------------------------------------------
  function clanInfluenceInTile(s, t, p) {
    const mine = t.pawns.filter(x => x.playerIdx === p);
    let total = 0;
    const chef = mine.find(x => x.code === "chef");
    const hasChef = !!chef;
    const money = s.players[p].money;
    for (const pw of mine) {
      let v = pw.inf + (pw.bonus || 0);
      if (hasChef) v += 1;                                   // aura du chef
      if (pw.power === "dbl" && money >= 5) v += pw.inf;     // faussaire
      total += v;
    }
    if (hasChef && chef.power === "aura_swarm" && countPawns(s, p) >= 3) total += 1; // caïd
    for (const md of t.mods) if (md.p === p) total += md.delta;                      // intimidate / hype / tag
    return total;
  }

  function tileControl(s, t) {
    const scores = {};
    for (const pl of s.players) {
      const inf = clanInfluenceInTile(s, t, pl.idx);
      if (inf > 0) scores[pl.idx] = inf;
    }
    let leader = null, best = 0, contested = false;
    for (const idx in scores) {
      const v = scores[idx];
      if (v > best) { best = v; leader = +idx; contested = false; }
      else if (v === best) { contested = true; }
    }
    // bras droit : gagne les égalités
    if (contested && best > 0) {
      const tied = Object.keys(scores).filter(k => scores[k] === best).map(Number);
      if (t.tieWin != null && tied.includes(t.tieWin)) { leader = t.tieWin; contested = false; }
    }
    return { leader: contested ? null : leader, contested, scores };
  }

  function districtsControlled(s, p) {
    return s.board.filter(t => tileControl(s, t).leader === p).length;
  }
  function leadingRival(s, t, me) {
    let best = 0, who = null;
    for (const pl of s.players) {
      if (pl.idx === me) continue;
      const inf = clanInfluenceInTile(s, t, pl.idx);
      if (inf > best) { best = inf; who = pl.idx; }
    }
    return who;
  }

  // --- Déploiement ----------------------------------------------------------
  function deploy(s, p, code, districtId) {
    if (s.phase !== "placement" || s.current !== p) return { ok: false, error: "Pas ton tour." };
    if (s.pending) return { ok: false, error: "Action en cours." };
    const member = s.players[p].reserve.find(mm => mm.code === code);
    if (!member) return { ok: false, error: "Membre indisponible." };
    if (!tileHasFreeSlot(s, districtId)) return { ok: false, error: "Quartier plein." };

    s.players[p].reserve = s.players[p].reserve.filter(mm => mm.code !== code);
    const t = tile(s, districtId);
    const pawn = { playerIdx: p, code: member.code, role: member.role, name: member.name,
                   inf: member.inf, power: member.power, icon: member.icon, bonus: 0 };
    t.pawns.push(pawn);
    s.log.push(`${s.players[p].emoji} ${member.name} (${member.role}) arrive à ${district(districtId).name}.`);

    const pending = applyPower(s, p, pawn, t);
    if (pending) { s.pending = pending; return { ok: true, pending }; }
    return { ok: true };
  }

  function addMod(t, p, delta) { t.mods.push({ p, delta }); }
  const cool = (t, n) => { t.heat = Math.max(0, t.heat - n); };

  function applyPower(s, p, pawn, t) {
    const pl = s.players[p];
    switch (pawn.power) {
      case "aura": return null;
      case "aura_swarm": return null;
      case "aura_earn": pl.earnOnKill = true; return null;
      case "aura_disc": pl.noHeatRound = true; return null;
      case "aura_cold": pl.coldBlood = true; return null;

      case "cool2": cool(t, 2); return null;
      case "cool3": cool(t, 3); return null;
      case "money2": pl.money += 2; return null;
      case "money3": pl.money += 3; return null;
      case "money4": pl.money += 4; return null;
      case "money3cool": pl.money += 3; cool(t, 1); return null;
      case "money4heat": pl.money += 4; t.heat += 1; return null;
      case "dbl": pl.money += 2; return null;
      case "heat1": t.heat += 1; return null;
      case "money_scale": pl.money += districtsControlled(s, p); return null;

      case "protect": t.protectedThisRound = true; return null;
      case "protect_intim": {
        t.protectedThisRound = true;
        const r = leadingRival(s, t, p); if (r != null) addMod(t, r, -1);
        return null;
      }
      case "intimidate": {
        const r = leadingRival(s, t, p); if (r != null) addMod(t, r, -1);
        return null;
      }
      case "antiraid": t.raidShield = true; return null;
      case "tiewin": t.tieWin = p; return null;
      case "hype": addMod(t, p, t.pawns.filter(x => x.playerIdx === p).length); return null;
      case "shield": pl.shieldClan = true; return null;
      case "free": if (pl.reserve.length) pl.extraDeploy = true; return null;

      case "police": { // flic ripou : calme ton quartier le plus chaud
        const mine = s.board.filter(tt => tt.pawns.some(x => x.playerIdx === p) && tt.heat > 0)
                            .sort((a, b) => b.heat - a.heat)[0];
        if (mine) { cool(mine, 2); s.log.push(`${pl.emoji} étouffe la rafle à ${district(mine.id).name}.`); }
        return null;
      }
      case "heatrival": { // hacker : envoie la chaleur chez un rival
        let target = null, best = -1;
        for (const tt of s.board) for (const pl2 of s.players) {
          if (pl2.idx === p) continue;
          const inf = clanInfluenceInTile(s, tt, pl2.idx);
          if (inf > best) { best = inf; target = tt; }
        }
        if (target) { target.heat += 2; s.log.push(`${pl.emoji} fait monter la chaleur à ${district(target.id).name}.`); }
        return null;
      }
      case "steal": { // espionne
        const victim = s.players.filter(x => x.idx !== p).sort((a, b) => b.money - a.money)[0];
        if (victim) { const amt = Math.min(2, victim.money); victim.money -= amt; pl.money += amt;
          s.log.push(`${pl.emoji} vole ${amt} argent à ${victim.name}.`); }
        return null;
      }
      case "tag": { // taggeur : marque un quartier adjacent
        const adj = district(t.id).adj.map(id => tile(s, id));
        const best = adj.sort((a, b) => district(b.id).value - district(a.id).value)[0];
        if (best) { addMod(best, p, 1); s.log.push(`${pl.emoji} tague ${district(best.id).name} (+1 influence).`); }
        return null;
      }

      case "kill1": return killPending(s, p, t, 1, false);
      case "kill2": return killPending(s, p, t, 2, false);
      case "kill_panic": return killPending(s, p, t, 2, true);

      case "move": {
        const opts = [];
        for (const tt of s.board) {
          if (tt.id === t.id) continue;
          tt.pawns.forEach((pw, i) => { if (pw.playerIdx === p) opts.push({ from: tt.id, i }); });
        }
        if (pawn.code === "passeur") pl.money += 1;
        if (!opts.length || !tileHasFreeSlot(s, t.id)) return null;
        return { type: "move", playerIdx: p, districtId: t.id, options: opts };
      }
      case "buff": { // tatoueur : +1 perma à un de tes pions
        const opts = [];
        for (const tt of s.board) tt.pawns.forEach((pw, i) => { if (pw.playerIdx === p) opts.push({ from: tt.id, i }); });
        if (!opts.length) return null;
        return { type: "buff", playerIdx: p, options: opts };
      }
      default: return null;
    }
  }

  function killPending(s, p, t, heat, panic) {
    if (t.protectedThisRound) return null;
    const targets = t.pawns.map((pw, i) => ({ pw, i })).filter(o => o.pw.playerIdx !== p);
    if (!targets.length) return null;
    return { type: "kill", playerIdx: p, districtId: t.id, heat, panic, options: targets.map(o => o.i) };
  }

  // --- Résolution des cibles ------------------------------------------------
  function resolveTarget(s, choice) {
    const pend = s.pending;
    if (!pend) return { ok: false, error: "Rien à résoudre." };
    const pl = s.players[pend.playerIdx];

    if (pend.type === "kill") {
      const t = tile(s, pend.districtId);
      const victim = t.pawns[choice];
      if (!victim || victim.playerIdx === pend.playerIdx) return { ok: false, error: "Cible invalide." };
      t.pawns.splice(choice, 1);
      toPrison(s, victim);
      if (!pl.noHeatRound) t.heat += pend.heat;
      if (pl.earnOnKill) { pl.money += 1; }
      if (pend.panic) { const r = leadingRival(s, t, pend.playerIdx); if (r != null) addMod(t, r, -1); }
      s.log.push(`☠️ ${victim.name} est éliminé à ${district(t.id).name}.`);
      s.pending = null; return { ok: true };
    }
    if (pend.type === "move") {
      const from = tile(s, choice.from); const pawn = from.pawns[choice.i];
      if (!pawn || pawn.playerIdx !== pend.playerIdx) return { ok: false, error: "Cible invalide." };
      if (!tileHasFreeSlot(s, pend.districtId)) { s.pending = null; return { ok: false, error: "Quartier plein." }; }
      from.pawns.splice(choice.i, 1); tile(s, pend.districtId).pawns.push(pawn);
      s.log.push(`🚗 ${pawn.name} est repositionné vers ${district(pend.districtId).name}.`);
      s.pending = null; return { ok: true };
    }
    if (pend.type === "buff") {
      const tt = tile(s, choice.from); const pawn = tt.pawns[choice.i];
      if (!pawn || pawn.playerIdx !== pend.playerIdx) return { ok: false, error: "Cible invalide." };
      pawn.bonus = (pawn.bonus || 0) + 1;
      s.log.push(`🖋️ ${pawn.name} est tatoué : +1 influence permanente.`);
      s.pending = null; return { ok: true };
    }
    return { ok: false, error: "Type inconnu." };
  }

  function skipPending(s) { if (s.pending) { s.log.push("Pouvoir non utilisé."); s.pending = null; } return { ok: true }; }
  function toPrison(s, pawn) {
    const o = s.players[pawn.playerIdx];
    o.prison.push({ code: pawn.code, name: pawn.name, role: pawn.role, inf: pawn.inf,
                    power: pawn.power, icon: pawn.icon });
  }

  // --- Tour ----------------------------------------------------------------
  function pass(s, p) {
    if (s.current !== p) return { ok: false, error: "Pas ton tour." };
    if (s.pending) return { ok: false, error: "Action en cours." };
    s.passed[p] = true; s.log.push(`${s.players[p].emoji} ${s.players[p].name} passe.`);
    return { ok: true };
  }
  const everyonePassed = s => s.players.every((pl, i) => s.passed[i] || pl.reserve.length === 0);
  function advanceTurn(s) {
    if (everyonePassed(s)) return false;
    let i = s.current, n = s.players.length;
    do { i = (i + 1) % n; } while (s.passed[i] || s.players[i].reserve.length === 0);
    s.current = i; return true;
  }

  // --- Police --------------------------------------------------------------
  function resolvePolice(s) {
    const ev = [];
    for (const t of s.board) {
      if (t.heat < CONFIG.raidThreshold) continue;
      if (t.raidShield) { t.raidShield = false; ev.push(`🦅 Rafle évitée à ${district(t.id).name} (guet).`); continue; }
      const counts = {};
      for (const pw of t.pawns) counts[pw.playerIdx] = (counts[pw.playerIdx] || 0) + 1;
      let max = 0; for (const k in counts) max = Math.max(max, counts[k]);
      const losers = Object.keys(counts).filter(k => counts[k] === max).map(Number);
      for (const li of losers) {
        const idxs = t.pawns.map((pw, i) => ({ pw, i })).filter(o => o.pw.playerIdx === li)
          .sort((a, b) => (a.pw.code === "chef" ? 1 : 0) - (b.pw.code === "chef" ? 1 : 0));
        let target = idxs[0];
        // sang-froid du Vor : le chef échappe à sa 1ʳᵉ rafle
        if (target && target.pw.code === "chef" && s.players[li].coldBlood) {
          s.players[li].coldBlood = false;
          target = idxs.find(o => o.pw.code !== "chef") || null;
          ev.push(`⭐ ${s.players[li].emoji} le chef échappe à la rafle (sang-froid).`);
        }
        if (target) {
          const victim = t.pawns.splice(target.i, 1)[0];
          toPrison(s, victim);
          ev.push(`🚨 Rafle à ${district(t.id).name} : ${s.players[li].emoji} ${victim.name} arrêté.`);
        }
      }
      cool(t, CONFIG.raidHeatRelief);
    }
    if (!ev.length) ev.push("Aucune rafle cette manche.");
    return ev;
  }

  function resolveControl(s) {
    const ev = [];
    for (const t of s.board) {
      const d = district(t.id);
      const { leader, contested } = tileControl(s, t);
      if (leader !== null) {
        const pl = s.players[leader];
        pl.pr += d.value; pl.money += d.revenue;
        let bonus = "";
        if (t.pawns.some(x => x.playerIdx === leader && x.code === "docker")) { pl.money += 1; bonus = " (+1 docks)"; }
        ev.push(`${pl.emoji} contrôle ${d.name} : +${d.value} PR, +${d.revenue}${bonus} argent.`);
      } else if (contested) { t.heat += 1; ev.push(`⚔️ ${d.name} est contesté (+1 chaleur).`); }
    }
    return ev;
  }

  function endRound(s) {
    for (const pl of s.players) { if (pl.prison.length) { pl.reserve.push(...pl.prison); pl.prison = []; }
      pl.noHeatRound = false; pl.extraDeploy = false; }
    for (const t of s.board) { t.protectedThisRound = false; t.raidShield = false; t.mods = []; t.tieWin = null; }
    if (s.round >= CONFIG.rounds) { finalize(s); return; }
    s.round += 1; s.passed = s.players.map(() => false);
    s.current = (s.round - 1) % s.players.length;
    s.log.push(`— Manche ${s.round} —`);
  }

  function finalize(s) {
    const jewel = s.board.find(t => district(t.id).jewel);
    const jc = tileControl(s, jewel);
    if (jc.leader !== null) { s.players[jc.leader].pr += CONFIG.jewelBonus;
      s.log.push(`${s.players[jc.leader].emoji} tient Manhattan : +${CONFIG.jewelBonus} PR.`); }
    for (const pl of s.players) { const b = Math.floor(pl.money / CONFIG.moneyPerPR); if (b) pl.pr += b; }
    let win = null, best = -1;
    for (const pl of s.players) {
      const ctrl = districtsControlled(s, pl.idx); pl._ctrl = ctrl;
      if (pl.pr > best || (pl.pr === best && win && ctrl > win._ctrl)) { best = pl.pr; win = pl; }
    }
    s.winner = win ? win.idx : null; s.phase = "end";
  }

  // --- IA ------------------------------------------------------------------
  function aiPlay(s, p) {
    const pl = s.players[p];
    if (!pl.reserve.length) return pass(s, p);
    let bestScore = -Infinity, best = null;
    for (const t of s.board.filter(tt => tileHasFreeSlot(s, tt.id))) {
      const d = district(t.id);
      const ctrl = tileControl(s, t);
      const myInf = ctrl.scores[p] || 0;
      const oppMax = Math.max(0, ...Object.entries(ctrl.scores).filter(([k]) => +k !== p).map(([, v]) => v));
      for (const mm of pl.reserve) {
        let score = d.value + Math.random() * 0.5;
        const gain = mm.inf + (mm.code === "chef" || t.pawns.some(x => x.playerIdx === p && x.code === "chef") ? 1 : 0);
        if (myInf + gain > oppMax) score += 3;
        if (oppMax - myInf > 0 && oppMax - myInf <= gain) score += 2;
        if (mm.power.startsWith("kill") && oppMax > 0 && !t.protectedThisRound) score += 3;
        if (mm.power.startsWith("money") && pl.money < 3) score += 1;
        if (mm.inf >= 2) score += 1;
        if (score > bestScore) { bestScore = score; best = { code: mm.code, districtId: t.id }; }
      }
    }
    if (!best) return pass(s, p);
    const r = deploy(s, p, best.code, best.districtId);
    if (r.pending) {
      const pend = r.pending;
      if (pend.type === "kill") {
        const t = tile(s, pend.districtId);
        let pick = pend.options[0], pri = -1;
        for (const i of pend.options) { const w = t.pawns[i].inf + (t.pawns[i].code === "chef" ? 2 : 0); if (w > pri) { pri = w; pick = i; } }
        resolveTarget(s, pick);
      } else if (pend.type === "move") {
        resolveTarget(s, pend.options[0]);
      } else if (pend.type === "buff") {
        // tatouer le pion le plus fort
        let pick = pend.options[0], pri = -1;
        for (const o of pend.options) { const pw = tile(s, o.from).pawns[o.i]; const w = pw.inf + (pw.bonus || 0); if (w > pri) { pri = w; pick = o; } }
        resolveTarget(s, pick);
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
