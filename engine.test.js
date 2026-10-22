// Run: node engine.test.js
const assert = require('assert');
const E = require('./engine.js');

const s0 = E.newState('Test Co', 'App startup');

// Leo is a free rider: he commits only when accountability is high enough.
assert.strictEqual(E.commits(s0, 'leo'), false);
assert.strictEqual(E.commits(E.applyFx(s0, { acc: 25 }), 'leo'), true);
assert.strictEqual(E.commits(E.applyFx(s0, { set: { commission: true } }), 'leo'), true);

// Maya is a conditional cooperator: she stops when fewer than half the team committed yesterday.
assert.strictEqual(E.commits({ ...s0, lastShare: 0.25 }, 'maya'), false);

// One day: Maya, Sam and Priya commit (3 + 4 + 3), payroll 4 x 2.
const d1 = E.endDay(s0);
assert.strictEqual(d1.report.earned, 10);
assert.strictEqual(d1.s.cash, E.START_CASH + 10 - 8);
assert.strictEqual(d1.s.day, 2);
assert.strictEqual(s0.day, 1, 'endDay must not mutate the old state');

// Private information: overload causes burnout, unless trust lets Priya signal first.
const burnt = E.endDay({ ...s0, load: 95 }).s;
assert.strictEqual(burnt.team.priya.out, 4);
const signalled = E.endDay({ ...s0, load: 70 }).s;
assert.ok(signalled.queue.includes('priya-red'));
const silent = E.endDay({ ...s0, load: 70, trust: 30 }).s;
assert.ok(!silent.queue.includes('priya-red'), 'low trust means no honest signal');

// Exit option: Sam leaves once an offer exists and engagement is low; a hire event is queued.
const samLow = E.applyFx(s0, { sam: -20, set: { samOffer: true } });
const gone = E.endDay(samLow).s;
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
assert.strictEqual(E.endDay(broke).s.over, 'bankrupt');

// Full games with the real content: every strategy style must run to an ending without errors,
// and the servant strategy should beat pure command on average (the project's thesis).
const { ACTIONS, EVENTS } = require('./data.js');
function simulate(prefer, seed) {
  let r = seed;
  const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  let s = E.newState('Sim', 'apps');
  while (!s.over) {
    const act = ACTIONS.find(a => a.style === prefer) || ACTIONS[0];
    s = E.play(s, { ...act, fx: act.target ? act.fx('priya') : act.fx });
    const pick = E.pickEvent(s, EVENTS, rand);
    s = pick.s;
    if (pick.ev) s = E.play(s, pick.ev.o.find(o => o.style === prefer) || pick.ev.o[0]);
    s = E.endDay(s).s;
  }
  return s;
}
const avg = style => { let t = 0; for (let i = 1; i <= 50; i++) t += simulate(style, i).cash; return t / 50; };
const smart = avg('conditional'), command = avg('command');
assert.ok(smart > command, `conditional (${smart.toFixed(1)}) should beat command (${command.toFixed(1)})`);
console.log(`avg final cash: conditional ${smart.toFixed(1)}k, listen ${avg('listen').toFixed(1)}k, serve ${avg('serve').toFixed(1)}k, command ${command.toFixed(1)}k`);

console.log('engine: all checks passed');
