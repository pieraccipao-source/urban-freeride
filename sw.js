const CACHE='urban-freeride-v4';
const BASE=['./','./index.html','./admin.html','./app.css','./app.js','./manifest.webmanifest','./assets/brand-emblem.png','./assets/rider-stairs.webp','./assets/rider-feed.webp','./assets/rider-profile.webp','./assets/rider-champion.webp','./assets/rider-silver.webp','./assets/rider-bronze.webp','./assets/rider-avatar.webp','./assets/viterbo-skyline.webp','./assets/viterbo-architecture.webp','./assets/icon-192.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(BASE)));self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)))});
