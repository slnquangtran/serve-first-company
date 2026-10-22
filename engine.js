/* Serve First: Company. Pure game logic, no DOM. Every function returns a new state. */
(function (root) {
  const DAYS = 20;
  const START_CASH = 40; // $k
  const PAYROLL = 2; // $k per person per day
  const PROD = { maya: 3, leo: 2.5, sam: 4, priya: 3 }; // $k earned per committed day
  const IDS = ['maya', 'leo', 'sam', 'priya'];
  const clamp = v => Math.max(0, Math.min(100, v));
  const cap = id => id[0].toUpperCase() + id.slice(1);

  function newState(company, industry) {
    const team = {};
    IDS.forEach(id => { team[id] = { eng: 60, here: true, out: 0, name: null }; });
    return {
      company, industry, day: 1, cash: START_CASH, revenue: 0,
      trust: 50, acc: 30, load: 40, reveal: 0, lastShare: 1,
      team, flags: {}, queue: ['kickoff'], used: [], styles: [], concepts: {},
      committed: {}, over: null
    };
  }

  const here = (s, id) => s.team[id].here;
  const working = (s, id) => s.team[id].here && s.team[id].out === 0;

  // Each follower type's strategy: does this person commit today?
  function commits(s, id) {
    const p = s.team[id];
    if (!working(s, id)) return false;
    if (id === 'leo') return s.acc >= (s.flags.commission ? 30 : 50) || p.eng >= 85;
    if (id === 'maya') return p.eng >= 40 && s.lastShare >= 0.5;
    return p.eng >= 40;
  }

  // fx keys: all, <id> (engagement), trust, acc, cash, load, reveal, set, leave, out, queue, hire
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
      if (id) team[id] = { eng: fx.hire.eng, here: true, out: 0, name: fx.hire.name };
    }
    return {
      ...s, team,
      trust: clamp(s.trust + (fx.trust || 0)),
      acc: clamp(s.acc + (fx.acc || 0)),
      load: clamp(s.load + (fx.load || 0)),
      cash: s.cash + (fx.cash || 0),
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

  function endDay(s) {
    const events = [];
    const committed = {};
    IDS.forEach(id => { committed[id] = commits(s, id); });
    const earned = IDS.reduce((sum, id) => sum + (committed[id] ? PROD[id] : 0), 0);
    const payroll = IDS.filter(id => here(s, id)).length * PAYROLL;
    const atWork = IDS.filter(id => working(s, id)).length;
    const share = atWork ? IDS.filter(id => committed[id]).length / atWork : 0;

    // Trust slowly pulls engagement up or down: the leader's reputation in the repeated game.
    const drift = Math.round((s.trust - 50) / 20);
    const team = {};
    IDS.forEach(id => {
      const p = s.team[id];
      team[id] = p.here ? { ...p, eng: clamp(p.eng + drift), out: Math.max(0, p.out - 1) } : p;
    });

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
      const quits = id === 'sam' ? (flags.samOffer && p.eng < 45) || p.eng < 25 : p.eng < 15;
      if (!quits) return;
      team[id] = { ...p, here: false, out: 0 };
      events.push(`${p.name || cap(id)} resigned.${id === 'sam' && flags.samOffer ? ' The outside offer was worth more than staying.' : ''}`);
      if (!queue.includes('hire')) queue = [...queue, 'hire'];
    });

    const cash = s.cash + earned - payroll;
    const day = s.day + 1;
    const over = cash < 0 ? 'bankrupt' : IDS.every(id => !team[id].here) ? 'empty' : day > DAYS ? 'done' : null;
    return {
      s: {
        ...s, team, load, queue, flags, cash, day, committed, over,
        revenue: s.revenue + earned, lastShare: share,
        acc: clamp(s.acc - 5), reveal: Math.max(0, s.reveal - 1)
      },
      report: { earned, payroll, committed, events }
    };
  }

  // Queued (triggered) events first, then a random unused eligible event. Some days are quiet.
  function pickEvent(s, events, rand) {
    const byId = id => events.find(e => e.id === id);
    const qi = s.queue.findIndex(id => { const e = byId(id); return e && (!e.when || e.when(s)); });
    if (qi >= 0) {
      const ev = byId(s.queue[qi]);
      return { ev, s: { ...s, queue: s.queue.filter((_, i) => i !== qi), used: [...s.used, ev.id] } };
    }
    if (rand() < 0.15) return { ev: null, s };
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

  root.Engine = { DAYS, START_CASH, PAYROLL, PROD, IDS, newState, commits, applyFx, play, endDay, pickEvent, archetype, here };
  if (typeof module !== 'undefined') module.exports = root.Engine;
})(typeof window !== 'undefined' ? window : globalThis);
