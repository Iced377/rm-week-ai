import { state, registerTotal, observeCards, resetAll, updateProgress } from './core.js?v=ar-qa-9';
import * as A from './acts1to3.js?v=ar-qa-9';
import * as B from './acts4to6.js?v=ar-qa-9';
import * as C from './acts7to9.js?v=ar-qa-9';
import * as F from './finale.js?v=ar-qa-9';
import * as TP from './tone.js?v=ar-qa-9';
import { initI18n, getLanguage } from './i18n.js?v=ar-qa-9';

const W = { ...A, ...B, ...C, ...F, ...TP };

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

// Facilitator cue: at which slide to stop and open each activity.
// [day, stop after slide, 'b' = before the explaining slides / 'a' = after, slides]
const CUES = {
  'a1-split':[1,7,'b','8'],'a1-sort':[1,12,'a','9–12'],'a1-breakeven':[1,13,'b','14'],'a1-bankready':[1,15,'a','15'],
  'a2-builder':[1,18,'b','19–23'],'a2-match':[1,19,'b','20–22'],'a2-lint':[1,24,'a','19–24'],'a2-path':[1,26,'b','27–29'],
  'a3-pattern':[1,45,'b','46–47'],'a3-confidence':[1,45,'b','46–47'],'a3-pushback':[1,49,'a','48–49'],'a3-hunt':[1,50,'a','48–50'],
  'a4-moves':[1,34,'a','34'],'a4-middle':[1,39,'b','40'],'a4-order':[1,43,'a','41–43'],
  'a5-tells':[1,54,'b','55'],'a5-tone':[1,56,'a','56'],'a5-voices':[1,57,'a','57'],'a5-arabic':[1,61,'b','62'],
  'a6-funnel':[1,67,'b','68'],'a6-redact':[1,69,'a','69'],'a6-swipe':[1,73,'a','73'],'a6-advice':[1,72,'a','67 & 72'],
  'a7-scorer':[2,11,'a','10–11'],'a7-narrow':[2,15,'b','16–17'],
  'a8-assemble':[2,21,'b','22–25'],'a8-examples':[2,23,'b','24'],'a8-stress':[2,49,'a','45–49'],
  'a9-case':[2,60,'b','61'],'a9-keep':[2,64,'a','64'],'quiz':[2,73,'a','1–73'],
};
const ar = getLanguage() === 'ar';
for (const [id, [d, s, w, ref]] of Object.entries(CUES)) {
  const card = document.querySelector(`.card[data-id="${id}"]`); if (!card) continue;
  const cue = document.createElement('div'); cue.className = 'cue cue-' + w;
  cue.textContent = ar
    ? `اليوم ${d} · توقّف بعد الشريحة ${s} · ${w === 'b' ? 'النشاط قبل شرح الشرائح' : 'النشاط بعد شرح الشرائح'} ${ref.replace('&','و')}`
    : `Day ${d} · Stop after slide ${s} · Do this ${w === 'b' ? 'BEFORE' : 'AFTER'} slides ${ref}`;
  card.prepend(cue);
}
