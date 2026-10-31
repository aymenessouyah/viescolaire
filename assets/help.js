/* Guide du professeur : bouton « Aide » (F1).
   Affiche le contenu de `data/aide.js` dans une fenêtre plein écran avec
   sommaire par thème, recherche instantanée, étapes, astuces, liens vers
   l'écran concerné et impression de la page courante.
   Les fonctions pures (sections, search, find) sont testables sans navigateur. */
(function (root) {
  'use strict';

  const VERSION = 'aide-enseignant-ui-v1';
  const donnees = () => (root.STI_DATA || {}).aide || { sections: [], categories: [], faq: [] };

  const esc = value => String(value == null ? '' : value)
    .replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

  function normalize(value) {
    return String(value == null ? '' : value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[\u2019\u2018]/g, "'").replace(/\s+/g, ' ').trim();
  }

  /* ---------- données ---------- */
  function sections() { return Array.isArray(donnees().sections) ? donnees().sections.slice() : []; }

  function categories() {
    const d = donnees();
    const connues = Array.isArray(d.categories) ? d.categories : [];
    const vues = new Set(connues.map(c => c.id));
    const extras = [...new Set(sections().map(s => s.categorie).filter(c => c && !vues.has(c)))]
      .map(id => ({ id, titre: id }));
    return connues.concat(extras);
  }

  function find(id) { return sections().find(s => s.id === id) || null; }

  function texteDe(section) {
    return normalize([
      section.titre, section.resume, section.objectif,
      (section.etapes || []).join(' '), (section.astuces || []).join(' ')
    ].join(' '));
  }

  /* Un titre qui contient la requête passe avant une simple mention dans le texte. */
  function score(section, requete) {
    const titre = normalize(section.titre);
    if (titre === requete) return 70;
    if (titre.startsWith(requete)) return 50;
    if (titre.includes(requete)) return 30;
    return 0;
  }

  function search(texte) {
    const requete = normalize(texte);
    const liste = sections();
    if (!requete) return liste;
    const jetons = requete.split(' ').filter(Boolean);
    return liste
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => {
        const texteSection = texteDe(section);
        return jetons.every(jeton => texteSection.includes(jeton));
      })
      .sort((a, b) => score(b.section, requete) - score(a.section, requete) || a.index - b.index)
      .map(({ section }) => section);
  }

  function pourVue(vue) {
    return sections().find(s => s.vue === vue) || null;
  }

  /* ---------- interface ---------- */
  let courante = null;
  let filtre = '';

  function el(id) { return typeof document === 'undefined' ? null : document.getElementById(id); }

  function groupe(catId, liste) {
    const cat = categories().find(c => c.id === catId) || { titre: catId };
    const items = liste.filter(s => s.categorie === catId);
    if (!items.length) return '';
    return '<div class="aide-groupe"><h3 class="aide-groupe-titre">' + esc(cat.titre) + '</h3>' +
      items.map(s =>
        '<button type="button" class="aide-lien' + (courante === s.id ? ' on' : '') + '" data-aide="' + esc(s.id) + '">' +
        esc(s.titre) + '</button>').join('') + '</div>';
  }

  function dessinerSommaire(liste) {
    const zone = el('aide-sommaire');
    if (!zone) return;
    const corps = categories().map(c => groupe(c.id, liste)).join('');
    zone.innerHTML = corps || '<p class="aide-vide">Aucune rubrique ne correspond à cette recherche.</p>';
  }

  function dessinerArticle() {
    const zone = el('aide-article');
    if (!zone) return;
    const d = donnees();
    const section = find(courante) || sections()[0] || null;

    const intro = '<div class="aide-intro"><p class="aide-kicker">' + esc(d.titre || 'Guide du professeur') + '</p>' +
      '<h2>' + esc(d.titre || 'Aide') + '</h2><p class="aide-resume">' + esc(d.intro || '') + '</p></div>';

    if (!section) { zone.innerHTML = intro; return; }

    const cat = categories().find(c => c.id === section.categorie);
    const etapes = (section.etapes || []).map(e => '<li>' + esc(e) + '</li>').join('');
    const astuces = (section.astuces || []).map(a => '<li>' + esc(a) + '</li>').join('');
    const faq = (d.faq || []).map(item =>
      '<details class="aide-faq"><summary>' + esc(item.q) + '</summary><p>' + esc(item.r) + '</p></details>').join('');

    zone.innerHTML = intro +
      '<article class="aide-page">' +
      '<p class="aide-kicker">' + esc(cat ? cat.titre : 'Aide') + '</p>' +
      '<h3>' + esc(section.titre) + '</h3>' +
      (section.resume ? '<p class="aide-resume">' + esc(section.resume) + '</p>' : '') +
      (section.objectif ? '<p class="aide-objectif"><strong>Objectif.</strong> ' + esc(section.objectif) + '</p>' : '') +
      (etapes ? '<h4 class="aide-soustitre">Comment faire</h4><ol class="aide-etapes">' + etapes + '</ol>' : '') +
      (astuces ? '<h4 class="aide-soustitre">À savoir</h4><ul class="aide-astuces">' + astuces + '</ul>' : '') +
      (section.vue ? '<p class="aide-action no-print"><button type="button" class="btn btn-primary" onclick="STI_HELP.go(\'' + esc(section.vue) + '\')">Ouvrir l’écran concerné</button></p>' : '') +
      '</article>' +
      (section.id === 'depannage' && faq ? '<section class="aide-faqs"><h4 class="aide-soustitre">Questions fréquentes</h4>' + faq + '</section>' : '') +
      '<footer class="aide-pied">Guide du professeur · version ' + esc(root.APP_VER || '') +
      ' · utilisable hors ligne et imprimable.</footer>';
    zone.scrollTop = 0;
  }

  function select(id) {
    if (!find(id)) return false;
    courante = id;
    dessinerSommaire(search(filtre));
    dessinerArticle();
    return true;
  }

  function filtrer(texte) {
    filtre = texte || '';
    const liste = search(filtre);
    dessinerSommaire(liste);
    /* la recherche sélectionne toujours le meilleur résultat */
    if (filtre && liste.length) {
      courante = liste[0].id;
      dessinerArticle();
    }
    const note = el('aide-compte');
    if (note) note.textContent = filtre ? liste.length + ' rubrique(s) trouvée(s)' : '';
  }

  function open(id) {
    const dialog = el('aide-dialog');
    if (!dialog) return false;
    const visible = typeof document !== 'undefined' ? document.querySelector('.view.on') : null;
    const auto = pourVue(visible ? visible.id : '');
    courante = (id && find(id)) ? id : (courante && find(courante) ? courante : (auto ? auto.id : 'demarrer'));
    filtre = '';
    const champ = el('aide-search');
    if (champ) champ.value = '';
    dessinerSommaire(sections());
    dessinerArticle();
    const note = el('aide-compte');
    if (note) note.textContent = '';
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) { try { dialog.showModal(); } catch (e) { dialog.setAttribute('open', ''); } }
    } else {
      dialog.setAttribute('open', '');
      dialog.classList.add('aide-fallback');
    }
    if (typeof document !== 'undefined' && document.body) document.body.classList.add('aide-ouverte');
    if (champ && champ.focus) champ.focus();
    return true;
  }

  function close() {
    const dialog = el('aide-dialog');
    if (!dialog) return false;
    if (typeof dialog.close === 'function') { try { dialog.close(); } catch (e) { dialog.removeAttribute('open'); } }
    else dialog.removeAttribute('open');
    if (typeof document !== 'undefined' && document.body) document.body.classList.remove('aide-ouverte');
    return true;
  }

  function toggle() {
    const dialog = el('aide-dialog');
    if (dialog && dialog.hasAttribute('open')) return close();
    return open();
  }

  function go(vue) {
    close();
    if (typeof root.go === 'function') root.go(vue);
    return true;
  }

  function print() {
    if (typeof root.print === 'function') root.print();
  }

  function bind() {
    const dialog = el('aide-dialog');
    if (!dialog || dialog.dataset.aideBound === 'true') return;
    dialog.dataset.aideBound = 'true';

    dialog.addEventListener('click', event => {
      const lien = event.target.closest ? event.target.closest('[data-aide]') : null;
      if (lien) { select(lien.dataset.aide); return; }
      if (event.target === dialog) close();
    });

    const champ = el('aide-search');
    if (champ && typeof champ.addEventListener === 'function') {
      champ.addEventListener('input', () => filtrer(champ.value));
      champ.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          const premier = search(filtre)[0];
          if (premier) select(premier.id);
        } else if (event.key === 'Escape') {
          if (champ.value) { champ.value = ''; filtrer(''); event.stopPropagation(); }
        }
      });
    }

    if (typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', event => {
        const cible = event.target || {};
        const saisie = /^(INPUT|TEXTAREA|SELECT)$/.test(cible.tagName || '') || cible.isContentEditable;
        if (event.key === 'F1' || (event.key === '?' && !saisie && !event.ctrlKey && !event.metaKey)) {
          event.preventDefault();
          toggle();
        }
      });
    }
  }

  root.STI_HELP = Object.freeze({
    version: VERSION,
    sections,
    categories,
    find,
    search,
    pourVue,
    select,
    filtrer,
    open,
    close,
    toggle,
    go,
    print,
    bind,
    courante: () => courante
  });

  if (typeof document !== 'undefined') {
    const demarrer = () => bind();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
    else demarrer();
  }
})(typeof window !== 'undefined' ? window : globalThis);
