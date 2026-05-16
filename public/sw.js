/* 골때리는골프 PWA 서비스워커 — 네트워크 우선 + 캐시 폴백 */
const CACHE = 'golf-web-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    )
    self.clients.claim()
})

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                const copy = res.clone()
                caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {})
                return res
            })
            .catch(() => caches.match(e.request))
    )
})
