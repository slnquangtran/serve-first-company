# Serve First: Company

A day-by-day management game about **servant leadership**, built on **game theory**.

You found a company and lead four followers, each playing a different strategy from experimental economics: a conditional cooperator, a free rider, a star with an exit option, and someone with private information. For 20 working days you take one leadership action each morning and handle whatever lands in your inbox. After every move, a card explains the game theory concept behind it (prisoner's dilemma, public goods, cheap talk, moral hazard, tournaments, hold-up, winner's curse and more), with academic sources.

## Play

Open `index.html` in a browser (double-click works). No build step, no install.

## Files

| File | What it is |
|---|---|
| `index.html` | Page, styles |
| `engine.js` | Game rules: follower strategies, daily economics, events queue (pure functions) |
| `data.js` | Content: sources, team, daily actions, 30 events with per-move concepts |
| `ui.js` | Screens, moves, concept cards, daily reports |
| `engine.test.js` | Self-checks and strategy simulations: `node engine.test.js` |

## Thesis the game tests

Serving first is not naive kindness: in a repeated game it is the equilibrium strategy, as long as service comes with a credible response to free riding, honest listening and fairness. The simulation in `engine.test.js` checks that this strategy beats pure command.
