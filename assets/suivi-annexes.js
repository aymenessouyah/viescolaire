/* Suivi des éléments des cinq annexes dans les fiches de séance.
   Les coches sont conservées dans store.seances[*].annexes et suivent la sauvegarde locale/Cloud. */
(function(root){
'use strict';

const annexes=(root.STI_DATA||{}).annexes||[];
const VERSION='annexes-coverage-v1';
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function decodeEntities(value){
  return String(value==null?'':value)
    .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&amp;/gi,'&')
    .replace(/&bull;/gi,'•').replace(/&nbsp;/gi,' ')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
}
function plain(value){
  return decodeEntities(String(value==null?'':value).replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
}
function hash(value){
  let h=2166136261;
  for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}
  return (h>>>0).toString(36);
}

const items=[];
const itemById=new Map();
const itemsByAnnex=new Map();
const usedIds=new Set();
annexes.forEach(annex=>{
  const bucket=[];
  (annex.sections||[]).forEach(section=>{
    (section.rows||[]).forEach(row=>{
      const label=plain(row[0]);
      const sectionLabel=plain(section.t);
      const baseId=annex.id+':'+hash(sectionLabel+'\u001f'+label);
      let id=baseId,suffix=2;
      while(usedIds.has(id))id=baseId+':'+suffix++;
      usedIds.add(id);
      const item={
        id,annexId:annex.id,annexTitle:plain(annex.t),
        sectionTitle:section.t,sectionLabel,
        label:row[0]||'',labelText:label,
        description:row[1]||'',descriptionText:plain(row[1]),
        example:row[2]||'',exampleText:decodeEntities(row[2]||''),
        search:(plain(annex.t)+' '+sectionLabel+' '+label+' '+plain(row[1])+' '+decodeEntities(row[2]||'')).toLocaleLowerCase('fr')
      };
      items.push(item);bucket.push(item);itemById.set(id,item);
    });
  });
  itemsByAnnex.set(annex.id,bucket);
});

let modalState=null;
let coverageClass='all';
let coverageQuery='';
const el=id=>root.document&&root.document.getElementById(id);
const todayISO=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
function ids(values){
  if(!Array.isArray(values))return[];
  return [...new Set(values.filter(id=>typeof id==='string'&&itemById.has(id)))];
}
function summary(ctx,clsFilter='all',today=todayISO()){
  const covered=new Set(),planned=new Set();
  const sessions=(ctx&&ctx.sessions)||{},store=(ctx&&ctx.store)||{};
  ['3SI1','4SI2'].filter(cls=>clsFilter==='all'||cls===clsFilter).forEach(cls=>{
    (sessions[cls]||[]).forEach(session=>{
      const record=(store.seances||{})[cls+'|'+session.n]||{};
      const assured=record.done===true&&session.iso<=today;
      ids(record.annexes).forEach(id=>(assured?covered:planned).add(id));
    });
  });
  covered.forEach(id=>planned.delete(id));
  return{covered,planned,total:items.length,percent:items.length?Math.round(1000*covered.size/items.length)/10:0};
}
function selection(cls,n){
  if(!modalState||modalState.cls!==cls||modalState.n!==n)return null;
  return [...modalState.selected];
}
function itemMarkup(item,selected){
  const checkLabel=item.annexTitle+' · '+item.sectionLabel+' · '+item.labelText;
  const sample=item.exampleText?`<details class="sti-annex-example"><summary>Voir un exemple</summary><pre>${esc(item.exampleText)}</pre></details>`:'';
  return `<article class="sti-annex-check-item"><label class="sti-annex-check-row ${selected?'checked':''}"><input type="checkbox" data-annex-item="${esc(item.id)}" value="${esc(item.id)}" aria-label="${esc(checkLabel)}" ${selected?'checked':''}><span class="sti-annex-check-text"><strong>${item.label}</strong><small>${item.description}</small><em>${esc(item.sectionLabel)}</em></span></label>${sample}</article>`;
}
function updateModalCounts(state){
  if(!state||!state.panel)return;
  const count=state.panel.querySelector('[data-annex-selected-count]');
  if(count)count.textContent=state.selected.size+' / '+items.length;
  state.panel.querySelectorAll('[data-annex-picked]').forEach(node=>{
    const rows=itemsByAnnex.get(node.dataset.annexPicked)||[];
    node.textContent=rows.reduce((n,item)=>n+(state.selected.has(item.id)?1:0),0)+' / '+rows.length+' cochés';
  });
}
function renderChecklist(state){
  if(!state||!state.panel)return;
  const host=state.panel.querySelector('[data-annex-list]');
  if(!host)return;
  const query=state.query.trim().toLocaleLowerCase('fr');
  const only=state.onlySelected;
  const filtered=items.filter(item=>(!state.annex||state.annex===item.annexId)&&(!only||state.selected.has(item.id))&&(!query||item.search.includes(query)));
  const count=state.panel.querySelector('[data-annex-result-count]');
  if(count)count.textContent=filtered.length+' élément(s) affiché(s) sur '+items.length;
  host.innerHTML=annexes.map(annex=>{
    const annexItems=filtered.filter(item=>item.annexId===annex.id);
    if(!annexItems.length)return'';
    const all=itemsByAnnex.get(annex.id)||[];
    const sections=[...new Set(annexItems.map(item=>item.sectionLabel))];
    const open=!!query||!!state.onlySelected||state.annex===annex.id;
    return `<details class="sti-annex-group" data-annex-group="${esc(annex.id)}" ${open?'open':''}><summary><span>${esc(plain(annex.t))}</span><span class="sti-annex-picked" data-annex-picked="${esc(annex.id)}">${all.reduce((n,item)=>n+(state.selected.has(item.id)?1:0),0)} / ${all.length} cochés</span></summary><div class="sti-annex-group-body">${sections.map(section=>{
      const sectionItems=annexItems.filter(item=>item.sectionLabel===section);
      const title=(annex.sections||[]).find(s=>plain(s.t)===section);
      return `<div class="sti-annex-section"><h4>${title?title.t:esc(section)}</h4>${sectionItems.map(item=>itemMarkup(item,state.selected.has(item.id))).join('')}</div>`;
    }).join('')}</div></details>`;
  }).join('')||'<p class="sti-empty">Aucun élément pour ces filtres.</p>';
  updateModalCounts(state);
}
function mountModal(cls,n,record={},hostId='m-body'){
  const body=el(hostId);
  if(!body||!annexes.length)return;
  if(modalState&&modalState.panel&&modalState.panel.isConnected)modalState.panel.remove();
  const selected=new Set(ids(record&&record.annexes));
  const state={cls,n,selected,panel:null,query:'',annex:'',onlySelected:false};
  const panel=root.document.createElement('section');
  panel.className='sti-annex-check-panel';
  panel.dataset.stiClass=cls;
  panel.innerHTML=`<div class="sti-annex-check-heading"><div><h3>Suivi des annexes · ${esc(cls)} <span data-annex-selected-count>${selected.size} / ${items.length}</span></h3><p>Choisissez les éléments travaillés dans cette fiche. Pour les compter comme « couverts », confirmez aussi « Séance assurée » dans le cahier de textes.</p></div><strong class="sti-annex-total">${items.length} éléments · ${annexes.length} annexes</strong></div><div class="sti-annex-check-filters"><input type="search" data-annex-search aria-label="Rechercher dans les annexes" placeholder="Rechercher un élément, une notion ou un exemple…"><select data-annex-filter aria-label="Filtrer par annexe"><option value="">Toutes les annexes</option>${annexes.map(a=>`<option value="${esc(a.id)}">${esc(plain(a.t))}</option>`).join('')}</select><label class="sti-annex-only"><input type="checkbox" data-annex-only> Cochées uniquement</label></div><div class="sti-annex-result-count" data-annex-result-count></div><div class="sti-annex-check-list" data-annex-list></div><p class="sti-annex-check-foot">Les coches sont enregistrées avec la fiche ; elles restent modifiables à tout moment.</p>`;
  body.append(panel);
  state.panel=panel;modalState=state;
  panel.querySelector('[data-annex-search]').addEventListener('input',event=>{state.query=event.target.value;renderChecklist(state);});
  panel.querySelector('[data-annex-filter]').addEventListener('change',event=>{state.annex=event.target.value;renderChecklist(state);});
  panel.querySelector('[data-annex-only]').addEventListener('change',event=>{state.onlySelected=event.target.checked;renderChecklist(state);});
  panel.querySelector('[data-annex-list]').addEventListener('change',event=>{
    const input=event.target.closest('input[data-annex-item]');
    if(!input)return;
    input.checked?state.selected.add(input.value):state.selected.delete(input.value);
    const label=input.closest('.sti-annex-check-row');
    if(label)label.classList.toggle('checked',input.checked);
    updateModalCounts(state);
    if(state.onlySelected&&!input.checked)renderChecklist(state);
  });
  renderChecklist(state);
}
function coverageRows(ctx,clsFilter,a,stats){
  const rows=itemsByAnnex.get(a.id)||[];
  const covered=rows.filter(item=>stats.covered.has(item.id)).length;
  const planned=rows.filter(item=>stats.planned.has(item.id)).length;
  const rest=rows.length-covered-planned;
  return `<details class="sti-annex-coverage-group"><summary><span>${esc(plain(a.t))}</span><span class="sti-annex-coverage-count"><b>${covered} / ${rows.length}</b> couverts${planned?` · ${planned} prévus`:''}</span><span class="sti-annex-coverage-bar"><i style="width:${rows.length?100*covered/rows.length:0}%"></i></span></summary><div class="sti-annex-coverage-items">${rows.map(item=>{
    const isCovered=stats.covered.has(item.id),isPlanned=!isCovered&&stats.planned.has(item.id);
    const status=isCovered?'<span class="sti-annex-status is-covered">✓ Couvert</span>':isPlanned?'<span class="sti-annex-status is-planned">◷ Prévu</span>':'<span class="sti-annex-status is-todo">À couvrir</span>';
    return `<div class="sti-annex-coverage-item" data-search="${esc(item.search)}"><span class="sti-annex-coverage-label">${item.label}<small>${esc(item.sectionLabel)}</small></span>${status}</div>`;
  }).join('')||`<p>Aucun élément référencé (${rest} restant(s)).</p>`}</div></details>`;
}
function filterCoverageRows(panel){
  if(!panel)return;
  const query=coverageQuery.trim().toLocaleLowerCase('fr');
  panel.querySelectorAll('.sti-annex-coverage-item').forEach(row=>{row.hidden=!!query&&!row.dataset.search.includes(query);});
  panel.querySelectorAll('.sti-annex-coverage-group').forEach(group=>{
    const visible=[...group.querySelectorAll('.sti-annex-coverage-item')].some(row=>!row.hidden);
    group.hidden=!visible;
    if(query&&visible)group.open=true;
  });
  const count=panel.querySelector('[data-annex-coverage-result]');
  if(count){
    const visible=panel.querySelectorAll('.sti-annex-coverage-item:not([hidden])').length;
    count.textContent=query?visible+' élément(s) correspondent à la recherche':items.length+' éléments de référence';
  }
}
function renderCoverage(ctx){
  const zone=el('v-suivi');
  if(!zone||!annexes.length)return;
  let panel=el('sti-annex-coverage');
  if(!panel){panel=root.document.createElement('section');panel.id='sti-annex-coverage';panel.className='sti-annex-coverage';zone.append(panel);}
  const title=zone.querySelector('.sti-title');
  if(title&&!title.querySelector('[data-annex-jump]')){
    const jump=root.document.createElement('button');
    jump.type='button';jump.className='btn btn-line sti-annex-jump';jump.dataset.annexJump='1';jump.textContent='Voir le suivi des annexes ↓';
    jump.addEventListener('click',()=>panel.scrollIntoView({behavior:'smooth',block:'start'}));
    title.append(jump);
  }
  const stats=summary(ctx,coverageClass);
  const plannedOnly=stats.planned.size;
  const remaining=stats.total-stats.covered.size-plannedOnly;
  panel.innerHTML=`<div class="sti-annex-coverage-head"><div><span class="sti-annex-eyebrow">SUIVI DU PROGRAMME · ${items.length} ÉLÉMENTS</span><h2>Couverture des annexes</h2><p>En mode « Les deux classes », un élément est couvert dès qu’il a été traité dans au moins une classe. Choisissez une classe pour un bilan séparé.</p></div><div class="sti-annex-coverage-controls"><label for="sti-annex-coverage-class">Classe</label><select id="sti-annex-coverage-class"><option value="all" ${coverageClass==='all'?'selected':''}>Les deux classes</option><option value="3SI1" ${coverageClass==='3SI1'?'selected':''}>3SI1</option><option value="4SI2" ${coverageClass==='4SI2'?'selected':''}>4SI2</option></select></div></div><div class="sti-annex-coverage-summary"><div><strong>${stats.covered.size} <small>/ ${stats.total}</small></strong><span>éléments couverts</span></div><div><strong>${plannedOnly}</strong><span>prévus, non confirmés</span></div><div><strong>${remaining}</strong><span>à traiter</span></div><div class="sti-annex-overall-bar"><i style="width:${stats.percent}%"></i></div></div><div class="sti-annex-coverage-tools"><input type="search" data-annex-coverage-search placeholder="Rechercher dans les 5 annexes…" aria-label="Rechercher un élément dans le suivi des annexes"><span data-annex-coverage-result>${items.length} éléments de référence</span></div><div class="sti-annex-coverage-groups">${annexes.map(a=>coverageRows(ctx,coverageClass,a,stats)).join('')}</div><p class="sti-annex-coverage-note"><strong>Règle de calcul :</strong> « Couvert » signifie coché dans une fiche dont la séance est déclarée assurée et dont la date est passée. Les coches d’une séance future, non confirmée ou reportée apparaissent comme prévues. « Les deux classes » rassemble les éléments couverts dans au moins une classe.</p>`;
  panel.querySelector('#sti-annex-coverage-class').addEventListener('change',event=>{coverageClass=event.target.value;renderCoverage(ctx);});
  const search=panel.querySelector('[data-annex-coverage-search]');
  search.value=coverageQuery;
  search.addEventListener('input',event=>{coverageQuery=event.target.value.toLocaleLowerCase('fr');filterCoverageRows(panel);});
  filterCoverageRows(panel);
}
/* Met en avant un élément d'annexe depuis la recherche globale. */
function focus(id){const item=itemById.get(id);if(!item)return false;coverageQuery=item.labelText.toLocaleLowerCase('fr');const panel=el('sti-annex-coverage');if(panel){const search=panel.querySelector('[data-annex-coverage-search]');if(search){search.value=coverageQuery;filterCoverageRows(panel);}if(panel.scrollIntoView)panel.scrollIntoView({behavior:'smooth',block:'start'});}return true;}
function render(ctx){renderCoverage(ctx);}

root.STI_ANNEX_TRACK={
  version:VERSION,items,ids,summary,mountModal,selection,render,focus
};
})(typeof window!=='undefined'?window:globalThis);
