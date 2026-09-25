#!/usr/bin/env node
/**
 * وارد کردن دادهٔ قرآن به Firestore («دیتابیس + API» پروژهٔ قرآن نور)
 * ───────────────────────────────────────────────────────────────────
 * این اسکریپت دو کار می‌کند:
 *   ۱) هر ۱۱۴ فایل public/app/data/NNN.json را در مجموعهٔ Firestore به نام
 *      «surahs» می‌نویسد (سند به‌ازای هر سوره، آی‌دی سه‌رقمی مثل "001").
 *   ۲) فهرست فعلی قاری‌ها (QARIS در app.js) را در مجموعهٔ «reciters» می‌نویسد،
 *      تا برنامه از همین حالا بتواند این فهرست را از دیتابیس بخواند.
 *
 * بعد از اجرا، برنامه (طبق تغییری که در app.js داده شد) اول سراغ Firestore
 * می‌رود و فقط اگر در دسترس نبود، همان فایل‌های محلی data/*.json را می‌خواند —
 * یعنی هیچ‌وقت خراب نمی‌شود، حتی قبل از اجرای این اسکریپت.
 *
 * ── چطور اجرا کنم؟ ──
 * ۱. یک «Service Account key» از کنسول Firebase بگیر:
 *    Project settings → Service accounts → Generate new private key
 *    فایل دانلودشده را همین‌جا (کنار همین اسکریپت) با نام
 *    serviceAccountKey.json ذخیره کن. (این فایل رمز ورود ادمین پروژه است؛
 *    هرگز آن را در گیت‌هاب یا جای عمومی آپلود نکن — در .gitignore هم هست.)
 * ۲. در همین پوشه (scripts/) دستور زیر را بزن تا پکیج لازم نصب شود:
 *      npm install firebase-admin
 * ۳. اجرا کن:
 *      node import-to-firestore.js
 *
 * دوباره اجرا کردنش کاملاً بی‌خطر است (فقط رونویسی می‌کند، تکراری نمی‌سازد).
 */

const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
const DATA_DIR = path.join(__dirname, '..', 'public', 'app', 'data');

// همان فهرست قاری‌هایی که الان در public/app/app.js (ثابت QARIS) نوشته شده —
// اگر بعداً در app.js قاری اضافه/ویرایش کردی، همین‌جا هم به‌روزش کن.
const RECITERS = [
  { id: 'ar.alafasy',      name: 'مشاری راشد العفاسی', short: 'مشاری', wordTiming: true, timingSource: 'exact' },
  { id: 'ar.husary',       name: 'محمود خلیل الحصری', short: 'حصری', wordTiming: true, timingSource: 'scaled' },
  { id: 'ar.minshawi',     name: 'محمد صدیق المنشاوی', short: 'منشاوی', wordTiming: true, timingSource: 'scaled' },
  { id: 'ar.shaatree',     name: 'ابوبکر الشاطری', short: 'شاطری', wordTiming: true, timingSource: 'scaled' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعیقلی', short: 'معیقلی', wordTiming: true, timingSource: 'scaled' },
  { id: 'ar.luhaidan',     name: 'محمد اللحیدان', short: 'لحیدان', wordTiming: true, timingSource: 'scaled', audioMode: 'surah', surahBase: 'https://server8.mp3quran.net/lhdan/' }
];

async function main() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ فایل serviceAccountKey.json پیدا نشد.');
    console.error('   از Firebase Console → Project settings → Service accounts دانلودش کن');
    console.error('   و کنار همین اسکریپت (scripts/) با همین اسم ذخیره کن.');
    process.exit(1);
  }

  let admin;
  try {
    admin = require('firebase-admin');
  } catch {
    console.error('❌ پکیج firebase-admin نصب نیست. اول این را بزن:  npm install firebase-admin');
    process.exit(1);
  }

  admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)) });
  const db = admin.firestore();

  const files = fs.readdirSync(DATA_DIR).filter(f => /^\d{3}\.json$/.test(f)).sort();
  if (files.length !== 114) {
    console.warn(`⚠️  ${files.length} فایل پیدا شد، انتظار ۱۱۴ فایل بود. ادامه می‌دهم...`);
  }

  console.log(`در حال نوشتن ${files.length} سوره در مجموعهٔ "surahs"...`);
  let batch = db.batch();
  let opsInBatch = 0;
  let written = 0;

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    const docId = file.replace('.json', ''); // "001", "002", ...
    batch.set(db.collection('surahs').doc(docId), raw);
    opsInBatch++;
    written++;

    // هر batch در Firestore حداکثر ۵۰۰ عملیات می‌پذیرد.
    if (opsInBatch >= 400) {
      await batch.commit();
      batch = db.batch();
      opsInBatch = 0;
      console.log(`  ... ${written}/${files.length}`);
    }
  }
  if (opsInBatch > 0) await batch.commit();
  console.log(`✅ ${written} سوره در Firestore نوشته شد.`);

  console.log(`در حال نوشتن ${RECITERS.length} قاری در مجموعهٔ "reciters"...`);
  const reciterBatch = db.batch();
  for (const r of RECITERS) {
    reciterBatch.set(db.collection('reciters').doc(r.id), r);
  }
  await reciterBatch.commit();
  console.log(`✅ ${RECITERS.length} قاری در Firestore نوشته شد.`);

  console.log('\nتمام شد 🎉  حالا برنامه به‌طور خودکار این داده‌ها را از Firestore می‌خواند.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ خطا در حین اجرا:', err);
  process.exit(1);
});
