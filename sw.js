const CACHE_VERSION='academy-pwa-v1';

self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('academy-')&&k!==CACHE_VERSION).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));

// UI/HTML is intentionally not modified here.
// The service worker is limited to PWA lifecycle and push notifications.
self.addEventListener('fetch',()=>{});

self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()||''}}
  event.waitUntil(self.registration.showNotification(data.title||'８LABO ACADEMY',{
    body:data.body||'新しいお知らせがあります',
    icon:'./icon.svg',
    badge:'./icon.svg',
    data:{url:data.url||'./'}
  }));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=new URL(event.notification.data?.url||'./',self.location).href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{
    for(const win of windows){
      if('focus' in win){win.navigate(url);return win.focus()}
    }
    return clients.openWindow(url);
  }));
});