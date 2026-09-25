/* ============================================================
   tajweed.js — موتور رنگ‌آمیزی تجوید (روایت حفص از عاصم)
   ------------------------------------------------------------
   ورودی: متن عثمانی یک آیه (همان متن فایل‌های data/*.json)
   خروجی: برای هر نویسه‌ی متن، شمارهٔ حکم تجویدی آن (یا صفر)

   روش کار (بدون هیچ داده‌ی خارجی و بدون اینترنت):
   ۱) متن به «واحد» شکسته می‌شود: هر حرف + همهٔ اعراب‌ها و نشانه‌های روی آن.
   ۲) برای هر واحد معلوم می‌شود ساکن است یا متحرک، تشدید دارد یا نه،
      حرف مد است یا نه، خوانده می‌شود یا نه (نشانه‌های ۟ ۠ و همزه‌ی وصل).
   ۳) حکم هر حرف از روی «حرف بعدی که واقعاً خوانده می‌شود» تعیین می‌شود
      (نون ساکن/تنوین، میم ساکن، مدها، قلقله، ادغام‌ها …).
   ۴) پایان هر آیه «وقف» حساب می‌شود (مد عارض، قلقلهٔ کبری، مد لین).
      حکم‌ها از یک آیه به آیهٔ بعد ادامه پیدا نمی‌کنند.

   نکتهٔ مهم دربارهٔ اعتبار: رسم‌الخط عثمانی خودش قواعد را رمزگذاری کرده
   (نون ساکن با «ْ» فقط در اظهار؛ بدون علامت در ادغام/اخفاء؛ «ۢ» در اقلاب؛
   «ۭ» روی تنوین در ادغام/اخفاء؛ «ٓ» روی مدهای طولانی). موتور بالا حکم را
   مستقل از روی آواشناسی می‌سازد و فایل tajweed-tests/verify.js همهٔ ۶۲۳۶
   آیه را با همین علامت‌های رسم‌الخط تطبیق می‌دهد.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Tajweed = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── شمارهٔ حکم‌ها ── */
  const R = {
    NONE: 0,
    SLNT_WASL: 1,      // همزهٔ وصل
    SLNT_LAM: 2,       // لام شمسی
    SLNT_LETTER: 3,    // حرف نوشته‌شده ولی نخوانده (۟ ۠)
    MADD_ASLI: 4,      // مد طبیعی (۲ حرکت)
    MADD_JAIZ: 5,      // مد جایز: منفصل / عارض للسکون / لین / صلهٔ کبری
    MADD_WAJIB: 6,     // مد واجب متصل (۴–۵)
    MADD_LAZIM: 7,     // مد لازم (۶)
    QALQALAH: 8,       // قلقله
    GHUNNAH: 9,        // غنّه (نون و میم مشدد)
    IKHFA: 10,         // اخفاء حقیقی
    IKHFA_SHAFAWI: 11, // اخفاء شفوی
    IQLAB: 12,         // اقلاب
    IDGHAM_GHUNNAH: 13,// ادغام با غنّه (ی ن م و)
    IDGHAM_BILA: 14,   // ادغام بدون غنّه (ل ر)
    IDGHAM_SHAFAWI: 15,// ادغام شفوی (میم در میم)
    IDGHAM_MITHLAYN: 16// ادغام متماثلین / متجانسین / متقاربین
  };

  const CLASS = [
    '', 'tj-slnt', 'tj-slnt', 'tj-slnt',
    'tj-madd-2', 'tj-madd-j', 'tj-madd-w', 'tj-madd-l',
    'tj-qal', 'tj-ghn', 'tj-ikh', 'tj-ikh-s', 'tj-iql',
    'tj-idg-g', 'tj-idg-b', 'tj-idg-s', 'tj-idg-m'
  ];

  /* وقتی دو حکم روی یک نویسه بیفتند، بالاتر برنده است */
  const PRIO = [0, 60, 60, 60, 80, 80, 80, 80, 70, 50, 90, 90, 90, 90, 90, 90, 90];

  /* راهنمای رنگ‌ها (برای پنجرهٔ «راهنما» و گزارش) */
  const LEGEND = [
    { css: 'tj-madd-l', ids: [R.MADD_LAZIM],   fa: 'مد لازم',                 count: '۶ حرکت',      sample: 'ٱلْحَآقَّةُ', sub: 'بعد از حرف مد، تشدید یا سکون ثابت می‌آید' },
    { css: 'tj-madd-w', ids: [R.MADD_WAJIB],   fa: 'مد واجب متصل',            count: '۴ یا ۵ حرکت', sample: 'جَآءَ',        sub: 'حرف مد و همزه در یک کلمه' },
    { css: 'tj-madd-j', ids: [R.MADD_JAIZ],    fa: 'مد جایز',                 count: '۲ تا ۶ حرکت', sample: 'بِمَآ أُنزِلَ', sub: 'منفصل، عارض للسکون، لین و صلهٔ کبری' },
    { css: 'tj-madd-2', ids: [R.MADD_ASLI],    fa: 'مد طبیعی (اصلی)',         count: '۲ حرکت',      sample: 'رَبَّنَا',        sub: 'الف، واو و یای مد بدون سبب' },
    { css: 'tj-qal',    ids: [R.QALQALAH],     fa: 'قلقله',                   count: '',            sample: 'لَمْ يَلِدْ',       sub: 'حروف قطب جد با سکون یا هنگام وقف' },
    { css: 'tj-ghn',    ids: [R.GHUNNAH],      fa: 'غنّه',                    count: '۲ حرکت',      sample: 'ثُمَّ',        sub: 'نون و میم مشدد' },
    { css: 'tj-ikh',    ids: [R.IKHFA],        fa: 'اخفاء',                   count: '',            sample: 'مِن قَبْلُ',   sub: 'نون ساکن/تنوین + ۱۵ حرف اخفاء' },
    { css: 'tj-ikh-s',  ids: [R.IKHFA_SHAFAWI],fa: 'اخفاء شفوی',              count: '',            sample: 'هُم بِهِ',    sub: 'میم ساکن + ب' },
    { css: 'tj-iql',    ids: [R.IQLAB],        fa: 'اقلاب',                   count: '',            sample: 'مِنۢ بَعْدِ',  sub: 'نون ساکن/تنوین + ب' },
    { css: 'tj-idg-g',  ids: [R.IDGHAM_GHUNNAH],fa: 'ادغام با غنّه',          count: '',            sample: 'مَن يَقُولُ',  sub: 'نون ساکن/تنوین + ی ن م و' },
    { css: 'tj-idg-b',  ids: [R.IDGHAM_BILA],  fa: 'ادغام بدون غنّه',         count: '',            sample: 'مِن رَّبِّهِمْ', sub: 'نون ساکن/تنوین + ل ر' },
    { css: 'tj-idg-s',  ids: [R.IDGHAM_SHAFAWI],fa: 'ادغام شفوی',             count: '',            sample: 'لَهُم مَّا',   sub: 'میم ساکن + م' },
    { css: 'tj-idg-m',  ids: [R.IDGHAM_MITHLAYN],fa: 'ادغام متماثلین و هم‌جنس‌ها', count: '',       sample: 'قَد تَّبَيَّنَ', sub: 'دو حرف هم‌مخرج/هم‌جنس' },
    { css: 'tj-slnt',   ids: [R.SLNT_WASL, R.SLNT_LAM, R.SLNT_LETTER], fa: 'حرف خوانده‌نشده', count: '', sample: 'ٱلشَّمْسِ', sub: 'همزهٔ وصل، لام شمسی و حروف بی‌صدا (هنگام ادامه دادن)' }
  ];

  /* ── نویسه‌ها ── */
  const FATHA = 0x064E, DAMMA = 0x064F, KASRA = 0x0650;
  const FATHATAN = 0x064B, DAMMATAN = 0x064C, KASRATAN = 0x064D;
  const SHADDA = 0x0651, SUKUN = 0x0652, MADDAH = 0x0653, HAMZA_ABOVE = 0x0654, DAGGER = 0x0670;
  const SUKUN2 = 0x06E1, SILENT1 = 0x06DF, SILENT2 = 0x06E0;
  const HIGH_MEEM = 0x06E2, LOW_MEEM = 0x06ED, SMALL_WAW = 0x06E5, SMALL_YEH = 0x06E6;
  const TATWEEL = 0x0640, ALEF_WASLA = 0x0671;

  function isLetterCode(c) {
    return (c >= 0x0621 && c <= 0x064A) || c === ALEF_WASLA || c === TATWEEL;
  }
  function isMarkCode(c) {
    return (c >= 0x064B && c <= 0x065F) || c === DAGGER ||
      (c >= 0x06D6 && c <= 0x06DC) || (c >= 0x06DF && c <= 0x06E8) || (c >= 0x06EA && c <= 0x06ED);
  }
  function isSpace(c) { return c === 0x20 || c === 0x0A || c === 0x09 || c === 0xA0 || c === 0x0D; }

  const HAMZA_FORMS = 'ءأإؤئ';
  const ALEF_ASLI = 'ا';

  /* ── ۱) شکستن متن به واحدهای آوایی ── */
  function tokenize(text) {
    const units = [];
    let w = 0, inWord = false, cur = null;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const c = text.charCodeAt(i);
      if (isSpace(c)) {
        if (inWord) { w++; inWord = false; }
        cur = null;
        continue;
      }
      if (c === 0x06DC && !cur && units.length) { units[units.length - 1].sakta = true; continue; } // سکتهٔ حفص: وقف کوتاه بدون نفس
      if (isLetterCode(c)) {
        cur = {
          ch, b: ch, s: i, e: i + 1, w,
          v: '', suk: false, shd: false, mad: false, dag: false, sw: false, sy: false,
          sil: false, hm: false, lm: false, hz: false,
          tanPos: [], madPos: -1, dagPos: -1, swPos: -1, syPos: -1, hmPos: -1, lmPos: -1, hzPos: -1
        };
        if (c === 0x0622) { cur.ch = 'ا'; cur.b = 'ا'; cur.mad = true; cur.madPos = i; } // «آ» یک‌پارچه = الف + ٓ
        units.push(cur);
        inWord = true;
        continue;
      }
      if (cur && isMarkCode(c)) {
        cur.e = i + 1;
        switch (c) {
          case FATHA: if (!cur.v) cur.v = 'a'; break;
          case DAMMA: if (!cur.v) cur.v = 'u'; break;
          case KASRA: if (!cur.v) cur.v = 'i'; break;
          case FATHATAN: cur.v = 'an'; cur.tanPos.push(i); break;
          case DAMMATAN: cur.v = 'un'; cur.tanPos.push(i); break;
          case KASRATAN: cur.v = 'in'; cur.tanPos.push(i); break;
          case SHADDA: cur.shd = true; break;
          case SUKUN: case SUKUN2: cur.suk = true; break;
          case MADDAH: cur.mad = true; cur.madPos = i; break;
          case HAMZA_ABOVE: cur.hz = true; cur.hzPos = i; break;
          case DAGGER: cur.dag = true; cur.dagPos = i; break;
          case SMALL_WAW: cur.sw = true; cur.swPos = i; break;
          case SMALL_YEH: cur.sy = true; cur.syPos = i; break;
          case SILENT1: case SILENT2: cur.sil = true; break;
          case HIGH_MEEM: cur.hm = true; cur.hmPos = i; if (cur.tanPos.length) cur.tanPos.push(i); break;
          case LOW_MEEM: cur.lm = true; cur.lmPos = i; if (cur.tanPos.length) cur.tanPos.push(i); break;
          default: break;
        }
      }
    }

    /* تطویل (ـ) با همزهٔ بالای آن یک «همزه» است؛ بدون همزه فقط حامل است */
    const P = [];
    for (const u of units) {
      if (u.ch === 'ـ') {
        if (u.hz) { u.b = 'ء'; P.push(u); }
        continue;
      }
      if (HAMZA_FORMS.indexOf(u.ch) >= 0) u.b = 'ء';
      P.push(u);
    }
    return P;
  }

  /* ── ابزارهای پرسش دربارهٔ واحدها ── */
  const isHamza = (u) => u.b === 'ء';

  /* آیا حرف در همان کلمه بعد از تنوین فتحه، الفِ عوض است؟ (در وقف خوانده می‌شود، در وصل نه) */
  function isIwad(P, j) {
    if (j === 0) return false;
    const u = P[j], p = P[j - 1];
    return p.w === u.w && p.v === 'an' && (u.ch === 'ا' || u.ch === 'ى') &&
      !u.v && !u.suk && !u.shd && !u.dag && !u.sw && !u.sy && !u.mad;
  }

  /* نزدیک‌ترین حرفی که بعد از P[i] واقعاً خوانده می‌شود.
     -1: پایان آیه (وقف)    -2: کلمهٔ بعد با همزهٔ وصل شروع می‌شود    وگرنه شاخص */
  function nextPron(P, i) {
    for (let j = i + 1; j < P.length; j++) {
      const u = P[j];
      if (u.w === P[i].w) {
        if (u.sil || isIwad(P, j) || isLamShams(P, j)) continue;
        return j;
      }
      if (P[i].sakta) return -1; // سکته: بین دو کلمه مکث می‌شود ← حکم وصل جاری نیست
      if (u.ch === 'ٱ') return -2;
      if (u.sil) continue;
      return j;
    }
    return -1;
  }

  /* آخرین حرفی که در وقف خوانده می‌شود */
  function lastPron(P) {
    for (let j = P.length - 1; j >= 0; j--) {
      if (P[j].sil || isIwad(P, j)) continue;
      return j;
    }
    return -1;
  }

  /* لام «ال» که در حرف مشدد بعدی ادغام شده (شمسی): لامِ بی‌علامت + حرف مشدد در همان کلمه */
  function isLamShams(P, j) {
    const u = P[j];
    return u.ch === 'ل' && !u.v && !u.suk && !u.shd && !u.dag && !u.sw && !u.sy && !u.mad && !u.sil && !u.hm && !u.lm &&
      j + 1 < P.length && P[j + 1].w === u.w && P[j + 1].shd;
  }

  const noMarks = (u) => !u.v && !u.suk && !u.shd && !u.dag && !u.sw && !u.sy && !u.mad && !u.sil && !u.hm && !u.lm;

  /* نون ساکن: با ْ۠، بدون علامت (ادغام/اخفاء)، یا با میم کوچک اقلاب */
  function isSakinNoon(u) {
    return u.ch === 'ن' && !u.v && !u.shd && !u.sil && !u.dag && (u.suk || u.hm || noMarks(u));
  }
  function isSakinMeem(u) {
    return u.ch === 'م' && !u.v && !u.shd && !u.sil && !u.dag && (u.suk || noMarks(u));
  }
  const isTanween = (u) => u.v === 'an' || u.v === 'un' || u.v === 'in';

  /* نوع حرف مد بودن یک واحد: alef | waw | ya | dagger | silah | null */
  function maddKind(P, i) {
    const u = P[i];
    if (u.sil) return null;
    if (u.dag) return 'dagger';
    if (u.sw || u.sy) return 'silah';
    if (i === 0) return null;
    let pi = i - 1;
    while (pi > 0 && P[pi].sil && P[pi].w === u.w) pi--; // حرف نخوانده (مثل الفِ «جِا۟ىٓءَ») را رد کن
    const p = P[pi];
    if (p.w !== u.w) return null;
    if (u.v || u.suk || u.shd) return null;
    if (u.b === 'ا' && p.v === 'a') return 'alef';
    if (u.ch === 'و' && p.v === 'u') return 'waw';
    if ((u.ch === 'ي' || u.ch === 'ى') && p.v === 'i') return 'ya';
    return null;
  }

  const QALQALAH_LETTERS = 'قطبجد';
  const FAWATIH_LAZIM = 'لمصقنسعك';
  const FAWATIH_ASLI = 'حيطهر';

  /* جفت‌های ادغام متماثلین / متجانسین / متقاربین (حرف اول ساکن، دوم مشدد) */
  function isAssimilationPair(a, b) {
    if (a === b) return true;
    const sets = ['تدط', 'ثذظ', 'بم', 'لر', 'قك'];
    for (const s of sets) if (s.indexOf(a) >= 0 && s.indexOf(b) >= 0) {
      // ل→ر و ق→ك یک‌طرفه‌اند (ر→ل و ك→ق ادغام نمی‌شود)
      if ((s === 'لر' && a !== 'ل') || (s === 'قك' && a !== 'ق')) return false;
      return true;
    }
    return false;
  }

  /* ── ۲) تحلیل یک آیه ── */
  function analyze(text) {
    const P = tokenize(text);
    const paints = []; // {from,to,rule}
    const trace = [];  // برای آزمون‌ها: توضیح هر حکم
    const paint = (from, to, rule, why) => { paints.push({ from, to, rule }); if (why) trace.push({ from, rule, why }); };
    const paintUnit = (u, rule, why) => paint(u.s, u.e, rule, why);

    if (!P.length) return { P, paints, trace };

    /* حروف مقطعه (الٓمٓ، طه، يسٓ …): کلمه‌ای که هیچ حرکتی ندارد. نام حرف است، نه قاعدهٔ معمول */
    const wordHasVowel = {};
    for (const u of P) if (u.v) wordHasVowel[u.w] = true;
    const isFawatihUnit = (u) => !wordHasVowel[u.w];
    let fawatihUnits = 0;
    for (const u of P) {
      if (!isFawatihUnit(u)) continue;
      fawatihUnits++;
      if (u.mad && !u.dag && FAWATIH_LAZIM.indexOf(u.ch) >= 0) paintUnit(u, R.MADD_LAZIM, 'fawatih-lazim');
      else if (!u.mad && noMarks(u) && FAWATIH_ASLI.indexOf(u.ch) >= 0) paintUnit(u, R.MADD_ASLI, 'fawatih-asli');
    }
    const fawatih = fawatihUnits === P.length;
    if (fawatih) return { P, paints, trace, fawatih: true };

    const last = lastPron(P);

    for (let i = 0; i < P.length; i++) {
      const u = P[i];
      if (isFawatihUnit(u)) continue;
      const prev = i > 0 && P[i - 1].w === u.w ? P[i - 1] : null;

      /* ─ حروف نخوانده ─ */
      if (u.ch === 'ٱ') { paintUnit(u, R.SLNT_WASL, 'hamzat-wasl'); continue; }
      if (u.sil) { paintUnit(u, R.SLNT_LETTER, 'silent-letter'); continue; }
      if (isLamShams(P, i)) { paintUnit(u, R.SLNT_LAM, 'lam-shamsiyyah'); continue; }

      /* ─ غنّهٔ نون و میم مشدد ─ */
      if (u.shd && (u.ch === 'ن' || u.ch === 'م')) paintUnit(u, R.GHUNNAH, 'ghunnah');

      /* ─ مدها ─ */
      const mk = maddKind(P, i);
      if (mk) classifyMadd(P, i, mk, last, paint, paintUnit);

      /* ─ لین در وقف (واو/یای ساکن بعد از فتحه، درست قبل از آخرین حرف) ─ */
      if (!mk && (u.ch === 'و' || u.ch === 'ي' || u.ch === 'ى') && u.suk && prev && prev.v === 'a') {
        const nx = nextPron(P, i);
        if (nx === last && nx >= 0 && P[nx].w === u.w && P[nx].v !== 'an') paintUnit(u, R.MADD_JAIZ, 'madd-leen');
      }

      /* ─ قلقله ─ */
      if (QALQALAH_LETTERS.indexOf(u.ch) >= 0) {
        if (u.suk) paintUnit(u, R.QALQALAH, 'qalqalah-sughra');
        else if (i === last && u.v !== 'an' && !u.sil) paintUnit(u, R.QALQALAH, 'qalqalah-kubra');
      }

      /* ─ نون ساکن و تنوین ─ */
      if (isSakinNoon(u) || isTanween(u)) noonTanween(P, i, paint, paintUnit);

      /* ─ میم ساکن ─ */
      if (isSakinMeem(u)) {
        const nx = nextPron(P, i);
        if (nx >= 0) {
          const n = P[nx];
          if (n.ch === 'ب') paintUnit(u, R.IKHFA_SHAFAWI, 'ikhfa-shafawi');
          else if (n.ch === 'م') { paintUnit(u, R.IDGHAM_SHAFAWI, 'idgham-shafawi'); paintUnit(n, R.IDGHAM_SHAFAWI, 'idgham-shafawi-target'); }
        }
      }

      /* ─ ادغام متماثلین / متجانسین / متقاربین: حرف بی‌علامت + حرف مشدد ─ */
      if (noMarks(u) && !mk && u.ch !== 'ن' && u.ch !== 'م' && u.ch !== 'ا' && u.ch !== 'ى' && !isHamza(u)) {
        const nx = nextPron(P, i);
        if (nx >= 0) {
          const n = P[nx];
          if ((n.shd && isAssimilationPair(u.ch, n.ch)) || (u.ch === 'ط' && n.ch === 'ت')) {
            paintUnit(u, R.IDGHAM_MITHLAYN, 'idgham-mithlayn');
            paintUnit(n, R.IDGHAM_MITHLAYN, 'idgham-mithlayn-target');
          }
        }
      }
    }
    return { P, paints, trace, last };
  }

  /* ── نون ساکن / تنوین: فقط «تشخیص حکم» (بدون رنگ‌کردن) ──
     خروجی: { rule, target, nx } یا null برای اظهار / بدون حکم */
  function noonTanweenRule(P, i) {
    const u = P[i];
    const tan = isTanween(u);
    const nx = nextPron(P, i);
    if (nx < 0) return null; // پایان آیه (وقف) یا همزهٔ وصل
    const n = P[nx];
    const sameWord = n.w === u.w;
    const nb = n.b === 'ى' ? 'ي' : n.b;

    if (!tan && sameWord && (nb === 'و' || nb === 'ي')) return null; // اظهار مطلق: دُنْيا، صِنْوان
    if ('ءهعحغخ'.indexOf(nb) >= 0) return null;                        // اظهار حلقی
    if (nb === 'ب') return { rule: R.IQLAB, target: false, nx, nb };
    if ('ينمو'.indexOf(nb) >= 0) return { rule: R.IDGHAM_GHUNNAH, target: true, nx, nb };
    if ('لر'.indexOf(nb) >= 0) return { rule: R.IDGHAM_BILA, target: true, nx, nb };
    if ('تثجدذزسشصضطظفقك'.indexOf(nb) >= 0) return { rule: R.IKHFA, target: false, nx, nb };
    return null;
  }

  function noonTanween(P, i, paint, paintUnit) {
    const u = P[i];
    const res = noonTanweenRule(P, i);
    if (!res) return;
    const why = (isTanween(u) ? 'tanween→' : 'noon→') + res.nb;
    if (isTanween(u)) {
      for (const p of u.tanPos) paint(p, p + 1, res.rule);
      paint(u.s, u.s, res.rule, why); // فقط برای ثبت توضیح
    } else {
      paintUnit(u, res.rule, why);
    }
    if (res.target) paintUnit(P[res.nx], res.rule, why + '-target');
  }

  /* ── دسته‌بندی مد ── */
  function classifyMadd(P, i, kind, last, paint, paintUnit) {
    const u = P[i];
    const nx = nextPron(P, i);
    if (nx === -2) return; // حرف مد قبل از همزهٔ وصل در وصل حذف می‌شود (فِی ٱلْأَرْضِ)

    let rule;
    let why;
    if (kind === 'dagger' && u.hz && u.b !== 'ء') {
      rule = R.MADD_WAJIB; why = 'madd-muttasil-hamza-on-unit'; // «فَٱدَّٰرَْٰٔتُمْ»: همزه بعد از الف در همان نگاره
    } else if (u.mad) {
      if (nx === -1) { rule = R.MADD_ASLI; why = 'madd-at-end'; }
      else {
        const n = P[nx];
        const sameWord = n.w === u.w;
        if (sameWord && isHamza(n)) {
          /* «يَٰٓ» و «هَٰٓ» ندا/تنبیه جدا از کلمهٔ بعدی‌اند ← منفصل */
          let posInWord = 0;
          for (let k = i - 1; k >= 0 && P[k].w === u.w; k--) posInWord++;
          const isParticle = kind === 'dagger' && (u.ch === 'ي' || u.ch === 'ه') && posInWord <= 1;
          rule = isParticle ? R.MADD_JAIZ : R.MADD_WAJIB;
          why = isParticle ? 'madd-munfasil-particle' : 'madd-muttasil';
        } else if (sameWord && (n.shd || n.suk)) { rule = R.MADD_LAZIM; why = 'madd-lazim'; }
        else if (!sameWord && isHamza(n)) { rule = R.MADD_JAIZ; why = kind === 'silah' ? 'madd-silah-kubra' : 'madd-munfasil'; }
        else { rule = R.MADD_JAIZ; why = 'madd-extended-unclassified'; }
      }
    } else {
      /* مد بدون علامت ٓ: طبیعی، یا عارض للسکون در وقف */
      rule = R.MADD_ASLI; why = 'madd-asli';
      if (nx >= 0 && nx === last && P[nx].w === u.w && P[nx].v !== 'an' && kind !== 'silah') {
        rule = R.MADD_JAIZ; why = 'madd-arid';
      }
    }

    /* رنگ‌کردن: برای مدِ «ٰ» یا واو/یای کوچک فقط خودِ همان نشانه؛ وگرنه کل حرف مد */
    if (kind === 'dagger') {
      if (u.dagPos >= 0) paint(u.dagPos, u.dagPos + 1, rule, why);
      if (u.mad && u.madPos >= 0) paint(u.madPos, u.madPos + 1, rule);
      if (u.hz && u.hzPos >= 0) paint(u.hzPos, u.hzPos + 1, rule);
    } else if (kind === 'silah') {
      const p = u.sw ? u.swPos : u.syPos;
      paint(p, p + 1, rule, why);
      if (u.mad && u.madPos >= 0) paint(u.madPos, u.madPos + 1, rule);
    } else {
      paintUnit(u, rule, why);
    }
  }

  /* ── ۳) تبدیل به آرایهٔ حکم برای هر نویسه ── */
  const cache = new Map();
  function annotate(text) {
    const key = String(text || '');
    const hit = cache.get(key);
    if (hit) return hit;
    const { paints } = analyze(key);
    const out = new Uint8Array(key.length);
    for (const p of paints) {
      if (p.to <= p.from) continue;
      for (let k = p.from; k < p.to; k++) {
        if (!out[k] || PRIO[p.rule] > PRIO[out[k]]) out[k] = p.rule;
      }
    }
    if (cache.size > 800) cache.clear();
    cache.set(key, out);
    return out;
  }

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ESC[c]);

  /* HTML رنگی برای بازهٔ [from,to) از متن؛ only (اختیاری): فقط همین کلاس‌های CSS رنگ شوند */
  function htmlRange(text, rules, from, to, only) {
    const cl = (r) => { const c = CLASS[r]; return only && only.indexOf(c) < 0 ? '' : c; };
    let html = '';
    let k = from;
    while (k < to) {
      const cls = cl(rules[k]);
      let m = k + 1;
      while (m < to && cl(rules[m]) === cls) m++;
      const seg = esc(text.slice(k, m));
      html += cls ? '<span class="' + cls + '">' + seg + '</span>' : seg;
      k = m;
    }
    return html;
  }

  /* فقط یک (یا چند) نوع حکم رنگ شود — برای نمونه‌های «راهنما» */
  function htmlOnly(text, css) {
    const t = String(text || '');
    return htmlRange(t, annotate(t), 0, t.length, [].concat(css));
  }

  /* کل آیه به HTML */
  function html(text) {
    const t = String(text || '');
    return htmlRange(t, annotate(t), 0, t.length);
  }

  /* آیه به‌صورت کلمه‌به‌کلمه (برای هایلایت هنگام تلاوت): آرایه‌ای از HTML هر کلمه */
  function tokensHtml(text) {
    const t = String(text || '');
    const rules = annotate(t);
    const out = [];
    let i = 0;
    while (i < t.length) {
      if (isSpace(t.charCodeAt(i))) { i++; continue; }
      let j = i;
      while (j < t.length && !isSpace(t.charCodeAt(j))) j++;
      out.push(htmlRange(t, rules, i, j));
      i = j;
    }
    return out;
  }

  return {
    R, CLASS, LEGEND, PRIO, analyze, annotate, html, htmlOnly, tokensHtml, tokenize,
    _internals: { isLamShams, nextPron, lastPron, isIwad, isSakinNoon, isSakinMeem, isTanween, maddKind, noonTanweenRule, noMarks, isHamza }
  };
});
