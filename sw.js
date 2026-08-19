self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

// Keep the member UI fix lightweight without disturbing the current large index.html.
// For navigations, inject the portal control and normalize Account -> My Page.
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode!=='navigate') return;
  e.respondWith((async()=>{
    const res=await fetch(req);
    const type=res.headers.get('content-type')||'';
    if(!type.includes('text/html')) return res;
    let html=await res.text();
    html=html.replace('<div class="toprow"><div class="miniBrand">8LABO ACADEMY</div><div class="badgePreview">PREVIEW 016</div></div>',
      '<div class="toprow"><div class="miniBrand">8LABO ACADEMY</div><div style="display:flex;align-items:center;gap:8px"><a href="https://8labo.github.io/8labo.app.demo/" aria-label="８LABOポータルへ戻る" title="８LABOポータルへ戻る" style="width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.14);color:#fff;display:grid;place-items:center;text-decoration:none" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9 20v-6h6v6"/></svg></a><div class="badgePreview">PREVIEW 017</div></div></div>');
    html=html.replace('<div class="sectionTitle"><h3>アカウント</h3><span>登録情報</span></div>','<div class="sectionTitle"><h3>マイページ</h3><span>登録情報</span></div>');
    html=html.replace('</svg></span>アカウント</button></nav>','</svg></span>マイページ</button></nav>');
    html=html.replace("account:['アカウント','登録情報']","account:['マイページ','登録情報']");
    const headers=new Headers(res.headers);headers.delete('content-length');
    return new Response(html,{status:res.status,statusText:res.statusText,headers});
  })());
});

self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch{d={body:e.data?.text()||''}};e.waitUntil(self.registration.showNotification(d.title||'８LABO ACADEMY',{body:d.body||'新しいお知らせがあります',icon:'./icon.svg',badge:'./icon.svg',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL(e.notification.data?.url||'./',self.location).href;e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if('focus'in w){w.navigate(u);return w.focus()}}return clients.openWindow(u)}))});