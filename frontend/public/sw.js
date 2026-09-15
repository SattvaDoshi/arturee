const CACHE_NAME = 'arturee-pwa-v5'
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/manifest.json?v=20260412',
  '/icons/icon-192x192.png?v=20260412',
  '/icons/icon-512x512.png?v=20260412',
]

// Install — pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network-first for navigations, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url

  // ── SECURITY: Never intercept or cache HLS stream requests ──────────────
  // CloudFront signed URLs and API calls must always go straight to the
  // network. Caching them would allow replaying expired signed URLs from
  // the service-worker cache, bypassing CloudFront's TTL enforcement.
  const isProtectedRequest = (
    url.includes('cloudfront.net') ||   // CloudFront CDN (HLS segments + manifests)
    url.includes('.m3u8') ||            // HLS manifest files
    url.includes('.ts?') ||             // HLS transport stream segments (with signing params)
    url.includes('Policy=') ||          // CloudFront signed URL query params
    url.includes('/api/')               // All API calls (auth, playback, etc.)
  )
  if (isProtectedRequest) {
    // Pass straight through to the network — no SW caching or interception
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

  // Static assets — cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        // Only cache same-origin GET responses for non-API, non-stream assets
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
    })
  )
})
