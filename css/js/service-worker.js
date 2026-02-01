const CACHE_NAME = 'rawabi-al-ahsa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/track.html',
  '/css/style.css',
  '/js/script.js',
  '/manifest.json'
];

// التثبيت
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم تثبيت Service Worker');
        return cache.addAll(urlsToCache);
      })
  );
});

// الاسترجاع
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجدنا الملف في الكاش نرجعه
        if (response) {
          return response;
        }
        
        // إذا لم نجده نحمله من الشبكة
        return fetch(event.request)
          .then(response => {
            // التحقق من أن الرد صالح للتخزين
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // نسخ الرد للتخزين في الكاش
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});

// التحديث
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
