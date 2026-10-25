const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('assets/offline-sync.js', 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

function makeSyncHarness(){
  const url='https://school.example.supabase.co';
  const ownerId='teacher-a';
  const schoolYear='2026-2027';
  const scope=url+'|'+ownerId+'|'+schoolYear;
  const pinKey='sti_sync_owner_v1';
  const stores=new Map([['scopes',new Map([[scope,{
    id:scope,owner:{id:ownerId,url,email:'teacher-a@example.test'},base:{},headId:'head-1',
    local:{},conflict:null,lastOk:null
  }]])],['backups',new Map()]]);
  const saved=new Map([[pinKey,scope]]);
  const localStorage={
    getItem(key){return saved.get(key)||null;},
    setItem(key,value){saved.set(key,String(value));},
    removeItem(key){saved.delete(key);}
  };
  const business={
    times:{'3SI1':{},'4SI2':{}},seances:{'3SI1|1':{title:'Cours'}},
    profil:{prof_id:ownerId,email:'teacher-a@example.test',nom:'Professeur A'},
    classes:{'3SI1':['G1']},eleves:{},epreuves:{},notes:{},presences:{}
  };
  const store={...business,saved:'2026-10-25T08:00:00.000Z',access_token:'must-not-leak',secret:'must-not-leak'};
  const db={
    transaction(table){
      const tx={
        objectStore(name){
          const records=stores.get(name);
          return {
            get(key){const request={};queueMicrotask(()=>{request.result=records.get(key)||null;request.onsuccess?.();});return request;},
            put(value){records.set(value.id,value);queueMicrotask(()=>tx.oncomplete?.());},
            getAll(){const request={};queueMicrotask(()=>{request.result=[...records.values()];request.onsuccess?.();});return request;}
          };
        }
      };
      return tx;
    }
  };
  const indexedDB={open(){const request={};queueMicrotask(()=>{request.result=db;request.onsuccess?.();});return request;}};
  const document={
    readyState:'complete',activeElement:{tagName:'BODY'},
    getElementById(){return null;},querySelector(){return null;},addEventListener(){},
    createElement(){return {};}
  };
  const window={
    document,localStorage,indexedDB,store,
    STI_DATA:{reference:{HORAIRES_DEFAUT:{'3SI1':{},'4SI2':{}}}},
    STI_MERGE:{clone:value=>JSON.parse(JSON.stringify(value)),equal:(a,b)=>JSON.stringify(a)===JSON.stringify(b),merge:()=>({conflicts:[]})},
    SCHOOL:{annee:schoolYear},cloudCfg:()=>({url,key:'public-key',table:'espace_pedagogique',auth:true}),
    authSession:()=>({user:{id:ownerId,email:'teacher-a@example.test'}}),authToken:async()=>null,
    addEventListener(){},setInterval(){return 1;},clearInterval(){},
    setTimeout,clearTimeout,crypto:{randomUUID:()=> 'test-id'}
  };
  const navigator={onLine:true};
  vm.runInNewContext(source,{window,document,localStorage,indexedDB,navigator,setTimeout:()=>0,clearTimeout(){},setInterval:()=>1,clearInterval(){},queueMicrotask,console},{filename:'assets/offline-sync.js'});
  return{sync:window.STI_SYNC,window,localStorage,scope,ownerId,schoolYear,business};
}

test('le snapshot Drive expose uniquement les champs métier du professeur lié', async()=>{
  const h=makeSyncHarness();
  await h.sync.ready;
  const snapshot=h.sync.backupSnapshot();
  assert.equal(snapshot.userId,h.ownerId);
  assert.equal(snapshot.schoolYear,h.schoolYear);
  assert.deepEqual(plain(snapshot.data),{...h.business,saved:'2026-10-25T08:00:00.000Z'});
  assert.equal(JSON.stringify(snapshot).includes('must-not-leak'),false);
});

test('le profil d’un autre compte ou sans identité est exclu des données synchronisées', async()=>{
  const h=makeSyncHarness();
  await h.sync.ready;
  h.window.store.profil={prof_id:'teacher-b',email:'teacher-b@example.test',nom:'Autre professeur'};
  assert.equal(h.sync.backupSnapshot().data.profil,null);
  h.window.store.profil={nom:'Profil ancien non identifié'};
  assert.equal(h.sync.backupSnapshot().data.profil,null);
});

test('aucun snapshot Drive n’est fourni si l’identité active ou le verrou local diffère', async()=>{
  const h=makeSyncHarness();
  await h.sync.ready;
  h.window.authSession=()=>({user:{id:'teacher-b',email:'teacher-b@example.test'}});
  assert.equal(h.sync.backupSnapshot(),null);
  h.window.authSession=()=>({user:{id:h.ownerId,email:'teacher-a@example.test'}});
  h.localStorage.setItem('sti_sync_owner_v1','another-teacher-scope');
  assert.equal(h.sync.backupSnapshot(),null);
});
