import { h, $$, complete, setFb, fb, wrap, state, shuffle } from './core.js?v=ar-qa-7';

const Q = [
  { q: 'Which addition most often stops the assistant inventing content?', o: ['Naming its role', 'Attaching the material and saying "if it is not there, say so"', 'Asking it to be accurate', 'Asking politely'], a: [1], act: 2, why: 'It only knows what you give it. The boundary line prevents most invented answers.' },
  { q: 'Which of these should you verify first?', multi: true, o: ['A return the assistant calculated', 'A date it inferred from context', 'A fee it quoted with a page reference', '"Well diversified" describing a 62% single-stock position'], a: [0, 1, 3], act: 3, why: 'Calculated figures, inferred dates and softened risks are the classic failures. A quoted figure with a page is the easy one to check.' },
  { q: 'True or false: a fluent, confident answer is more likely to be correct.', o: ['True', 'False'], a: [1], act: 3, why: 'There is no tone of uncertainty. A wrong answer looks exactly like a right one.' },
  { q: 'You ask "Are you sure?" and it changes a correct answer. Best next move?', o: ['Accept the new answer', 'Ask it to quote the exact line from the source', 'Start a new chat', 'Ask it to be more careful'], a: [1], act: 3, why: 'Ask for evidence, not reassurance.' },
  { q: 'The safest instruction for numbers is:', o: ['"Double-check your maths"', '"Quote figures exactly with page references; do not calculate"', '"Round all figures"', '"Only use recent figures"'], a: [1], act: 3, why: 'Quoted figures are usually right; calculated ones are the danger.' },
  { q: 'Which document move carries the lowest risk?', o: ['Extract', 'Summarise', 'Compare', 'Asking it to conclude'], a: [0], act: 4, why: 'Each extracted item is either in the document or not, and the page lets you check it in seconds.' },
  { q: 'A key fact sits on page 20 of a 40-page file. What should you do?', o: ['Nothing: it reads every page equally', 'Work section by section and name the source per question', 'Ask for a longer summary', 'Upload it twice'], a: [1], act: 4, why: 'Detail in the middle of long material gets thinner treatment. Narrow the question.' },
  { q: 'Which can identify a client without their name?', multi: true, o: ['Sector + city + revenue band', 'An exact amount and a date', 'An IBAN', '"Moderate risk profile"'], a: [0, 1, 2], act: 6, why: 'Combinations and precise figures pin down one family. A risk category alone does not.' },
  { q: 'Your honest answer to "would I paste this?" is "probably". That means:', o: ['Yes', 'No: treat it as a no and ask someone', 'Paste it but delete afterwards', 'Use a personal account instead'], a: [1], act: 6, why: '"Probably" is never a yes.' },
  { q: 'Which sentence is investment advice?', o: ['The fund invests in Saudi sukuk', 'The fee is 0.5% a year per the fact sheet', 'Based on your profile, increasing your sukuk allocation makes sense', 'Here are three questions to discuss before deciding'], a: [2], act: 6, why: 'Linking a product to the client\'s profile is a suitability statement.' },
  { q: 'Best route to Arabic that does not sound translated?', o: ['"Translate this carefully"', '"Write it as it would be written originally in Arabic", plus real examples and the bank\'s glossary', 'Use more formal words', 'Write it in English and let the client translate'], a: [1], act: 5, why: 'Rewrite, do not translate. Examples and a fixed glossary close most of the gap.' },
  { q: 'A candidate task scores 9 out of 15. You should:', o: ['Build it as is', 'Build it, but keep it narrow', 'Drop it', 'Add more features'], a: [1], act: 7, why: '8–11 is amber: build the narrowest, lowest-risk step.' },
  { q: 'When building a tool, the biggest single quality jump usually comes from:', o: ['Rewording the instructions', 'Attaching two good past outputs', 'A longer role description', 'Asking it to think carefully'], a: [1], act: 8, why: 'It learns your standard from examples faster than from any description.' },
  { q: 'Which belong in the tool\'s instructions?', multi: true, o: ['The role', '"Never calculate"', 'The "not available in source" fallback', "This week's client statement"], a: [0, 1, 2], act: 8, why: 'The client file is the per-run input, not part of the tool.' },
  { q: 'Before you judge whether a new tool is worth keeping, you should:', o: ['Use it once', 'Use it three times on real work and log the time', 'Show it to the whole team', 'Build a second tool'], a: [1], act: 9, why: 'Once is not a test. Three runs tell you whether the instructions hold.' },
];
export function quiz(card) {
  const w = wrap(card);
  const prev = state.data.quiz?.answers || {};
  const qs = Q.map((q, i) => {
    const name = 'q' + i;
    const order = shuffle(q.o.map((_, k) => k), i * 7 + 3);
    const byIdx = {};
    order.forEach(k => { const inp = h('input', { type: q.multi ? 'checkbox' : 'radio', name, value: k }); if ((prev[i] || []).includes(k)) inp.checked = true; byIdx[k] = h('label', {}, inp, h('span', {}, q.o[k])); });
    const labels = q.o.map((_, k) => byIdx[k]);
    const exp = h('div', { class: 'exp' });
    const el = h('div', { class: 'q' }, h('div', { class: 'qn' }, `QUESTION ${i + 1} OF ${Q.length}${q.multi ? ' · CHOOSE ALL THAT APPLY' : ''}`), h('h5', {}, q.q), h('div', { class: 'opts' }, ...order.map(k => byIdx[k])), exp);
    return { el, labels, exp };
  });
  const btn = h('button', { class: 'btn btn-primary mt' }, 'Check my answers');
  const res = h('div');
  btn.onclick = () => {
    let score = 0; const answers = {}; const missed = new Set(); let unanswered = 0;
    Q.forEach((q, i) => {
      const chosen = qs[i].labels.map((l, k) => l.querySelector('input').checked ? k : -1).filter(k => k >= 0);
      answers[i] = chosen; if (!chosen.length) unanswered++;
      const ok = chosen.length === q.a.length && chosen.every(k => q.a.includes(k));
      if (ok) score++; else missed.add(q.act);
      qs[i].labels.forEach((l, k) => { l.classList.remove('right', 'wrongpick'); if (q.a.includes(k)) l.classList.add('right'); else if (chosen.includes(k)) l.classList.add('wrongpick'); });
      qs[i].exp.innerHTML = (ok ? '✓ ' : '✗ ') + q.why + (ok ? '' : ` <a href="#act-${q.act}">Revisit Act ${q.act}</a>`);
    });
    if (unanswered) { setFb(res, 'neutral', `${unanswered} question${unanswered > 1 ? 's' : ''} unanswered.`, 'Answers are marked above. Fill in the rest and check again.'); }
    else setFb(res, score >= 12 ? 'good' : 'neutral', `${score} / ${Q.length}`, score >= 12 ? 'Strong. You are ready for Sunday morning.' : `Worth another look: ${[...missed].sort().map(a => `<a href="#act-${a}">Act ${a}</a>`).join(', ')}.`);
    complete(card.dataset.id, { score, answers });
  };
  w.append(...qs.map(x => x.el), btn, res);
}

export function results(card) {
  const w = wrap(card);
  const render = () => {
    const d = state.data;
    const tiles = [];
    const T = (label, val, note) => tiles.push(h('div', { class: 'rtile' }, h('span', {}, label), h('b', {}, val), h('p', {}, note)));
    const n = Object.keys(state.done).length, total = document.querySelectorAll('.card[data-id]').length;
    T('Story completed', `${Math.min(100, Math.round(n / total * 100))}%`, `${n} of ${total} interactions`);
    if (d['a3-confidence']) T('Fluency trap', `${d['a3-confidence'].fooled} / 3`, d['a3-confidence'].fooled ? 'false statements you believed. Verify by habit.' : 'Not fooled. Keep verifying anyway.');
    if (d['a3-hunt']) T('Error hunt', `${d['a3-hunt'].found} / 4`, `found in ${d['a3-hunt'].secs}s, ${d['a3-hunt'].fp} false alarm${d['a3-hunt'].fp === 1 ? '' : 's'}`);
    if (d['a6-redact']) T('Redaction', `${d['a6-redact'].hit} / ${d['a6-redact'].total}`, 'identifiers caught');
    if (d['a6-swipe']) T('Would you paste it?', `${d['a6-swipe'].score} / 10`, 'safe calls');
    if (d['a1-sort']) T('Where AI fits', `${d['a1-sort'].ok} / ${d['a1-sort'].n}`, 'tasks placed correctly');
    if (d['a8-stress']) T('Stress test', `${d['a8-stress'].runs} run${d['a8-stress'].runs > 1 ? 's' : ''}`, `to pass all three cases${d['a8-stress'].decoys ? `, ${d['a8-stress'].decoys} useless guardrail${d['a8-stress'].decoys > 1 ? 's' : ''}` : ', no wasted guardrails'}`);
    if (d.quiz) T('Knowledge check', `${d.quiz.score} / 15`, d.quiz.score >= 12 ? 'Ready for Sunday.' : 'Revisit the acts linked above.');
    w.replaceChildren(tiles.length > 1 ? h('div', { class: 'rgrid' }, ...tiles) : h('p', { class: 'muted' }, 'Your results appear here as you work through the story.'));
  };
  render();
  document.addEventListener('rm:complete', render);
}
