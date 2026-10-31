/* Vérifie que l'édition 2026 du Smart Book 3e SI est bien répercutée dans les
   écrans qui affichent des pourcentages : grille des domaines (avancement),
   tableau de bord initial et référentiel. Les écrans sont rendus avec un DOM
   minimal pour contrôler les textes réellement produits. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function node(id) {
  return {
    id, innerHTML: '', textContent: '', value: '', hidden: false, dataset: {}, style: {},
    classList: { toggle() { return false; }, add() {}, remove() {}, contains() { return false; } },
    append() {}, prepend() {}, remove() {}, addEventListener() {}, removeAttribute() {},
    setAttribute() {}, getAttribute() { return ''; }, querySelector() { return null; },
    querySelectorAll() { return []; }, scrollIntoView() {}, close() {}, showModal() {},
    isConnected: true, dispatchEvent() {}, focus() {}
  };
}

function boot() {
  const els = {};
  const document = {
    getElementById: id => els[id] || (els[id] = node(id)),
    createElement: () => node('tmp'),
    addEventListener() {}, hidden: false, readyState: 'complete'
  };
  const sandbox = {
    document, localStorage: { getItem() { return null; }, setItem() {} },
    navigator: { onLine: true }, setInterval() {}, clearInterval() {}, setTimeout, clearTimeout,
    crypto: { randomUUID: () => 'test' }, console
  };
  sandbox.window = sandbox;
  sandbox.addEventListener = () => {};
  vm.createContext(sandbox);
  ['data/livres-sti.js', 'assets/suivi-sti.js', 'data/repartition3SI1.js',
   'data/repartition4SI2.js', 'assets/annexes-fonctions.js'].forEach(file =>
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file }));
  vm.runInContext(fs.readFileSync('assets/interface-reference.js', 'utf8'), sandbox, { filename: 'assets/interface-reference.js' });

  const sessions = rep => Array.from(rep || []).map(b => ({ n: b.num, iso: b.iso, blk: { t: b.t, d: b.d, k: b.k, o: b.o } }));
  const ctx = {
    store: {
      seances: { '3SI1|1': { done: true, notions: ['3si-r001', '3si-r270', '3si-r283', '3si-r288'] } },
      eleves: {}, notes: {}, epreuves: {}, profil: {}
    },
    sessions: {
      '3SI1': sessions(sandbox.STI_DATA.repartition3SI1),
      '4SI2': sessions(sandbox.STI_DATA.repartition4SI2)
    },
    term: 1, view: 'v-dash'
  };
  sandbox.STI_TRACK.render(ctx);
  sandbox.STI_INTERFACE.render(ctx);
  return { sandbox, els, text: html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() };
}

const rendered = boot();

test('la grille des domaines compte les 291 notions et les 7 domaines suivis', () => {
  const html = rendered.els['v-avancement'].innerHTML;
  const counts = (html.match(/<b>\d+<\/b> \/ \d+/g) || [])
    .map(text => text.replace(/<[^>]*>/g, '').replace(/\s+/g, ''));
  assert.deepEqual(counts, ['1/76', '1/92', '1/88', '1/32', '0/1', '0/1', '0/1']);
  assert.match(html, /Pourcentage de notions abordées/);
});

test('le tableau de bord initial affiche le dénominateur de l’édition en cours', () => {
  const dash = rendered.els['v-dash'].innerHTML;
  const text = rendered.text(dash);
  assert.match(text, /1,4 %/);                       /* 4 notions cochées sur 291 */
  assert.match(text, /4\/291 notions/);
  assert.match(text, /0\/333 notions/);
  assert.match(text, /3SI1 : 291 notions · version finale \(31 octobre 2026\)/);
  assert.match(text, /19 notions des encadrés « Complément » \(CSS3 9 · JavaScript 9 · SQL \/ BD 1\)/);
});

test('la note d’édition accompagne les pourcentages de l’avancement', () => {
  const text = rendered.text(rendered.els['v-avancement'].innerHTML);
  assert.match(text, /version finale du 31 octobre 2026, partie 1 p\. 5 à 13 — tableaux p\. 67 à 81/);
  assert.match(text, /\(HTML5 67-70 · CSS3 71-75 · JavaScript 76-79 · SQL \/ BD 80-81\)/);
  assert.match(text, /Les pourcentages portent sur 291 notions/);
});

test('le référentiel signale les 19 compléments et le total par domaine', () => {
  const suivi = rendered.els['v-suivi'].innerHTML;
  const rows = rendered.els['sti-results'].innerHTML;
  assert.match(rendered.text(suivi), /291/);
  assert.equal((rows.match(/data-sti-reference=/g) || []).length, 291);
  assert.equal((rows.match(/class="sti-new">complément/g) || []).length, 19);
  assert.equal((rows.match(/class="sti-new">nouveau/g) || []).length, 0);
  assert.deepEqual(
    (suivi.match(/sti-domain-new">\+\d+/g) || []).map(x => x.replace(/[^+0-9]/g, '')),
    ['+9', '+9', '+1']
  );
  assert.match(rendered.text(suivi), /Référentiel 3SI1 : 291 notions, version finale du 31 octobre 2026, partie 1 p\. 5 à 13 — tableaux p\. 67 à 81, dont 19 notions des encadrés « Complément »/);
  assert.match(rendered.text(suivi), /Votre livre 5–81 Pages du livre · version finale du 31 octobre 2026/);
  assert.match(rendered.text(rows), /Système d’exploitation[^·]*· livre p\. 5, 6, 7/);
  assert.match(rendered.text(rows), /Internet des objets \(IoT\)/);
});
