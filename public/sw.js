const CACHE_NAME = 'shopy-v1'

// Static assets that benefit from cache-first delivery.
const STATIC_ORIGIN_PATTERN = /^\/_next\/static\//

// We always attempt the network first for pages and API calls so users see
// fresh content. Static assets from _next/static are immutably hashed, so
// cache-first is safe and faster there.

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for existing clients to close.
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Pre-cache the shell so the offline fallback is available right away.
      cache.addAll(['/']).catch(() => {
        // If the shell fetch fails (e.g. offline at install time), continue
        // silently — the fetch handler will still work once online.
      }),
    ),
  )
})

self.addEventListener('activate', (event) => {
  // Remove caches from previous versions to free storage.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept same-origin and Next.js static asset requests.
  if (request.method !== 'GET') return

  if (STATIC_ORIGIN_PATTERN.test(url.pathname)) {
    // Cache-first for immutably hashed static assets.
    event.respondWith(cacheFirst(request))
  } else {
    // Network-first for pages, API calls, and everything else.
    event.respondWith(networkFirst(request))
  }
})

/** Try the cache first; fall back to the network and store the response. */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
  }
  return response
}

/**
 * Try the network first. On failure, serve the cached version.
 * If nothing is cached either, serve the offline shell (/).
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // Offline fallback: serve the cached homepage shell.
    const shell = await caches.match('/')
    return shell ?? new Response('You are offline.', { status: 503 })
  }
}
