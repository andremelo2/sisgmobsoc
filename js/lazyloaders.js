/* ── LAZY LOADERS ─────────────────────────────────────────── */
const _loaded = {};
function _lazyLoad(url, globalKey) {
  if (_loaded[globalKey]) return Promise.resolve();
  if (window[globalKey]) { _loaded[globalKey] = true; return Promise.resolve(); }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => { _loaded[globalKey] = true; resolve(); };
    s.onerror = () => reject(new Error('Falha ao carregar ' + url));
    document.head.appendChild(s);
  });
}
function loadXLSX() {
  return _lazyLoad('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'XLSX');
}
function loadJsPDF() {
  return _lazyLoad('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf');
}
