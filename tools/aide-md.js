#!/usr/bin/env node
/* Génère docs/AIDE-ENSEIGNANT.md à partir de data/aide.js.
   Usage : node tools/aide-md.js
   Le test tests/help.test.js vérifie que le fichier produit est identique. */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const racine = path.resolve(__dirname, '..');

function chargerAide(fichier) {
  const source = fs.readFileSync(fichier || path.join(racine, 'data/aide.js'), 'utf8');
  const contexte = {};
  contexte.window = contexte;
  vm.createContext(contexte);
  vm.runInContext(source, contexte, { filename: 'data/aide.js' });
  const aide = contexte.STI_DATA && contexte.STI_DATA.aide;
  if (!aide || !Array.isArray(aide.sections)) throw new Error('data/aide.js ne définit pas STI_DATA.aide.sections');
  return aide;
}

function ancre(titre) {
  return String(titre)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function markdown(aide) {
  const lignes = [];
  const categories = Array.isArray(aide.categories) ? aide.categories : [];
  const sections = Array.isArray(aide.sections) ? aide.sections : [];

  lignes.push('# ' + (aide.titre || 'Guide du professeur'));
  lignes.push('');
  lignes.push('> Fichier généré depuis `data/aide.js` : ne pas modifier à la main.');
  lignes.push('> Pour le régénérer : `node tools/aide-md.js`.');
  lignes.push('');
  if (aide.intro) { lignes.push(aide.intro); lignes.push(''); }

  lignes.push('## Sommaire');
  lignes.push('');
  categories.forEach(cat => {
    const items = sections.filter(s => s.categorie === cat.id);
    if (!items.length) return;
    lignes.push('**' + cat.titre + '**');
    lignes.push('');
    items.forEach(s => lignes.push('- [' + s.titre + '](#' + ancre(s.titre) + ')'));
    lignes.push('');
  });
  lignes.push('');

  categories.forEach(cat => {
    const items = sections.filter(s => s.categorie === cat.id);
    if (!items.length) return;
    lignes.push('## ' + cat.titre);
    lignes.push('');
    items.forEach(s => {
      lignes.push('### ' + s.titre);
      lignes.push('');
      if (s.resume) { lignes.push('*' + s.resume + '*'); lignes.push(''); }
      if (s.objectif) { lignes.push('**Objectif.** ' + s.objectif); lignes.push(''); }
      if (Array.isArray(s.etapes) && s.etapes.length) {
        lignes.push('**Comment faire**');
        lignes.push('');
        s.etapes.forEach((e, i) => lignes.push((i + 1) + '. ' + e));
        lignes.push('');
      }
      if (Array.isArray(s.astuces) && s.astuces.length) {
        lignes.push('**À savoir**');
        lignes.push('');
        s.astuces.forEach(a => lignes.push('- ' + a));
        lignes.push('');
      }
    });
  });

  const faq = Array.isArray(aide.faq) ? aide.faq : [];
  if (faq.length) {
    lignes.push('## Questions fréquentes');
    lignes.push('');
    faq.forEach(item => {
      lignes.push('### ' + item.q);
      lignes.push('');
      lignes.push(item.r);
      lignes.push('');
    });
  }

  lignes.push('---');
  lignes.push('');
  lignes.push('Version du contenu : `' + (aide.version || '') + '`.');
  lignes.push('');
  return lignes.join('\n');
}

function ecrire(cible) {
  const aide = chargerAide();
  const destination = cible || path.join(racine, 'docs', 'AIDE-ENSEIGNANT.md');
  fs.writeFileSync(destination, markdown(aide), 'utf8');
  return destination;
}

if (require.main === module) {
  const chemin = ecrire(process.argv[2]);
  console.log('Guide écrit dans ' + path.relative(racine, chemin));
}

module.exports = { chargerAide, markdown, ecrire, ancre };
