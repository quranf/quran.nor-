"""
آزمون‌های امنیتی «قرآن نور» (اختیاری)
نیازمند:  pip install playwright && playwright install chromium
اجرا:     python3 security/security-tests.py
"""
import os, sys, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'app')
PORT = 8791
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
handler.log_message = lambda *a, **k: None
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('0.0.0.0', PORT), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()

results = []
def check(name, ok):
    results.append(ok); print(('PASS ' if ok else 'FAIL ') + name)

local = lambda u: (u.startswith(f'http://localhost:{PORT}') or u.startswith(f'http://127.0.0.2:{PORT}')
                   # متن آیات دیگر از فایل محلی نیست؛ از Firestore می‌آید — این آزمون‌ها
                   # به اینترنت واقعی و پروژهٔ Firebase پیکربندی‌شده نیاز دارند.
                   or 'googleapis.com' in u or 'gstatic.com' in u or 'firebaseio.com' in u or 'firebaseapp.com' in u)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.continue_() if local(r.request.url) else r.abort())
    pg.goto(f'http://localhost:{PORT}/index.html'); pg.wait_for_timeout(2000)
    check('برنامه بالا می‌آید و ۱۱۴ سوره لیست می‌شود', pg.locator('#surah-list .item').count() == 114)

    # 1) XSS از راه داده‌ی دستکاری‌شده (localStorage / ابر)
    payload = '<img src=x onerror="window.__pwned=true">'
    pg.evaluate("""(pl)=>{localStorage.setItem('quran_last_read_v2',JSON.stringify({surah:1,ayah:pl,at:Date.now()}));
      localStorage.setItem('quran_read_history_v1',JSON.stringify([{surah:2,ayah:pl,visits:pl,at:Date.now()}]));}""", payload)
    pg.reload(); pg.wait_for_timeout(1200)
    pg.locator('nav.nav button[data-tab="learn"]:visible').first.click(); pg.wait_for_timeout(800)
    check('XSS از طریق سابقه/آخرین مطالعه اجرا نمی‌شود', pg.evaluate('window.__pwned!==true') and pg.locator('#history-body img').count() == 0)

    # 2) CSP هندلر درون‌خطی را می‌بندد
    pg.evaluate("""()=>{const d=document.createElement('div');d.innerHTML='<img src=x onerror="window.__csp=true">';document.body.appendChild(d)}""")
    pg.wait_for_timeout(400)
    check('CSP: event-handler درون‌خطی اجرا نمی‌شود', pg.evaluate('window.__csp!==true'))

    # 3) رمز عبور محلی ذخیره نمی‌شود
    pg.goto(f'http://localhost:{PORT}/index.html'); pg.wait_for_timeout(1200)
    pg.locator('#btn-settings-home').click(); pg.wait_for_timeout(400)
    pg.locator('#btn-open-login').click(); pg.wait_for_timeout(300)
    pg.locator('.login-mode-tab[data-mode="signup"]').click()
    pg.fill('#login-email', 'a@b.com'); pg.fill('#login-password', 'Str0ng-pass-99'); pg.locator('#btn-login-submit').click(); pg.wait_for_timeout(2500)
    check('هیچ رمز/هشی در localStorage ذخیره نمی‌شود', pg.evaluate("localStorage.getItem('quran_users_v1')") is None)
    pg.fill('#login-password', '12345678'); pg.locator('#btn-login-submit').click(); pg.wait_for_timeout(200)
    check('رمز ضعیف در ثبت‌نام رد می‌شود', 'عدد' in pg.inner_text('#login-error'))

    # 4) طول جستجو محدود است
    pg.goto(f'http://localhost:{PORT}/index.html'); pg.wait_for_timeout(1200)
    pg.locator('#btn-open-search').click(); pg.wait_for_timeout(400)
    pg.fill('#search', 'x' * 500)
    check('طول عبارت جستجو حداکثر ۱۰۰', len(pg.input_value('#search')) <= 100)

    # 5) سوره روی میزبان غیرمحلی هم درست نمایش داده می‌شود (127.0.0.2 یک زمینهٔ امن است)
    pg2 = b.new_page()
    pg2.route('**/*', lambda r: r.continue_() if local(r.request.url) else r.abort())
    pg2.goto(f'http://127.0.0.2:{PORT}/index.html'); pg2.wait_for_timeout(2000)
    pg2.locator('#surah-list .item').nth(0).click(); pg2.wait_for_timeout(2500)
    check('سوره از دیتابیس (Firestore) نمایش داده می‌شود', pg2.locator('.ayah-wrap').count() > 0)
    # نکته: آزمون قبلیِ «دستکاری فایل محلی» دیگر معنا ندارد — متن آیات دیگر
    # فایل ثابتی روی هاست نیست که کسی بتواند دستکاریش کند؛ فقط از Firestore
    # می‌آید و قوانین security/firestore.rules نوشتن از سمت کاربر را کاملاً می‌بندد.

    check('خطای جاوااسکریپتی نداریم', not errs)
    b.close()

srv.shutdown()
print(f'\n{sum(results)}/{len(results)} آزمون موفق')
sys.exit(0 if all(results) else 1)
