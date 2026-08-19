(function(){
  async function loadSnapshot(){
    try{
      if(typeof sb==='undefined') return;
      const app=document.getElementById('app');
      const gate=document.getElementById('gate');
      const {data,error}=await sb.rpc('academy_admin_snapshot');
      if(error){
        console.error('ACADEMY admin snapshot',error);
        if(gate){gate.classList.remove('hidden');gate.innerHTML='<h2>データを読み込めませんでした</h2><p class="sub">'+String(error.message||'不明なエラー')+'</p>'}
        if(app) app.classList.add('hidden');
        return;
      }
      classes=Array.isArray(data?.classes)?data.classes:[];
      schedules=Array.isArray(data?.schedules)?data.schedules:[];
      members=Array.isArray(data?.members)?data.members:[];
      notices=Array.isArray(data?.notices)?data.notices:[];
      ackCounts=data?.ack_counts||{};

      if(typeof opts==='function'){
        const sClass=document.getElementById('sClass'); if(sClass) sClass.innerHTML=opts(true);
        const bClass=document.getElementById('bClass'); if(bClass) bClass.innerHTML=opts();
        const nClass=document.getElementById('nClass'); if(nClass) nClass.innerHTML=opts();
      }
      const classList=document.getElementById('classList');
      if(classList){
        classList.innerHTML=classes.length?classes.map(c=>rowHtml('class',c.id,`<b>${esc(c.class_name)}</b><span class="muted">${esc(c.class_code)}｜${esc(c.venue||'')}</span>`)).join(''):'<span class="muted">登録済み教室はありません。</span>';
      }
      if(typeof renderScheduleList==='function') renderScheduleList();
      const memberList=document.getElementById('memberList');
      if(memberList){
        memberList.innerHTML=members.length?members.map(x=>rowHtml('member',x.id,`<b>${esc(x.persons?.last_name)} ${esc(x.persons?.first_name)}</b><span class="muted">ID ${String(x.persons?.labo_id||'').padStart(4,'0')}｜${esc(x.academy_classes?.class_name)}｜${esc(x.membership_status)}</span>`)).join(''):'<span class="muted">所属登録はありません。</span>';
      }
      const noticeList=document.getElementById('noticeList');
      if(noticeList){
        noticeList.innerHTML=notices.length?notices.map(x=>noticeRow(x)).join(''):'<span class="muted">登録済みのお知らせはありません。</span>';
      }
      if(typeof bindRows==='function') bindRows();
      if(typeof renderCal==='function') renderCal();
      if(gate) gate.classList.add('hidden');
      if(app) app.classList.remove('hidden');
    }catch(e){
      console.error('ACADEMY admin data loader',e);
      const gate=document.getElementById('gate');
      const app=document.getElementById('app');
      if(gate){gate.classList.remove('hidden');gate.innerHTML='<h2>データを読み込めませんでした</h2><p class="sub">'+String(e.message||e)+'</p>'}
      if(app) app.classList.add('hidden');
    }
  }

  const oldRefresh=typeof refresh==='function'?refresh:null;
  refresh=async function(){
    await loadSnapshot();
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(loadSnapshot,80));
  else setTimeout(loadSnapshot,80);
})();