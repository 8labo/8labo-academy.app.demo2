self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

// Keep ACADEMY navigation consistent with BizFit while leaving the member app logic intact.
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode!=='navigate') return;
  e.respondWith((async()=>{
    const res=await fetch(req);
    const type=res.headers.get('content-type')||'';
    if(!type.includes('text/html')) return res;
    let html=await res.text();
    const extraStyle='<style>.homeHeader{position:sticky!important;top:0!important;z-index:40!important}.subHeader{position:sticky!important;top:0!important;z-index:40!important}.portalStack{width:42px;height:42px;border:0;border-radius:12px;background:rgba(255,255,255,.14);color:#fff;text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}.portalStack strong{font-size:17px;font-weight:900}.portalStack small{font-size:7px;font-weight:800;margin-top:3px}.subPortal{margin-left:auto;background:#eef5fb!important;color:#0b4f8a!important}.subPortal small{font-size:7px}.topActions{display:flex;align-items:center;gap:8px}</style>';
    html=html.replace('</head>',extraStyle+'</head>');
    html=html.replace('<div class="toprow"><div class="miniBrand">8LABO ACADEMY</div><div class="badgePreview">PREVIEW 016</div></div>',
      '<div class="toprow"><div class="miniBrand">8LABO ACADEMY</div><div class="topActions"><a class="portalStack" href="https://8labo.github.io/8labo.app.demo/" aria-label="８LABOポータルへ戻る"><strong>８</strong><small>ポータル</small></a><div class="badgePreview">PREVIEW 018</div></div></div>');
    html=html.replace('<header id="subHeader" class="subHeader"><button id="backHome" class="backBtn">‹</button><div class="subTitle"><b id="subTitleText">予定</b><span id="subTitleSub">ACADEMY</span></div></header>',
      '<header id="subHeader" class="subHeader"><button id="backHome" class="backBtn">‹</button><div class="subTitle"><b id="subTitleText">予定</b><span id="subTitleSub">ACADEMY</span></div><a class="portalStack subPortal" href="https://8labo.github.io/8labo.app.demo/" aria-label="８LABOポータルへ戻る"><strong>８</strong><small>ポータル</small></a></header>');
    html=html.replace('<div class="sectionTitle"><h3>アカウント</h3><span>登録情報</span></div>','<div class="sectionTitle"><h3>マイページ</h3><span>登録情報</span></div>');
    html=html.replace('</svg></span>アカウント</button></nav>','</svg></span>マイページ</button></nav>');
    html=html.replace("account:['アカウント','登録情報']","account:['マイページ','登録情報']");
    const headers=new Headers(res.headers);headers.delete('content-length');
    return new Response(html,{status:res.status,statusText:res.statusText,headers});
  })());
});

self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch{d={body:e.data?.text()||''}};e.waitUntil(self.registration.showNotification(d.title||'８LABO ACADEMY',{body:d.body||'新しいお知らせがあります',icon:'./icon.svg',badge:'./icon.svg',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL(e.notification.data?.url||'./',self.location).href;e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if('focus'in w){w.navigate(u);return w.focus()}}return clients.openWindow(u)}))});