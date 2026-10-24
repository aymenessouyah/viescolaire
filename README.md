# Espace pédagogique STI — Prof. Aymen Essouyah

**Lycée Rafèha Ariana (Tunisie) — matière STI — année scolaire 2026/2027 — classes 3SI1 et 4SI2**

Dépôt : <https://github.com/aymenessouyah/viescolaire> · Application en ligne : <https://aymenessouyah.github.io/viescolaire/>

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
| **Suivi des notions & annexes** | Cases de suivi dans les fiches de séance pour les **234 éléments** HTML5, CSS3, JavaScript, PHP et SQL ; bilan des éléments couverts, prévus ou restant à traiter, filtrable par classe. |
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
│   ├── app.js                  logique : emploi du temps, calendrier, répartition, programme,
│   │                           cahier de textes, sauvegarde distante, installation
│   ├── suivi-sti.js            suivi commun des notions des Smart Books
│   └── suivi-annexes.js        checklist des 234 éléments et bilan de couverture des annexes
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

## 3. Mise en ligne et mises à jour

GitHub Pages est déjà activé depuis la branche `main`, à la racine du dépôt. L’adresse publique est :
<https://aymenessouyah.github.io/viescolaire/>.

Les modifications d’une autre branche ne remplacent pas immédiatement le site public : elles deviennent
visibles après leur validation et leur fusion dans `main`, puis le déploiement Pages. Pour éviter de perdre
des données, ne remplacez pas tout le dépôt par glisser-déposer ; gardez l’arborescence et les fichiers déjà
présents.

À chaque mise à jour de l’interface, incrémenter `VERSION` dans `sw.js`. Les appareils installés reçoivent
alors le nouveau cache et affichent un bandeau **Mettre à jour** ; les données enregistrées dans le
navigateur sont conservées.

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

## 5. Utiliser la plateforme sur plusieurs appareils

La même application est accessible depuis **un ordinateur, un téléphone ou une tablette** à l’adresse
<https://aymenessouyah.github.io/viescolaire/>. Chaque appareil garde une copie locale pour le travail hors
ligne ; après connexion au même compte, le service Cloud partage les données entre eux. L’application est
installable comme une PWA (voir § 4), mais l’installation n’est pas obligatoire.

La synchronisation automatique est **bidirectionnelle** : elle fusionne les changements compatibles et
signale les modifications concurrentes au lieu d’écraser silencieusement les données. Elle reprend quand
l’application est ouverte, connectée à Internet et que l’utilisateur est connecté. Une application fermée
ne synchronise pas en arrière-plan.

### 5.1 Activer la base Cloud

Le dépôt contient déjà une configuration Supabase dans `supabase/config.js`. Si elle pointe vers votre
projet existant, **ne créez pas un deuxième projet** : vérifiez d’abord que la table, les règles de sécurité
et la fonction SQL de synchronisation y sont installées.

Pour une **nouvelle base** :

1. Créer un projet Supabase, puis ouvrir **SQL Editor → New query**.
2. Copier et exécuter tout `supabase/schema.sql`. Ce script crée la table, les règles RLS, les droits
   minimaux et la fonction atomique `sti_sync_snapshot` utilisée par l’application.
3. Dans **Authentication → Users**, créer le compte de chaque professeur (*Add user → Create new user*,
   mot de passe provisoire et **Auto Confirm User**). Fermer ensuite les inscriptions publiques si elles
   ne sont pas nécessaires.
4. Dans **Project Settings → API**, relever le *Project URL* et la clé publique (*anon / publishable*).
   Renseigner ces valeurs dans `supabase/config.js`, puis publier la mise à jour. **Ne jamais utiliser ni
   publier la clé `service_role`.**

Pour un **projet déjà créé**, ne relancez pas aveuglément `supabase/schema.sql` :

- si la table n’a pas encore `prof_id` et les règles d’isolation par professeur, exécuter d’abord
  `supabase/migration-multi-profs.sql` ;
- exécuter ensuite `installation/synchronisation-atomique.sql`. Cette étape est nécessaire pour les
  versions actuelles, même si la table et `supabase/migration-multi-profs.sql` sont déjà installées.

Le script d’installation atomique n’efface aucun instantané. Il ajoute la fonction serveur qui contrôle
qu’aucun autre appareil n’a publié entre la lecture et l’écriture. Les règles RLS doivent toujours isoler
les lignes avec `prof_id = auth.uid()`.

### 5.2 Configurer l’application

Dans `supabase/config.js`, la configuration commune aux appareils doit contenir l’URL du projet, la clé
publique et le nom de table :

```js
window.STI_SUPABASE = {
  url: "https://xxxxxxxx.supabase.co",
  anonKey: "clé publique anon / sb_publishable…",
  table: "espace_pedagogique",
  device: "",  // laisser vide : un nom local distinct est proposé sur chaque appareil
  auto: true,
  auth: true
};
```

La clé publique est prévue pour être visible ; ce sont les règles RLS et la connexion qui protègent les
données. Après publication, tous les appareils utilisent le même lien et le même projet. La configuration
Cloud locale permet de donner à chaque appareil un nom personnalisé (par exemple **Téléphone personnel**
ou **PC du lycée**) ; ce nom sert à reconnaître l’origine des instantanés.

### 5.3 Connecter un deuxième appareil

1. Ouvrir le même lien sur l’autre appareil :
   <https://aymenessouyah.github.io/viescolaire/>.
2. Cliquer sur **Compte & sauvegarde → Se connecter** et utiliser le même compte professeur. La session
   est conservée séparément dans chaque navigateur.
3. Lors de la première association, si l’appareil ne contient pas encore de données, l’application reprend
   l’espace du Cloud. Si des données locales existent, choisir **Fusionner mes données avec ce compte** ou
   **Ouvrir les données de ce compte** ; une copie locale est conservée avant l’opération.
4. Attendre l’état **À jour — données locales et Cloud concordantes**. Dans **Cloud → Configuration**,
   donner éventuellement un nom distinct à cet appareil.

| Situation | Comportement |
|---|---|
| Enregistrement d’une fiche, d’un horaire, d’une note ou d’une présence | Sauvegarde locale, puis synchronisation automatique si le réseau et la session sont disponibles |
| Coupure Internet | Travail local possible ; l’envoi et la réception reprennent au retour du réseau lorsque l’application est ouverte |
| Deux appareils changent des champs différents | Les changements sont fusionnés automatiquement |
| Deux appareils changent le même champ | L’application conserve les deux versions et demande un choix explicite |
| Changement de compte | Confirmation requise ; les données du compte précédent ne sont pas envoyées au nouveau compte |
| Erreur Cloud ou SQL | Les données locales restent conservées ; corriger la configuration ou le script SQL avant de réessayer |

Le bouton **Synchroniser** lance un échange bidirectionnel sécurisé : il fusionne les changements compatibles
et ne remplace pas les données locales sans contrôle. Les copies locales ne sont pas chiffrées par l’application :
sur un appareil partagé, protéger la session système et exporter régulièrement une sauvegarde JSON depuis
**Exporter** ou **Hors ligne & synchronisation**.

### 5.4 Sécurité et plusieurs professeurs

Chaque professeur se connecte avec son propre compte et ne voit que ses sauvegardes (`prof_id = auth.uid()`)
; les calendriers, répartitions et ressources pédagogiques restent communs. La table n’est pas accessible
aux utilisateurs anonymes. Ne mettez jamais un mot de passe de base de données ou une clé `service_role`
dans `supabase/config.js`.

Pour ajouter un collègue, l’administrateur du projet crée son compte dans **Supabase → Authentication →
Users → Add user** et lui transmet l’adresse du site, son identifiant et un mot de passe provisoire. À sa
première connexion, le collègue renseigne son profil dans l’application.

### 5.5 Dépannage de la synchronisation multi-appareils

| Message / symptôme | Vérification |
|---|---|
| **Fonction SQL manquante** | Exécuter `installation/synchronisation-atomique.sql` dans SQL Editor ; sur une nouvelle base, `supabase/schema.sql` la crée déjà |
| **Connexion ou droits Supabase insuffisants** | Vérifier le compte, les droits `authenticated` et les règles RLS (`prof_id = auth.uid()`) |
| **Sauvegarde locale seulement** | Vérifier l’URL, la clé publique, `auth: true`, l’état de connexion et le script SQL |
| Un appareil ne reçoit rien | Ouvrir l’application sur les deux appareils, se connecter au même compte, attendre **À jour** et vérifier qu’aucun conflit n’attend une décision |
| L’application installée reste ancienne | Recharger l’application ; si nécessaire, utiliser **Forcer la mise à jour** après avoir attendu la synchronisation |
| Un PDF ne s’ouvre pas hors ligne | Le document n’a pas encore été téléchargé ; l’ouvrir une fois en ligne ou utiliser le téléchargement hors ligne |

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
| L’application installée reste ancienne | Publier une nouvelle `VERSION` dans `sw.js`, puis recharger ; l’application affiche un bandeau pour valider la mise à jour |
| Un PDF ne s’ouvre pas hors ligne | Il n’a pas encore été mis en cache : l’ouvrir une fois en ligne ou télécharger les documents depuis **Hors ligne & synchronisation** |
| Synchronisation interrompue | Garder l’application ouverte, vérifier le réseau et l’état de connexion ; les modifications locales restent en attente |
| Le bouton d’installation n’apparaît pas | L’application est probablement déjà installée, ou le navigateur impose le menu (voir § 4) |
| Les données locales ne sont plus visibles | Vérifier le compte connecté et l’état du Cloud ; utiliser **Exporter les versions locales** avant toute réinitialisation du navigateur |

---

## 8. Agent STI — assistant pédagogique IA

La version **1.5.1** ajoute un véritable agent pédagogique dans le menu **Agent STI · IA** : fiches pédagogiques, séries d'exercices théoriques ou pratiques avec corrigés, correction de copies texte, photos ou fichiers de code, cahier de textes et propositions de répartition. Le barème peut être fourni par l'enseignant ou proposé puis validé avant correction.

L'interface appelle une fonction sécurisée `supabase/functions/assistant-ia`. La clé privée du fournisseur d'IA reste dans les secrets Supabase et n'est jamais publiée sur GitHub Pages. Chaque résultat est affiché pour vérification ; l'agent ne confirme pas une séance et n'enregistre pas une note automatiquement.

**Installation, choix du modèle, déploiement et vérifications : consultez [`AGENT_IA.md`](AGENT_IA.md).**

---

## 9. Vérifications techniques (facultatif)

Les tests sans dépendance vérifient les règles essentielles de fusion entre appareils (y compris les
cases d’annexes cochées séparément), la couverture des 234 éléments et le statut des séances :

```bash
node --test tests/*.test.js
```

Vérification rapide de la syntaxe JavaScript :

```bash
for f in assets/*.js data/*.js supabase/config.js sw.js; do node --check "$f"; done
```

---

*Calendrier scolaire 2026-2027 : les dates de l'Aïd el-Fitr, de l'Aïd el-Idha et du Ras El Am El Hijri
sont fixées par observation lunaire (« تضبط في الإبان ») ; elles sont signalées « à confirmer » dans
l'application et devront être ajustées dans `data/reference.js` dès leur annonce officielle.*
