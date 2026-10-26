/* Serve First: Company. DOM and game flow. Logic lives in engine.js, content in data.js. */
const $ = id => document.getElementById(id);
const E = Engine;
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TOTAL_CONCEPTS = new Set([...ACTIONS.map(a => a.c), ...Object.values(MARKET_MOVES).map(m => m.c), ...EVENTS.flatMap(e => e.o.map(o => o.c))]).size;
const ARCH = {
  strategic: ['The <em>Strategic</em> Servant', 'You served first, answered free riding with a credible and proportionate response, listened, and stayed fair. In repeated-game terms you played the equilibrium strategy of servant leadership: cooperation that enforces itself.'],
  commander: ['The <em>Iron</em> Commander', 'You mostly commanded, ignored problems or took the bigger share. That wins single rounds, but your followers had exit options and private information, and engagement, honest signals and people drained away.'],
  saint: ['The <em>Saint</em>', 'You served generously, often without consequences. Cooperators loved it, but service without a credible response is exactly what a free rider exploits.'],
  builder: ['The <em>Balanced</em> Builder', 'You mixed service and structure. More listening and more credible, fair responses would turn your style into the equilibrium strategy of servant leadership.']
};

let s, ind = INDUSTRIES[0], day, afterClose = null, shownCash = null;
// GSAP drives the motion; without it (offline, or reduced motion) the game still works, just static.
let G = window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches ? window.gsap : null;
// Some browsers (background tabs, embedded panes) deliver no animation frames,
// or only a trickle, which would leave "fade in" tweens stuck at invisible. A normal browser draws ~60 frames
// a second; if fewer than 20 arrive in any second, drop motion for good and show everything.
if (G) {
  let lastFrame = 0;
  const watch = setInterval(() => {
    if (G.ticker.frame - lastFrame >= 20) { lastFrame = G.ticker.frame; return; }
    clearInterval(watch);
    G.globalTimeline.clear();
    G.set(document.querySelectorAll('[style]'), { clearProps: 'opacity,visibility,transform,clipPath' });
    G = null;
  }, 1000);
}

const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fol = id => FOLLOWERS.find(f => f.id === id) || { name: 'Open seat', role: '', color: '#3a2a2e' };
const nameOf = id => s.team[id].name || fol(id).name;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const money = k => `${k < 0 ? '−' : ''}$${Math.abs(Math.round(k * 10) / 10)}k`;
const signed = n => `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(Math.round(n * 10) / 10)}`;
const engColor = v => v >= 60 ? 'var(--fol)' : v >= 40 ? 'var(--gold)' : 'var(--lead)';
function show(id) { document.querySelectorAll('.screen').forEach(x => x.classList.toggle('on', x.id === id)); window.scrollTo(0, 0); }

/* ---------- Founding ---------- */
function renderFound() {
  $('inds').innerHTML = INDUSTRIES.map(i => `<button class="ind" data-id="${i.id}" aria-pressed="${i === ind}">${i.name}</button>`).join('');
  $('resumes').innerHTML = FOLLOWERS.map(f => `<div class="resume"><div class="av">${ART.portrait(f.id, f.color, 70, false, false)}</div><div><h3>${f.name} <span class="muted" style="font:400 .85rem var(--sans)">· ${f.role}</span></h3><span class="chip teal">${f.type}</span><p>${f.desc}</p></div></div>`).join('');
}
$('inds').addEventListener('click', e => {
  const b = e.target.closest('.ind');
  if (!b) return;
  ind = INDUSTRIES.find(i => i.id === b.dataset.id);
  renderFound();
});
function intro() {
  $('officeArt').innerHTML = ART.office(FOLLOWERS.map(f => f.color));
  if (!G) return;
  G.from('#found .found > div:first-child > *', { y: 28, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'power3.out' });
  G.from('.office-art', { y: 40, scale: 0.94, autoAlpha: 0, duration: 1, ease: 'expo.out', delay: 0.15 });
  G.from('.lens', { y: 30, autoAlpha: 0, stagger: 0.12, duration: 0.5, ease: 'steps(5)', delay: 0.4 });
}
$('open').addEventListener('click', () => {
  const name = $('coName').value.trim() || 'Lantern Labs';
  s = E.newState(name, ind.name);
  shownCash = null;
  $('log').innerHTML = '';
  addLog(`<b>Day 1.</b> ${esc(name)} opens its doors with four people and ${money(s.cash)} in the bank. Rent of ${money(E.RENT)} is due every Friday.`, 'good');
  addLog(`<b>Rival:</b> ${ind.rival} competes for the same customers. Its pricing strategy is hidden.`, 'bad');
  $('hud').hidden = false;
  show('office');
  startDay();
});
$('again').addEventListener('click', () => { renderFound(); show('found'); intro(); });

/* ---------- Day flow ---------- */
function startDay() {
  const pick = E.pickEvent(s, EVENTS, Math.random);
  s = pick.s;
  day = { acted: null, picking: null, ev: pick.ev, choice: null };
  render();
  if (!G) return;
  const d = s.day;
  $('dcWeek').textContent = `Week ${Math.ceil(d / 5)} · ${s.company}`;
  $('dcDay').innerHTML = `<em>${WEEKDAYS[(d - 1) % 5]}</em>`;
  $('dcSub').textContent = `Day ${d} of ${E.DAYS}${day.ev ? ' · something is in your inbox' : ' · a quiet day'}${d % 5 === 0 ? ` · rent of ${money(E.RENT)} due tonight` : ''}`;
  G.timeline()
    .set('#curtain', { autoAlpha: 1 })
    .fromTo('#curtain', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.45, ease: 'steps(8)' })
    .from('#curtain .dc > *', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.4, ease: 'power3.out' }, '-=0.15')
    .to('#curtain', { clipPath: 'inset(100% 0 0 0)', duration: 0.5, ease: 'steps(8)', delay: 0.5 })
    .set('#curtain', { autoAlpha: 0 })
    .from('.desk', { y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.5, ease: 'back.out(1.6)' }, '-=0.25')
    .from('#stepAct, #stepMail', { x: 30, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out' }, '<')
    .from('#mail .ev-badge', { rotate: -25, scale: 0, duration: 0.6, ease: 'back.out(2)' }, '-=0.2');
}

function render(deltas = {}) {
  renderHud();
  renderDesks(deltas);
  renderGauges();
  renderToday();
  renderMarket();
}

function renderHud() {
  $('logo').style.background = ind.color;
  $('logo').textContent = s.company[0].toUpperCase();
  $('hudName').textContent = s.company;
  $('hudInd').textContent = s.industry;
  const d = Math.min(s.day, E.DAYS);
  $('hudDay').textContent = `Week ${Math.ceil(d / 5)} · ${WEEKDAYS[(d - 1) % 5]} · Day ${d} of ${E.DAYS}${d % 5 === 0 ? ' · rent due' : ''}`;
  $('hudShare').textContent = `${s.share}%`;
  $('hudTrack').style.width = `${100 * d / E.DAYS}%`;
  setCash(s.cash);
  $('hudCash').classList.toggle('low', s.cash < 10);
  $('hudTrust').textContent = s.trust;
  $('hudBook').textContent = `${Object.keys(s.concepts).length} / ${TOTAL_CONCEPTS}`;
}

function setCash(v) {
  const el = $('hudCash');
  if (!G || shownCash === null) { el.textContent = money(v); shownCash = v; return; }
  const o = { v: shownCash };
  shownCash = v;
  G.to(o, { v, duration: 0.9, ease: 'power2.out', onUpdate: () => { el.textContent = money(o.v); } });
  G.fromTo(el, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
}

function renderDesks(deltas) {
  $('desks').innerHTML = E.IDS.map(id => {
    const f = { ...fol(id), id }, p = s.team[id];
    if (p.open) return `<div class="desk left"><header><div class="av">${ART.portrait(id, '#2a1c20', 50, false, true)}</div><div><h3>Open seat</h3><small>Use "Recruit" to fill it</small></div></header><div class="status">No payroll, no output.</div></div>`;
    const d = deltas[id] || 0;
    const pop = d ? `<span class="pop ${d > 0 ? 'up' : 'down'}">${signed(d)}</span>` : '';
    const color = p.here ? p.color || f.color : '#3a2a2e';
    const head = `<header><div class="av">${ART.portrait(id, color, p.eng, p.out > 0, !!p.name)}</div><div><h3>${esc(nameOf(id))}</h3><small>${p.role || f.role}${p.name ? ` · new hire · ${money(p.pay)}/day` : ''}</small></div></header>`;
    if (!p.here) return `<div class="desk left">${head}<div class="status"><b>Resigned.</b> The desk is empty.</div></div>`;
    // A hire's type is private information until they have worked long enough for you to see it.
    const type = !p.name ? f.type : p.days >= E.REVEAL_DAYS ? KINDS[p.kind] : `Type hidden · shows in ${E.REVEAL_DAYS - p.days} day${E.REVEAL_DAYS - p.days > 1 ? 's' : ''}`;
    const status = p.out > 0 ? `<b>Out</b> for ${p.out} more day${p.out > 1 ? 's' : ''}`
      : s.day === 1 ? '<b>First day</b>'
      : !(id in s.committed) || p.days === 0 ? '<b>First day</b>'
      : s.committed[id] ? '<b style="color:var(--fol)">Committed</b> yesterday' : '<b style="color:var(--lead)">Shirked</b> yesterday';
    const load = id !== 'priya' ? ''
      : s.reveal > 0 ? `<div class="meter"><span>Workload</span><div class="bar"><i style="width:${s.load}%;background:${s.load >= 70 ? 'var(--lead)' : 'var(--gold)'}"></i></div><b>${s.load}</b></div>`
      : '<div class="meter"><span>Workload</span><span style="width:auto">hidden: only Priya knows</span></div>';
    return `<div class="desk${d > 0 ? ' hot' : d < 0 ? ' cold' : ''}">${pop}${head}<div class="type"><span class="chip ${p.name && p.kind === 'lemon' && p.days >= E.REVEAL_DAYS ? '' : 'teal'}">${type}</span></div>
      <div class="meter"><span>Engagement</span><div class="bar"><i style="width:${p.eng}%;background:${engColor(p.eng)}"></i></div><b>${p.eng}</b></div>${load}
      <div class="status">${status}</div></div>`;
  }).join('');
  if (!G) return;
  G.from('.desk.hot', { y: -10, duration: 0.5, ease: 'bounce.out' });
  G.fromTo('.desk.cold', { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.2)' });
}

function renderGauges() {
  $('accBar').style.width = `${s.acc}%`; $('accBar').style.background = s.acc >= 50 ? 'var(--fol)' : 'var(--warn)'; $('accNum').textContent = s.acc;
  $('trustBar').style.width = `${s.trust}%`; $('trustBar').style.background = engColor(s.trust); $('trustNum').textContent = s.trust;
}

function renderToday() {
  $('stepAct').classList.toggle('done', !!day.acted);
  $('actions').innerHTML = ACTIONS.map(a => `<button class="act${day.acted === a.id ? ' mine' : ''}" data-id="${a.id}"${day.acted || (a.recruit && !E.hasSeat(s)) ? ' disabled' : ''}><b>${a.t}</b><small>${a.recruit && !E.hasSeat(s) ? 'Every seat is taken.' : a.d}</small></button>`).join('');
  const targets = E.IDS.filter(id => s.team[id].here && s.team[id].out === 0);
  $('targets').hidden = !day.picking;
  $('targets').innerHTML = day.picking ? '<span class="muted" style="font-size:.85rem">With whom?</span>' + targets.map(id => `<button data-t="${id}">${esc(nameOf(id))}</button>`).join('') : '';

  const ev = day.ev;
  $('stepMail').classList.toggle('done', !ev || day.choice !== null);
  $('mail').innerHTML = !ev ? '<p class="quiet">Quiet day. No fires to put out: your team just works.</p>'
    : `<div class="ev-badge">${ART.icon(ev.tag)}</div><div class="from"><span>From: <b style="color:var(--text)">${ev.from}</b></span><span class="chip teal">${ev.tag}</span></div>
       <h4>${ev.title}</h4><p>${ev.text}</p><div class="trait">Servant leadership trait tested: ${ev.trait}</div>
       <div class="opts">${ev.o.map((o, k) => `<button class="opt${day.choice === k ? ' mine' : ''}" data-k="${k}"${day.choice !== null ? ' disabled' : ''}>${o.t}</button>`).join('')}</div>`;
  $('endDay').disabled = day.closed || !(day.acted && s.market && (!ev || day.choice !== null));
}

// The market is a repeated prisoner's dilemma against a rival whose strategy you must infer from its history.
function renderMarket() {
  const hist = s.rival.hist, last = hist[hist.length - 1], me = s.market;
  $('rivalName').textContent = ind.rival;
  $('stepMarket').classList.toggle('done', !!me);
  const cell = (a, b) => {
    const k = a + b;
    const note = k === 'DC' ? '<small>share +4</small>' : k === 'CD' ? `<small>${s.flags.matchClause ? 'matched: ×' + E.MARKET.DD : 'share −4'}</small>` : '';
    return `<td class="${last && last.me === a && last.them === b ? 'last' : ''} ${E.MARKET[k] >= 1 ? 'good' : 'bad'}">×${E.MARKET[k]}${note}</td>`;
  };
  const dots = who => hist.length ? hist.map((h, i) => `<i class="${h[who] === 'C' ? 'hold' : 'cut'}" title="Day ${i + 1}: ${h[who] === 'C' ? 'held' : 'cut'}"></i>`).join('') : '<span class="muted">no rounds yet</span>';
  $('market').innerHTML = `<div class="versus"><span>You</span>${ART.sprite('leader')}<b>VS</b>${ART.sprite('rival')}<span>${esc(ind.rival)}</span></div>
    <p class="mkt-note">You both move at the same time. Your move multiplies today's revenue. ${esc(ind.rival)}'s strategy is hidden: read it from the history.</p>
    <table class="matrix"><tr><th></th><th>They hold</th><th>They cut</th></tr>
      <tr><th>You hold</th>${cell('C', 'C')}${cell('C', 'D')}</tr><tr><th>You cut</th>${cell('D', 'C')}${cell('D', 'D')}</tr></table>
    <div class="hist"><span>You</span><div>${dots('me')}</div><span>${esc(ind.rival)}</span><div>${dots('them')}</div></div>
    <div class="meter"><span>Your share</span><div class="bar"><i style="width:${s.share}%;background:${s.share >= 50 ? 'var(--fol)' : 'var(--lead)'}"></i></div><b>${s.share}</b></div>
    <div class="mkt">${['C', 'D'].map(m => `<button class="opt${me === m ? ' mine' : ''}" data-m="${m}"${me ? ' disabled' : ''}><b>${MARKET_MOVES[m].t}</b></button>`).join('')}</div>`;
}
$('market').addEventListener('click', e => {
  const b = e.target.closest('[data-m]');
  if (!b || b.disabled) return;
  const m = MARKET_MOVES[b.dataset.m];
  const option = { t: `${m.t} against ${ind.rival}`, fx: { market: b.dataset.m }, c: m.c, x: m.x };
  if (!s.concepts[m.c]) return move(option, { kind: 'Market', src: m.src });
  s = E.play(s, option);
  addLog(`<b>Market:</b> ${esc(option.t)}`);
  render();
});

/* ---------- Recruiting: three applicants, hidden types, noisy signals ---------- */
let cands = [];
function openRecruit() {
  const taken = E.IDS.map(id => s.team[id].name);
  const names = HIRE_NAMES.filter(n => !taken.includes(n)).sort(() => Math.random() - 0.5);
  cands = E.candidates(Math.random).map((c, i) => ({ ...c, name: names[i], role: pick(HIRE_ROLES), color: pick(HIRE_COLORS) }));
  openDlg(`<div class="kicker">Recruiting · adverse selection</div><h2>Three applicants</h2>
    <p>Each applicant knows whether they will really commit. You only see signals: interviews reward charm, referrals put someone else's reputation on the line. Their true type shows after ${E.REVEAL_DAYS} days at work, and their pay joins payroll every day from now on.</p>
    <div class="cands">${cands.map((c, i) => `<div class="cand"><div class="av">${ART.portrait('hire', c.color, 60, false, true)}</div><div>
      <h3>${esc(c.name)} <small>· ${c.role}</small></h3>
      <div class="meter"><span>Interview</span><div class="bar"><i style="width:${c.interview}%;background:var(--gold)"></i></div><b>${c.interview}</b></div>
      <p>${c.referral ? '<b style="color:var(--fol)">Referred</b> by someone you trust' : 'No referral'} · asks <b>${money(c.pay)}/day</b></p>
      <button class="opt" data-c="${i}">Hire ${esc(c.name)} ($1k fee)</button></div></div>`).join('')}</div>
    <p class="muted">Close this window to keep the seat empty and pick another action.</p>`);
}
$('dlgBody').addEventListener('click', e => {
  const b = e.target.closest('[data-c]');
  if (!b) return;
  const c = cands[+b.dataset.c], a = ACTIONS.find(x => x.recruit);
  afterClose = null;
  $('dlg').close();
  day.acted = a.id;
  move({ ...a, t: `Hired ${c.name} (${c.role})`, fx: { cash: -1, hire: c } }, { kind: 'Adverse selection', src: a.src });
});

/* ---------- Moves ---------- */
$('actions').addEventListener('click', e => {
  const b = e.target.closest('.act');
  if (!b || b.disabled) return;
  const a = ACTIONS.find(x => x.id === b.dataset.id);
  if (a.recruit) return openRecruit();
  if (a.target) { day.picking = a.id; return renderToday(); }
  day.acted = a.id;
  move({ ...a }, { kind: 'Daily action', src: a.src });
});
$('targets').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const a = ACTIONS.find(x => x.id === day.picking);
  day.picking = null; day.acted = a.id;
  move({ ...a, fx: a.fx(b.dataset.t), t: `${a.t} with ${nameOf(b.dataset.t)}` }, { kind: 'Daily action', src: a.src });
});
$('mail').addEventListener('click', e => {
  const b = e.target.closest('.opt');
  if (!b || b.disabled) return;
  const k = +b.dataset.k, ev = day.ev;
  day.choice = k;
  move(ev.o[k], { kind: ev.tag, trait: ev.trait, src: ev.src, others: ev.o.filter((_, j) => j !== k) });
});

function diff(a, b) {
  const d = { cash: b.cash - a.cash, trust: b.trust - a.trust, acc: b.acc - a.acc, left: [], joined: [] };
  E.IDS.forEach(id => {
    const was = a.team[id], now = b.team[id];
    if (was.here && !now.here) d.left.push(was.name || fol(id).name);
    else if (now.here && (!was.here || was.name !== now.name)) d.joined.push(now.name);
    else if (now.here) d[id] = now.eng - was.eng;
  });
  return d;
}
function fxChips(d) {
  const chip = (label, n) => n ? `<span class="${n > 0 ? 'up' : 'down'}">${label} ${signed(n)}</span>` : '';
  return chip('Cash $k', d.cash) + chip('Trust', d.trust) + chip('Accountability', d.acc)
    + E.IDS.map(id => chip(esc(nameOf(id)), d[id] || 0)).join('')
    + d.left.map(n => `<span class="down">${esc(n)} left</span>`).join('')
    + d.joined.map(n => `<span class="up">${esc(n)} joined</span>`).join('');
}

function move(option, meta) {
  const before = s;
  s = E.play(s, option);
  const d = diff(before, s);
  const isNew = !before.concepts[option.c];
  addLog(`<b>${meta.kind}:</b> ${esc(option.t)} <span class="muted">→ ${option.c}</span>`);
  render(d);
  const others = meta.others ? `<details><summary>The other moves, and what they would have meant</summary><ul>${meta.others.map(o => `<li><b>${o.t}</b><br><i>${o.c}.</i> ${o.x}</li>`).join('')}</ul></details>` : '';
  openDlg(`<div class="ev-badge">${ART.icon(meta.kind)}</div><div class="kicker">Game theory concept · ${meta.kind}${isNew ? '<span class="new-badge">New concept</span>' : ''}</div>
    <h2>${option.c}</h2>
    <p class="move">Your move: ${esc(option.t)}</p>
    ${option.o ? `<p class="outcome">${option.o}</p>` : ''}
    <p>${option.x}</p>
    <div class="fx">${fxChips(d) || '<span>No immediate change</span>'}</div>
    ${meta.trait ? `<p class="trait">Servant leadership trait tested: ${meta.trait}</p>` : ''}
    ${others}
    ${meta.src ? `<p class="src">Source: [${meta.src}] ${REFS[meta.src - 1]}</p>` : ''}`);
}

$('endDay').addEventListener('click', () => {
  const before = s, r = E.endDay(s);
  s = r.s;
  day = { ...day, closed: true };
  const rows = E.IDS.filter(id => !before.team[id].open).map(id => {
    const p = before.team[id];
    const st = !p.here ? 'gone' : p.out > 0 ? 'out' : r.report.committed[id] ? 'committed' : 'shirked';
    return `<span class="${st === 'committed' ? 'up' : st === 'shirked' ? 'down' : ''}">${esc(p.name || fol(id).name)}: ${st}</span>`;
  }).join('');
  const net = s.cash - before.cash;
  const verb = m => m === 'C' ? 'held price' : 'undercut';
  const mkt = `You ${verb(r.report.me)}, ${ind.rival} ${verb(r.report.them)}: revenue ×${r.report.mult}.`;
  addLog(`<b>Day ${before.day} closed.</b> ${esc(mkt)} Revenue ${money(r.report.earned)}, payroll ${money(r.report.payroll)}${r.report.rent ? `, rent ${money(r.report.rent)}` : ''}, net ${money(net)}.`, net >= 0 ? 'good' : 'bad');
  r.report.events.forEach(t => addLog(`<b>Alert:</b> ${esc(t)}`, 'bad'));
  render(diff(before, s));
  openDlg(`<div class="kicker">End of day ${before.day} · ${WEEKDAYS[(before.day - 1) % 5]}</div>
    <h2>Daily report</h2>
    <div class="report-grid"><div><span class="label">Revenue</span><b>${money(r.report.earned)}</b></div><div><span class="label">Payroll${r.report.rent ? ' + rent' : ''}</span><b>${money(-r.report.payroll - r.report.rent)}</b></div><div><span class="label">Net</span><b style="color:${net >= 0 ? 'var(--fol)' : 'var(--lead)'}">${money(net)}</b></div></div>
    <p class="${r.report.them === 'D' ? 'outcome' : 'muted'}" style="font-size:.9rem"><b>Market:</b> ${esc(mkt)}</p>
    <p class="muted" style="font-size:.86rem">Only people who commit earn money, but everyone on the team is paid. Each person chose to commit or shirk using their own strategy.</p>
    <div class="fx">${rows}</div>
    ${r.report.events.map(t => `<p style="color:var(--lead)"><b>${esc(t)}</b></p>`).join('')}`,
    () => (s.over ? finish() : startDay()));
});

/* ---------- Dialog, log, concept book ---------- */
function openDlg(html, then) {
  $('dlgBody').innerHTML = html;
  afterClose = then || null;
  $('dlg').showModal();
  if (!G) return;
  G.from('#dlgBody > *', { y: 18, autoAlpha: 0, stagger: 0.05, duration: 0.45, ease: 'power3.out' });
  G.from('#dlgBody .ev-badge', { rotate: 30, scale: 0, duration: 0.7, ease: 'back.out(2.5)' });
  G.from('#dlgBody .new-badge, #dlgBody .fx span', { scale: 0, stagger: 0.04, duration: 0.4, ease: 'back.out(3)', delay: 0.25 });
}
// Close from our own button and Escape handler instead of the 'close' event, which some embedded browsers never fire.
function closeDlg() {
  $('dlg').close();
  const fn = afterClose;
  afterClose = null;
  if (fn) fn();
}
$('dlgOk').addEventListener('click', closeDlg);
$('dlg').addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); closeDlg(); } });
function addLog(html, cls = '') {
  const div = document.createElement('div');
  div.className = cls; div.innerHTML = html;
  $('log').prepend(div);
}
const bookHtml = () => Object.keys(s.concepts).length
  ? Object.entries(s.concepts).map(([c, x]) => `<div><b>${c}</b>${x}</div>`).join('')
  : '<div>No concepts yet. Make your first move.</div>';
$('bookBtn').addEventListener('click', () => openDlg(`<div class="kicker">Concept book</div><h2>${Object.keys(s.concepts).length} of ${TOTAL_CONCEPTS} concepts discovered</h2><p class="muted">Different choices unlock different concepts. Play again to find the rest.</p><div class="book-list">${bookHtml()}</div>`));

/* ---------- Ending ---------- */
function finish() {
  $('hud').hidden = true;
  const arch = ARCH[E.archetype(s)];
  const kept = E.IDS.filter(id => s.team[id].here).length;
  const why = s.over === 'bankrupt' ? `${esc(s.company)} ran out of cash on day ${s.day - 1}. `
    : s.over === 'empty' ? `Everyone at ${esc(s.company)} left. ` : `${esc(s.company)} survived its first month. `;
  $('endKicker').textContent = s.over === 'done' ? 'Month one complete' : 'Game over';
  $('endTitle').innerHTML = arch[0];
  const [rName, rDid, rBest] = RIVAL_INFO[s.rival.strat];
  const cuts = s.rival.hist.filter(h => h.me === 'D').length;
  $('endText').innerHTML = `${why}${arch[1]}<span class="rival-reveal"><b>${esc(ind.rival)} was playing ${rName}${s.flags.matchClause ? ' (until your price-match guarantee turned it into tit for tat)' : ''}.</b> ${rDid} Best reply: ${rBest} You undercut on ${cuts} of ${s.rival.hist.length} days.</span>`;
  $('endStats').innerHTML = [['Cash', money(s.cash)], ['Revenue', money(s.revenue)], ['Team', kept], ['Market share', `${s.share}%`], ['Trust', s.trust], ['Concepts', `${Object.keys(s.concepts).length} / ${TOTAL_CONCEPTS}`]]
    .map(([k, v]) => `<div><span class="label">${k}</span><b>${v}</b></div>`).join('');
  $('endBookTitle').textContent = 'Your concept book';
  $('endBook').innerHTML = bookHtml();
  $('refs').innerHTML = REFS.map(r => `<li>${r}</li>`).join('');
  show('end');
  if (!G) return;
  G.from('.end-card > *', { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' });
  G.from('.end-stats > div', { scale: 0.6, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: 'back.out(2)', delay: 0.4 });
}

renderFound();
intro();
