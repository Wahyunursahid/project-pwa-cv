// Nama cache untuk service worker Anda
const CACHE_FORTOFOLIO = 'my-cache-cv';

// Versi cache saat ini untuk memungkinkan pembaruan cache
const CURRENT_CACHE_VERSION = 1;

// Event listener untuk menginstal service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    // Membuka cache dengan nama CACHE_FORTOFOLIO dan versi CURRENT_CACHE_VERSION
    caches.open(`${CACHE_FORTOFOLIO}-v${CURRENT_CACHE_VERSION}`).then((cache) => {
      return cache.addAll([
        // Daftar file yang ingin Anda cache
        '/index.html',
        '/script.js',
        '/style.css',
        '/maskable_icon_x192.png',
        '/brewoknavia.png'
      ]);
    }).then(() => {
      // Mengizinkan service worker untuk menggantikan versi lama tanpa memerlukan intervensi pengguna
      self.skipWaiting();
    })
  );
});

// Event listener untuk mengaktifkan service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Menghapus cache yang bukan versi terbaru
          if (cacheName.startsWith(CACHE_FORTOFOLIO) && cacheName !== `${CACHE_FORTOFOLIO}-v${CURRENT_CACHE_VERSION}`) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event listener untuk menangani permintaan fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Mengembalikan respons dari cache jika tersedia
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          // Mengembalikan respons dari jaringan jika tidak ada cache atau respons tidak valid
          return response;
        }

        const responseToCache = response.clone();

        caches.open(`${CACHE_FORTOFOLIO}-v${CURRENT_CACHE_VERSION}`).then((cache) => {
          // Menambahkan respons baru ke cache
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
