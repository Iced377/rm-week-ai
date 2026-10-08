// Core helpers: DOM, state, progress, shared interaction primitives.
import { getLanguage, translate, translateTree } from './i18n.js?v=ar-qa-10';
const KEY = 'rmweek.v1';

export const state = load();
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { done: {}, data: {}, last: null }; }
  catch { return { done: {}, data: {}, last: null }; }
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
export function resetAll() { try { localStorage.removeItem(KEY); } catch {} }

export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') { e.innerHTML = v; translateTree(e); }
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else e.setAttribute(k, ['aria-label','title','placeholder','alt'].includes(k) ? translate(String(v)) : (v === true ? '' : v));
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(translate(String(k))));
  if (getLanguage() === 'ar') for (const name of ['aria-label','title','placeholder','alt']) { const val=e.getAttribute(name); if(val) e.setAttribute(name,translate(val)); }
  return e;
}
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const shuffle = (a, seed = 7) => { const r = [...a]; let s = seed; for (let i = r.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

let total = 0;
export function registerTotal(n) { total = n; updateProgress(); }
export function complete(id, data) {
  const first = !state.done[id];
  state.done[id] = true;
  if (data !== undefined) state.data[id] = data;
  state.last = id;
  save();
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (card) card.classList.add('completed');
  updateProgress();
  if (first) toast('Nice. Progress saved.');
  document.dispatchEvent(new CustomEvent('rm:complete', { detail: { id } }));
}
export function setData(id, data) { state.data[id] = data; save(); }
export function updateProgress() {
  const n = Object.keys(state.done).length;
  const pct = total ? Math.round((n / total) * 100) : 0;
  const bar = document.getElementById('progressBar'); if (bar) bar.style.width = pct + '%';
  const lab = document.getElementById('progressLabel'); if (lab) lab.textContent = pct + '%';
  document.querySelectorAll('.act').forEach(sec => {
    const ids = [...sec.querySelectorAll('.card[data-id]')].map(c => c.dataset.id);
    const all = ids.length && ids.every(i => state.done[i]);
    const a = document.querySelector(`.actnav a[data-act="${sec.dataset.act}"]`);
    if (a) a.classList.toggle('done', !!all);
  });
}
let tt;
export function toast(msg) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200);
}
export function fb(kind, title, body) {
  return h('div', { class: `fb ${kind}` }, title ? h('h5', {}, title) : null, body ? h('p', { html: body }) : null);
}
export function setFb(slot, kind, title, body) { slot.replaceChildren(fb(kind, title, body)); }
export const wrap = (card) => { const w = h('div', { class: 'w' }); card.append(w); return w; };

// Tap-or-drag sorter used by several widgets.
// items: [{id, text, bin}], bins: [{id, label, color}]
export function sorter({ host, items, bins, onPlace, onDone, explain }) {
  const pool = h('div', { class: 'pool', 'aria-label': 'Cards to sort' });
  const binEls = {};
  const binsWrap = h('div', { class: 'bins', style: { '--n': bins.length } });
  let selected = null;
  const placed = {};
  const cards = {};
  items.forEach(it => {
    const c = h('div', { class: 'sortcard', draggable: 'true', tabindex: '0', role: 'button', 'data-id': it.id }, it.text);
    c.addEventListener('click', () => select(it.id));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(it.id); } });
    c.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', it.id); select(it.id, true); });
    cards[it.id] = c; pool.append(c);
  });
  function select(id, force) {
    if (placed[id]) return;
    if (selected === id && !force) { cards[id].classList.remove('sel'); selected = null; binsWrap.querySelectorAll('.bin').forEach(b => b.classList.remove('target')); return; }
    if (selected) cards[selected]?.classList.remove('sel');
    selected = id; cards[id].classList.add('sel');
    binsWrap.querySelectorAll('.bin').forEach(b => b.classList.add('target'));
  }
  bins.forEach(b => {
    const el = h('div', { class: 'bin', tabindex: '0', role: 'button', 'aria-label': 'Place into ' + b.label },
      h('h5', {}, h('i', { style: { background: b.color } }), b.label));
    el.addEventListener('click', () => place(b.id));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') place(b.id); });
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('over'); const id = e.dataTransfer.getData('text/plain'); if (id) { selected = id; place(b.id); } });
    binEls[b.id] = el; binsWrap.append(el);
  });
  function place(binId) {
    if (!selected) return;
    const it = items.find(i => i.id === selected);
    const ok = Array.isArray(it.bin) ? it.bin.includes(binId) : it.bin === binId;
    const c = cards[selected];
    c.classList.remove('sel'); c.classList.add(ok ? 'ok' : 'no'); c.draggable = false;
    if (explain) c.append(h('span', { class: 'exp', html: (ok ? '✓ ' : `✗ Better in “${bins.find(b => b.id === (Array.isArray(it.bin) ? it.bin[0] : it.bin)).label}”. `) + (it.why || '') }));
    binEls[binId].append(c);
    placed[selected] = { bin: binId, ok };
    selected = null;
    binsWrap.querySelectorAll('.bin').forEach(b => b.classList.remove('target'));
    onPlace && onPlace(it, ok);
    if (Object.keys(placed).length === items.length) onDone && onDone(Object.values(placed).filter(p => p.ok).length, items.length);
  }
  host.append(pool, binsWrap);
  return { placed };
}

// Reveal-on-scroll
export function observeCards() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08 });
  document.querySelectorAll('.card').forEach(c => io.observe(c));
}
export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
