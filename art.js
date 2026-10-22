/* Serve First: Company. Hand-made SVG art: portraits, office scene, event icons. */
const ART = (() => {
  const LOOKS = {
    maya: { skin: '#e8b48f', hair: '#2b1a14', style: 'bun' },
    leo: { skin: '#f1c7a0', hair: '#c27a2c', style: 'quiff' },
    sam: { skin: '#8d5a3b', hair: '#17110e', style: 'beanie' },
    priya: { skin: '#b9784f', hair: '#1d1210', style: 'long' },
    hire: { skin: '#d7a27c', hair: '#4a3328', style: 'short' }
  };
  const HAIR = {
    bun: h => `<circle cx="32" cy="12" r="7" fill="${h}"/><path d="M17 27c0-10 7-15 15-15s15 5 15 15c-4-5-9-7-15-7s-11 2-15 7z" fill="${h}"/>`,
    quiff: h => `<path d="M17 27c-1-9 5-16 15-16 6 0 10 2 13 6 3 3 3 7 2 10-3-5-8-8-15-7-6 0-11 3-15 7z" fill="${h}"/><path d="M26 12c4-5 13-5 17 1-5-2-11-2-17-1z" fill="${h}"/>`,
    beanie: () => '<path d="M16 26c0-10 7-16 16-16s16 6 16 16z" fill="#e0b85e"/><rect x="15" y="23" width="34" height="6" rx="3" fill="#c99a3a"/><circle cx="32" cy="9" r="3" fill="#e0b85e"/>',
    long: h => `<path d="M15 44c-2-8-1-17 2-23 3-7 9-10 15-10s12 3 15 10c3 6 4 15 2 23l-5-2V28c-3-4-7-6-12-6s-9 2-12 6v14z" fill="${h}"/>`,
    short: h => `<path d="M17 26c0-9 7-14 15-14s15 5 15 14c-4-4-9-6-15-6s-11 2-15 6z" fill="${h}"/>`
  };

  // Expression follows engagement: the follower's current best reply shows on their face.
  function portrait(id, color, eng, isOut, isNewHire) {
    const look = isNewHire ? LOOKS.hire : LOOKS[id];
    const ink = '#3a2420';
    const mouth = isOut || (eng >= 40 && eng < 60) ? `<path d="M27 41h10" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`
      : eng >= 60 ? `<path d="M26 39q6 6 12 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
      : `<path d="M26 43q6-5 12 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    const eyes = isOut ? `<path d="M24 32h5M35 32h5" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`
      : '<circle cx="26.5" cy="32" r="2.2" fill="#2a1a16"/><circle cx="37.5" cy="32" r="2.2" fill="#2a1a16"/>';
    const brows = eng < 40 && !isOut ? '<path d="M23 27l6 2M41 27l-6 2" stroke="#2a1a16" stroke-width="1.8" stroke-linecap="round"/>' : '';
    const sick = isOut ? '<text x="46" y="16" font-size="11" font-family="Georgia,serif" fill="#f3e6d3">z</text><text x="51" y="10" font-size="8" font-family="Georgia,serif" fill="#f3e6d3">z</text>' : '';
    return `<svg viewBox="0 0 64 64" aria-hidden="true" class="portrait">
      <circle cx="32" cy="32" r="32" fill="${color}"/>
      <path d="M10 64c2-12 11-17 22-17s20 5 22 17z" fill="#1b0f13" opacity=".85"/>
      <path d="M26 46h12l-6 7z" fill="${color}" opacity=".9"/>
      <rect x="28" y="40" width="8" height="8" rx="3" fill="${look.skin}"/>
      <ellipse cx="32" cy="32" rx="13" ry="14" fill="${look.skin}"/>
      ${HAIR[look.style](look.hair)}${brows}${eyes}${mouth}
      <circle cx="22" cy="37" r="2.5" fill="#e2566f" opacity=".25"/><circle cx="42" cy="37" r="2.5" fill="#e2566f" opacity=".25"/>
      ${sick}</svg>`;
  }

  // Founding-screen illustration: an isometric office waiting for its team.
  function office(colors) {
    const desk = (x, y, c, i) => `<g transform="translate(${x} ${y})">
      <path d="M0 22 44 0 88 22 44 44z" fill="#2e1820"/><path d="M0 22v8l44 22v-8z" fill="#1d0e12"/><path d="M88 22v8L44 52v-8z" fill="#160a0d"/>
      <path d="M28 10 48 0v20L28 30z" fill="#0d0709"/><path d="M31 12 45 5v12L31 25z" class="screen-glow" data-i="${i}" fill="${c}" opacity=".85"/>
      <path d="M40 30l6-3 9 4-6 3z" fill="#3a2228"/><rect x="62" y="20" width="10" height="11" rx="3" fill="${c}" opacity=".4"/></g>`;
    return `<svg viewBox="30 50 390 240" class="office-art" role="img" aria-label="An isometric office with four desks waiting for the team">
      <defs><linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a1426"/><stop offset="1" stop-color="#e0b85e" stop-opacity=".7"/></linearGradient></defs>
      <path d="M20 110 220 10v150L20 260z" fill="#3a1b24"/>
      <path d="M420 110 220 10v150l200 100z" fill="#2b141b"/>
      <path d="M20 260 220 160 420 260 220 360z" fill="#24131a"/>
      <path d="M60 140V96l80-40v44z" fill="url(#win)" opacity=".8"/>
      <g fill="#12080b" opacity=".85"><path d="M68 136v-16l9-4v16zM81 129v-26l11-5v26zM96 122v-14l8-4v14zM108 116v-30l12-6v30zM124 108v-16l8-4v16z"/></g>
      <path d="M60 140V96l80-40v44zM100 120V76" fill="none" stroke="#3a2228" stroke-width="3"/>
      <path d="M300 90l60 30v34l-60-30z" fill="#2a161c" stroke="#e0b85e" stroke-opacity=".45"/>
      <path d="M310 104l40 20M310 114l28 14" stroke="#e0b85e" stroke-opacity=".5" stroke-width="2"/>
      ${desk(110, 196, colors[0], 0)}${desk(176, 164, colors[1], 1)}${desk(176, 228, colors[2], 2)}${desk(242, 196, colors[3], 3)}
      <g class="plant" transform="translate(372 210)"><path d="M0 30h22l-3 22H3z" fill="#6b4a12"/><path d="M11 30C2 20 0 8 6 0c3 10 6 18 5 30zM11 30c8-12 16-16 22-14-6 4-12 9-22 14zM11 30C4 22-6 20-10 24c6 0 13 2 21 6z" fill="#1f7a6d"/></g>
      <g class="ceo" transform="translate(56 196)"><ellipse cx="15" cy="58" rx="16" ry="5" fill="#000" opacity=".35"/><path d="M3 56c0-14 5-22 12-22s12 8 12 22z" fill="#e0b85e"/><circle cx="15" cy="24" r="10" fill="#e8b48f"/><path d="M5 22c0-8 5-12 10-12s10 4 10 12c-3-3-6-4-10-4s-7 1-10 4z" fill="#2b1a14"/></g>
    </svg>`;
  }

  const I = d => `<svg viewBox="0 0 48 48" aria-hidden="true" class="ev-icon" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    handshake: I('<path d="M4 22l8-8 8 4 6-4 8 2 10 6"/><path d="M12 14l-6 18 10 8 4-4 4 4 4-4 4 4 8-10"/><path d="M20 18l-6 8"/>'),
    repeat: I('<path d="M8 20a16 16 0 0 1 28-8l4 4"/><path d="M40 8v8h-8"/><path d="M40 28a16 16 0 0 1-28 8l-4-4"/><path d="M8 40v-8h8"/>'),
    speech: I('<path d="M8 10h32v22H22l-10 8v-8H8z"/><path d="M16 20h16M16 26h10"/>'),
    door: I('<path d="M12 42V6h20v36"/><path d="M32 42h8"/><path d="M26 24h2"/><path d="M4 42h8"/>'),
    scales: I('<path d="M24 6v36M14 42h20M8 14h32"/><path d="M8 14l-5 12h10zM40 14l-5 12h10z"/>'),
    coins: I('<ellipse cx="18" cy="14" rx="10" ry="4"/><path d="M8 14v8c0 2 4 4 10 4s10-2 10-4v-8"/><ellipse cx="30" cy="30" rx="10" ry="4"/><path d="M20 30v8c0 2 4 4 10 4s10-2 10-4v-8"/>'),
    cloud: I('<path d="M14 36a8 8 0 0 1-1-16 12 12 0 0 1 23 2 7 7 0 0 1-1 14z"/><path d="M18 42l2-4M26 42l2-4"/>'),
    dilemma: I('<rect x="6" y="10" width="14" height="28" rx="2"/><rect x="28" y="10" width="14" height="28" rx="2"/><path d="M10 16v16M16 16v16M32 16v16M38 16v16"/>'),
    stag: I('<path d="M16 28c4 6 12 6 16 0"/><path d="M14 22c-4-4-6-10-4-14M14 14l-6-2M34 22c4-4 6-10 4-14M34 14l6-2"/><circle cx="24" cy="26" r="10"/>'),
    chicken: I('<path d="M4 24h14M30 24h14"/><path d="M14 18l6 6-6 6M34 18l-6 6 6 6"/>'),
    chart: I('<path d="M6 42h36"/><path d="M10 34l8-10 8 6 12-16"/><path d="M32 14h6v6"/>'),
    shield: I('<path d="M24 4l16 6v12c0 10-7 17-16 22-9-5-16-12-16-22V10z"/><path d="M17 24l5 5 9-10"/>'),
    trophy: I('<path d="M14 6h20v10a10 10 0 0 1-20 0z"/><path d="M14 10H6c0 6 4 10 8 10M34 10h8c0 6-4 10-8 10"/><path d="M24 26v8M16 42h16M18 34h12v8H18z"/>'),
    lock: I('<rect x="10" y="20" width="28" height="22" rx="3"/><path d="M16 20v-6a8 8 0 0 1 16 0v6"/><path d="M24 30v4"/>'),
    gavel: I('<path d="M20 8l12 12M14 14l12 12M17 11l12 12"/><path d="M26 22l14 14-4 4-14-14"/><path d="M6 42h18"/>'),
    person: I('<circle cx="24" cy="14" r="8"/><path d="M8 42c0-10 7-16 16-16s16 6 16 16"/>'),
    pin: I('<path d="M24 42s14-12 14-24a14 14 0 0 0-28 0c0 12 14 24 14 24z"/><circle cx="24" cy="18" r="5"/>')
  };
  const BY_TAG = {
    'Trust game': 'handshake', 'Repeated game': 'repeat', 'Cheap talk': 'speech', 'Exit option': 'door', 'Ultimatum game': 'scales',
    'Public goods game': 'coins', 'Public goods': 'coins', 'Tragedy of the commons': 'cloud', 'Prisoner\'s dilemma': 'dilemma', 'Stag hunt': 'stag',
    'Game of chicken': 'chicken', 'Bargaining': 'scales', 'Principal and agent': 'chart', 'Moral hazard': 'shield', 'Reputation': 'shield',
    'Costly signaling': 'chart', 'Free riding': 'coins', 'Peer punishment': 'gavel', 'Psychological safety': 'shield', 'Tournament': 'trophy',
    'Coordination': 'chicken', 'Hold-up problem': 'lock', 'Auction': 'gavel', 'Changing payoffs': 'chart', 'Commitment device': 'pin',
    'Adverse selection': 'person', 'Daily action': 'person'
  };
  const icon = tag => ICONS[BY_TAG[tag] || 'speech'];

  return { portrait, office, icon };
})();
