/* ============================================================
   verify.js — آزمون اعتبارسنجی موتور تجوید روی کل قرآن
   اجرا:   node tajweed-tests/verify.js
   این آزمون سه کار می‌کند:
   ۱) موتور را روی هر ۶۲۳۶ آیه اجرا می‌کند و آمار حکم‌ها را می‌دهد.
   ۲) حکم نون ساکن/تنوین/میم ساکن را که موتور «خودش از روی حرف بعدی» ساخته
      با علامت‌های رسم‌الخط عثمانی مقایسه می‌کند (اظهار = «ْ»، ادغام/اخفاء = بدون
      علامت یا «ۭ»، اقلاب = «ۢ»). هر اختلافی چاپ می‌شود.
   ۳) سازگاری مدها با علامت «ٓ» و حرف‌های بدون توضیح را گزارش می‌کند.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const T = require(path.join(__dirname, '..', 'public', 'app', 'tajweed.js'));
const { R, _internals: I } = T;
const NAMES = Object.fromEntries(Object.entries(R).map(([k, v]) => [v, k]));

const dataDir = path.join(__dirname, '..', 'public', 'app', 'data');
const ayahs = [];
for (let s = 1; s <= 114; s++) {
  const d = JSON.parse(fs.readFileSync(path.join(dataDir, String(s).padStart(3, '0') + '.json'), 'utf8'));
  for (const a of d.ayahs) ayahs.push({ s, n: a.n, text: a.text });
}
console.log('تعداد آیات:', ayahs.length);

/* ── ۱) آمار ── */
const stats = {};
let fawatihCount = 0;
const t0 = Date.now();
for (const a of ayahs) {
  const res = T.analyze(a.text);
  if (res.fawatih) fawatihCount++;
  const rules = T.annotate(a.text);
  // یک حکم را وقتی یک‌بار می‌شماریم که شروع یک بازهٔ پیوسته باشد
  let prev = 0;
  for (let k = 0; k < rules.length; k++) {
    if (rules[k] && rules[k] !== prev) stats[rules[k]] = (stats[rules[k]] || 0) + 1;
    prev = rules[k];
  }
}
console.log('زمان تحلیل کل قرآن: ' + (Date.now() - t0) + ' ms | آیات حروف مقطعه: ' + fawatihCount);
console.log('\nآمار حکم‌ها (تعداد بازه‌های رنگی):');
for (const [id, c] of Object.entries(stats).sort((x, y) => y[1] - x[1])) console.log('  ' + NAMES[id].padEnd(18), c);

/* ── ۲) تطبیق با علامت‌های رسم‌الخط ── */
const mism = { noon: [], tan: [], meem: [] };
const agree = { noon: 0, tan: 0, meem: 0 };
const show = (a, u) => a.s + ':' + a.n + ' «' + a.text.slice(Math.max(0, u.s - 6), u.e + 10) + '»';
for (const a of ayahs) {
  const P = T.tokenize(a.text);
  if (!P.some((u) => u.v)) continue; // حروف مقطعه
  for (let i = 0; i < P.length; i++) {
    const u = P[i];
    if (I.isSakinNoon(u)) {
      const nx = I.nextPron(P, i);
      if (nx < 0) continue; // وقف یا همزهٔ وصل
      const res = I.noonTanweenRule(P, i);
      let ok;
      if (u.suk) ok = !res;                                  // «ْ» ⇒ اظهار
      else if (u.hm) ok = !!res && res.rule === R.IQLAB;     // «ۢ» ⇒ اقلاب
      else ok = !!res && res.rule !== R.IQLAB;               // بدون علامت ⇒ ادغام/اخفاء
      if (ok) agree.noon++; else mism.noon.push(show(a, u) + ' engine=' + (res ? NAMES[res.rule] : 'izhar') + ' mark=' + (u.suk ? 'sukun' : u.hm ? 'iqlab' : 'bare'));
    } else if (I.isTanween(u)) {
      const nx = I.nextPron(P, i);
      if (nx < 0) continue;
      const res = I.noonTanweenRule(P, i);
      /* رمزگذاری میم کوچک روی تنوین: برای فتحتین/ضمتین «ۢ» = اقلاب و «ۭ» = ادغام/اخفاء؛
         برای کسرتین برعکس («ۭ» = اقلاب، «ۢ» = ادغام/اخفاء) */
      let expect;
      if (!u.hm && !u.lm) expect = 'izhar';
      else if (u.v === 'in') expect = u.lm ? 'iqlab' : 'hide';
      else expect = u.hm ? 'iqlab' : 'hide';
      const eng = !res ? 'izhar' : res.rule === R.IQLAB ? 'iqlab' : 'hide';
      if (eng === expect) agree.tan++; else mism.tan.push(show(a, u) + ' engine=' + eng + ' mark=' + expect);
    } else if (I.isSakinMeem(u)) {
      const nx = I.nextPron(P, i);
      if (nx < 0) continue;
      const n = P[nx];
      const engineRule = n.ch === 'ب' ? 'ikhfa' : n.ch === 'م' ? 'idgham' : 'izhar';
      const markOk = u.suk ? engineRule === 'izhar' : engineRule !== 'izhar';
      if (markOk) agree.meem++; else mism.meem.push(show(a, u) + ' engine=' + engineRule + ' mark=' + (u.suk ? 'sukun' : 'bare'));
    }
  }
}
console.log('\n── تطبیق با علامت‌های رسم‌الخط عثمانی ──');
for (const k of ['noon', 'tan', 'meem']) {
  console.log('  ' + k.padEnd(5) + ' هم‌خوان: ' + String(agree[k]).padEnd(6) + ' ناهم‌خوان: ' + mism[k].length);
  mism[k].slice(0, 8).forEach((m) => console.log('      ✗ ' + m));
}

/* ── ۳) مدها ── */
let maddahClassified = 0, unclassified = [], maddahNoKind = [], noMaddahButExtended = [];
for (const a of ayahs) {
  const P = T.tokenize(a.text);
  if (!P.some((u) => u.v)) continue;
  const res = T.analyze(a.text);
  for (const t of res.trace) if (t.why === 'madd-extended-unclassified') unclassified.push(a.s + ':' + a.n);
  for (let i = 0; i < P.length; i++) {
    const u = P[i];
    const mk = I.maddKind(P, i);
    if (u.mad && !mk && P.some((x) => x.w === u.w && x.v)) maddahNoKind.push(a.s + ':' + a.n + ' «' + a.text.slice(Math.max(0, u.s - 4), u.e + 6) + '»');
    if (u.mad && mk) maddahClassified++;
    if (mk && !u.mad && !(u.hz && u.dag)) {
      const nx = I.nextPron(P, i);
      if (nx >= 0) {
        const n = P[nx];
        if ((n.w === u.w && (I.isHamza(n) || n.shd || n.suk)) || (n.w !== u.w && I.isHamza(n))) {
          noMaddahButExtended.push(a.s + ':' + a.n + ' «' + a.text.slice(Math.max(0, u.s - 5), u.e + 8) + '»');
        }
      }
    }
  }
}
console.log('\n── مدها ──');
console.log('  حرف مد با علامت ٓ (دسته‌بندی‌شده):', maddahClassified);
console.log('  علامت ٓ روی چیزی که حرف مد نیست:', maddahNoKind.length); maddahNoKind.slice(0, 10).forEach((m) => console.log('      ? ' + m));
console.log('  مد کشیده ولی دسته‌بندی‌نشده:', unclassified.length); unclassified.slice(0, 10).forEach((m) => console.log('      ? ' + m));
console.log('  حرف مد بدون ٓ که بعدش همزه/تشدید/سکون آمده:', noMaddahButExtended.length); noMaddahButExtended.slice(0, 15).forEach((m) => console.log('      ? ' + m));

/* ── ۴) حرف‌های بدون علامت که هیچ حکمی برایشان تعریف نشده ── */
const unexplained = {};
const exUnexp = {};
for (const a of ayahs) {
  const P = T.tokenize(a.text);
  if (!P.some((u) => u.v)) continue;
  const rules = T.annotate(a.text);
  for (let i = 0; i < P.length; i++) {
    const u = P[i];
    if (!I.noMarks(u)) continue;
    if (rules[u.s]) continue;
    if (u.ch === 'ـ') continue;
    // حرف بی‌علامتی که هیچ توضیحی ندارد
    if (I.isIwad(P, i)) continue;
    if (I.maddKind(P, i)) continue;
    if (u.ch === 'ى' && i > 0 && P[i - 1].v === 'a') continue; // ألفِ مقصورهٔ بی‌نشانه (قبل از همزهٔ وصل حذف می‌شود)
    if (i === I.lastPron(P)) continue;                          // آخرین حرف آیه (ساکن در وقف)
    // نون/میم ساکن اظهاری بدون علامت ولی بدون حکم (مثلاً قبل از همزهٔ وصل) را جدا می‌شماریم
    const key = u.ch;
    unexplained[key] = (unexplained[key] || 0) + 1;
    (exUnexp[key] = exUnexp[key] || []).length < 4 && exUnexp[key].push(a.s + ':' + a.n + ' «' + a.text.slice(Math.max(0, u.s - 6), u.e + 8) + '»');
  }
}
console.log('\n── حرف‌های بی‌علامتی که موتور حکمی برایشان ندارد ──');
for (const [k, c] of Object.entries(unexplained).sort((x, y) => y[1] - x[1])) {
  console.log('  ' + k + ' : ' + c);
  exUnexp[k].forEach((m) => console.log('      ' + m));
}
