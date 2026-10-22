/* Serve First: Company. Pure game logic, no DOM. Every function returns a new state. */
(function (root) {
  const DAYS = 20;
  const START_CASH = 30; // $k
  const PAYROLL = 2; // $k per person per day
  const RENT = 14; // $k, due every Friday
  const PROD = { maya: 3, leo: 2.5, sam: 4, priya: 3 }; // $k earned per committed day
  const KIND = { maya: 'coop', leo: 'rider', sam: 'star', priya: 'private' };
  const IDS = ['maya', 'leo', 'sam', 'priya', 'h1', 'h2']; // h1, h2: open seats you can recruit into
  const REVEAL_DAYS = 3; // a hire's real type shows after this many days at work
  // Your revenue multiplier for (your move, rival move). C = hold price, D = undercut. A prisoner's dilemma.
  const MARKET = { CC: 1, CD: 0.55, DC: 1.3, DD: 0.7 };
  const RIVALS = ['tft', 'grim', 'shark', 'forgiver'];
  const clamp = v => Math.max(0, Math.min(100, v));
  const cap = id => id[0].toUpperCase() + id.slice(1);
  const round1 = v => Math.round(v * 10) / 10;
  const clampShare = v => Math.max(20, Math.min(80, v));

  // Random shocks: the market does not care about your plans.
  const SHOCKS = [
    { t: 'Server outage: half of today\'s sales were lost.', earn: 0.5 },
    { t: 'A post about your product went viral: +$4k.', cash: 4 },
    { t: 'A client paid late: −$4k this week.', cash: -4 },
    { t: 'The whole market dipped: your share fell 5 points.', share: -5 },
    { t: 'Surprise tax bill: −$3k.', cash: -3 },
    { t: 'Flu in the office: someone is off tomorrow.', sick: true }
  ];

  function newState(company, industry, rand = Math.random) {
    const team = {};
    IDS.forEach(id => {
      team[id] = KIND[id]
        ? { eng: 60, here: true, out: 0, name: null, kind: KIND[id], prod: PROD[id], pay: PAYROLL, days: 0 }
        : { eng: 0, here: false, open: true, out: 0, name: null, kind: null, prod: 0, pay: 0, days: 0 };
    });
    return {
      company, industry, day: 1, cash: START_CASH, revenue: 0,
      trust: 50, acc: 30, load: 40, reveal: 0, lastShare: 1,
      share: 50, market: null, rival: { strat: RIVALS[Math.floor(rand() * RIVALS.length)], hist: [] },
      team, flags: {}, queue: ['kickoff'], used: [], styles: [], concepts: {},
      committed: {}, over: null
    };
  }

  const here = (s, id) => s.team[id].here;
  const working = (s, id) => s.team[id].here && s.team[id].out === 0;
  const hasSeat = s => IDS.some(id => !s.team[id].here);

  // Each follower type's strategy: does this person commit today?
  function commits(s, id) {
    const p = s.team[id];
    if (!working(s, id)) return false;
    if (p.kind === 'rider') return s.acc >= (s.flags.commission ? 30 : 50) || p.eng >= 85;
    if (p.kind === 'coop') return p.eng >= 40 && s.lastShare >= 0.5;
    if (p.kind === 'lemon') return p.eng >= 75;
    return p.eng >= 40;
  }

  // The rival's hidden strategy, played against your past market moves.
  function rivalMove(strat, hist) {
    const mine = hist.map(h => h.me);
    const last = mine[mine.length - 1];
    if (strat === 'tft') return last || 'C';
    if (strat === 'grim') return mine.includes('D') ? 'D' : 'C';
    if (strat === 'shark') return hist.length ? 'D' : 'C'; // cooperates once as bait
    return last === 'D' && mine[mine.length - 2] === 'D' ? 'D' : 'C'; // forgiver: tit for two tats
  }

  // fx keys: all, <id> (engagement), trust, acc, cash, load, reveal, share, market, rival, set, leave, out, queue, hire
  function applyFx(s, fx) {
    const team = {};
    IDS.forEach(id => {
      const p = s.team[id];
      const d = p.here ? (fx.all || 0) + (fx[id] || 0) : 0;
      team[id] = { ...p, eng: clamp(p.eng + d), out: fx.out && fx.out[id] ? p.out + fx.out[id] : p.out };
    });
    if (fx.leave && team[fx.leave].here) team[fx.leave] = { ...team[fx.leave], here: false, out: 0 };
    if (fx.hire) {
      const id = IDS.find(x => !team[x].here);
      if (id) {
        const old = team[id];
        team[id] = { ...fx.hire, here: true, open: false, out: 0, days: 0, kind: fx.hire.kind || old.kind || 'coop', prod: fx.hire.prod || old.prod || 3, pay: fx.hire.pay || PAYROLL };
      }
    }
    return {
      ...s, team,
      trust: clamp(s.trust + (fx.trust || 0)),
      acc: clamp(s.acc + (fx.acc || 0)),
      load: clamp(s.load + (fx.load || 0)),
      cash: s.cash + (fx.cash || 0),
      share: clampShare(s.share + (fx.share || 0)),
      market: fx.market || s.market,
      rival: fx.rival ? { ...s.rival, strat: fx.rival } : s.rival,
      reveal: Math.max(s.reveal, fx.reveal || 0),
      flags: { ...s.flags, ...(fx.set || {}) },
      queue: fx.queue ? [...s.queue, fx.queue] : s.queue
    };
  }

  // Record a move: its effects, its style (for the ending) and the concept it teaches.
  function play(s, option) {
    const next = applyFx(s, typeof option.fx === 'function' ? option.fx(s) : option.fx);
    return {
      ...next,
      styles: option.style ? [...s.styles, option.style] : s.styles,
      concepts: { ...s.concepts, [option.c]: option.x }
    };
  }

  function endDay(s, rand = Math.random) {
    const events = [];
    const committed = {};
    IDS.forEach(id => { committed[id] = commits(s, id); });

    // Market round against the rival: both move at once, the payoff multiplies today's sales.
    const me = s.market || 'C';
    const them = rivalMove(s.rival.strat, s.rival.hist);
    const key = s.flags.matchClause && me === 'C' && them === 'D' ? 'DD' : me + them; // price-match guarantee
    const mult = MARKET[key];
    let share = clampShare(s.share + (key === 'DC' ? 4 : key === 'CD' ? -4 : 0));

    const shock = rand() < 0.25 ? SHOCKS[Math.floor(rand() * SHOCKS.length)] : null;
    if (shock) events.push(shock.t);
    if (shock && shock.share) share = clampShare(share + shock.share);
    const base = IDS.reduce((sum, id) => sum + (committed[id] ? s.team[id].prod : 0), 0);
    const earned = round1(base * mult * (share / 50) * (shock && shock.earn ? shock.earn : 1));
    const payroll = IDS.reduce((sum, id) => sum + (here(s, id) ? s.team[id].pay : 0), 0);
    const rent = s.day % 5 === 0 ? RENT : 0;
    const atWork = IDS.filter(id => working(s, id)).length;
    const effort = atWork ? IDS.filter(id => committed[id]).length / atWork : 0;

    // Trust slowly pulls engagement up or down: the leader's reputation in the repeated game.
    const drift = Math.round((s.trust - 50) / 20);
    const team = {};
    IDS.forEach(id => {
      const p = s.team[id];
      team[id] = p.here ? { ...p, eng: clamp(p.eng + drift), out: Math.max(0, p.out - 1), days: p.days + (p.out === 0 ? 1 : 0) } : p;
    });
    if (shock && shock.sick) {
      const fit = IDS.filter(id => team[id].here && team[id].out === 0);
      if (fit.length) { const id = fit[Math.floor(rand() * fit.length)]; team[id] = { ...team[id], out: 1 }; }
    }

    // Priya's private information: her load rises every day and only she can see it.
    let load = clamp(s.load + 6);
    let queue = s.queue;
    let flags = s.flags;
    if (team.priya.here) {
      if (load >= 100) {
        team.priya = { ...team.priya, out: 4, eng: clamp(team.priya.eng - 15) };
        load = 50;
        events.push('Priya burned out and is off sick for 4 days. Nobody knew how overloaded she was.');
      } else if (load >= 70 && s.trust >= 50 && !flags.signalled) {
        queue = [...queue, 'priya-red'];
        flags = { ...flags, signalled: true };
      }
    }
    if (load < 60 && flags.signalled) flags = { ...flags, signalled: false };

    IDS.forEach(id => {
      const p = team[id];
      if (!p.here) return;
      const quits = p.kind === 'star' ? (flags.samOffer && p.eng < 45) || p.eng < 25 : p.eng < 15;
      if (!quits) return;
      team[id] = { ...p, here: false, out: 0 };
      events.push(`${p.name || cap(id)} resigned.${p.kind === 'star' && flags.samOffer ? ' The outside offer was worth more than staying.' : ''}`);
      if (!queue.includes('hire')) queue = [...queue, 'hire'];
    });

    // Pressure from outside: a rival that keeps cutting starts poaching, and the board checks in on day 10.
    const prev = s.rival.hist[s.rival.hist.length - 1];
    if (them === 'D' && prev && prev.them === 'D' && !queue.includes('poach') && s.day - (flags.poachDay || -9) >= 5) {
      queue = [...queue, 'poach'];
      flags = { ...flags, poachDay: s.day };
    }
    if (s.day === 9) queue = [...queue, 'board'];

    const cash = round1(s.cash + earned - payroll - rent + (shock && shock.cash ? shock.cash : 0));
    const day = s.day + 1;
    const over = cash < 0 ? 'bankrupt' : IDS.every(id => !team[id].here) ? 'empty' : day > DAYS ? 'done' : null;
    return {
      s: {
        ...s, team, load, queue, flags, cash, day, committed, over, share,
        market: null, rival: { ...s.rival, hist: [...s.rival.hist, { me, them }] },
        revenue: round1(s.revenue + earned), lastShare: effort,
        acc: clamp(s.acc - 5), reveal: Math.max(0, s.reveal - 1)
      },
      report: { earned, payroll, rent, committed, events, me, them, mult }
    };
  }

  // Three applicants. Each knows their own type; you see only noisy signals (Akerlof's lemons, Spence's signals).
  const POOL = ['coop', 'coop', 'star', 'rider', 'lemon', 'lemon'];
  const APPLICANT = {
    coop: { prod: 3, pay: 2, interview: 62, referral: 0.6 },
    star: { prod: 4.5, pay: 3, interview: 70, referral: 0.7 },
    rider: { prod: 3, pay: 2, interview: 82, referral: 0.2 }, // charming in interviews
    lemon: { prod: 1.5, pay: 0, interview: 74, referral: 0.1 } // polished; copies the asking pay of a good type
  };
  function candidates(rand) {
    return [0, 1, 2].map(() => {
      const kind = POOL[Math.floor(rand() * POOL.length)];
      const a = APPLICANT[kind];
      return { kind, prod: a.prod, pay: a.pay || (rand() < 0.5 ? 2 : 3), eng: 60, interview: clamp(Math.round(a.interview + (rand() - 0.5) * 36)), referral: rand() < a.referral };
    });
  }

  // Queued (triggered) events first, then a random unused eligible event. Some days are quiet.
  function pickEvent(s, events, rand) {
    const byId = id => events.find(e => e.id === id);
    const qi = s.queue.findIndex(id => { const e = byId(id); return e && (!e.when || e.when(s)); });
    if (qi >= 0) {
      const ev = byId(s.queue[qi]);
      return { ev, s: { ...s, queue: s.queue.filter((_, i) => i !== qi), used: [...s.used, ev.id] } };
    }
    if (rand() < 0.1) return { ev: null, s };
    const pool = events.filter(e => !e.triggered && !s.used.includes(e.id) && (!e.when || e.when(s)));
    if (!pool.length) return { ev: null, s };
    const ev = pool[Math.floor(rand() * pool.length)];
    return { ev, s: { ...s, used: [...s.used, ev.id] } };
  }

  function archetype(s) {
    const n = st => s.styles.filter(x => x === st).length;
    const hard = n('command') + n('unfair') + n('ignore');
    const soft = n('serve');
    const smart = n('conditional') + n('listen');
    if (smart >= hard && smart >= soft && s.trust >= 55) return 'strategic';
    if (hard > smart && hard >= soft) return 'commander';
    if (soft > smart && soft >= hard) return 'saint';
    return 'builder';
  }

  root.Engine = { DAYS, START_CASH, PAYROLL, RENT, PROD, IDS, MARKET, RIVALS, REVEAL_DAYS, newState, commits, rivalMove, applyFx, play, endDay, candidates, pickEvent, archetype, here, hasSeat };
  if (typeof module !== 'undefined') module.exports = root.Engine;
})(typeof window !== 'undefined' ? window : globalThis);
