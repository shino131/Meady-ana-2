/* ميعاد - العمل بدون إنترنت. غيّر رقم الإصدار عند كل تحديث للملفات حتى يتجدد التخزين. */
const VERSION = 'maad-v1.3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    /* الصفحة: الشبكة أولاً ثم النسخة المخزنة، ليصلك التحديث متى توفر الإنترنت */
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSION).then(x => x.put('./index.html', c)); return res; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(VERSION).then(x => x.put(r, c)); return res; })));
});
