/* ---------------------------------------------------------------------------
 * Service worker — Lohith Sanju P / portfolio
 *
 * Deployed on GitHub Pages as a PROJECT site, so the whole app lives under
 * https://sanju-zxt.github.io/portfolio/ — every URL here is relative
 * ("./…"), never an absolute "/…" path, or it would escape the sub-path.
 *
 * Strategies (brief):
 *   install   -> precache the shell (addAll, but tolerant of missing files).
 *   activate  -> drop old caches, then claim open clients.
 *   navigate  -> network-first, fall back to the cached page / offline shell.
 *   same-origin css|js|images|svg|fonts -> stale-while-revalidate:
 *                answer from cache instantly, refresh quietly in background.
 *   everything else -> network with cache fallback.
 *   never touched -> cross-origin (fonts, CDNs, GitHub API), /certificates/
 *                PDFs, api.github.com, formsubmit.co. Not our business.
 * ------------------------------------------------------------------------- */

const CACHE_NAME = 'lsp-portfolio-v2';
const CACHE_PREFIX = 'lsp-portfolio-';
const OFFLINE_URL = './index.html';

/* The app shell. Relative URLs only. */
const PRECACHE = [
  './',
  './index.html',
  './site.css',
  './site.js',
  './manifest.webmanifest',
  './assets/favicon.svg',
  './assets/logo.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/profile-portrait.jpg'
];

/* Paths and hosts we must never intercept or cache. */
const BYPASS_PATH_FRAGMENTS = ['/certificates/'];
const BYPASS_HOSTS = ['api.github.com', 'formsubmit.co'];

/* Same-origin responses that deserve stale-while-revalidate. */
const STATIC_DESTINATIONS = ['style', 'script', 'image', 'font', 'manifest'];
const STATIC_EXTENSIONS = /\.(?:css|js|mjs|json|webmanifest|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i;

/* ------------------------------ helpers -------------------------------- */

function isBypassed(url) {
  try {
    if (BYPASS_HOSTS.indexOf(url.hostname) !== -1) return true;
    for (let i = 0; i < BYPASS_PATH_FRAGMENTS.length; i += 1) {
      if (url.pathname.indexOf(BYPASS_PATH_FRAGMENTS[i]) !== -1) return true;
    }
  } catch (err) {
    return true; // unparseable -> hands off
  }
  return false;
}

function isStaticAsset(request, url) {
  if (STATIC_DESTINATIONS.indexOf(request.destination) !== -1) return true;
  return STATIC_EXTENSIONS.test(url.pathname);
}

/* Cache a response only when it is our own, successful, non-opaque copy. */
function shouldCache(response) {
  if (!response) return false;
  if (response.status !== 200) return false;
  if (response.type !== 'basic' && response.type !== 'default') return false;
  return true;
}

async function cachePut(request, response) {
  try {
    if (!shouldCache(response)) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (err) {
    /* quota exceeded / unreadable body — caching is best-effort, never fatal */
  }
}

function offlineResponse() {
  const html =
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Offline — Lohith Sanju P</title>' +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;' +
    'background:#050507;color:#f5f5f7;font:16px/1.6 ui-sans-serif,system-ui,sans-serif;' +
    'text-align:center;padding:2rem}code{color:#ff3333}</style></head><body><div>' +
    '<h1>You are offline</h1><p>This page needs a connection the first time it loads.</p>' +
    '<p><code>Reconnect and reload.</code></p></div></body></html>';
  return new Response(html, {
    status: 200,
    statusText: 'OK (offline shell)',
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function gatewayTimeout() {
  return new Response('', { status: 504, statusText: 'Gateway Timeout' });
}

/* --------------------------- strategies -------------------------------- */

/* Network-first for page loads; cached page or offline shell when the net dies. */
async function handleNavigation(event) {
  const request = event.request;
  try {
    const response = await fetch(request);
    if (shouldCache(response)) {
      event.waitUntil(cachePut(request, response.clone()));
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const shell = await caches.match(OFFLINE_URL, { ignoreSearch: true });
    if (shell) return shell;
    const root = await caches.match('./', { ignoreSearch: true });
    if (root) return root;
    return offlineResponse();
  }
}

/* Serve the cached copy immediately, refresh it in the background. */
async function handleStatic(event) {
  const request = event.request;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (shouldCache(response)) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }

  const fresh = await network;
  if (fresh) return fresh;

  const fallback = await cache.match(request, { ignoreSearch: true });
  if (fallback) return fallback;
  return gatewayTimeout();
}

/* Default: try the network, fall back to whatever we have cached. */
async function handleNetworkFirst(event) {
  const request = event.request;
  try {
    const response = await fetch(request);
    if (shouldCache(response)) {
      event.waitUntil(cachePut(request, response.clone()));
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    return gatewayTimeout();
  }
}

/* ---------------------------- lifecycle -------------------------------- */

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(PRECACHE);
      } catch (err) {
        /* One 404 must not break the install — cache what we can, item by item. */
        await Promise.all(
          PRECACHE.map((url) =>
            cache.add(url).catch(() => {
              /* skip this file */
            })
          )
        );
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      } catch (err) {
        /* cache storage unavailable — carry on */
      }
      await self.clients.claim();
    })()
  );
});

/* ------------------------------ routing -------------------------------- */

self.addEventListener('fetch', (event) => {
  try {
    const request = event.request;
    if (!request) return;

    /* GET only — POST/PUT go straight to the network (e.g. FormSubmit). */
    if (request.method && request.method !== 'GET') return;

    const url = new URL(request.url);

    /* Only http(s); ignore blob:, data:, chrome-extension:, about: … */
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    /* Our origin only. Fonts, CDNs and third-party APIs are never cached. */
    if (url.origin !== self.location.origin) return;

    /* Explicitly hands-off endpoints and certificate PDFs. */
    if (isBypassed(url)) return;

    /* Range requests (media seeking) do not play well with the cache API. */
    if (request.headers && request.headers.has('range')) return;

    if (request.mode === 'navigate') {
      event.respondWith(handleNavigation(event));
      return;
    }

    if (isStaticAsset(request, url)) {
      event.respondWith(handleStatic(event));
      return;
    }

    event.respondWith(handleNetworkFirst(event));
  } catch (err) {
    /* Never throw out of a fetch handler — let the browser handle the request. */
  }
});
