// Run: node engine.test.js
const assert = require('assert');
const E = require('./engine.js');

const calm = () => 0.99; // a rand that never triggers a shock
const s0 = E.newState('Test Co', 'App startup', () => 0); // rival plays tit for tat

// Leo is a free rider: he commits only when accountability is high enough.
assert.strictEqual(E.commits(s0, 'leo'), false);
assert.strictEqual(E.commits(E.applyFx(s0, { acc: 25 }), 'leo'), true);
assert.strictEqual(E.commits(E.applyFx(s0, { set: { commission: true } }), 'leo'), true);

// Maya is a conditional cooperator: she stops when fewer than half the team committed yesterday.
assert.strictEqual(E.commits({ ...s0, lastShare: 0.25 }, 'maya'), false);

// One day: Maya, Sam and Priya commit (3 + 4 + 3), both firms hold price, payroll 4 x 2. Open seats cost nothing.
const d1 = E.endDay(s0, calm);
assert.strictEqual(d1.report.earned, 10);
assert.strictEqual(d1.s.cash, E.START_CASH + 10 - 8);
assert.strictEqual(d1.s.day, 2);
assert.strictEqual(s0.day, 1, 'endDay must not mutate the old state');

// Rent is due on Fridays.
assert.strictEqual(E.endDay({ ...s0, day: 5 }, calm).report.rent, E.RENT);

// Market: undercutting a rival who holds wins revenue and share; tit for tat then retaliates.
const cut = E.endDay(E.applyFx(s0, { market: 'D' }), calm);
assert.strictEqual(cut.report.earned, 14);
assert.strictEqual(cut.s.share, 54);
assert.strictEqual(E.endDay(cut.s, calm).report.them, 'D');
// Each hidden strategy, against the same history.
const h = ms => ms.map(me => ({ me, them: 'C' }));
assert.strictEqual(E.rivalMove('grim', h(['D', 'C', 'C'])), 'D', 'grim never forgives');
assert.strictEqual(E.rivalMove('tft', h(['D', 'C', 'C'])), 'C');
assert.strictEqual(E.rivalMove('shark', []), 'C', 'shark baits on day one');
assert.strictEqual(E.rivalMove('shark', h(['C'])), 'D');
assert.strictEqual(E.rivalMove('forgiver', h(['C', 'D'])), 'C');
assert.strictEqual(E.rivalMove('forgiver', h(['D', 'D'])), 'D');
// A price-match guarantee turns a sucker's payoff into a shared price war.
const shark = { ...s0, rival: { strat: 'shark', hist: h(['C']) } };
assert.strictEqual(E.endDay(shark, calm).report.mult, E.MARKET.CD);
assert.strictEqual(E.endDay({ ...shark, flags: { matchClause: true } }, calm).report.mult, E.MARKET.DD);
// Two days of rival cuts in a row trigger poaching.
const war = { ...s0, rival: { strat: 'shark', hist: [{ me: 'C', them: 'C' }, { me: 'C', them: 'D' }] }, day: 3 };
assert.ok(E.endDay(war, calm).s.queue.includes('poach'));

// Hiring fills an open seat with a hidden type; their pay joins payroll.
assert.ok(E.hasSeat(s0));
const cands = E.candidates(() => 0.5);
assert.strictEqual(cands.length, 3);
const hired = E.applyFx(s0, { hire: { ...cands[0], name: 'Noor' } });
assert.strictEqual(hired.team.h1.name, 'Noor');
assert.strictEqual(E.endDay(hired, calm).report.payroll, 8 + cands[0].pay);
const lemon = E.applyFx(s0, { hire: { name: 'Max', kind: 'lemon', prod: 1.5, eng: 60 } });
assert.strictEqual(E.commits(lemon, 'h1'), false, 'a lemon coasts');

// Private information: overload causes burnout, unless trust lets Priya signal first.
const burnt = E.endDay({ ...s0, load: 95 }, calm).s;
assert.strictEqual(burnt.team.priya.out, 4);
const signalled = E.endDay({ ...s0, load: 70 }, calm).s;
assert.ok(signalled.queue.includes('priya-red'));
const silent = E.endDay({ ...s0, load: 70, trust: 30 }, calm).s;
assert.ok(!silent.queue.includes('priya-red'), 'low trust means no honest signal');

// Exit option: Sam leaves once an offer exists and engagement is low; a hire event is queued.
const samLow = E.applyFx(s0, { sam: -20, set: { samOffer: true } });
const gone = E.endDay(samLow, calm).s;
assert.strictEqual(gone.team.sam.here, false);
assert.ok(gone.queue.includes('hire'));
const refilled = E.applyFx(gone, { hire: { eng: 50, name: 'Noah' } });
assert.strictEqual(refilled.team.sam.name, 'Noah');

// Triggered events come first; a played option records its concept and style.
const evs = [{ id: 'kickoff', triggered: true }, { id: 'other' }];
const picked = E.pickEvent(s0, evs, () => 0.5);
assert.strictEqual(picked.ev.id, 'kickoff');
assert.deepStrictEqual(picked.s.queue, []);
const played = E.play(s0, { fx: { all: 5 }, style: 'serve', c: 'Trust move', x: 'Explained' });
assert.strictEqual(played.team.maya.eng, 65);
assert.deepStrictEqual(played.styles, ['serve']);
assert.strictEqual(played.concepts['Trust move'], 'Explained');

// Bankruptcy ends the game.
const broke = { ...s0, cash: 0, team: { ...s0.team, sam: { ...s0.team.sam, eng: 30 }, priya: { ...s0.team.priya, eng: 30 } } };
assert.strictEqual(E.endDay(broke, calm).s.over, 'bankrupt');

// Full games with the real content: every strategy style must run to an ending without errors,
// and the servant strategy should beat pure command on average (the project's thesis).
// Market policy: the strategic leader plays tit for tat against the rival; the commander always undercuts.
const { ACTIONS, EVENTS } = require('./data.js');
function simulate(prefer, seed) {
  let r = seed;
  const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  let s = E.newState('Sim', 'apps', rand);
  while (!s.over) {
    const act = ACTIONS.find(a => a.style === prefer) || ACTIONS[0];
    s = E.play(s, { ...act, fx: act.target ? act.fx('priya') : act.fx });
    const last = s.rival.hist[s.rival.hist.length - 1];
    const market = prefer === 'command' ? 'D' : prefer === 'serve' ? 'C' : (last ? last.them : 'C');
    s = E.applyFx(s, { market });
    const pick = E.pickEvent(s, EVENTS, rand);
    s = pick.s;
    if (pick.ev) s = E.play(s, pick.ev.o.find(o => o.style === prefer) || pick.ev.o[0]);
    s = E.endDay(s, rand).s;
  }
  return s;
}
const run = style => {
  let t = 0, bust = 0;
  for (let i = 1; i <= 200; i++) { const s = simulate(style, i); t += s.cash; bust += s.over === 'bankrupt'; }
  return { cash: t / 200, bust: bust / 200 };
};
const res = {};
['conditional', 'listen', 'serve', 'command'].forEach(st => { res[st] = run(st); });
assert.ok(res.conditional.cash > res.command.cash, `conditional (${res.conditional.cash.toFixed(1)}) should beat command (${res.command.cash.toFixed(1)})`);
Object.entries(res).forEach(([st, v]) => console.log(`${st}: avg final cash ${v.cash.toFixed(1)}k, bankrupt ${Math.round(v.bust * 100)}%`));

console.log('engine: all checks passed');
