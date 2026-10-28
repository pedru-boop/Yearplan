// UM Year Plan — เปิดแอปได้แม้ไม่มีสัญญาณ
// หน้าแอป: ดึงจากเน็ตก่อนเสมอ (ได้เวอร์ชันใหม่ทันที) ถ้าไม่มีเน็ตค่อยใช้ชุดที่เก็บไว้
// รูป/ฟอนต์: ใช้ชุดที่เก็บไว้ก่อน แล้วอัปเดตเบื้องหลัง
const CACHE = 'yearplan-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' || req.destination === 'document') {
    const key = url.origin + url.pathname;
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(key, cp)); }
        return res;
      }).catch(() => caches.open(CACHE).then((c) => c.match(key)).then((m) => m || caches.match(req, { ignoreSearch: true })).then((m) => m || Response.error()))
    );
    return;
  }
  const media = req.destination === 'image' || req.destination === 'font' || req.destination === 'style';
  const allowed = url.origin === self.location.origin || /(^|\.)fonts\.(googleapis|gstatic)\.com$|pedru-boop\.github\.io$/.test(url.hostname);
  if (!allowed) return;
  if (media) {
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((m) => {
      const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => m);
      return m || net;
    })));
    return;
  }
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok && url.origin === self.location.origin && !url.search) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((m) => m || Response.error()))
  );
});
