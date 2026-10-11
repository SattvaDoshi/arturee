const CACHE_NAME = 'arturee-pwa-v6'
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/manifest.json?v=20261011',
  '/icon/launchericon-192x192.png?v=20261011',
  '/icon/launchericon-512x512.png?v=20261011',
]

// Install — pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Activate — clean old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network-first for navigations and static assets, cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url

  // ── SECURITY: Never intercept or cache HLS stream requests ──────────────
  const isProtectedRequest = (
    url.includes('cloudfront.net') ||   // CloudFront CDN (HLS segments + manifests)
    url.includes('.m3u8') ||            // HLS manifest files
    url.includes('.ts?') ||             // HLS transport stream segments
    url.includes('Policy=') ||          // CloudFront signed URL query params
    url.includes('/api/')               // All API calls
  )
  if (isProtectedRequest) {
    event.respondWith(fetch(request))
    return
  }

  // HTML navigations — network first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    )
    return
  }

  // Static assets — network first so updated thumbnails are immediately fresh, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
          response.ok &&
          request.method === 'GET' &&
          request.url.startsWith(self.location.origin)
        ) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})
