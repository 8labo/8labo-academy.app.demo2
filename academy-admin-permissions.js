(function(){
  const hide=(el)=>{if(el)el.style.display='none'};
  const show=(el,display='')=>{if(el)el.style.display=display};
  async function init(){
    try{
      if(typeof sb==='undefined') return;

      const [{data:canAccess,error:accessErr},{data:svc,error:svcErr}]=await Promise.all([
        sb.rpc('can_access_academy_admin'),
        sb.from('services').select('id').eq('service_code','ACADEMY').maybeSingle()
      ]);
      if(accessErr||svcErr||!svc?.id){
        console.warn('ACADEMY admin permission check failed',accessErr||svcErr);
        return;
      }

      const gate=document.getElementById('gate');
      const app=document.getElementById('app');
      if(!canAccess){
        if(gate){gate.classList.remove('hidden');gate.innerHTML='<h2>アクセス権限がありません</h2><p class="sub">ACADEMYの管理権限が付与されていません。</p>'}
        app?.classList.add('hidden');
        return;
      }

      // office accountなどstaff_usersを持たない業務アカウントでも、
      // DB側のACADEMY管理閲覧権限があれば管理画面を表示する。
      gate?.classList.add('hidden');
      app?.classList.remove('hidden');

      const {data:canManage,error:manageErr}=await sb.rpc('can_manage_service',{target_service_id:svc.id});
      if(manageErr){console.warn('ACADEMY manage permission check failed',manageErr);return}

      function applyReadOnly(){
        if(canManage) return;

        // 予定：一覧は見せ、登録・一括登録・変更削除だけ隠す。
        const schedule=document.getElementById('schedule');
        const singleGrid=schedule?.querySelector('#single .grid');
        hide(singleGrid?.querySelector('.card:first-child'));
        if(singleGrid) singleGrid.style.gridTemplateColumns='1fr';
        hide(schedule?.querySelector('[data-mode="bulk"]'));
        hide(schedule?.querySelector('#bulk'));
        schedule?.querySelectorAll('#scheduleList .actions').forEach(hide);

        // 教室：一覧は全教室を見せ、登録・変更削除だけ隠す。
        const classesPanel=document.getElementById('classes');
        const classGrid=classesPanel?.querySelector('.grid');
        hide(classGrid?.querySelector('.card:first-child'));
        if(classGrid) classGrid.style.gridTemplateColumns='1fr';
        classesPanel?.querySelectorAll('#classList .actions').forEach(hide);

        // 所属：一覧は見せ、変更削除だけ隠す。
        document.querySelectorAll('#memberList .actions').forEach(hide);

        // お知らせ：一覧は見せ、登録・変更削除等の運用操作だけ隠す。
        const noticesPanel=document.getElementById('notices');
        const noticeGrid=noticesPanel?.querySelector('.grid');
        hide(noticeGrid?.querySelector('.card:first-child'));
        if(noticeGrid) noticeGrid.style.gridTemplateColumns='1fr';
        noticesPanel?.querySelectorAll('#uxList .noticeActions,#noticeList .actions').forEach(hide);
      }

      function observe(id){
        const el=document.getElementById(id);
        if(el)new MutationObserver(applyReadOnly).observe(el,{childList:true,subtree:true});
      }
      applyReadOnly();
      ['scheduleList','classList','memberList','uxList','noticeList'].forEach(observe);

      // 取得エラーが空一覧に見えないよう、主要データを軽く監視する。
      const checks=await Promise.all([
        sb.from('academy_classes').select('id',{count:'exact',head:true}),
        sb.from('academy_schedule').select('id',{count:'exact',head:true}),
        sb.from('academy_class_members').select('id',{count:'exact',head:true}),
        sb.from('academy_notices').select('id',{count:'exact',head:true})
      ]);
      const failed=checks.find(x=>x.error);
      if(failed?.error){
        const box=document.createElement('div');
        box.className='status';
        box.style.cssText='margin:0 0 14px;background:#fff1f2;color:#9f1239;border:1px solid #fecdd3';
        box.textContent='データの読み込みでエラーが発生しています。再読み込みしても改善しない場合は管理者へ連絡してください。';
        app?.prepend(box);
        console.warn('ACADEMY admin data read check failed',failed.error);
      }
    }catch(e){console.warn('academy admin permission ui',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})();