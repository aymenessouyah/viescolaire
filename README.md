# Espace pédagogique STI — Prof. Aymen Essouyah

**Lycée Rafèha Ariana (Tunisie) — matière STI — année scolaire 2026/2027 — classes 3SI1 et 4SI2**

Dépôt : <https://github.com/aymenessouyah/viescolaire> · Site à activer : <https://aymenessouyah.github.io/viescolaire/>

Application web installable (PWA) qui rassemble l'emploi du temps, le calendrier scolaire tunisien,
la répartition du 1<sup>er</sup> trimestre, les compétences issues de l'aide pédagogique, les annexes
de cours, le cahier de textes, la bibliothèque de documents (répartitions des trois trimestres,
fiches de séances, annexes) et une sauvegarde des données.

---

## 1. Ce que contient le site

| Onglet | Contenu |
|---|---|
| **Tableau de bord** | Indicateurs de l'année, prochaine séance, alertes (vacances, jours fériés), carte de sauvegarde distante |
| **Emploi du temps** | 3SI1 : mardi 8 h–12 h et jeudi 13 h–17 h ; 4SI2 : lundi 8 h–12 h et vendredi 8 h–12 h — **2 groupes de 2 h par jour de cours** (8 h/semaine/classe, 16 h pour l'enseignant). Les horaires sont modifiables et enregistrés. |
| **Calendrier tunisien** | Année 2026-2027 : rentrée des élèves mardi 15 septembre 2026, fin d'année mercredi 30 juin 2027, vacances officielles, jours fériés, périodes de devoirs de contrôle et de synthèse, conseils de classe |
| **Répartition 1<sup>er</sup> trimestre** | Progression en blocs conforme aux documents officiels (3SI1 : 23 séances ; 4SI2 : 22 séances), avec dates réelles, évaluations et corrections du DS1 |
| **Programme & compétences** | Chaque compétence de l'**aide pédagogique STI** renvoie à ses savoirs associés, aux **éléments des annexes** à mobiliser, aux **séances datées** du 1<sup>er</sup> trimestre, à une activité de classe et aux acquis attendus. Liens directs vers l'aide pédagogique et les annexes. |
| **Cahier de textes** | Relevé chronologique séance par séance (contenu, observations, état d'avancement) pour les deux classes |
| **Annexes & mémo** | **Mémo consolidé** (6 familles C1→C6 : contenu des annexes réorganisé selon les compétences), **annexes intégrales** (HTML5, CSS3, JavaScript, PHP, SQL) et les 8 documents PDF, avec recherche instantanée |

Deux accès directs exigés par le cahier des charges sont présents dans l'onglet « Programme & compétences »
et dans « Annexes & mémo » : **lien vers l'aide pédagogique** et **liens vers les annexes**.

---

## 2. Structure des fichiers

```
sti-espace/
├── index.html                  page unique (structure seule, aucun style ni script inline)
├── manifest.webmanifest        identité de l'application installable
├── sw.js                       service worker (fonctionnement hors ligne, PDF en cache)
├── assets/
│   ├── style.css               feuille de style (aucune ressource externe)
│   └── app.js                  logique : emploi du temps, calendrier, répartition, programme,
│                               cahier de textes, annexes, sauvegarde distante, installation
├── data/                       données séparées : à modifier sans toucher au code
│   ├── reference.js            établissement, classes, horaires par défaut, calendrier tunisien
│   ├── repartition.js          répartition du 1er trimestre (3SI1 et 4SI2)
│   ├── programme.js            compétences et savoirs associés (aide pédagogique)
│   ├── competences.js          pont compétences ↔ annexes ↔ séances
│   ├── memo.js                 mémo consolidé (annexes adaptées à l'aide pédagogique)
│   ├── annexes.js              annexes intégrales HTML5 / CSS3 / JS / PHP / SQL
│   └── docs.js                 liste des documents PDF
├── docs/                       8 PDF du site : aide pédagogique, 2 répartitions T1, 5 annexes
├── documents/                  bibliothèque de travail (également liée depuis l'application)
│   ├── repartition/3si et 4si/ répartitions des 1er, 2e et 3e trimestres
│   ├── annexes/                les 5 annexes de cours (mêmes documents que dans docs/)
│   └── Fiches 2026-2027/       13 fiches de séances (.docx) : 3sti/ et 4sti/
├── uploads/                    dossier d'origine des fichiers déposés sur GitHub (conservé)
├── legacy/                     ancienne version autonome en un seul fichier (secours)
├── icons/                      icônes 192 / 512 / maskable / apple-touch
└── supabase/
    ├── schema.sql              table et règles de sécurité (à exécuter une fois)
    └── config.js               configuration Supabase facultative (vide par défaut)
```

Les données sont chargées par `data/*.js` **avant** `assets/app.js` : pour corriger une date, un bloc de
répartition ou une ligne du mémo, il suffit de modifier le fichier de données correspondant.

---

## 3. Mise en ligne sur GitHub Pages

Le dépôt **<https://github.com/aymenessouyah/viescolaire>** existe déjà (branche `main`). Il ne reste
qu'à y déposer cette version multi-fichiers, puis à activer Pages.

### Méthode rapide (git installé)

```bash
cd sti-espace
./publier.sh                      # identifiant et dépôt déjà pré-remplis (vim, viescolaire)
```

Le script met le dépôt à jour, envoie les fichiers et rappelle l'adresse du site.

### Méthode sans ligne de commande (glisser-déposer)

1. Ouvrir <https://github.com/aymenessouyah/viescolaire>.
2. *Add file* → *Upload files* → glisser **le contenu** du dossier `sti-espace`
   (`index.html`, `sw.js`, `manifest.webmanifest`, `README.md`, `publier.sh`, et les dossiers
   `assets`, `data`, `docs`, `icons`, `supabase` en **conservant l'arborescence**).
   Les dossiers `documents`, `uploads` et `legacy` existent déjà dans le dépôt : ne pas les supprimer.
3. *Commit changes* — `index.html` et `README.md` seront remplacés (c'est voulu), le reste s'ajoute.

### Activer le site (indispensable, une seule fois)

1. Dépôt → *Settings* → **Pages** (menu de gauche).
2. *Source* : `Deploy from a branch` — *Branch* : `main` — dossier `/(root)` → **Save**.
3. Après une à deux minutes, le site est en ligne :

   ```
   https://aymenessouyah.github.io/viescolaire/
   ```

> Sur un compte GitHub gratuit, Pages n'est disponible que si le dépôt est **public** : celui-ci l'est.

### Mises à jour suivantes

```bash
git add . && git commit -m "Mise à jour du cahier de textes" && git push
```

Pensez à incrémenter `VERSION` dans `sw.js` (par exemple `sti-espace-v1.0.1`) pour que les appareils
déjà installés reçoivent la nouvelle version ; l'application affiche alors un bandeau « Mettre à jour ».

## 4. Installer l'application sur mobile et depuis la barre d'adresse (PWA)

Le site est une *Progressive Web App* : une fois ouvert dans le navigateur, il s'installe comme une
application, s'ouvre en plein écran depuis son icône et fonctionne hors ligne.

* **Android (Chrome)** : menu ⋮ → « Installer l'application » ou « Ajouter à l'écran d'accueil ».
* **iPhone / iPad (Safari)** : bouton *Partager* → « Sur l'écran d'accueil ».
* **Ordinateur (Chrome / Edge)** : icône d'installation dans la barre d'adresse, à droite de l'URL.

Le bouton **« Installer l'application »** de l'en-tête propose la même chose et rappelle la procédure
si le navigateur ne déclenche pas l'invite automatiquement.

> Le service worker ne s'active qu'en `https://` (GitHub Pages) ou sur `http://localhost`.
> Une ouverture directe du fichier `index.html` (`file://`) fonctionne, mais sans mode hors ligne.

---

## 5. Sauvegarde distante (Supabase) — mode cloud protégé

La sauvegarde distante est le **mode de travail principal** : les fiches de séance et les horaires sont
enregistrés dans la base **Supabase** (PostgreSQL + API REST) et l'application les retrouve sur le
téléphone, la tablette et le poste du lycée. Le navigateur ne sert plus que de cache de travail hors ligne.
La base est **protégée par un compte unique** : seule votre adresse électronique peut lire et écrire.
Un **export / import JSON** reste disponible à tout moment (bouton *Exporter* de l'en-tête) comme copie
de secours, utilisable sans connexion.

### Comportement en mode cloud

| Situation | Ce que fait l'application |
|---|---|
| Enregistrement d'une fiche, d'un horaire, d'un état d'avancement | **envoi automatique** vers la base (rien à cliquer) |
| Ouverture sur un **nouvel appareil** (téléphone, poste du lycée) | demande la connexion, puis **reprend la dernière sauvegarde du cloud** avant toute saisie locale |
| Connexion | une fois par appareil ; la session reste ouverte et le jeton se renouvelle tout seul |
| Coupure réseau | travail normal en local ; **reprise automatique** de l'envoi dès le retour de la connexion |
| Plusieurs appareils | chacun envoie un instantané horodaté ; « Restaurer » propose le plus récent |
| Aucun projet configuré | bandeau sur le tableau de bord pour activer la sauvegarde distante |
| Envoi en échec (URL, clé, table ou mot de passe) | message détaillé + badge « Configuration à vérifier », données conservées localement |

### 5.1 Créer la base et le compte (une seule fois, ~8 minutes)

1. **Créer le projet** : <https://supabase.com> → *Start your project* (connexion avec votre compte GitHub
   possible) → **New project** : **nom au choix** (le nom n'a aucune incidence sur l'application —
   par exemple `suivi-scolaire`), un mot de passe de base de données (à conserver), région **Europe (Frankfurt)**.
2. **Créer la table** : dans le projet, **SQL Editor** → *New query* → copier tout le contenu de
   `supabase/schema.sql` (fichier fourni dans ce dépôt), le coller, puis cliquer **Run**.
   Aucune modification du texte n'est nécessaire.
3. **Créer votre compte** : **Authentication** → **Users** → *Add user* → *Create new user* —
   votre adresse + un mot de passe, et cocher **Auto Confirm User**.
4. **Fermer les inscriptions — ne pas oublier cette étape** : **Authentication** → *Sign In / Providers*
   → désactiver **Allow new users to sign up**. C'est ce réglage qui garantit que votre compte est le
   seul autorisé : sans lui, n'importe qui pourrait créer un compte sur le projet.
5. **Relever les deux valeurs** : **Project Settings** → **API** →
   * **Project URL** — par exemple `https://abcdefghijkl.supabase.co`
   * **anon / publishable key** (la clé *publique* uniquement).

### 5.2 Configurer l'application

**Le plus simple — dans le fichier `supabase/config.js`** (configuration commune à tous les appareils) :

```js
window.STI_SUPABASE = {
  url:   "https://abcdefghijkl.supabase.co",
  anonKey: "eyJhbGciOi... ou sb_publishable_...",
  table: "espace_pedagogique",
  device: "Poste principal — Prof. Aymen",
  auto:  true,     // envoi automatique à chaque enregistrement
  auth:  true      // accès protégé par mot de passe (compte unique)
};
```

Puis publier sur GitHub : tous les appareils se connectent à la même base sans rien saisir,
hors la connexion (une fois par appareil).

**Variante — dans l'application** (si vous ne souhaitez pas écrire les valeurs dans le dépôt) :
bouton **Cloud** de l'en-tête → coller l'URL et la clé → **Enregistrer et tester**.
La configuration reste alors dans le navigateur de cet appareil.

### 5.3 Utilisation au quotidien

| Bouton | Effet |
|---|---|
| **Se connecter** | adresse + mot de passe ; la session reste ouverte sur l'appareil |
| **Se déconnecter** | ferme la session ; les données locales restent sur l'appareil |
| **Envoyer maintenant** | ajoute un instantané complet (horaires + fiches de séance) dans la table |
| **Restaurer** | propose la dernière sauvegarde distante et remplace les données de l'appareil après confirmation |
| **Configuration** | URL du projet, clé publique, table, nom de l'appareil, envoi automatique, accès protégé |
| *(automatique)* | envoi à chaque enregistrement, reprise après coupure réseau, restauration proposée sur un nouvel appareil |

### 5.4 Sécurité

* La base n'accepte que les **comptes connectés** (règles RLS `to authenticated`) et les inscriptions
  sont fermées : seul le compte créé à l'étape 3 peut lire ou écrire. Une personne qui connaîtrait l'URL
  du projet et la clé publique ne verrait aucune donnée.
* Pour un verrou encore plus strict, la section 5 de `schema.sql` (à décommenter) limite l'accès à
  **votre seule adresse électronique**.
* N'utilisez **jamais** la clé `service_role` dans l'application : elle contourne les règles d'accès.
* Le dépôt GitHub peut rester public : la protection ne dépend pas du secret de l'adresse du site,
  mais du mot de passe du compte Supabase.

## 6. Mettre à jour le contenu

| Quoi | Où |
|---|---|
| Horaires, classes, vacances, jours fériés, dates d'examens | `data/reference.js` |
| Progression d'un trimestre, blocs et évaluations | `data/repartition.js` |
| Compétences et savoirs associés | `data/programme.js` |
| Lien compétence → annexes → séances | `data/competences.js` |
| Lignes du mémo consolidé | `data/memo.js` |
| Contenu des annexes intégrales | `data/annexes.js` |
| Liste des documents (PDF + fiches Word) | `data/docs.js` — champ `g` = groupe affiché dans l'onglet « Annexes & mémo » |
| Remplacer un PDF du site | déposer le nouveau fichier dans `docs/` en conservant le même nom |
| Ajouter une fiche de séance ou une répartition | déposer le fichier dans `documents/` (même arborescence) puis l'ajouter à `data/docs.js` |
| Nouvelle version de l'application | incrémenter `VERSION` dans `sw.js` |

Après modification : `git add . && git commit -m "…" && git push`.

---

## 7. Dépannage

| Symptôme | Cause / solution |
|---|---|
| L'application se met à jour mais pas les appareils installés | Incrémenter `VERSION` dans `sw.js` puis pousser ; ou vider le cache du navigateur |
| Un PDF ne s'ouvre pas hors ligne | Il n'a pas encore été mis en cache : l'ouvrir une fois en ligne |
| « Échec de l'envoi » vers Supabase | Vérifier l'URL du projet, la clé publique, le nom de la table et que `schema.sql` a bien été exécuté |
| « Échec de la restauration » | Même vérification ; le message détaillé indique le code HTTP retourné |
| Le bouton d'installation n'apparaît pas | L'application est probablement déjà installée, ou le navigateur impose le menu (voir § 4) |
| Les données ont disparu du navigateur | Restaurer depuis Supabase (*Restaurer*) ou depuis un export JSON |

---

## 8. Vérifications techniques (facultatif)

Les tests automatisés valident l'assemblage réel du site (117 assertions : onglets, horaires, calendrier,
répartition, compétences, annexes, recherche, sauvegarde distante simulée, PWA) :

```bash
npm install jsdom
node check_data.js     # structure des fichiers de données
node check_site.js     # chargement complet du site dans un navigateur simulé
```

---

*Calendrier scolaire 2026-2027 : les dates de l'Aïd el-Fitr, de l'Aïd el-Idha et du Ras El Am El Hijri
sont fixées par observation lunaire (« تضبط في الإبان ») ; elles sont signalées « à confirmer » dans
l'application et devront être ajustées dans `data/reference.js` dès leur annonce officielle.*
