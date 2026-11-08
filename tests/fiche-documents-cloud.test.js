const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const {randomUUID} = require('node:crypto');

function backend() {
  const rows = [], objects = new Map(), calls = []; let failMetadata = false;
  function reply(body, status = 200) { return new Response(typeof body === 'string' || body instanceof Blob ? body : JSON.stringify(body), {status}); }
  async function fetch(url, options) {
    calls.push({url,options});
    const u = new URL(url), path = u.pathname, uid = options.headers.Authorization.replace('Bearer ', '');
    assert.equal(options.headers.apikey, 'public-key');
    if (path.startsWith('/storage/v1/object/authenticated/documents-seances/')) {
      const key = decodeURIComponent(path.split('/').slice(6).join('/'));
      if (!key.startsWith(uid+'/') || !objects.has(key)) return reply('',404);
      return reply(objects.get(key));
    }
    if (path === '/storage/v1/object/documents-seances' && options.method === 'DELETE') {
      for (const key of JSON.parse(options.body).prefixes) if (key.startsWith(uid+'/')) objects.delete(key);
      return reply([]);
    }
    if (path.startsWith('/storage/v1/object/documents-seances/') && options.method === 'POST') {
      const key = decodeURIComponent(path.split('/').slice(5).join('/'));
      if (!key.startsWith(uid+'/')) return reply('',403);
      objects.set(key, options.body); return reply({});
    }
    if (path === '/rest/v1/documents_seance') {
      if (failMetadata && options.method === 'POST') { failMetadata = false; return reply('',503); }
      if (!options.method) return reply(rows.filter(r => r.prof_id === uid && r.annee === u.searchParams.get('annee').slice(3)));
      if (options.method === 'POST') {
        const row = JSON.parse(options.body);
        if (row.prof_id !== uid || !row.chemin.startsWith(uid+'/')) return reply('',403);
        if (rows.some(r => ['prof_id','annee','classe','seance','categorie','nom'].every(k=>r[k]===row[k]))) return reply('',409);
        row.id = randomUUID(); rows.push(row); return reply([row], 201);
      }
      const id = u.searchParams.get('id').slice(3), chemin = u.searchParams.get('chemin').slice(3);
      const i = rows.findIndex(r => r.id === id && r.chemin === chemin && r.prof_id === uid);
      if (i < 0) return reply([]);
      if (options.method === 'PATCH') { Object.assign(rows[i], JSON.parse(options.body)); return reply([rows[i]]); }
      if (options.method === 'DELETE') return reply([rows.splice(i,1)[0]]);
    }
    throw Error('Requête inattendue : '+url+' '+options.method);
  }
  return {fetch, rows, objects, calls, failNextMetadata:()=>{failMetadata = true;}};
}
function client(server, uid) {
  let current = uid;
  const root = { cloudCfg:()=>({url:'https://project.supabase.co',key:'public-key',auth:true}), authSession:()=>({user:{id:current}}),
    activeProfessorProfile:()=>({prof_id:current}), authToken:async()=>current, SCHOOL:{annee:'2026 - 2027'}, crypto:{randomUUID}, fetch:server.fetch };
  vm.runInNewContext(fs.readFileSync('assets/fiche-documents-cloud.js','utf8'), {window:root,URLSearchParams,encodeURIComponent});
  return {api:root.STI_FICHE_CLOUD, switchUser:value=>{current=value;}};
}
function file(name, content) { return Object.assign(new Blob([content]),{name}); }

test('deux appareils retrouvent et téléchargent les mêmes fichiers, isolés par compte', async () => {
  const server = backend(), pc = client(server,'prof-a'), mobile = client(server,'prof-a'), autre = client(server,'prof-b');
  await pc.api.upload('3SI1|5','ressources',file('cours élève.pdf','contenu'));
  const list = await mobile.api.listMany(['3SI1|5','3SI1|6']);
  assert.equal(list['3SI1|5'].ressources[0].name,'cours élève.pdf');
  assert.equal(await (await mobile.api.download(list['3SI1|5'].ressources[0])).text(), 'contenu');
  assert.equal(Object.keys((await autre.api.listMany(['3SI1|5']))['3SI1|5']).length, 0);
  await assert.rejects(autre.api.download(list['3SI1|5'].ressources[0]), /invalide/);
  await mobile.api.remove(list['3SI1|5'].ressources[0]);
  assert.equal(Object.keys((await pc.api.listMany(['3SI1|5']))['3SI1|5']).length, 0);
  assert.equal(server.objects.size,0);
});

test('un remplacement concurrent ne supprime pas le fichier actif', async () => {
  const server = backend(), pc = client(server,'prof-a'), mobile = client(server,'prof-a');
  await pc.api.upload('4SI2|12','enonce',file('sujet.pdf','ancien'));
  const stale = (await pc.api.listMany(['4SI2|12']))['4SI2|12'].enonce[0];
  await mobile.api.upload('4SI2|12','enonce',file('sujet.pdf','mobile'),stale);
  await assert.rejects(pc.api.upload('4SI2|12','enonce',file('sujet.pdf','pc'),stale), /changé/);
  const active = (await pc.api.listMany(['4SI2|12']))['4SI2|12'].enonce[0];
  assert.equal(await (await pc.api.download(active)).text(), 'mobile');
});

test('une erreur d’enregistrement est signalée sans effacer le fichier existant', async () => {
  const server = backend(), pc = client(server,'prof-a');
  server.failNextMetadata();
  await assert.rejects(pc.api.upload('3SI1|5','ressources',file('panne.pdf','a')), /à vérifier/);
  assert.equal(server.rows.length, 0);
  assert.equal(server.objects.size, 1, 'un envoi à réponse incertaine ne doit pas supprimer un objet potentiellement référencé');
});

test('la migration protège métadonnées et stockage avec les politiques du propriétaire', () => {
  const sql = fs.readFileSync('supabase/migrations/20261108_documents_seance.sql','utf8');
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /prof_id = auth\.uid\(\)/);
  assert.match(sql, /documents-seances', 'documents-seances', false/);
  assert.match(sql, /storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/);
  assert.match(sql, /revoke all on public\.documents_seance from public, anon/);
});
