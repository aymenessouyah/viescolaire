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
    ├── schema.sql              schéma initial et règles de sécurité
    ├── migrations/              migrations versionnées; appliquer après confirmation
    │   └── 20261026_agent_prompt_library.sql
    ├── functions/                fonctions Edge sécurisées (Gemini, prompts et administration)
    ├── migration-professeur-badge.sql  profils, bucket privé et politiques photo
    └── config.js               configuration Supabase et Client ID OAuth Google Drive public
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
2. Copier et exécuter tout `supabase/schema.sql`. Ce script crée la table de sauvegarde, les règles RLS,
   les droits minimaux et la fonction atomique `sti_sync_snapshot` utilisée par l’application.
3. Exécuter aussi `supabase/migration-professeur-badge.sql` pour créer la table des profils, le bucket privé
   des portraits et leurs règles RLS.
4. Créer le compte administrateur dans **Authentication → Users** (*Add user → Create new user*, mot de
   passe provisoire et **Auto Confirm User**). C’est le seul compte initial créé directement dans Supabase.
5. Configurer le secret Edge `ADMIN_EMAILS` avec l’adresse de l’administrateur, puis déployer la fonction
   depuis un projet Supabase lié : `supabase functions deploy admin-users`.
6. Dans **Project Settings → API**, relever le *Project URL* et la clé publique (*anon / publishable*).
   Renseigner ces valeurs dans `supabase/config.js`, puis publier la mise à jour. **Ne jamais utiliser ni
   publier la clé `service_role`.** Garder les inscriptions publiques désactivées : les comptes professeurs
   doivent passer par **Gérer les professeurs** pour que le portrait obligatoire soit enregistré.

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
  auth: true,
  googleDriveClientId: "" // à remplir après configuration OAuth Google (Client ID public, sans secret)
};
```

La clé publique est prévue pour être visible ; ce sont les règles RLS et la connexion qui protègent les
données. Après publication, tous les appareils utilisent le même lien et le même projet. La configuration
Cloud locale permet de donner à chaque appareil un nom personnalisé (par exemple **Téléphone personnel**
ou **PC du lycée**) ; ce nom sert à reconnaître l’origine des instantanés.

Pour activer **« Mot de passe oublié ? »**, ouvrez **Authentication → URL Configuration → Redirect URLs** dans Supabase et autorisez exactement :

```text
https://aymenessouyah.github.io/viescolaire/
```

Le lien de récupération revient à cette page d’accueil ; l’application y ouvre le formulaire de nouveau mot de passe. Elle reconnaît les jetons Supabase dans le fragment ou la query string, valide aussi un `token_hash` si nécessaire et affiche une boîte explicative lorsqu’un lien est incomplet ou expiré. Si le site est publié sous une autre URL, il faut modifier `PASSWORD_RECOVERY_REDIRECT_URL` dans `assets/app.js` et autoriser cette même URL dans Supabase.

Chaque professeur trace sa signature au doigt ou à la souris dans **Mon profil**. Le dessin est conservé dans son profil privé et apparaît à la fin de chaque journée dans le cahier affiché, imprimé ou exporté en PDF. Les anciennes signatures textuelles ne sont pas converties automatiquement : chaque professeur doit redessiner sa signature une première fois.

### 5.3 Badges et photos des professeurs

Pour une base déjà existante, exécuter `supabase/migration-professeur-badge.sql` dans **SQL Editor**, puis
redéployer la fonction Edge `admin-users` (`supabase functions deploy admin-users`). Cette migration crée
`profils_professeurs` et le bucket privé `professeur-photos`, avec des règles qui limitent chaque photo au
compte propriétaire.

Dans **Gérer les professeurs**, l’administrateur saisit le nom, la fonction, la discipline et la photo avant
la création du compte. La photo est compressée dans le navigateur puis envoyée en JPEG au bucket privé; elle
n’est pas copiée en Base64 dans les sauvegardes pédagogiques. Un professeur déjà inscrit sans portrait est
invité à le choisir à sa prochaine connexion, puis peut le remplacer dans **Mon profil**. Le compte
administrateur initial créé dans Supabase reçoit lui aussi cette demande à sa première connexion.

Après connexion, un mini-badge personnel reste affiché dans la barre supérieure à droite; sur mobile, il apparaît sous
**« + Nouvelle séance »**. Il est légèrement incliné et ouvre **Mon profil** au toucher/clic. Le badge complet
reprend le modèle fourni : portrait circulaire, identité, fonction, identifiant STI, courriel et établissement.
Il s’imprime au format portrait **54 × 86 mm**. Aucun groupe sanguin ni autre donnée médicale n’est demandé.

### 5.4 Connecter un deuxième appareil

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

### 5.5 Sécurité et plusieurs professeurs

Chaque professeur se connecte avec son propre compte et ne voit que ses sauvegardes (`prof_id = auth.uid()`)
; les calendriers, répartitions et ressources pédagogiques restent communs. La table n’est pas accessible
aux utilisateurs anonymes. Ne mettez jamais un mot de passe de base de données ou une clé `service_role`
dans `supabase/config.js`.

Pour ajouter un collègue, l’administrateur connecté utilise **Compte & sauvegarde → Gérer les professeurs**,
remplit son nom, sa discipline et sa fonction, puis ajoute son portrait avant la création du compte. Il lui
transmet ensuite l’adresse du site, son adresse électronique et un mot de passe provisoire. La fonction Edge
`admin-users` doit avoir été redéployée après la migration des badges. Un professeur déjà inscrit complète
ou remplace sa photo depuis **Mon profil**.

### 5.6 Sauvegarde hebdomadaire dans le Google Drive de chaque professeur

Après configuration Google et connexion au compte professeur, l’application demande explicitement à chaque
professeur s’il souhaite activer cette sauvegarde. En cas d’accord, une première copie JSON datée est créée
immédiatement, puis l’application vérifie le Drive et crée une nouvelle copie si la dernière remonte à au
moins **7 jours**. Les fichiers sont déposés dans le dossier privé **Espace pédagogique STI - Sauvegardes**;
aucune ancienne copie n’est supprimée. Une sauvegarde manuelle peut aussi créer une version supplémentaire.

La cadence recommandée est donc **une copie tous les 7 jours**, calculée depuis la dernière copie réellement
présente dans le Drive. Le transfert s’effectue quand la PWA est ouverte, le compte professeur est lié et
Internet est disponible. Une PWA fermée ne peut pas lancer une tâche hebdomadaire en arrière-plan : si
l’application reste fermée au moment prévu, la copie partira à sa prochaine ouverture en ligne. Une garantie
même application fermée demanderait un service planifié côté serveur et une architecture OAuth serveur.

Chaque sauvegarde ne contient que les données métier du professeur connecté et son année scolaire — jamais
son mot de passe, jeton Supabase ni jeton Google. L’accès OAuth demandé est limité aux fichiers créés par
l’application (`drive.file`). Les fichiers ne sont pas chiffrés par l’application : ils bénéficient des
paramètres d’accès du compte Google choisi. L’accord et l’activation sont mémorisés dans ce navigateur ;
un autre appareil demandera donc aussi son propre accord. Désactiver sur un appareil n’arrête pas une
activation faite sur un autre. Un professeur peut gérer cette sauvegarde depuis la carte **Sauvegarde
hebdomadaire Google Drive** ; pour retirer l’autorisation Google elle-même, utiliser
<https://myaccount.google.com/permissions>.

**Configuration OAuth à faire avant de demander l’accord aux professeurs :**

1. Dans Google Cloud Console, choisir un projet et activer **Google Drive API**.
2. Configurer Google Auth Platform. Choisir l’audience **Externe** si les professeurs utilisent des comptes Google de domaines différents; le mode **Interne** convient uniquement à une organisation Google Workspace unique. En mode **Test**, seuls les comptes ajoutés aux testeurs peuvent se connecter. Pour ouvrir l’accès aux professeurs, compléter la marque et publier l’application en production.
3. Page d’accueil : `https://aymenessouyah.github.io/viescolaire/`. Politique de confidentialité publique : `https://aymenessouyah.github.io/viescolaire/politique-confidentialite.html`. Le domaine autorisé et l’origine JavaScript sont `aymenessouyah.github.io` et `https://aymenessouyah.github.io` respectivement. Si Google exige une validation de domaine, suivre la procédure Search Console; un domaine personnalisé peut être nécessaire.
4. Créer un identifiant OAuth de type **Application Web**, activer uniquement le scope Drive nécessaire (`drive.file`) et ajouter l’origine JavaScript autorisée `https://aymenessouyah.github.io` (et `http://localhost:8000` uniquement pour les tests locaux). Le flux utilisé par le site n’exige pas d’URI de redirection.
5. Copier le **Client ID** — pas de secret client — dans `googleDriveClientId` du fichier `supabase/config.js`, publier le changement, puis vérifier la connexion avec un compte professeur qui n’est pas inscrit aux testeurs.

Le Client ID est public et peut être inclus dans le site ; aucun secret OAuth ne doit être ajouté au dépôt. La page de confidentialité publiée doit rester cohérente avec le fournisseur d’IA et les services réellement configurés.
Tant que `googleDriveClientId` est vide, les sauvegardes Drive restent inactives et l’interface indique que
la configuration Google est requise. Le connecteur Google Drive de l’assistant ne peut pas remplacer cette
autorisation : chaque professeur doit choisir et autoriser son propre compte dans l’application.

### 5.7 Dépannage de la synchronisation multi-appareils

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

## 8. Agent Vie Scolaire AI — assistant pédagogique

Le menu **Agent Vie Scolaire AI** ouvre un grand espace de travail. Il propose des fiches pédagogiques, des séries d’exercices théoriques ou pratiques avec corrigés, la correction de copies texte, photos ou fichiers de code, le cahier de textes, des propositions de répartition et un outil de révision de documents libres. Le barème peut être fourni par l’enseignant ou proposé puis validé avant correction. Pour une copie théorique photographiée, l’agent propose d’abord une transcription éditable; les incertitudes sont signalées et doivent être confirmées explicitement avant de poursuivre malgré l’avertissement.

L’outil de document libre accepte du texte collé ou des fichiers TXT, Markdown et HTML; il n’extrait pas le texte des fichiers PDF ou Word. La source et la révision s’affichent côte à côte. Seule une confirmation explicite enregistre la nouvelle version dans l’historique local; les versions précédentes peuvent être restaurées. L’agent n’écrit jamais dans le fichier externe : le professeur exporte lui-même le résultat s’il souhaite remplacer ce fichier.

Chaque document affiche le nom du lycée, le nom complet de l’enseignant connecté et la classe. Ces éléments d’en-tête sont ajoutés dans le navigateur et ne sont pas transmis à Gemini. Une fiche et une entrée du cahier déjà enregistrées peuvent être remplacées après confirmation; une série d’exercices de l’historique local peut aussi être remplacée après relecture et confirmation. L’historique est local à l’appareil et isolé par compte professeur; les anciennes entrées sans identité de compte restent stockées mais sont masquées.

L’interface appelle la fonction sécurisée `supabase/functions/assistant-ia`, qui utilise l’API Google Gemini. La clé privée reste dans les secrets Supabase et n’est jamais publiée sur GitHub Pages. Chaque résultat est affiché pour vérification ; l’agent ne confirme pas une séance et n’enregistre pas une note automatiquement. [Voir le schéma visuel du parcours](assets/agent-vie-scolaire-flux.svg).

L’administrateur peut aussi demander à Claude trois brouillons de **prompts génériques**. L’API Claude est payante et appelée côté serveur : elle ne reçoit jamais de demande pédagogique réelle, sujet, copie, image, document ou donnée d’élève. Aucun brouillon n’est partagé avant la validation explicite de l’administrateur; les prompts publiés sont communs et peuvent être ajoutés aux requêtes Gemini. La migration `supabase/migrations/20261026_agent_prompt_library.sql` est préparée, mais ne doit pas être exécutée sur le projet distant sans confirmation explicite. Les secrets `ANTHROPIC_API_KEY` et `ANTHROPIC_MODEL` se configurent uniquement dans Supabase, jamais dans le site ou le dépôt.

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
