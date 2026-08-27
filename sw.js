/* Service worker for Pool Water.
 *
 * The page itself has no dependencies, but that alone does not make it work
 * offline once it is launched from the iPhone home screen: a standalone web
 * app still asks the network for its own document, and with no signal that
 * request just fails. This worker answers it from cache instead.
 *
 * Bump CACHE when index.html changes, so the old copy gets evicted.
 */
var CACHE = "pool-water-v1";
var ASSETS = ["./", "./index.html"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;

  /* The page itself: try the network first so an edit shows up the next time
     the phone has signal, but fall straight back to cache when it does not. */
  if (e.request.mode === "navigate"){
    e.respondWith(
      fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put("./index.html", copy); });
        return res;
      }).catch(function(){
        return caches.match("./index.html").then(function(hit){
          return hit || caches.match("./");
        });
      })
    );
    return;
  }

  /* Everything else: cache first, since none of it changes. */
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return res;
      });
    })
  );
});
