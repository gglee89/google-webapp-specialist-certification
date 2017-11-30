var cacheName = "weatherPWA-project";

// list of files required for the app shell.
// Be sure to include all permutations of file names
// for example our app is served from index.html,
// but it may also be requested as / since the server sends index.html
// when a root folder is requested.
var filesToCache = [
  "/",
  "/index.html",
  "/scripts/app.js",
  "/styles/inline.css",
  "/images/clear.png",
  "/images/cloudy-scattered-showers.png",
  "/images/cloudy.png",
  "/images/fog.png",
  "/images/ic_add_white_24px.svg",
  "/images/ic_refresh_white_24px.svg",
  "/images/partly-cloudy.png",
  "/images/rain.png",
  "/images/scattered-showers.png",
  "/images/sleet.png",
  "/images/snow.png",
  "/images/thunderstorm.png",
  "/images/wind.png"
];

self.addEventListener("install", function(e) {
  console.log("[ServiceWorker] Install");
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log("[ServiceWorker] Caching app shell");

      // Unfortunately, cache.addAll() is atomic,
      // if any of the files fail, the entire cache step fails!
      /**
       * This caching method requires you to update the cache key
       * every time content is changed, otherwise, the cache will
       * not be updated, and the old content will be served.
       * So be sure to change the cache key with every change as
       * you're working on your project!
       *
       * Important caveat here. It's crucial that the HTTPS request
       * made during the install handler goes directly to the network
       * and doesn't return a response from the browser's cache.
       * Otherwise the browser may return the old, cached version,
       * resulting in the service worker cache never actually updating!
       *
       * Beware of cache-first strategies in production
       * Our app uses a cache-first strategy, which results
       * in a copy of any cached content being returned without
       * consulting the network. While a cache-first strategy
       * is easy to implement, it can cause challenges in the future.
       * Once the copy of the host page and service worker
       * registration is cached, it can be extremely difficult
       * to change the configuration of the service worker
       * (since the configuration depends on where it was defined),
       * and you could find yourself deploying sites that are extremely
       * difficult to update!
       *
       * So how do we avoid these edge cases?
       * Use a library like sw-precache, which provides
       * fine control over what gets expired, ensures
       * requests go directly to the network and handles all of the
       * hard work for you.
       */
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("activate", function(e) {
  console.log("[ServiceWorker] Activate");
  /**
   * This code ensures that your service worker updates its
   * cache whenever any of the app shell files change.
   * In order for this to work, you'd need to increment the
   * cacheName variable at the top of your service worker file.
   *
   * Another downside is that the entire cache is invalidated and needs to
   * be re-downloaded every time a file changes. That means fixing a
   * simple single character spelling mistake will invalidate the
   * cache and require everything to be downloaded again.
   * Not exactly efficient.
   */
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== cacheName) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // self.clients.claim() essentially lets you activate the service worker faster.
  return self.clients.claim();
});

/**
 * Serve the app shell from the cache.
 */
self.addEventListener("fetch", function(e) {
  console.log("[ServiceWorker] Fetch", e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
