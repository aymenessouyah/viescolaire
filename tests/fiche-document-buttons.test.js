const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('assets/fiches.js','utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));

function setup() {
  let mode = false, result = {data:{'4SI2|16':{enonce:[{}],ressources:[],correction:[{},{}]}},cloudError:'',localError:''}, mounts = [];
  const mkFiche = (n,titre,nature) => ({n,titre,nature,date:'2026-11-16',tri:1,domaines:'Évaluation',axes:['SQL']});
  const f1 = mkFiche(16,'Devoir de contrôle n°2','devoir de contrôle');
  const f2 = mkFiche(17,'Correction du DC2','correction');
  const f3 = mkFiche(18,'Un cours','cours');
  const f4 = mkFiche(48,'Devoir de synthèse n°3','devoir de synthèse');
  const root = {STI_DATA:{fiches4SI2:{16:f1,17:f2,18:f3,48:f4},fiches3SI1:{1:mkFiche(1,'Cours 3SI1','cours')}},
    SESSIONS:{'4SI2':[{cls:'4SI2',n:16,tri:1,blk:{k:'dc'}},{cls:'4SI2',n:48,tri:3,blk:{k:'cours'}}]},
    STI_INTERFACE:{isClassMode:()=>mode}, addEventListener() {},
    STI_FICHE_DEVOIR_DOCUMENTS:{statusForSessions:async()=>result,mount:(host,session,opts)=>mounts.push({host,session,opts})}};
  const host = {classList:{contains:()=>true}, buttons:[], querySelectorAll:()=>host.buttons,
    set innerHTML(value){this.html=value;for(const b of this.buttons)b.isConnected=false;this.buttons=[];
      for(const m of value.matchAll(/<button type="button" class="fic-doc-button" data-fic-doc-n="(\d+)" data-fic-doc-type="(\w+)" data-state="(\w+)" ([\s\S]*?)>([ERC])<\/button>/g)) {
        this.buttons.push({dataset:{ficDocN:m[1],ficDocType:m[2],state:m[3]},disabled:m[4].includes('disabled'),isConnected:true,title:'',setAttribute(k,v){this[k]=v;}});
      }
    }, get innerHTML(){return this.html;}};
  let dialog;
  const document = {readyState:'loading', addEventListener() {}, activeElement:{isConnected:true,focus(){}},
    getElementById(id){return id==='v-fiches'?host:id==='fic-doc-dialog'?dialog:null;},
    createElement(tag){assert.equal(tag,'dialog');const events={},d={className:'',style:{},setAttribute(){},addEventListener(n,fn){events[n]=fn;},
      querySelector(s){return s==='[data-fic-doc-close]'?this.closeButton:this.body;},showModal(){this.open=true;},close(){this.open=false;events.close();},
      set innerHTML(value){this.html=value;this.body={isConnected:true};this.closeButton={};},get innerHTML(){return this.html;}};return d;},
    body:{appendChild(node){dialog=node;}}};
  vm.runInNewContext(source,{window:root,document,Date,Promise,console,ic:()=>""});
  return {root,host,mounts, get dialog(){return dialog;},setMode:v=>{mode=v;},setResult:v=>{result=v;}};
}

test('E R C apparaissent uniquement sous les devoirs et reflètent les fichiers joints', async () => {
  const t = setup(); t.root.STI_FICHES.render(); await flush();
  assert.equal(t.host.buttons.length,6);
  assert.match(t.host.html, /Devoir de contrôle n°2[\s\S]*?fic-doc-buttons[\s\S]*?data-fic-doc-n="16"/);
  assert.deepEqual(t.host.buttons.filter(b=>b.dataset.ficDocN==='16').map(b=>b.dataset.state),['attached','empty','attached']);
  assert.deepEqual(t.host.buttons.filter(b=>b.dataset.ficDocN==='48').map(b=>b.dataset.state),['empty','empty','empty']);
  assert.match(t.host.buttons[0]['aria-label'],/Énoncé — 1 fichier/);
  assert.match(t.host.buttons[2]['aria-label'],/Correction — 2 fichier/);
});

test('chaque bouton ouvre directement la bonne catégorie et maintient le mode classe', async () => {
  const t = setup(); t.root.STI_FICHES.render(); await flush();
  t.root.STI_FICHES.documents(16,'ressources');
  assert.equal(t.dialog.open,true); assert.equal(t.mounts[0].session.n,16);
  assert.equal(t.mounts[0].opts.onlyType,'ressources'); assert.equal(t.mounts[0].opts.forceDevoir,true);
  assert.equal(typeof t.mounts[0].opts.onChange,'function'); t.dialog.close();
  t.root.STI_FICHES.documents(17,'enonce'); assert.equal(t.mounts.length,1);
  t.setMode(true); t.root.STI_FICHES.render(); await flush();
  const correction = t.host.buttons.find(b=>b.dataset.ficDocType==='correction');
  assert.equal(correction.disabled,true); assert.equal(correction.dataset.state,'hidden');
  t.root.STI_FICHES.documents(16,'correction'); assert.equal(t.mounts.length,1);
  t.root.STI_FICHES.documents(48,'enonce'); assert.equal(t.mounts[1].opts.onlyType,'enonce');
});

test('un état de stockage inconnu ne se présente pas comme absence de fichier', async () => {
  const t = setup(); t.setResult({data:{'4SI2|16':{enonce:[{}]}},cloudError:'Hors ligne',localError:''});
  t.root.STI_FICHES.render(); await flush();
  const buttons = t.host.buttons.filter(b=>b.dataset.ficDocN==='16');
  assert.equal(buttons[0].dataset.state,'attached'); assert.match(buttons[0].title,/vérification partielle/);
  assert.equal(buttons[1].dataset.state,'unknown'); assert.match(buttons[1].title,/statut indisponible/);
});

test('les résultats tardifs ne changent pas les boutons après changement de classe', async () => {
  const t = setup(); let resolve;
  t.root.STI_FICHE_DEVOIR_DOCUMENTS.statusForSessions = () => new Promise(r=>{resolve=r;});
  t.root.STI_FICHES.render(); const oldButton = t.host.buttons[0];
  t.root.STI_FICHES.cls('3SI1');
  resolve({data:{'4SI2|16':{enonce:[{}]}},cloudError:'',localError:''}); await flush();
  assert.equal(oldButton.isConnected,false); assert.equal(oldButton.dataset.state,'loading');
  assert.equal(t.host.buttons.length,0);
});
