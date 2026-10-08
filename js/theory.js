// "From the deck" panels: the slide content shown inline, right before the activity it leads into.
import { SLIDES } from './theory-data.js?v=ar-qa-11';
import { getLanguage } from './i18n.js?v=ar-qa-11';

const RANGES = { 1: [1, 1, 16], 2: [1, 17, 30], 3: [1, 45, 53], 4: [1, 31, 44], 5: [1, 54, 65], 6: [1, 66, 79], 7: [2, 1, 19], 8: [2, 20, 53], 9: [2, 54, 71], 10: [2, 72, 77] };
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function lineHTML(l) {
  let tag = '';
  const parts = l.split(' · ');
  if (parts.length > 1 && (l.includes(' — ') || /^\d/.test(l)) && parts[parts.length - 1].length <= 22 && !parts[parts.length - 1].includes(' — ')) { tag = parts.pop(); l = parts.join(' · '); }
  let html;
  const dash = l.indexOf(' — ');
  if (dash > 0 && dash < 70) html = `<b>${esc(l.slice(0, dash))}</b> — ${esc(l.slice(dash + 3))}`;
  else {
    const m = l.match(/^([^.«»:]{2,45}?[.:])\s(.+)$/);
    html = m && m[1].split(' ').length <= 7 ? `<b>${esc(m[1])}</b> ${esc(m[2])}` : esc(l);
  }
  return `<li>${html}${tag ? ` <span class="th-tag">${esc(tag)}</span>` : ''}</li>`;
}
function bodyHTML(lines) {
  let html = '', run = [];
  const flush = () => {
    if (!run.length) return;
    const cols = run[0].split(' · ').length;
    if (run.length >= 3 && cols >= 3 && run.every(r => r.split(' · ').length === cols)) {
      const rows = run.map(r => r.split(' · '));
      html += `<div class="th-tablewrap"><table class="th-table"><tr>${rows[0].map(c => `<th>${esc(c)}</th>`).join('')}</tr>${rows.slice(1).map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</table></div>`;
    } else html += `<ul>${run.map(lineHTML).join('')}</ul>`;
    run = [];
  };
  lines.forEach(l => { if (l.startsWith('## ')) { flush(); html += `<h5>${esc(l.slice(3))}</h5>`; } else run.push(l); });
  flush();
  return html;
}
function block(day, from, to) {
  const slides = []; for (let n = from; n <= to; n++) if (SLIDES[day][n]) slides.push([n, SLIDES[day][n]]);
  if (!slides.length) return null;
  const ar = getLanguage() === 'ar';
  const dayTxt = ar ? (day === 1 ? 'اليوم الأول' : 'اليوم الثاني') : `Day ${day}`;
  const range = from === to ? (ar ? `الشريحة ${from}` : `Slide ${from}`) : (ar ? `الشرائح ${from}–${to}` : `Slides ${from}–${to}`);
  const el = document.createElement('div');
  el.className = 'theory'; el.dir = 'rtl'; el.lang = 'ar'; el.setAttribute('data-noi18n', '');
  el.innerHTML = `<button type="button" class="th-toggle" aria-expanded="true"><span>${ar ? 'من العرض التقديمي' : 'From the deck'} · ${dayTxt} · ${range}</span><span class="th-chev" aria-hidden="true">▾</span></button>
  <div class="th-body">${slides.map(([n, s]) => `<article class="th-slide"><div class="th-meta"><span class="th-num">${n}</span><span class="th-kicker">${esc(s.k)}</span></div><h4>${esc(s.t)}</h4>${bodyHTML(s.b)}</article>`).join('')}</div>`;
  const btn = el.querySelector('.th-toggle');
  btn.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') !== 'true'; btn.setAttribute('aria-expanded', String(open)); el.classList.toggle('closed', !open); });
  return el;
}

export function insertTheory(CUES) {
  for (const [act, [day, first, last]] of Object.entries(RANGES)) {
    const section = document.querySelector(`.act[data-act="${act}"]`); if (!section) continue;
    let p = first;
    section.querySelectorAll('.card[data-id]').forEach(card => {
      const cue = CUES[card.dataset.id]; if (!cue || cue[0] !== day) return;
      const stop = Math.min(cue[1], last);
      if (stop >= p) { const b = block(day, p, stop); if (b) card.before(b); p = stop + 1; }
    });
    if (p <= last) { const b = block(day, p, last); if (b) section.append(b); }
  }
}
