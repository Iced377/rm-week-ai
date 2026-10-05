import { h, $, $$, complete, setFb, fb, wrap, sorter, state, setData, clamp, shuffle } from './core.js?v=ar-qa-5';
import { CLIENT_A, statementHTML } from './data.js?v=ar-qa-5';
import { translate, getLanguage } from './i18n.js?v=ar-qa-5';

/* ---------------- ACT 1 ---------------- */
export function timeSplit(card) {
  const w = wrap(card);
  const mk = (label, val) => {
    const input = h('input', { type: 'range', min: 0, max: 80, value: val, 'aria-label': label });
    const out = h('output', {}, val + '%');
    return { row: h('div', { class: 'slider-row' }, h('label', {}, label), input, out), input, out };
  };
  const r = mk('Reading & assembling', 20), wr = mk('Writing & rewriting', 20);
  const cl = h('div', { class: 'slider-row' }, h('label', {}, 'With clients'), h('div', { class: 'muted' }, 'whatever is left'), h('output', {}, '60%'));
  const bar = (a, b, c) => h('div', { class: 'stack' }, h('div', { class: 's-read', style: { flexBasis: a + '%' } }, a >= 8 ? `Read ${a}%` : ''), h('div', { class: 's-write', style: { flexBasis: b + '%' } }, b >= 8 ? `Write ${b}%` : ''), h('div', { class: 's-client', style: { flexBasis: c + '%' } }, c >= 8 ? `Clients ${c}%` : ''));
  const mine = h('div');
  const out = h('div');
  const btn = h('button', { class: 'btn btn-primary mt' }, 'Reveal the estimate');
  function upd(src) {
    let a = +r.input.value, b = +wr.input.value;
    if (a + b > 95) { if (src === 'r') b = 95 - a; else a = 95 - b; r.input.value = a; wr.input.value = b; }
    r.out.textContent = a + '%'; wr.out.textContent = b + '%'; cl.querySelector('output').textContent = (100 - a - b) + '%';
    mine.replaceChildren(h('p', { class: 'stack-label' }, 'Your guess'), bar(a, b, 100 - a - b));
  }
  r.input.addEventListener('input', () => upd('r')); wr.input.addEventListener('input', () => upd('w'));
  upd();
  btn.onclick = () => {
    const a = +r.input.value, b = +wr.input.value, c = 100 - a - b;
    const diff = Math.abs(c - 35);
    out.replaceChildren(
      h('p', { class: 'stack-label' }, 'The course estimate for a typical RM week'), bar(40, 25, 35),
      fb(diff <= 10 ? 'good' : 'neutral', diff <= 10 ? 'Close. You know your week.' : `You guessed ${c}% with clients. The course estimate is 35%.`,
        `Most RMs <b>over-estimate</b> their client time. Roughly two-thirds of the week is reading and writing: statements, prospectuses, KYC files, notes, emails, the same explanation four ways. That is exactly what these tools touch, and the tool touches <b>none</b> of the 35%.`),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, '≈ 10 h'), h('span', {}, 'a week Sara could buy back*')),
        h('div', { class: 'stat' }, h('b', {}, '30%'), h('span', {}, 'faster reading, if she verifies')),
        h('div', { class: 'stat' }, h('b', {}, '40%'), h('span', {}, 'faster first drafts'))),
      h('p', { class: 'muted' }, '*Illustrative: 45 h × (40% × 0.3 + 25% × 0.4). Your numbers will differ. The point is where the hours are, not the decimal.'));
    complete(card.dataset.id, { client: c });
  };
  w.append(r.row, wr.row, cl, mine, btn, out);
}

const FIT = [
  { id: 'f1', text: 'Turn a 40-page fund prospectus into the 8 points that matter for a conservative client', bin: 'great', why: 'Reading at scale is its home ground. Ask for page references so you can check.' },
  { id: 'f2', text: 'Draft the follow-up email after a portfolio review', bin: 'great', why: 'A first draft in your voice, which you then edit. Never the last version.' },
  { id: 'f3', text: 'Turn raw meeting notes into the CRM record format', bin: 'great', why: 'A fixed format, your own notes as the only source, and you check it straight away. Ideal.' },
  { id: 'f4', text: "Rewrite the house view in plain Arabic for a retired client", bin: 'great', why: 'Reshaping language is a core strength. You still read the Arabic before it goes out.' },
  { id: 'f5', text: 'Compare two sukuk fund fact sheets side by side', bin: 'check', why: 'Good at the table of differences. Dangerous if you let it conclude which is "better": that becomes advice.' },
  { id: 'f6', text: 'Summarise a new SAMA circular for the team', bin: 'check', why: 'Only if you attach the circular itself. From memory it will invent or use an outdated version.' },
  { id: 'f7', text: "Calculate the portfolio's year-to-date return after deposits and withdrawals", bin: 'self', why: 'It predicts what a number should look like. Calculated figures are the highest-risk output. Use the system or Excel.' },
  { id: 'f8', text: 'Check the client\'s current balance before a call', bin: 'self', why: 'It is not connected to core banking. Asked anyway, it will guess.' },
  { id: 'f9', text: 'Decide whether a structured product suits the client', bin: 'self', why: 'Judgement with consequences, and a regulated suitability process. It can argue both sides; it cannot carry the decision.' },
  { id: 'f10', text: 'Reply "Yes, 4pm works" on WhatsApp', bin: 'self', why: 'If you can write it faster than you can explain it, write it.' },
];
export function fitSort(card) {
  const w = wrap(card);
  const res = h('div');
  sorter({
    host: w, items: shuffle(FIT, 3), explain: true,
    bins: [{ id: 'great', label: 'Great fit', color: '#1E7F5C' }, { id: 'check', label: 'Check carefully', color: '#A86B12' }, { id: 'self', label: 'Do it yourself', color: '#B4432F' }],
    onDone: (ok, n) => {
      setFb(res, ok >= 8 ? 'good' : 'neutral', `${ok} of ${n} in the right place.`,
        'Notice the pattern. It wins on <b>language and volume</b>: reading, drafting, reshaping. It loses on <b>live data, arithmetic and judgement</b>. The "check carefully" column is where most real risk sits: tasks it does well enough to tempt you into not checking.');
      complete(card.dataset.id, { ok, n });
    },
  });
  w.append(res);
}

export function breakEven(card) {
  const w = wrap(card);
  const mk = (label, min, max, val, unit = 'min') => {
    const input = h('input', { type: 'range', min, max, value: val, 'aria-label': label });
    const out = h('output', {}, val + ' ' + unit);
    input.addEventListener('input', () => { out.textContent = input.value + ' ' + unit; calc(); touched = true; });
    w.append(h('div', { class: 'slider-row' }, h('label', {}, label), input, out));
    return input;
  };
  let touched = false;
  const self = mk('Doing it yourself', 1, 90, 6);
  const brief = mk('Writing the brief', 1, 20, 4);
  const check = mk('Checking the output', 1, 30, 4);
  const tool = h('button', { class: 'toggle', 'aria-pressed': 'false' }, h('span', { class: 'sw' }), h('span', {}, h('b', {}, 'It is a saved tool (Day 2)'), h('small', {}, 'The brief is written once and reused, so it costs about 30 seconds to run.')));
  tool.onclick = () => { tool.classList.toggle('on'); tool.setAttribute('aria-pressed', tool.classList.contains('on')); calc(); if (touched) complete(card.dataset.id); };
  const out = h('div');
  w.append(tool, out);
  function calc() {
    const b = tool.classList.contains('on') ? 0.5 : +brief.value;
    const ai = b + 1 + +check.value;
    const save = +self.value - ai;
    out.replaceChildren(
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, `${+self.value}m`), h('span', {}, 'by hand')),
        h('div', { class: 'stat' }, h('b', {}, `${ai.toFixed(1).replace('.0', '')}m`), h('span', {}, 'with AI (brief + 1m draft + check)')),
        h('div', { class: 'stat' }, h('b', { style: { color: save > 0 ? 'var(--good)' : 'var(--bad)' } }, (save > 0 ? '+' : '') + save.toFixed(1).replace('.0', '') + 'm'), h('span', {}, save > 0 ? 'saved per run' : 'lost per run'))),
      fb(save > 0 ? 'good' : 'bad', save > 0 ? 'AI wins on this one.' : 'Do this one yourself.',
        save > 0 ? `The saving grows with the task, but the <b>check never disappears</b>. If you skip the check to make the maths work, you have not saved time; you have borrowed risk.`
                 : `Briefing and checking are fixed costs. On a ${self.value}-minute task they eat the whole saving. <b>Small tasks lose.</b> Try the "saved tool" switch: that is why Day 2 exists.`));
  }
  calc();
}

/* ---------------- ACT 2 ---------------- */
const PARTS = {
  R: { label: 'Role', hint: 'Who it is, and who it is writing for', text: 'You are a private banking RM at a Saudi Islamic bank. The reader is me, ten minutes before a 30-minute review with Client A\'s eldest son, who now leads the family\'s investment questions.' },
  M: { label: 'Material', hint: 'What it may work from', text: 'Use only the attached statement (30 June 2026) and last meeting note. If something is not in them, say so.' },
  F: { label: 'Format', hint: 'The exact shape of the answer', text: 'Five sections: Position today, What changed, Likely to raise, My three questions, Open points. Under 220 words.' },
  C: { label: 'Constraints', hint: 'What it must not do', text: 'Quote figures exactly with page references; do not calculate. No product recommendations. Sharia-compliant terms. Do not soften risks.' },
};
const GUESSES = [['Who is reading?', 'R'], ['What they care about', 'R'], ['Which facts to use', 'M'], ['What to do when facts are missing', 'M'], ['How long', 'F'], ['What structure', 'F'], ['Whether to calculate', 'C'], ['Whether to advise', 'C']];
export function promptBuilder(card) {
  const w = wrap(card);
  const on = { R: false, M: false, F: false, C: false, ...(state.data[card.dataset.id]?.parts || {}) };
  const left = h('div');
  Object.entries(PARTS).forEach(([k, p]) => {
    const t = h('button', { class: 'toggle', 'aria-pressed': 'false' }, h('span', { class: 'sw' }), h('span', {}, h('b', {}, p.label), h('small', {}, p.hint)));
    t.classList.toggle('on', on[k]); t.setAttribute('aria-pressed', on[k]);
    t.onclick = () => { on[k] = !on[k]; setData(card.dataset.id, { ...(state.data[card.dataset.id] || {}), parts: { ...on } }); t.classList.toggle('on', on[k]); t.setAttribute('aria-pressed', on[k]); render(k); };
    left.append(t);
  });
  const g = h('div', { class: 'guesses' }, h('b', {}, '8'), h('div', {}, h('div', { style: { fontWeight: 600, fontSize: '14px' } }, 'things the assistant has to guess'), h('div', { class: 'guess-list' })));
  left.append(g);
  const right = h('div');
  w.append(h('div', { class: 'pb-grid' }, left, right));
  const note = h('div');
  w.append(note);
  function render(changed) {
    const prompt = h('div', { class: 'promptbox' });
    prompt.append('Prepare me for my meeting with Client A.');
    for (const k of ['R', 'M', 'F', 'C']) if (on[k]) prompt.append(' ', h('span', { class: 'p-add' }, PARTS[k].text));
    const solved = GUESSES.filter(([, k]) => on[k]).length;
    g.querySelector('b').textContent = 8 - solved; g.querySelector('b').classList.toggle('zero', solved === 8);
    g.querySelector('.guess-list').replaceChildren(...GUESSES.map(([t, k]) => h('span', { class: on[k] ? 'solved' : '' }, t)));
    const G = (t) => `<span class="hl-guess" title="${translate('Guessed: not in any material')}">${translate(t)}</span>`;
    const A = (t, k) => k === changed ? `<span class="hl-add">${translate(t)}</span>` : translate(t);
    const reader = on.R ? A('For your review with the son (he leads investment questions now).', 'R') : G('Client A is a valued, long-standing client of the bank.');
    const pos = on.M ? A(`Portfolio SAR 45.2m (p.1): murabaha SAR 14.0m maturing 15 Nov 2026; sukuk USD 1.6m; equities SAR 17.4m${on.C ? ', <b>62% in one stock (p.2)</b>' : ''}; real estate fund SAR 7.8m, locked to Dec 2026 (p.2).`, 'M')
      : G('The portfolio of approximately SAR 50m is well balanced across equities, fixed income and alternatives, consistent with a moderate-to-growth appetite.');
    const changedTxt = on.M ? A('Son flagged ~SAR 10m for a property purchase in Q1 2027 (meeting note, p.5). Principal wants a succession meeting before year end.', 'M') : G('Markets have been volatile and the client may wish to review his allocation.');
    const perf = on.C ? A('Performance: not calculated. RM to compute from statements before the meeting.', 'C') : G('Year-to-date performance is about +7.8%, and increasing the sukuk allocation could be recommended to the son.');
    const qs = on.R ? A('How firm is the Q1 2027 timing for the property? · Who should join the succession conversation? · How do you want us to report to you and your father?', 'R') : 'How are you feeling about the markets? · Are you happy with the service? · Any other questions?';
    const open = on.M ? A('Risk profile dated Feb 2024 (p.4): refresh due. Liquidity for Q1 2027 vs. the fund lock-up and a 2028 sukuk maturity.', 'M') : G('None identified.');
    let body;
    if (on.F) {
      body = [['Position today', `${reader} ${pos}`], ['What changed', changedTxt], ['Likely to raise', perf], ['My three questions', qs], ['Open points', open]]
        .map(([t, x]) => `<p><b>${t}.</b> ${x}</p>`).join('');
    } else {
      body = `<p>${G('In today\'s dynamic market environment, it is important to stay close to valued clients.')} ${reader} ${pos} ${changedTxt}</p><p>${perf} ${G('It would also be worth discussing diversification, estate planning, digital banking services and upcoming market opportunities to strengthen the relationship.')} ${qs}</p><p>${G('In summary, this meeting is a valuable opportunity to deepen the relationship and demonstrate the bank\'s commitment.')} Open points: ${open}</p>`;
    }
    const words = h('div', { html: body }).textContent.split(/\s+/).filter(Boolean).length;
    right.replaceChildren(h('div', { class: 'outbox' }, h('h6', {}, 'Your prompt'), prompt),
      h('div', { class: 'outbox' }, h('h6', {}, `Simulated answer · ${words} words`), h('div', { class: 'doc', html: body })),
      h('p', { class: 'muted' }, h('span', { class: 'hl-guess' }, 'red'), ' = guessed, not from any material. ', h('span', { class: 'hl-add' }, 'green'), ' = what your last change added.'));
    if (solved === 8) {
      setFb(note, 'good', 'Zero guesses left.', getLanguage() === 'ar'
        ? 'أي جزء خفّض الافتراضات أكثر من غيره؟ غالباً ما تكون الإجابة «المواد»: فالتوجيه المتوسط مع المستندات المناسبة أفضل من توجيه مصقول بلا مرفقات. كما أن «الدور» يحدد ما يُبقى في الإجابة؛ سمِّ القارئ ودعه يقرر ما المهم. جرّب الآن إيقاف «المواد» مع إبقاء الأجزاء الأخرى مفعّلة. ستظل الأداة تكتب بثقة، وهنا تكمن الخطورة.'
        : 'Which part removed the most red? For most people it is <b>Material</b>: a mediocre prompt with the right documents beats a beautiful one with nothing attached. And <b>Role</b> changes what gets <em>kept</em>: name the reader, and the reader decides what matters. Now try switching Material <em>off</em> with everything else on. It still writes confidently. That is the danger.');
      complete(card.dataset.id);
    } else note.replaceChildren();
  }
  render();
}

const LINT = [
  ['role', 'A role (who it is)', /\byou are\b|\bact as\b|\bas (an?|my) .{0,40}(rm|manager|banker|assistant|analyst)|بصفتك|أنت (مدير|مديرة)|الدور|تصرّف ك/i],
  ['reader', 'A named reader', /\b(for|to) (the |my |a )?(client|son|principal|father|reader|family|team head|manager|committee)|\breader\b|\baudience\b|للقارئ|إلى (العميل|الابن|رب الأسرة)|من القارئ|الجمهور/i],
  ['material', 'Material to work from', /\battach|\busing only|\buse only|\bbased (only )?on|\bfrom (the|my) (notes?|file|statement|meeting)|\bmy notes|\bhere (are|is)|استخدم فقط|استناداً إلى|المرفق|الملف|المواد|محضر الاجتماع|الكشف المرفق/i],
  ['shape', 'A shape (sections, bullets, email…)', /\bsections?\b|\bbullets?\b|\bparagraphs?\b|\btable\b|\bsubject line\b|\bone (clear )?(action|next step)|\bstructure\b|\bemail\b|أقسام|نقاط|فقرات|جدول|عنوان الرسالة|خطوة تالية|بنية|رسالة بريدية/i],
  ['length', 'A length limit in numbers', /\b(under|max(imum)?|no more than|up to|within|less than)\s*\d+|\d+\s*(words|lines|sentences)|أقل من\s*\d+|\d+\s*(كلمة|كلمات|سطر|أسطر|جملة|جمل)/i],
  ['guard', 'At least one "do not"', /\bdo not\b|\bdon't\b|\bnever\b|\bavoid\b|\bno (new )?(commitments?|advice|promises?|recommendations?|pricing)|لا (تذكر|تقدم|توصِ|تجرِ|تُجرِ|تنشئ|تخفف)|يُمنع|تجنب/i],
  ['gaps', 'What to do if something is missing', /not stated|not available|not in (the|my)|if (anything|something|it) is (missing|unclear)|say so|flag|ask me|unclear|إذا (لم|كان)|عند غياب|غير متوفر|غير موجود|غير واضح|اذكر ذلك/i],
];
export function promptLint(card) {
  const w = wrap(card);
  const ta = h('textarea', { placeholder: 'Write your brief here. Aim for one paragraph.', 'aria-label': 'Your brief' });
  if (state.data[card.dataset.id]?.text) ta.value = state.data[card.dataset.id].text;
  const meter = h('div', { class: 'meter' }, h('i'));
  const grid = h('div', { class: 'lint' });
  const msg = h('div');
  const ex = h('details', { class: 'why' }, h('summary', {}, 'Show a strong example'),
    h('div', { class: 'promptbox', style: { marginTop: '10px' } }, 'You are a private banking RM at a Saudi Islamic bank, writing in my voice (style guide attached) to Client A\'s eldest son, who prefers short, direct messages. Using only my meeting notes below, write an email confirming what we agreed and proposing one next step: a family meeting on liquidity planning in the week of 9 November. Under 120 words, plain English, one clear action at the end. Do not make new commitments on pricing, returns or timing. Do not mention figures that are not in my notes. If anything in my notes is unclear, list it after the email instead of guessing.'));
  w.append(ta, h('div', { class: 'row mt' }, h('b', { style: { fontSize: '14px' } }, 'Brief strength'), h('div', { style: { flex: 1 } }, meter)), grid, msg, ex);
  function run() {
    const t = ta.value;
    const res = LINT.map(([id, label, re]) => [label, re.test(t)]);
    const n = res.filter(r => r[1]).length;
    meter.firstChild.style.width = (n / LINT.length * 100) + '%';
    grid.replaceChildren(...res.map(([l, ok]) => h('div', { class: ok ? 'ok' : '' }, h('i', {}, ok ? '✓' : '○'), l)));
    const missing = res.find(r => !r[1]);
    if (t.trim().length < 15) msg.replaceChildren();
    else if (n === LINT.length) { setFb(msg, 'good', 'Strong brief: a competent stranger could act on it.', 'Now the real test, which no checklist can do: does it name the <em>one</em> thing this reader needs? Read it back as the son would.'); complete(card.dataset.id, { text: t, n }); }
    else setFb(msg, 'neutral', `${n} of ${LINT.length}. Next improvement: ${missing[0].toLowerCase()}.`, 'This checker only looks for the presence of the parts, not the quality. It is a habit-builder, not a grader.');
    setData(card.dataset.id, { text: t, n });
  }
  ta.addEventListener('input', run); run();
}

export function correctPath(card) {
  const w = wrap(card);
  const log = h('div', { class: 'pathlog' });
  const ch = h('div', { class: 'choices' });
  const meter = h('div', { class: 'meter' }, h('i'));
  const status = h('div', { class: 'row', style: { justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)' } });
  w.append(h('div', {}, status, meter), log, ch);
  let round = 1, restarts = 0, quality = 20, stage = 0;
  const say = (cls, who, html) => log.append(h('div', { class: 'bubble ' + cls }, who ? h('small', {}, who) : null, h('div', { html })));
  const upd = () => { meter.firstChild.style.width = quality + '%'; status.replaceChildren(h('span', {}, `Round ${round}`), h('span', {}, `Restarts: ${restarts}`), h('span', {}, `Draft quality ${quality}%`)); };
  const draft1 = getLanguage() === 'ar'
    ? 'عزيزي العميل، أرجو أن تكون بخير. عقب اجتماعنا المثمر، أود أن أغتنم هذه الفرصة لتلخيص ما دار… <i>(380 كلمة)</i> …<b>قد تتعافى الأسواق بقوة في الربع المقبل، ما قد يعود بالنفع على محفظتكم.</b> …وتمويلكم <b>بقيمة 14 مليون ريال</b> لدينا…'
    : 'Dear Valued Client, I hope this email finds you well! Following our productive meeting, I wanted to take this opportunity to summarise… <i>(380 words)</i> …<b>Markets may well recover strongly next quarter, which could benefit your portfolio.</b> …your <b>loan</b> of SAR 14m with us…';
  say('ai', getLanguage() === 'ar' ? 'المساعد · المسودة الأولى' : 'Assistant · first draft', draft1);
  function options() {
    ch.replaceChildren();
    const add = (txt, fn) => ch.append(h('button', { class: 'choice', onclick: fn }, txt));
    if (stage === 0) {
      add(getLanguage() === 'ar' ? '🔄 احذفها وابدأ محادثة جديدة بتوجيه مختلف قليلاً' : '🔄  Delete it and start a new chat with a slightly different prompt', () => { restarts++; round++; say('sys', null, getLanguage() === 'ar' ? 'محادثة جديدة. فُقد كل ما أخبرتها به.' : 'New chat. Everything you told it is gone.'); say('ai', getLanguage() === 'ar' ? 'المساعد · مسودة جديدة' : 'Assistant · fresh draft', getLanguage() === 'ar' ? 'عزيزي السيد، شكراً لثقتكم المستمرة… <i>(410 كلمات)</i> …نحن على ثقة بأن <b>تسهيل التمويل</b> سيواصل خدمتكم… <b>سنراجع الأسعار الأسبوع المقبل</b>.' : 'Dear Sir, Thank you for your continued trust… <i>(410 words)</i> …I am confident your <b>loan</b> facility will continue to serve you… <b>we will review your pricing next week</b>.'); if (restarts >= 2) say('sys', null, getLanguage() === 'ar' ? `الجولة ${round}، ولم يُحل شيء. أنتجت المحادثة الجديدة مشكلة <b>جديدة</b>: وعداً بمراجعة الأسعار.` : `Round ${round}, and nothing is fixed. The new chat produced a <b>new</b> problem: a pricing promise.`); upd(); });
      add(getLanguage() === 'ar' ? '✨ قل لها: «اجعليها أكثر مهنية وأفضل»' : '✨  Tell it: "Make it more professional and better."', () => { round++; quality = Math.min(quality + 5, 35); say('me', 'سارة', getLanguage() === 'ar' ? 'اجعليها أكثر مهنية وأفضل.' : 'Make it more professional and better.'); say('ai', getLanguage() === 'ar' ? 'المساعد' : 'Assistant', getLanguage() === 'ar' ? 'عميلنا الكريم، يسرني أن أكتب إليكم عقب اجتماعنا المثمر للغاية… <i>(440 كلمة)</i> …<b>تمويلكم</b>…' : 'Esteemed Client, It is with great pleasure that I write following our most productive engagement… <i>(440 words)</i> …your <b>loan</b>…'); say('sys', null, getLanguage() === 'ar' ? 'أطول وأكثر تكلّفاً، مع الأخطاء نفسها. الصفات لا تضيف معلومات.' : 'Longer, stiffer, same errors. Adjectives carry no information.'); upd(); });
      add(getLanguage() === 'ar' ? '🎯 حدّد الأخطاء بدقة، كما تفعل مع موظف جديد' : '🎯  Tell it exactly what is wrong, like you would a junior', () => { round++; stage = 1; quality = 70; say('me', 'سارة', translate('Three fixes. Under 120 words. Delete the paragraph about markets recovering: that is speculation and we never forecast. It is a <b>murabaha deposit</b>, not a loan. Keep the closing line about the family meeting.')); say('ai', getLanguage() === 'ar' ? 'المساعد · الجولة ' + round : 'Assistant · round ' + round, translate('Dear Abu Khalid, thank you for your time on Tuesday. As agreed, your murabaha deposit of SAR 14m matures on 15 November, and we will meet the week before to plan next steps…') + ' <i>(' + (getLanguage() === 'ar' ? '112 كلمة' : '112 words') + ')</i>'); say('sys', null, translate('Shape and content fixed in one round, because it still had the whole history in view.')); upd(); options(); });
    } else if (stage === 1) {
      add(getLanguage() === 'ar' ? '📎 أرفق رسالتين سابقتين للعائلة وقل: «اتّبعي أسلوبي»' : '📎  Paste two of your own emails to this family: "Match my style."', () => { round++; stage = 2; quality = 92; say('me', 'سارة', translate('Here are two emails I sent this family (redacted). Match my style: shorter sentences, no exclamation marks, warm sign-off.')); say('ai', getLanguage() === 'ar' ? 'المساعد · الجولة ' + round : 'Assistant · round ' + round, translate('Abu Khalid, thank you for Tuesday. Your murabaha deposit matures on 15 November; I suggest we meet the week before to decide what comes next. I will send two dates by Sunday. With best regards, Sara')); finish(); upd(); });
      add(getLanguage() === 'ar' ? '✅ أرسلها الآن. إنها جيدة بما يكفي.' : '✅  Send it now. It is good enough.', () => { stage = 2; say('sys', null, translate('Sent. Correct, but it sounds like a tool wrote it. The client notices the voice before the content.')); finish(); upd(); });
    }
  }
  function finish() {
    ch.replaceChildren(fb(restarts ? 'neutral' : 'good', getLanguage() === 'ar' ? `اكتمل خلال ${round} جولات، مع ${restarts} مرات إعادة بدء.` : `Done in ${round} rounds with ${restarts} restart${restarts === 1 ? '' : 's'}.`,
      getLanguage() === 'ar' ? `${restarts ? 'أدى كل بدء جديد إلى فقدان السياق وظهور مشكلات جديدة. ' : ''}<b>ثلاث جولات أمر طبيعي وليس إخفاقاً:</b> تحدد الأولى الشكل، وتصحح الثانية المحتوى، والثالثة تضبط الأسلوب. إذا وصلت إلى الجولة السابعة، فالمشكلة في الأساس: مواد ناقصة أو مهمة لا تستطيع الأداة إنجازها.` : `${restarts ? 'Every restart threw away the context and introduced new problems. ' : ''}<b>Three rounds is normal, not failure:</b> round one gets the shape, round two fixes the content, round three fixes the voice. If you are on round seven, the problem is upstream: missing material, or a task it cannot do.`));
    complete(card.dataset.id, { round, restarts });
  }
  upd(); options();
}

const READERS = [
  { id: 'r1', text: 'The credit or investment committee', m: 'Terse, factual, risk first. No persuasion: the position, not the story.' },
  { id: 'r2', text: 'A family principal you have served for 15 years', m: 'Warm, unhurried, no jargon, never over-promising. The relationship does the work.' },
  { id: 'r3', text: 'Your team head', m: 'Short and decision-oriented. What you need from them, in the first line.' },
  { id: 'r4', text: 'The file, read by your successor in two years', m: 'Complete, neutral, dated. Written for someone with no context.' },
];
export function registerMatch(card) {
  const w = wrap(card);
  const L = h('div', { class: 'col' }), R = h('div', { class: 'col' });
  let sel = null, matched = 0, errors = 0;
  const msg = h('div');
  READERS.forEach(r => { const b = h('button', { class: 'mitem', 'data-id': r.id }, r.text); b.onclick = () => { if (b.classList.contains('done')) return; $$('.mitem', L).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = r.id; }; L.append(b); });
  shuffle(READERS, 11).forEach(r => {
    const b = h('button', { class: 'mitem' }, r.m);
    b.onclick = () => {
      if (!sel || b.classList.contains('done')) return;
      const lb = $(`[data-id="${sel}"]`, L);
      if (sel === r.id) {
        matched++; [lb, b].forEach(x => { x.classList.remove('sel'); x.classList.add('done', 'chip', 'ok'); x.append(h('span', { class: 'tag' }, String(matched))); });
        sel = null;
        if (matched === 4) { setFb(msg, errors <= 1 ? 'good' : 'neutral', getLanguage() === 'ar' ? `تمت المطابقة بعد ${errors} محاولات خاطئة.` : `Matched with ${errors} wrong attempt${errors === 1 ? '' : 's'}.`, getLanguage() === 'ar' ? 'الكلمة نفسها ولها أربعة معانٍ. لذلك لا تكتب «اجعله مهنياً» فقط. حدّد القارئ، أو الأفضل أن ترفق <b>مثالاً سابقاً جيداً</b> كُتب له. مثالان أفضل بكثير من واحد؛ فبهما تتعلم الأداة ما الذي يتغير وما الذي يجب أن يظل ثابتاً.' : 'Same word, four meanings. So never write "make it professional". Name the reader, or better, paste <b>one good past example</b> written for that reader. Two examples are dramatically better than one: with two, it learns what varies and what stays fixed.'); complete(card.dataset.id, { errors }); }
      } else { errors++; b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 500); }
    };
    R.append(b);
  });
  w.append(h('div', { class: 'match' }, h('div', {}, h('p', { class: 'muted' }, 'Reader'), L), h('div', {}, h('p', { class: 'muted' }, 'What "professional" means to them'), R)), msg);
}

/* ---------------- ACT 3 ---------------- */
export function patternFill(card) {
  const w = wrap(card);
  const doc = h('div', { class: 'doc', html: `<div class="dochead"><span>Discretionary mandate · Fee schedule · p.3</span><span>Synthetic</span></div><table>${CLIENT_A.fees.map(f => `<tr><td>${f.name}</td><td>${f.value}</td></tr>`).join('')}</table><span class="stamp">SYNTHETIC · TRAINING</span>` });
  const out = h('div', { class: 'doc', style: { marginTop: '12px', minHeight: '60px' } });
  const btn = h('button', { class: 'btn btn-primary mt' }, 'Ask: "List all the fees in this mandate."');
  const msg = h('div');
  const lines = [...CLIENT_A.fees.map(f => ({ t: `${f.name}: ${f.value}`, real: true })), { t: 'Performance fee: 10% of returns above a 6% hurdle', real: false }];
  w.append(doc, btn, out, msg);
  out.append(h('p', { class: 'muted', style: { margin: 0 } }, 'The answer will appear here.'));
  btn.onclick = async () => {
    btn.disabled = true; out.replaceChildren();
    for (const l of lines) {
      const p = h('p', { class: 'tok', style: { margin: '0 0 4px', display: 'block' } }, '');
      out.append(p);
      for (let i = 0; i <= l.t.length; i += 3) { p.textContent = '• ' + l.t.slice(0, i); await new Promise(r => setTimeout(r, 12)); }
      p.textContent = '• ' + l.t;
      p.onclick = () => pick(p, l);
    }
    setFb(msg, 'info', 'Five fees, all equally confident. One of them is not in the document.', 'Click the line you think has no source.');
  };
  let done = false;
  function pick(p, l) {
    if (done) return;
    if (!l.real) {
      done = true; p.classList.add('hit');
      $$('.tok', out).forEach((x, i) => { if (lines[i].real) x.append(h('span', { class: 'muted' }, '  ✓ p.3')); else x.append(h('span', { style: { color: 'var(--bad)', fontWeight: 600 } }, '  ✗ not in source')); });
      setFb(msg, 'good', 'Found it. Now notice why it happened.',
        'Discretionary mandates often <em>have</em> a performance fee, so after four fees a fifth is the most plausible continuation. The tool has <b>no internal signal that says "I am now guessing"</b>. That is the whole problem in one sentence. The fix is a rule, not a hope: <em>"List only fees that appear in the document, each with its page number. If a category is absent, write \'not found\'."</em>');
      complete(card.dataset.id);
    } else { p.classList.add('wrong'); setTimeout(() => p.classList.remove('wrong'), 700); toast2(msg, 'That one is on p.3. Look for the fee that sounds typical but is not in the schedule above.'); }
  }
  function toast2(slot, t) { setFb(slot, 'neutral', null, t); }
}

const CONF = [
  { t: 'The murabaha deposits of SAR 14.0m mature on 15 November 2026.', ok: true, why: 'Correct, statement p.1.' },
  { t: 'The sukuk holding matures in March 2027, ahead of the planned property purchase.', ok: false, why: 'Wrong year. It matures 12 March <b>2028</b> (p.1), which is <em>after</em> the Q1 2027 purchase. That changes the liquidity conversation completely.' },
  { t: 'The risk profile on file is "Moderate", last updated in February 2024.', ok: true, why: 'Correct, p.4. And over two years old: an open point.' },
  { t: 'The portfolio has returned 7.8% year-to-date.', ok: false, why: 'No such figure anywhere in the file. A calculated or invented number, written exactly like the true ones.' },
  { t: 'The real estate fund has a 90-day redemption notice period.', ok: true, why: 'Correct, p.2.' },
  { t: 'The son has asked to increase the family\'s exposure to Saudi equities.', ok: false, why: 'Never said. The note mentions a property purchase and succession. A plausible "client wish" filled the gap.' },
];
const SCALE = ['Sure it is wrong', 'Probably wrong', 'Probably right', 'Sure it is right'];
export function confidence(card) {
  const w = wrap(card);
  const ans = {};
  const items = CONF.map((c, i) => {
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Confidence' });
    SCALE.forEach((s, k) => { const b = h('button', {}, s); b.onclick = () => { $$('button', seg).forEach(x => x.classList.remove('on')); b.classList.add('on'); ans[i] = k; reveal.disabled = Object.keys(ans).length < CONF.length; }; seg.append(b); });
    const v = h('div', { class: 'verdict' });
    const el = h('div', { class: 'conf-item' }, h('p', {}, `${i + 1}. ${c.t}`), seg, v);
    return { el, v };
  });
  const reveal = h('button', { class: 'btn btn-primary mt', disabled: true }, 'Reveal the file');
  const res = h('div');
  w.append(...items.map(x => x.el), reveal, res);
  reveal.onclick = () => {
    reveal.disabled = true;
    let fooled = 0, correct = 0, sureWrong = 0;
    CONF.forEach((c, i) => {
      const k = ans[i], saidTrue = k >= 2;
      if (saidTrue === c.ok) correct++;
      if (!c.ok && saidTrue) { fooled++; if (k === 3) sureWrong++; }
      items[i].v.className = 'verdict ' + (c.ok ? 't' : 'f');
      items[i].v.innerHTML = (c.ok ? '✓ True. ' : '✗ False. ') + c.why;
    });
    res.append(h('div', { class: 'mt', html: statementHTML({ notes: true }) }),
      fb(fooled ? 'bad' : 'good', fooled ? `The fluency trap caught you ${fooled} time${fooled > 1 ? 's' : ''} out of 3.` : 'You were not fooled. Rare.',
        `${sureWrong ? `You were <b>sure</b> about ${sureWrong} false statement${sureWrong > 1 ? 's' : ''}. ` : ''}Nothing in the writing separated true from false: same fluency, same structure, same confidence. <b>Fluency reads as competence to the human brain.</b> A well-written wrong paragraph gets less scrutiny than a badly written right one. So you do not decide when to verify. You verify.`));
    complete(card.dataset.id, { fooled, correct, sureWrong });
  };
}

export function pushback(card) {
  const w = wrap(card);
  const log = h('div', { class: 'pathlog' });
  const ch = h('div', { class: 'row' });
  const msg = h('div');
  w.append(log, ch, msg);
  const say = (cls, who, html) => log.append(h('div', { class: 'bubble ' + cls }, h('small', {}, who), h('div', { html })));
  say('me', 'Sara', 'When do Client A\'s murabaha deposits mature?');
  say('ai', 'Assistant', 'The murabaha deposits of SAR 14.0m mature on <b>15 November 2026</b> (statement, p.1).');
  let step = 0;
  const b1 = h('button', { class: 'btn btn-ghost' }, '“Are you sure? I think it\'s December.”');
  const b2 = h('button', { class: 'btn btn-primary', disabled: true }, '“Quote the exact line from the source.”');
  ch.append(b1, b2);
  b1.onclick = () => { b1.disabled = true; say('me', 'Sara', 'Are you sure? I think it\'s December.'); setTimeout(() => { say('ai', 'Assistant', 'You\'re right, apologies for the confusion. The murabaha deposits mature in <b>December 2026</b>.'); setFb(msg, 'bad', 'It caved. The first answer was correct.', 'Push it and it agrees. Pressure makes it worse: ask it to be certain and it will be certain, in either direction. Its confidence is not evidence.'); b2.disabled = false; }, 500); };
  b2.onclick = () => { b2.disabled = true; say('me', 'Sara', 'Quote the exact line from the source.'); setTimeout(() => { say('ai', 'Assistant', 'Statement p.1: <i>"Murabaha deposits · SAR 14.0m · Mature 15 Nov 2026."</i> So the correct date is <b>15 November 2026</b>, not December.'); setFb(msg, 'good', 'Ask for evidence, not reassurance.', '"Are you sure?" invites agreement. "Show me the line" forces it back to the material, and gives you something you can check in five seconds.'); complete(card.dataset.id); }, 500); };
}

const BRIEF = [
  { t: 'Client A\'s portfolio stands at SAR 45.2m as of 30 June 2026 (p.1).' },
  { t: 'It has returned 7.8% year-to-date, ahead of the local market.', err: 'calc', why: '<b>Calculated or invented figure.</b> No return appears anywhere in the file. Quoted figures are usually right; calculated ones are the danger.' },
  { t: 'Murabaha deposits of SAR 14.0m mature on 15 November 2026 (p.1).' },
  { t: 'The sukuk fund holding of SAR 1.6m matures in March 2028 (p.1).', err: 'ccy', why: '<b>Currency mix-up.</b> The holding is <b>USD</b> 1.6m (≈ SAR 6.0m). Off by a factor of 3.75, and it looks perfectly normal.' },
  { t: 'Equity holdings of SAR 17.4m are well diversified across the Saudi market.', err: 'soft', why: '<b>Softened risk.</b> The statement says 62% sits in a single stock (p.2). "Well diversified" reads better and tells you the opposite.' },
  { t: 'The real estate fund is locked until December 2026, with a 90-day notice period (p.2).' },
  { t: 'At the last meeting, on 12 March 2026, the son mentioned a property purchase of about SAR 10m in Q1 2027.', err: 'date', why: '<b>Wrong date.</b> The meeting was on 12 <b>May</b> 2026 (p.5). Dates inferred from context are a classic slip.' },
  { t: 'The principal wants a family meeting on succession before year end.' },
  { t: 'Open point: the risk profile on file dates from February 2024 (p.4).' },
];
export function errorHunt(card) {
  const w = wrap(card);
  const timer = h('div', { class: 'timer' }, '1:30');
  const start = h('button', { class: 'btn btn-primary' }, 'Start the clock');
  const check = h('button', { class: 'btn btn-gold', disabled: true }, 'Check against the source');
  const brief = h('div', { class: 'doc brief' }, h('div', { class: 'dochead' }, h('span', {}, 'Pre-meeting brief · Client A · draft by assistant'), h('span', {}, 'Synthetic')));
  const toks = BRIEF.map(b => { const s = h('span', { class: 'tok' }, b.t); s.onclick = () => { if (!running) return; s.classList.toggle('sel'); }; brief.append(h('p', {}, s)); return s; });
  const res = h('div');
  brief.classList.add('blurred');
  w.append(h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('div', { class: 'row' }, start, check), timer), h('div', { class: 'mt' }, brief), res);
  let running = false, t0 = 0, left = 90, iv;
  start.onclick = () => { brief.classList.remove('blurred'); running = true; start.disabled = true; check.disabled = false; t0 = Date.now(); iv = setInterval(tick, 250); };
  function tick() { left = Math.max(0, 90 - Math.floor((Date.now() - t0) / 1000)); timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; timer.classList.toggle('low', left <= 15); if (!left) evaluate(); }
  check.onclick = evaluate;
  function evaluate() {
    if (!running) return; running = false; clearInterval(iv); check.disabled = true; timer.classList.remove('low');
    const secs = Math.round((Date.now() - t0) / 1000);
    let found = 0, fp = 0;
    BRIEF.forEach((b, i) => {
      const s = toks[i], sel = s.classList.contains('sel');
      s.classList.remove('sel');
      if (b.err && sel) { found++; s.classList.add('hit'); }
      else if (b.err) s.classList.add('miss');
      else if (sel) { fp++; s.classList.add('wrong'); }
    });
    res.replaceChildren(
      h('div', { class: 'stats' }, h('div', { class: 'stat' }, h('b', {}, `${found}/4`), h('span', {}, 'errors found')), h('div', { class: 'stat' }, h('b', {}, fp), h('span', {}, 'correct lines flagged')), h('div', { class: 'stat' }, h('b', {}, `${secs}s`), h('span', {}, 'time taken'))),
      h('div', { class: 'two mt' }, h('div', { html: statementHTML({ notes: true }) }), h('div', {}, ...BRIEF.filter(b => b.err).map(b => fb('neutral', null, b.why)))),
      fb(found === 4 ? 'good' : 'bad', found === 4 ? 'All four. That is the habit.' : `${4 - found} would have gone into the meeting.`,
        'Every error sat in a sentence that sounded exactly like its neighbours. With page references on every figure, this check takes about ninety seconds. Without them, you would be re-reading the whole file. <b>Ask for the page, every time.</b>'));
    complete(card.dataset.id, { found, fp, secs });
  }
}
