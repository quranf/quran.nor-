#!/bin/bash
cd "$(dirname "$0")/public/app"

echo ""
echo "  در حال راه‌اندازی سرور محلی برای «قرآن نور»..."
echo ""

PORT=8000
URL="http://localhost:$PORT/index.html"

open_browser () {
  if command -v open >/dev/null 2>&1; then open "$URL";
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"; fi
}

if command -v python3 >/dev/null 2>&1; then
  ( sleep 1 && open_browser ) &
  python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  ( sleep 1 && open_browser ) &
  python -m http.server "$PORT"
else
  echo "پایتون پیدا نشد. لطفاً Python را نصب کنید یا این پوشه را با افزونه Live Server در VS Code باز کنید."
  read -p "Press Enter to exit..."
fi
