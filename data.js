/* Serve First: Company. Content: sources, team, daily actions and events.
   Every option: t = text, style, fx = effects, c = game theory concept, x = why, o = what happened. */
const REFS = [
  'Fischbacher, U., Gächter, S., & Fehr, E. (2001). Are people conditionally cooperative? Evidence from a public goods experiment. Economics Letters, 71(3), 397–404. doi:10.1016/S0165-1765(01)00394-9',
  'Oosterbeek, H., Sloof, R., & van de Kuilen, G. (2004). Cultural differences in ultimatum game experiments: Evidence from a meta-analysis. Experimental Economics, 7(2), 171–188. doi:10.1023/B:EXEC.0000026978.14316.74',
  'Crawford, V. P., & Sobel, J. (1982). Strategic information transmission. Econometrica, 50(6), 1431–1451. doi:10.2307/1913390',
  'Axelrod, R., & Hamilton, W. D. (1981). The evolution of cooperation. Science, 211(4489), 1390–1396. doi:10.1126/science.7466396',
  'Spears, L. C. (2010). Character and servant leadership: Ten characteristics of effective, caring leaders. The Journal of Virtues & Leadership, 1(1), 25–30. Regent University.',
  'Greenleaf, R. K. (1970). The Servant as Leader. Greenleaf Center for Servant Leadership.',
  'Edmondson, A. (1999). Psychological safety and learning behavior in work teams. Administrative Science Quarterly, 44(2), 350–383. doi:10.2307/2666999',
  'Falk, A., & Kosfeld, M. (2006). The hidden costs of control. American Economic Review, 96(5), 1611–1630. doi:10.1257/aer.96.5.1611',
  'Fehr, E., & Gächter, S. (2000). Cooperation and punishment in public goods experiments. American Economic Review, 90(4), 980–994. doi:10.1257/aer.90.4.980',
  'Hardin, G. (1968). The tragedy of the commons. Science, 162(3859), 1243–1248. doi:10.1126/science.162.3859.1243',
  'Ostrom, E. (1990). Governing the Commons: The Evolution of Institutions for Collective Action. Cambridge University Press.',
  'Spence, M. (1973). Job market signaling. Quarterly Journal of Economics, 87(3), 355–374. doi:10.2307/1882010',
  'Akerlof, G. A. (1970). The market for "lemons": Quality uncertainty and the market mechanism. Quarterly Journal of Economics, 84(3), 488–500. doi:10.2307/1879431',
  'Holmström, B. (1979). Moral hazard and observability. Bell Journal of Economics, 10(1), 74–91. doi:10.2307/3003320',
  'Lazear, E. P., & Rosen, S. (1981). Rank-order tournaments as optimum labor contracts. Journal of Political Economy, 89(5), 841–864. doi:10.1086/261010',
  'Nash, J. F. (1950). The bargaining problem. Econometrica, 18(2), 155–162. doi:10.2307/1907266',
  'Klein, B., Crawford, R. G., & Alchian, A. A. (1978). Vertical integration, appropriable rents, and the competitive contracting process. Journal of Law and Economics, 21(2), 297–326. doi:10.1086/466922',
  'Schelling, T. C. (1960). The Strategy of Conflict. Harvard University Press.',
  'Skyrms, B. (2004). The Stag Hunt and the Evolution of Social Structure. Cambridge University Press.',
  'Thaler, R. H. (1988). Anomalies: The winner\'s curse. Journal of Economic Perspectives, 2(1), 191–202. doi:10.1257/jep.2.1.191'
];

const FOLLOWERS = [
  { id: 'maya', name: 'Maya', role: 'Engineer', color: '#3cc2ab', type: 'Conditional cooperator', desc: 'Works hard when the team does. Stops when free riding goes unanswered.' },
  { id: 'leo', name: 'Leo', role: 'Sales', color: '#f08a4b', type: 'Free rider', desc: 'Charming, talented, and coasts whenever effort goes unnoticed.' },
  { id: 'sam', name: 'Sam', role: 'Lead designer', color: '#e0b85e', type: 'Star with an exit option', desc: 'Your best performer. Recruiters call every week.' },
  { id: 'priya', name: 'Priya', role: 'Operations', color: '#c9a0f0', type: 'Private information', desc: 'Carries more than you can see. Speaks up only when it is safe.' }
];

const INDUSTRIES = [
  { id: 'games', name: 'Game studio', color: '#9b1d33' },
  { id: 'coffee', name: 'Coffee roasters', color: '#6b4a12' },
  { id: 'apps', name: 'App startup', color: '#1f7a6d' }
];

/* ---------- Daily actions: one per day ---------- */
const ACTIONS = [
  { id: 'oneonone', t: '1:1 check-in', d: 'Pick one person. Listen, ask what blocks them.', target: true, style: 'listen',
    fx: id => ({ [id]: 6, trust: 1, ...(id === 'priya' ? { load: -15, reveal: 3 } : {}), ...(id === 'leo' ? { acc: 10 } : {}) }),
    c: 'Reducing information asymmetry', x: 'Each follower knows things you do not: their workload, their offers, their frustrations. A private conversation lowers the cost of telling you the truth, so you learn their real state before it turns into a burnout or a resignation.', src: 3 },
  { id: 'monitor', t: 'Check everyone\'s output', d: 'Review dashboards and ask for status reports.', style: 'command',
    fx: { acc: 25, maya: -3, sam: -3, priya: -3, trust: -1 },
    c: 'Monitoring and the hidden cost of control', x: 'Monitoring makes shirking visible, so the free rider\'s best reply becomes "work". But in experiments, many people reduce effort when they feel controlled: they read monitoring as a signal of distrust. Leo works harder; your cooperators work a little less.', src: 8 },
  { id: 'unblock', t: 'Remove blockers', d: 'Do the boring work yourself so the team can focus.', style: 'serve',
    fx: { all: 2, load: -10, trust: 2 },
    c: 'Changing the payoffs (servant leadership as cost reduction)', x: 'A servant leader lowers the cost of effort for followers. In game terms you are not asking them to be nicer, you are changing the payoff table so that committing is cheaper and more attractive for every type.', src: 6 },
  { id: 'lunch', t: 'Team lunch ($1k)', d: 'Everyone eats together, no agenda.', style: 'serve',
    fx: { all: 3, trust: 2, cash: -1 },
    c: 'Building community in a repeated game', x: 'Cooperation in a repeated game depends on how much players value future rounds together. Shared, informal time raises that value and builds reputation, so tomorrow\'s cooperation becomes more likely. It costs money today.', src: 4 },
  { id: 'praise', t: 'Recognise effort publicly', d: 'Thank the people who delivered yesterday, by name.', style: 'conditional',
    fx: s => { const fx = { acc: 10 }; Object.keys(s.committed).forEach(id => { if (s.committed[id]) fx[id] = 4; }); return fx; },
    c: 'Making effort observable (reputation)', x: 'Recognition only for those who actually delivered turns effort into a visible, rewarded signal. Cooperators feel their contribution counts, and the free rider sees that effort, not presence, is what gets noticed.', src: 1 },
  { id: 'own', t: 'Focus on your own work (+$3k)', d: 'Close a deal yourself. No time for the team today.', style: null,
    fx: { cash: 3 },
    c: 'Opportunity cost of the leader\'s time', x: 'Your own work earns money now, but every hour you spend as an individual contributor is an hour not spent changing your team\'s payoffs. Sometimes the cash is needed; as a habit it trades a multiplier for a one-off.' }
];

/* ---------- Events ---------- */
const isHere = (s, id) => s.team[id].here;
const EVENTS = [
  { id: 'kickoff', triggered: true, tag: 'Trust game', trait: 'Serving first (Greenleaf)', from: 'Day one', title: 'Your first morning as CEO.',
    text: 'Four people just joined a company that does not exist yet. Your first move sets expectations for every round that follows.', src: 6, o: [
    { t: 'Hold one-on-ones: learn everyone\'s goals and offer help', style: 'serve', fx: { all: 8, trust: 8 },
      c: 'Trust move (cooperating first)', x: 'In a trust game the first mover makes themselves vulnerable. Conditional cooperators reward it. But unconditional trust also tells the free rider that nothing happens if he coasts.', o: 'The team feels seen. Leo notices nobody is checking.' },
    { t: 'Agree goals together, then be clear: help for effort, consequences for shirking', style: 'conditional', fx: { all: 5, trust: 6, acc: 25 },
      c: 'Conditional cooperation (tit for tat)', x: 'You cooperate first and announce how you will respond to defection. Announcing it in advance makes the response credible, so committing becomes the best reply even for a self-interested player.', o: 'Clear and fair. Even Leo sits up.' },
    { t: 'Set the rules from the top and monitor output', style: 'command', fx: { maya: -8, sam: -10, priya: -6, acc: 30, trust: -6 },
      c: 'One-shot Nash play: command and comply', x: 'In a single round, commanding is the leader\'s best reply to a follower who would shirk. But it signals distrust, and cooperators who expected a partnership lower their effort.', o: 'Leo complies. Everyone else quietly lowers their expectations.' }] },

  { id: 'leo-slack', tag: 'Repeated game', trait: 'Building community (Spears)', from: 'Maya', title: 'Leo missed a client call. Again.',
    text: 'Maya covered for him and she is not happy. The whole team is watching how you respond.', when: s => isHere(s, 'leo'), src: 4, o: [
    { t: 'Let it go and keep supporting him', style: 'serve', fx: { maya: -10, sam: -4, leo: 3, acc: -15 },
      c: 'Cooperation without a credible response', x: 'Cooperation in a repeated game is held up by the "shadow of the future": what happens next round if you defect. Letting it go removes that shadow. Leo\'s best reply is to keep shirking, and conditional cooperators like Maya start to pull back.', o: 'Leo relaxes. Maya stops covering for anyone.' },
    { t: 'Private, firm conversation with a clear consequence, then a clean slate', style: 'conditional', fx: { maya: 6, leo: -2, acc: 30, trust: 4 },
      c: 'Generous tit for tat', x: 'Respond to the defector, only the defector, proportionately, then return to cooperation. In Axelrod\'s tournaments strategies that were nice, retaliatory, forgiving and clear did best.', o: 'Leo gets the message. Maya sees that free riding has a price.' },
    { t: 'Public reprimand and stricter monitoring for everyone', style: 'command', fx: { all: -6, leo: -6, acc: 35, trust: -8 },
      c: 'Collective punishment', x: 'Punishing everyone for one person\'s defection hits cooperators who did nothing wrong. From their point of view the leader just defected, which can start a cycle of mutual defection.', o: 'Leo works, sulkily. Everyone else feels punished for nothing.' }] },

  { id: 'priya-red', triggered: true, tag: 'Cheap talk', trait: 'Listening (Spears)', from: 'Priya', title: '"I am at my limit this week."',
    text: 'Priya says it quietly, at the end of a meeting. Only she knows how overloaded she really is. Your reaction sets the price of saying "red" in this company.', when: s => isHere(s, 'priya'), src: 3, o: [
    { t: 'Thank her and take work off her plate', style: 'listen', fx: { priya: 10, load: -40, trust: 8, reveal: 5 },
      c: 'Separating equilibrium', x: 'Because saying "red" is rewarded, Priya\'s message now depends on her true state: red when overloaded, green when fine. You can act on information only she had.', o: 'Priya exhales. Next time something breaks, you will hear about it early.' },
    { t: 'Push through: deadlines are deadlines', style: 'ignore', fx: { priya: -12, load: 10, trust: -10 },
      c: 'Pooling equilibrium', x: 'If saying "red" changes nothing except making you look weak, the best reply is to always say "green". Every type sends the same message, so the message carries no information.', o: 'Priya nods. She will not raise it again.' },
    { t: 'Ask her to prove it with numbers first', style: 'command', fx: { priya: -8, trust: -8, load: 5 },
      c: 'Raising the cost of an honest signal', x: 'An honest warning survives only if sending it costs less than the damage it prevents. Demanding proof raises that cost until honest signals stop. The same mechanism silenced the engineers before Challenger.', o: 'Priya spends an evening on a spreadsheet instead of resting.' }] },

  { id: 'sam-offer', tag: 'Exit option', trait: 'Commitment to the growth of people (Spears)', from: 'Sam', title: 'Sam has an offer from a competitor.',
    text: '30% more money. Sam has not decided yet and came to you first.', when: s => isHere(s, 'sam') && !s.flags.samOffer, o: [
    { t: 'Ask what would make staying worth it, then act on it', style: 'listen', fx: { sam: 12, trust: 4, cash: -2, set: { samOffer: true } },
      c: 'Participation constraint', x: 'A follower stays only if the value of staying is at least the outside option. Asking reveals what Sam actually values, so you can meet that constraint at the lowest cost.', o: 'It was not mostly about money. Sam wants ownership of the design system.' },
    { t: 'Remind Sam who writes the performance reviews', style: 'command', fx: { sam: -18, trust: -6, set: { samOffer: true } },
      c: 'A threat that is not credible', x: 'A threat works only if the other player has no better alternative. Sam has one. The threat lowers the value of staying below the outside option, so leaving becomes the best reply.', o: 'Sam goes quiet and starts answering recruiters.' },
    { t: 'Offer a long-term development plan with real responsibility', style: 'serve', fx: { sam: 10, cash: -1, set: { samOffer: true } },
      c: 'Raising the value of the future', x: 'Cooperation in repeated games needs players to value future rounds enough (the discount factor δ). A development path raises what Sam gains from staying, so staying and committing become the best reply.', o: 'Sam sees a future here. For now.' }] },

  { id: 'bonus', tag: 'Ultimatum game', trait: 'Stewardship (Spears)', from: 'Finance', title: 'The first $6k bonus pool is ready.',
    text: 'You decide how it is split.', src: 2, o: [
    { t: 'Let the team agree the rule together', style: 'serve', fx: { all: 5, trust: 5, cash: -6 },
      c: 'Procedural fairness', x: 'People accept outcomes more readily when they helped set the rule, so nobody feels an ultimatum was imposed. But a rule chosen by vote may not tie pay to effort, so the free rider still gains little reason to work.', o: 'They split it equally. Leo is delighted.' },
    { t: 'Split by contribution, using criteria announced in advance', style: 'conditional', fx: { maya: 6, sam: 6, priya: 4, leo: -2, acc: 20, cash: -6 },
      c: 'Incentive compatibility', x: 'When pay is tied to contribution and the rule is known in advance, effort becomes the best reply even for a self-interested follower. Announcing it first turns it into a commitment, not a surprise.', o: 'The people who carried the month get the most. Leo asks what the criteria are next time.' },
    { t: 'Keep a bigger share: you carried the risk', style: 'unfair', fx: { all: -15, trust: -15, cash: -3 },
      c: 'Costly punishment of unfairness', x: 'Theory says followers should accept any positive share. Data say many people reject unfair offers, giving up money to punish unfairness. At work, that punishment is withheld effort.', o: 'Nobody says anything. Effort drops the next morning.' }] },

  { id: 'docs', tag: 'Public goods game', trait: 'Building community (Spears)', from: 'Maya', title: 'Nobody updates the shared documentation.',
    text: 'Everyone uses it. Nobody writes it. Onboarding the next hire will be a nightmare.', src: 9, o: [
    { t: 'Write it yourself this week', style: 'serve', fx: { all: 2, trust: 3, load: -5, cash: -1 },
      c: 'Leader as contributor of last resort', x: 'Providing the public good yourself solves today\'s problem and models the behaviour. But it does not change anyone else\'s payoff, so next month the documentation will be stale again.', o: 'The docs are great. For now.' },
    { t: 'Make documentation part of everyone\'s goals and rotate ownership', style: 'conditional', fx: { acc: 15, all: 1, trust: 2 },
      c: 'Changing the rules of a public goods game', x: 'Free riding is the dominant strategy when contributions are invisible. Assigning visible, rotating responsibility makes contributing privately rewarded, which is how real groups sustain shared resources.', o: 'Each week someone owns the docs, and everyone knows who.' },
    { t: 'Leave it: people are busy', style: 'ignore', fx: { all: -3, load: 5 },
      c: 'Under-provision of a public good', x: 'Each person gains from good documentation but bears the full cost of writing it, so everyone waits for someone else. The predicted outcome is exactly what you have: nobody contributes.', o: 'The docs rot. Priya answers the same questions all day.' }] },

  { id: 'cloud', tag: 'Tragedy of the commons', trait: 'Stewardship (Spears)', from: 'Finance', title: 'The shared cloud bill tripled.',
    text: 'Everyone spins up servers and nobody shuts them down. It is cheaper for each person to leave them running.', src: 11, o: [
    { t: 'Let the team design usage limits together and track them openly', style: 'conditional', fx: { cash: -1, trust: 4, all: 2 },
      c: 'Self-governed commons (Ostrom)', x: 'Hardin predicted shared resources get overused. Ostrom showed groups avoid this when the users themselves make the rules, monitor them and apply graduated sanctions.', o: 'The bill drops by half within a week.' },
    { t: 'Lock it down: only you can approve servers', style: 'command', fx: { cash: 1, all: -4, trust: -3 },
      c: 'Central control of a commons', x: 'Central control stops overuse, but you become the bottleneck, and the team learns that the resource is not theirs to look after.', o: 'Costs fall. Requests pile up on your desk.' },
    { t: 'Ignore it: growth matters more', style: 'ignore', fx: { cash: -6 },
      c: 'Tragedy of the commons', x: 'Each user gets the full benefit of overuse and pays only a small share of its cost, so the shared resource is over-consumed. Nobody is a villain; the incentives produce the outcome (Hardin, 1968).', o: 'The bill keeps climbing.' }] },

  { id: 'blame', tag: 'Prisoner\'s dilemma', trait: 'Healing (Spears)', from: 'Client escalation', title: 'A deadline was missed. Maya and Leo blame each other.',
    text: 'Each says the other dropped the handover. Both are probably partly right.', when: s => isHere(s, 'maya') && isHere(s, 'leo'), src: 7, o: [
    { t: 'Run a blameless review focused on the process', style: 'listen', fx: { maya: 5, leo: 3, trust: 6 },
      c: 'Changing a prisoner\'s dilemma\'s payoffs', x: 'When blame is rewarded, blaming is each person\'s dominant strategy, so both defect. A blameless review removes the reward for blaming and makes honest explanations the better move.', o: 'You find the real cause: a handover nobody owned.' },
    { t: 'Investigate who is guilty and punish them', style: 'command', fx: { maya: -6, leo: -6, trust: -6, acc: 10 },
      c: 'Raising the stakes of defection', x: 'If the loser of the blame game is punished, both have even more reason to blame the other. You get a verdict and lose the information.', o: 'Leo is found guilty. Maya feels vindicated but wary.' },
    { t: 'Ask each of them privately what the other did wrong', style: 'ignore', fx: { maya: -8, leo: -8, trust: -10 },
      c: 'The classic prisoner\'s dilemma', x: 'Questioned separately, each does better by blaming the other whatever the other does, so both blame. Together they would have been better off cooperating.', o: 'Two detailed complaints, no solution, and two people who now distrust each other.' }] },

  { id: 'tool', tag: 'Stag hunt', trait: 'Foresight (Spears)', from: 'Sam', title: 'Should the team switch to a new project tool?',
    text: 'It would save hours, but only if everyone switches. If half switch, it is worse than before.', src: 19, o: [
    { t: 'Switch first yourself, set a date for everyone and help them move', style: 'serve', fx: { all: 3, cash: 2, trust: 3 },
      c: 'Stag hunt: leading to the better equilibrium', x: 'A stag hunt has two equilibria: everyone switches (best) or nobody does (safe). People pick the safe one when they doubt others will move. A leader who goes first and sets a date gives everyone assurance.', o: 'Everyone moves on the same Monday. It works.' },
    { t: 'Let each person decide when they are ready', style: 'ignore', fx: { all: -2, cash: -1 },
      c: 'Coordination failure', x: 'Each person waits to see whether others switch. Waiting is safe, so the team gets stuck in the worse equilibrium, half in each tool.', o: 'Two tools, two versions of the truth.' },
    { t: 'Switch everyone overnight by order, no training', style: 'command', fx: { all: -5, cash: 1 },
      c: 'Forcing coordination', x: 'A mandate does solve the coordination problem, but without support it pushes the cost of switching onto the followers.', o: 'Everyone is on the new tool, grumbling.' }] },

  { id: 'server', tag: 'Game of chicken', trait: 'Persuasion (Spears)', from: 'Head of the partner team', title: 'Another team refuses to release a server you both need.',
    text: 'Both teams have a deadline on Friday. If neither backs down, both miss it.', src: 18, o: [
    { t: 'Escalate and threaten to go over their head', style: 'command', fx: { cash: -3, trust: -2 },
      c: 'Game of chicken', x: 'In chicken, each side wins by not swerving if the other swerves, but if neither swerves both crash. Threats raise the chance of the crash.', o: 'Both teams miss Friday.' },
    { t: 'Propose splitting the server: mornings yours, afternoons theirs', style: 'listen', fx: { cash: 1, trust: 2 },
      c: 'Focal point', x: 'When many outcomes are possible, a simple, obviously fair split becomes a focal point that both sides can agree on without losing face (Schelling).', o: 'Both teams make Friday.' },
    { t: 'Let them have it; your team works around it', style: 'serve', fx: { cash: -2, all: -2, load: 10 },
      c: 'Yielding in chicken', x: 'Swerving avoids the crash and is one of the game\'s equilibria, but it hands the gain to the other side, and your team pays for it.', o: 'They hit their deadline. Your team works late.' }] },

  { id: 'raise', tag: 'Bargaining', trait: 'Stewardship (Spears)', from: 'Maya', title: 'Maya asks for a 15% raise.',
    text: 'She brings market data. She is not threatening to leave, yet.', when: s => isHere(s, 'maya'), src: 16, o: [
    { t: 'Meet her partway, based on the market data', style: 'conditional', fx: { maya: 10, cash: -3 },
      c: 'Nash bargaining solution', x: 'When both sides gain from continuing, a fair deal splits the surplus above each side\'s outside option. Using shared market data makes the split feel principled.', o: 'Maya accepts. She feels the process was fair.' },
    { t: 'Refuse flatly: budgets are tight', style: 'command', fx: { maya: -12, trust: -4 },
      c: 'Ignoring the outside option', x: 'A refusal pushes Maya to improve her outside option, which raises her bargaining power next time, or makes leaving her best reply.', o: 'Maya updates her CV that evening.' },
    { t: 'Give her the full 15%', style: 'serve', fx: { maya: 14, leo: -3, cash: -5 },
      c: 'Conceding the whole surplus', x: 'Maya is happy, but in a team, pay is compared. Others now see that asking, not delivering, is what gets rewarded.', o: 'Maya is thrilled. Leo plans to ask too.' }] },

  { id: 'commission', tag: 'Principal and agent', trait: 'Conceptualization (Spears)', from: 'Leo', title: 'Leo wants to be paid on commission.',
    text: '"Pay me for what I sell, not for showing up."', when: s => isHere(s, 'leo') && !s.flags.commission, src: 14, o: [
    { t: 'Agree: commission on closed deals, with a quality check', style: 'conditional', fx: { leo: 8, set: { commission: true } },
      c: 'Aligning incentives (principal and agent)', x: 'You cannot watch everything Leo does (hidden action). Paying on outcomes makes his effort pay off for him, so his interest and the company\'s line up. The quality check limits the risk of pushing bad deals.', o: 'Leo starts calling clients at 8 am.' },
    { t: 'Offer a team bonus instead', style: 'serve', fx: { all: 2 },
      c: 'The 1/n problem', x: 'With a team bonus, each person gets only a fraction of the reward their extra effort creates, so the free rider\'s incentive barely changes.', o: 'Everyone likes the idea. Leo\'s effort does not change.' },
    { t: 'Refuse: salaries are salaries', style: 'command', fx: { leo: -6 },
      c: 'Moral hazard left in place', x: 'With fixed pay and effort you cannot see, the agent\'s best reply is minimum effort. Refusing keeps that problem.', o: 'Leo shrugs.' }] },

  { id: 'pto', tag: 'Moral hazard', trait: 'Stewardship (Spears)', from: 'The team', title: 'The team asks for unlimited vacation.',
    text: 'Other startups offer it. It costs nothing on paper.', src: 14, o: [
    { t: 'Yes, with a minimum-vacation norm and a coverage plan', style: 'conditional', fx: { all: 4, load: -10, trust: 3 },
      c: 'Designing against moral hazard', x: 'Unlimited policies invite two problems: free riders over-use them and conscientious people under-use them. A minimum norm plus coverage rules fixes both.', o: 'People actually rest, and work is covered.' },
    { t: 'Yes, no rules: we trust adults', style: 'serve', fx: { all: 4, out: { leo: 3 }, load: 8 },
      c: 'Moral hazard', x: 'When people do not bear the cost of their choices, they choose differently. Leo takes three days off right before a launch; Priya takes none.', o: 'Leo is at the beach. Priya covers.' },
    { t: 'No', style: 'command', fx: { all: -4 },
      c: 'Status quo by command', x: 'Refusal avoids the risk but signals distrust, and the team compares you with companies that said yes.', o: 'The team is disappointed.' }] },

  { id: 'defect', tag: 'Reputation', trait: 'Foresight (Spears)', from: 'Your biggest client', title: '"Mark the test as passed. We will fix it later."',
    text: 'Priya found a defect. The client wants to ship on time anyway and wants your sign-off.', src: 4, o: [
    { t: 'Tell the client the truth and delay', style: 'listen', fx: { cash: -5, trust: 10, priya: 8 },
      c: 'Reputation in a repeated game', x: 'With a client you will deal with for years, honesty is not just ethical, it is strategic: a reputation for truthful reporting is worth more than one on-time delivery.', o: 'The client grumbles, then thanks you a week later.' },
    { t: 'Ship it and fix it quietly later', style: 'ignore', fx: { cash: 5, trust: -12, priya: -10, queue: 'blowup' },
      c: 'Short-term defection', x: 'Defecting pays in the single round. In the repeated game, discovery destroys future cooperation. Your team also learns their warnings do not count.', o: 'Shipped on time. Priya says nothing.' },
    { t: 'Ask Priya to prove beyond doubt that the defect is serious', style: 'command', fx: { trust: -6, priya: -8, load: 10 },
      c: 'Burden of proof on the warning', x: 'Flipping the burden of proof onto the person raising the alarm is how the Challenger launch decision went wrong. It makes "red" expensive.', o: 'Priya works all night to prove it. She does.' }] },

  { id: 'blowup', triggered: true, tag: 'Reputation', trait: 'Healing (Spears)', from: 'Your biggest client', title: 'The client found the defect you shipped.',
    text: 'They want to know who knew.', o: [
    { t: 'Own it publicly: it was your decision', style: 'listen', fx: { cash: -6, trust: 6, priya: 4 },
      c: 'Restoring reputation', x: 'Taking responsibility costs you now but signals you are a player who can be trusted in the next round.', o: 'The client stays, cautiously.' },
    { t: 'Say Priya missed it', style: 'unfair', fx: { cash: -4, priya: -25, all: -10, trust: -20 },
      c: 'Scapegoating destroys cooperation', x: 'Every follower now knows that raising a warning can be used against them. The equilibrium shifts to silence.', o: 'Priya knows. Everyone knows.' },
    { t: 'Deny anyone knew', style: 'ignore', fx: { cash: -10, trust: -8 },
      c: 'Doubling down on defection', x: 'When the other side can check the facts, denial is cheap talk that nobody believes.', o: 'The client leaves.' }] },

  { id: 'cuts', tag: 'Costly signaling', trait: 'Stewardship (Spears)', from: 'Investor', title: 'Your investor wants costs cut by 20%.',
    text: '"Cut payroll or I will not fund the next round."', src: 12, o: [
    { t: 'Cut your own salary first and freeze hiring', style: 'serve', fx: { cash: 4, trust: 12, all: 4 },
      c: 'Costly signal of commitment', x: 'A signal is believable when it is costly to fake. A leader who takes the first and biggest cut proves the "we are in this together" message, which words alone cannot.', o: 'The team rallies.' },
    { t: 'Let the lowest performer go', style: 'command', fx: s => ({ leave: isHere(s, 'leo') ? 'leo' : null, queue: isHere(s, 'leo') ? 'hire' : null, all: -6, trust: -5, cash: 2 }),
      c: 'Survivor effects', x: 'The cost saving is real, but remaining team members update their beliefs about how safe they are, and some start hedging with outside options.', o: 'The team is smaller and quieter.' },
    { t: 'Cut everyone\'s pay by 10%, no explanation', style: 'unfair', fx: { all: -12, trust: -10, cash: 6 },
      c: 'Unexplained loss and fairness', x: 'People evaluate cuts by whether they are fair, not only by their size. An unexplained cut reads as an unfair offer, and the response is withdrawn effort.', o: 'Nobody complains out loud.' }] },

  { id: 'credit', tag: 'Free riding', trait: 'Building community (Spears)', from: 'Maya', title: 'Leo presented Maya\'s work to the client as his own.',
    text: 'The client loved it. Maya found out.', when: s => isHere(s, 'leo') && isHere(s, 'maya'), src: 1, o: [
    { t: 'Correct the record and coach Leo privately', style: 'conditional', fx: { maya: 10, leo: -3, acc: 20, trust: 5 },
      c: 'Protecting conditional cooperators', x: 'Conditional cooperators contribute as long as they believe others do and that contributions are credited. Correcting the record keeps that belief alive.', o: 'Maya feels backed. Leo learns a line was crossed.' },
    { t: 'Say nothing: the client is happy', style: 'ignore', fx: { maya: -14, trust: -6 },
      c: 'Rewarded free riding', x: 'When free riding visibly pays, cooperators lower their contributions. This is the decline seen in public goods experiments.', o: 'Maya stops sharing her work early.' },
    { t: 'Fire Leo on the spot', style: 'command', fx: { leave: 'leo', all: -3, trust: -2, queue: 'hire' },
      c: 'Grim trigger', x: 'Ending the relationship after one defection is a credible deterrent, but it is unforgiving, and in noisy settings it destroys relationships that could have recovered.', o: 'Leo is gone. The team is shocked.' }] },

  { id: 'peer', tag: 'Peer punishment', trait: 'Building community (Spears)', from: 'Maya', title: 'Maya wants a weekly "who slacked" vote.',
    text: 'She thinks the team should hold each other accountable.', src: 9, o: [
    { t: 'Yes, with clear rules: specific behaviour, private, proportionate', style: 'conditional', fx: { acc: 25, leo: -3, trust: 2 },
      c: 'Peer punishment sustains cooperation', x: 'In public goods experiments, cooperation collapses without punishment and stays high when members can punish free riders. Clear rules stop it turning personal.', o: 'Leo starts meeting deadlines.' },
    { t: 'No, accountability is my job', style: 'command', fx: { maya: -3, acc: 5 },
      c: 'Centralised enforcement', x: 'Keeping enforcement central avoids conflict, but you see less than the team does.', o: 'Maya is a bit disappointed.' },
    { t: 'Let them sort it out informally', style: 'ignore', fx: { leo: -10, maya: -3, trust: -6 },
      c: 'Antisocial punishment risk', x: 'Without rules, punishment can target the wrong people or become revenge, and cooperation can fall instead of rise.', o: 'It gets personal. Fast.' }] },

  { id: 'remote', tag: 'Principal and agent', trait: 'Persuasion (Spears)', from: 'Sam', title: 'Sam asks to work fully remote.',
    text: 'Sam does the best work at home. Others might ask too.', when: s => isHere(s, 'sam'), src: 14, o: [
    { t: 'Trial for a month with clear output goals', style: 'conditional', fx: { sam: 8, trust: 2 },
      c: 'Contracting on outcomes', x: 'When effort is hard to observe, contract on what you can observe: results. Clear output goals make remote work safe for both sides.', o: 'Sam ships more than ever.' },
    { t: 'Yes, no conditions', style: 'serve', fx: { sam: 10, acc: -10 },
      c: 'Unconditional trust with a precedent', x: 'Sam will deliver, but everyone else now expects the same deal without the same accountability.', o: 'Sam is happy. Leo asks for the same.' },
    { t: 'No: everyone works in the office', style: 'command', fx: { sam: -12, trust: -3 },
      c: 'Input monitoring', x: 'Requiring presence monitors inputs, not results. It lowers the value of staying for your star, whose outside option is strong.', o: 'Sam takes a recruiter\'s call.' }] },

  { id: 'mistake', tag: 'Psychological safety', trait: 'Healing (Spears)', from: 'Maya', title: 'Maya made a $4k mistake.',
    text: 'She told you herself, immediately.', when: s => isHere(s, 'maya'), src: 7, o: [
    { t: 'Thank her for flagging it fast and run a learning review', style: 'listen', fx: { cash: -4, maya: 6, trust: 6 },
      c: 'Rewarding honest reporting', x: 'If reporting a mistake is safe, people report early, when mistakes are cheap. Edmondson found psychological safety is linked to learning behaviour in teams.', o: 'The fix is in by lunch, and a checklist prevents a repeat.' },
    { t: 'Formal written warning', style: 'command', fx: { cash: -4, maya: -10, trust: -8 },
      c: 'Punishing the signal', x: 'Punishing someone who reported their own mistake teaches the team to hide the next one. You lose the information, not the mistakes.', o: 'Next time someone makes a mistake, you will hear about it from a client.' },
    { t: 'Deduct it from her bonus', style: 'unfair', fx: { cash: -1, maya: -16, trust: -6 },
      c: 'Unfair cost-shifting', x: 'Shifting the cost onto the person who was honest reads as unfair, and costly punishment of unfairness follows.', o: 'Maya pays. She will not forget.' }] },

  { id: 'promotion', tag: 'Tournament', trait: 'Commitment to the growth of people (Spears)', from: 'You', title: 'One team-lead role. Maya and Sam both want it.',
    text: 'Whoever loses might disengage, or leave.', when: s => isHere(s, 'maya') && isHere(s, 'sam'), src: 15, o: [
    { t: 'Publish clear criteria and a timeline, then decide', style: 'conditional', fx: { maya: 4, sam: 4, acc: 15 },
      c: 'Rank-order tournament', x: 'A promotion is a tournament: the prize motivates effort from everyone competing for it. Clear criteria keep the competition about performance rather than politics.', o: 'Both raise their game. Sam wins and Maya respects how it was done.' },
    { t: 'Quietly give it to Sam, your best performer', style: 'command', fx: { sam: 10, maya: -12, trust: -4 },
      c: 'Unannounced prizes', x: 'A prize that was never openly contested motivates nobody, and the loser updates their belief that effort here is rewarded.', o: 'Maya finds out from a calendar invite.' },
    { t: 'Make it a contest with a big prize; the loser gets nothing', style: 'unfair', fx: { acc: 20, maya: -4, sam: -4, trust: -4 },
      c: 'Tournament with sabotage risk', x: 'A large gap between winner and loser raises effort, but it also raises the incentive to undermine your rival.', o: 'Output rises. So does tension.' }] },

  { id: 'crunch', tag: 'Bargaining', trait: 'Listening (Spears)', from: 'Your biggest client', title: 'The client moved the deadline up by a week.',
    text: 'Your team is already at capacity.', src: 16, o: [
    { t: 'Negotiate scope with the client', style: 'listen', fx: { cash: -2, load: -10, trust: 4 },
      c: 'Using your outside option', x: 'Your bargaining power depends on your alternatives. Showing the client what can be delivered well, and what cannot, moves the deal toward a split both can accept.', o: 'You deliver the core on time, the rest later.' },
    { t: 'Mandatory weekend work', style: 'command', fx: { cash: 6, all: -8, load: 25, trust: -5 },
      c: 'Short-term extraction', x: 'You win this round by drawing down a stock of goodwill and energy that the repeated game depends on.', o: 'Delivered. Exhausted.' },
    { t: 'Work the weekend alongside whoever volunteers', style: 'serve', fx: { cash: 4, load: 10, trust: 6, all: 2 },
      c: 'Leading by example as a signal', x: 'A leader who bears the cost alongside the team sends a signal that cannot be faked cheaply, which raises voluntary cooperation.', o: 'Three people show up. You order pizza.' }] },

  { id: 'rumor', tag: 'Cheap talk', trait: 'Awareness (Spears)', from: 'Office chat', title: 'A rumour says layoffs are coming.',
    text: 'There are no layoffs planned, but people are nervous.', src: 3, o: [
    { t: 'Share the real numbers openly', style: 'listen', fx: { all: 3, trust: 8 },
      c: 'Verifiable information beats cheap talk', x: 'Words like "do not worry" cost nothing and so prove nothing. Showing the actual numbers is verifiable, so it actually changes beliefs.', o: 'The rumour dies by lunch.' },
    { t: 'Say "everything is fine"', style: 'ignore', fx: { trust: -4, sam: -6 },
      c: 'Cheap talk that is not credible', x: 'A leader would say "everything is fine" whether it is true or not, so the message carries no information.', o: 'Sam updates the CV, just in case.' },
    { t: 'Say nothing', style: 'ignore', fx: { all: -5 },
      c: 'Silence as a signal', x: 'When people expect you to speak, silence is read as information, usually bad.', o: 'The rumour grows.' }] },

  { id: 'clash', tag: 'Coordination', trait: 'Persuasion (Spears)', from: 'Sam and Priya', title: 'Sam and Priya clash over process.',
    text: 'Sam wants speed, Priya wants checks. Both have a point.', when: s => isHere(s, 'sam') && isHere(s, 'priya'), src: 18, o: [
    { t: 'Facilitate a joint rule they both agree to', style: 'listen', fx: { sam: 4, priya: 4, trust: 3 },
      c: 'Battle of the sexes (coordination with conflict)', x: 'Both prefer agreeing to fighting, but each prefers a different agreement. A jointly designed rule turns it into a focal point both can accept.', o: 'They agree: fast by default, checks on anything client-facing.' },
    { t: 'Decide immediately yourself', style: 'command', fx: { sam: -2, priya: -6 },
      c: 'Imposed equilibrium', x: 'A decision ends the conflict, but whoever loses learns that persuasion does not work here.', o: 'Sam wins. Priya stops arguing, and stops raising concerns.' },
    { t: 'Let them fight it out', style: 'ignore', fx: { sam: -6, priya: -6, trust: -3 },
      c: 'Coordination failure', x: 'Without a mechanism to pick one equilibrium, both keep pushing their own and the team pays the cost of miscoordination.', o: 'Two processes. Daily friction.' }] },

  { id: 'supplier', tag: 'Hold-up problem', trait: 'Foresight (Spears)', from: 'Your contractor', title: 'Your only contractor just raised prices by 40%.',
    text: 'You built everything around their system. They know switching would cost you weeks.', src: 17, o: [
    { t: 'Pay this time, and start onboarding a second contractor', style: 'conditional', fx: { cash: -3 },
      c: 'Restoring your outside option', x: 'A hold-up happens when one side has made an investment specific to the relationship. A second supplier restores your outside option and your bargaining power.', o: 'Next quarter they offer a discount.' },
    { t: 'Refuse and threaten to leave immediately', style: 'command', fx: { cash: -6, load: 10 },
      c: 'A non-credible threat', x: 'They know switching costs you more than the price rise, so the threat is not credible. Calling the bluff costs you.', o: 'They call your bluff. Work stalls for days.' },
    { t: 'Sign a long-term contract with a price lock', style: 'serve', fx: { cash: -2 },
      c: 'Contracting against hold-up', x: 'Long-term contracts protect relationship-specific investments, at the cost of flexibility.', o: 'Prices are locked for two years.' }] },

  { id: 'bid', tag: 'Auction', trait: 'Foresight (Spears)', from: 'A government agency', title: 'You can bid for a big contract against five rivals.',
    text: 'Nobody knows the true cost of the work.', src: 20, o: [
    { t: 'Bid low to make sure you win', style: null, fx: { cash: -5, load: 15 },
      c: 'The winner\'s curse', x: 'When everyone estimates an uncertain cost, the winner is often the one who underestimated it most. Winning can mean losing money.', o: 'You won. The work costs more than you bid.' },
    { t: 'Bid your honest estimate plus a margin', style: null, fx: { cash: 4 },
      c: 'Shading for the winner\'s curse', x: 'Experienced bidders adjust their estimate, knowing that winning is itself bad news about the estimate. You win less often but profitably.', o: 'You win at a fair price.' },
    { t: 'Do not bid: the team is at capacity', style: 'listen', fx: { load: -5 },
      c: 'Opportunity cost and capacity', x: 'Skipping a game you cannot play well is also a strategy, especially when your team is the constraint.', o: 'The team is relieved.' }] },

  { id: 'sick', tag: 'Repeated game', trait: 'Healing (Spears)', from: 'Priya', title: 'Priya is sick but offers to work from bed.',
    text: '"I can still answer messages."', when: s => isHere(s, 'priya'), src: 4, o: [
    { t: 'Tell her to rest; you cover her urgent work', style: 'serve', fx: { load: -25, priya: 6, out: { priya: 1 }, cash: -1 },
      c: 'Investing in the long game', x: 'Accepting a short-term loss to protect a long-term relationship is exactly the trade-off a high discount factor rewards.', o: 'Priya is back in two days, fully.' },
    { t: 'Accept her offer', style: 'ignore', fx: { load: 15, cash: 1 },
      c: 'Drawing down a stock', x: 'You gain a little today and drain the health that tomorrow\'s rounds depend on.', o: 'Priya works sick. Recovery takes longer.' },
    { t: 'Ask for a doctor\'s note', style: 'command', fx: { priya: -8, trust: -6, out: { priya: 1 } },
      c: 'Signalling distrust', x: 'Demanding proof from someone with a record of honesty tells everyone their honesty is not believed.', o: 'She sends it. She remembers.' }] },

  { id: 'coach', tag: 'Changing payoffs', trait: 'Commitment to the growth of people (Spears)', from: 'Leo', title: 'Leo asks for help with the new sales tool.',
    text: 'He is struggling and, for once, asking.', when: s => isHere(s, 'leo'), o: [
    { t: 'Coach him yourself this week', style: 'serve', fx: { leo: 12, acc: 10, trust: 2 },
      c: 'Payoffs, not people, are fixed', x: 'Some free riding is not laziness but low capability: effort pays little when you cannot do the task. Raising capability raises the payoff to effort.', o: 'Leo closes his first deal with the tool.' },
    { t: 'Send him a tutorial', style: null, fx: { leo: 2 },
      c: 'Cheap support', x: 'Low-cost help changes little. The payoff from trying stays low.', o: 'Leo watches half of it.' },
    { t: '"Figure it out, that is your job"', style: 'command', fx: { leo: -8 },
      c: 'Confirming the free rider\'s belief', x: 'When asking for help is punished, coasting looks like the safer strategy.', o: 'Leo stops asking.' }] },

  { id: 'volunteer', tag: 'Public goods', trait: 'Building community (Spears)', from: 'The team', title: 'The team wants a company volunteer day.',
    text: 'One Friday helping a local charity.', o: [
    { t: 'Paid volunteer day for everyone', style: 'serve', fx: { all: 6, trust: 4, cash: -3 },
      c: 'Shared identity raises cooperation', x: 'A shared purpose raises how much people value the group and its future rounds, which makes cooperation easier to sustain. The cost is today\'s output.', o: 'Best day of the quarter.' },
    { t: 'People can go, unpaid', style: null, fx: { all: 1 },
      c: 'Private provision', x: 'A good cause that people must pay for themselves attracts only those who value it most.', o: 'Two people go.' },
    { t: 'Not now: we are too busy', style: 'command', fx: { all: -3 },
      c: 'Short-term focus', x: 'Saying no saves today\'s output but signals that the company\'s values are negotiable.', o: 'The team shrugs.' }] },

  { id: 'survey', tag: 'Commitment device', trait: 'Awareness (Spears)', from: 'Anonymous survey', title: 'Feedback: "You micromanage."',
    text: 'Half the team said it, anonymously.', src: 18, o: [
    { t: 'Share the results and commit publicly to one change', style: 'listen', fx: { trust: 10, all: 3 },
      c: 'Commitment device', x: 'A public promise ties your hands: going back on it is now costly for you, which is exactly why people believe it.', o: 'People notice you keep the promise.' },
    { t: 'Thank them and change nothing', style: 'ignore', fx: { trust: -5 },
      c: 'Cheap talk', x: '"Thanks for the feedback" costs nothing and commits to nothing, so nobody updates their beliefs.', o: 'Next survey, fewer people answer.' },
    { t: 'Try to find out who wrote it', style: 'command', fx: { trust: -15, priya: -8, all: -4 },
      c: 'Destroying an anonymous channel', x: 'Anonymity made honest feedback cheap. Breaking it raises the cost of honesty, and every future survey becomes a pooling equilibrium of polite answers.', o: 'Everyone hears about it.' }] },

  { id: 'hire', triggered: true, tag: 'Adverse selection', trait: 'Foresight (Spears)', from: 'You', title: 'You need to replace someone who left.',
    text: 'Three ways to hire. Candidates know their own quality; you do not.', src: 13, when: s => Object.values(s.team).some(p => !p.here), o: [
    { t: 'Paid trial project before the offer', style: 'conditional', fx: { cash: -2, hire: { eng: 70, name: 'Noah' } },
      c: 'Screening', x: 'A trial project is a test that good candidates pass easily and weak ones struggle with, so it reveals the hidden quality you could not see.', o: 'Noah joins and is excellent.' },
    { t: 'Hire the candidate with the most prestigious degree', style: null, fx: { cash: -1, hire: { eng: 55, name: 'Ava' } },
      c: 'Job market signalling', x: 'A degree is a costly signal that correlates with ability (Spence, 1973). It is informative, but it is not the same as the skills you need.', o: 'Ava is smart and still learning the job.' },
    { t: 'Hire the cheapest candidate available this week', style: null, fx: { hire: { eng: 35, name: 'Max' } },
      c: 'Adverse selection', x: 'When you cannot see quality and offer the lowest price, the candidates who accept are disproportionately the ones with no better options.', o: 'Max is cheap. You will see why.' }] }
];

if (typeof module !== 'undefined') module.exports = { REFS, FOLLOWERS, INDUSTRIES, ACTIONS, EVENTS };
