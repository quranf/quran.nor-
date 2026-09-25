(function () {
  'use strict';

  /* بارگذاری تنبل اسکریپت خارجی
     امنیت: فقط https و فقط از میزبان‌های فهرست سفید (همان‌هایی که CSP هم اجازه می‌دهد). */
  const ALLOWED_SCRIPT_HOSTS = ['www.gstatic.com'];
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      let u;
      try { u = new URL(src, location.href); } catch { reject(new Error('bad script url')); return; }
      if (u.protocol !== 'https:' || !ALLOWED_SCRIPT_HOSTS.includes(u.hostname)) {
        reject(new Error('script host not allowed')); return;
      }
      if ([...document.scripts].some(el => el.src === u.href)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = u.href;
      s.async = true;
      s.referrerPolicy = 'strict-origin-when-cross-origin';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('fail ' + src));
      document.head.appendChild(s);
    });
  }
  /* ══════════════════════════════════════════════════════════════
     ⚙️  کانفیگ Firebase – برای فعال‌سازی همگام‌سازی ابری این آبجکت را پر کنید
     از کنسول Firebase → Project settings → Your apps → Web app
     بعد از پر کردن، صفحه را رفرش کنید. اگر خالی بماند، حالت لوکال قبلی فعال می‌ماند.
  ══════════════════════════════════════════════════════════════ */
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBV9DuRqh_TAwtBJaSMpgr7RcVQJJpmJjI",
    authDomain: "quran-noor-7d777.firebaseapp.com",
    projectId: "quran-noor-7d777",
    storageBucket: "quran-noor-7d777.firebasestorage.app",
    messagingSenderId: "493185600361",
    appId: "1:493185600361:web:e2d146a924cf7142ef0bf8"
  };

  /* ── Constants ── */
  const META = [
    {n:1,ar:'الفاتحة',fa:'فاتحه',a:7,t:'M'},{n:2,ar:'البقرة',fa:'بقره',a:286,t:'D'},{n:3,ar:'آل عمران',fa:'آل عمران',a:200,t:'D'},
    {n:4,ar:'النساء',fa:'نساء',a:176,t:'D'},{n:5,ar:'المائدة',fa:'مائده',a:120,t:'D'},{n:6,ar:'الأنعام',fa:'انعام',a:165,t:'M'},
    {n:7,ar:'الأعراف',fa:'اعراف',a:206,t:'M'},{n:8,ar:'الأنفال',fa:'انفال',a:75,t:'D'},{n:9,ar:'التوبة',fa:'توبه',a:129,t:'D'},
    {n:10,ar:'یونس',fa:'یونس',a:109,t:'M'},{n:11,ar:'هود',fa:'هود',a:123,t:'M'},{n:12,ar:'یوسف',fa:'یوسف',a:111,t:'M'},
    {n:13,ar:'الرعد',fa:'رعد',a:43,t:'D'},{n:14,ar:'ابراهیم',fa:'ابراهیم',a:52,t:'M'},{n:15,ar:'الحجر',fa:'حجر',a:99,t:'M'},
    {n:16,ar:'النحل',fa:'نحل',a:128,t:'M'},{n:17,ar:'الإسراء',fa:'اسراء',a:111,t:'M'},{n:18,ar:'الکهف',fa:'کهف',a:110,t:'M'},
    {n:19,ar:'مریم',fa:'مریم',a:98,t:'M'},{n:20,ar:'طه',fa:'طه',a:135,t:'M'},{n:21,ar:'الأنبیاء',fa:'انبیاء',a:112,t:'M'},
    {n:22,ar:'الحج',fa:'حج',a:78,t:'D'},{n:23,ar:'المؤمنون',fa:'مؤمنون',a:118,t:'M'},{n:24,ar:'النور',fa:'نور',a:64,t:'D'},
    {n:25,ar:'الفرقان',fa:'فرقان',a:77,t:'M'},{n:26,ar:'الشعراء',fa:'شعراء',a:227,t:'M'},{n:27,ar:'النمل',fa:'نمل',a:93,t:'M'},
    {n:28,ar:'القصص',fa:'قصص',a:88,t:'M'},{n:29,ar:'العنکبوت',fa:'عنکبوت',a:69,t:'M'},{n:30,ar:'الروم',fa:'روم',a:60,t:'M'},
    {n:31,ar:'لقمان',fa:'لقمان',a:34,t:'M'},{n:32,ar:'السجدة',fa:'سجده',a:30,t:'M'},{n:33,ar:'الأحزاب',fa:'احزاب',a:73,t:'D'},
    {n:34,ar:'سبأ',fa:'سبأ',a:54,t:'M'},{n:35,ar:'فاطر',fa:'فاطر',a:45,t:'M'},{n:36,ar:'یس',fa:'یس',a:83,t:'M'},
    {n:37,ar:'الصافات',fa:'صافات',a:182,t:'M'},{n:38,ar:'ص',fa:'ص',a:88,t:'M'},{n:39,ar:'الزمر',fa:'زمر',a:75,t:'M'},
    {n:40,ar:'غافر',fa:'غافر',a:85,t:'M'},{n:41,ar:'فصلت',fa:'فصلت',a:54,t:'M'},{n:42,ar:'الشوری',fa:'شوری',a:53,t:'M'},
    {n:43,ar:'الزخرف',fa:'زخرف',a:89,t:'M'},{n:44,ar:'الدخان',fa:'دخان',a:59,t:'M'},{n:45,ar:'الجاثیة',fa:'جاثیه',a:37,t:'M'},
    {n:46,ar:'الأحقاف',fa:'احقاف',a:35,t:'M'},{n:47,ar:'محمد',fa:'محمد',a:38,t:'D'},{n:48,ar:'الفتح',fa:'فتح',a:29,t:'D'},
    {n:49,ar:'الحجرات',fa:'حجرات',a:18,t:'D'},{n:50,ar:'ق',fa:'ق',a:45,t:'M'},{n:51,ar:'الذاریات',fa:'ذاریات',a:60,t:'M'},
    {n:52,ar:'الطور',fa:'طور',a:49,t:'M'},{n:53,ar:'النجم',fa:'نجم',a:62,t:'M'},{n:54,ar:'القمر',fa:'قمر',a:55,t:'M'},
    {n:55,ar:'الرحمن',fa:'الرحمن',a:78,t:'M'},{n:56,ar:'الواقعة',fa:'واقعه',a:96,t:'M'},{n:57,ar:'الحدید',fa:'حدید',a:29,t:'D'},
    {n:58,ar:'المجادلة',fa:'مجادله',a:22,t:'D'},{n:59,ar:'الحشر',fa:'حشر',a:24,t:'D'},{n:60,ar:'الممتحنة',fa:'ممتحنه',a:13,t:'D'},
    {n:61,ar:'الصف',fa:'صف',a:14,t:'D'},{n:62,ar:'الجمعة',fa:'جمعه',a:11,t:'D'},{n:63,ar:'المنافقون',fa:'منافقون',a:11,t:'D'},
    {n:64,ar:'التغابن',fa:'تغابن',a:18,t:'D'},{n:65,ar:'الطلاق',fa:'طلاق',a:12,t:'D'},{n:66,ar:'التحریم',fa:'تحریم',a:12,t:'D'},
    {n:67,ar:'الملک',fa:'ملک',a:30,t:'M'},{n:68,ar:'القلم',fa:'قلم',a:52,t:'M'},{n:69,ar:'الحاقة',fa:'حاقه',a:52,t:'M'},
    {n:70,ar:'المعارج',fa:'معارج',a:44,t:'M'},{n:71,ar:'نوح',fa:'نوح',a:28,t:'M'},{n:72,ar:'الجن',fa:'جن',a:28,t:'M'},
    {n:73,ar:'المزمل',fa:'مزمل',a:20,t:'M'},{n:74,ar:'المدثر',fa:'مدثر',a:56,t:'M'},{n:75,ar:'القیامة',fa:'قیامه',a:40,t:'M'},
    {n:76,ar:'الإنسان',fa:'انسان',a:31,t:'D'},{n:77,ar:'المرسلات',fa:'مرسلات',a:50,t:'M'},{n:78,ar:'النبأ',fa:'نبأ',a:40,t:'M'},
    {n:79,ar:'النازعات',fa:'نازعات',a:46,t:'M'},{n:80,ar:'عبس',fa:'عبس',a:42,t:'M'},{n:81,ar:'التکویر',fa:'تکویر',a:29,t:'M'},
    {n:82,ar:'الانفطار',fa:'انفطار',a:19,t:'M'},{n:83,ar:'المطففین',fa:'مطففین',a:36,t:'M'},{n:84,ar:'الانشقاق',fa:'انشقاق',a:25,t:'M'},
    {n:85,ar:'البروج',fa:'بروج',a:22,t:'M'},{n:86,ar:'الطارق',fa:'طارق',a:17,t:'M'},{n:87,ar:'الأعلی',fa:'اعلی',a:19,t:'M'},
    {n:88,ar:'الغاشیة',fa:'غاشیه',a:26,t:'M'},{n:89,ar:'الفجر',fa:'فجر',a:30,t:'M'},{n:90,ar:'البلد',fa:'بلد',a:20,t:'M'},
    {n:91,ar:'الشمس',fa:'شمس',a:15,t:'M'},{n:92,ar:'اللیل',fa:'لیل',a:21,t:'M'},{n:93,ar:'الضحی',fa:'ضحی',a:11,t:'M'},
    {n:94,ar:'الشرح',fa:'شرح',a:8,t:'M'},{n:95,ar:'التین',fa:'تین',a:8,t:'M'},{n:96,ar:'العلق',fa:'علق',a:19,t:'M'},
    {n:97,ar:'القدر',fa:'قدر',a:5,t:'M'},{n:98,ar:'البینة',fa:'بینه',a:8,t:'D'},{n:99,ar:'الزلزلة',fa:'زلزله',a:8,t:'D'},
    {n:100,ar:'العادیات',fa:'عادیات',a:11,t:'M'},{n:101,ar:'القارعة',fa:'قارعه',a:11,t:'M'},{n:102,ar:'التکاثر',fa:'تکاثر',a:8,t:'M'},
    {n:103,ar:'العصر',fa:'عصر',a:3,t:'M'},{n:104,ar:'الهمزة',fa:'همزه',a:9,t:'M'},{n:105,ar:'الفیل',fa:'فیل',a:5,t:'M'},
    {n:106,ar:'قریش',fa:'قریش',a:4,t:'M'},{n:107,ar:'الماعون',fa:'ماعون',a:7,t:'M'},{n:108,ar:'الکوثر',fa:'کوثر',a:3,t:'M'},
    {n:109,ar:'الکافرون',fa:'کافرون',a:6,t:'M'},{n:110,ar:'النصر',fa:'نصر',a:3,t:'D'},{n:111,ar:'المسد',fa:'مسد',a:5,t:'M'},
    {n:112,ar:'الإخلاص',fa:'اخلاص',a:4,t:'M'},{n:113,ar:'الفلق',fa:'فلق',a:5,t:'M'},{n:114,ar:'الناس',fa:'ناس',a:6,t:'M'}
  ];

  /* ── ایندکس جستجوی سریع سوره‌ها (یک‌بار در بارگذاری ساخته می‌شود) ── */
  const SURAH_ALIASES = {
    1: ['فاتحه','فاتحه الکتاب','ام الکتاب','الحمد','افتتاح'],
    2: ['بقره','البقره'],
    3: ['ال عمران','آل عمران','عمران'],
    4: ['نساء','النساء'],
    5: ['مائده','المائده'],
    6: ['انعام','الانعام'],
    7: ['اعراف','الاعراف'],
    8: ['انفال','الانفال'],
    9: ['توبه','التوبه','برائت'],
    10: ['یونس','يونس'],
    12: ['یوسف','يوسف'],
    13: ['رعد'],
    14: ['ابراهیم','ابراهيم'],
    15: ['حجر'],
    16: ['نحل'],
    17: ['اسراء','اسرا','بنی اسرائیل'],
    18: ['کهف','الكهف'],
    19: ['مریم','مريم'],
    20: ['طه'],
    21: ['انبیاء','انبیا'],
    22: ['حج'],
    23: ['مؤمنون','مومنون'],
    24: ['نور'],
    25: ['فرقان'],
    26: ['شعراء'],
    27: ['نمل'],
    28: ['قصص'],
    29: ['عنکبوت','عنكبوت'],
    30: ['روم'],
    31: ['لقمان'],
    32: ['سجده'],
    33: ['احزاب'],
    34: ['سبا','سبأ'],
    35: ['فاطر','ملائکه'],
    36: ['یاسین','ياسين','یسین','يس'],
    37: ['صافات'],
    38: ['ص'],
    39: ['زمر'],
    40: ['غافر','مؤمن','مومن'],
    41: ['فصلت','حم سجده'],
    42: ['شوری','شورا'],
    43: ['زخرف'],
    44: ['دخان'],
    45: ['جاثیه'],
    46: ['احقاف'],
    47: ['محمد'],
    48: ['فتح'],
    49: ['حجرات'],
    50: ['ق'],
    51: ['ذاریات'],
    52: ['طور'],
    53: ['نجم'],
    54: ['قمر'],
    55: ['رحمن','الرحمن'],
    56: ['واقعه','الواقعه'],
    57: ['حدید'],
    58: ['مجادله'],
    59: ['حشر'],
    60: ['ممتحنه'],
    61: ['صف'],
    62: ['جمعه'],
    63: ['منافقون'],
    64: ['تغابن'],
    65: ['طلاق'],
    66: ['تحریم'],
    67: ['ملک','تبارک','الملک'],
    68: ['قلم'],
    69: ['حاقه'],
    70: ['معارج'],
    71: ['نوح'],
    72: ['جن'],
    73: ['مزمل'],
    74: ['مدثر'],
    75: ['قیامه','قیامت'],
    76: ['انسان','دهر'],
    77: ['مرسلات'],
    78: ['نباء','نبا','عم'],
    79: ['نازعات'],
    80: ['عبس'],
    81: ['تکویر'],
    82: ['انفطار'],
    83: ['مطففین'],
    84: ['انشقاق'],
    85: ['بروج'],
    86: ['طارق'],
    87: ['اعلی','الاعلی'],
    88: ['غاشیه'],
    89: ['فجر'],
    90: ['بلد'],
    91: ['شمس'],
    92: ['لیل'],
    93: ['ضحی'],
    94: ['شرح','انشراح'],
    95: ['تین'],
    96: ['علق','اقرأ','اقرا'],
    97: ['قدر'],
    98: ['بینه'],
    99: ['زلزله','زلزال'],
    100: ['عادیات'],
    101: ['قارعه'],
    102: ['تکاثر'],
    103: ['عصر'],
    104: ['همزه'],
    105: ['فیل'],
    106: ['قریش'],
    107: ['ماعون'],
    108: ['کوثر'],
    109: ['کافرون','كافرون'],
    110: ['نصر'],
    111: ['مسد','تبت','لهب'],
    112: ['توحید','اخلاص','قل هو','الإخلاص'],
    113: ['فلق','الفلق'],
    114: ['ناس','الناس']
  };

  /* میانبر آیات مشهور */
  const FAMOUS_AYAH_QUERIES = [
    { keys: ['آیه الکرسی', 'آیت الکرسی', 'ایه الکرسی', 'آیة الکرسی', 'kursi'], s: 2, a: 255 },
    { keys: ['آیه نور', 'آیت نور'], s: 24, a: 35 },
    { keys: ['آیه ملک', 'تبارک الذی'], s: 67, a: 1 },
    { keys: ['بسم الله', 'بسم‌الله', 'بسمله'], s: 1, a: 1 }
  ];
  // nEast بعد از تعریف toEastern پر می‌شود
  const SURAH_INDEX = META.map(s => {
    const arNorm = (s.ar || '').toLowerCase()
      .replace(/ي/g, 'ی').replace(/ك/g, 'ک')
      .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ی');
    const faNorm = (s.fa || '').toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    const aliases = (SURAH_ALIASES[s.n] || []).map(a =>
      a.toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک')
    );
    return {
      s,
      nStr: String(s.n),
      nEast: '',
      arNorm,
      faNorm,
      aliases,
      type: s.t === 'M' ? 'مکی' : 'مدنی',
      searchBlob: [arNorm, faNorm, ...aliases].join(' ')
    };
  });

  const EASTERN = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const BASMALA = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  // همان بسم‌الله با «ٱ» (همزهٔ وصل) تا موتور تجوید لام شمسی و همزهٔ وصل را تشخیص دهد
  const BASMALA_TJ = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
  const USERS_KEY = 'quran_users_v1';
  const CURRENT_USER_KEY = 'quran_current_user_v1';

  /* Storage keys become user-scoped when logged in (like multi-account support) */
  function storageKeyFor(base, email) {
    return email ? base + '__' + String(email).toLowerCase().replace(/[^a-z0-9@._-]/g, '_') : base;
  }
  function getStorageKey(base) { return storageKeyFor(base, currentUserEmail); }
  const STORAGE_KEY_BASE = 'quran_bookmarks_v2';
  const LAST_READ_KEY_BASE = 'quran_last_read_v2';
  const PREFS_KEY_BASE = 'quran_prefs_v3';
  const READ_HISTORY_KEY_BASE = 'quran_read_history_v1';
  function STORAGE_KEY() { return getStorageKey(STORAGE_KEY_BASE); }
  function LAST_READ_KEY() { return getStorageKey(LAST_READ_KEY_BASE); }
  function PREFS_KEY() { return getStorageKey(PREFS_KEY_BASE); }
  function READ_HISTORY_KEY() { return getStorageKey(READ_HISTORY_KEY_BASE); }

  const JUZ = [
    [1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],
    [7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],[18,75],
    [21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],
    [41,47],[46,1],[51,31],[58,1],[67,1],[78,1]
  ];

  /* ── Helpers ── */
  const $ = id => document.getElementById(id);
  const toEastern = n => String(n).replace(/\d/g, d => EASTERN[+d]);
  // تکمیل ایندکس جستجو با اعداد شرقی
  SURAH_INDEX.forEach(entry => { entry.nEast = toEastern(entry.s.n); });
  const escapeHtml = str => String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  /* ── اعتبارسنجی/پاک‌سازی همهٔ داده‌هایی که از بیرونِ کد می‌آیند ──
     منبع‌ها: localStorage، ابر (Firestore)، IndexedDB. هیچ‌کدام قابل اعتماد نیستند؛
     قبل از استفاده (و مخصوصاً قبل از رفتن داخل innerHTML) فقط عدد/بولین/مقدار مجاز نگه داشته می‌شود. */
  const clampInt = (v, min, max, def) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
  };
  function sanitizeBookmarks(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const v of raw.slice(0, 500)) {
      const n = Number(v);
      if (Number.isInteger(n) && n >= 1 && n <= 114 && !out.includes(n)) out.push(n);
    }
    return out;
  }
  function sanitizeLastRead(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const surah = Number(raw.surah);
    if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
    const meta = META.find(m => m.n === surah);
    const at = Number(raw.at);
    return {
      surah,
      ayah: clampInt(raw.ayah, 1, meta ? meta.a : 286, 1),
      at: Number.isFinite(at) && at > 0 && at < 8.64e15 ? Math.floor(at) : Date.now()
    };
  }
  function sanitizeReadHistory(raw) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    const out = [];
    for (const item of raw.slice(0, 300)) {
      const e = sanitizeLastRead(item);
      if (!e || seen.has(e.surah)) continue;
      seen.add(e.surah);
      e.visits = clampInt(item && item.visits, 1, 1000000, 1);
      out.push(e);
      if (out.length >= 114) break;
    }
    return out;
  }
  function sanitizePrefs(raw) {
    const p = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
    const out = {};
    if (p.fontSize !== undefined) out.fontSize = clampInt(p.fontSize, 18, 40, 26);
    if (typeof p.showTr === 'boolean') out.showTr = p.showTr;
    if (typeof p.showTj === 'boolean') out.showTj = p.showTj;
    if (SPEED_STEPS.includes(p.audioSpeed)) out.audioSpeed = p.audioSpeed;
    if (typeof p.audioRepeat === 'boolean') out.audioRepeat = p.audioRepeat;
    if (typeof p.qari === 'string' && QARIS.some(q => q.id === p.qari)) out.qari = p.qari;
    return out;
  }
  function applySanitizedPrefs(p) {
    theme = 'dark';
    if (p.fontSize !== undefined) fontSize = p.fontSize;
    if (p.showTr !== undefined) showTranslation = p.showTr;
    if (p.showTj !== undefined) showTajweed = p.showTj;
    if (p.audioSpeed !== undefined) audioSpeed = p.audioSpeed;
    if (p.audioRepeat !== undefined) audioRepeat = p.audioRepeat;
    if (p.qari !== undefined) currentQari = p.qari;
  }
  /* فقط https و فقط از میزبان‌های صوتیِ شناخته‌شده */
  const ALLOWED_AUDIO_HOSTS = ['cdn.islamic.network', 'everyayah.com', 'server8.mp3quran.net'];
  function isAllowedAudioUrl(u) {
    try {
      const x = new URL(u, location.href);
      return x.protocol === 'https:' && ALLOWED_AUDIO_HOSTS.includes(x.hostname);
    } catch { return false; }
  }

  // Normalize Arabic/Persian text consistently for full-text search.
  function normalizeArabicStr(str) {
    return String(str || '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ی')
      .replace(/ي/g, 'ی')
      .replace(/ئ/g, 'ی')
      .replace(/ؤ/g, 'و')
      .replace(/ة/g, 'ه')
      .replace(/ك/g, 'ک')
      .replace(/[ـًٌٍَُِّْٰۣۖۗۚۛۜ۟۠ۡۢۤۥۦۧۨ۩۪ۭ۫۬]/g, '')
      .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // تبدیل متن آیه به کلمات مستقل برای هایلایت صوتی.
  // این تابع باید همیشه قبل از renderScrollMode تعریف شده باشد؛
  // نبودنش باعث ReferenceError و در نتیجه پیام «بارگذاری ممکن نشد» می‌شد.
  function wordSpans(text) {
    const value = String(text ?? '').trim();
    if (!value) return '';
    // رنگ‌های تجوید (اگر روشن باشد): متن هر کلمه با span های رنگی
    const tj = (typeof showTajweed !== 'undefined' && showTajweed && window.Tajweed)
      ? window.Tajweed.tokensHtml(value) : null;
    let k = 0;
    return value.split(/(\s+)/).map(part => {
      if (/^\s+$/.test(part)) return part;
      const inner = (tj && tj[k] !== undefined) ? tj[k] : escapeHtml(part);
      k++;
      return `<span class="q-word">${inner}</span>`;
    }).join('');
  }

  // متن یک آیه به‌صورت HTML امن؛ با رنگ‌های تجوید یا بدون آن
  function ayahHtml(text) {
    if (typeof showTajweed !== 'undefined' && showTajweed && window.Tajweed) return window.Tajweed.html(text);
    return escapeHtml(text);
  }

  /* ── State ── */
  let currentSurah = null;
  let currentNum   = 1;
  let showTranslation = true;
  let showTajweed = true;
  let fontSize     = 26;
  let cache        = {};
  let bookmarks    = [];
  let currentUserEmail = null; // null = guest
  let theme        = 'dark';
  let audioPlaying = false;
  let currentAudioAyah = null;
  let currentAudioGlobal = null;
  let audioSpeed = 1;
  let audioRepeat = false;
  let loginMode = 'login'; // 'login' | 'signup'

  /* Load current user first */
  try {
    currentUserEmail = localStorage.getItem(CURRENT_USER_KEY) || null;
  } catch {}
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY()) || '[]');
    if (Array.isArray(raw)) {
      bookmarks = raw.map(n => Number(n)).filter(n => Number.isInteger(n) && n >= 1 && n <= 114);
    }
  } catch {}
  const SPEED_STEPS = [0.75, 1, 1.25, 1.5];

  /* قاری‌ها — فقط مشاری تایمینگ کلمه‌به‌کلمه دارد */
  /* فقط قاری‌هایی که روی CDN در کیفیت ۱۲۸ واقعاً موجودند */
  const QARIS = [
    { id: 'ar.alafasy',      name: 'مشاری راشد العفاسی', short: 'مشاری', wordTiming: true, timingSource: 'exact' },
    { id: 'ar.husary',       name: 'محمود خلیل الحصری', short: 'حصری', wordTiming: true, timingSource: 'scaled' },
    { id: 'ar.minshawi',     name: 'محمد صدیق المنشاوی', short: 'منشاوی', wordTiming: true, timingSource: 'scaled' },
    { id: 'ar.shaatree',     name: 'ابوبکر الشاطری', short: 'شاطری', wordTiming: true, timingSource: 'scaled' },
    { id: 'ar.mahermuaiqly', name: 'ماهر المعیقلی', short: 'معیقلی', wordTiming: true, timingSource: 'scaled' },
    { id: 'ar.luhaidan',     name: 'محمد اللحیدان', short: 'لحیدان', wordTiming: true, timingSource: 'scaled', audioMode: 'surah', surahBase: 'https://server8.mp3quran.net/lhdan/' }
  ];
  let currentQari = 'ar.alafasy';

  /* load prefs */
  try {
    applySanitizedPrefs(sanitizePrefs(JSON.parse(localStorage.getItem(PREFS_KEY()) || '{}')));
  } catch {}
  /* پاک‌سازی نسخهٔ قدیمی: رمزهای هش‌شدهٔ حساب‌های «محلی» دیگر هرگز ذخیره نمی‌شوند */
  try { localStorage.removeItem(USERS_KEY); } catch {}

  function getQari() {
    return QARIS.find(q => q.id === currentQari) || QARIS[0];
  }

  /* ── DOM ── */
  const loader     = $('loader');
  const surahList  = $('surah-list');
  const markList   = $('mark-list');
  const searchInput = $('search');
  const scrollReader = $('scroll-reader');
  /* اسکرول امن: همیشه فقط ظرف #scroll-reader را اسکرول می‌کند، نه هر
     جد اسکرول‌پذیری که مرورگر تشخیص دهد. el.scrollIntoView() این تشخیص را
     به مرورگر می‌سپارد و چون #scroll-reader از content-visibility:auto و
     contain:strict استفاده می‌کند، ممکن است مرورگر لحظه‌ای آن را ظرف
     اسکرول‌پذیر نشناسد و در عوض body را اسکرول کند (که overflow:hidden دارد
     ولی همچنان از طریق کد قابل اسکرول است) و هدر صفحهٔ خواندن را هزاران
     پیکسل خارج از دید و غیرقابل‌کلیک کند. */
  function scrollToElementWithin(container, el, block, attemptsLeft) {
    if (!container || !el) return;
    if (attemptsLeft === undefined) attemptsLeft = 4;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const currentOffset = eRect.top - cRect.top + container.scrollTop;
    let target;
    if (block === 'center') {
      target = currentOffset - (container.clientHeight - eRect.height) / 2;
    } else { // 'nearest'
      if (eRect.top >= cRect.top && eRect.bottom <= cRect.bottom) return;
      target = eRect.top < cRect.top
        ? currentOffset
        : currentOffset - container.clientHeight + eRect.height;
    }
    const max = Math.max(0, container.scrollHeight - container.clientHeight);
    container.scrollTop = Math.max(0, Math.min(target, max));
    // درست بعد از اضافه‌شدن یک بخش بزرگ از آیه‌ها، مرورگر گاهی برای یک یا دو
    // فریم، scrollHeight ظرف را کوچک‌تر از واقعیت گزارش می‌دهد (هنوز layout
    // کامل نشده)، در حالی که موقعیت خودِ عنصر هدف (getBoundingClientRect)
    // درست است. نتیجه: هدف محاسبه‌شده به همان مقدار کوچکِ اشتباه کلیپ می‌شود
    // و اسکرول به‌جای رفتن سراغ آیه، همان بالای صفحه می‌ماند. با چند بار
    // تلاش مجدد در فریم‌های بعدی، به‌محض این‌که scrollHeight واقعی را
    // گزارش کند، آخرین تلاش آن را درست می‌کند.
    if (attemptsLeft > 0 && target > max + 4) {
      requestAnimationFrame(() => scrollToElementWithin(container, el, block, attemptsLeft - 1));
    }
  }
  const audioEl    = $('audio-el');
  const audioBar   = $('audio-bar');

  /* ── Network status ── */
  window.addEventListener('offline', () => {
    showToast('اتصال قطع شد؛ سوره‌های ذخیره‌شده روی این دستگاه همچنان در دسترس‌اند');
  });
  window.addEventListener('online', () => {
    showToast('اتصال اینترنت برقرار شد');
  });

  /* ── Theme & Mode ── */
  function applyTheme() {
    theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#1a1918' : '#F5F1EA');
    document.querySelectorAll('.theme-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
  }
  function applyFont() {
    document.documentElement.style.setProperty('--arabic-size', fontSize + 'px');
    const val = $('font-val');
    if (val) val.textContent = toEastern(fontSize);
  }

  applyTheme();
  applyFont();
  // Account UI will be ready after DOM; call later if needed, but updateAccountUI is safe
  setTimeout(updateAccountUI, 0);

  /* ── Views ── */
  function showView(id) {
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === id);
    });
    if (id !== 'view-reader') {
      stopAudio();
      hideReaderPlayBar();
    }
    // اقدام احتیاطی: body باید overflow:hidden و scrollTop=0 بماند؛ اگر به هر
    // دلیلی (مثلاً اسکرول اشتباه به عنصری خارج از ظرف صحیح) جابه‌جا شده باشد،
    // اینجا اصلاح می‌شود تا هدر صفحات هرگز خارج از دید/غیرقابل‌کلیک نشود.
    if (document.body.scrollTop) document.body.scrollTop = 0;
    if (document.documentElement.scrollTop) document.documentElement.scrollTop = 0;
  }

  document.querySelectorAll('.nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav button').forEach(b => {
        const isActive = b.dataset.tab === tab;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      if (tab === 'list') {
        showView('view-list');
        closeSearchPage();
        renderSurahList('');
      } else if (tab === 'juz') {
        showView('view-juz');
        renderJuzList();
      } else if (tab === 'learn') {
        showView('view-learn');
        renderHistory();
        renderLearnPath();
      } else {
        showView('view-marks');
        renderBookmarks();
      }
    });
  });

  /* ── List (بهینه‌شده برای جستجوی سریع) ── */
  function renderSurahList(filter = '', targetEl) {
    const el = targetEl || surahList;
    if (!el) return;
    const q = filter.trim().toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');

    let ranked;
    if (!q) {
      ranked = SURAH_INDEX; // همه به ترتیب اصلی
    } else {
      ranked = [];
      for (const entry of SURAH_INDEX) {
        let score = 0;
        // شماره دقیق (بالاترین اولویت)
        if (entry.nStr === q || entry.nEast === q) score = 100;
        else if (entry.nStr.startsWith(q) || entry.nEast.startsWith(q)) score = 90;
        // شروع نام فارسی / عربی
        else if (entry.faNorm.startsWith(q) || entry.arNorm.startsWith(q)) score = 80;
        // نام مستعار
        else if (entry.aliases.some(a => a === q || a.startsWith(q))) score = 75;
        // شامل بودن
        else if (entry.searchBlob.includes(q)) score = 50;
        // نوع مکی/مدنی
        else if (entry.type.includes(q) || (q === 'مکی' && entry.s.t === 'M') || (q === 'مدنی' && entry.s.t === 'D')) score = 40;
        if (score > 0) ranked.push({ entry, score });
      }
      // مرتب‌سازی بر اساس امتیاز سپس شماره سوره
      ranked.sort((a, b) => b.score - a.score || a.entry.s.n - b.entry.s.n);
      ranked = ranked.map(r => r.entry);
    }

    if (!ranked.length) {
      el.innerHTML = '<div class="empty" role="status">سوره‌ای پیدا نشد</div>';
      return;
    }

    const frag = document.createDocumentFragment();
    for (const entry of ranked) {
      const s = entry.s;
      const item = document.createElement('div');
      item.className = 'item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `سوره ${s.fa || s.ar}، ${toEastern(s.a)} آیه`);
      const typeLabel = entry.type;
      const typeClass = s.t === 'M' ? 'makki' : 'madani';
      item.innerHTML = `
        <div class="item-num" aria-hidden="true">${entry.nEast}</div>
        <div class="item-info">
          <div class="name-row">
            <div class="name">${s.ar}</div>
            <span class="item-badge ${typeClass}">${typeLabel}</span>
          </div>
          <div class="meta">
            ${s.fa ? `<span>${s.fa}</span><span class="dot">·</span>` : ''}
            <span>${toEastern(s.a)} آیه</span>
          </div>
        </div>
        <div class="item-arrow" aria-hidden="true">‹</div>`;
      item.addEventListener('click', () => {
        closeSearchPage();
        openSurah(s.n);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeSearchPage(); openSurah(s.n); }
      });
      frag.appendChild(item);
    }
    el.innerHTML = '';
    el.appendChild(frag);
  }
  /* ── Juz list ── */
  function renderJuzList() {
    const el = $('juz-list');
    if (!el) return;

    const frag = document.createDocumentFragment();
    JUZ.forEach(([surah, ayah], index) => {
      const meta = META.find(s => s.n === surah);
      if (!meta) return;

      const item = document.createElement('div');
      item.className = 'item juz-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `جزء ${toEastern(index + 1)}، شروع از سوره ${meta.fa || meta.ar} آیه ${toEastern(ayah)}`);
      item.innerHTML = `
        <div class="item-num" aria-hidden="true">${toEastern(index + 1)}</div>
        <div class="item-info">
          <div class="name-row">
            <div class="name">جزء ${toEastern(index + 1)}</div>
            <span class="item-badge ${meta.t === 'M' ? 'makki' : 'madani'}">${meta.t === 'M' ? 'مکی' : 'مدنی'}</span>
          </div>
          <div class="meta"><span>شروع از ${meta.fa || meta.ar}</span><span class="dot">·</span><span>آیه ${toEastern(ayah)}</span></div>
        </div>
        <div class="item-arrow" aria-hidden="true">‹</div>`;

      const open = () => openSurah(surah, ayah);
      item.addEventListener('click', open);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
      frag.appendChild(item);
    });

    el.replaceChildren(frag);
  }
  /* ── Full-text Quran search (کل قرآن + ارجاع آیه + رتبه‌بندی) ── */
  const searchResultsEl = $('search-results');
  let searchTimer = null;
  let searchIndex = null;           // ایندکس ناقص (فقط cache)
  let fullSearchIndex = null;       // ایندکس کامل ۱۱۴ سوره
  let fullIndexReady = false;
  let fullIndexBuilding = null;
  let searchGen = 0;                // برای لغو نتایج قدیمی

  function toWesternDigits(str) {
    return String(str)
      .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  }

  function normFa(str) {
    return String(str || '')
      .replace(/ي/g, 'ی').replace(/ك/g, 'ک')
      .replace(/‌/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function buildIndexFromCache() {
    const list = [];
    const seen = new Set();
    Object.keys(cache).forEach(k => {
      const n = +k;
      if (seen.has(n) || !cache[n] || !cache[n].ayahs) return;
      seen.add(n);
      for (const a of cache[n].ayahs) {
        const ar = a.text || '';
        const tr = a.tr || '';
        list.push({
          s: n, n: a.n, g: a.global, ar, tr,
          arNorm: normalizeArabicStr(ar),
          trNorm: normFa(tr)
        });
      }
    });
    return list;
  }

  function buildSearchIndex() {
    searchIndex = buildIndexFromCache();
    return searchIndex;
  }

  async function ensureFullSearchIndex(onProgress) {
    if (fullIndexReady && fullSearchIndex) return fullSearchIndex;
    if (fullIndexBuilding) return fullIndexBuilding;
    fullIndexBuilding = (async () => {
      const missing = [];
      for (let n = 1; n <= 114; n++) {
        if (!cache[n] || !cache[n].ayahs) missing.push(n);
      }
      const total = missing.length;
      let done = 0;
      for (let i = 0; i < missing.length; i += 12) {
        const batch = missing.slice(i, i + 12);
        await Promise.all(batch.map(n => fetchSurah(n).catch(() => null)));
        done += batch.length;
        if (onProgress) onProgress(done, total);
      }
      fullSearchIndex = buildIndexFromCache();
      fullIndexReady = fullSearchIndex.length > 5000;
      return fullSearchIndex;
    })();
    try {
      return await fullIndexBuilding;
    } finally {
      fullIndexBuilding = null;
    }
  }

  function highlightSnippet(text, query, maxLen = 110) {
    if (!text) return '';
    text = String(text);
    const lower = text.toLowerCase();
    const terms = String(query || '').toLowerCase().split(/\s+/).filter(t => t.length > 1);
    let idx = 0;
    for (const t of terms) {
      const i = lower.indexOf(t);
      if (i >= 0) { idx = i; break; }
    }
    if (!terms.length) {
      const q = String(query || '').toLowerCase();
      idx = q ? Math.max(0, lower.indexOf(q)) : 0;
    }
    const start = Math.max(0, idx - 24);
    let snip = text.slice(start, start + maxLen);
    if (start > 0) snip = '…' + snip;
    if (start + maxLen < text.length) snip += '…';
    // امنیت/درستی: اول روی متن «خام» علامت‌گذاری می‌کنیم و بعد هر تکه را جداگانه escape می‌کنیم.
    // (نسخهٔ قبلی روی متنِ escape‌شده regex می‌زد؛ جستجوی «lt» یا «amp» موجودیت‌هایی مثل &lt; را خراب می‌کرد.)
    const markTerms = (terms.length ? terms : [String(query || '')])
      .filter(t => t && t.length >= 2)
      .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!markTerms.length) return escapeHtml(snip);
    let re;
    try { re = new RegExp('(' + markTerms.join('|') + ')', 'gi'); } catch { return escapeHtml(snip); }
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(snip)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      out += escapeHtml(snip.slice(last, m.index)) + '<mark>' + escapeHtml(m[0]) + '</mark>';
      last = m.index + m[0].length;
    }
    return out + escapeHtml(snip.slice(last));
  }

  /** تشخیص ارجاع مثل 2:255 یا 2 255 یا بقره 255 یا ۲:۲۵۵ */
  function parseAyahRef(raw) {
    const q = toWesternDigits(raw.trim());
    // 2:255 یا 2/255 یا 2-255 یا فقط با فاصله: «2 255»
    let m = q.match(/^(\d{1,3})\s*(?:[:\/\-]\s*|\s+)(\d{1,3})$/);
    if (m) {
      const s = +m[1], a = +m[2];
      const meta = META.find(x => x.n === s);
      if (meta && a >= 1 && a <= meta.a) return { s, a };
    }
    // فقط شماره سوره
    m = q.match(/^(\d{1,3})$/);
    if (m) {
      const s = +m[1];
      if (s >= 1 && s <= 114) return { s, a: 0 };
    }
    // نام سوره + شماره آیه: «بقره 255» یا «یاسین آیه ۱۲»
    const faQ = normFa(q);
    m = faQ.match(/^(.+?)\s*(?:آیه|ایه|آیت)?\s*(\d{1,3})$/);
    if (m) {
      const name = m[1].replace(/\s+/g, ' ').trim();
      const a = +m[2];
      for (const entry of SURAH_INDEX) {
        if (
          entry.faNorm === name || entry.arNorm === name ||
          entry.aliases.includes(name) ||
          entry.faNorm.startsWith(name) || entry.arNorm.startsWith(name) ||
          entry.aliases.some(al => al === name || al.startsWith(name))
        ) {
          if (a >= 1 && a <= entry.s.a) return { s: entry.s.n, a };
          if (a >= 1) return { s: entry.s.n, a };
        }
      }
    }
    // آیات مشهور
    for (const fam of FAMOUS_AYAH_QUERIES) {
      if (fam.keys.some(k => faQ === normFa(k) || faQ.includes(normFa(k)))) {
        return { s: fam.s, a: fam.a, famous: true };
      }
    }
    return null;
  }

  function scoreAyahHit(item, qAr, faTerms, fullFa) {
    let score = 0;
    let matchAr = false, matchTr = false;
    if (qAr && item.arNorm.includes(qAr)) {
      matchAr = true;
      score += item.arNorm.startsWith(qAr) ? 100 : 70;
      if (item.arNorm === qAr) score += 40;
    }
    if (fullFa && item.trNorm.includes(fullFa)) {
      matchTr = true;
      score += item.trNorm.startsWith(fullFa) ? 90 : 60;
    }
    if (faTerms.length > 1) {
      let all = true, partial = 0;
      for (const t of faTerms) {
        if (item.trNorm.includes(t) || item.arNorm.includes(normalizeArabicStr(t))) partial++;
        else all = false;
      }
      if (all) {
        matchTr = true;
        score += 50 + partial * 8;
      } else if (partial > 0) {
        score += partial * 12;
        if (partial >= Math.ceil(faTerms.length / 2)) matchTr = true;
      }
    } else if (faTerms.length === 1) {
      const t = faTerms[0];
      if (item.trNorm.includes(t)) {
        matchTr = true;
        score += item.trNorm.startsWith(t) ? 55 : 35;
      }
    }
    // اولویت آیات کوتاه‌تر کمی کمتر، ولی سورهٔ ابتدایی کمی بیشتر
    if (item.s <= 3) score += 2;
    return { score, matchAr, matchTr };
  }

  const searchSurahList = $('search-surah-list');
  const searchPage = $('search-page');
  const aiSuggestEl = $('ai-suggest');
  const RECENT_SEARCH_KEY = 'quran_recent_searches_v1';

  // سوره‌های پیشنهادی هوشمند
  const AI_SURAH_SUGGESTIONS = [
    { n: 1, tip: 'شروع تلاوت' },
    { n: 18, tip: 'جمعه' },
    { n: 32, tip: 'سجده' },
    { n: 36, tip: 'پرمخاطب' },
    { n: 55, tip: 'تلاوت زیبا' },
    { n: 56, tip: 'فضیلت زیاد' },
    { n: 67, tip: 'مناسب شب' },
    { n: 112, tip: 'کوتاه و مهم' },
    { n: 113, tip: 'حفاظت' },
    { n: 114, tip: 'حفاظت' }
  ];

  const MAX_QUERY_LEN = 100;   // جلوگیری از ورودی‌های غول‌آسا (بار CPU / ReDoS)
  function getRecentSearches() {
    try {
      const arr = JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || '[]');
      return Array.isArray(arr) ? arr.filter(x => typeof x === 'string' && x.trim()).map(x => x.slice(0, MAX_QUERY_LEN)).slice(0, 8) : [];
    } catch { return []; }
  }

  function saveRecentSearch(q) {
    const t = String(q || '').trim().slice(0, MAX_QUERY_LEN);
    if (!t || t.length < 2) return;
    try {
      let arr = getRecentSearches().filter(x => x !== t);
      arr.unshift(t);
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(arr.slice(0, 8)));
    } catch {}
  }

  function applySearchQuery(q) {
    if (!searchInput) return;
    searchInput.value = q;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    try { searchInput.focus(); } catch {}
  }

  function setSearchMode(hasQuery) {
    if (aiSuggestEl) aiSuggestEl.style.display = hasQuery ? 'none' : '';
    if (searchSurahList) searchSurahList.style.display = hasQuery ? '' : 'none';
    if (!hasQuery && searchResultsEl) {
      searchResultsEl.style.display = 'none';
      searchResultsEl.innerHTML = '';
    }
  }

  function renderAiSuggestions() {
    const recentWrap = $('ai-recent-wrap');
    const recentEl = $('ai-recent');
    const quickEl = $('ai-quick');
    const surahsEl = $('ai-surahs');

    // جستجوهای اخیر
    const recent = getRecentSearches();
    if (recentWrap && recentEl) {
      if (recent.length) {
        recentWrap.style.display = '';
        recentEl.innerHTML = recent.map(q =>
          `<button type="button" class="ai-chip" data-q="${escapeHtml(q)}"><span class="ai-chip-ico">⏱</span>${escapeHtml(q)}</button>`
        ).join('');
        recentEl.querySelectorAll('.ai-chip').forEach(btn => {
          btn.addEventListener('click', () => applySearchQuery(btn.dataset.q || btn.textContent));
        });
      } else {
        recentWrap.style.display = 'none';
        recentEl.innerHTML = '';
      }
    }

    // میانبرهای هوشمند
    if (quickEl) {
      const last = loadLastRead();
      const chips = [
        { q: 'یاسین', ico: '✦', label: 'یاسین' },
        { q: 'الرحمن', ico: '✦', label: 'الرحمن' },
        { q: 'ملک', ico: '✦', label: 'ملک' },
        { q: 'آیه الکرسی', ico: '★', label: 'آیه الکرسی' },
        { q: '2:255', ico: '↦', label: '۲:۲۵۵' },
        { q: 'صبر', ico: '⌕', label: 'آیات صبر' },
        { q: 'بهشت', ico: '⌕', label: 'آیات بهشت' },
        { q: 'توبه', ico: '⌕', label: 'توبه' },
        { q: 'مکی', ico: '🏷', label: 'سوره‌های مکی' },
        { q: 'مدنی', ico: '🏷', label: 'سوره‌های مدنی' }
      ];
      if (last && last.surah) {
        const m = META.find(x => x.n === last.surah);
        chips.unshift({
          q: '',
          ico: '▶',
          label: 'ادامه مطالعه' + (m ? ' · ' + (m.fa || m.ar) : ''),
          action: 'last-read',
          surah: last.surah
        });
      }
      quickEl.innerHTML = chips.map(c =>
        `<button type="button" class="ai-chip" data-action="${c.action || ''}" data-q="${(c.q || '').replace(/"/g, '&quot;')}" data-surah="${c.surah || ''}" ><span class="ai-chip-ico">${c.ico}</span>${c.label}</button>`
      ).join('');
      quickEl.querySelectorAll('.ai-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.action === 'last-read' && btn.dataset.surah) {
            closeSearchPage();
            openSurah(+btn.dataset.surah);
            return;
          }
          applySearchQuery(btn.dataset.q || '');
        });
      });
    }

    // سوره‌های پیشنهادی
    if (surahsEl) {
      surahsEl.innerHTML = AI_SURAH_SUGGESTIONS.map(item => {
        const s = META.find(x => x.n === item.n);
        if (!s) return '';
        return `<button type="button" class="ai-surah" data-n="${s.n}">
          <div class="ai-surah-num">${toEastern(s.n)}</div>
          <div class="ai-surah-info">
            <div class="ai-surah-name">${s.ar}${s.fa ? ' · ' + s.fa : ''}</div>
            <div class="ai-surah-meta">${toEastern(s.a)} آیه · ${s.t === 'M' ? 'مکی' : 'مدنی'}</div>
          </div>
          <div class="ai-surah-tip">${item.tip}</div>
        </button>`;
      }).join('');
      surahsEl.querySelectorAll('.ai-surah').forEach(btn => {
        btn.addEventListener('click', () => {
          closeSearchPage();
          openSurah(+btn.dataset.n);
        });
      });
    }
  }

  function openSearchPage() {
    if (!searchPage) return;
    searchPage.classList.add('open');
    searchPage.setAttribute('aria-hidden', 'false');
    const v = (searchInput?.value || '').trim();
    if (v) {
      setSearchMode(true);
      renderSurahList(v, searchSurahList);
      runFullTextSearch(v);
    } else {
      setSearchMode(false);
      renderAiSuggestions();
      if (searchSurahList) searchSurahList.innerHTML = '';
    }
    setTimeout(() => {
      try { searchInput?.focus(); } catch {}
    }, 320);
  }

  function closeSearchPage() {
    if (!searchPage) return;
    searchPage.classList.remove('open');
    searchPage.setAttribute('aria-hidden', 'true');
    try { if (typeof stopVoiceSearch === 'function') stopVoiceSearch(); } catch {}
    try { searchInput?.blur(); } catch {}
    // رفع باگ: اگر متن قبلی (مخصوصاً یک میان‌بر مستقیم به آیه مثل «آیه الکرسی»)
    // در کادر جستجو بماند، دفعهٔ بعد که کاربر فقط دکمهٔ جستجو را می‌زند،
    // openSearchPage() همان متن را دوباره اجرا می‌کند و بی‌آنکه فرصت تایپ چیز
    // جدیدی بدهد، کاربر را مستقیم به همان آیه برمی‌گرداند (یک حلقهٔ گیرکننده).
    // با پاک کردن کادر هنگام بستن، هر بار باز کردن جستجو از حالت خالی/پیشنهادها
    // شروع می‌شود، دقیقاً مثل بیشتر اپ‌های جستجوی موبایل.
    if (searchInput) searchInput.value = '';
    setSearchMode(false);
    if (searchResultsEl) {
      searchResultsEl.style.display = 'none';
      searchResultsEl.innerHTML = '';
    }
    if (searchSurahList) searchSurahList.innerHTML = '';
  }

  function renderAyahHits(hits, q, listEl, totalFound) {
    if (!searchResultsEl) return;
    searchResultsEl.style.display = 'block';
    if (!hits.length) {
      searchResultsEl.innerHTML = `
        <div class="search-empty">
          <strong>آیه‌ای پیدا نشد</strong>
          نام سوره را در پایین ببینید یا عبارت دیگری امتحان کنید
        </div>`;
      if (listEl) listEl.style.display = '';
      return;
    }
    if (listEl) listEl.style.display = hits.length >= 3 ? 'none' : '';
    const status = document.createElement('div');
    status.className = 'search-status';
    status.innerHTML = `<span>نتایج آیات</span><span class="search-count">${toEastern(totalFound || hits.length)} آیه</span>`;
    const frag = document.createDocumentFragment();
    frag.appendChild(status);
    hits.forEach(({ item, matchAr, matchTr }) => {
      const meta = META.find(m => m.n === item.s);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-hit';
      const badge = matchAr && matchTr ? 'عربی + ترجمه' : matchAr ? 'عربی' : 'ترجمه';
      btn.innerHTML = `
        <div class="hit-meta">
          <span>سوره ${meta ? (meta.fa || meta.ar) : item.s} · آیه ${toEastern(item.n)}</span>
          <span class="hit-badge">${badge}</span>
        </div>
        <div class="hit-ar">${highlightSnippet(item.ar, q)}</div>
        <div class="hit-tr">${highlightSnippet(item.tr, q)}</div>`;
      btn.addEventListener('click', () => {
        closeSearchPage();
        openSurah(item.s, item.n);
      });
      frag.appendChild(btn);
    });
    searchResultsEl.innerHTML = '';
    searchResultsEl.appendChild(frag);
  }

  async function runFullTextSearch(rawQ) {
    const q = String(rawQ || '').trim().slice(0, MAX_QUERY_LEN);
    const listEl = searchSurahList || surahList;
    const myGen = ++searchGen;

    if (!q || q.length < 1) {
      if (searchResultsEl) {
        searchResultsEl.style.display = 'none';
        searchResultsEl.innerHTML = '';
      }
      if (listEl) listEl.style.display = '';
      return;
    }

    // ارجاع مستقیم آیه (2:255 ، بقره 255 ، آیه الکرسی)
    const ref = parseAyahRef(q);
    if (ref && ref.a > 0) {
      saveRecentSearch(q);
      if (searchResultsEl) {
        searchResultsEl.style.display = 'block';
        searchResultsEl.innerHTML = `<div class="search-status loading">در حال باز کردن آیه ${toEastern(ref.s)}:${toEastern(ref.a)}…</div>`;
      }
      try {
        await fetchSurah(ref.s);
        if (myGen !== searchGen) return;
        closeSearchPage();
        openSurah(ref.s, ref.a);
        return;
      } catch {
        /* ادامه با جستجوی متنی */
      }
    } else if (ref && ref.a === 0) {
      saveRecentSearch(q);
      closeSearchPage();
      openSurah(ref.s);
      return;
    }

    if (q.length < 2) {
      if (searchResultsEl) {
        searchResultsEl.style.display = 'none';
        searchResultsEl.innerHTML = '';
      }
      if (listEl) listEl.style.display = '';
      return;
    }

    saveRecentSearch(q);
    if (!searchResultsEl) return;
    searchResultsEl.style.display = 'block';
    searchResultsEl.innerHTML = `<div class="search-status loading">در حال جستجو در کل قرآن…</div>`;

    const qAr = normalizeArabicStr(q);
    const fullFa = normFa(q);
    const faTerms = fullFa.split(/\s+/).filter(t => t.length > 1);

    // اول از ایندکس موجود (سریع)، بعد ایندکس کامل
    let idx = fullIndexReady && fullSearchIndex ? fullSearchIndex : buildSearchIndex();

    const collect = (source) => {
      const scored = [];
      for (const item of source) {
        const r = scoreAyahHit(item, qAr, faTerms, fullFa);
        if (r.score > 0 && (r.matchAr || r.matchTr)) {
          scored.push({ item, score: r.score, matchAr: r.matchAr, matchTr: r.matchTr });
        }
      }
      scored.sort((a, b) => b.score - a.score || a.item.s - b.item.s || a.item.n - b.item.n);
      return scored;
    };

    let scored = collect(idx);
    if (myGen !== searchGen) return;

    // نمایش سریع نتایج اولیه
    if (scored.length) {
      renderAyahHits(scored.slice(0, 50), q, listEl, scored.length);
    }

    // اگر ایندکس کامل نبود، کل قرآن را بارگذاری کن
    if (!fullIndexReady) {
      try {
        idx = await ensureFullSearchIndex((done, total) => {
          if (myGen !== searchGen || !searchResultsEl) return;
          if (!scored.length) {
            searchResultsEl.innerHTML = `<div class="search-status loading">آماده‌سازی ایندکس… ${toEastern(done)}/${toEastern(total)}</div>`;
          }
        });
        if (myGen !== searchGen) return;
        scored = collect(idx);
      } catch {
        /* نگه داشتن نتایج جزئی */
      }
    }

    if (myGen !== searchGen) return;
    renderAyahHits(scored.slice(0, 60), q, listEl, scored.length);
  }

  // باز کردن صفحه جستجو از صفحه اصلی
  $('btn-open-search')?.addEventListener('click', openSearchPage);
  $('btn-search-back')?.addEventListener('click', closeSearchPage);

  searchInput?.addEventListener('input', () => {
    if (searchInput.value.length > MAX_QUERY_LEN) searchInput.value = searchInput.value.slice(0, MAX_QUERY_LEN);
    const v = searchInput.value;
    const has = v.trim().length > 0;
    setSearchMode(has);
    if (has) {
      renderSurahList(v, searchSurahList);
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => runFullTextSearch(v), 220);
    } else {
      searchGen++;
      renderAiSuggestions();
      if (searchSurahList) searchSurahList.innerHTML = '';
      if (searchResultsEl) {
        searchResultsEl.style.display = 'none';
        searchResultsEl.innerHTML = '';
      }
    }
  });

  // Enter روی ارجاع آیه → پرش مستقیم
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const v = (searchInput.value || '').trim();
    if (!v) return;
    e.preventDefault();
    clearTimeout(searchTimer);
    runFullTextSearch(v);
  });

  /* ── Voice search: فارسی و دری ── */
  let voiceRec = null;
  let voiceListening = false;
  const micBtn = $('btn-search-mic');

  function applyVoiceText(text, isFinal) {
    if (!searchInput || !text) return;
    searchInput.value = text.trim();
    if (isFinal) {
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function stopVoiceSearch() {
    voiceListening = false;
    micBtn?.classList.remove('listening');
    try { if (voiceRec) voiceRec.stop(); } catch {}
  }

  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast('جستجوی صوتی در این مرورگر پشتیبانی نمی‌شود');
      return;
    }
    if (voiceListening) {
      stopVoiceSearch();
      return;
    }
    try {
      voiceRec = new SR();
      // fa-IR هم فارسی و هم دری را خوب می‌فهمد
      voiceRec.lang = 'fa-IR';
      voiceRec.interimResults = true;  // نمایش زنده متن در کادر
      voiceRec.maxAlternatives = 3;
      voiceRec.continuous = false;

      voiceRec.onstart = () => {
        voiceListening = true;
        micBtn?.classList.add('listening');
        if (searchInput) {
          searchInput.value = '';
          searchInput.placeholder = 'بگویید...';
        }
      };

      voiceRec.onresult = (ev) => {
        let interim = '';
        let finalText = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const t = ev.results[i][0].transcript || '';
          if (ev.results[i].isFinal) finalText += t;
          else interim += t;
        }
        if (finalText) {
          applyVoiceText(finalText, true);
        } else if (interim) {
          applyVoiceText(interim, false);
        }
      };

      voiceRec.onerror = (ev) => {
        stopVoiceSearch();
        if (searchInput) searchInput.placeholder = 'جستجوی سوره، آیه یا ترجمه...';
        const err = ev && ev.error;
        if (err === 'not-allowed') showToast('دسترسی میکروفن را اجازه دهید');
        else if (err === 'no-speech') showToast('صدایی شنیده نشد، دوباره بگویید');
        else if (err !== 'aborted') showToast('خطا در تشخیص گفتار');
      };

      voiceRec.onend = () => {
        stopVoiceSearch();
        if (searchInput) {
          searchInput.placeholder = 'جستجوی سوره، آیه یا ترجمه...';
          // اگر متنی ثبت شده، جستجو را قطعی اجرا کن
          if (searchInput.value.trim()) {
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      };

      voiceRec.start();
    } catch {
      showToast('امکان استفاده از میکروفن نیست');
      stopVoiceSearch();
    }
  }

  micBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    startVoiceSearch();
  });

  // Pre-build search index in background so first search is instant
  function scheduleSearchIndexBuild() {
    if (searchIndex) return;
    const build = () => { try { buildSearchIndex(); } catch {} };
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(build, { timeout: 2500 });
    } else {
      setTimeout(build, 1200);
    }
  }
  scheduleSearchIndexBuild();

  /* ── Toast ── */
  let toastTimer = null;
  function showToast(msg, ms = 2600) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  /* ── Bookmarks ── */
  function loadReadHistory() {
    try {
      return sanitizeReadHistory(JSON.parse(localStorage.getItem(READ_HISTORY_KEY()) || '[]'));
    } catch { return []; }
  }
  function saveReadHistory(list) {
    try { localStorage.setItem(READ_HISTORY_KEY(), JSON.stringify(list.slice(0, 114))); } catch {}
    if (typeof scheduleCloudSave === 'function') scheduleCloudSave();
  }
  function recordSurahStudy(surah, ayah) {
    if (!surah || surah < 1 || surah > 114) return;
    const now = Date.now();
    const list = loadReadHistory();
    const idx = list.findIndex(x => +x.surah === +surah);
    if (idx >= 0) {
      list[idx].at = now;
      list[idx].ayah = ayah || list[idx].ayah || 1;
      list[idx].visits = (list[idx].visits || 1) + 1;
      const item = list.splice(idx, 1)[0];
      list.unshift(item);
    } else {
      list.unshift({ surah: +surah, ayah: ayah || 1, at: now, visits: 1 });
    }
    saveReadHistory(list);
  }
  function clearReadHistory() {
    try { localStorage.removeItem(READ_HISTORY_KEY()); } catch {}
    try { localStorage.removeItem(LAST_READ_KEY()); } catch {}
    if (typeof scheduleCloudSave === 'function') scheduleCloudSave();
  }
  function saveLastRead() {
    if (!currentNum) return;
    const ayah = currentAudioAyah || 1;
    try {
      localStorage.setItem(LAST_READ_KEY(), JSON.stringify({
        surah: currentNum,
        ayah,
        at: Date.now()
      }));
    } catch {}
    recordSurahStudy(currentNum, ayah);
  }
  function loadLastRead() {
    try { return sanitizeLastRead(JSON.parse(localStorage.getItem(LAST_READ_KEY()) || 'null')); }
    catch { return null; }
  }
  function isBookmarked(n) { return bookmarks.includes(n); }
  function toggleBookmark() {
    const idx = bookmarks.indexOf(currentNum);
    if (idx >= 0) bookmarks.splice(idx, 1);
    else bookmarks.unshift(currentNum);
    saveBookmarks();
    updateMarkButton();
    showToast(isBookmarked(currentNum) ? 'به نشانه‌ها اضافه شد' : 'از نشانه‌ها حذف شد');
  }
  function updateMarkButton() {
    syncReaderMenu();
  }
  function renderBookmarks() {
    if (!bookmarks.length) {
      markList.innerHTML = '<div class="empty" role="status">هنوز نشانه‌ای ندارید<br><small>از منوی بیشتر روی «نشانه» بزنید</small></div>';
      return;
    }
    const frag = document.createDocumentFragment();
    bookmarks.forEach(n => {
      const s = META.find(x => x.n === n);
      if (!s) return;
      const item = document.createElement('div');
      item.className = 'item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `سوره ${s.fa || s.ar}`);
      item.innerHTML = `
        <div class="item-num" aria-hidden="true">${toEastern(s.n)}</div>
        <div class="item-info">
          <div class="name-row"><div class="name">${s.ar}</div></div>
          <div class="meta">${s.fa ? s.fa + ' · ' : ''}${toEastern(s.a)} آیه</div>
        </div>
        <div class="item-arrow" aria-hidden="true">‹</div>`;
      item.addEventListener('click', () => openSurah(s.n));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSurah(s.n); }
      });
      frag.appendChild(item);
    });
    markList.innerHTML = '';
    markList.appendChild(frag);
  }

  function renderLearnPath() {
    const el = $('learn-path');
    if (!el) return;
    const path = [114, 113, 112, 111, 110, 108];
    const frag = document.createDocumentFragment();
    path.forEach(n => {
      const s = META.find(item => item.n === n);
      if (!s) return;
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'learn-surah';
      item.setAttribute('aria-label', `شروع یادگیری سوره ${s.fa || s.ar}`);
      item.innerHTML = `
        <span class="learn-surah-num" aria-hidden="true">${toEastern(s.n)}</span>
        <span class="learn-surah-info">
          <span class="learn-surah-name">${escapeHtml(s.ar)}</span>
          <span class="learn-surah-meta">${escapeHtml(s.fa || '')} · ${toEastern(s.a)} آیه</span>
        </span>
        <span class="learn-surah-arrow" aria-hidden="true">‹</span>`;
      item.addEventListener('click', () => openSurah(s.n));
      frag.appendChild(item);
    });
    el.replaceChildren(frag);
  }

  /* ── Account + Cloud Sync (Firebase) ── */
  const cloudEnabled = !!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
  let firebaseApp = null;
  let firebaseAuth = null;
  let firebaseDb = null;
  let cloudUid = null;          // Firebase uid when logged in via cloud
  let cloudSyncTimer = null;    // debounce for saving to cloud

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
  }

  /* امنیت: حساب «محلی» با رمز عبورِ ذخیره‌شده در localStorage حذف شد.
     رمز عبور هرگز نباید در مرورگر ذخیره شود (هر اسکریپت یا هر کسی با دسترسی به دستگاه می‌خواندش)
     و چنین «ورودی» هیچ امنیت واقعی‌ای ندارد؛ فقط Firebase Auth رمز را (سمت سرور) بررسی می‌کند. */

  /* محدودیت تلاش ورود (لایهٔ دوم؛ Firebase هم سمت سرور محدود می‌کند) */
  const LOGIN_MAX_FAILS = 5;
  const LOGIN_LOCK_MS = 30000;
  let loginFails = 0;
  let loginLockedUntil = 0;
  let resetLockedUntil = 0;
  let authListenerSet = false;

  const COMMON_PASSWORDS = new Set([
    '12345678', '123456789', '1234567890', '87654321', '11111111', '00000000', '12341234', '123123123',
    'password', 'password1', 'password123', 'qwerty123', 'qwertyuiop', '1q2w3e4r', 'abc12345', 'iloveyou',
    'admin1234', 'letmein123', 'quran123', 'quran1234', 'quran12345', 'allah123', 'allah1234', 'mohammad',
    'mohammed', 'ali12345', 'iloveislam', 'bismillah'
  ]);
  /* فقط هنگام «ثبت‌نام» اعمال می‌شود؛ ورود کاربران قدیمی (که رمز ۶ کاراکتری دارند) بسته نمی‌شود. */
  function checkNewPassword(pw, email) {
    if (pw.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
    if (pw.length > 128) return 'رمز عبور بیش از حد طولانی است (حداکثر ۱۲۸ کاراکتر).';
    if (/^(.)\1+$/.test(pw)) return 'رمز عبور نباید فقط یک کاراکتر تکراری باشد.';
    if (/^\d+$/.test(pw)) return 'رمز عبور نباید فقط عدد باشد؛ چند حرف هم اضافه کنید.';
    if (COMMON_PASSWORDS.has(pw.toLowerCase())) return 'این رمز عبور بسیار رایج و ناامن است؛ رمز دیگری انتخاب کنید.';
    const local = String(email).split('@')[0].toLowerCase();
    if (local.length >= 4 && pw.toLowerCase().includes(local)) return 'رمز عبور نباید شامل بخشی از ایمیل شما باشد.';
    return '';
  }

  /* Initialize Firebase if configured – اسکریپت‌ها تنبل لود می‌شوند */
  let firebaseLoading = null;
  async function ensureFirebaseScripts() {
    if (typeof firebase !== 'undefined') return true;
    if (firebaseLoading) return firebaseLoading;
    firebaseLoading = (async () => {
      try {
        await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
        await Promise.all([
          loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js'),
          loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js')
        ]);
        return typeof firebase !== 'undefined';
      } catch {
        return false;
      }
    })();
    return firebaseLoading;
  }

  async function initFirebase() {
    if (!cloudEnabled) return false;
    const ok = await ensureFirebaseScripts();
    if (!ok || typeof firebase === 'undefined') return false;
    try {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
      } else {
        firebaseApp = firebase.app();
      }
      firebaseAuth = firebase.auth();
      firebaseDb = firebase.firestore();
      // امنیت/حریم خصوصی: عمداً enablePersistence() صدا زده نمی‌شود تا نسخهٔ آفلاین دادهٔ کاربر
      // (ایمیل، نشانه‌ها، سابقه) بعد از خروج روی کامپیوتر مشترک مدرسه باقی نماند.
      return true;
    } catch (e) {
      console.warn('Firebase init failed', e);
      return false;
    }
  }

  function updateAccountNote() {
    const note = $('account-note');
    if (!note) return;
    if (cloudEnabled) {
      note.textContent = cloudUid
        ? 'همگام‌سازی ابری فعال است. نشانه‌ها و تنظیمات بین دستگاه‌ها همگام می‌شوند.'
        : 'همگام‌سازی ابری آماده است. وارد شوید تا داده‌ها بین دستگاه‌ها همگام شوند.';
    } else {
      note.textContent = 'داده‌ها فقط روی این دستگاه ذخیره می‌شوند.';
    }
  }

  function updateAccountUI() {
    const loggedOut = $('account-logged-out');
    const loggedIn = $('account-logged-in');
    if (!loggedOut || !loggedIn) return;
    if (currentUserEmail) {
      loggedOut.style.display = 'none';
      loggedIn.style.display = 'block';
      const emailEl = $('account-email');
      if (emailEl) emailEl.textContent = currentUserEmail;
      const av = $('account-avatar');
      if (av) av.textContent = (currentUserEmail[0] || '?').toUpperCase();
    } else {
      loggedOut.style.display = 'block';
      loggedIn.style.display = 'none';
    }
    updateAccountNote();
  }

  /* Load from local storage (always works) — همه‌چیز قبل از استفاده اعتبارسنجی می‌شود */
  function loadUserDataLocal() {
    try {
      bookmarks = sanitizeBookmarks(JSON.parse(localStorage.getItem(STORAGE_KEY()) || '[]'));
    } catch { bookmarks = []; }
    try {
      applySanitizedPrefs(sanitizePrefs(JSON.parse(localStorage.getItem(PREFS_KEY()) || '{}')));
    } catch {}
  }

  /* Apply loaded data to UI */
  function applyLoadedUserData() {
    if (typeof applyTheme === 'function') applyTheme();
    if (typeof applyFont === 'function') applyFont();
    updateAccountUI();
    if (typeof renderBookmarks === 'function') renderBookmarks();
    if (typeof updateMarkButton === 'function') updateMarkButton();
    syncTrButtons();
  }

  function loadUserData() {
    loadUserDataLocal();
    applyLoadedUserData();
  }

  /* Cloud: pull user document
     داده‌ی ابری «غیرقابل اعتماد» است (اگر قوانین Firestore درست نباشد هر کسی می‌تواند بنویسد)،
     پس هر فیلد اعتبارسنجی می‌شود و فقط شکل مجازش در localStorage/UI می‌ماند. */
  async function pullFromCloud(uid) {
    if (!firebaseDb || !uid) return;
    try {
      const snap = await firebaseDb.collection('users').doc(uid).get();
      if (!snap.exists) return;
      const data = snap.data() || {};
      if (Array.isArray(data.bookmarks)) {
        bookmarks = sanitizeBookmarks(data.bookmarks);
        try { localStorage.setItem(STORAGE_KEY(), JSON.stringify(bookmarks)); } catch {}
      }
      if (data.prefs && typeof data.prefs === 'object') {
        applySanitizedPrefs(sanitizePrefs(data.prefs));
        try {
          localStorage.setItem(PREFS_KEY(), JSON.stringify({
            theme, fontSize, showTr: showTranslation, showTj: showTajweed,
            audioSpeed, audioRepeat, qari: currentQari
          }));
        } catch {}
      }
      const last = sanitizeLastRead(data.lastRead);
      if (last) {
        try { localStorage.setItem(LAST_READ_KEY(), JSON.stringify(last)); } catch {}
      }
      if (Array.isArray(data.readHistory)) {
        try { localStorage.setItem(READ_HISTORY_KEY(), JSON.stringify(sanitizeReadHistory(data.readHistory))); } catch {}
      }
      applyLoadedUserData();
    } catch (e) {
      console.warn('pullFromCloud failed', e);
    }
  }

  /* Cloud: push current state (debounced) */
  function scheduleCloudSave() {
    if (!cloudEnabled || !cloudUid || !firebaseDb) return;
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(pushToCloud, 800);
  }

  async function pushToCloud() {
    if (!firebaseDb || !cloudUid) return false;
    try {
      const last = loadLastRead();
      const readHistory = loadReadHistory();
      await firebaseDb.collection('users').doc(cloudUid).set({
        email: currentUserEmail,
        bookmarks: sanitizeBookmarks(bookmarks),
        prefs: {
          theme: 'dark', fontSize, showTr: !!showTranslation, showTj: !!showTajweed,
          audioSpeed, audioRepeat: !!audioRepeat, qari: currentQari
        },
        lastRead: last,
        readHistory,
        updatedAt: Date.now()
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('pushToCloud failed', e);
      return false;
    }
  }

  /* Override save helpers so they also sync to cloud */
  function saveBookmarks() {
    try { localStorage.setItem(STORAGE_KEY(), JSON.stringify(bookmarks)); } catch {}
    scheduleCloudSave();
  }
  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY(), JSON.stringify({
        theme, fontSize, showTr: showTranslation, showTj: showTajweed,
        audioSpeed, audioRepeat, qari: currentQari
      }));
    } catch {}
    scheduleCloudSave();
  }

  function openAccountPanel() {
    const panel = $('account-panel');
    if (!panel) return;
    loginMode = 'login';
    updateLoginModeUI();
    if ($('login-email')) $('login-email').value = '';
    if ($('login-password')) $('login-password').value = '';
    if ($('login-error')) $('login-error').textContent = '';
    $('overlay')?.classList.add('show');
    panel.style.transform = '';
    panel.classList.add('show');
    setTimeout(() => $('login-email')?.focus(), 300);
  }

  function closeAccountPanel() {
    $('account-panel')?.classList.remove('show');
    $('overlay')?.classList.remove('show');
  }

  function updateLoginModeUI() {
    document.querySelectorAll('.login-mode-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.mode === loginMode);
    });
    const title = $('account-panel-title');
    const hint = $('account-panel-hint');
    const btn = $('btn-login-submit');
    const pw = $('login-password');
    const forgot = $('btn-forgot-password');
    if (loginMode === 'signup') {
      if (title) title.textContent = 'ثبت‌نام حساب جدید';
      if (hint) hint.textContent = 'با ایمیل واقعی ثبت‌نام کنید تا داده‌ها در ابر ذخیره و بین دستگاه‌ها همگام شوند.';
      if (btn) btn.textContent = 'ثبت‌نام';
      if (pw) { pw.placeholder = 'حداقل ۸ کاراکتر'; pw.autocomplete = 'new-password'; }
      if (forgot) forgot.style.display = 'none';
    } else {
      if (title) title.textContent = 'ورود به حساب';
      if (hint) hint.textContent = 'وارد شوید تا نشانه‌ها و پیشرفت مطالعه بین دستگاه‌ها همگام شوند.';
      if (btn) btn.textContent = 'ورود';
      if (pw) { pw.placeholder = 'رمز عبور'; pw.autocomplete = 'current-password'; }
      if (forgot) forgot.style.display = '';
    }
    if ($('login-error')) $('login-error').textContent = '';
  }

  /* اطمینان از آماده بودن Firebase (ممکن است هنوز به‌صورت تنبل در حال بارگذاری باشد) */
  async function ensureAuthReady() {
    if (firebaseAuth) { setupAuthListener(); return true; }
    const ok = await initFirebase();
    if (ok && firebaseAuth) { setupAuthListener(); return true; }
    return false;
  }

  async function handleLoginSubmit() {
    const email = ($('login-email')?.value || '').trim().toLowerCase();
    const password = $('login-password')?.value || '';
    const errEl = $('login-error');
    if (!errEl) return;
    errEl.textContent = '';

    if (email.length > 254 || !isValidEmail(email)) {
      errEl.textContent = 'لطفاً یک ایمیل معتبر وارد کنید.';
      return;
    }
    if (!password) {
      errEl.textContent = 'رمز عبور را وارد کنید.';
      return;
    }
    if (password.length > 128) {
      errEl.textContent = 'رمز عبور بیش از حد طولانی است.';
      return;
    }
    if (loginMode === 'signup') {
      const weak = checkNewPassword(password, email);
      if (weak) { errEl.textContent = weak; return; }
    }

    // قفل موقت بعد از چند تلاش ناموفق پشت‌سرهم
    const now = Date.now();
    if (now < loginLockedUntil) {
      errEl.textContent = 'تلاش‌های ناموفق زیاد بود. ' + toEastern(Math.ceil((loginLockedUntil - now) / 1000)) + ' ثانیه صبر کنید.';
      return;
    }

    const btn = $('btn-login-submit');
    if (btn) btn.disabled = true;
    try {
      errEl.textContent = 'در حال اتصال...';
      if (!(await ensureAuthReady())) {
        errEl.textContent = 'سرویس حساب کاربری در دسترس نیست. اینترنت را بررسی کنید و دوباره تلاش کنید.';
        return;
      }
      let cred;
      if (loginMode === 'signup') {
        cred = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        // ایمیل تأیید (بدون مسدود کردن کاربر)؛ خطا نادیده گرفته می‌شود
        try { await cred.user.sendEmailVerification(); } catch {}
      } else {
        cred = await firebaseAuth.signInWithEmailAndPassword(email, password);
      }
      loginFails = 0;
      errEl.textContent = '';
      // onAuthStateChanged بقیهٔ کارها را انجام می‌دهد
      closeAccountPanel();
      showToast(loginMode === 'signup' ? 'حساب ساخته شد و وارد شدید' : 'با موفقیت وارد شدید');
      setTimeout(() => openSettings(), 250);
    } catch (e) {
      const code = e && e.code;
      // پیام‌ها عمداً عمومی‌اند: نباید معلوم شود کدام ایمیل‌ها ثبت شده‌اند (جلوگیری از user enumeration)
      if (code === 'auth/email-already-in-use') {
        errEl.textContent = 'ثبت‌نام با این ایمیل ممکن نشد. اگر قبلاً ثبت‌نام کرده‌اید، وارد شوید.';
      } else if (code === 'auth/weak-password') {
        errEl.textContent = 'رمز عبور ضعیف است؛ رمز قوی‌تری انتخاب کنید.';
      } else if (code === 'auth/network-request-failed') {
        errEl.textContent = 'اتصال اینترنت برقرار نیست.';
      } else if (code === 'auth/too-many-requests') {
        errEl.textContent = 'تعداد تلاش‌ها زیاد بود. چند دقیقه بعد دوباره امتحان کنید.';
      } else if (code === 'auth/user-disabled') {
        errEl.textContent = 'این حساب غیرفعال شده است.';
      } else if (code === 'auth/invalid-email') {
        errEl.textContent = 'لطفاً یک ایمیل معتبر وارد کنید.';
      } else {
        loginFails++;
        if (loginFails >= LOGIN_MAX_FAILS) {
          loginFails = 0;
          loginLockedUntil = Date.now() + LOGIN_LOCK_MS;
        }
        errEl.textContent = loginMode === 'signup'
          ? 'ثبت‌نام انجام نشد. دوباره تلاش کنید.'
          : 'ایمیل یا رمز عبور اشتباه است.';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /* بازیابی رمز عبور — پاسخ عمداً همیشه یکسان است (افشا نکردن ثبت‌شده بودن ایمیل) */
  async function handlePasswordReset() {
    const errEl = $('login-error');
    const email = ($('login-email')?.value || '').trim().toLowerCase();
    if (errEl) errEl.textContent = '';
    if (email.length > 254 || !isValidEmail(email)) {
      if (errEl) errEl.textContent = 'اول ایمیل خود را در کادر بالا وارد کنید.';
      return;
    }
    if (Date.now() < resetLockedUntil) {
      if (errEl) errEl.textContent = 'کمی صبر کنید و دوباره امتحان کنید.';
      return;
    }
    resetLockedUntil = Date.now() + 60000;
    if (!(await ensureAuthReady())) {
      resetLockedUntil = 0;
      if (errEl) errEl.textContent = 'سرویس حساب کاربری در دسترس نیست. اینترنت را بررسی کنید.';
      return;
    }
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
    } catch (e) {
      if (e && e.code === 'auth/network-request-failed') {
        resetLockedUntil = 0;
        if (errEl) errEl.textContent = 'اتصال اینترنت برقرار نیست.';
        return;
      }
      // سایر خطاها (مثلاً user-not-found) عمداً نادیده گرفته می‌شوند
    }
    showToast('اگر این ایمیل ثبت شده باشد، لینک بازیابی رمز برایش ارسال شد.', 4500);
  }

  /* حذف نسخهٔ محلیِ دادهٔ یک حساب (برای کامپیوتر مشترک مدرسه) */
  function wipeLocalDataFor(email) {
    if (!email) return;
    [STORAGE_KEY_BASE, LAST_READ_KEY_BASE, PREFS_KEY_BASE, READ_HISTORY_KEY_BASE].forEach(base => {
      try { localStorage.removeItem(storageKeyFor(base, email)); } catch {}
    });
  }

  async function handleLogout() {
    const msg = 'از حساب خارج می‌شوید؟ داده‌ها در ابر باقی می‌مانند و با ورود مجدد همگام می‌شوند.';
    if (!confirm(msg)) return;

    const leavingEmail = currentUserEmail;
    let synced = false;
    if (cloudEnabled && firebaseAuth && cloudUid) {
      clearTimeout(cloudSyncTimer);
      synced = await pushToCloud();   // اول آخرین تغییرات ذخیره شود
    }
    if (firebaseAuth) {
      try { await firebaseAuth.signOut(); } catch {}
    }
    currentUserEmail = null;
    cloudUid = null;
    try { localStorage.removeItem(CURRENT_USER_KEY); } catch {}
    // فقط اگر همگام‌سازی موفق بود، نسخهٔ محلی پاک می‌شود تا چیزی از دست نرود
    if (synced) wipeLocalDataFor(leavingEmail);
    loadUserData();
    updateAccountUI();
    showToast('از حساب خارج شدید');
  }

  /* Listen to Firebase auth state */
  function setupAuthListener() {
    if (!cloudEnabled || !firebaseAuth || authListenerSet) return;
    authListenerSet = true;
    firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const em = typeof user.email === 'string' ? user.email.slice(0, 254) : null;
        currentUserEmail = em;
        cloudUid = user.uid;
        try { if (em) localStorage.setItem(CURRENT_USER_KEY, em); } catch {}
        await pullFromCloud(user.uid);
        // also push current local state in case it is newer
        scheduleCloudSave();
      } else {
        currentUserEmail = null;
        cloudUid = null;
        try { localStorage.removeItem(CURRENT_USER_KEY); } catch {}
        loadUserData();
      }
      updateAccountUI();
    });
  }

  function formatHistoryTime(ts) {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      const now = new Date();
      const diff = now - d;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'همین الان';
      if (mins < 60) return toEastern(mins) + ' دقیقه پیش';
      const hours = Math.floor(mins / 60);
      if (hours < 24) return toEastern(hours) + ' ساعت پیش';
      const days = Math.floor(hours / 24);
      if (days < 7) return toEastern(days) + ' روز پیش';
      return d.toLocaleDateString('fa-IR');
    } catch { return ''; }
  }

  function renderHistory() {
    const body = $('history-body');
    if (!body) return;
    const history = loadReadHistory();
    const last = loadLastRead();

    if (!history.length && !(last && last.surah)) {
      body.innerHTML = `
        <div class="history-empty" role="status">
          <div class="history-empty-ico" aria-hidden="true">
            <svg width="40" height="40"><use href="#i-history"/></svg>
          </div>
          <div class="history-empty-title">هنوز سابقه‌ای نیست</div>
          <div class="history-empty-sub">از روز اول، هر سوره‌ای که مطالعه کنید اینجا ذخیره می‌شود</div>
        </div>`;
      return;
    }

    let html = '';

    // آمار کلی
    html += `<div class="progress-stats">
      <div class="progress-stat">
        <div class="progress-stat-num">${toEastern(history.length)}</div>
        <div class="progress-stat-label">سوره مطالعه‌شده</div>
      </div>
      <div class="progress-stat">
        <div class="progress-stat-num">${toEastern(Math.round(history.length / 114 * 100))}٪</div>
        <div class="progress-stat-label">از کل قرآن</div>
      </div>
    </div>`;

    // آخرین مطالعه
    if (last && last.surah) {
      const s = META.find(x => x.n === last.surah);
      if (s) {
        const typeLabel = s.t === 'M' ? 'مکی' : 'مدنی';
        const timeStr = formatHistoryTime(last.at);
        html += `
        <div class="history-card">
          <div class="history-card-top">
            <div class="history-num">${toEastern(s.n)}</div>
            <div class="history-info">
              <div class="history-ar">${s.ar}</div>
              <div class="history-fa">${s.fa || ''}</div>
            </div>
          </div>
          <div class="history-meta">
            <div class="history-meta-row"><span>نوع</span><strong>${typeLabel}</strong></div>
            <div class="history-meta-row"><span>آخرین آیه</span><strong>آیه ${toEastern(last.ayah || 1)}</strong></div>
            ${timeStr ? `<div class="history-meta-row"><span>زمان</span><strong>${timeStr}</strong></div>` : ''}
          </div>
          <button type="button" class="history-continue" id="btn-history-continue">▶ ادامه مطالعه</button>
        </div>`;
      }
    }

    // لیست همه سوره‌های مطالعه‌شده
    if (history.length) {
      html += `<div class="history-list-title">همه مطالعات شما</div>`;
      html += `<div class="history-list">`;
      history.forEach(item => {
        const s = META.find(x => x.n === item.surah);
        if (!s) return;
        const timeStr = formatHistoryTime(item.at);
        html += `<button type="button" class="history-list-item" data-surah="${s.n}">
          <div class="history-list-num">${toEastern(s.n)}</div>
          <div class="history-list-info">
            <div class="history-list-name">${s.fa || s.ar} <span class="history-list-ar">(${s.ar})</span></div>
            <div class="history-list-meta">آیه ${toEastern(item.ayah || 1)}${item.visits > 1 ? ' · ' + toEastern(item.visits) + ' بار' : ''}${timeStr ? ' · ' + timeStr : ''}</div>
          </div>
          <div class="history-list-arrow">‹</div>
        </button>`;
      });
      html += `</div>`;
      html += `<button type="button" class="history-clear-btn" id="btn-clear-history">پاک کردن سابقه مطالعه</button>`;
    }

    body.innerHTML = html;

    const contBtn = $('btn-history-continue');
    if (contBtn && last) {
      contBtn.addEventListener('click', () => openSurah(last.surah, last.ayah || 0));
    }
    body.querySelectorAll('.history-list-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const n = +btn.dataset.surah;
        if (n) openSurah(n);
      });
    });
    const clearBtn = $('btn-clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!confirm('همه سابقه مطالعه پاک شود؟ این کار قابل بازگشت نیست.')) return;
        clearReadHistory();
        renderHistory();
        showToast('سابقه مطالعه پاک شد');
      });
    }
  }

  /* ── Offline IndexedDB ── */
  const DB_NAME = 'quran_db_v2';
  const DB_STORE = 'surahs';
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'number' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  async function idbGet(n) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const req = tx.objectStore(DB_STORE).get(n);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch { return null; }
  }
  async function idbSet(data) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(data);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {}
  }
  /* ── Data ── */
  const fetchInFlight = Object.create(null);

  // دادهٔ قرآن باید قبل از ورود به cache/IndexedDB معتبر باشد؛ این کار جلوی
  // نمایش آیات جابه‌جا، شماره‌های تکراری یا دادهٔ ناقص را می‌گیرد.
  function isValidSurahData(data, n) {
    const meta = META.find(s => s.n === n);
    if (!data || Number(data.number) !== n || !Array.isArray(data.ayahs) || !meta) return false;
    if (data.ayahs.length !== meta.a) return false;
    for (let i = 0; i < data.ayahs.length; i++) {
      const a = data.ayahs[i];
      if (!a || typeof a !== 'object' || Number(a.n) !== i + 1 || !Number.isInteger(Number(a.global)) ||
          typeof a.text !== 'string' || !a.text.trim() || a.text.length > 4000 ||
          (a.tr !== undefined && (typeof a.tr !== 'string' || a.tr.length > 4000))) return false;
      if (i > 0 && Number(a.global) !== Number(data.ayahs[i - 1].global) + 1) return false;
    }
    // Basmala is a separate decorative element for every surah except Al-Fatiha;
    // At-Tawbah has no opening Basmala. Keeping it out of the verse text prevents duplication.
    if (n !== 1 && n !== 9) {
      const firstText = String(data.ayahs[0]?.text || '');
      if (/^ب[ِّ]سْمِ/.test(firstText)) return false;
    }
    return true;
  }

  function makeSurahData(n, raw, meta) {
    return {
      number: n,
      name: 'سورة ' + (meta ? meta.ar : (raw.name || '')),
      faName: meta ? (meta.fa || '') : '',
      ayahs: Array.isArray(raw.ayahs) ? raw.ayahs : []
    };
  }
  // دیتابیس (Firestore) تنها منبع متن آیات است. IndexedDB زیر همین تابع
  // فقط به‌عنوان cache آفلاینِ همان چیزی که قبلاً از API گرفته شده عمل می‌کند —
  // یعنی هیچ فایل محلی داخل پروژه دیگر وجود ندارد.
  const FIRESTORE_SURAH_TIMEOUT_MS = 9000;
  // زیر بار سنگین (خیلی کاربر هم‌زمان)، گاهی یک درخواست به‌صورت گذرا با خطای
  // شبکه/unavailable روبه‌رو می‌شود بدون آن‌که واقعاً مشکلی در دیتابیس باشد؛
  // چند تلاش کوتاه با تأخیر فزاینده (exponential backoff) جلوی نمایش خطای
  // بی‌مورد به کاربر را می‌گیرد. خطاهای «سند وجود ندارد»/«ساختار نامعتبر» را
  // دوباره امتحان نمی‌کنیم چون تلاش دوباره نتیجه را عوض نمی‌کند.
  const FIRESTORE_RETRY_ATTEMPTS = 3;
  const FIRESTORE_RETRY_BASE_MS = 400;
  function isRetryableFirestoreError(err) {
    const code = err && err.code;
    return code === 'unavailable' || code === 'resource-exhausted' ||
      code === 'deadline-exceeded' || code === 'internal' || code === 'cancelled' ||
      code === 'aborted';
  }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function readSurahFromFirestore(n, meta) {
    if (!cloudEnabled) throw new Error('اتصال دیتابیس پیکربندی نشده است.');
    const ok = await initFirebase();
    if (!ok || !firebaseDb) throw new Error('اتصال به دیتابیس ممکن نشد (اینترنت را بررسی کنید).');

    const docId = String(n).padStart(3, '0');
    let lastErr;
    for (let attempt = 0; attempt < FIRESTORE_RETRY_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        // jitter کمی به تأخیر اضافه می‌کنیم تا وقتی خیلی از کاربران هم‌زمان
        // retry می‌کنند، همه دقیقاً در یک لحظه دوباره درخواست نفرستند.
        const delay = FIRESTORE_RETRY_BASE_MS * Math.pow(2, attempt - 1) + Math.random() * 200;
        await sleep(delay);
      }
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('اتصال به دیتابیس بیش از حد طول کشید (اینترنت را بررسی کنید).')), FIRESTORE_SURAH_TIMEOUT_MS));
      try {
        const snap = await Promise.race([firebaseDb.collection('surahs').doc(docId).get(), timeout]);
        if (!snap || !snap.exists) throw new Error(`سوره ${n} هنوز در دیتابیس وارد نشده است.`);
        const raw = snap.data();
        const data = makeSurahData(n, raw, meta);
        if (!isValidSurahData(data, n)) throw new Error(`ساختار سوره ${n} در دیتابیس معتبر نیست.`);
        return data;
      } catch (err) {
        lastErr = err;
        if (!isRetryableFirestoreError(err) || attempt === FIRESTORE_RETRY_ATTEMPTS - 1) throw err;
        console.warn(`تلاش ${attempt + 1} برای سورهٔ ${n} ناموفق بود، تلاش دوباره...`, err);
      }
    }
    throw lastErr;
  }

  async function fetchSurah(n) {
    n = Math.max(1, Math.min(114, Number(n) || 1));
    if (cache[n]) return cache[n];
    if (fetchInFlight[n]) return fetchInFlight[n];

    fetchInFlight[n] = (async () => {
      const meta = META.find(s => s.n === n);

      // وقتی دستگاه آفلاین است، اول cache محلیِ (قبلاً از API گرفته‌شده) را
      // امتحان کن تا کاربر اصلاً منتظر timeout شبکه نماند.
      if (navigator.onLine === false) {
        const storedOffline = await idbGet(n);
        if (isValidSurahData(storedOffline, n)) {
          cache[n] = storedOffline;
          return storedOffline;
        }
      }

      try {
        const data = await readSurahFromFirestore(n, meta);
        cache[n] = data;
        searchIndex = null;
        void idbSet(data);
        return data;
      } catch (dbErr) {
        console.warn(`Surah ${n} از دیتابیس بارگذاری نشد:`, dbErr);
        // اگر قبلاً یک‌بار (آنلاین) گرفته شده و در IndexedDB کش شده، همان را نشان بده
        // به‌جای این‌که کاربر با صفحهٔ خالی بماند.
        const stored = await idbGet(n);
        if (isValidSurahData(stored, n)) {
          cache[n] = stored;
          return stored;
        }
        throw dbErr instanceof Error ? dbErr : new Error(`سوره ${n} در دسترس نیست`);
      }
    })();

    try { return await fetchInFlight[n]; }
    finally { delete fetchInFlight[n]; }
  }

  function prepareAyahs(data) {
    return Array.isArray(data?.ayahs) ? data.ayahs : [];
  }

  /* ── مطالعه پیوسته – بهینه برای نمایش سریع ── */
  // Cancel background rendering from a previous surah/view. Without this guard,
  // a delayed idle callback can append old verses after the user opens another page.
  let renderGeneration = 0;
  let pendingRenderIdle = null;
  let openSurahGeneration = 0;

  function renderScrollMode(highlightAyah) {
    const myRender = ++renderGeneration;
    if (pendingRenderIdle !== null && typeof cancelIdleCallback === 'function') {
      try { cancelIdleCallback(pendingRenderIdle); } catch {}
    }
    pendingRenderIdle = null;

    if (!currentSurah) return;
    const data = currentSurah;
    const list = prepareAyahs(data);
    // Clear without layout thrash
    scrollReader.textContent = '';

    const paper = document.createElement('div');
    paper.className = 'paper-page';
    paper.style.contain = 'content';

    {
      const metaRow = META.find(x => x.n === data.number);
      const bannerName = data.name || (metaRow ? `سُورَةُ ${metaRow.ar}` : '');
      if (bannerName) {
        const banner = document.createElement('div');
        banner.className = 'surah-banner';
        banner.innerHTML = `<span class="surah-banner-orn" aria-hidden="true">۞</span><span class="surah-banner-text">${escapeHtml(bannerName)}</span><span class="surah-banner-orn" aria-hidden="true">۞</span>`;
        paper.appendChild(banner);
      }
    }

    if (data.number !== 9) {
      const first = list[0];
      const isFatihaBasmala = data.number === 1 && first && first.n === 1;
      const bas = document.createElement('div');
      bas.className = 'basmala-block' + (isFatihaBasmala ? ' basmala-ayah' : '');
      if (isFatihaBasmala) {
        bas.innerHTML = `${ayahHtml(first.text)}<span class="ayah-num-badge" data-g="${first.global}" data-n="${first.n}" title="پخش آیه">${toEastern(first.n)}</span>`;
        if (showTranslation && first.tr) {
          const tr = document.createElement('div');
          tr.className = 'ayah-tr-inline basmala-translation';
          tr.textContent = first.tr;
          paper.appendChild(bas);
          paper.appendChild(tr);
        } else {
          paper.appendChild(bas);
        }
      } else {
        if (showTajweed && window.Tajweed) bas.innerHTML = window.Tajweed.html(BASMALA_TJ);
        else bas.textContent = BASMALA;
        paper.appendChild(bas);
      }
    }

    const textBlock = document.createElement('div');
    textBlock.className = 'continuous-text';
    textBlock.style.contain = 'content';
    paper.appendChild(textBlock);
    scrollReader.appendChild(paper);

    // Event delegation (one listener instead of hundreds)
    textBlock.addEventListener('click', e => {
      const badge = e.target.closest('.ayah-num-badge');
      if (badge) {
        e.stopPropagation();
        playAyah(+badge.dataset.g, +badge.dataset.n);
      }
    });

    // دکمه پخش پایین صفحه را فعال کن
    updateReaderPlayBar(data);

    // Progressive rendering, but ALWAYS in document order.
    // Rendering the focus window first used to make verses appear out of order
    // while the remaining chunks were being appended.
    const CHUNK = 42;
    const total = list.length;
    let i = 0;
    let pendingScroll = !!highlightAyah;

    function makeAyahNode(a) {
      if (data.number === 1 && a.n === 1) return [];
      const wrap = document.createElement('span');
      wrap.className = 'ayah-wrap';
      wrap.dataset.ayah = a.n;
      wrap.dataset.text = String(a.text || '');
      if (highlightAyah && a.n === highlightAyah) wrap.classList.add('playing');
      const numBadge = `<span class="ayah-num-badge" data-g="${a.global}" data-n="${a.n}" title="پخش آیه">${toEastern(a.n)}</span>`;
      // Word spans are created only for the currently playing ayah. Creating them
      // for all 6,000+ verses makes mobile layout and scrolling unnecessarily heavy.
      wrap.innerHTML = `${ayahHtml(a.text)}<span class="ayah-actions">${numBadge}</span> `;
      const nodes = [wrap];
      if (showTranslation && a.tr) {
        const tr = document.createElement('div');
        tr.className = 'ayah-tr-inline';
        tr.textContent = a.tr;
        nodes.push(tr);
      }
      return nodes;
    }

    function appendRange(start, end) {
      if (myRender !== renderGeneration) return;
      const frag = document.createDocumentFragment();
      for (let j = start; j < end; j++) {
        makeAyahNode(list[j]).forEach(n => frag.appendChild(n));
      }
      textBlock.appendChild(frag);
    }

    function scrollToFocus() {
      if (!highlightAyah || myRender !== renderGeneration) return;
      const el = textBlock.querySelector(`[data-ayah="${highlightAyah}"]`);
      if (el) {
        scrollToElementWithin(scrollReader, el, 'center');
        // یک تصحیح نهایی و دیرتر: بعضی چیزها (مثل مخفی‌شدن خودکار هدر بعد
        // از یک اسکرول بزرگ) بلافاصله بعد از این محاسبه، ابعاد ظرف را کمی
        // تغییر می‌دهند. یک بار دیگر، بعد از ته‌نشین‌شدن کامل صفحه، دوباره
        // چک می‌کنیم تا وسط‌چین بودن نهایی دقیق بماند.
        setTimeout(() => {
          if (myRender !== renderGeneration) return;
          const el2 = textBlock.querySelector(`[data-ayah="${highlightAyah}"]`);
          if (el2) scrollToElementWithin(scrollReader, el2, 'center');
        }, 350);
      }
      pendingScroll = false;
    }

    // If a focus ayah is requested, render from the beginning through a small
    // window around it. This preserves reading order and still makes the target
    // available quickly.
    const focusIdx = highlightAyah
      ? list.findIndex(a => a.n === highlightAyah)
      : -1;
    const initialEnd = focusIdx >= 0
      ? Math.min(total, focusIdx + 18)
      : Math.min(total, CHUNK);

    if (initialEnd > 0) {
      appendRange(0, initialEnd);
      i = initialEnd;
      if (focusIdx >= 0) {
        requestAnimationFrame(scrollToFocus);
      }
    }

    function appendChunk(deadline) {
      if (myRender !== renderGeneration) return;
      pendingRenderIdle = null;
      if (i >= total) {
        if (pendingScroll) scrollToFocus();
        return;
      }

      const end = Math.min(i + CHUNK, total);
      appendRange(i, end);
      i = end;

      if (i < total) {
        if (typeof requestIdleCallback === 'function') {
          pendingRenderIdle = requestIdleCallback(appendChunk, { timeout: 80 });
        } else {
          pendingRenderIdle = setTimeout(() => appendChunk(), 16);
        }
      } else if (pendingScroll) {
        requestAnimationFrame(scrollToFocus);
      }
    }

    if (i < total) appendChunk();
  }

  function updateReaderHeader() {
    const s = META.find(x => x.n === currentNum);
    if (!s) return;
    $('reader-surah-name').textContent = s.ar;
    $('reader-progress').textContent = `${s.t === 'M' ? 'مکی' : 'مدنی'} · ${toEastern(s.a)} آیه`;
  }

  /* ── Open Surah ── */
  async function openSurah(n, focusAyah) {
    n = Math.max(1, Math.min(114, +n || 1));
    const myOpen = ++openSurahGeneration;
    // Switch view first so user sees reader chrome immediately
    showView('view-reader');
    // Only show full-screen loader if not already cached (avoids black flash)
    const isCached = !!cache[n];
    if (!isCached) loader?.classList.add('show');

    try {
      // یک سقف زمانی مطلق هم اینجا می‌گذاریم: حتی اگر یک مرحلهٔ داخلی غیرمنتظره
      // (مثل IndexedDB مسدودشده) گیر کند، کاربر برای همیشه پشت صفحهٔ تیرهٔ
      // بارگذاری نمی‌ماند و پیام خطای قابل‌فهم می‌بیند.
      const hardTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('بارگذاری بیش از حد طول کشید')), 15000)
      );
      const surahPromise = fetchSurah(n);
      surahPromise.catch(() => {}); // اگر بعد از timeout رد شود، بی‌سروصدا نادیده گرفته شود
      const loadedSurah = await Promise.race([surahPromise, hardTimeout]);
      // Ignore a slower request if the user already opened another surah.
      if (myOpen !== openSurahGeneration) return;
      currentSurah = loadedSurah;
      if (!currentSurah || !currentSurah.ayahs || !currentSurah.ayahs.length) {
        throw new Error('empty surah');
      }
      currentNum = n;
      renderScrollMode(focusAyah || null);
      updateReaderPlayBar(currentSurah);
      updateReaderHeader();
      updateMarkButton();
      syncReaderMenu();
      saveLastRead();
    } catch (err) {
      if (myOpen !== openSurahGeneration) return;
      console.error('openSurah failed:', n, err);
      showToast('بارگذاری ممکن نشد. فایل سوره یا اتصال را بررسی کنید.');
      showView('view-list');
      document.querySelectorAll('.nav button').forEach(b => {
        const isList = b.dataset.tab === 'list';
        b.classList.toggle('active', isList);
        b.setAttribute('aria-selected', isList ? 'true' : 'false');
      });
    } finally {
      loader?.classList.remove('show');
    }
  }

  $('btn-back').addEventListener('click', () => {
    closeReaderMenu();
    saveLastRead();
    showView('view-list');
    document.querySelectorAll('.nav button').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === 'list');
      b.setAttribute('aria-selected', b.dataset.tab === 'list' ? 'true' : 'false');
    });
  });
  // Reader overflow menu actions
  function closeReaderMenu() {
    const menu = $('reader-menu');
    const btn = $('btn-reader-menu');
    menu?.classList.remove('show');
    menu?.setAttribute('aria-hidden', 'true');
    btn?.setAttribute('aria-expanded', 'false');
  }
  function openReaderMenu() {
    syncReaderMenu();
    const menu = $('reader-menu');
    const btn = $('btn-reader-menu');
    menu?.classList.add('show');
    menu?.setAttribute('aria-hidden', 'false');
    btn?.setAttribute('aria-expanded', 'true');
  }
  function syncReaderMenu() {
    const tr = $('reader-menu-translation-label');
    if (tr) tr.textContent = showTranslation ? 'مخفی کردن ترجمه' : 'نمایش ترجمه';
    const tjl = $('reader-menu-tajweed-label');
    if (tjl) tjl.textContent = showTajweed ? 'خاموش کردن رنگ‌های تجوید' : 'روشن کردن رنگ‌های تجوید';
    const mark = $('reader-menu-mark');
    const state = $('reader-menu-mark-state');
    const marked = isBookmarked(currentNum);
    mark?.classList.toggle('active', marked);
    if (state) state.textContent = marked ? 'فعال' : '';
  }
  $('btn-reader-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = $('reader-menu');
    if (menu?.classList.contains('show')) closeReaderMenu();
    else openReaderMenu();
  });
  $('reader-menu')?.addEventListener('click', e => e.stopPropagation());
  $('reader-menu-settings')?.addEventListener('click', () => { closeReaderMenu(); openSettings(); });
  $('reader-menu-copy')?.addEventListener('click', () => { closeReaderMenu(); copyCurrentAyah(); });
  $('reader-menu-mark')?.addEventListener('click', () => { toggleBookmark(); syncReaderMenu(); });
  $('reader-menu-translation')?.addEventListener('click', () => { closeReaderMenu(); toggleTranslation(); });
  $('reader-menu-tajweed')?.addEventListener('click', () => { closeReaderMenu(); toggleTajweed(); });
  $('reader-menu-tj-legend')?.addEventListener('click', () => { closeReaderMenu(); openTjPanel(); });
  $('reader-menu-report')?.addEventListener('click', () => { closeReaderMenu(); openReport(); });
  document.addEventListener('click', (e) => {
    if (!$('reader-menu')?.classList.contains('show')) return;
    if (!e.target.closest('.reader-menu-wrap')) closeReaderMenu();
  });

  /* ── Audio ── */
  function pad3(n) {
    return String(n).padStart(3, '0');
  }

  /* ── Word-by-word highlight (better approximate timing for Arabic) ── */
  let currentWordEls = [];
  let currentWordBoundaries = [];
  let activeAyahWrap = null;
  let activeWordIndex = -1;
  let wordTimingAyah = null;

  function ensureWordMarkup(localNum) {
    const wrap = scrollReader?.querySelector(`.ayah-wrap[data-ayah="${localNum}"]`);
    if (!wrap) return false;
    if (wrap.querySelector('.q-word')) return true;
    const text = wrap.dataset.text || '';
    const actions = wrap.querySelector('.ayah-actions');
    wrap.innerHTML = `${wordSpans(text)} `;
    if (actions) wrap.appendChild(actions);
    return true;
  }

  function getWordEls(localNum) {
    const containers = [scrollReader];
    for (const c of containers) {
      if (!c) continue;
      const wrap = c.querySelector(`.ayah-wrap[data-ayah="${localNum}"]`);
      if (wrap) return Array.from(wrap.querySelectorAll('.q-word'));
    }
    return [];
  }

  function clearWordHighlight() {
    if (activeWordIndex >= 0 && currentWordEls[activeWordIndex]) {
      try { currentWordEls[activeWordIndex].classList.remove('q-word-active'); } catch {}
    }
    if (activeAyahWrap) {
      try { activeAyahWrap.classList.remove('playing'); } catch {}
      activeAyahWrap = null;
    }
    try { currentWordEls.forEach(el => el.classList.remove('q-word-done', 'q-word-active')); } catch {}
    currentWordEls = [];
    currentWordBoundaries = [];
    activeWordIndex = -1;
    wordTimingAyah = null;
    usePreciseTiming = false;
  }

  // renderScrollMode() rebuilds the whole reader DOM from scratch (e.g. when the
  // user changes font size or toggles the translation while audio is playing).
  // Without this, the "playing" highlight and word-by-word sync would silently
  // point at DOM nodes that no longer exist, freezing the highlight until the
  // next ayah starts. This re-finds the current ayah in the fresh DOM and
  // restores both the highlight and the word-timing sync.
  // `expectedGen` is the renderGeneration captured right after renderScrollMode()
  // was called, so a stale retry can bail out if a newer render started meanwhile.
  function reattachPlayingAyah(expectedGen, tries) {
    if (currentAudioAyah == null || !scrollReader) return;
    if (expectedGen !== undefined && expectedGen !== renderGeneration) return;
    const wrap = scrollReader.querySelector(`.ayah-wrap[data-ayah="${currentAudioAyah}"]`);
    if (!wrap) {
      // Progressive rendering may not have reached this ayah yet — retry briefly.
      if ((tries || 0) < 20) setTimeout(() => reattachPlayingAyah(expectedGen, (tries || 0) + 1), 60);
      return;
    }
    wrap.classList.add('playing');
    activeAyahWrap = wrap;
    const qariNow = getQari();
    if (qariNow.wordTiming && qariNow.audioMode !== 'surah' && audioEl.duration && isFinite(audioEl.duration) && audioEl.duration > 0) {
      ensureWordMarkup(currentAudioAyah);
      if (typeof setupWordTimings === 'function') {
        setupWordTimings(currentAudioAyah, audioEl.duration * 1000);
      } else {
        setupWordTimingsApprox(currentAudioAyah, audioEl.duration * 1000);
      }
    }
  }

  const wordTimingCache = {};
  let usePreciseTiming = false;
  let pendingPrecise = null; // { localNum, segs, durationMs }
  let lastScrollWordTs = 0;

  function arabicLetterWeight(text) {
    if (!text) return 1.2;
    const clean = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A\s\u200c\u200d\u0640]/g, '');
    return 1.1 + (clean.length || 1);
  }

  // بارگذاری تنبل فایل زمان‌بندی کلمات (فقط هنگام پخش صوت)
  let wordTimingsLoading = null;
  function ensureWordTimings() {
    if (window.WORD_TIMINGS) return Promise.resolve();
    if (wordTimingsLoading) return wordTimingsLoading;
    wordTimingsLoading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'word-timings.js?v=2';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => resolve(); // بدون زمان‌بندی هم پخش کار می‌کند
      document.head.appendChild(s);
    });
    return wordTimingsLoading;
  }

  // زمان‌بندی دقیق از فایل داخلی (آفلاین) — بعد از بارگذاری تنبل
  async function fetchPreciseWordTimings(surahNum, ayahNum) {
    const key = `${surahNum}:${ayahNum}`;
    if (wordTimingCache[key]) return wordTimingCache[key];
    await ensureWordTimings();
    const raw = (window.WORD_TIMINGS && window.WORD_TIMINGS[key]) || null;
    if (!raw || !Array.isArray(raw) || !raw.length) return null;
    const timings = raw.map(s => ({
      start: s[2],
      end: s[3],
      wFrom: s[0],
      wTo: s[1]
    }));
    wordTimingCache[key] = timings;
    return timings;
  }

  function fillNullEnds(ends, durationMs) {
    let lastEnd = 0;
    for (let i = 0; i < ends.length; i++) {
      if (ends[i] == null) {
        let next = null;
        for (let j = i + 1; j < ends.length; j++) {
          if (ends[j] != null) { next = ends[j]; break; }
        }
        ends[i] = next != null
          ? lastEnd + (next - lastEnd) / 2
          : (durationMs ? durationMs * ((i + 1) / ends.length) : lastEnd + 400);
      }
      lastEnd = ends[i];
    }
    if (durationMs && ends.length) {
      ends[ends.length - 1] = Math.max(ends[ends.length - 1], durationMs * 0.98);
    }
    return ends;
  }

  // زمان‌بندی مرجع (عفاسی) بر اساس مدت صوت قاری فعلی مقیاس می‌شود تا
  // هایلایت کلمه‌به‌کلمه برای همهٔ قاری‌ها هماهنگ بماند.
  function scaleSegsToDuration(segs, durationMs) {
    if (!segs || !segs.length || !durationMs || !isFinite(durationMs) || durationMs <= 0) return segs;
    const refEnd = segs[segs.length - 1].end || 0;
    if (!refEnd) return segs;
    const ratio = durationMs / refEnd;
    if (!isFinite(ratio) || ratio <= 0) return segs;
    if (Math.abs(ratio - 1) < 0.02) return segs;
    const r = Math.min(4, Math.max(0.25, ratio));
    return segs.map(sg => ({ ...sg, start: sg.start * r, end: sg.end * r }));
  }

  function setupWordTimingsFromPrecise(localNum, preciseSegsRaw, durationMs) {
    const preciseSegs = scaleSegsToDuration(preciseSegsRaw, durationMs);
    const els = getWordEls(localNum);
    if (!els.length || !preciseSegs?.length) {
      // هنوز در DOM نیست (رندر تدریجی) — بعداً دوباره تلاش کن
      pendingPrecise = { localNum, segs: preciseSegsRaw, durationMs };
      return false;
    }
    pendingPrecise = null;

    const maxW = Math.max(...preciseSegs.map(s => s.wTo), 0);
    const domN = els.length;
    const ends = new Array(domN).fill(null);

    if (domN === maxW || Math.abs(domN - maxW) <= 1) {
      // تطابق تقریباً کامل
      preciseSegs.forEach(seg => {
        const from = Math.max(0, seg.wFrom);
        const to = Math.min(domN, seg.wTo);
        for (let i = from; i < to; i++) ends[i] = seg.end;
      });
    } else if (domN < maxW) {
      // معمولاً بسم‌الله از متن حذف شده؛ کلمات اول زمان‌بندی را رد کن
      const skip = maxW - domN;
      preciseSegs.forEach(seg => {
        for (let i = seg.wFrom; i < seg.wTo; i++) {
          const di = i - skip;
          if (di >= 0 && di < domN) ends[di] = seg.end;
        }
      });
    } else {
      // کلمات نمایشی بیشتر — نگاشت نسبی
      preciseSegs.forEach(seg => {
        const from = Math.floor(seg.wFrom * domN / maxW);
        const to = Math.ceil(seg.wTo * domN / maxW);
        for (let i = Math.max(0, from); i < Math.min(domN, to); i++) {
          ends[i] = seg.end;
        }
      });
    }

    fillNullEnds(ends, durationMs);

    // فقط کلاس قبلی را پاک کن (بدون از دست دادن state لازم)
    if (activeWordIndex >= 0 && currentWordEls[activeWordIndex]) {
      try { currentWordEls[activeWordIndex].classList.remove('q-word-active'); } catch {}
    }
    currentWordBoundaries = ends.map(end => ({ end }));
    currentWordEls = els;
    activeWordIndex = -1;
    wordTimingAyah = localNum;
    usePreciseTiming = true;
    return true;
  }

  function setupWordTimingsApprox(localNum, durationMs) {
    if (activeWordIndex >= 0 && currentWordEls[activeWordIndex]) {
      try { currentWordEls[activeWordIndex].classList.remove('q-word-active'); } catch {}
    }
    usePreciseTiming = false;
    if (!durationMs || !isFinite(durationMs) || durationMs <= 0) return;
    const els = getWordEls(localNum);
    if (!els.length) return;

    const n = els.length;
    const weights = els.map(el => arabicLetterWeight(el.textContent));
    const totalW = weights.reduce((a, b) => a + b, 0) || 1;
    const gap = Math.min(18, durationMs * 0.004);
    const lead = Math.min(25, durationMs * 0.01);
    const trail = Math.min(45, durationMs * 0.015);
    const gapsTotal = Math.max(0, n - 1) * gap;
    const usable = Math.max(50, durationMs - lead - trail - gapsTotal);

    let acc = lead;
    currentWordBoundaries = weights.map((w, i) => {
      acc += (w / totalW) * usable;
      const end = acc;
      if (i < n - 1) acc += gap;
      return { end };
    });
    if (currentWordBoundaries.length) {
      currentWordBoundaries[currentWordBoundaries.length - 1].end = durationMs;
    }
    currentWordEls = els;
    activeWordIndex = -1;
    wordTimingAyah = localNum;
  }

  function setupWordTimings(localNum, durationMs) {
    if (usePreciseTiming && wordTimingAyah === localNum && currentWordBoundaries.length) return;
    if (pendingPrecise && pendingPrecise.localNum === localNum) {
      if (setupWordTimingsFromPrecise(localNum, pendingPrecise.segs, durationMs || pendingPrecise.durationMs)) return;
    }
    setupWordTimingsApprox(localNum, durationMs);
  }

  function syncWordHighlight() {
    // اگر کلمات هنوز آماده نبودند، دوباره وصل کن
    if ((!currentWordBoundaries.length || !currentWordEls.length) && currentAudioAyah != null) {
      if (pendingPrecise && pendingPrecise.localNum === currentAudioAyah) {
        const dur = (audioEl.duration && isFinite(audioEl.duration))
          ? audioEl.duration * 1000
          : pendingPrecise.durationMs;
        setupWordTimingsFromPrecise(currentAudioAyah, pendingPrecise.segs, dur);
      } else if (audioEl.duration && isFinite(audioEl.duration) && audioEl.duration > 0) {
        setupWordTimings(currentAudioAyah, audioEl.duration * 1000);
      }
    }
    if (!currentWordBoundaries.length) return;

    const exact = usePreciseTiming && getQari().timingSource === 'exact';
    const t = audioEl.currentTime * 1000 + (usePreciseTiming ? (exact ? 30 : 60) : 180);
    let idx = currentWordBoundaries.findIndex(b => t < b.end);
    if (idx === -1) idx = currentWordBoundaries.length - 1;
    if (idx === activeWordIndex) return;

    if (activeWordIndex >= 0 && currentWordEls[activeWordIndex]) {
      currentWordEls[activeWordIndex].classList.remove('q-word-active');
      currentWordEls[activeWordIndex].classList.add('q-word-done');
    }
    for (let k = 0; k < idx; k++) currentWordEls[k]?.classList.add('q-word-done');
    for (let k = idx; k < currentWordEls.length; k++) currentWordEls[k]?.classList.remove('q-word-done');
    activeWordIndex = idx;
    const el = currentWordEls[activeWordIndex];
    if (!el) return;
    el.classList.add('q-word-active');

    // اسکرول محدود (هر حداکثر ۴۰۰ms یک‌بار) تا لگ نکند
    const now = performance.now();
    if (now - lastScrollWordTs > 400) {
      lastScrollWordTs = now;
      try {
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight || 600;
        if (rect.top < 100 || rect.bottom > viewH - 120) {
          scrollToElementWithin(scrollReader, el, 'nearest');
        }
      } catch {}
    }
  }

  // حلقهٔ نرم (هر فریم) برای هایلایت دقیق‌تر از رویداد کم‌تکرار timeupdate
  let wordRafId = null;
  function wordRafTick() {
    wordRafId = null;
    if (audioEl.paused || audioEl.ended) return;
    syncWordHighlight();
    wordRafId = requestAnimationFrame(wordRafTick);
  }
  function startWordRaf() {
    if (wordRafId == null) wordRafId = requestAnimationFrame(wordRafTick);
  }
  function stopWordRaf() {
    if (wordRafId != null) { cancelAnimationFrame(wordRafId); wordRafId = null; }
  }
  audioEl.addEventListener('play', startWordRaf);
  audioEl.addEventListener('playing', startWordRaf);
  audioEl.addEventListener('pause', stopWordRaf);
  audioEl.addEventListener('ended', stopWordRaf);
  audioEl.addEventListener('seeked', syncWordHighlight);
  audioEl.addEventListener('timeupdate', syncWordHighlight);


  let audioPlayToken = 0;
  let playbackStarted = false;

  function setAudioButtonState(playing) {
    audioPlaying = !!playing;
    const btn = $('audio-play');
    if (!btn) return;
    btn.classList.toggle('is-playing', audioPlaying);
    btn.setAttribute('aria-label', audioPlaying ? 'توقف پخش' : 'ادامه پخش');
  }

  function startPlayback(url, label, sub, ayahLocal, ayahGlobal) {
    const token = ++audioPlayToken;
    let triedFallback = false;
    playbackStarted = false;

    try {
      audioEl.pause();
    } catch {}

    currentAudioAyah = ayahLocal || null;
    currentAudioGlobal = ayahGlobal || null;
    setAudioButtonState(true);
    $('audio-label').textContent = label;
    $('audio-sub').textContent = sub || getQari().name;
    audioBar.classList.add('show');
    hideReaderPlayBar();

    const failPlay = () => {
      if (token !== audioPlayToken) return;
      showToast('پخش صدا ممکن نشد. اینترنت را بررسی کنید.');
      setAudioButtonState(false);
    };

    // تلاش برای منبع جایگزین وقتی فایل اصلی لود نشود
    const tryFallback = () => {
      if (triedFallback || token !== audioPlayToken) return;
      triedFallback = true;
      let alt = null;

      // ۱) کیفیت پایین‌تر از همان CDN
      if (url.includes('/audio/128/')) {
        alt = url.replace('/audio/128/', '/audio/64/');
      }
      // ۲) برای مشاری: منبع everyayah
      else if (url.includes('ar.alafasy') && ayahLocal && currentNum) {
        alt = `https://everyayah.com/data/Alafasy_128kbps/${pad3(currentNum)}${pad3(ayahLocal)}.mp3`;
      }

      if (!alt) {
        failPlay();
        return;
      }
      if (!isAllowedAudioUrl(alt)) { failPlay(); return; }
      audioEl.src = alt;
      try { audioEl.playbackRate = audioSpeed; } catch {}
      audioEl.play().then(() => {
        if (token === audioPlayToken) setAudioButtonState(true);
      }).catch(failPlay);
    };

    // خطای بارگذاری فایل (۴۰۳، ۴۰۴ و ...)
    const onMediaError = () => {
      audioEl.removeEventListener('error', onMediaError);
      if (token !== audioPlayToken || playbackStarted) return;
      playbackStarted = true;
      console.warn('audio media error', audioEl.error);
      tryFallback();
    };
    audioEl.addEventListener('error', onMediaError);

    // تنظیم منبع جدید (فقط میزبان‌های صوتیِ فهرست سفید)
    if (!isAllowedAudioUrl(url)) { failPlay(); return; }
    audioEl.src = url;
    try { audioEl.playbackRate = audioSpeed; } catch {}

    const doPlay = () => {
      if (token !== audioPlayToken) return;
      try { audioEl.playbackRate = audioSpeed; } catch {}
      const p = audioEl.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          if (token === audioPlayToken) {
            setAudioButtonState(true);
            audioEl.removeEventListener('error', onMediaError);
          }
        }).catch(err => {
          if (token !== audioPlayToken) return;
          if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
            if (err.name === 'NotAllowedError') {
              showToast('برای پخش صدا، دوباره روی دکمه بزنید');
              setAudioButtonState(false);
            }
            return;
          }
          console.warn('audio play error', err);
          tryFallback();
        });
      }
    };

    if (audioEl.readyState >= 2) {
      doPlay();
    } else {
      const onReady = () => {
        audioEl.removeEventListener('canplay', onReady);
        doPlay();
      };
      audioEl.addEventListener('canplay', onReady);
      setTimeout(() => {
        if (token === audioPlayToken) doPlay();
      }, 700);
    }
  }

  function updateReaderPlayBar(data) {
    const bar = $('reader-play-bar');
    const btn = $('btn-play-surah');
    if (!bar || !btn || !data) return;
    const label = bar.querySelector('.audio-info .label');
    const sub = bar.querySelector('.audio-info .sub');
    const meta = META.find(x => x.n === data.number);
    if (label) label.textContent = 'پخش سوره' + (meta ? ' · ' + meta.ar : '');
    if (sub) sub.textContent = getQari().name;
    btn.onclick = () => {
      if (currentSurah?.number === data.number && audioEl.src && currentAudioGlobal != null) {
        if (audioEl.paused) {
          audioEl.play().catch(() => showToast('پخش ممکن نشد'));
        } else {
          audioEl.pause();
        }
      } else {
        playSurah(data.number);
      }
    };
    btn.setAttribute('aria-label', 'پخش سوره');
    bar.onclick = null;
    bar.classList.add('show');
  }
  function hideReaderPlayBar() {
    const bar = $('reader-play-bar');
    if (bar) bar.classList.remove('show');
  }

  function playSurah(surahNum) {
    if (!surahNum || !currentSurah || currentSurah.number !== surahNum) return;
    // پخش ترتیبی آیه به آیه تا هایلایت آیه و کلمه درست کار کند (کمک به یادگیری)
    const prepared = prepareAyahs(currentSurah);
    if (!prepared.length) return;
    const first = prepared[0];
    playAyah(first.global, first.n);
  }

  function playAyah(globalNum, localNum) {
    if (!globalNum && !(getQari().audioMode === 'surah' && currentNum)) return;
    const qari = getQari();
    let url, label;
    if (qari.audioMode === 'surah' && qari.surahBase && currentNum) {
      // صوت سوره کامل (برای قاری‌هایی که آیه به آیه روی CDN نیستند)
      const sn = String(currentNum).padStart(3, '0');
      url = qari.surahBase + sn + '.mp3';
      const meta = META.find(x => x.n === currentNum);
      label = `سوره ${meta ? (meta.fa || meta.ar) : toEastern(currentNum)} · کامل`;
    } else {
      url = `https://cdn.islamic.network/quran/audio/128/${qari.id}/${globalNum}.mp3`;
      label = `آیه ${toEastern(localNum)} · ${META.find(x => x.n === currentNum)?.ar || ''}`;
    }
    startPlayback(
      url,
      label,
      qari.name,
      localNum,
      globalNum
    );
    clearWordHighlight();
    const activeWrap = scrollReader?.querySelector(`.ayah-wrap[data-ayah="${localNum}"]`);
    if (activeWrap) {
      activeWrap.classList.add('playing');
      activeAyahWrap = activeWrap;
      // Only scroll when the ayah is actually outside the comfortable viewport.
      // Smooth scrolling on every audio event causes visible jank on phones.
      try {
        const rect = activeWrap.getBoundingClientRect();
        const viewH = window.innerHeight || 700;
        if (rect.top < 110 || rect.bottom > viewH - 150) {
          scrollToElementWithin(scrollReader, activeWrap, 'center');
        }
      } catch {}
      if (getQari().audioMode !== 'surah') ensureWordMarkup(localNum);
    }
    pendingPrecise = null;

    const surahNum = currentNum;
    // شماره واقعی آیه از دادهٔ سوره
    let realAyahNum = localNum;
    if (currentSurah && currentSurah.ayahs) {
      const raw = currentSurah.ayahs.find(a => a.global === globalNum);
      if (raw) realAyahNum = raw.n;
    }

    // حالت «سوره کامل» (لحیدان): فایل صوتی کل سوره است و تایمینگ کلمه‌به‌کلمهٔ آیه‌ای
    // به‌اشتباه روی کل مدت سوره مقیاس می‌شد و هایلایت عملاً فریز می‌شد؛
    // در این حالت هایلایت کلمه‌ای را کاملاً غیرفعال می‌کنیم.
    const qariHasTiming = getQari().wordTiming && getQari().audioMode !== 'surah';

    const tryApplyPrecise = (segs, durationMs) => {
      if (!segs || currentAudioAyah !== localNum) return false;
      return setupWordTimingsFromPrecise(localNum, segs, durationMs);
    };

    if (qariHasTiming) {
      fetchPreciseWordTimings(surahNum, realAyahNum).then(segs => {
        if (!segs || currentAudioAyah !== localNum) {
          if (currentAudioAyah === localNum && audioEl.duration && isFinite(audioEl.duration)) {
            setupWordTimingsApprox(localNum, audioEl.duration * 1000);
          }
          return;
        }
        const dur = (audioEl.duration && isFinite(audioEl.duration))
          ? audioEl.duration * 1000
          : (segs[segs.length - 1]?.end || 0);
        if (!tryApplyPrecise(segs, dur)) {
          // DOM هنوز آماده نیست — چند بار تلاش مجدد
          let tries = 0;
          const retry = () => {
            if (currentAudioAyah !== localNum) return;
            if (tryApplyPrecise(segs, dur) || tries++ > 12) return;
            setTimeout(retry, 80);
          };
          setTimeout(retry, 60);
        }
      });
    }

    const onMeta = () => {
      audioEl.removeEventListener('loadedmetadata', onMeta);
      if (usePreciseTiming && wordTimingAyah === localNum) return;
      if (qariHasTiming) {
        const key = `${surahNum}:${realAyahNum}`;
        const cached = wordTimingCache[key];
        if (cached && tryApplyPrecise(cached, audioEl.duration * 1000)) return;
      }
      if (!pendingPrecise && getQari().audioMode !== 'surah') setupWordTimingsApprox(localNum, audioEl.duration * 1000);
    };
    audioEl.addEventListener('loadedmetadata', onMeta);
    if (audioEl.duration && isFinite(audioEl.duration) && audioEl.duration > 0) {
      onMeta();
    }
  }

  async function copyCurrentAyah() {
    if (!currentNum) {
      showToast('ابتدا یک سوره را باز کنید');
      return;
    }
    const surahNum = currentNum;
    const localNum = currentAudioAyah || 1;
    const globalNum = currentAudioGlobal || null;
    const meta = META.find(m => m.n === surahNum);
    let ar = '', tr = '';
    try {
      const data = cache[surahNum] || currentSurah;
      if (data && data.ayahs) {
        let a = (globalNum && data.ayahs.find(x => x.global === globalNum))
          || data.ayahs.find(x => x.n === localNum)
          || data.ayahs[0];
        if (a) { ar = a.text || ''; tr = a.tr || ''; }
      }
      if (!ar) {
        const full = await fetchSurah(surahNum);
        const a = (globalNum && full.ayahs.find(x => x.global === globalNum))
          || full.ayahs.find(x => x.n === localNum)
          || full.ayahs[0];
        if (a) { ar = a.text || ''; tr = a.tr || ''; }
      }
    } catch {}
    if (!ar) {
      showToast('متن آیه پیدا نشد');
      return;
    }
    const ref = `سوره ${meta ? (meta.fa || meta.ar) : surahNum} · آیه ${toEastern(localNum)}`;
    const text = [ar, tr, '', ref, '— قرآن کریم · نور'].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('آیه در کلیپ‌بورد کپی شد');
    } catch {
      showToast('امکان کپی در این مرورگر نیست');
    }
  }

  function stopAudio() {
    audioPlayToken++; // هر پخش در حال انتظار را باطل کن
    try {
      audioEl.pause();
      audioEl.removeAttribute('src');
      audioEl.load();
    } catch {}
    playbackStarted = false;
    setAudioButtonState(false);
    currentAudioAyah = null;
    currentAudioGlobal = null;
    audioBar.classList.remove('show');
    document.querySelectorAll('.ayah-wrap.playing').forEach(c => c.classList.remove('playing'));
    clearWordHighlight();
    // اگر هنوز داخل صفحه مطالعه هستیم، نوار پخش پایین را برگردان
    if ($('view-reader')?.classList.contains('active') && currentSurah) {
      updateReaderPlayBar(currentSurah);
    }
  }

  $('audio-play')?.addEventListener('click', () => {
    if (!audioPlaying && !audioEl.src) return;
    if (audioEl.paused) {
      const p = audioEl.play();
      if (p && p.catch) p.catch(() => {
        setAudioButtonState(false);
        showToast('پخش ممکن نشد');
      });
    } else {
      audioEl.pause();
    }
  });

  // همگام‌سازی آیکون با وضعیت واقعی صدا
  audioEl.addEventListener('play', () => {
    setAudioButtonState(true);
  });
  audioEl.addEventListener('pause', () => {
    if (!audioEl.ended) {
      setAudioButtonState(false);
    }
  });
  audioEl.addEventListener('waiting', () => {
    // در حال بافر – آیکون پخش بماند
  });
  // خطای مدیا در startPlayback مدیریت می‌شود (fallback به ۶۴kbps و ...)
  // اینجا toast تکراری نشان نمی‌دهیم
  $('audio-close')?.addEventListener('click', stopAudio);

  // سرعت پخش
  function updateSpeedBtn() {
    const btn = $('audio-speed');
    if (!btn) return;
    const label = audioSpeed === 1 ? '۱×' : (audioSpeed + '×').replace('.', '٫');
    // نمایش فارسی‌تر
    const map = { 0.75: '۰٫۷۵×', 1: '۱×', 1.25: '۱٫۲۵×', 1.5: '۱٫۵×' };
    btn.textContent = map[audioSpeed] || (audioSpeed + '×');
    btn.setAttribute('aria-label', 'سرعت پخش: ' + (map[audioSpeed] || audioSpeed + '×'));
  }
  updateSpeedBtn();
  $('audio-speed')?.addEventListener('click', () => {
    const i = SPEED_STEPS.indexOf(audioSpeed);
    audioSpeed = SPEED_STEPS[(i + 1) % SPEED_STEPS.length];
    try { audioEl.playbackRate = audioSpeed; } catch {}
    updateSpeedBtn();
    savePrefs();
    showToast('سرعت پخش: ' + ( {0.75:'۰٫۷۵',1:'۱',1.25:'۱٫۲۵',1.5:'۱٫۵'}[audioSpeed] || audioSpeed ) + ' برابر');
  });

  // تکرار آیه
  function updateRepeatBtn() {
    const btn = $('audio-repeat');
    if (!btn) return;
    btn.classList.toggle('active', audioRepeat);
    btn.setAttribute('aria-pressed', audioRepeat ? 'true' : 'false');
  }
  updateRepeatBtn();
  $('audio-repeat')?.addEventListener('click', () => {
    audioRepeat = !audioRepeat;
    updateRepeatBtn();
    savePrefs();
    showToast(audioRepeat ? 'تکرار آیه روشن شد' : 'تکرار آیه خاموش شد');
  });

  audioEl.addEventListener('ended', () => {
    // قاری سوره کامل: بعد از پایان سوره متوقف شو (یا تکرار کل سوره)
    if (getQari().audioMode === 'surah') {
      if (audioRepeat && currentNum) {
        playAyah(currentAudioGlobal || 1, currentAudioAyah || 1);
      } else {
        stopAudio();
      }
      return;
    }
    // تکرار آیه فعلی
    if (audioRepeat && currentAudioGlobal && currentAudioAyah) {
      playAyah(currentAudioGlobal, currentAudioAyah);
      return;
    }
    // auto next ayah in scroll mode
    if (currentSurah && currentAudioGlobal) {
      const next = currentSurah.ayahs.find(a => a.global === currentAudioGlobal + 1);
      if (next) {
        const prepared = prepareAyahs(currentSurah);
        const disp = prepared.find(p => p.global === next.global);
        playAyah(next.global, disp ? disp.n : next.n);
      } else {
        stopAudio();
      }
    } else {
      stopAudio();
    }
  });

  /* ── Settings ── */
  function renderQariList() {
    const list = $('qari-list');
    if (!list) return;
    list.innerHTML = QARIS.map(q => {
      const active = q.id === currentQari;
      let badge = '';
      if (q.wordTiming) badge = '<span class="premium-badge" style="font-size:10px;padding:1px 6px">کلمه‌به‌کلمه</span>';
      else if (q.audioMode === 'surah') badge = '<span class="premium-badge" style="font-size:10px;padding:1px 6px;opacity:.75">سوره کامل</span>';
      return `<button type="button" class="qari-btn${active ? ' active' : ''}" data-qari="${q.id}">
        <span>${q.name} ${badge}</span>
        <span class="qari-check">✓</span>
      </button>`;
    }).join('');
  }

  function setQari(id) {
    if (!QARIS.some(q => q.id === id)) return;
    if (audioPlaying || !audioEl.paused) stopAudio();
    currentQari = id;
    savePrefs();
    renderQariList();
    const name = getQari().name;
    const sub = $('audio-sub');
    if (sub) sub.textContent = name;
    const readerSub = $('reader-play-bar')?.querySelector('.audio-info .sub');
    if (readerSub) readerSub.textContent = name;
    showToast('قاری: ' + getQari().short);
  }

  let settingsReturnView = 'view-list';

  function openSettings() {
    $('report-panel')?.classList.remove('show');
    $('account-panel')?.classList.remove('show');
    $('overlay')?.classList.remove('show');
    // فقط وضعیت دکمه‌ها را همگام کن (بدون reflow سنگین روی صفحه)
    document.querySelectorAll('.theme-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
    const val = $('font-val');
    if (val) val.textContent = toEastern(fontSize);
    syncTrButtons();
    syncTjButtons();
    renderQariList();
    updateAccountUI();

    const active = document.querySelector('.view.active');
    if (active && active.id !== 'view-settings') settingsReturnView = active.id;
    showView('view-settings');
  }
  function closeSettings() {
    $('report-panel')?.classList.remove('show');
    $('account-panel')?.classList.remove('show');
    $('overlay')?.classList.remove('show');
    showView(settingsReturnView || 'view-list');
  }

  // Drag-to-dismiss for bottom sheets (swipe down to close)
  function enableDragDismiss(panelId, onDismiss) {
    const panel = $(panelId);
    if (!panel) return;
    const ov = $('overlay');
    let startY = 0, currentY = 0, dragging = false, startTime = 0;

    const onStart = (clientY) => {
      if (!panel.classList.contains('show')) return;
      // Only start drag near the top of the panel (handle area ~80px)
      const rect = panel.getBoundingClientRect();
      if (clientY - rect.top > 90) return; // ignore if not near top
      startY = clientY;
      currentY = 0;
      dragging = true;
      startTime = Date.now();
      panel.classList.add('dragging');
      ov?.classList.add('dragging');
    };

    const onMove = (clientY, e) => {
      if (!dragging) return;
      const dy = clientY - startY;
      if (dy < 0) { // only allow downward
        currentY = 0;
        panel.style.transform = 'translateY(0)';
        if (ov) ov.style.opacity = '1';
        return;
      }
      currentY = dy;
      panel.style.transform = `translateY(${dy}px)`;
      if (ov) {
        const progress = Math.min(dy / 280, 1);
        ov.style.opacity = String(1 - progress * 0.85);
      }
      if (e && e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove('dragging');
      ov?.classList.remove('dragging');
      const elapsed = Date.now() - startTime;
      const velocity = currentY / Math.max(elapsed, 1); // px/ms
      const shouldClose = currentY > 90 || (currentY > 45 && velocity > 0.35);
      if (shouldClose) {
        // continue motion downward then dismiss
        panel.classList.remove('dragging');
        ov?.classList.remove('dragging');
        const extra = Math.min(currentY + 120, window.innerHeight);
        panel.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)';
        panel.style.transform = `translateY(${extra}px)`;
        if (ov) {
          ov.style.transition = 'opacity 0.28s cubic-bezier(0.32, 0.72, 0, 1)';
          ov.style.opacity = '0';
        }
        setTimeout(() => {
          panel.style.transition = '';
          panel.style.transform = '';
          if (ov) { ov.style.transition = ''; ov.style.opacity = ''; }
          onDismiss();
        }, 280);
      } else {
        // soft snap back
        panel.classList.remove('dragging');
        ov?.classList.remove('dragging');
        panel.style.transition = 'transform 0.34s cubic-bezier(0.32, 0.72, 0, 1)';
        panel.style.transform = 'translateY(0)';
        if (ov) {
          ov.style.transition = 'opacity 0.34s cubic-bezier(0.32, 0.72, 0, 1)';
          ov.style.opacity = '1';
        }
        setTimeout(() => {
          panel.style.transition = '';
          panel.style.transform = '';
          if (ov) { ov.style.transition = ''; ov.style.opacity = ''; }
        }, 340);
      }
      currentY = 0;
    };

    panel.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) onStart(e.touches[0].clientY);
    }, { passive: true });

    panel.addEventListener('touchmove', (e) => {
      if (dragging && e.touches.length === 1) onMove(e.touches[0].clientY, e);
    }, { passive: false });

    panel.addEventListener('touchend', onEnd, { passive: true });
    panel.addEventListener('touchcancel', onEnd, { passive: true });
  }

  enableDragDismiss('report-panel', () => {
    $('report-panel')?.classList.remove('show');
    $('report-panel') && ($('report-panel').style.transform = '');
    $('overlay')?.classList.remove('show');
  });
  enableDragDismiss('account-panel', () => {
    closeAccountPanel();
    $('overlay')?.classList.remove('show');
  });
  enableDragDismiss('jump-panel', closeJumpPanel);
  enableDragDismiss('tj-panel', () => closeTjPanel());

  // Prevent clicks inside the panel from bubbling to overlay
  $('report-panel')?.addEventListener('click', e => e.stopPropagation());
  $('account-panel')?.addEventListener('click', e => e.stopPropagation());
  $('jump-panel')?.addEventListener('click', e => e.stopPropagation());
  $('tj-panel')?.addEventListener('click', e => e.stopPropagation());

  $('btn-settings-home')?.addEventListener('click', openSettings);
  $('btn-settings-back')?.addEventListener('click', closeSettings);
  $('overlay')?.addEventListener('click', () => {
    if ($('report-panel')?.classList.contains('show')) returnToSettingsOrClose();
    else if ($('account-panel')?.classList.contains('show')) {
      closeAccountPanel();
      $('overlay')?.classList.remove('show');
    } else if ($('jump-panel')?.classList.contains('show')) {
      closeJumpPanel();
    } else if ($('tj-panel')?.classList.contains('show')) {
      closeTjPanel();
    }
  });

  /* ── پرش به آیه (داخل همین سوره‌ای که در حال خواندنش هستیم) ── */
  function openJumpPanel() {
    if (!currentNum) return;
    const meta = META.find(m => m.n === currentNum);
    const hint = $('jump-panel-hint');
    if (hint) {
      hint.textContent = meta
        ? `سوره ${meta.fa || meta.ar} · بین آیهٔ ۱ تا ${toEastern(meta.a)}`
        : '';
    }
    const input = $('jump-ayah-input');
    if (input) { input.value = ''; }
    const err = $('jump-ayah-error');
    if (err) { err.style.display = 'none'; err.textContent = ''; }
    $('overlay')?.classList.add('show');
    $('jump-panel')?.classList.add('show');
    setTimeout(() => input?.focus(), 250);
  }
  function closeJumpPanel() {
    $('jump-panel')?.classList.remove('show');
    $('overlay')?.classList.remove('show');
  }
  function submitJumpToAyah() {
    const meta = META.find(m => m.n === currentNum);
    const input = $('jump-ayah-input');
    const err = $('jump-ayah-error');
    const raw = toWesternDigits((input?.value || '').trim());
    const n = parseInt(raw, 10);
    const max = meta ? meta.a : 0;
    if (!raw || !Number.isFinite(n) || n < 1 || (max && n > max)) {
      if (err) {
        err.textContent = meta
          ? `لطفاً عددی بین ۱ تا ${toEastern(max)} وارد کنید.`
          : 'شمارهٔ آیه معتبر نیست.';
        err.style.display = '';
      }
      input?.focus();
      return;
    }
    closeJumpPanel();
    openSurah(currentNum, n);
  }
  $('reader-menu-jump')?.addEventListener('click', () => { closeReaderMenu(); openJumpPanel(); });
  $('btn-jump-cancel')?.addEventListener('click', closeJumpPanel);
  $('btn-jump-go')?.addEventListener('click', submitJumpToAyah);
  $('jump-ayah-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submitJumpToAyah(); }
  });
  $('jump-ayah-input')?.addEventListener('input', () => {
    const err = $('jump-ayah-error');
    if (err) err.style.display = 'none';
  });

  /* Account buttons */
  $('btn-open-login')?.addEventListener('click', () => {
    openAccountPanel();
  });
  $('btn-logout')?.addEventListener('click', handleLogout);
  $('btn-login-cancel')?.addEventListener('click', () => {
    closeAccountPanel();
  });
  $('account-handle')?.addEventListener('click', closeAccountPanel);
  $('btn-login-submit')?.addEventListener('click', handleLoginSubmit);
  $('btn-forgot-password')?.addEventListener('click', handlePasswordReset);
  document.querySelectorAll('.login-mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      loginMode = tab.dataset.mode;
      updateLoginModeUI();
    });
  });
  // Enter key on password/email submits
  $('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLoginSubmit();
  });
  $('login-email')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') $('login-password')?.focus();
  });

  // انتخاب قاری
  $('qari-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.qari-btn');
    if (!btn) return;
    setQari(btn.dataset.qari);
  });

  /* پاک کردن داده‌های ذخیره‌شدهٔ خود برنامه */
  async function clearAppData() {
    const ok = confirm('همهٔ نشانه‌ها، تاریخچه، تنظیمات و داده‌های ذخیره‌شده پاک می‌شود.\n\nادامه می‌دهید؟');
    if (!ok) return;

    // Whether we can actually reach the network right now. This matters
    // because the service worker + its Cache Storage are the ONLY thing
    // that lets the app continue working when offline. If we're offline,
    // wiping them and then reloading leaves the browser with nothing to
    // load the app from, so it fails with a bare "check your internet
    // connection" error instead of the app. In that case we only clear the
    // user's local data and leave the app shell/cache alone so it still
    // opens normally.
    const isOnline = typeof navigator === 'undefined' || !('onLine' in navigator) || navigator.onLine;

    try {
      // localStorage
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('quran_') || k.includes('quran'))) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
      // احتیاط: کلیدهای اصلی را هم مستقیم پاک کن
      try { localStorage.removeItem(STORAGE_KEY()); } catch {}
      try { localStorage.removeItem(PREFS_KEY()); } catch {}
      try { localStorage.removeItem(LAST_READ_KEY()); } catch {}
      try { localStorage.removeItem(CURRENT_USER_KEY); } catch {}
      try { localStorage.removeItem(USERS_KEY); } catch {}
    } catch {}

    // IndexedDB
    try {
      if (window.indexedDB) {
        await new Promise((resolve) => {
          const req = indexedDB.deleteDatabase(typeof DB_NAME !== 'undefined' ? DB_NAME : 'quran_db_v2');
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
          setTimeout(resolve, 1500);
        });
      }
    } catch {}

    showToast(isOnline
      ? 'داده‌ها پاک شد. در حال بارگذاری مجدد...'
      : 'داده‌های محلی پاک شد. برای دریافت نسخهٔ تازه، صفحه را دوباره بارگذاری کنید.');
    setTimeout(() => {
      if (isOnline) {
        const url = new URL(location.href);
        url.searchParams.set('_cb', String(Date.now()));
        location.replace(url.toString());
      } else {
        // No cache-busting here: the service worker and its cached app
        // shell are still intact, so a normal reload keeps working offline.
        location.reload();
      }
    }, 600);
  }

  $('btn-clear-cache')?.addEventListener('click', clearAppData);

  function returnToSettingsOrClose() {
    $('report-panel')?.classList.remove('show');
    $('report-panel') && ($('report-panel').style.transform = '');
    $('overlay')?.classList.remove('show');
  }
  $('report-handle')?.addEventListener('click', returnToSettingsOrClose);

  /* ── Report problem (like quran.com) ── */
  let reportType = 'text';

  function openReport() {
    $('overlay')?.classList.add('show');
    $('report-panel')?.classList.add('show');

    // Prefill context from current reading position
    const ctx = $('report-context');
    if (ctx) {
      if (currentNum && currentSurah) {
        const s = META.find(x => x.n === currentNum);
        let ayahHint = '';
        if (currentAudioAyah) ayahHint = ` آیه ${toEastern(currentAudioAyah)}`;

        ctx.value = s ? `سوره ${s.fa || s.ar}${ayahHint}` : `سوره ${toEastern(currentNum)}${ayahHint}`;
      } else {
        ctx.value = '';
      }
    }
    const msg = $('report-message');
    if (msg) msg.value = '';
    reportType = 'text';
    document.querySelectorAll('.report-type').forEach(b => {
      b.classList.toggle('active', b.dataset.type === 'text');
    });
  }

  function closeReport() {
    $('report-panel')?.classList.remove('show');
    $('overlay')?.classList.remove('show');
  }

  $('btn-report-open')?.addEventListener('click', openReport);
  $('btn-report-cancel')?.addEventListener('click', closeReport);

  document.querySelectorAll('.report-type').forEach(btn => {
    btn.addEventListener('click', () => {
      reportType = btn.dataset.type;
      document.querySelectorAll('.report-type').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
    });
  });

  /* مقصد گزارش‌ها. توصیه: به‌جای نشانی ایمیل، «کد مستعار (alias)» FormSubmit را اینجا بگذارید
     تا ایمیل شخصی در کد عمومیِ برنامه دیده نشود (راهنما در SECURITY.md). */
  const REPORT_ENDPOINT = 'https://formsubmit.co/ajax/frdaws.samad@gmail.com';
  const REPORT_COOLDOWN_MS = 60000;
  $('btn-report-send')?.addEventListener('click', async () => {
    const message = ($('report-message')?.value || '').trim();
    if (!message) {
      showToast('لطفاً توضیح مشکل را بنویسید');
      $('report-message')?.focus();
      return;
    }

    // امنیت: فقط کاراکترهای کنترلی حذف و طول محدود می‌شود؛ ارسال بیش از یک بار در دقیقه ممکن نیست
    // (این فرم عمومی است و بدون این محدودیت‌ها ابزار اسپم می‌شود).
    const cleanText = (v, max) => String(v || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
    if ($('report-hp') && $('report-hp').value) return;   // honeypot: انسان این کادر مخفی را پر نمی‌کند
    const nowTs = Date.now();
    let lastSent = 0;
    try { lastSent = Number(localStorage.getItem('quran_report_last') || 0); } catch {}
    if (nowTs - lastSent < REPORT_COOLDOWN_MS) {
      showToast('لطفاً یک دقیقه بعد دوباره گزارش بفرستید', 3500);
      return;
    }
    const messageClean = cleanText(message, 1000);
    const context = cleanText($('report-context')?.value, 200);
    const typeLabels = {
      text: 'متن عربی',
      translation: 'ترجمه',
      audio: 'صوت',
      other: 'سایر'
    };
    const typeLabel = typeLabels[reportType] || reportType;
    const subject = `گزارش مشکل قرآن · ${typeLabel}`;

    const btn = $('btn-report-send');
    const originalText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'در حال ارسال...';
    }

    try {
      // ارسال خودکار و بی‌صدا به ایمیل (بدون باز کردن جیمیل یا Share)
      const ctl = new AbortController();
      const tm = setTimeout(() => ctl.abort(), 12000);
      const res = await fetch(REPORT_ENDPOINT, {
        method: 'POST',
        signal: ctl.signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: subject,
          'نوع مشکل': typeLabel,
          'موقعیت': context || '—',
          'توضیح': messageClean,
          'منبع': 'اپ قرآن کریم · نور',
          _template: 'table',
          _captcha: 'false',
          _honey: ''
        })
      });
      clearTimeout(tm);

      if (res.ok) {
        try { localStorage.setItem('quran_report_last', String(Date.now())); } catch {}
        closeReport();
        closeSettings();
        showToast('گزارش شما با موفقیت ارسال شد. از همکاری‌تان سپاسگزاریم ✓', 4000);
        if ($('report-message')) $('report-message').value = '';
        if ($('report-context')) $('report-context').value = '';
      } else {
        throw new Error('server error');
      }
    } catch (err) {
      console.warn('report send failed', err);
      showToast('ارسال گزارش با مشکل مواجه شد. اینترنت را بررسی کنید و دوباره تلاش کنید.', 4500);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText || 'ارسال گزارش';
      }
    }
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      theme = 'dark';
      applyTheme();
      savePrefs();
    });
  });

  function syncTrButtons() {
    $('toggle-tr')?.classList.toggle('on', !!showTranslation);
  }

  function toggleTranslation() {
    showTranslation = !showTranslation;
    syncTrButtons();
    syncReaderMenu();
    savePrefs();
    if (!currentSurah) return;

    // Preserve scroll position approximately when toggling translation.
    const sc = scrollReader;
    const ratio = sc ? (sc.scrollTop / Math.max(1, sc.scrollHeight)) : 0;
    clearWordHighlight();
    renderScrollMode();
    reattachPlayingAyah(renderGeneration);
    if (sc) requestAnimationFrame(() => { sc.scrollTop = ratio * sc.scrollHeight; });
  }

  $('toggle-tr')?.addEventListener('click', toggleTranslation);

  /* ── رنگ‌های تجوید ── */
  const TJ_PREVIEW = 'أُو۟لَٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ';
  function syncTjButtons() {
    $('tj-mode-on')?.classList.toggle('active', !!showTajweed);
    $('tj-mode-off')?.classList.toggle('active', !showTajweed);
    $('tj-mode-on')?.setAttribute('aria-pressed', showTajweed ? 'true' : 'false');
    $('tj-mode-off')?.setAttribute('aria-pressed', showTajweed ? 'false' : 'true');
    const pv = $('tj-preview');
    if (pv) pv.innerHTML = (showTajweed && window.Tajweed) ? window.Tajweed.html(TJ_PREVIEW) : escapeHtml(TJ_PREVIEW);
  }

  // مقدار مشخص (روشن/خاموش) را اعمال می‌کند و صفحهٔ خواندن را دوباره می‌سازد
  function setTajweed(value) {
    value = !!value;
    if (value === showTajweed) { syncTjButtons(); return; }
    showTajweed = value;
    syncTjButtons();
    syncReaderMenu();
    savePrefs();
    showToast(showTajweed ? 'رنگ‌های تجوید روشن شد' : 'متن بدون رنگ تجوید نمایش داده می‌شود');
    if (!currentSurah) return;
    const sc = scrollReader;
    const ratio = sc ? (sc.scrollTop / Math.max(1, sc.scrollHeight)) : 0;
    clearWordHighlight();
    renderScrollMode();
    reattachPlayingAyah(renderGeneration);
    if (sc) requestAnimationFrame(() => { sc.scrollTop = ratio * sc.scrollHeight; });
  }
  function toggleTajweed() { setTajweed(!showTajweed); }

  function buildTjLegend() {
    const box = $('tj-legend');
    if (!box || box.dataset.built || !window.Tajweed) return;
    box.innerHTML = window.Tajweed.LEGEND.map(l => `
      <div class="tj-row">
        <div class="tj-sample" dir="rtl">${window.Tajweed.htmlOnly(l.sample, l.css)}</div>
        <div class="tj-row-text">
          <div class="tj-row-title"><span>${l.fa}</span>${l.count ? `<span class="tj-row-count">${l.count}</span>` : ''}</div>
          <div class="tj-row-sub">${l.sub}</div>
        </div>
      </div>`).join('');
    box.dataset.built = '1';
  }

  function openTjPanel() {
    buildTjLegend();
    $('overlay')?.classList.add('show');
    $('tj-panel')?.classList.add('show');
  }
  function closeTjPanel() {
    $('tj-panel')?.classList.remove('show');
    $('overlay')?.classList.remove('show');
  }
  $('tj-mode-on')?.addEventListener('click', () => setTajweed(true));
  $('tj-mode-off')?.addEventListener('click', () => setTajweed(false));
  $('btn-tj-legend')?.addEventListener('click', openTjPanel);
  $('btn-tj-close')?.addEventListener('click', closeTjPanel);
  syncTjButtons();
  // Initial state
  syncTrButtons();
  syncReaderMenu();

  /* Font controls */
  function adjustFont(delta) {
    fontSize = Math.max(18, Math.min(40, fontSize + delta));
    applyFont();
    savePrefs();
    if (!currentSurah) return;

    clearWordHighlight();
    renderScrollMode();
    reattachPlayingAyah(renderGeneration);
  }

  $('set-font-up')?.addEventListener('click', () => adjustFont(2));
  $('set-font-down')?.addEventListener('click', () => adjustFont(-2));


  /* ── آیه روز (بدون نیاز به بارگذاری کل قرآن) ── */
  // مجموعه‌ای از آیات کوتاه و زیبا برای نمایش سریع
  const AYAH_OF_DAY_POOL = [
    { s: 1, a: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', tr: 'به نام خداوند رحمتگر مهربان' },
    { s: 1, a: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', tr: 'تنها تو را مى‌پرستيم و تنها از تو يارى مى‌جوييم' },
    { s: 2, a: 152, text: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ', tr: 'پس مرا ياد كنيد تا شما را ياد كنم و شكرگزار من باشيد و كفران نورزيد' },
    { s: 2, a: 286, text: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا', tr: 'خداوند هيچ كس را جز به اندازه توانايى‌اش تكليف نمى‌كند' },
    { s: 3, a: 159, text: 'فَبِمَا رَحْمَةٍۢ مِّنَ ٱللَّهِ لِنتَ لَهُمْ', tr: 'پس به [بركت] رحمت الهى با آنان نرم‌خو شدى' },
    { s: 13, a: 28, text: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ', tr: 'آگاه باشيد كه با ياد خدا دل‌ها آرام مى‌گيرد' },
    { s: 16, a: 78, text: 'وَٱللَّهُ أَخْرَجَكُم مِّنۢ بُطُونِ أُمَّهَٰتِكُمْ لَا تَعْلَمُونَ شَيْـًۭٔا', tr: 'و خدا شما را از شكم مادرانتان بيرون آورد در حالى كه چيزى نمى‌دانستيد' },
    { s: 17, a: 82, text: 'وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌۭ وَرَحْمَةٌۭ لِّلْمُؤْمِنِينَ', tr: 'و از قرآن آنچه را كه شفا و رحمتى براى مؤمنان است نازل مى‌كنيم' },
    { s: 18, a: 10, text: 'رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةًۭ وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًۭا', tr: 'پروردگارا از جانب خود رحمتى به ما عطا كن و كار ما را به راه راست بياراى' },
    { s: 21, a: 87, text: 'لَآ إِلَٰهَ إِلَّآ أَنتَ سُبْحَٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّٰلِمِينَ', tr: 'معبودى جز تو نيست منزهى تو، راستى كه من از ستمكاران بودم' },
    { s: 24, a: 35, text: 'ٱللَّهُ نُورُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ', tr: 'خدا نور آسمان‌ها و زمين است' },
    { s: 39, a: 53, text: 'قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ', tr: 'بگو اى بندگانم كه بر خود اسراف كرده‌ايد از رحمت خدا نوميد مشويد' },
    { s: 55, a: 13, text: 'فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ', tr: 'پس كدام يك از نعمت‌هاى پروردگارتان را انكار مى‌كنيد' },
    { s: 67, a: 2, text: 'ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًۭا', tr: 'آن كه مرگ و زندگى را آفريد تا شما را بيازمايد كه كدام‌يك نيكوكارتريد' },
    { s: 94, a: 5, text: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', tr: 'پس همانا با دشوارى آسانى است' },
    { s: 94, a: 6, text: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا', tr: 'آرى با دشوارى آسانى است' },
    { s: 103, a: 1, text: 'وَٱلْعَصْرِ', tr: 'سوگند به عصر' },
    { s: 103, a: 2, text: 'إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ', tr: 'كه واقعا انسان دستخوش زيان است' },
    { s: 112, a: 1, text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', tr: 'بگو اوست خداى يگانه' },
    { s: 113, a: 1, text: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ', tr: 'بگو پناه مى‌برم به پروردگار سپيده‌دم' },
    { s: 114, a: 1, text: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ', tr: 'بگو پناه مى‌برم به پروردگار مردم' }
  ];

  function pickAyahOfDay() {
    const day = Math.floor(Date.now() / 86400000);
    const item = AYAH_OF_DAY_POOL[day % AYAH_OF_DAY_POOL.length];
    const meta = META.find(x => x.n === item.s);
    return {
      surah: item.s,
      ayah: item.a,
      global: 0,
      text: item.text,
      tr: item.tr,
      nameAr: meta ? meta.ar : '',
      nameFa: meta ? (meta.fa || '') : ''
    };
  }

  function renderAyahOfDay() {
    const el = $('ayah-day');
    if (!el) return;
    const a = pickAyahOfDay();
    if (!a) {
      el.style.display = 'none';
      return;
    }
    el.style.display = '';
    const ref = (a.nameFa || a.nameAr) + ' · آیه ' + toEastern(a.ayah);
    el.innerHTML = `
      <div class="ayah-day-inner">
        <div class="ayah-day-label">
          <span class="ayah-day-badge"><span class="dot" aria-hidden="true"></span>آیه روز</span>
          <span class="ayah-day-ref">${escapeHtml(ref)}</span>
        </div>
        <div class="ayah-day-ar">${escapeHtml(a.text)}</div>
        ${a.tr ? `<div class="ayah-day-divider" aria-hidden="true"></div><div class="ayah-day-tr">${escapeHtml(a.tr)}</div>` : ''}
        <div class="ayah-day-footer">
          <svg aria-hidden="true"><use href="#i-back"/></svg>
          <span>مطالعه آیه</span>
        </div>
      </div>`;
    const open = () => openSurah(a.surah, a.ayah);
    el.onclick = open;
    el.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    };
  }

  /* Init – اول UI، بعد کارهای سنگین در پس‌زمینه */
  renderSurahList();
  renderAyahOfDay();
  updateAccountNote();

  const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));

  /* ── Cloud Sync (Firebase) – تنبل، بعد از نمایش UI ── */
  if (cloudEnabled) {
    scheduleIdle(async () => {
      try {
        const ok = await initFirebase();
        if (ok) {
          setupAuthListener();
        } else {
          loadUserData();
        }
      } catch {
        loadUserData();
      }
    }, { timeout: 1800 });
  } else {
    loadUserData();
  }

  // No Quran preloading on startup: load only the surah the user opens.

  /* ── دکمهٔ «برگشت» (اندروید / سوایپ برگشت) ──
     قبلاً هیچ history نبود و زدن Back کاربر را مستقیم از برنامه بیرون می‌برد.
     حالا هر لایهٔ باز (صفحهٔ سوره، تنظیمات، جستجو، منو، پنل‌ها) یک مرحله در history دارد
     و Back فقط بالاترین لایه را می‌بندد. */
  (function setupBackNavigation() {
    if (!window.history || !history.pushState) return;
    const PANELS = [['jump-panel', closeJumpPanel], ['tj-panel', closeTjPanel],
                    ['report-panel', closeReport], ['account-panel', closeAccountPanel]];
    const isOn = (id, cls) => !!$(id)?.classList.contains(cls);
    const activeId = () => document.querySelector('.view.active')?.id || 'view-list';
    function depth() {
      const v = activeId();
      let d = 0;
      if (v === 'view-reader' || v === 'view-juz' || v === 'view-learn' || v === 'view-marks') d = 1;
      else if (v === 'view-settings') d = (settingsReturnView && settingsReturnView !== 'view-list') ? 2 : 1;
      if (isOn('search-page', 'open')) d++;
      if (isOn('reader-menu', 'show')) d++;
      for (const [id] of PANELS) if (isOn(id, 'show')) d++;
      return d;
    }
    function closeTop() {
      for (const [id, fn] of PANELS) if (isOn(id, 'show')) { fn(); return true; }
      if (isOn('reader-menu', 'show')) { closeReaderMenu(); return true; }
      if (isOn('search-page', 'open')) { closeSearchPage(); return true; }
      const v = activeId();
      if (v === 'view-settings') { closeSettings(); return true; }
      if (v === 'view-reader') { $('btn-back')?.click(); return true; }
      if (v !== 'view-list') { document.querySelector('.nav button[data-tab="list"]')?.click(); return true; }
      return false;
    }
    let pushed = 0, ignore = 0, raf = 0;
    try { history.replaceState({ qn: 0 }, ''); } catch { return; }
    function sync() {
      raf = 0;
      const d = depth();
      if (d > pushed) {
        while (pushed < d) { pushed++; history.pushState({ qn: pushed }, ''); }
      } else if (d < pushed) {
        const n = pushed - d;
        pushed = d;
        ignore++;
        history.go(-n);
      }
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(sync); };
    window.addEventListener('popstate', (e) => {
      if (ignore > 0) { ignore--; return; }
      const target = (e.state && typeof e.state.qn === 'number') ? e.state.qn : 0;
      pushed = target;
      let guard = 8;
      while (depth() > target && guard-- > 0 && closeTop()) { /* ببند تا به عمق مقصد برسیم */ }
      schedule();
    });
    const mo = new MutationObserver(schedule);
    const watch = (el) => { if (el) mo.observe(el, { attributes: true, attributeFilter: ['class'] }); };
    document.querySelectorAll('.view').forEach(watch);
    ['search-page', 'reader-menu', ...PANELS.map(p => p[0])].forEach(id => watch($(id)));
  })();


})();
