const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function rapport() {
  const window = {};
  vm.runInNewContext(fs.readFileSync('assets/class-report.js', 'utf8'), { window }, { filename: 'assets/class-report.js' });
  return window.STI_CLASS_REPORT;
}

function contexte() {
  return {
    cls: '3SI1',
    term: 1,
    today: '2026-10-10',
    heuresParSeance: 2,
    sessions: {
      '3SI1': [
        { n: 1, iso: '2026-09-15', tri: 1 },
        { n: 2, iso: '2026-09-22', tri: 1 },
        { n: 3, iso: '2026-10-06', tri: 1 },
        { n: 4, iso: '2026-10-20', tri: 1 },
        { n: 5, iso: '2027-01-12', tri: 2 }
      ]
    },
    livres: {
      '3SI1': {
        items: [
          { id: 'n1', label: 'Titre', domain: 'HTML5' },
          { id: 'n2', label: 'Paragraphe', domain: 'HTML5' },
          { id: 'n3', label: 'Couleurs', domain: 'CSS3' }
        ]
      }
    },
    annexItems: [{ id: 'a1' }, { id: 'a2' }],
    competences: {
      '3SI1': [
        { code: 'A', t: 'Structurer une page', domaine: 'HTML5' },
        { code: 'B', t: 'Mettre en forme', domaine: 'CSS3' }
      ]
    },
    store: {
      seances: {
        '3SI1|1': { done: true, notions: ['n1'], annexes: ['a1'] },
        '3SI1|2': { done: true, notions: ['n2', 'n1'], annexes: ['a2'] },
        '3SI1|3': { done: false, notions: ['n3'] },
        '3SI1|4': {},
        '3SI1|5': { done: true, notions: ['n3'] }
      },
      eleves: {
        '3SI1': [
          { id: 's1', nom: 'Ben Salah', prenom: 'Amina' },
          { id: 's2', nom: 'Trabelsi', prenom: 'Karim', competences: { 1: { A: 'acquis' } } },
          { id: 's3', nom: 'Zouari', prenom: 'Nour', competences: { 1: { A: 'renforcer', B: 'renforcer' } } }
        ]
      },
      epreuves: {
        '3SI1': [
          { id: 'e1', titre: 'Devoir de synthèse', type: 'ds', date: '2026-09-29', bareme: 20 },
          { id: 'e2', titre: 'Devoir du 2e trimestre', type: 'dc', date: '2027-02-01', bareme: 20 }
        ]
      },
      notes: {
        e1: { s1: { n: 10 }, s2: { n: 15 }, s3: { abs: true } },
        e2: { s1: { n: 20 } }
      },
      presences: {
        '3SI1': {
          '2026-09-15': { s1: 'a', s2: 'p' },
          '2026-09-22': { s2: 'p' },
          '2026-10-06': { s1: 'a', s2: 'r' }
        }
      }
    }
  };
}

test('les séances du trimestre sont comptées par état et converties en heures', () => {
  const b = rapport().build(contexte());
  assert.equal(b.empty, false);
  assert.equal(b.cls, '3SI1');
  assert.equal(b.term, 1);
  assert.deepEqual({ ...b.periode }, { debut: '2026-09-15', fin: '2026-10-20' });
  assert.deepEqual(
    { prevues: b.seances.prevues, assurees: b.seances.assurees, reportees: b.seances.reportees, aVenir: b.seances.aVenir },
    { prevues: 4, assurees: 2, reportees: 1, aVenir: 1 }
  );
  assert.equal(b.seances.aConfirmer, 0);
  assert.deepEqual({ ...b.heures }, { parSeance: 2, prevues: 8, assurees: 4 });
});

test('la couverture des notions et des annexes ne retient que les séances assurées', () => {
  const b = rapport().build(contexte());
  assert.equal(b.notions.total, 3);
  assert.equal(b.notions.vues, 2);
  assert.equal(b.notions.percent, 66.7);
  assert.deepEqual(Array.from(b.notions.domaines, d => [d.domaine, d.vues, d.total]), [['HTML5', 2, 2], ['CSS3', 0, 1]]);
  assert.equal(b.notions.domaines[0].percent, 100);
  assert.equal(b.annexes.vues, 2);
  assert.equal(b.annexes.total, 2);
  assert.equal(b.annexes.percent, 100);
});

test('les évaluations du trimestre donnent les moyennes, extrêmes et le taux de réussite', () => {
  const b = rapport().build(contexte());
  assert.equal(b.evaluations.nb, 1, 'seule l’épreuve de la période est retenue');
  assert.equal(b.evaluations.moyenne, 12.5);
  assert.equal(b.evaluations.min, 10);
  assert.equal(b.evaluations.max, 15);
  assert.equal(b.evaluations.reussite, 100);
  assert.equal(b.evaluations.titres[0].titre, 'Devoir de synthèse');
});

test('l’assiduité et les compétences sont agrégées par élève', () => {
  const b = rapport().build(contexte());
  assert.equal(b.assiduite.seancesObservees, 3);
  assert.equal(b.assiduite.attendus, 9);
  assert.equal(b.assiduite.absences, 2);
  assert.equal(b.assiduite.retards, 1);
  assert.equal(b.assiduite.tauxPresence, 77.8);
  const competenceA = b.competences.definitions.find(c => c.code === 'A');
  assert.deepEqual(
    { acquis: competenceA.acquis, 'en-cours': competenceA['en-cours'], renforcer: competenceA.renforcer, non: competenceA.non },
    { acquis: 1, 'en-cours': 0, renforcer: 1, non: 1 }
  );
});

test('les élèves à suivre sont classés et signalés selon des seuils explicites', () => {
  const b = rapport().build(contexte());
  assert.equal(b.effectif, 3);
  assert.equal(b.suivre.length, 2);
  const nour = b.suivre.find(e => e.id === 's3');
  assert.equal(nour.statut, 'alerte');
  assert.equal(nour.aRenforcer, 2);
  const amina = b.suivre.find(e => e.id === 's1');
  assert.equal(amina.statut, 'vigilance');
  assert.equal(amina.absences, 2);
  assert.equal(b.alertes, 1);
  assert.equal(b.eleves.find(e => e.id === 's2').statut, 'ok');
});

test('la synthèse résume la période en une phrase lisible', () => {
  const b = rapport().build(contexte());
  assert.match(b.synthese, /2 séance\(s\) assurée\(s\) sur 4 prévues/);
  assert.match(b.synthese, /2 \/ 3/);
  assert.match(b.synthese, /moyenne de classe 12.5 \/ 20/);
  assert.match(b.synthese, /absence/);
});

test('un trimestre sans séance produit un bilan vide explicite', () => {
  const b = rapport().build({ cls: '4SI2', term: 3, store: {}, sessions: { '4SI2': [{ n: 1, iso: '2026-09-01', tri: 1 }] } });
  assert.equal(b.empty, true);
  assert.equal(b.seances.prevues, 0);
  assert.equal(b.evaluations.moyenne, null);
  assert.equal(b.assiduite.tauxPresence, null);
  assert.match(b.synthese, /Aucune séance/);
});
