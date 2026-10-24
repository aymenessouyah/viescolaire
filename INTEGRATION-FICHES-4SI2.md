# Intégration « Répartition + Fiches pédagogiques 4SI2 » dans l'espace pédagogique

Document de raccordement : ce qui a été ajouté au site, **où** chaque chose s'applique,
et comment le refaire ou le modifier plus tard.
Version de l'application : `v1.5.8-ouvrir-formulaire` — site testé en local (`python3 -m http.server`)
et vérifié au navigateur (Chromium/Playwright) sur ordinateur, tablette et téléphone.

---

## 1. Fichiers à déposer dans le dépôt

### Fichiers nouveaux

| Chemin | Rôle | Taille |
|---|---|---|
| `data/repartition4SI2.js` | **La répartition 4SI2** : les 50 séances datées (n°, date, trimestre, titre, nature, domaines + pages, moyens, détail). | 20 Ko |
| `data/repartition3SI1.js` | **La répartition 3SI1** : 54 séances datées (mardi et jeudi), devoirs, domaines et pages du Smart Book 3e. | 22 Ko |
| `data/fiches3SI1.js` | **Les 54 fiches 3SI1** au modèle v3 (objectifs, méthode, prérequis, critères, déroulement, travail à la maison). | 208 Ko |
| `docs/fiches-3si-2026/` | 27 PDF (deux séances par fichier) + `Fiches_3SI1_2026-2027.pdf` (recueil 54 pages). | 1,8 Mo |
| `assets/fiche-formulaire.html` | **La page du formulaire** (fournie par l'enseignant) : sert de contenu à la grande boîte « Modifier la fiche et les coches ». | 8 Ko |
| `data/fiches.js` | **Les 50 fiches pédagogiques 4SI2** préremplies au modèle « Séance 8-9 v3 » : objectifs (3 colonnes), méthode active, prérequis, critères de réussite, 4 étapes du déroulement, travail à la maison. | 178 Ko |
| `assets/fiches.js` | Module d'intégration : onglet « Fiches pédagogiques », boîte de fiche éditable, menu d'impression, bloc « nouvelle répartition », report des préparations. | 34 Ko |
| `assets/fiches.css` | Mise en page du modèle v3 (page 11 × 8,5 in, couleurs, tableaux) + styles de la liste et du menu d'impression. | 7 Ko |
| `docs/fiches-4si-2026/` | Les **26 PDF** déjà générés : 25 fichiers `S1-2.pdf` … `S49-50.pdf` (une page par séance) + le recueil des 50 fiches. | 1,6 Mo |

### Fichiers modifiés

| Chemin | Modification |
|---|---|
| `index.html` | 3 lignes ajoutées : `<link rel="stylesheet" href="assets/fiches.css">` (après `agent-sti.css`), `<script src="data/repartition4SI2.js">` et `<script src="data/fiches.js">` (après `data/ajustements-sti.js`), `<script src="assets/fiches.js">` (après `assets/color-mode.js`). |
| `sw.js` | `VERSION` → `sti-espace-v1.5.8-ouvrir-formulaire` (force le renouvellement du cache hors ligne) ; `data/fiches.js`, `data/fiches3SI1.js`, `data/repartition4SI2.js` et `data/repartition3SI1.js` dans `CORE_ASSETS` ; les 54 PDF (4SI2 + 3SI1) dans `DOC_ASSETS` (mise en cache hors ligne). |

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

**Aucun sélecteur dans le bloc** : le contenu affiché suit la classe et le trimestre choisis dans
l'application (boutons de l'en-tête de l'onglet et entrées « Répartition — 1er/2e/3e trimestre » de
la barre latérale). Chaque trimestre apparaît donc **seul**, avec son titre, son nombre de séances et
ses heures ; les fonctions `setRep()` et `setTri()` de l'application sont interceptées pour
rafraîchir le bloc immédiatement. Exemple : 3SI1 → 21 / 17 / 16 séances ; 4SI2 → 22 / 15 / 13.

### ① bis La répartition **3SI1** — même bloc, sélecteur de classe

Le bloc « nouvelle répartition » de l'onglet *Répartition annuelle* porte désormais deux classes
(sélecteur **4SI2 / 3SI1** en haut à droite) :

| | 4SI2 | 3SI1 |
|---|---|---|
| Jours | lundi et vendredi 8 h-12 h | **mardi 8 h-12 h et jeudi 13 h-17 h** |
| Séances | 50 (100 h) | **54 (108 h)** |
| Période | 18/09/2026 → 14/05/2027 | **15/09/2026 → 20/05/2027** |
| Devoirs de contrôle | 02/11 · 16/11 · 25/01 · 12/02 · 12/04 · 26/04 | **03/11 · 17/11 · 19/01 · 16/02 · 13/04 · 04/05** |
| Devoirs de synthèse | 07/12 · 08/03 · 07/05 | **10/12 · 11/03 · 25/05** |
| Programme | HTML5, CSS3, JS, SQL, PHP (333 notions) | HTML5, CSS3, JavaScript, SQL / BD (269 notions, pas de PHP) |

Données : `data/repartition3SI1.js` (`STI_DATA.repartition3SI1`, 54 blocs numérotés).
Sources : `plan3.py` → `plan3.json` → `gen_js3.py`.
**Le devoir de contrôle n°1 de la 3SI1 a lieu le mardi 3 novembre 2026** (séance 12) ; la séance 13
du 5 novembre est sa correction, suivie des transitions et transformations CSS3.

### ① ter Les fiches **3SI1** — 54 fiches, même modèle

Le sélecteur de classe **4SI2 / 3SI1** existe aussi dans l'onglet *Fiches pédagogiques* :

| | 4SI2 | 3SI1 |
|---|---|---|
| Fiches | 50 (`data/fiches.js`, `STI_DATA.fiches4SI2`) | **54** (`data/fiches3SI1.js`, `STI_DATA.fiches3SI1`) |
| Classe affichée | 4ème SI | **3ème SI** |
| Modules | SQL · HTML5 · CSS · JavaScript · PHP | **HTML5 · CSS3 · JavaScript · SQL / BD** |
| PDF | `docs/fiches-4si-2026/` (25 fichiers) | **`docs/fiches-3si-2026/` (27 fichiers + recueil)** |
| Enregistrement des corrections | `sti_fiches_edits_v1` clé `4SI2|n` | **clé `3SI1|n`** (indépendante) |

Les lignes de la répartition 3SI1 sont désormais **cliquables** : un clic ouvre la fiche de la séance
(`STI_FICHES.openCls('3SI1', n)`, qui bascule d'abord la classe courante). Le compteur de l'onglet
suit la classe affichée (50 ou 54). La synchro vers le cahier de textes reste réservée à la 4SI2
(`synchro: true` dans `FICHES_CLS`) pour ne pas écraser les préparations 4SI2 existantes.

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
4. onglet *Répartition annuelle* en classe **3SI1** → clic sur une ligne ;
5. partout où l'application ouvrait déjà sa boîte de séance pour **4SI2** (`openModal('4SI2', n)` —
   par exemple « Modifier la fiche et les coches » ou « Séance du jour ») : c'est désormais la fiche v3
   qui s'affiche. Les séances **3SI1** ouvertes par `openModal('3SI1', n)` s'affichent elles aussi
   au modèle v3 depuis cette version.

### ③ bis « Modifier la fiche et les coches » → **grande boîte formulaire**

Sous « Actions » de l'onglet *Fiche pédagogique*, le bouton **Modifier la fiche et les coches**
ouvre désormais une **grande boîte** (98 % de l'écran, 94 % de la hauteur) contenant la page du
formulaire `assets/fiche-formulaire.html`, **remplie avec la fiche de la séance sélectionnée** :

| Zone du formulaire | Contenu injecté depuis la fiche |
|---|---|
| Établissement / Enseignant | `Lycée Rafèha` · `Aymen Essouyah` |
| Classe · Séance · Durée · Projet · Modules | 4ème SI ou 3ème SI · n° de séance · 120 min · projet et modules de la classe |
| 3 colonnes d'objectifs (4 champs chacune) | titres et objectifs de la fiche |
| Méthode active / Prérequis / Critères | méthode découpée en phrases, prérequis, critères de réussite |
| 4 étapes du déroulement | nom, durée, activités professeur, activités élèves |
| Moyens didactiques | moyens distincts des étapes |

Boutons de la boîte : **Imprimer le document**, **Rétablir la fiche** (recharge les valeurs de la
fiche), **Enregistrer la fiche**, **Fermer**.

**Impression = le document, jamais le formulaire.** « Imprimer le document » ne sort pas la page de
saisie mais la **fiche au format du modèle** (paysage 11 × 8,5 in, une page, mêmes couleurs et
encadrés que les PDF de `docs/`) ; les valeurs présentes à l'écran sont utilisées, **y compris celles
qui ne sont pas encore enregistrées**. Les boutons internes de la page `Fformulaire.html`
(« Imprimer la fiche » / « Rétablir ») sont masqués pour éviter la confusion.

Même règle pour le bouton **« Imprimer la fiche » de l'onglet *Fiche pédagogique*** : il imprimait
la page de l'application (barre latérale et bandeaux compris). Il est intercepté en phase de capture
et imprime désormais le document du modèle de la séance sélectionnée (classe et numéro lus dans la
liste des fiches, repli sur le tampon « SÉANCE n »). Vérifié : 1 page `.fpage`, 0 champ de saisie,
`@page{size:11in 8.5in}`, classe et séance correctes (3SI1, séance 12 = DC1). À l'enregistrement :
les champs reviennent dans la fiche (objectifs, prérequis, critères, étapes avec durées et moyens,
modules), la **préparation du cahier de textes est régénérée**, la boîte papier du modèle v3 et la
préparation du site affichent les nouvelles valeurs (aller-retour vérifié, 0 erreur JS).

La boîte papier du modèle v3 gagne un bouton **« Modifier dans le formulaire »**, et le bandeau de
l'onglet *Fiche pédagogique* un bouton **« Modifier (formulaire) »**.

Détail technique : le service worker renvoyant `index.html` pour toute navigation, le formulaire
n'est pas chargé par le `src` de l'iframe mais par `fetch()` puis injecté en `srcdoc` (même origine,
donc lecture et écriture des champs possibles). Le fichier est ajouté à `CORE_ASSETS` pour rester
disponible hors ligne.

### ③ ter Boutons du module dans le thème du site (correctif)

Le thème de l'interface de référence (`body.vs-themed .ref-ui .btn`) impose une hauteur de 42 px et
un fond transparent ; les classes `btn-blue` (bouton **Ouvrir**) et `btn-line` (Imprimer / PDF)
n'y étaient donc pas dessinées : bouton collé au texte, taille incohérente, texte clair sur fond blanc.
`assets/fiches.css` redéfinit maintenant explicitement, avec une spécificité suffisante :

- les trois actions de la liste (**Ouvrir** en dégradé vert, **Imprimer** et **PDF** en blanc bordé),
  toutes à 26 px de haut, alignées ;
- les boutons d'en-tête (*Impression*, *Ouvrir la fiche n°1*) et ceux du bloc de répartition
  (*Imprimer ce trimestre*, *Voir les fiches*) ;
- le commutateur de classe **4SI2 / 3SI1** (segment actif en vert).

Vérifié : hauteurs identiques (26 px), clic sur **Ouvrir** → fiche de la séance, 0 erreur JS.

### ③ quater Le bouton **Ouvrir** de la liste — il ouvre le formulaire

Dans *Outils STI & données → Fiches pédagogiques*, le bouton bleu **Ouvrir** ouvrait la fiche sous
forme de **document papier** (celui de l'impression) : on croyait voir un PDF ou une page d'impression
au lieu du formulaire à corriger.

Désormais :

| Bouton de la ligne | Ce qu'il ouvre |
|---|---|
| **Ouvrir** | le **formulaire** `assets/fiche-formulaire.html` dans la grande boîte, **prérempli** avec la fiche de la séance et **entièrement rectifiable** |
| **Imprimer** | le **document** au format du modèle v3 (paysage 11 × 8,5 in, une page) |
| **PDF** | le **fichier** `docs/fiches-<classe>/S<n>.pdf`, une page, identique au document imprimé |

Détails du correctif :

- les trois boutons qui disaient « Ouvrir » (ligne de la liste, « Ouvrir la fiche n°1 » de
  l'en-tête, encart « fiche ancrée ») appellent maintenant `STI_FICHES.form(n)` ;
- la fenêtre du document papier reste accessible mais s'annonce « **Aperçu du document** — séance n »
  pour ne pas être confondue avec le formulaire ;
- le formulaire est **étiré à la largeur de la boîte** (`.wrap` sans `max-width`) et chaque champ
  affiche son contenu complet au survol (`title`) avec ellipse visuelle : plus de texte coupé ;
- **« Rétablir la fiche d'origine »** supprime réellement la modification enregistrée (avant, il
  relisait la fiche déjà modifiée et semblait sans effet) ; confirmation demandée si la fiche a été
  modifiée, puis la préparation du cahier de textes est régénérée depuis la fiche d'origine.

Vérifié : *Ouvrir* sur 4SI2 séance 13 et 3SI1 séance 12 → boîte `flex`, titre « Fiche pédagogique —
séance 13/12 », 70 champs, `classe`/`seance`/`projet`/`modules`/premier objectif corrects, **aucun
onglet PDF ni page d'impression ouvert** ; enregistrement → valeur conservée et badge « modifiée » ;
« Rétablir » → retour au texte d'origine.

### ③ quinquies Le bouton **PDF** de la liste — correctif du service worker

Le bouton *PDF* de chaque ligne (et, plus généralement, **tous les liens `.pdf` du site** : annexes,
mémo, documents) ouvraient l'application à la place du fichier. Cause : le service worker renvoyait
`index.html` pour **toute navigation** dans son périmètre, PDF compris.

Corrections apportées :

1. **`sw.js`** — le repli sur `index.html` ne s'applique plus aux fichiers : tout chemin terminé par
   une extension (`.pdf`, `.png`, `.zip`, `.docx`, `.xlsx`…) est servi normalement, et la branche
   dédiée aux PDF lit d'abord `DOCS_CACHE` (mode hors ligne conservé) ;
2. **`sw.js`** — `skipWaiting()` est désormais systématique à l'installation : la nouvelle version
   prend la main immédiatement, sans attendre la fermeture de tous les onglets ;
3. **`assets/fiches.js`** — le bouton passe par `STI_FICHES.pdf(href)` : le fichier est récupéré par
   `fetch()`, vérifié (`content-type: application/pdf`), puis ouvert via une URL `blob:` (jamais
   interceptée par le service worker), avec repli sur le lien direct puis sur le téléchargement si la
   fenêtre est bloquée.

**Un fichier PDF par séance, et non plus par paire.** Le bouton ouvrait `S11-12.pdf`, qui contient
**deux** séances : le contenu ne correspondait donc pas à la fiche affichée ni au document du bouton
*Imprimer*. Les 52 fichiers de deux pages ont été découpés en **104 fichiers d'une page** — le contenu
est celui du modèle v3, à l'identique (aucune régénération : simple extraction de page, `garbage=4`,
`deflate`), et le poids total est inchangé (5,2 Mo) :

| Classe | Fichiers | Exemple |
|---|---|---|
| 4SI2 | `docs/fiches-4si-2026/S1.pdf` … `S50.pdf` (50) + recueil | séance 13 → `S13.pdf`, 1 page, « Séance 13 · Correction du DC1 et consolidation JavaScript » |
| 3SI1 | `docs/fiches-3si-2026/S1.pdf` … `S54.pdf` (54) + recueil | séance 12 → `S12.pdf`, 1 page, « Séance 12 · Devoir de contrôle n°1 » |

`DOC_ASSETS` du service worker est reconstruit sur ces 108 fichiers. Le bouton *PDF* ouvre donc
**exactement le document du bouton *Imprimer*** (même gabarit, même séance, une page), mais sous forme
de fichier PDF partageable.

Vérifié dans le navigateur : `fetch` du PDF → `200`, `application/pdf`, entête `%PDF-`, présent dans
`sti-espace-offline-documents-v1` (106/108) ; clics *PDF* sur 4SI2 S01, 4SI2 S13, 3SI1 S12, 3SI1 S54 →
ouverture d'un `blob:` d'**une page** dont le titre de séance correspond, 0 erreur JS ; comparaison
texte entre le document imprimé et `S13.pdf` : titres, objectifs, déroulement et travail à la maison
identiques (seules différences : casse des titres mise en majuscules par la feuille d'impression, et
une phrase répétée tronquée par le gabarit du PDF).

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

### ⑥ La préparation du cahier de textes vient des fichiers de fiches

La préparation ne se saisit plus à la main : elle **est prise dans les fichiers de fiches** —
`data/fiches.js` (4SI2, 50 fiches) et `data/fiches3SI1.js` (3SI1, 54 fiches) — les mêmes fichiers qui
alimentent les fiches imprimées et la boîte de fiche.

À chaque chargement du site, `STI_FICHES.fillPreparations()` associe chaque séance de
`SESSIONS[classe]` à sa fiche **par la date** (repli sur le numéro), puis écrit dans le cahier de
textes de l'application (`STI_FICHES.prepText(fiche, classe)`) :

| Champ de la séance | Ce qui est écrit | Source |
|---|---|---|
| **Préparation pédagogique de référence** | texte structuré et multiligne : `Séance n — titre`, date · durée · domaines · pages du Smart Book, **OBJECTIFS** (les 3 colonnes), **MÉTHODE ACTIVE**, **PRÉREQUIS**, **DÉROULEMENT** (chaque étape avec sa durée, activités professeur / élèves / moyens), **CRITÈRES DE RÉUSSITE**, **TRAVAIL À LA MAISON** | objectifs, méthode, prérequis, étapes, critères et maison de la fiche |
| **Titre de la séance** | le titre de la nouvelle répartition | fiche + `data/repartition4SI2.js` |
| **Travail à la maison** | le travail à la maison de la fiche | fiche |

Règles de non-écrasement (rien de votre travail n'est perdu) :

- une préparation **vide** est remplie et marquée `prepFromFiche` ;
- une préparation **remplie par la fiche** est remise à jour si les fichiers de fiches changent ;
- une préparation **modifiée par vous** (saisie dans le cahier de textes, ou fiche enregistrée depuis
  la boîte de fiche) n'est **jamais** écrasée : elle devient la référence ;
- un **titre** personnalisé est conservé ; seuls les titres restés au libellé d'origine (ou vides)
  passent aux titres de la nouvelle répartition.

Où cela se voit : onglet *Fiche pédagogique* → « 01 Préparation de référence » ; onglet *Suivi des
cours* ; *Cahier de textes* ; export CSV ; et la boîte de séance d'origine (bouton
« Cahier de textes (déroulement réel) » de la fiche v3, qui affiche la préparation préremplie, la
partie « déroulement réellement effectué » restant à remplir après le cours).

Vérifié sur le site de test : **3SI1 — 54 préparations sur 54** (toutes vides au départ) et
**54 titres** reportés, dont la séance 12 « Devoir de contrôle n°1 » du **mardi 3 novembre 2026** ;
**4SI2 — 50 préparations déjà remplies, 0 modifiée** (non-écrasement confirmé) ;
**0 erreur JavaScript**. Les dates des séances du site et celles des deux répartitions coïncident,
les fiches tombent donc bien sur les mêmes créneaux.

Le texte produit est multiligne et structuré, par exemple pour la 3SI1 séance 12 :

```
Séance 12 — Devoir de contrôle n°1
mardi 3 novembre 2026 · 2 h par groupe (120 min) · Évaluation

OBJECTIFS
— HTML5 : structure et formulaires : Évaluer les acquis des séances 1 à 11 en théorie et en pratique.
…
DÉROULEMENT — 120 min
1. Rappel — 5 min
     Professeur : …
     Élèves : …
     Moyens : Sujet · copies · machine
…
```

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
