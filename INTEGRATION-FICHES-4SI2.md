# Intégration « Répartition + Fiches pédagogiques 4SI2 » dans l'espace pédagogique

Document de raccordement : ce qui a été ajouté au site, **où** chaque chose s'applique,
et comment le refaire ou le modifier plus tard.
Version de l'application : `v1.5.2-fiches4si2` — site testé en local (`python3 -m http.server`)
et vérifié au navigateur (Chromium/Playwright) sur ordinateur, tablette et téléphone.

---

## 1. Fichiers à déposer dans le dépôt

### Fichiers nouveaux

| Chemin | Rôle | Taille |
|---|---|---|
| `data/repartition4SI2.js` | **La nouvelle répartition** : les 50 séances datées (n°, date, trimestre, titre, nature, domaines + pages, moyens, détail). | 20 Ko |
| `data/fiches.js` | **Les 50 fiches pédagogiques** préremplies au modèle « Séance 8-9 v3 » : objectifs (3 colonnes), méthode active, prérequis, critères de réussite, 4 étapes du déroulement, travail à la maison. | 178 Ko |
| `assets/fiches.js` | Module d'intégration : onglet « Fiches pédagogiques », boîte de fiche éditable, menu d'impression, bloc « nouvelle répartition ». | 31 Ko |
| `assets/fiches.css` | Mise en page du modèle v3 (page 11 × 8,5 in, couleurs, tableaux) + styles de la liste et du menu d'impression. | 7 Ko |
| `docs/fiches-4si-2026/` | Les **26 PDF** déjà générés : 25 fichiers `S1-2.pdf` … `S49-50.pdf` (une page par séance) + le recueil des 50 fiches. | 1,6 Mo |

### Fichiers modifiés

| Chemin | Modification |
|---|---|
| `index.html` | 3 lignes ajoutées : `<link rel="stylesheet" href="assets/fiches.css">` (après `agent-sti.css`), `<script src="data/repartition4SI2.js">` et `<script src="data/fiches.js">` (après `data/ajustements-sti.js`), `<script src="assets/fiches.js">` (après `assets/color-mode.js`). |
| `sw.js` | `VERSION` → `sti-espace-v1.5.2-fiches4si2` (force le renouvellement du cache hors ligne) ; les 4 nouveaux fichiers ajoutés à `CORE_ASSETS` ; les 26 PDF ajoutés à `DOC_ASSETS` (mise en cache hors ligne). |

> Rien d'autre n'est touché : `assets/app.js`, `assets/interface-reference.js` et les autres
> fichiers de données restent identiques. L'intégration se fait par greffe (voir §2), ce qui
> évite de casser les mises à jour futures de l'application.

---

## 2. « Appliquer où ça ? » — les 5 points d'ancrage

### ① La nouvelle répartition → onglet **Répartition annuelle** (`#v-rep`)

Un bloc est inséré **en tête** de l'onglet existant, avant la répartition du 1er trimestre :

- titre « Nouvelle répartition 4SI2 — 2026/2027 », badge « 50 séances · 100 h » ;
- sélecteur *Toute l'année / 1er / 2e / 3e trimestre* ;
- tableau : n°, date + jour, contenu détaillé, domaines + pages du Smart Book, type ;
- les lignes d'évaluation (DC, DS, corrections) sont surlignées en crème ;
- **un clic sur une ligne ouvre la fiche pédagogique** de la séance ;
- bouton *Imprimer* (répartition du trimestre affiché) et *Voir les fiches*.

Ancrage technique : `STI_FICHES.renderRepBlock()` est appelée par le `renderAll` greffé et
insère `<div id="rep-4si2">` en `afterbegin` de `#v-rep`.

### ② La liste des fiches → nouvel onglet **Fiches pédagogiques** (badge 50)

Onglet ajouté à la barre de navigation (`#tab-fiches`, après « Annexes & mémo ») :

- 5 indicateurs : 50 fiches · 100 h · 9 évaluations · fiches modifiées · fiches affichées ;
- recherche plein texte, filtre par trimestre et par nature (cours, DC, DS, correction, sujet de bac) ;
- tableau : n°, date + jour, titre + axes, domaines, nature, et 3 actions
  **Ouvrir** (boîte de fiche) · **Imprimer** (cette séance) · **PDF** (le fichier du modèle).

Ancrage technique : la barre d'onglets est reconstruite par l'application à chaque rendu ;
le module la surveille (`MutationObserver`) et réinsère son onglet. Le bouton appelle
`go('v-fiches')`, la vue est déjà gérée par la fonction `go` de l'application.

### ③ La boîte de fiche pédagogique au concept du modèle v3

La boîte (`#fiche-modal`) reprend **exactement** la géométrie du modèle Word/PDF :

en-tête « Fiche pédagogique » + Lycée Rafèha / Enseignant → filet orange → bandeau crème
(CLASSE · DURÉE 120 min · MODULES · SÉANCE) → frise Rappel / Mise en situation / Constatations /
Évaluation avec les durées du profil de séance → OBJECTIFS en 3 colonnes → bandeau
MÉTHODE ACTIVE · PRÉREQUIS · CRITÈRES DE RÉUSSITE → DÉROULEMENT (Étapes · Professeur · Élèves ·
Moyens didactiques) → Travail à la maison → pied de page.

**Préremplissage automatique** : tout vient de `data/fiches.js`, lui-même généré à partir de
`plan.py` (dates et contenus) et de `fiches_a/b/c.py` (objectifs, méthode, déroulement, maison).
Aucune saisie n'est nécessaire pour obtenir une fiche complète.

**Rectification par l'utilisateur** : les **35 zones de texte** de la fiche sont éditables
(`contenteditable`) — titre, modules, 3 intitulés d'objectifs + leurs items, méthode, prérequis,
critères, les 4 étapes (nom, durée, activités professeur, activités élèves, moyens) et le travail
à la maison. Un clic dans le texte suffit ; le champ en cours de modification est encadré en orange.

- **Enregistrer la fiche** → conservée dans `localStorage` (clé `sti_fiches_edits_v1`), reprise à
  l'ouverture et **à l'impression** ; le titre et le travail à la maison sont aussi recopiés dans
  le cahier de textes de l'application (préparation / devoirs de la séance).
- **Réinitialiser** → revient au contenu prévu par la répartition.
- **Cahier de textes (déroulement réel)** → ouvre la fiche existante de l'application pour y noter
  ce qui a été réellement fait (les deux documents restent distincts : préparation / réalité).
- La page est automatiquement mise à l'échelle de la fenêtre (ordinateur, tablette, téléphone).

**Où la boîte s'ouvre-t-elle ?**
1. onglet *Fiches pédagogiques* → bouton **Ouvrir** d'une ligne ;
2. onglet *Répartition annuelle* → clic sur n'importe quelle ligne de la nouvelle répartition ;
3. onglet *Fiche pédagogique* → bandeau orange « Fiche pédagogique au modèle officiel (4e année SI) »
   placé en tête, avec un sélecteur des 50 séances ;
4. partout où l'application ouvrait déjà sa boîte de séance pour **4SI2** (`openModal('4SI2', n)` —
   par exemple « Modifier la fiche et les coches » ou « Séance du jour ») : c'est désormais la fiche v3
   qui s'affiche. Les séances **3SI1** gardent la boîte d'origine.

### ④ Le menu d'impression — 4 entrées

Bouton **Impression** dans la barre d'actions de l'en-tête (à côté de *Cloud*, *Imprimer*, *Exporter*)
et boutons *Impression* dans l'onglet des fiches et dans le bandeau de l'onglet *Fiche pédagogique*.

| Entrée | Ce qui sort | Format |
|---|---|---|
| **Une séance** | la fiche de la séance choisie dans la liste déroulante (50 choix) | 1 page paysage |
| **Toutes les séances** | les 50 fiches, une page par séance | 50 pages paysage |
| **Répartition trimestrielle** | liste datée du trimestre choisi (T1 : 22 séances, T2 : 15, T3 : 13) | 1 page portrait |
| **Répartition annuelle** | les 50 séances de l'année | 1–2 pages portrait |

L'impression passe par un cadre isolé (`iframe` + `srcdoc`) qui recharge `assets/fiches.css`,
afin de ne pas être perturbée par les styles de l'application ; `@page{size:11in 8.5in;margin:0}`
garantit une page par séance. Les corrections enregistrées sont bien sûr utilisées.
Contrôle effectué : 50 pages de 1056 × 816 px, aucun débordement.

### ⑤ Sauvegarde, hors ligne et Cloud

- Les corrections de fiches vivent dans `localStorage` (`sti_fiches_edits_v1`) : elles restent
  sur l'appareil et ne sont pas effacées par « Forcer la mise à jour ».
- `sw.js` met en cache les 4 nouveaux fichiers et les 26 PDF : les fiches et leurs PDF restent
  consultables hors ligne (compteur « documents » de l'écran *Hors ligne & synchronisation*).
- Les corrections structurées (les 35 champs) restent **locales à l'appareil**. Ce qui circule déjà
  par *Exporter* et par le *Cloud*, c'est le titre de la séance, la préparation reconstituée
  (objectifs + prérequis + déroulement) et le travail à la maison, recopiés dans le cahier de textes
  de l'application. Pour transporter les corrections fines d'un appareil à l'autre, il suffit
  d'ouvrir la même fiche et de la réenregistrer sur le second appareil, ou de passer par le bouton
  *Imprimer* / les PDF, qui reflètent toujours la dernière version enregistrée.

---

## 3. Vérifications réalisées

| Contrôle | Résultat |
|---|---|
| Chargement de la page, erreurs JavaScript | aucune |
| Onglet des fiches | présent, 50 lignes, filtres et recherche opérationnels |
| Bloc de répartition | 50 lignes, 3 filtres de trimestre, clic → fiche |
| Boîte de fiche | 35 zones éditables, mise à l'échelle automatique |
| Enregistrement / réouverture / réinitialisation | modification conservée puis correctement restaurée |
| Impression | 1 page (une séance), 50 pages (toutes), répartition T1 = 22 lignes |
| Affichage | ordinateur 1500 px, tablette 820 px, téléphone 390 px |

---

## 4. Régénérer ou modifier plus tard

Les données se régénèrent depuis `/home/user/repartition` (jamais à la main) :

```bash
cd /home/user/repartition
python3 plan.py && python3 gen_js.py && node check.js   # dates et répartition
python3 gen_fiches_v3.py                                 # fiches + échelles typographiques
python3 gen_pdf.py                                       # PDF (25 fichiers + recueil)
python3 gen_site_data.py                                 # data/fiches.js pour le site
```

Puis recopier : `fiches-4si2.js → data/fiches.js`, `plan_4SI2.js → data/repartition4SI2.js`,
`Fiches PDF/*.pdf → docs/fiches-4si-2026/`.

Pour une correction ponctuelle, **aucune régénération n'est nécessaire** : ouvrez la fiche dans le
site, corrigez le champ, *Enregistrer*. Pour changer un contenu valable pour tout le monde, modifiez
`fiches_a.py` / `fiches_b.py` / `fiches_c.py` (source unique) puis relancez la chaîne ci-dessus.
