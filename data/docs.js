/* Documents de référence et de travail.
   1) Aide pédagogique et répartitions officielles (PDF)
   2) Annexes de cours élaborées par A. Essouyah (PDF)
   3) Fiches de séances 2026-2027 (Word) — dossier documents/ du dépôt GitHub
   Fichier de données — modifiable sans toucher au code de l'application.
   Sauvegarde distante / versionnement : voir README.md */
(function (root) {
'use strict';

const G_AIDE  = "Aide pédagogique et répartitions officielles";
const G_ANNEX = "Annexes de cours élaborées par A. Essouyah";
const G_FICHE = "Fiches de séances 2026-2027";

const DOCS = [
  /* ---------- 1. aide pédagogique et répartitions ---------- */
  { g:G_AIDE, t:"Aide pédagogique STI 3<sup>e</sup> et 4<sup>e</sup> années SI (avec annexes)", f:"docs/Aide-pedagogique-STI-3-4-2024.pdf", s:"Ministère de l'Éducation — septembre 2024 &bull; 18 pages", d:"Programme officiel : compétences, savoirs associés, pistes pédagogiques et annexes HTML5 / CSS3 / JS / PHP / SQL." },
  { g:G_AIDE, t:"Répartition trimestrielle (1) prévisionnelle — 3<sup>ème</sup> année SI (STI)", f:"docs/Repartition-T1-3SI.pdf", s:"1<sup>er</sup> trimestre &bull; 23 séances", d:"Déroulement séance par séance : rappels HTML+CSS, projet « Fleurs du Lycée », JavaScript, DC1, DC2, DS1." },
  { g:G_AIDE, t:"Répartition trimestrielle (1) prévisionnelle — 4<sup>ème</sup> année SI (STI)", f:"docs/Repartition-T1-4SI.pdf", s:"1<sup>er</sup> trimestre &bull; 22 séances", d:"Rappels HTML/CSS/JS, Bac pratique, rappel BD (LDD+LMD), création d'un site web dynamique PHP, DC1, DC2, DS1." },
  { g:G_AIDE, t:"Répartition trimestrielle (2) — 3<sup>ème</sup> année SI (STI)", f:"documents/repartition/3si/Répartition 2eme Tri 3 Sti.pdf", s:"2<sup>e</sup> trimestre &bull; document du dépôt", d:"Répartition officielle du 2<sup>e</sup> trimestre (dossier documents/repartition/3si du dépôt GitHub)." },
  { g:G_AIDE, t:"Répartition trimestrielle (3) — 3<sup>ème</sup> année SI (STI)", f:"documents/repartition/3si/Répartition 3eme Tri 4 Sti.pdf", s:"3<sup>e</sup> trimestre &bull; document du dépôt", d:"Répartition officielle du 3<sup>e</sup> trimestre. Remarque : le fichier du dépôt porte le nom « … 4 Sti » alors qu'il est rangé dans le dossier 3si — à renommer si nécessaire." },
  { g:G_AIDE, t:"Répartition trimestrielle (2) — 4<sup>ème</sup> année SI (STI)", f:"documents/repartition/4si/Répartition 2eme Tri 4 Sti.pdf", s:"2<sup>e</sup> trimestre &bull; document du dépôt", d:"Répartition officielle du 2<sup>e</sup> trimestre (dossier documents/repartition/4si du dépôt GitHub)." },
  { g:G_AIDE, t:"Répartition trimestrielle (3) — 4<sup>ème</sup> année SI (STI)", f:"documents/repartition/4si/Répartition 3eme Tri 4 Sti.pdf", s:"3<sup>e</sup> trimestre &bull; document du dépôt", d:"Répartition officielle du 3<sup>e</sup> trimestre (dossier documents/repartition/4si du dépôt GitHub)." },

  /* ---------- 2. annexes de cours ---------- */
  { g:G_ANNEX, t:"Annexe HTML5 — élaborée par A. Essouyah", f:"docs/Annexe-HTML5.pdf", s:"6 pages &bull; annexe de cours", d:"Balises HTML5, attributs détaillés (link, script, ol, img) et exemples issus du projet « Le fleuriste du Rafèha »." },
  { g:G_ANNEX, t:"Annexe CSS3 — élaborée par A. Essouyah", f:"docs/Annexe-CSS3.pdf", s:"9 pages &bull; annexe de cours", d:"Sélecteurs (dont attributs ^= *= $=), boîtes, bordures, transformations, filtres, transitions et animations, avec exemples." },
  { g:G_ANNEX, t:"Annexe JavaScript — élaborée par A. Essouyah", f:"docs/Annexe-JavaScript.pdf", s:"4 pages &bull; annexe de cours", d:"Opérateurs, entrées/sorties, tableaux comparatifs (prompt/alert/confirm, write/innerHTML/textContent), objets Date, String, Array, Math." },
  { g:G_ANNEX, t:"Annexe PHP — élaborée par A. Essouyah", f:"docs/Annexe-PHP.pdf", s:"10 pages &bull; annexe de cours", d:"Variables, chaînes, tableaux (parcours et tri), accès MySQL, fonctions date/heure (checkdate, date, getdate, time, mktime, strtotime)." },
  { g:G_ANNEX, t:"Annexe SQL — élaborée par A. Essouyah", f:"docs/Annexe-SQL.pdf", s:"7 pages &bull; annexe de cours", d:"LDD détaillé (CREATE / ALTER), LMD avec agrégats, fonctions de chaînes (CONCAT, LENGTH, SUBSTRING, LEFT, RIGHT) et fonctions de dates." },

  /* ---------- 3. fiches de séances (dossier documents/Fiches 2026-2027) ---------- */
  { g:G_FICHE, t:"Fiche des séances 5-6 — 3SI1", f:"documents/Fiches 2026-2027/3sti/S5-6.docx", s:"3SI1 &bull; Word (.docx)", d:"Préparation détaillée des séances 5 et 6 : objectifs, déroulement, activités et exercices." },
  { g:G_FICHE, t:"Fiche des séances 7-8 — 3SI1", f:"documents/Fiches 2026-2027/3sti/S7-8.docx", s:"3SI1 &bull; Word (.docx)", d:"Préparation détaillée des séances 7 et 8." },
  { g:G_FICHE, t:"Fiche des séances 9-10 — 3SI1", f:"documents/Fiches 2026-2027/3sti/S9-10.docx", s:"3SI1 &bull; Word (.docx)", d:"Préparation détaillée des séances 9 et 10 (évaluations rattachées : DC1)." },
  { g:G_FICHE, t:"Fiche des séances 11-12 — 3SI1", f:"documents/Fiches 2026-2027/3sti/S11-12.docx", s:"3SI1 &bull; Word (.docx)", d:"Préparation détaillée des séances 11 et 12." },
  { g:G_FICHE, t:"Fiche des séances 13-14 — 3SI1", f:"documents/Fiches 2026-2027/3sti/S13-14.docx", s:"3SI1 &bull; Word (.docx)", d:"Préparation détaillée des séances 13 et 14 (évaluations rattachées : DC2)." },
  { g:G_FICHE, t:"Fiche des séances 15-16 — 3SI1", f:"documents/Fiches 2026-2027/3sti/S15-16.docx", s:"3SI1 &bull; Word (.docx)", d:"Préparation détaillée des séances 15 et 16." },
  { g:G_FICHE, t:"Fiche des séances 5-6 — 4SI2", f:"documents/Fiches 2026-2027/4sti/S5-6.docx", s:"4SI2 &bull; Word (.docx)", d:"Préparation détaillée des séances 5 et 6." },
  { g:G_FICHE, t:"Fiche de la séance 7 — 4SI2", f:"documents/Fiches 2026-2027/4sti/S7.docx", s:"4SI2 &bull; Word (.docx)", d:"Préparation détaillée de la séance 7." },
  { g:G_FICHE, t:"Fiche des séances 8-9 — 4SI2", f:"documents/Fiches 2026-2027/4sti/S8-9.docx", s:"4SI2 &bull; Word (.docx)", d:"Préparation détaillée des séances 8 et 9." },
  { g:G_FICHE, t:"Fiche des séances 10-11 — 4SI2", f:"documents/Fiches 2026-2027/4sti/S10-11.docx", s:"4SI2 &bull; Word (.docx)", d:"Préparation détaillée des séances 10 et 11 (évaluations rattachées : DC1)." },
  { g:G_FICHE, t:"Fiche des séances 12-13 — 4SI2", f:"documents/Fiches 2026-2027/4sti/S12-13.docx", s:"4SI2 &bull; Word (.docx)", d:"Préparation détaillée des séances 12 et 13 (évaluations rattachées : DC2)." },
  { g:G_FICHE, t:"Fiche de la séance 14 — 4SI2", f:"documents/Fiches 2026-2027/4sti/S14.docx", s:"4SI2 &bull; Word (.docx)", d:"Préparation détaillée de la séance 14." },
  { g:G_FICHE, t:"Fiche des séances 15-16 — 4SI2", f:"documents/Fiches 2026-2027/4sti/S15-16.docx", s:"4SI2 &bull; Word (.docx)", d:"Préparation détaillée des séances 15 et 16 (évaluations rattachées : DS1)." }
];

root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.docs = DOCS;
})(typeof window !== 'undefined' ? window : globalThis);
