const CACHE_NAME = 'boggle-v1';
const OFFLINE_URLS = [
    './',
    './index.html',
    'https://raw.githubusercontent.com/first20hours/google-10000-english/master/20k.txt',
    'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2016/de/de_50k.txt',
    'https://flagcdn.com/w40/gb.png',
    'https://flagcdn.com/w40/de.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(OFFLINE_URLS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                // Cache successful responses for dictionary files
                if (response.ok && event.request.url.includes('raw.githubusercontent.com')) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            });
        }).catch(() => {
            // Offline fallback - return cached version if available
            return caches.match(event.request);
        })
    );
});
