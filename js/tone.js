// Two copyable prompts for building a "my-tone" Skill in Claude. Rendered in the reader's language; never auto-translated.
import { h, complete } from './core.js?v=ar-qa-9';
import { getLanguage } from './i18n.js?v=ar-qa-9';

const T = {
  en: {
    mech: 'Copy · paste into your own Claude',
    title: 'Teach Claude your voice: two prompts to copy',
    intro: 'Each prompt asks Claude to build a reusable Skill called my-tone, so every message it drafts for you starts in your voice. Use the first if you have emails you wrote yourself; use the second if you would rather be interviewed.',
    copy: 'Copy prompt', copied: 'Copied',
    prompts: [
      { title: 'Method 1: from five messages you wrote', note: 'Attach the five emails together with this prompt. Ideally they were written to different people, so your style shows clearly.', text:
`I want to create a Skill called my-tone that reflects my tone and writing style, to be used whenever you write a message or email in my name.

I have attached five emails that I wrote myself. Follow these steps in order:

1. Read the five emails and analyse my style in terms of: level of formality, length of sentences and paragraphs, how I open and close, words and phrases I repeat, level of warmth and directness, punctuation and emojis, and the language I use (formal Arabic, colloquial, or mixed with English).

2. Give me a clear, concise description of my tone, and support each observation with an example quoted from my emails.

3. Write a short sample message in this tone so I can see the result in practice.

4. Ask me: is this the tone I want to adopt? What would I like to change, add or remove?

5. Do not create the Skill until I confirm my approval. Once I approve, create the Skill including: the tone description, clear rules (do / don't), and examples from my writing.` },
      { title: 'Method 2: through questions', note: 'No samples needed. Answer one question at a time, and give an example whenever Claude asks for one.', text:
`I want to create a Skill called my-tone that reflects the tone I want to write in, to be used whenever you write a message or email in my name.

I don't have ready samples, so I want you to interview me briefly to learn my tone. Follow these steps:

1. Ask me the questions one at a time, and wait for my answer before moving to the next question. Cover the following areas:
   - My work: my field, my role, and the nature of what I offer.
   - My clients: who they are, their sectors, their positions, their approximate ages, and the nature of my relationship with them.
   - What I usually write: emails, WhatsApp messages, price quotes, posts, or other.
   - The impression I want to leave on the reader (for example: expert, friendly, firm, approachable).
   - Level of formality and language: formal Arabic, colloquial, or mixed with English.
   - My preferred way of greeting and signing off.
   - Message length: short and direct, or detailed.
   - Words or phrases I like to use, and others I want to avoid completely.
   - Use of emojis and exclamation marks.

2. If any of my answers is general or unclear, ask me for an example.

3. When the questions are done, summarise my tone in a clear, concise description, and write a short sample message to one of my clients in this tone.

4. Ask me: is this the tone I want to adopt? What would I like to change?

5. Do not create the Skill until I confirm my approval. Once I approve, create the Skill including: the tone description, clear rules (do / don't), and illustrative examples.` },
    ],
    privacy: 'Privacy: remove client names and any sensitive data from your messages before you upload them.',
  },
  ar: {
    mech: 'انسخ · والصق في Claude الخاص بك',
    title: 'علّم Claude نبرتك: أمران نصيّان جاهزان للنسخ',
    intro: 'يطلب كل أمر نصي من Claude إنشاء مهارة (Skill) باسم my-tone، لتبدأ كل رسالة يكتبها لك بنبرتك أنت. استخدم الطريقة الأولى إن كانت لديك رسائل كتبتها بنفسك، والثانية إن كنت تفضّل أن يجري معك مقابلة قصيرة.',
    copy: 'انسخ الأمر النصي', copied: 'تم النسخ',
    prompts: [
      { title: 'الطريقة الأولى: من خمس رسائل كتبتها', note: 'أرفق الرسائل الخمس مع النص نفسه، ويُفضَّل أن تكون موجّهة إلى أشخاص مختلفين حتى يظهر الأسلوب بوضوح.', text:
`أريد إنشاء مهارة (Skill) باسم my-tone تعكس نبرتي وأسلوبي في الكتابة، لتستخدمها كلما كتبت رسالة أو بريداً إلكترونياً باسمي.

أرفقت لك خمس رسائل بريد إلكتروني كتبتها بنفسي. اتبع الخطوات التالية بالترتيب:

1. اقرأ الرسائل الخمس وحلّل أسلوبي من حيث: درجة الرسمية، طول الجمل والفقرات، طريقة الافتتاح والختام، الكلمات والعبارات التي أكررها، مستوى الدفء والمباشرة، علامات الترقيم والرموز التعبيرية، واللغة المستخدمة (فصحى، عامية، أو مزيج مع الإنجليزية).

2. اعرض عليّ وصفاً واضحاً ومختصراً لنبرتي، وادعم كل ملاحظة بمثال مقتبس من رسائلي.

3. اكتب رسالة قصيرة تجريبية بهذه النبرة حتى أرى النتيجة عملياً.

4. اسألني: هل هذه هي النبرة التي أريد اعتمادها؟ وما الذي أريد تعديله أو إضافته أو حذفه؟

5. لا تنشئ المهارة قبل أن أؤكد موافقتي. بعد الموافقة، أنشئ المهارة متضمنةً: وصف النبرة، قواعد واضحة (افعل / لا تفعل)، وأمثلة من أسلوبي.` },
      { title: 'الطريقة الثانية: من خلال الأسئلة', note: 'لا تحتاج إلى نماذج. أجب عن سؤال واحد في كل مرة، وقدّم مثالاً كلما طلب منك Claude ذلك.', text:
`أريد إنشاء مهارة (Skill) باسم my-tone تعكس النبرة التي أريد أن أكتب بها، لتستخدمها كلما كتبت رسالة أو بريداً إلكترونياً باسمي.

ليست لديّ نماذج جاهزة، لذا أريدك أن تجري معي مقابلة قصيرة لتتعرف على نبرتي. اتبع الخطوات التالية:

1. اطرح عليّ الأسئلة واحداً تلو الآخر، وانتظر إجابتي قبل الانتقال إلى السؤال التالي. غطِّ المحاور الآتية:
   - عملي: مجالي، منصبي، وطبيعة ما أقدّمه.
   - عملائي: من هم، قطاعاتهم، مناصبهم، أعمارهم التقريبية، وطبيعة علاقتي بهم.
   - ما أكتبه غالباً: بريد إلكتروني، واتساب، عروض أسعار، منشورات، أو غير ذلك.
   - الانطباع الذي أريد أن أتركه لدى القارئ (مثل: خبير، ودود، حازم، قريب).
   - درجة الرسمية واللغة: فصحى، عامية، أو مزيج مع الإنجليزية.
   - طريقتي المفضلة في التحية والختام.
   - طول الرسائل: مختصرة ومباشرة أم مفصّلة.
   - كلمات أو عبارات أحب استخدامها، وأخرى أريد تجنّبها تماماً.
   - استخدام الرموز التعبيرية وعلامات التعجب.

2. إذا كانت إحدى إجاباتي عامة أو غير واضحة، اطلب مني مثالاً.

3. بعد انتهاء الأسئلة، لخّص نبرتي في وصف واضح ومختصر، واكتب رسالة قصيرة تجريبية موجّهة إلى أحد عملائي بهذه النبرة.

4. اسألني: هل هذه هي النبرة التي أريد اعتمادها؟ وما الذي أريد تعديله؟

5. لا تنشئ المهارة قبل أن أؤكد موافقتي. بعد الموافقة، أنشئ المهارة متضمنةً: وصف النبرة، قواعد واضحة (افعل / لا تفعل)، وأمثلة توضيحية.` },
    ],
    privacy: 'الخصوصية: احذف أسماء العملاء وأي بيانات حساسة من الرسائل قبل رفعها.',
  },
};

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  const ta = h('textarea', { style: { position: 'fixed', opacity: '0' } }, text); document.body.append(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch {} ta.remove(); return ok;
}

export function tonePrompts(card) {
  const L = getLanguage() === 'ar' ? T.ar : T.en;
  card.setAttribute('data-noi18n', '');
  card.replaceChildren(h('p', { class: 'mech' }, L.mech), h('h3', {}, L.title), h('p', {}, L.intro));
  L.prompts.forEach((p, i) => {
    const btn = h('button', { class: 'btn', type: 'button' }, L.copy);
    btn.addEventListener('click', async () => {
      if (await copyText(p.text)) { btn.textContent = '✓ ' + L.copied; setTimeout(() => { btn.textContent = L.copy; }, 2500); complete(card.dataset.id, { copied: i + 1 }); }
    });
    card.append(h('div', { class: 'tone-prompt' },
      h('div', { class: 'tone-head' }, h('h4', {}, p.title), btn),
      h('pre', { class: 'tone-text', tabindex: '0' }, p.text),
      h('p', { class: 'muted' }, p.note)));
  });
  card.append(h('p', { class: 'muted tone-privacy' }, L.privacy));
}
