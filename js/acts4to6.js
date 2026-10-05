import { h, $, $$, complete, setFb, fb, wrap, sorter, shuffle } from './core.js?v=ar-qa-5';
import { statementHTML } from './data.js?v=ar-qa-5';
import { getLanguage } from './i18n.js?v=ar-qa-5';

/* ---------------- ACT 4 ---------------- */
const MOVES = ['Extract', 'Summarise', 'Compare', 'Find the gap'];
const REQS = [
  { q: '“List every fee in the mandate, with the page it appears on.”', a: 'Extract', risk: 15, riskL: 'Low',
    out: '<ul style="margin:0;padding-left:18px"><li>Management fee 0.75% p.a. (p.3)</li><li>Custody fee 0.10% p.a. (p.3)</li><li>Transaction charge SAR 50 per trade (p.3)</li><li>Early redemption 1% within 12 months (p.3)</li></ul>',
    why: 'Narrow, checkable, safe. Each line is either in the document or not, and the page number lets you verify it in sixty seconds.' },
  { q: '“Give my team head five lines on this family before Thursday.”', a: 'Summarise', risk: 50, riskL: 'Medium',
    out: '1. SAR 45.2m; 31% murabaha, 38% Saudi equities (p.1–2). 2. Equities concentrated: 62% in one stock (p.2). 3. Son flagged ~SAR 10m need in Q1 2027 (p.5). 4. Real estate fund locked to Dec 2026; sukuk to 2028 (p.1–2). 5. Risk profile from Feb 2024: refresh due (p.4).',
    why: 'Compression means choosing what to drop. A named reader and a length limit force that choice to be yours, not the tool\'s.' },
  { q: '“What changed between last year\'s review and this statement?”', a: 'Compare', risk: 45, riskL: 'Medium',
    out: '<table><tr><th>Item</th><th>2025 review</th><th>Jun 2026</th><th>Change</th></tr><tr><td>Murabaha</td><td>SAR 9.0m</td><td>SAR 14.0m</td><td>+5.0m</td></tr><tr><td>Top equity holding</td><td>48% of equities</td><td>62%</td><td>more concentrated</td></tr><tr><td>Real estate fund</td><td>none</td><td>SAR 7.8m</td><td>new</td></tr></table>',
    why: 'Always ask for a table: item, A, B, difference. Keep it descriptive. "Concentration rose" is a fact; "the client is now too risky" is a conclusion it should not draw.' },
  { q: '“What would the investment committee ask that this file does not answer?”', a: 'Find the gap', risk: 10, riskL: 'Low for you, highest value',
    out: '<ol style="margin:0;padding-left:18px"><li>Is a February 2024 risk profile still valid for a 62% single-stock position?</li><li>How will ~SAR 10m be funded in Q1 2027, given the fund lock-up and a 2028 sukuk maturity?</li><li>Has the concentration been discussed with the family and documented?</li><li>Who in the family can now give instructions: principal, son, or both?</li></ol>',
    why: 'It is better at finding holes than at filling them. Questions carry no invented facts, and they are often exactly what your manager would have asked.' },
];
export function fourMoves(card) {
  const w = wrap(card);
  let right = 0, answered = 0;
  w.append(h('details', { class: 'why', style: { marginTop: 0, borderTop: 0, paddingTop: 0 } }, h('summary', {}, 'Open Client A\'s statement'), h('div', { class: 'mt', html: statementHTML({ fees: true, notes: true }) })));
  REQS.forEach((r, i) => {
    const seg = h('div', { class: 'seg' });
    const out = h('div');
    MOVES.forEach(m => {
      const b = h('button', {}, m);
      b.onclick = () => {
        if (seg.dataset.done) return; seg.dataset.done = 1; answered++;
        const ok = m === r.a; if (ok) right++;
        b.classList.add('on');
        out.replaceChildren(
          fb(ok ? 'good' : 'neutral', ok ? `Yes: ${r.a}.` : `This one is ${r.a}.`, r.why),
          h('div', { class: 'row mt' }, h('b', { style: { fontSize: '13px' } }, `Risk: ${r.riskL}`), h('div', { style: { flex: 1, maxWidth: '240px' } }, h('div', { class: 'meter' }, h('i', { style: { width: r.risk + '%', background: r.risk > 30 ? 'var(--warn)' : 'var(--good)' } })))),
          h('div', { class: 'doc mt', html: r.out }));
        if (answered === REQS.length) complete(card.dataset.id, { right });
      };
      seg.append(b);
    });
    w.append(h('div', { class: 'conf-item' }, h('p', {}, r.q), seg, out));
  });
}

export function lostMiddle(card) {
  const w = wrap(card);
  const W = 640, H = 240, P = 36;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'lm-chart'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Illustrative chart: how often a fact survives a long summary, by page position');
  const x = p => P + (p - 1) / 39 * (W - 2 * P);
  const y = v => H - P - v * (H - 2 * P);
  const curve = (sec) => p => sec ? 0.9 - 0.04 * Math.abs(Math.sin(p)) : 0.5 + 0.42 * Math.pow(2 * (p - 1) / 39 - 1, 2);
  const el = (t, a) => { const e = document.createElementNS(svgNS, t); for (const k in a) e.setAttribute(k, a[k]); svg.append(e); return e; };
  for (const v of [0, .25, .5, .75, 1]) { el('line', { x1: P, x2: W - P, y1: y(v), y2: y(v), stroke: '#EFE8D8' }); const t = el('text', { x: 4, y: y(v) + 4, 'font-size': 11, fill: '#6B7385' }); t.textContent = Math.round(v * 100) + '%'; }
  for (const p of [1, 10, 20, 30, 40]) { const t = el('text', { x: x(p), y: H - 12, 'font-size': 11, fill: '#6B7385', 'text-anchor': 'middle' }); t.textContent = 'p.' + p; }
  const path = el('path', { fill: 'none', stroke: '#2B4590', 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  const dot = el('circle', { r: 8, fill: '#B8862B', stroke: '#fff', 'stroke-width': 3 });
  const range = h('input', { type: 'range', min: 1, max: 40, value: 3, 'aria-label': 'Page of the key fact' });
  const tg = h('button', { class: 'toggle', 'aria-pressed': 'false' }, h('span', { class: 'sw' }), h('span', {}, h('b', {}, 'Work section by section'), h('small', {}, 'Ask about pages 1–10, then 11–20… and name the source in each question.')));
  const read = h('div');
  let visitedMid = false, toggled = false;
  function draw() {
    const sec = tg.classList.contains('on'); const f = curve(sec);
    let d = ''; for (let p = 1; p <= 40; p += .5) d += (p === 1 ? 'M' : 'L') + x(p).toFixed(1) + ',' + y(f(p)).toFixed(1);
    path.setAttribute('d', d);
    const p = +range.value, v = f(p);
    dot.setAttribute('cx', x(p)); dot.setAttribute('cy', y(v));
    if (p > 12 && p < 29) visitedMid = true;
    read.replaceChildren(h('div', { class: 'stats' }, h('div', { class: 'stat' }, h('b', {}, 'p.' + p), h('span', {}, 'where the fact sits')), h('div', { class: 'stat' }, h('b', { style: { color: v < .65 ? 'var(--bad)' : 'var(--good)' } }, Math.round(v * 100) + '%'), h('span', {}, 'of long summaries keep it (illustrative)'))));
    if (visitedMid && toggled) complete(card.dataset.id);
  }
  range.oninput = draw;
  tg.onclick = () => { tg.classList.toggle('on'); tg.setAttribute('aria-pressed', tg.classList.contains('on')); toggled = true; draw(); };
  w.append(svg, h('div', { class: 'slider-row' }, h('label', {}, 'Move the key fact'), range, h('span')), tg, read,
    h('details', { class: 'why' }, h('summary', {}, 'Where does this pattern come from?'),
      h('p', { class: 'mt muted' }, 'Researchers have documented a "lost in the middle" effect: language models use information at the start and end of a long input more reliably than information buried in the middle (Liu et al., 2023). The exact numbers vary by model and keep improving; the curve above is a teaching illustration of the shape, not a measurement. The practical rules hold anyway: work section by section, name the source per question, ask it to list what it used, and spot-check a fact from the middle.')));
  draw();
}

const STEPS = [
  'Upload the file exactly as it arrived (synthetic or redacted)',
  'Extract figures, dates and fees, each with a page reference',
  'Summarise into the five-section brief for a named reader',
  'Run the sceptical-committee prompt to find the gaps',
  'Verify three figures against the source yourself',
];
export function orderSteps(card) {
  const w = wrap(card);
  let order = shuffle(STEPS.map((s, i) => i), 5);
  const ol = h('ol', { class: 'olist' });
  const msg = h('div');
  const chk = h('button', { class: 'btn btn-primary' }, 'Check my order');
  function render(mark) {
    ol.replaceChildren(...order.map((si, pos) => {
      const up = h('button', { 'aria-label': 'Move up', onclick: () => { if (pos) { [order[pos - 1], order[pos]] = [order[pos], order[pos - 1]]; render(); } } }, '↑');
      const dn = h('button', { 'aria-label': 'Move down', onclick: () => { if (pos < order.length - 1) { [order[pos + 1], order[pos]] = [order[pos], order[pos + 1]]; render(); } } }, '↓');
      return h('li', { class: mark ? (si === pos ? 'ok' : 'no') : '' }, h('span', {}, STEPS[si]), h('div', { class: 'arrows' }, up, dn));
    }));
  }
  chk.onclick = () => {
    render(true);
    const n = order.filter((si, p) => si === p).length;
    if (n === 5) { setFb(msg, 'good', 'Right order.', 'Notice where verification sits: <b>last, and done by you</b>, against the source, before anything leaves your desk. Step 5 is what separates a professional from an enthusiast. Extract comes before summarise because it gives you the page-referenced facts you will check the summary against.'); complete(card.dataset.id); }
    else setFb(msg, 'neutral', `${n} of 5 in place.`, 'Green rows are right. Move the red ones and check again. Hint: you cannot verify what has not been extracted.');
  };
  render();
  w.append(ol, chk, msg);
}

/* ---------------- ACT 5 ---------------- */
const EMAIL = [
  ['Dear Valued Client, ', 0], ['I hope this email finds you well!', 1], [' ', 0], ["I'm thrilled to", 1], [' follow up on our meeting and ', 0], ['delve into', 1], [' the next steps for your portfolio. ', 0],
  ["In today's fast-paced financial landscape,", 1], [' it is more important than ever to focus on ', 0], ['growth, stability, and peace of mind.', 1], [' Our team will ensure a ', 0], ['seamless', 1],
  [' transition as your deposits mature on 15 November. ', 0], ['Please don\'t hesitate to reach out', 1], [' if you have any questions. ', 0], ['In summary,', 1], [' we look forward to continuing our partnership.', 0],
];
export function tells(card) {
  const w = wrap(card);
  const doc = h('div', { class: 'doc', style: { fontSize: '15.5px', lineHeight: 1.9 } });
  const toks = EMAIL.map(([t, tell]) => { const s = h('span', { class: 'tok' }, t); s.onclick = () => { if (done) return; s.classList.toggle('sel'); }; doc.append(s); return s; });
  const btn = h('button', { class: 'btn btn-primary mt' }, 'Check');
  const msg = h('div'); let done = false;
  btn.onclick = () => {
    done = true; btn.disabled = true; let hit = 0, fp = 0;
    EMAIL.forEach(([t, tell], i) => { const sel = toks[i].classList.contains('sel'); toks[i].classList.remove('sel'); if (tell && sel) { hit++; toks[i].classList.add('hit'); } else if (tell) toks[i].classList.add('miss'); else if (sel && t.trim().length > 2) { fp++; toks[i].classList.add('wrong'); } });
    setFb(msg, hit >= 6 ? 'good' : 'neutral', `${hit} of 8 tells spotted${fp ? `, ${fp} false alarm${fp > 1 ? 's' : ''}` : ''}.`,
      'Over-eager openings, a three-item list, buzzwords, a closing that restates the email. Your clients have learned this signature. <b>Untouched output reads as effort you did not spend</b>, which is the worst signal in relationship banking. The fix is not more adjectives in the prompt. It is your own writing as examples, and a rule banning the openings you keep seeing.');
    complete(card.dataset.id, { hit, fp });
  };
  w.append(doc, btn, msg);
}

const VOICES = [
  { k: 'A', body: 'Dear Valued Client, I hope this email finds you well! I wanted to reach out following the recent market turbulence. Rest assured, we remain confident that your portfolio <b>will recover strongly</b> in the coming months. In today\'s dynamic landscape, diversification, discipline and patience are key. Please don\'t hesitate to reach out to discuss further at your convenience…', wc: 158,
    fb: ['bad', 'This one creates a compliance problem.', '"Will recover strongly" is a forecast, and to a client it reads as a promise. On top of that it is the default AI voice: generic, long, and it never names the actual problem.'] },
  { k: 'B', body: 'Khalid, thank you for raising this. You are right that the equity holdings fell last quarter, mostly because of the single petrochemical position, which is 62% of the equity portfolio. I would like to walk you through what drove it and the options for reducing that concentration, with no pressure to act. Could we speak on Tuesday or Wednesday afternoon? Best regards, Sara', wc: 66,
    fb: ['good', 'The one most RMs choose.', 'It names the real cause plainly, makes no forecast, offers one clear action, and sounds like a person who knows this family. It is also the shortest: the version people pick is usually the shortest one on the screen.'] },
  { k: 'C', body: 'Dear Mr. Khalid, Further to your enquiry regarding the negative performance attribution observed in the equity sleeve during Q2, please be advised that the drawdown was predominantly attributable to idiosyncratic single-name exposure. We would be pleased to convene at a mutually convenient juncture to review potential reallocation strategies.', wc: 54,
    fb: ['neutral', 'Accurate, and in the wrong register.', 'This is how you would write to a risk committee: terse and technical. To a client it sounds cold and hides behind jargon. Same facts, wrong reader.'] },
];
export function threeVoices(card) {
  const w = wrap(card);
  const grid = h('div', { class: 'emails' });
  const msg = h('div');
  VOICES.forEach(v => {
    const b = h('button', { class: 'email' }, h('h5', {}, 'Version ' + v.k), h('div', { html: v.body }), h('div', { class: 'wc' }, v.wc + ' words'));
    b.onclick = () => { $$('.email', grid).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); setFb(msg, ...v.fb); complete(card.dataset.id, { pick: v.k }); };
    grid.append(b);
  });
  w.append(grid, msg);
}

const TERMS = [
  ['Loan', 'قرض', 'Financing', 'تمويل'],
  ['Interest', 'فائدة', 'Profit rate', 'هامش الربح'],
  ['Bonds', 'سندات', 'Sukuk', 'صكوك'],
  ['Insurance', 'تأمين', 'Takaful', 'تكافل'],
  ['Mortgage', 'رهن عقاري', 'Home financing', 'تمويل عقاري'],
  ['"Guaranteed return"', 'عائد مضمون', 'Expected profit, with disclosures', 'ربح متوقع'],
];
export function arabic(card) {
  const w = wrap(card);
  const flips = h('div', { class: 'flips' });
  let flipped = new Set(), picked = false;
  TERMS.forEach((t, i) => {
    const f = h('button', { class: 'flip', 'aria-label': `${t[0]}: flip to see the Islamic banking term` },
      h('div', { class: 'flip-in' },
        h('div', { class: 'flip-f' }, h('small', {}, 'Generic AI says'), h('div', { class: 'x', style: { fontWeight: 600, margin: '4px 0' } }, t[0]), h('div', { class: 'ar x' }, t[1])),
        h('div', { class: 'flip-b' }, h('small', {}, 'Your bank says'), h('div', { style: { fontWeight: 600, margin: '4px 0' } }, t[2]), h('div', { class: 'ar' }, t[3]))));
    f.onclick = () => { f.classList.toggle('on'); flipped.add(i); chk(); };
    flips.append(f);
  });
  const q = h('div', { class: 'mt' });
  const msg = h('div');
  const A = 'شكراً لك على وقتك أمس. كما تمت مناقشته، سوف أقوم بإرسال المقترح المحدث إليك بحلول يوم الأحد.';
  const B = 'أشكركم على وقتكم الثمين بالأمس، وكما اتفقنا سأرسل لكم العرض المحدّث يوم الأحد بإذن الله.';
  const opts = shuffle([{ t: A, tr: true }, { t: B, tr: false }], 2);
  q.append(h('p', { style: { fontWeight: 600 } }, 'Same message, two Arabic versions: "Thank you for your time yesterday. As discussed, I will send the updated proposal by Sunday." Which one sounds translated from English?'),
    h('div', { class: 'emails', style: { gridTemplateColumns: '1fr 1fr' } }, ...opts.map(o => {
      const b = h('button', { class: 'email' }, h('div', { class: 'ar', style: { fontSize: '19px' } }, o.t));
      b.onclick = () => { picked = true; $$('.email', q).forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        setFb(msg, o.tr ? 'good' : 'bad', o.tr ? 'Yes, that one is translated.' : 'That is the natural one.',
          '"كما تمت مناقشته" and "سوف أقوم بإرسال" are English structures in Arabic words ("as was discussed", "I will do sending"). The natural version uses the respectful plural, "كما اتفقنا", and a warm closing. Ask the tool to write <b>"as it would be written originally in Arabic"</b>, give it three real examples of your Arabic and the bank\'s glossary, and you still read it before it goes.'); chk(); };
      return b;
    })));
  function chk() { if (flipped.size === TERMS.length && picked) complete(card.dataset.id); }
  w.append(flips, q, msg);
}

/* ---------------- ACT 6 ---------------- */
const FILTERS = [
  { t: 'Family business with a private banking relationship', n: 3000 },
  { t: '+ based in Jeddah', n: 640 },
  { t: '+ shipping and logistics', n: 38 },
  { t: '+ revenue SAR 200–300m', n: 6 },
  { t: '+ second generation, sold a stake in 2025', n: 1 },
];
export function funnel(card) {
  const w = wrap(card);
  const dots = h('div', { class: 'dots', 'aria-hidden': 'true' });
  const N = 1500; const ds = []; for (let i = 0; i < N; i++) { const d = h('i'); ds.push(d); dots.append(d); }
  const order = shuffle([...Array(N).keys()], 13);
  const count = h('div', { class: 'bigcount' }, '3,000', h('small', {}, 'possible families (fictional population)'));
  const chips = h('div', { class: 'row' });
  const msg = h('div');
  let level = 0;
  FILTERS.slice(1).forEach((f, i) => {
    const c = h('button', { class: 'chip', disabled: i > 0 }, f.t);
    c.onclick = () => { if (level !== i) return; level = i + 1; c.classList.add('on'); c.disabled = true; const nxt = chips.children[i + 1]; if (nxt) nxt.disabled = false; show(); };
    chips.append(c);
  });
  function show() {
    const n = FILTERS[level].n; const keep = Math.max(1, Math.round(n / 2));
    ds.forEach(d => d.className = 'off'); order.slice(0, keep).forEach(k => ds[k].className = n === 1 ? 'last' : '');
    count.firstChild.textContent = n.toLocaleString();
    count.lastChild.textContent = n === 1 ? 'family. It is them.' : 'possible families';
    if (n === 1) {
      setFb(msg, 'bad', 'No name. One family.', 'Every detail was harmless on its own. Together they identify one client. Wealth in the Kingdom is concentrated and publicly discussed, so <b>a unique combination is as identifying as a name</b>. The analysis almost never needs the combination: <em>"a large family business, Western region, logistics, revenue in the SAR 100–500m range"</em> keeps the shape of the problem and could be dozens of families.');
      complete(card.dataset.id);
    } else msg.replaceChildren();
  }
  w.append(count, chips, dots, msg); show();
}

const NOTE = [
  ['Call with ', 0], ['Khalid Al-Rashidi', 1, 'Name'], [' (', 0], ['eldest son of the principal', 0], [') on ', 0], ['Tuesday 14 May', 1, 'A date that pins down the event'], [', ', 0], ['mobile +966 55 418 2093', 1, 'Contact detail'], ['. He confirmed the family\'s ', 0],
  ['logistics business in Jeddah', 1, 'Sector + city: an identifying combination'], [' will receive ', 0], ['SAR 47,312,900', 1, 'Exact amount: band it instead'], [' from the stake sale, to be paid into ', 0], ['IBAN 0000 0000 0000 0000', 1, 'Account identifier'],
  ['. His ', 0], ['national ID 1078456321', 1, 'National ID'], [' expires in December, so a ', 0], ['KYC refresh', 0], [' is needed. Wants to discuss ', 0], ['sukuk', 0], [' and a ', 0], ['moderate-risk allocation', 0], [' at the ', 0], ['next quarterly review', 0],
  ['. Sent from: ', 0], ['training email address', 1, 'Email address in the signature'],
];
const NOTE_AR = [
  ['مكالمة مع ', 0], ['خالد الراشدي', 1, 'الاسم'], [' (', 0], ['الابن الأكبر لرب الأسرة', 0], [') بتاريخ ', 0], ['الثلاثاء 14 مايو', 1, 'تاريخ يحدد الواقعة'], ['، ', 0], ['+966 55 418 2093', 1, 'معلومة اتصال'], ['. وأكد أن الأسرة ستتلقى ', 0], ['47,312,900 ريال سعودي', 1, 'المبلغ الدقيق: استخدم نطاقاً بدلاً منه'], [' من بيع حصة في نشاطها بقطاع ', 0], ['الخدمات اللوجستية بمدينة جدة', 1, 'القطاع والمدينة: تركيبة تكشف الهوية'], ['، وستُحوّل إلى ', 0], ['رقم الآيبان الافتراضي (٠٠٠٠ ٠٠٠٠ ٠٠٠٠ ٠٠٠٠)', 1, 'معرّف الحساب'], ['. وتنتهي صلاحية ', 0], ['رقم الهوية الوطنية (1078456321)', 1, 'رقم الهوية الوطنية'], [' في ديسمبر، لذا يلزم ', 0], ['تحديث إجراءات اعرف عميلك', 0], ['. ويرغب في مناقشة ', 0], ['الصكوك', 0], [' وملف مخاطر ', 0], ['توزيع استثماري متوسط المخاطر', 0], [' في ', 0], ['المراجعة الفصلية المقبلة', 0], ['. أُرسلت من: ', 0], ['عنوان بريد إلكتروني افتراضي (محذوف)', 1, 'عنوان البريد الإلكتروني في التوقيع'],
];
export function redact(card) {
  const w = wrap(card);
  const note = getLanguage() === 'ar' ? NOTE_AR : NOTE;
  const doc = h('div', { class: 'doc', style: { fontSize: '15.5px', lineHeight: 2 } }, h('div', { class: 'dochead' }, h('span', {}, 'Sara · call note · raw'), h('span', {}, 'Synthetic')));
  let done = false;
  const toks = note.map(([t, id]) => { if (t.length < 4 && !id) { doc.append(t); return null; } const s = h('span', { class: 'tok' }, t); s.onclick = () => { if (!done) s.classList.toggle('redacted'); }; doc.append(s); return s; });
  const btn = h('button', { class: 'btn btn-primary mt' }, 'Check my redaction');
  const res = h('div');
  btn.onclick = () => {
    done = true; btn.disabled = true; let hit = 0, miss = [], over = 0;
    note.forEach(([t, id, why], i) => { const s = toks[i]; if (!s) return; const r = s.classList.contains('redacted'); if (id && r) { hit++; s.classList.add('hit'); } else if (id) { miss.push(why); s.classList.add('miss'); } else if (r) { over++; s.classList.remove('redacted'); s.classList.add('wrong'); } });
    const total = note.filter(n => n[1]).length;
    res.replaceChildren(
      h('div', { class: 'stats' }, h('div', { class: 'stat' }, h('b', {}, `${hit}/${total}`), h('span', {}, 'identifiers caught')), h('div', { class: 'stat' }, h('b', {}, over), h('span', {}, 'over-redacted (useful context removed)'))),
      miss.length ? fb('bad', 'Still in the note:', miss.join(' · ')) : fb('good', 'Clean.', 'Nothing left that maps back to a person.'),
      h('p', { class: 'stack-label' }, 'What a safe version looks like, still useful for the analysis'),
      h('div', { class: 'doc' }, 'Call with the son of Client A (role, not name). He confirmed proceeds in the SAR 40–50m range from a business stake sale, to be paid into the family\'s account with us. His ID expires before year end, so a KYC refresh is needed. Wants to discuss sukuk and a moderate-risk allocation at the next quarterly review.'),
      fb('info', 'The four steps, 90 seconds', '1. Names → roles. 2. Round or band the figures. 3. Strip identifiers and pinning dates entirely. 4. Re-read as a stranger: could someone outside the bank work out who this is? And never ask a public AI tool to do the redaction for you: that already sends the data.'));
    complete(card.dataset.id, { hit, total, over });
  };
  w.append(doc, btn, res);
}

const SWIPES = [
  { t: 'Asking for a plain-language explanation of how murabaha works', a: 'yes', why: 'No client data at all. Ideal use.' },
  { t: 'Pasting Client A\'s statement with the name deleted', a: 'no', why: 'Values, dates and holdings still identify the family. Removing the name is not redaction.' },
  { t: 'A fictional client file you generated for practice', a: 'yes', why: 'Synthetic data: no approval needed, no risk taken. Build one and reuse it.' },
  { t: 'A cropped screenshot of your WhatsApp chat with the client', a: 'no', why: 'Names, numbers and profile photos sit at the edges. Screenshots are one of the quiet leaks.' },
  { t: 'A product sheet published on the bank\'s public website', a: 'yes', why: 'Public information. Still check the version is current.' },
  { t: 'Your meeting notes with names replaced by roles and figures banded', a: 'yes', why: 'Properly redacted. Re-read it as a stranger first: combinations can still identify.' },
  { t: 'An internal circular marked "Confidential"', a: 'no', why: 'Bank-confidential material stays on approved platforms only. When policy is silent, ask; do not assume.' },
  { t: 'A client\'s email thread pasted in so it can "draft a reply"', a: 'no', why: 'Six signatures, phone numbers and history at the bottom. Trim the tail, or write the reply from your own summary.' },
  { t: 'Your own past client emails, redacted, to build a style guide', a: 'yes', why: 'Exactly what the style guide needs, once names, amounts and dates are out.' },
  { t: 'The real file, on your personal AI account at home, because it is faster', a: 'no', why: 'The one that ends careers. Approved tools only, for bank work, always.' },
];
export function swipe(card) {
  const w = wrap(card);
  const stack = h('div', { class: 'swipe-stack' });
  const btns = h('div', { class: 'swipe-btns' });
  const msg = h('div', { style: { width: '100%' } });
  let i = 0, score = 0;
  const mkBtn = (cls, label, v) => { const b = h('button', { class: 'btn ' + cls }, label); b.onclick = () => answer(v); return b; };
  btns.append(mkBtn('b-no', '← No', 'no'), mkBtn('b-prob', 'Probably', 'prob'), mkBtn('b-yes', 'Yes →', 'yes'));
  function render() {
    stack.replaceChildren();
    if (i >= SWIPES.length) { btns.remove(); setFb(msg, score >= 8 ? 'good' : 'neutral', `${score} of ${SWIPES.length}.`, '"Probably" is never a yes: treat it as a no and ask someone. And the rule of thumb: <b>if you would not email it to an external address, do not paste it.</b> Saudi Arabia\'s PDPL also restricts transferring personal data outside the Kingdom, and most public AI tools process data abroad.'); complete(card.dataset.id, { score }); return; }
    if (SWIPES[i + 1]) stack.append(h('div', { class: 'scard behind' }, h('p', {}, SWIPES[i + 1].t)));
    const c = h('div', { class: 'scard' }, h('div', { class: 'n' }, `${i + 1} / ${SWIPES.length}`), h('p', {}, SWIPES[i].t));
    let sx = null, dx = 0;
    c.addEventListener('pointerdown', e => { sx = e.clientX; c.setPointerCapture(e.pointerId); c.style.transition = 'none'; });
    c.addEventListener('pointermove', e => { if (sx == null) return; dx = e.clientX - sx; c.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; });
    c.addEventListener('pointerup', () => { c.style.transition = ''; if (Math.abs(dx) > 90) answer(dx > 0 ? 'yes' : 'no'); else c.style.transform = ''; sx = null; dx = 0; });
    stack.append(c);
  }
  function answer(v) {
    const s = SWIPES[i]; const top = stack.lastChild;
    const ok = v === s.a || (v === 'prob' && s.a === 'no');
    if (ok) score++;
    if (top) { top.style.transform = `translateX(${v === 'yes' ? 500 : v === 'no' ? -500 : 0}px) translateY(${v === 'prob' ? -300 : 0}px)`; top.style.opacity = 0; }
    setFb(msg, ok ? 'good' : 'bad', `${ok ? 'Right' : 'Not quite'}: ${s.a === 'yes' ? 'Yes' : 'No'}${v === 'prob' && s.a === 'no' ? ' (and "probably" means no)' : ''}.`, s.why);
    i++; setTimeout(render, 300);
  }
  w.append(h('div', { class: 'swipe-wrap' }, stack, btns, msg));
  render();
}

const ADVICE = [
  { id: 'a1', text: 'The fund invests in Saudi government and corporate sukuk.', bin: 'info', why: 'Describes the product.' },
  { id: 'a2', text: 'Given your goals, you should move SAR 5m into this fund.', bin: 'advice', why: 'A personal recommendation. Regulated advice.' },
  { id: 'a3', text: 'This fund would suit you well.', bin: 'advice', why: 'Short and friendly, and still a suitability statement.' },
  { id: 'a4', text: 'The management fee is 0.5% a year, according to the fact sheet.', bin: 'info', why: 'A sourced fact.' },
  { id: 'a5', text: 'We can offer you a profit rate of 5.2% on a six-month murabaha.', bin: 'commit', why: 'Pricing on the bank\'s behalf. Only with approval, never from a draft.' },
  { id: 'a6', text: 'Returns should recover by year end.', bin: 'commit', why: 'A forecast reads as a promise to a client.' },
  { id: 'a7', text: 'Here are three questions to discuss before deciding.', bin: 'info', why: 'Supports a decision without making it.' },
  { id: 'a8', text: 'Based on your profile, increasing your sukuk allocation makes sense.', bin: 'advice', why: 'Ties a product to the client\'s profile: suitability.' },
];
export function adviceSort(card) {
  const w = wrap(card); const res = h('div');
  sorter({ host: w, items: shuffle(ADVICE, 4), explain: true,
    bins: [{ id: 'info', label: 'Information', color: '#1E7F5C' }, { id: 'advice', label: 'Advice', color: '#A86B12' }, { id: 'commit', label: 'Commitment or promise', color: '#B4432F' }],
    onDone: (ok, n) => { setFb(res, ok >= 7 ? 'good' : 'neutral', `${ok} of ${n} correct.`, 'AI drafts drift from describing to recommending, often in the last, friendliest sentence. Put it in the constraints: <em>"Describe; do not recommend, assess suitability, forecast, or commit the bank to pricing or terms."</em> Then read the last paragraph twice.'); complete(card.dataset.id, { ok }); } });
  w.append(res);
}
