// Pre/post assessment API. Storage: Upstash Redis over its REST API (no dependencies).
// Secrets (admin key, class code) are generated on first setup and live only in the database.
const crypto = require('crypto');
const QUESTIONS = require('./_questions.js');

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const MAX_PEOPLE = 300;

async function redis(...cmd) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || `redis ${r.status}`);
  return j.result;
}
const toObj = a => { const o = {}; for (let i = 0; i < (a || []).length; i += 2) o[a[i]] = a[i + 1]; return o; };
const same = (a, b) => { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y); };
const rand = n => crypto.randomBytes(n).toString('base64url');
const cleanName = s => String(s || '').normalize('NFC').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
const publicQs = () => QUESTIONS.map((q, i) => ({ n: i + 1, q: q.q, options: q.options }));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  const send = (code, body) => res.status(code).json(body);
  try {
    if (!URL_ || !TOKEN) return send(503, { error: 'storage_not_connected' });
    const action = String(req.query.action || '');
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const cfg = toObj(await redis('HGETALL', 'asm:cfg'));

    if (action === 'setup' && req.method === 'POST') {
      const admin = rand(24);
      if (!(await redis('HSETNX', 'asm:cfg', 'admin', admin))) return send(409, { error: 'already_set_up' });
      const code = rand(12);
      await redis('HSET', 'asm:cfg', 'code', code, 'open', '1');
      return send(200, { admin, code });
    }
    if (!cfg.admin) return send(409, { error: 'not_set_up' });

    // ---- instructor ----
    if (action === 'results' || action === 'admin') {
      if (!same(req.headers['x-admin-key'], cfg.admin)) return send(401, { error: 'unauthorized' });
      if (action === 'admin' && req.method === 'POST') {
        if (body.do === 'open' || body.do === 'close') await redis('HSET', 'asm:cfg', 'open', body.do === 'open' ? '1' : '0');
        else if (body.do === 'wipe') await redis('DEL', 'asm:pre', 'asm:post');
        else if (body.do === 'newcode') await redis('HSET', 'asm:cfg', 'code', rand(12));
        else return send(400, { error: 'bad_request' });
        return send(200, { ok: true });
      }
      const [pre, post] = await Promise.all([redis('HGETALL', 'asm:pre'), redis('HGETALL', 'asm:post')]);
      const parse = a => Object.fromEntries(Object.entries(toObj(a)).map(([k, v]) => [k, JSON.parse(v)]));
      return send(200, { code: cfg.code, open: cfg.open === '1', questions: QUESTIONS.map((q, i) => ({ n: i + 1, q: q.q, options: q.options, answer: q.answer })), pre: parse(pre), post: parse(post) });
    }

    // ---- participants ----
    if (!same(req.headers['x-class-code'], cfg.code)) return send(401, { error: 'unauthorized' });
    if (cfg.open !== '1') return send(403, { error: 'closed' });
    const phase = (req.query.phase || body.phase) === 'post' ? 'post' : 'pre';

    if (action === 'form' && req.method === 'GET') {
      const out = { phase, questions: publicQs() };
      if (phase === 'post') {
        const [names, done] = await Promise.all([redis('HKEYS', 'asm:pre'), redis('HKEYS', 'asm:post')]);
        out.names = names.filter(n => !done.includes(n)).sort((a, b) => a.localeCompare(b, 'ar'));
      }
      return send(200, out);
    }
    if (action === 'submit' && req.method === 'POST') {
      const name = cleanName(body.name);
      const answers = Array.isArray(body.answers) ? body.answers.slice(0, QUESTIONS.length).map(a => (Number.isInteger(a) && a >= 0 && a < 4 ? a : -1)) : [];
      if (name.length < 2) return send(400, { error: 'name' });
      if (answers.length !== QUESTIONS.length || answers.includes(-1)) return send(400, { error: 'incomplete' });
      if (phase === 'post' && !(await redis('HEXISTS', 'asm:pre', name))) return send(400, { error: 'unknown_name' });
      if ((await redis('HLEN', `asm:${phase}`)) >= MAX_PEOPLE) return send(429, { error: 'full' });
      const wrong = QUESTIONS.map((q, i) => (answers[i] === q.answer ? 0 : i + 1)).filter(Boolean);
      const score = QUESTIONS.length - wrong.length;
      const saved = await redis('HSETNX', `asm:${phase}`, name, JSON.stringify({ answers, score, wrong, ts: Date.now() }));
      if (!saved) return send(409, { error: 'duplicate' });
      return send(200, phase === 'post' ? { ok: true, score, total: QUESTIONS.length } : { ok: true });
    }
    return send(400, { error: 'bad_request' });
  } catch (e) {
    console.error(e);
    return send(500, { error: 'server' });
  }
};
