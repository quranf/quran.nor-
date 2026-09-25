/* بارگذاری غیرمسدودکنندهٔ فونت (قبلاً اسکریپت درون‌خطی بود؛ برای CSP فایل مستقل شد). */
(function () {
  var l = document.getElementById('font-preload');
  if (l) l.addEventListener('load', function () { l.rel = 'stylesheet'; });
})();
