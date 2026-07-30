/* ===== 云兮工作台 · Service Worker（离线缓存 + 本地通知） ===== */
const CACHE = 'yunxi-v1';
const ASSETS = [
  '.', 'index.html',
  'assets/css/styles.css',
  'assets/js/utils.js', 'assets/js/store.js', 'assets/js/schema.js',
  'assets/js/ui.js', 'assets/js/dashboard.js', 'assets/js/views.js', 'assets/js/app.js',
  'assets/manifest.webmanifest',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => cached)
    )
  );
});

// 来自页面的通知请求（页面计算好内容后交给 SW 弹窗，支持后台标签）
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'notify') {
    self.registration.showNotification(d.title || '云兮工作台', {
      body: d.body || '', icon: 'assets/icons/icon-192.png', badge: 'assets/icons/icon-192.png'
    });
  } else if (d.type === 'check-reminders') {
    // 周期同步：请页面检查到期事项并回推通知
    self.clients.matchAll({ includeUncontrolled: true }).then(cs => cs.forEach(c => c.postMessage({ type: 'check-reminders' })));
  }
});

// Web Push（需服务端 VAPID 订阅，纯静态站仅作兜底）
self.addEventListener('push', e => {
  let data = { title: '云兮工作台', body: '' };
  try { if (e.data) data = e.data.json(); } catch (_) {}
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: 'assets/icons/icon-192.png' }));
});

// 周期后台同步（支持的浏览器/设备触发）
self.addEventListener('periodicsync', e => {
  if (e.tag === 'daily-reminder') e.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true }).then(cs => cs.forEach(c => c.postMessage({ type: 'check-reminders' })))
  );
});
