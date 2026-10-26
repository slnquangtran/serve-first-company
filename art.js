/* Serve First: Company. Pixel art drawn with pxl (art/serve.px.js), built to assets/. */
const ART = (() => {
  const img = (path, cls, alt = '') => `<img src="assets/${path}" class="${cls}" alt="${alt}"${alt ? '' : ' aria-hidden="true"'}>`;
  const sprite = (name, cls = 'px', alt) => img(`sprites/${name}.png`, cls, alt);

  // Expression follows engagement: the follower's current best reply shows on their face.
  function portrait(id, color, eng, isOut, isNewHire) {
    const mood = isOut ? 'out' : eng >= 60 ? 'happy' : eng >= 40 ? 'meh' : 'sad';
    return `<span class="portrait" style="background:${color}">${sprite(`face_${isNewHire ? 'hire' : id}_${mood}`)}</span>`;
  }

  // Founding-screen illustration: the office waiting for its team, the founder bringing coffee.
  const office = () => img('scenes/office.gif', 'office-art', 'A pixel office: four empty desks with glowing screens, a payoff matrix on the whiteboard, and the founder carrying a tray of coffee');

  const BY_TAG = {
    'Trust game': 'handshake', 'Repeated game': 'repeat', 'Cheap talk': 'speech', 'Exit option': 'door', 'Ultimatum game': 'scales',
    'Public goods game': 'coins', 'Public goods': 'coins', 'Tragedy of the commons': 'cloud', 'Prisoner\'s dilemma': 'dilemma', 'Stag hunt': 'stag',
    'Game of chicken': 'chicken', 'Bargaining': 'scales', 'Principal and agent': 'chart', 'Moral hazard': 'shield', 'Reputation': 'shield',
    'Costly signaling': 'chart', 'Free riding': 'coins', 'Peer punishment': 'gavel', 'Psychological safety': 'shield', 'Tournament': 'trophy',
    'Coordination': 'chicken', 'Hold-up problem': 'lock', 'Auction': 'gavel', 'Changing payoffs': 'chart', 'Commitment device': 'pin',
    'Adverse selection': 'person', 'Daily action': 'person', 'Collusion': 'handshake', 'Market': 'chart'
  };
  const icon = tag => sprite(`icon_${BY_TAG[tag] || 'speech'}`, 'px ev-icon');

  return { portrait, office, icon, sprite };
})();
