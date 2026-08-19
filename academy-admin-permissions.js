(function(){
  async function init(){
    try{
      if(typeof sb==='undefined') return;
      const {data:svc,error:svcErr}=await sb.from('services').select('id').eq('service_code','ACADEMY').maybeSingle();
      if(svcErr||!svc?.id) return;
      const {data:canManage,error:manageErr}=await sb.rpc('can_manage_service',{target_service_id:svc.id});
      if(manageErr) return;
      const classesPanel=document.getElementById('classes');
      if(!classesPanel) return;
      const grid=classesPanel.querySelector('.grid');
      const registerCard=grid?.querySelector('.card:first-child');
      const classList=document.getElementById('classList');
      const apply=()=>{
        if(!canManage){
          if(registerCard) registerCard.style.display='none';
          if(grid) grid.style.gridTemplateColumns='1fr';
          classList?.querySelectorAll('.actions').forEach(a=>a.style.display='none');
        }else{
          if(registerCard) registerCard.style.display='';
          if(grid) grid.style.gridTemplateColumns='';
          classList?.querySelectorAll('.actions').forEach(a=>a.style.display='');
        }
      };
      apply();
      if(classList) new MutationObserver(apply).observe(classList,{childList:true,subtree:true});
    }catch(e){console.warn('academy class permission ui',e)}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0)); else setTimeout(init,0);
})();