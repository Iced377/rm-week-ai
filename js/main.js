import { state, registerTotal, observeCards, resetAll, updateProgress } from './core.js?v=ar-qa-6';
import * as A from './acts1to3.js?v=ar-qa-6';
import * as B from './acts4to6.js?v=ar-qa-6';
import * as C from './acts7to9.js?v=ar-qa-6';
import * as F from './finale.js?v=ar-qa-6';
import { initI18n, getLanguage } from './i18n.js?v=ar-qa-6';

const W = { ...A, ...B, ...C, ...F };

initI18n();

document.querySelectorAll('[data-widget]').forEach(card => {
  const fn = W[card.dataset.widget];
  if (!fn) { console.warn('Missing widget', card.dataset.widget); return; }
  try { fn(card); } catch (e) { console.error('Widget failed:', card.dataset.widget, e); }
  if (card.dataset.id && state.done[card.dataset.id]) card.classList.add('completed');
});

registerTotal(document.querySelectorAll('.card[data-id]').length);
observeCards();

// Active act in the nav
const actNav = document.querySelector('.actnav');
const links = [...document.querySelectorAll('.actnav a')];
let currentAct = null;

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const n = e.target.dataset.act;
    if (currentAct === n) return;
    currentAct = n;
    links.forEach(a => a.classList.toggle('active', a.dataset.act === n));
    const act = links.find(a => a.dataset.act === n);
    if (actNav && act && actNav.scrollWidth > actNav.clientWidth) {
      const targetLeft = act.offsetLeft - (actNav.clientWidth - act.clientWidth) / 2;
      actNav.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('.act').forEach(s => io.observe(s));

// Resume
const resume = document.getElementById('resumeBtn');
if (state.last && Object.keys(state.done).length) {
  resume.hidden = false;
  resume.onclick = () => document.querySelector(`.card[data-id="${state.last}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const rb = document.getElementById('restartBtn');
let armed = false;
rb.onclick = () => {
  if (!armed) { armed = true; rb.textContent = getLanguage() === 'ar' ? 'اضغط مرة أخرى لمسح كل التقدم' : 'Tap again to clear all progress'; setTimeout(() => { armed = false; rb.textContent = getLanguage() === 'ar' ? 'أعد القصة من البداية' : 'Restart the story'; }, 4000); return; }
  resetAll(); window.scrollTo(0, 0); location.reload();
};
updateProgress();
