/* چاپ رنگ‌آمیزی یک آیه:  node tajweed-tests/show.js 1:1 2:255 ... */
const fs = require('fs'), path = require('path');
const T = require(path.join(__dirname, '..', 'public', 'app', 'tajweed.js'));
const names = Object.fromEntries(Object.entries(T.R).map(([k, v]) => [v, k]));
for (const ref of process.argv.slice(2)) {
  const [s, n] = ref.split(':').map(Number);
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'app', 'data', String(s).padStart(3, '0') + '.json'), 'utf8'));
  const a = d.ayahs.find((x) => x.n === n);
  const rules = T.annotate(a.text);
  const parts = [];
  let k = 0;
  while (k < a.text.length) {
    let m = k + 1;
    while (m < a.text.length && rules[m] === rules[k]) m++;
    if (rules[k]) parts.push(a.text.slice(k, m) + '=' + names[rules[k]].replace('MADD_', 'M_').replace('IDGHAM_', 'ID_'));
    k = m;
  }
  console.log(ref + '  ' + a.text + '\n   ' + parts.join('  |  ') + '\n');
}
