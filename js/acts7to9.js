import { h, $, $$, complete, setFb, fb, wrap, sorter, shuffle, state, toast } from './core.js?v=ar-qa-10';
import { getLanguage, translate } from './i18n.js?v=ar-qa-10';

/* ---------------- ACT 7 ---------------- */
const DIMS = [
  ['Frequency', ['Monthly or less', 'Every week or two', 'Several times a week']],
  ['Time each run', ['Under 10 min', '10 to 30 min', 'Over 30 min']],
  ['Data safety', ['Needs live client data', 'Redactable with effort', 'Synthetic is realistic']],
  ['Cost of an error', ['Client or regulator sees it', 'Internal rework', 'You catch it at once']],
  ['Format stability', ['Different every time', 'Loosely similar', 'Same shape every time']],
];
const PRESETS = {
  brief: ['Pre-meeting brief from statement + last note', [3, 3, 3, 3, 3]],
  notes: ['Meeting notes into the CRM record', [3, 2, 3, 3, 3]],
  comm: ['Weekly market commentary emailed to clients', [2, 2, 3, 1, 2]],
  prop: ['First draft of an investment proposal', [1, 3, 2, 1, 2]],
  live: ['Live portfolio valuations for clients', [2, 1, 1, 1, 2]],
  own: ['My own task (score it yourself)', [0, 0, 0, 0, 0]],
};
export function scorer(card) {
  const w = wrap(card);
  const sel = h('select', { 'aria-label': 'Candidate task' }, ...Object.entries(PRESETS).map(([k, [t]]) => h('option', { value: k }, t)));
  let s = [...PRESETS.brief[1]];
  const segs = DIMS.map(([name, opts], d) => {
    const seg = h('div', { class: 'seg' }, ...opts.map((o, k) => { const b = h('button', {}, `${k + 1} · ${o}`); b.onclick = () => { s[d] = k + 1; sel.value = 'own'; render(); complete(card.dataset.id); }; return b; }));
    w.append(h('div', { class: 'dim' }, h('b', {}, name), seg));
    return seg;
  });
  const vb = h('div', { class: 'verdictbox' }, h('div', { class: 'score' }), h('div'));
  const mk = (label, min, max, val, unit) => { const i = h('input', { type: 'range', min, max, value: val }); const o = h('output', {}, val + unit); i.oninput = () => { o.textContent = i.value + unit; render(); }; return [h('div', { class: 'slider-row' }, h('label', {}, label), i, o), i]; };
  const [r1, setup] = mk('Setup time', 1, 10, 3, ' h'); const [r2, saved] = mk('Saved per run', 5, 60, 25, ' min'); const [r3, runs] = mk('Runs per week', 1, 10, 4, '');
  const pb = h('div');
  sel.onchange = () => { s = [...PRESETS[sel.value][1]]; render(); complete(card.dataset.id); };
  w.prepend(h('div', { class: 'row', style: { marginBottom: '10px' } }, h('b', { style: { fontSize: '14px' } }, 'Candidate:'), sel));
  w.append(vb, h('details', { class: 'why' }, h('summary', {}, 'Payback: how many runs before it earns its keep?'), h('div', { class: 'mt' }, r1, r2, r3, pb)));
  function render() {
    segs.forEach((seg, d) => $$('button', seg).forEach((b, k) => b.classList.toggle('on', s[d] === k + 1)));
    const total = s.reduce((a, b) => a + b, 0), all = s.every(x => x);
    const v = !all ? ['v-none', '–', 'Score all five dimensions.', ''] : total >= 12 ? ['v-green', total, 'Green: build it today.', 'Frequent, worth the time, safe to practise on, and you see any error first.'] : total >= 8 ? ['v-amber', total, 'Amber: build it, but narrow it.', 'Pick the single lowest-risk, most repetitive step and build only that. Add a firm review step.'] : ['v-red', total, 'Red: pick something else.', 'Not a candidate at any level of enthusiasm today. Raise it as a platform or policy question instead of a personal workaround.'];
    vb.firstChild.className = 'score ' + v[0]; vb.firstChild.textContent = v[1];
    vb.lastChild.replaceChildren(h('b', { style: { fontSize: '17px' } }, v[2]), h('p', { class: 'muted', style: { margin: '4px 0 0' } }, v[3]), (all && Math.min(...s) < 3) ? h('p', { class: 'muted', style: { margin: '4px 0 0' } }, 'Weakest dimension: ' + DIMS[s.indexOf(Math.min(...s))][0]) : '');
    const runsNeeded = Math.ceil(+setup.value * 60 / +saved.value), weeks = (runsNeeded / +runs.value);
    pb.replaceChildren(fb(weeks <= 4 ? 'good' : 'neutral', `Pays back after ${runsNeeded} runs: about ${weeks < 1 ? 'one week' : Math.ceil(weeks) + ' weeks'}.`, 'A weekly task that saves 25 minutes repays a three-hour build within a month. A quarterly task never does, which is why frequency is the first question.'));
  }
  render();
}

const NARROW = {
  X: ['information about the client', "the client's file", 'the last quarterly statement and the previous meeting note'],
  Y: ['useful insights', 'a summary', 'our five-section pre-meeting brief, every figure page-referenced'],
  Z: ['quickly', 'a few minutes', 'under 5 minutes'],
};
export function narrow(card) {
  const w = wrap(card);
  const pick = { X: 0, Y: 0, Z: 0 };
  const line = h('p', { class: 'promise' });
  const meter = h('div', { class: 'meter' }, h('i'));
  const msg = h('div');
  for (const [k, opts] of Object.entries(NARROW)) {
    const row = h('div', { class: 'row', style: { margin: '8px 0' } }, h('b', { style: { width: '24px' } }, getLanguage() === 'ar' ? ({ X: 'س', Y: 'ص', Z: 'ع' }[k]) : k));
    opts.forEach((o, i) => { const c = h('button', { class: 'chip' + (i === 0 ? ' on' : '') }, o); c.onclick = () => { pick[k] = i; $$('.chip', row).forEach(x => x.classList.remove('on')); c.classList.add('on'); render(); }; row.append(c); });
    w.append(row);
  }
  w.append(line, h('div', { class: 'row' }, h('b', { style: { fontSize: '14px' } }, 'Testability'), h('div', { style: { flex: 1 } }, meter)), msg);
  function render() {
    line.innerHTML = getLanguage() === 'ar'
      ? `«زوّدها بـ <u>${translate(NARROW.X[pick.X])}</u>، فتعطيك <u>${translate(NARROW.Y[pick.Y])}</u> في <u>${translate(NARROW.Z[pick.Z])}</u>، في كل مرة.»`
      : `“Give it <u>${NARROW.X[pick.X]}</u>, and it gives you <u>${NARROW.Y[pick.Y]}</u>, in <u>${NARROW.Z[pick.Z]}</u>, every time.”`;
    const n = pick.X + pick.Y + pick.Z; meter.firstChild.style.width = (n / 6 * 100) + '%';
    if (n === 6) { setFb(msg, 'good', 'Now it can be built and tested.', 'One input shape, one output shape, a time you can measure. You can explain it to a colleague in a minute, test it on three cases, and widen it later. You can almost never rescue a broad tool.'); complete(card.dataset.id); }
    else setFb(msg, 'neutral', n <= 2 ? 'A strategy, not a tool.' : 'Closer.', 'A vague input means you cannot test what it should do with missing documents. A vague output means two runs will never look alike. Make every part concrete.');
  }
  render();
}

/* ---------------- ACT 8 ---------------- */
const PIECES = [
  { id: 'p1', text: 'Role: private banking RM at a Saudi Islamic bank', bin: 'brain', why: 'Who it is: part of the instructions.' },
  { id: 'p2', text: 'Rule: never calculate; say what should be calculated', bin: 'brain', why: 'A behaviour rule: instructions.' },
  { id: 'p3', text: 'Fallback: write "not available in source" and continue', bin: 'brain', why: 'How to behave when stuck: instructions.' },
  { id: 'p4', text: 'Two good past briefs (redacted)', bin: 'memory', why: 'The single highest-value attachment.' },
  { id: 'p5', text: 'Arabic/English product glossary', bin: 'memory', why: 'Reference material it consults every run.' },
  { id: 'p6', text: "Sara's style guide (ten observations)", bin: 'memory', why: 'Attached as a file, not described in a sentence.' },
  { id: 'p7', text: 'Five sections with word counts', bin: 'shape', why: 'The output template.' },
  { id: 'p8', text: '"Open points" as the required last section', bin: 'shape', why: 'Part of the fixed shape, every time.' },
  { id: 'p9', text: "Client A's statement for this week's meeting", bin: 'input', why: 'The trap: this is the per-run input you supply, not part of the tool. Attach it to the tool permanently and every future brief is about Client A.' },
];
export function assemble(card) {
  const w = wrap(card); const res = h('div');
  sorter({ host: w, items: shuffle(PIECES, 9), explain: true,
    bins: [{ id: 'brain', label: 'Brain · instructions', color: '#1B2F63' }, { id: 'memory', label: 'Memory · reference', color: '#B8862B' }, { id: 'shape', label: 'Shape · template', color: '#1E7F5C' }, { id: 'input', label: 'Not part of the tool', color: '#B4432F' }],
    onDone: (ok, n) => { setFb(res, ok >= 8 ? 'good' : 'neutral', `${ok} of ${n} placed correctly.`, 'That is the entire anatomy. A tool is the three parts you write once; the client file is what you give it each time. Write the instructions <b>for a colleague, not for yourself</b>: "do the usual format" works only while you remember what usual means.'); complete(card.dataset.id, { ok }); } });
  w.append(res);
}

const EX = [
  { bars: [52, 18, 48], text: '<p><b>Client Overview.</b> Client A is a high-net-worth family with a diversified portfolio and a long-standing relationship with the bank.</p><p><b>Key Considerations.</b> Market volatility, liquidity needs and succession planning are important themes to explore.</p><p><b>Recommendations.</b> Consider rebalancing towards fixed income to reduce risk.</p>', note: 'Plausible, generic, wrong-shaped, and it ends with a recommendation nobody asked for.' },
  { bars: [82, 55, 74], text: '<p><b>Position today.</b> SAR 45.2m (p.1); 62% of equities in one stock (p.2).</p><p><b>What changed.</b> Son flagged ~SAR 10m for property, Q1 2027 (p.5).</p><p><b>Likely to raise.</b> Concentration; liquidity timing.</p><p><b>My three questions.</b> Timing of purchase? Who instructs? Appetite to reduce concentration?</p><p><b>Open points.</b> Risk profile from Feb 2024.</p>', note: 'The shape arrives with one example. The voice is still neutral-generic.' },
  { bars: [96, 90, 88], text: '<p><b>Position today.</b> SAR 45.2m (p.1). Equities are the issue: 62% in one stock (p.2).</p><p><b>What changed.</b> Khalid now leads; ~SAR 10m needed in Q1 2027 for property (p.5).</p><p><b>Likely to raise.</b> Why equities fell; whether we can free cash by March.</p><p><b>My three questions.</b> How firm is March? Should your father join the liquidity call? How quickly would you want to reduce the single-stock position, if at all?</p><p><b>Open points.</b> Risk profile is from Feb 2024. Fund lock-up ends Dec 2026; sukuk not until 2028.</p>', note: 'With two examples it learns what varies and what stays fixed. This reads like Sara.' },
];
export function examples(card) {
  const w = wrap(card);
  const seg = h('div', { class: 'seg' });
  const bars = h('div', { class: 'qbars' }); const doc = h('div', { class: 'doc' }); const note = h('div');
  const labels = ['Same shape every run', 'Sounds like Sara', 'Sticks to the material'];
  const seen = new Set();
  ['No examples', 'One example', 'Two examples'].forEach((t, i) => { const b = h('button', {}, t); b.onclick = () => show(i); seg.append(b); });
  function show(i) {
    seen.add(i);
    $$('button', seg).forEach((b, k) => b.classList.toggle('on', k === i));
    bars.replaceChildren(...EX[i].bars.map((v, k) => h('div', { class: 'qbar' }, h('span', {}, labels[k]), h('div', { class: 'meter' }, h('i', { style: { width: v + '%' } })), h('b', {}, v + '%'))));
    doc.innerHTML = EX[i].text;
    setFb(note, i === 2 ? 'good' : 'neutral', null, EX[i].note + (i === 2 && seen.size === 3 ? ' <b>Attaching two good examples is usually the biggest single improvement of the build</b>, bigger than forty minutes of rewording instructions. (Scores are illustrative.)' : ''));
    if (seen.size === 3) complete(card.dataset.id);
  }
  w.append(seg, bars, doc, note); show(0);
}

const GUARDS = [
  { id: 'g1', t: 'Never calculate; state what should be calculated' },
  { id: 'g2', t: 'If a section cannot be produced, write "not available in source"' },
  { id: 'g3', t: 'Fixed word count per section; Open points always last' },
  { id: 'g4', t: 'No recommendations, suitability views or commitments' },
  { id: 'g5', t: 'State every material risk plainly in a Risk line' },
  { id: 'g6', t: 'Flag contradictions between documents at the top' },
  { id: 'g7', t: 'Individual private banking clients only; otherwise say so and stop' },
  { id: 'd1', t: 'Be accurate and professional', decoy: true },
  { id: 'd2', t: 'Use a confident, reassuring tone', decoy: true },
  { id: 'd3', t: 'Think carefully before answering', decoy: true },
];
const CASES = [
  { n: 'Case 1 · Straightforward', sub: 'Client A, complete file', f: [['g1', 'Computed a 7.8% year-to-date return']] },
  { n: 'Case 2 · Different shape', sub: 'Retired client, three accounts, no risk profile on file', f: [['g2', 'Invented a "Conservative" risk profile'], ['g3', 'Stretched to two pages across three accounts']] },
  { n: 'Case 3 · Hostile', sub: 'Family office: complaint, two documents disagree, plus a corporate treasury account', f: [['g5', 'Called an 18% loss "a modest dip"'], ['g4', 'Added "consider moving into sukuk"'], ['g6', 'Silently picked one of two conflicting totals'], ['g7', 'Ran on the corporate account it was not built for']] },
];
export function stress(card) {
  const w = wrap(card);
  const on = new Set();
  const gwrap = h('div', { class: 'guards' });
  GUARDS.forEach(g => { const t = h('button', { class: 'toggle', 'aria-pressed': 'false' }, h('span', { class: 'sw' }), h('span', {}, h('b', { style: { fontSize: '13.5px', fontWeight: 500 } }, g.t))); t.onclick = () => { on.has(g.id) ? on.delete(g.id) : on.add(g.id); t.classList.toggle('on'); t.setAttribute('aria-pressed', on.has(g.id)); }; gwrap.append(t); });
  const run = h('button', { class: 'btn btn-primary mt' }, '▶ Run all three cases');
  const cases = h('div', { class: 'cases' });
  const msg = h('div'); let runs = 0;
  function draw(evald) {
    cases.replaceChildren(...CASES.map(c => {
      const pass = evald && c.f.every(([g]) => on.has(g));
      return h('div', { class: 'case ' + (evald ? (pass ? 'pass' : 'fail') : '') },
        h('span', { class: 'badge ' + (evald ? (pass ? 'p' : 'f') : 'n') }, evald ? (pass ? 'PASS' : 'FAIL') : 'NOT RUN'),
        h('h5', {}, c.n), h('div', { class: 'sub' }, c.sub),
        evald ? h('ul', {}, ...c.f.map(([g, t]) => h('li', { class: on.has(g) ? 'fixed' : 'broken' }, t))) : h('p', { class: 'muted', style: { margin: 0 } }, 'Run to see what breaks.'));
    }));
  }
  run.onclick = () => {
    runs++; draw(true);
    const allPass = CASES.every(c => c.f.every(([g]) => on.has(g)));
    const decoys = GUARDS.filter(g => g.decoy && on.has(g.id)).length;
    if (allPass) {
      setFb(msg, decoys ? 'neutral' : 'good', `All three pass after ${runs} run${runs > 1 ? 's' : ''}${decoys ? `, with ${decoys} guardrail${decoys > 1 ? 's' : ''} that did nothing` : ''}.`,
        `${decoys ? 'Adjectives like "accurate" and "careful" fixed nothing; a "confident tone" actively encourages softening. ' : ''}Every guardrail that worked was a <b>specific rule written after a specific failure</b>. Notice which case broke the most: the hostile one. The pairs who find their own failures are the ones still using their tool next quarter.`);
      complete(card.dataset.id, { runs, decoys });
    } else {
      const broken = CASES.reduce((a, c) => a + c.f.filter(([g]) => !on.has(g)).length, 0);
      setFb(msg, 'bad', `${broken} failure${broken > 1 ? 's' : ''} still getting through.`, 'Read each red line and switch on the rule that would have stopped it. Then run again.');
    }
  };
  draw(false);
  w.append(h('p', { class: 'stack-label' }, 'Guardrails in the instructions'), gwrap, run, cases, msg);
}

/* ---------------- ACT 9 ---------------- */
export function caseCalc(card) {
  const w = wrap(card);
  const mk = (label, min, max, val, unit) => { const i = h('input', { type: 'range', min, max, value: val }); const o = h('output', {}, val + unit); i.oninput = () => { o.textContent = i.value + unit; render(); }; w.append(h('div', { class: 'slider-row' }, h('label', {}, label), i, o)); return i; };
  const m = mk('Minutes saved per run', 5, 60, 25, ''), r = mk('Runs per week per RM', 1, 10, 4, ''), n = mk('RMs who could use it', 1, 40, 10, ''), wk = mk('Working weeks a year', 30, 48, 44, '');
  const ctrls = ['Synthetic or redacted data during the pilot', 'Named reviewer for every client-facing output', 'One owner, versioned instructions, change log', 'Guardrails written after real test failures'];
  const cset = new Set([0, 1, 2]);
  const chips = h('div', { class: 'row mt' }, ...ctrls.map((c, i) => { const b = h('button', { class: 'chip' + (cset.has(i) ? ' on' : '') }, c); b.onclick = () => { cset.has(i) ? cset.delete(i) : cset.add(i); b.classList.toggle('on'); render(); }; return b; }));
  const stats = h('div', { class: 'stats' }); const text = h('div', { class: 'casetext mt' });
  const copy = h('button', { class: 'btn btn-gold mt' }, 'Copy the one-page case');
  w.append(h('p', { class: 'stack-label' }, 'Controls in place'), chips, stats, text, copy);
  function render() {
    const hrsW = (+m.value * +r.value * +n.value) / 60, hrsY = hrsW * +wk.value, days = hrsY / 8;
    stats.replaceChildren(h('div', { class: 'stat' }, h('b', {}, hrsW.toFixed(1) + ' h'), h('span', {}, 'team hours a week')), h('div', { class: 'stat' }, h('b', {}, Math.round(hrsY).toLocaleString() + ' h'), h('span', {}, 'a year')), h('div', { class: 'stat' }, h('b', {}, Math.round(days)), h('span', {}, 'RM days returned to clients')));
    text.textContent = `Subject: Pre-meeting brief tool: results and one request\n\nWhat it does: turns the last quarterly statement and previous meeting note into our five-section pre-meeting brief, every figure page-referenced, in under 5 minutes.\n\nTime: about ${m.value} minutes saved per run, ${r.value} runs a week, across ${n.value} RMs: ${hrsW.toFixed(1)} hours a week, roughly ${Math.round(days)} RM days a year returned to client time. Measured over the first month by running the task by hand alongside.\n\nControls: ${[...cset].map(i => ctrls[i]).join('; ') || 'none listed yet'}.\n\nThe ask: approval to run this tool on real client data on the bank's approved platform, with the controls above written into the process, starting with a one-month pilot for ${Math.min(+n.value, 5)} RMs.`;
  }
  copy.onclick = async () => { try { await navigator.clipboard.writeText(text.textContent); toast('Copied to clipboard'); } catch { toast('Select the text to copy it'); } complete(card.dataset.id); };
  render();
}

const KK = [
  { t: 'Meeting-notes tool: used 9 times in three weeks without reminders, light edits each time, about 12 minutes saved per run.', a: 'Keep', why: 'Used without being reminded, light editing, and you would be annoyed if it disappeared. That is a keeper.' },
  { t: 'Market-commentary tool: used once to show the team, and every output was rewritten from scratch.', a: 'Kill', why: 'If you edit more than you would have written, kill it without sentiment. The task was the problem, not the prompt.' },
  { t: 'Pre-meeting brief tool: useful, but on complex families it keeps adding a "recommendation" line.', a: 'Fix', why: 'Scope creep is a guardrail problem. Add the refusal rule, rerun your awkward case, log the change as a new version.' },
];
export function keepKill(card) {
  const w = wrap(card); let done = 0, right = 0;
  KK.forEach(k => {
    const out = h('div'); const seg = h('div', { class: 'seg' });
    ['Keep', 'Fix', 'Kill'].forEach(o => { const b = h('button', {}, o); b.onclick = () => { if (seg.dataset.d) return; seg.dataset.d = 1; b.classList.add('on'); done++; if (o === k.a) right++; setFb(out, o === k.a ? 'good' : 'neutral', o === k.a ? o + '.' : `Better: ${k.a}.`, k.why); if (done === KK.length) complete(card.dataset.id, { right }); }; seg.append(b); });
    w.append(h('div', { class: 'conf-item' }, h('p', {}, k.t), seg, out));
  });
}
