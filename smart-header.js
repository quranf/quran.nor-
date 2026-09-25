/* اسکریپت‌های درون‌خطیِ قبلیِ index.html؛ برای CSP به فایل مستقل منتقل شد (بدون تغییر رفتار). */
(function () {
  if (window.__noorSmartHeaderInitialized) return;
  window.__noorSmartHeaderInitialized = true;
  const header = document.querySelector('.header.header-home');
  if (!header) return;

  let previousY = 0;
  let lastDirectionChange = 0;
  const threshold = 7;

  /** @param {Event} event */
  function readScrollPosition(event) {
    const target = event && event.target;
    if (target && target !== document && target !== window &&
        typeof target.scrollTop === 'number') return target.scrollTop;
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  /** @param {Event} event */
  function onScroll(event) {
    const y = Math.max(0, readScrollPosition(event));
    const delta = y - previousY;
    const now = Date.now();

    if (y <= 12) {
      header.classList.remove('header-scroll-hidden');
      previousY = y;
      return;
    }

    if (Math.abs(delta) >= threshold && now - lastDirectionChange > 45) {
      if (delta > 0) {
        header.classList.add('header-scroll-hidden');
      } else {
        header.classList.remove('header-scroll-hidden');
      }
      lastDirectionChange = now;
    }
    previousY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
})();

(function () {
  // هدر صفحه‌ی خواندن سوره (دکمه بازگشت + منوی سه‌خط): با اسکرول به پایین پنهان
  // و با اسکرول به بالا (یا رسیدن به ابتدای متن) دوباره نمایان می‌شود.
  if (window.__noorReaderSmartHeaderInitialized) return;
  window.__noorReaderSmartHeaderInitialized = true;
  const header = document.querySelector('.reader-top');
  if (!header) return;

  let previousY = 0;
  let lastDirectionChange = 0;
  let headerHeight = header.offsetHeight;
  const threshold = 7;

  function refreshHeaderHeight() {
    if (!header.classList.contains('header-scroll-hidden')) {
      headerHeight = header.offsetHeight;
    }
  }
  window.addEventListener('resize', refreshHeaderHeight, { passive: true });

  function showHeader() {
    header.classList.remove('header-scroll-hidden');
    header.style.marginTop = '';
  }
  function hideHeader() {
    refreshHeaderHeight();
    header.classList.add('header-scroll-hidden');
    header.style.marginTop = (-headerHeight) + 'px';
    const menu = document.getElementById('reader-menu');
    const menuBtn = document.getElementById('btn-reader-menu');
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
      menu.setAttribute('aria-hidden', 'true');
      menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  /** @param {Event} event */
  function readScrollPosition(event) {
    const target = event && event.target;
    if (target && target.id === 'scroll-reader' && typeof target.scrollTop === 'number') {
      return target.scrollTop;
    }
    return null;
  }

  /** @param {Event} event */
  function onScroll(event) {
    const y = readScrollPosition(event);
    if (y === null) return;
    const safeY = Math.max(0, y);
    const delta = safeY - previousY;
    const now = Date.now();

    if (safeY <= 12) {
      showHeader();
      previousY = safeY;
      return;
    }

    if (Math.abs(delta) >= threshold && now - lastDirectionChange > 45) {
      if (delta > 0) {
        hideHeader();
      } else {
        showHeader();
      }
      lastDirectionChange = now;
    }
    previousY = safeY;
  }

  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
})();
