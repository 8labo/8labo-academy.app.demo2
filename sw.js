self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode!=='navigate') return;
  e.respondWith((async()=>{
    const res=await fetch(req);
    const type=res.headers.get('content-type')||'';
    if(!type.includes('text/html')) return res;
    let html=await res.text();
    const extraStyle=`<style>
.badgePreview{display:none!important}
.homeHeader{position:sticky!important;top:0!important;z-index:40!important;padding-bottom:16px!important;border-radius:0 0 24px 24px!important}
.subHeader{position:sticky!important;top:0!important;z-index:40!important}
.portalStack{width:42px;height:42px;border:1px solid rgba(255,255,255,.22);border-radius:12px;background:rgba(255,255,255,.14);color:#fff;text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;flex:none}
.portalStack strong{font-size:15px;font-weight:900}.portalStack small{font-size:6px;font-weight:800;margin-top:3px;letter-spacing:.01em}.subPortal{margin-left:auto;background:#fff!important;color:#172033!important;border-color:#e8edf2!important}
.hello.memberDash{margin-top:14px!important;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);border-radius:19px;padding:14px 15px;display:grid;grid-template-columns:48px 1fr;gap:12px;align-items:center}
.memberAvatar{width:48px;height:48px;border-radius:15px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:17px;font-weight:900}.memberMain{min-width:0}.memberMain small{font-size:8px!important;letter-spacing:.08em;opacity:.62!important;font-weight:800}.memberMain h2{font-size:18px!important;margin:3px 0 0!important;line-height:1.35}.memberMeta{font-size:9px;margin-top:5px;opacity:.72;font-weight:700}
.memberNext{grid-column:1/-1;margin-top:1px;padding-top:10px;border-top:1px solid rgba(255,255,255,.13);display:flex;align-items:center;gap:10px;min-width:0;cursor:pointer}.memberNextLabel{font-size:8px;font-weight:900;letter-spacing:.12em;opacity:.58;flex:none}.memberNextText{font-size:10px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}.memberNextArrow{font-size:16px;opacity:.6}
</style>`;
    html=html.replace('</head>',extraStyle+'</head>');
    // Rebuild the home top row every time so later UI changes cannot restore the preview badge.
    html=html.replace(/<div class="toprow">[\s\S]*?<\/div><\/div>(?=<div class="hello">)/,
      '<div class="toprow"><div class="miniBrand">8LABO ACADEMY</div><a class="portalStack" href="https://8labo.github.io/8labo.app.demo/" aria-label="８LABOポータルへ戻る"><strong>８</strong><small>ポータル</small></a></div>');
    // Fallback for the original markup.
    html=html.replace(/<div class="badgePreview">[^<]*<\/div>/g,'');
    html=html.replace('<header id="subHeader" class="subHeader"><button id="backHome" class="backBtn">‹</button><div class="subTitle"><b id="subTitleText">予定</b><span id="subTitleSub">ACADEMY</span></div></header>',
      '<header id="subHeader" class="subHeader"><button id="backHome" class="backBtn">‹</button><div class="subTitle"><b id="subTitleText">予定</b><span id="subTitleSub">ACADEMY</span></div><a class="portalStack subPortal" href="https://8labo.github.io/8labo.app.demo/" aria-label="８LABOポータルへ戻る"><strong>８</strong><small>ポータル</small></a></header>');
    html=html.replace('<div class="sectionTitle"><h3>アカウント</h3><span>登録情報</span></div>','<div class="sectionTitle"><h3>マイページ</h3><span>登録情報</span></div>');
    html=html.replace('</svg></span>アカウント</button></nav>','</svg></span>マイページ</button></nav>');
    html=html.replace("account:['アカウント','登録情報']","account:['マイページ','登録情報']");
    const dashScript=`<script>(()=>{const enhance=()=>{const h=document.querySelector('.hello');if(!h||h.classList.contains('memberDash'))return;h.classList.add('memberDash');const name=document.getElementById('helloName');const date=document.getElementById('todayText');const avatar=document.createElement('div');avatar.className='memberAvatar';avatar.textContent='8';const main=document.createElement('div');main.className='memberMain';if(date)date.textContent='8LABO ACADEMY MEMBER';if(name)main.append(date,name);const meta=document.createElement('div');meta.className='memberMeta';meta.textContent='ACADEMY 会員ページ';main.appendChild(meta);h.prepend(main);h.prepend(avatar);const next=document.createElement('div');next.className='memberNext';next.innerHTML='<span class="memberNextLabel">NEXT</span><span class="memberNextText">次回予定を確認</span><span class="memberNextArrow">›</span>';next.onclick=()=>{const b=[...document.querySelectorAll('.bottom button')].find(x=>x.textContent.includes('予定'));if(b)b.click()};h.appendChild(next);const c=document.getElementById('nextCard');const sync=()=>{if(c&&c.innerText.trim())next.querySelector('.memberNextText').textContent=c.innerText.trim().replace(/\\s+/g,' ')};sync();if(c)new MutationObserver(sync).observe(c,{childList:true,subtree:true,characterData:true});if(c){const title=c.previousElementSibling;if(title&&title.classList.contains('sectionTitle'))title.remove();c.remove()}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();})();</script>`;
    html=html.replace('</body>',dashScript+'</body>');
    const headers=new Headers(res.headers);headers.delete('content-length');
    return new Response(html,{status:res.status,statusText:res.statusText,headers});
  })());
});

self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch{d={body:e.data?.text()||''}};e.waitUntil(self.registration.showNotification(d.title||'８LABO ACADEMY',{body:d.body||'新しいお知らせがあります',icon:'./icon.svg',badge:'./icon.svg',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL(e.notification.data?.url||'./',self.location).href;e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if('focus'in w){w.navigate(u);return w.focus()}}return clients.openWindow(u)}))});