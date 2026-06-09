/* =======================================================
   service-worker.js - maakt Magic Meeting offline-bruikbaar
   - installeert de "app shell" (alle eigen bestanden) in de cache
   - eigen bestanden: eerst uit de cache (werkt dus offline)
   - kaartafbeeldingen: cache aanvullen tijdens gebruik
   - Scryfall-zoekopdrachten: altijd via het netwerk
   ======================================================= */

const CACHE_NAAM = "magic-meeting-v12";

/* alle eigen bestanden die de app nodig heeft om te werken */
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/i18n.js",
  "./js/scryfall.js",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* ---------- INSTALLEREN: app shell in de cache zetten ---------- */
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAAM).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

/* ---------- ACTIVEREN: oude caches opruimen ---------- */
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(
        namen.filter(function (naam) { return naam !== CACHE_NAAM; })
             .map(function (naam) { return caches.delete(naam); })
      );
    })
  );
  self.clients.claim();
});

/* ---------- OPHALEN: bepalen waar een verzoek vandaan komt ---------- */
self.addEventListener("fetch", function (event) {
  const url = new URL(event.request.url);

  /* Scryfall API (zoeken): altijd live via het netwerk */
  if (url.hostname === "api.scryfall.com") {
    return; /* laat de browser dit normaal afhandelen */
  }

  /* Kaartafbeeldingen: uit de cache, anders ophalen en bewaren */
  if (url.hostname.indexOf("scryfall.io") !== -1) {
    event.respondWith(
      caches.match(event.request).then(function (gevonden) {
        return gevonden || fetch(event.request).then(function (antwoord) {
          return caches.open(CACHE_NAAM).then(function (cache) {
            cache.put(event.request, antwoord.clone());
            return antwoord;
          });
        });
      })
    );
    return;
  }

  /* Eigen bestanden: eerst uit de cache (zo werkt de app offline) */
  event.respondWith(
    caches.match(event.request).then(function (gevonden) {
      return gevonden || fetch(event.request);
    })
  );
});
