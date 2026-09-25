/* ============================================================
   cases.js — نمونه‌های درسی شناخته‌شدهٔ تجوید (آزمون رگرسیون)
   هر سطر: [آیه، «کلمه‌ای که در آیه آمده»، «تکه‌ای از همان کلمه»، حکم مورد انتظار]
   حکم null یعنی آن تکه نباید رنگی شود.
   اجرا:  node tajweed-tests/cases.js
   ============================================================ */
const fs = require('fs'), path = require('path');
const T = require(path.join(__dirname, '..', 'public', 'app', 'tajweed.js'));
const names = Object.fromEntries(Object.entries(T.R).map(([k, v]) => [v, k]));

const CASES = [
  // ── مدها ──  (حرف = حرف پایه‌ای که نشانهٔ مد روی آن یا کنار آن است؛ #k یعنی رخداد k‌ام)
  ['2:4',   'بِمَآ',         'ا',   'MADD_JAIZ',   'منفصل (بِمَا أُنزِلَ)'],
  ['2:22',  'وَٱلسَّمَآءَ',   'ا',   'MADD_WAJIB',  'متصل'],
  ['1:7',   'ٱلضَّآلِّينَ',   'ا',   'MADD_LAZIM',  'لازم کلمی مثقل'],
  ['1:7',   'ٱلضَّآلِّينَ',   'ي',   'MADD_JAIZ',   'عارض للسکون (وقف)'],
  ['69:1',  'ٱلْحَآقَّةُ',    'ا',   'MADD_LAZIM',  'لازم'],
  ['6:143', 'ءَآلذَّكَرَيْنِ', 'ا',   'MADD_LAZIM',  'لازم (همزهٔ استفهام + ال)'],
  ['2:1',   'الٓمٓ',         'ل',   'MADD_LAZIM',  'لازم حرفی'],
  ['36:1',  'يسٓ',           'ي',   'MADD_ASLI',   'یا در «یس» طبیعی'],
  ['1:2',   'ٱلْعَٰلَمِينَ',   'ع',   'MADD_ASLI',   'الف خنجری = طبیعی'],
  ['2:3',   'يُؤْمِنُونَ',   'و',   'MADD_ASLI',   'واو مد'],
  ['33:1',  'يَٰٓأَيُّهَا',    'ي',   'MADD_JAIZ',   'یا ندا = منفصل'],
  ['2:5',   'أُو۟لَٰٓئِكَ',    'ل',   'MADD_WAJIB',  'متصل'],
  ['2:5',   'أُو۟لَٰٓئِكَ',    'و',   'SLNT_LETTER', 'واو نخوانده'],
  ['2:255', 'عِندَهُۥٓ',     'ه',   'MADD_JAIZ',   'صلهٔ کبری'],
  ['2:255', 'تَأْخُذُهُۥ',    'ه',   'MADD_ASLI',   'صلهٔ صغری'],
  ['2:255', 'ٱلسَّمَٰوَٰتِ',   'م',   'MADD_ASLI',   'طبیعی'],
  ['114:1', 'ٱلنَّاسِ',      'ا',   'MADD_JAIZ',   'عارض (وقف روی سین)'],
  ['2:255', 'فِى',           'ى',   null,          'یای مد قبل از همزهٔ وصل در وصل حذف می‌شود'],
  // ── نون ساکن و تنوین ──
  ['1:7',   'أَنْعَمْتَ',    'ن',   null,          'اظهار حلقی'],
  ['2:3',   'يُنفِقُونَ',    'ن',   'IKHFA',       'اخفاء'],
  ['2:8',   'مَن',           'ن',   'IDGHAM_GHUNNAH', 'ادغام با غنه'],
  ['2:5',   'مِّن',          'ن',   'IDGHAM_BILA', 'ادغام بدون غنه'],
  ['2:27',  'مِنۢ',          'ن',   'IQLAB',       'اقلاب'],
  ['2:10',  'أَلِيمٌۢ',       'م',   'IQLAB',       'اقلاب با تنوین'],
  ['2:2',   'هُدًۭى',         'د',   'IDGHAM_BILA', 'تنوین + ل'],
  ['2:22',  'فِرَٰشًۭا',      'ش',   'IDGHAM_GHUNNAH', 'تنوین + و'],
  ['2:22',  'رِزْقًۭا',       'ق',   'IDGHAM_BILA', 'تنوین + ل'],
  ['2:85',  'ٱلدُّنْيَا',     'ن',   null,          'اظهار مطلق (در همان کلمه)'],
  // ── میم ساکن ──
  ['2:8',   'هُم',           'م',   'IKHFA_SHAFAWI', 'اخفاء شفوی'],
  ['2:10',  'قُلُوبِهِم',    'م',   'IDGHAM_SHAFAWI', 'ادغام شفوی'],
  ['2:8',   'وَمَا',         'ا',   'MADD_ASLI',   'طبیعی'],
  // ── غنه ──
  ['2:26',  'إِنَّ',         'ن',   'GHUNNAH',     'نون مشدد'],
  ['2:26',  'فَأَمَّا',       'م',   'GHUNNAH',     'میم مشدد'],
  // ── قلقله ──
  ['112:1', 'أَحَدٌ',        'د',   'QALQALAH',    'کبری در وقف'],
  ['112:3', 'يَلِدْ',        'د',   'QALQALAH',    'ساکن'],
  ['111:1', 'وَتَبَّ',       'ب',   'QALQALAH',    'مشدد در وقف'],
  ['2:3',   'رَزَقْنَٰهُمْ',   'ق',   'QALQALAH',    'صغری'],
  ['113:1', 'ٱلْفَلَقِ',     'ق',   'QALQALAH',    'کبری در وقف'],
  // ── حروف نخوانده ──
  ['1:3',   'ٱلرَّحْمَٰنِ',   'ل',   'SLNT_LAM',    'لام شمسی'],
  ['1:3',   'ٱلرَّحْمَٰنِ',   'ٱ',   'SLNT_WASL',   'همزهٔ وصل'],
  ['1:2',   'ٱلْحَمْدُ',     'ل',   null,          'لام قمری خوانده می‌شود'],
  ['2:6',   'كَفَرُوا۟',     'ا',   'SLNT_LETTER', 'الف بعد از واو جمع'],
  // ── ادغام‌های خاص ──
  ['2:256', 'قَد',           'د',   'IDGHAM_MITHLAYN', 'متجانسین (د+ت)'],
  ['2:60',  'ٱضْرِب',        'ب',   'IDGHAM_MITHLAYN', 'متماثلین (ب+ب)'],
  ['11:42', 'ٱرْكَب',        'ب',   'IDGHAM_MITHLAYN', 'متجانسین (ب+م)'],
  ['4:158', 'بَل',           'ل',   'IDGHAM_MITHLAYN', 'متقاربین (ل+ر)'],
  ['83:14', 'بَلْ',          'ل',   null,          'سکتهٔ حفص: ادغام نمی‌شود'],
  ['2:61',  'عَصَوا۟',       'و',   'IDGHAM_MITHLAYN', 'واو ساکن + واو مشدد'],
];

const MARKS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
const strip = (w) => w.replace(/آ/g, 'ا').replace(MARKS, '');

function findAyah(ref) {
  const [s, n] = ref.split(':').map(Number);
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'app', 'data', String(s).padStart(3, '0') + '.json'), 'utf8'));
  return d.ayahs.find((a) => a.n === n).text;
}

let pass = 0, fail = 0;
for (const [ref, word, seg, expect, note] of CASES) {
  const text = findAyah(ref);
  const rules = T.annotate(text);
  const want = strip(word);
  let start = -1, off = 0, token = '';
  for (const tok of text.split(/\s+/)) {
    const idx = text.indexOf(tok, off);
    if (strip(tok) === want) { start = idx; token = tok; break; }
    off = idx + tok.length;
  }
  let got = 'WORD_NOT_FOUND';
  if (start >= 0) {
    // seg = حرف پایهٔ مورد نظر (اولین رخداد) — حکم = حکمی که روی هر نویسه‌ی همان واحد نشسته
    const base = strip(seg);
    const units = T.tokenize(token);
    const u = units.find((x) => strip(x.ch) === base[0] || x.ch === base[0]);
    if (!u) got = 'LETTER_NOT_FOUND';
    else {
      const set = new Set();
      for (let k = start + u.s; k < start + u.e; k++) if (rules[k]) set.add(names[rules[k]]);
      got = set.size === 0 ? null : [...set].join('/');
    }
  }
  const ok = got === expect;
  ok ? pass++ : fail++;
  if (!ok) console.log('✗ ' + ref + ' «' + word + '» [' + seg + '] انتظار=' + expect + ' نتیجه=' + got + '  (' + note + ')');
}
console.log('\nنمونه‌های درسی: ' + pass + ' درست، ' + fail + ' نادرست از ' + CASES.length);
process.exit(fail ? 1 : 0);
