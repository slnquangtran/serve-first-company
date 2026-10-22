# Serve First: Company

A day-by-day management game about **servant leadership**, built on **game theory**.

You found a company and lead four followers, each playing a different strategy from experimental economics: a conditional cooperator, a free rider, a star with an exit option, and someone with private information. For 20 working days you take one leadership action each morning and handle whatever lands in your inbox. After every move, a card explains the game theory concept behind it (prisoner's dilemma, public goods, cheap talk, moral hazard, tournaments, hold-up, winner's curse and more), with academic sources.

## Pressure from outside

- **A rival with a hidden strategy.** Every day you pick a market move, hold price or undercut, against a rival firm in a repeated prisoner's dilemma. The rival secretly plays tit for tat, grim trigger, always defect (with day-one bait) or tit for two tats. You see only its history, so you must infer the strategy and play the best reply. The ending reveals what it was.
- **Hiring under adverse selection.** Two empty seats. Recruiting shows three applicants with an interview score, a referral or not, and an asking wage. Their real type (cooperator, free rider, star, or lemon) stays hidden until they have worked 3 days, and their pay joins payroll every day.
- **Rent and shocks.** $14k rent every Friday, plus random shocks: outages, viral posts, late payments, market dips, tax bills, flu.
- **Rival-driven events.** Two days of rival price cuts in a row trigger poaching. The rival may propose illegal collusion (price fixing), which can lead to a leniency-programme prisoner's dilemma with the regulator. A bidding war for a star hire (winner's curse), a day-10 board meeting where you can inflate the forecast (and get audited), and a coalition walkout when trust falls.

Simulations in `engine.test.js` (200 games each): a strategic leader averages about $34k at the end with 3% bankruptcies; pure command goes bankrupt every time.

## Play

Open `index.html` in a browser (double-click works). No build step, no install.

## Files

| File | What it is |
|---|---|
| `index.html` | Page, styles |
| `engine.js` | Game rules: follower strategies, daily economics, events queue (pure functions) |
| `data.js` | Content: sources, team, daily actions, 30 events with per-move concepts |
| `ui.js` | Screens, moves, concept cards, daily reports, GSAP motion |
| `art.js` | Hand-made SVG art: portraits whose expression follows engagement, office scene, event icons |
| `engine.test.js` | Self-checks and strategy simulations: `node engine.test.js` |

## Thesis the game tests

Serving first is not naive kindness: in a repeated game it is the equilibrium strategy, as long as service comes with a credible response to free riding, honest listening and fairness. The simulation in `engine.test.js` checks that this strategy beats pure command.
