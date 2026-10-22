# Vie scolaire — hors ligne et synchronisation dans les deux sens

**Version préparée : `v1.4.5-cahier-confirmation`**  
**Dépôt existant :** https://github.com/aymenessouyah/viescolaire  
**État : code préparé et testé localement, non publié.** Aucune écriture n’a été faite dans votre dépôt ou votre base réelle. Le script SQL reste à appliquer dans votre environnement.

## Correction 1.4.5 — dernières séances non confirmées dans le Cahier

Le **Cahier de textes** s’ouvre maintenant sur les séances de date **antérieure à aujourd’hui**, **ni assurées ni reportées**, de la plus récente à la plus ancienne. Les deux classes et tous les trimestres sont inclus par défaut ; les séances d’aujourd’hui ou à venir n’apparaissent pas dans cette liste de dates passées.

Les filtres permettent de choisir la classe, le trimestre et l’état : **À confirmer**, **Toutes les séances**, **Assurées** ou **Reportées**. Les choix agissent uniquement sur l’affichage : aucune fiche n’est supprimée. Après avoir coché puis enregistré « assurée » ou « reportée », la séance quitte la liste à confirmer mais reste dans l’historique. En décochant les deux choix et en enregistrant, elle revient dans la liste si sa date est passée.

Le bouton **Vérifier la fiche** ouvre le formulaire conservé. Un contenu de référence est identifié comme « Préparation prévue », jamais comme du contenu réellement enseigné. Les compteurs indiquent les séances affichées et les fiches du périmètre classe/trimestre sélectionné.

Cette correction concerne le **Cahier de textes**. L’ordre du **Suivi des cours** (prochaines séances en premier) reste inchangé, tout comme les règles de la cloche précédemment ajoutées.

## Ajout 1.4.4 — Compte & sauvegarde repliable sur mobile

Sur téléphone (largeur de 700 px ou moins), toute la section **Compte & sauvegarde** est désormais **repliée par défaut**. Une barre compacte reste visible, avec un résumé d’état (hors ligne, à jour, en attente, conflit…). Un appui déploie les boutons Connexion, Cloud, envoyer, recevoir, export, impression et détails de synchronisation ; un deuxième appui replie le bloc. L’en-tête récupère environ **206 px** dans le test à 390 px de large.

La cloche et le bouton clair/sombre restent directement accessibles. Sur ordinateur, les commandes du compte restent affichées comme avant. Le volet conserve son état pendant la navigation, puis redémarre replié au rechargement sur téléphone. Le clavier est pris en charge (Entrée pour basculer, Échap pour replier lorsque le focus est dans le volet). Aucun enregistrement de données ni appel Cloud n’est déclenché par cette ouverture/fermeture.

Les écrans courts peuvent faire défiler le contenu du volet. Le bandeau d’installation ne recouvre plus les boutons d’une fenêtre de connexion ou de saisie ouverte.

## Correction 1.4.3 — bouton clair / sombre

Le bouton soleil/lune en haut **change maintenant le mode d’affichage**, sans ouvrir le Cloud. Le choix clair ou sombre est mémorisé sur cet appareil, restauré au rechargement et disponible hors ligne. La préférence reste locale : aucun changement dans les fiches, notes ou paramètres Cloud.

Le mode sombre couvre les écrans, formulaires, menus et notifications. Les impressions restent claires et les documents PDF/images ne sont pas inversés. Le mode clair conserve la présentation crème existante. La configuration et la connexion restent accessibles par les boutons **Cloud** et **Connexion** de la barre permanente.

## Ajout 1.4.2 — cloche des séances non confirmées

La cloche porte un compteur et s’anime par petites oscillations lorsqu’une séance a une **date antérieure à aujourd’hui** et que sa case **« assurée » n’est pas cochée** (`done !== true`). Les séances d’aujourd’hui et futures ne déclenchent pas cette alerte. Les séances marquées reportées mais non confirmées restent dans la liste avec une indication distincte.

Un clic affiche les séances à vérifier, de la plus récente à la plus ancienne. **Vérifier la fiche** ouvre le formulaire existant ; seule une confirmation cochée puis enregistrée retire la séance des rappels. Aucune date passée n’est automatiquement déclarée assurée. Lorsque toutes les séances passées sont confirmées, le compteur et l’animation disparaissent.

Le rappel se met à jour après enregistrement ou réception Cloud, au retour dans l’application et après changement de jour (contrôle local toutes les 30 secondes si la page est visible). Il fonctionne sans Internet. Les échéances futures restent présentes dans le menu. Il s’agit d’une **animation visuelle**, sans vibration physique du téléphone, son, notification système ou message aux élèves.

L’animation s’arrête pendant la lecture du menu. Un bouton permet aussi de la mettre en pause pour la session ouverte, sans masquer le compteur ; la préférence système de réduction des animations est respectée.

## Correction 1.4.1 — ordre du Suivi des cours

Le tableau commence désormais par les séances d’aujourd’hui et à venir, de la plus proche à la plus lointaine. Les séances passées viennent ensuite, de la plus récente à la plus ancienne. Cet ordre est conservé dans les filtres, la recherche, la pagination et l’export CSV. Aucune fiche ni date du planning n’est modifiée.

## 1. Ce que cette version ajoute

- Utilisation de l’interface sans Internet après un premier chargement complet en ligne.
- Enregistrement local des changements et état de synchronisation conservés dans le navigateur, avec une copie IndexedDB en complément du stockage existant.
- Envoi **et réception** automatiques à la reconnexion, au retour dans l’application et lors d’une vérification périodique d’environ 30 secondes, lorsque l’application est ouverte et visible.
- Fusion des changements compatibles, par champ et par identifiant d’entité.
- **Conflits : conservation des deux versions et choix explicite.** Une suppression concurrente à une modification est aussi un conflit. Aucune règle « dernier appareil arrivé = gagnant ».
- États visibles : hors ligne, modifications en attente, synchronisation en cours, à jour, conflit, connexion ou installation SQL à vérifier.
- Bouton permanent **Hors ligne & synchronisation**, avec état du cache, nombre de PDF disponibles, synchronisation manuelle et export des versions locales.
- Mise à jour de l’application téléchargée en arrière-plan, puis appliquée **sur validation**, sans rechargement automatique au milieu d’une fiche.

**Conditions :** navigateur compatible, premier chargement en HTTPS, stockage du site conservé, compte connecté pour le Cloud, configuration automatique activée, et installation de la fonction SQL fournie. Une application fermée ne synchronise pas en tâche de fond. Sans Internet, une première connexion à un compte n’est pas possible, mais les données déjà présentes restent utilisables.

## 2. Utilisation quotidienne

1. Ouvrir le site avec Internet, se connecter et attendre **À jour**.
2. Dans **Hors ligne & synchronisation**, vérifier **Interface hors ligne : prête**. Les PDF ont leur propre compteur : un document non encore téléchargé n’est pas garanti hors ligne.
3. Sans Internet, modifier puis **enregistrer** les fiches, notes ou présences normalement. Le bandeau signale le fonctionnement local.
4. Au retour du réseau, laisser l’application ouverte. Les changements partent vers le Cloud et les nouveautés des autres appareils sont reçues. Fermer les fenêtres de saisie pour autoriser leur application à l’écran.
5. Si un conflit apparaît, lire les deux valeurs, choisir celle à retenir pour chaque champ, puis valider. Les copies des deux versions restent archivées localement et exportables.

Les boutons **Envoyer au Cloud** et **Recevoir du Cloud** sont conservés. Ils déclenchent désormais le même échange sécurisé dans les deux sens : « Recevoir » ne remplace plus brutalement l’ensemble du navigateur.

### Première synchronisation et changement de compte

Si des données locales existent déjà, l’application demande comment les associer au compte : **fusionner mes données avec ce compte** ou **ouvrir les données de ce compte**. Une copie locale est conservée avant l’opération. Un désaccord avec une sauvegarde distante inconnue peut demander des choix supplémentaires : c’est une précaution, pas une perte de données.

Pour un autre compte, aucun envoi automatique des données du compte précédent n’est effectué. L’ouverture de l’autre espace doit être confirmée. Les copies locales en attente de chaque compte sont reprises lorsqu’on revient dans cet espace. Éviter d’utiliser simultanément des comptes différents dans plusieurs onglets du même navigateur : un changement d’espace bloque l’ancien onglet et demande son rechargement.

## 3. Installer sur le projet existant

### A — Sauvegarder

- Exporter le JSON depuis **chaque appareil contenant des changements non synchronisés**.
- Conserver une sauvegarde de la base et du code actuel ; travailler d’abord sur une branche ou un environnement de test.
- Ne communiquer aucun mot de passe, jeton ou clé `service_role`.

### B — Installer la fonction SQL, une seule fois

Ouvrir **votre projet Supabase existant**, puis SQL Editor. Examiner et exécuter :

```text
installation/synchronisation-atomique.sql
```

Ce fichier est dans l’archive. Il ajoute/remplace uniquement la fonction `public.sti_sync_snapshot` et règle ses droits d’exécution. Il **ne crée pas une nouvelle base, ne supprime aucune ligne et ne remplace pas les politiques RLS**.

Prérequis attendus, conformes au schéma public du dépôt :

- table `public.espace_pedagogique` ;
- colonnes `id bigint`, `created_at`, `prof`, `lycee`, `annee`, `device`, `prof_id uuid` et `payload jsonb` ;
- comptes authentifiés autorisés à lire et insérer leurs propres lignes, et uniquement les leurs ;
- `prof_id = auth.uid()` pour l’isolation des comptes ; droits de table et de séquence existants valides.

La fonction reste **SECURITY INVOKER** : elle n’élève pas les droits et respecte les politiques existantes. Elle verrouille l’échange par compte/année et vérifie l’identifiant du dernier instantané avant d’en créer un autre. Si un autre appareil a écrit entre-temps, elle répond « réessayer », sans écrasement.

**Ne réexécutez pas aveuglément les anciens scripts de création ou de migration du dépôt.** Si votre base réelle diffère de ces prérequis, il faut d’abord examiner ses colonnes et politiques. Les anciennes lignes sans propriétaire ne sont pas attribuées automatiquement à un compte.

Si la fonction n’existe pas ou n’est pas accessible, l’application garde les changements localement et signale le problème. Elle ne revient pas à l’ancien envoi direct non sécurisé contre les conflits.

### C — Fusionner l’archive dans le dépôt

Décompresser **`Vie-scolaire-hors-ligne-synchronisation.zip`** et fusionner son contenu à la racine du dépôt existant, sans créer un dossier supplémentaire.

**Ne supprimez pas les dossiers existants.** C’est une mise à jour, pas un projet autonome. Conserver notamment les fichiers d’origine de `data/`, `assets/eleves.js`, `assets/admin.js`, les icônes, les documents, les outils OCR, `manifest.webmanifest` et **votre `supabase/config.js`**. Ce dernier n’est pas inclus dans l’archive et n’est pas remplacé.

Les nouveaux fichiers spécifiques à cette version sont :

```text
assets/color-mode.js                   bascule clair/sombre et préférence locale
assets/color-mode.css                  palette sombre, impression claire conservée
assets/offline-sync.js                 synchronisation, file locale, conflits et comptes
assets/offline-sync.css                fenêtres de statut et de résolution
assets/sync-merge.js                   moteur de fusion trois voies
installation/synchronisation-atomique.sql   fonction serveur sur la table existante
```

`assets/app.js`, `index.html` et `sw.js` sont aussi modifiés. L’archive inclut l’ensemble de l’interface fusionnée, le suivi STI, les référentiels et les huit PDF ajoutés précédemment. Elle contient un manifeste SHA-256 et un diff des fichiers d’origine modifiés.

Référence du code d’origine utilisé pour construire le paquet : commit `890e66c183d1bfcca9e926b09102cc3a23a1056c`. **Si le dépôt a changé depuis, comparer les modifications avant de remplacer des fichiers.** Les ajouts ultérieurs au code ne sont pas automatiquement fusionnés par cette archive.

### D — Mettre tous les appareils à jour

1. Publier après validation sur la branche de test.
2. Dans la configuration Cloud, garder la table `espace_pedagogique`, l’URL et la clé publique du projet existant, activer **Accès protégé par mot de passe** et **Synchroniser automatiquement dans les deux sens**.
3. Mettre à jour les onglets et les applications installées sur **tous les appareils qui écrivent sur ce compte**, avant de reprendre un travail simultané.
4. Vérifier la version `v1.4.5-cahier-confirmation`, puis la connexion et la première association.

**Important : les anciens clients font des insertions directes et ne participent pas au verrou de synchronisation.** La protection contre les écritures concurrentes exige que tous les clients écrivains utilisent cette nouvelle version. Ne continuez pas à modifier les fiches dans un ancien onglet.

Pour les versions futures, une nouvelle interface complète est préparée en cache avant activation. Si un fichier obligatoire manque, l’ancienne version reste disponible hors ligne. La validation de la mise à jour est refusée tant qu’une saisie ou un échange est en cours.

### E — Valider dans votre environnement réel

Sur deux appareils de test ou avec des données réversibles et sauvegardées :

- modifier une fiche en ligne sur A et vérifier sa réception sur B ;
- couper Internet sur A, modifier et enregistrer, recharger hors ligne ;
- modifier un champ différent sur B, reconnecter A et vérifier que les deux changements sont conservés ;
- modifier le même champ sur les deux appareils et vérifier la demande de choix ;
- vérifier le fonctionnement des notes, présences, export et profil ;
- contrôler les journaux et droits de votre projet si une erreur serveur apparaît.

La connexion réelle, les permissions de votre projet et l’hébergement GitHub Pages restent **à valider au déploiement**. Les tests locaux ne remplacent pas cette étape.

## 4. Limites et précautions

- IndexedDB et le stockage local ne remplacent pas une sauvegarde indépendante. Une suppression des données du navigateur, un mode privé ou une éviction par le système peuvent les effacer. Exporter régulièrement le JSON et les versions locales.
- Les copies locales ne sont pas chiffrées par l’application. Sur un appareil partagé, protéger la session système et les fichiers exportés, notamment ceux contenant des notes ou des présences.
- Le cache concerne l’interface et les ressources statiques, **pas les appels Cloud ou les jetons d’authentification**. Les jetons restent gérés par le mécanisme de connexion existant ; ils ne sont pas copiés dans les archives de conflit.
- Les PDF ne bloquent pas la préparation de l’interface. Leur absence est signalée par le compteur. Le bouton de retéléchargement permet de rafraîchir les documents disponibles. Les outils OCR restent des ressources chargées à la demande ; leur fonctionnement hors ligne nécessite leur téléchargement préalable.
- En cas de manque de stockage, exporter les données et traiter l’alerte avant de poursuivre ; ne pas vider le site tant que des changements sont en attente.
- L’indication **À jour** correspond au dernier échange confirmé, pas à une garantie qu’aucun autre appareil ne modifiera ensuite le Cloud.
- La synchronisation utilise des instantanés avec fusion, pas une coédition caractère par caractère. Une fenêtre de saisie ouverte retarde la réception pour protéger le brouillon.

## 5. Ce qui reste conservé de l’interface et du suivi STI

- **Connexion / compte, Cloud, envoyer, recevoir, imprimer et exporter** dans la barre permanente sur ordinateur, et dans le volet **Compte & sauvegarde** dépliable sur téléphone ; profil, administration, installation selon navigateur et déconnexion restent accessibles.
- **Emploi du temps** et **Répartition — 1er / 2e / 3e trimestre** directement visibles dans le menu.
- Les cinq écrans du modèle : tableau de bord, suivi des cours, fiche papier, avancement et calendrier des devoirs, reliés aux données réelles ; les outils STI existants restent accessibles.
- **3SI1 en bleu, 4SI2 en vert**. Identifiants et clés historiques `classe|numéro` conservés.
- Deux groupes de 2 h par classe et par jour, avec **suivi partagé** : 3SI1 mardi 08–12 et jeudi 13–17 ; 4SI2 lundi/vendredi 08–12. Cela représente 4 h par groupe et 8 h enseignant par semaine pour chaque classe.
- Référentiels séparés : **269 entrées 3SI1**, **333 entrées 4SI2**. Une notion compte une seule fois dans la couverture, uniquement si cochée dans une séance explicitement assurée et non future. Le taux mesure les tableaux du livre, pas tout le programme ni la maîtrise des élèves.
- Aucun historique fictif, aucune coche ajoutée automatiquement. Les préparations et propositions ne certifient pas le contenu réellement enseigné.
- PHP en 4SI2 à partir du **9 octobre 2026**, DC1 au **2 novembre 2026** ; calendrier tunisien et propositions déjà préparés conservés. Les titres personnalisés ne sont pas remplacés automatiquement.
- Les fiches, notions, horaires, profil, classes, élèves, épreuves, notes et présences gardent leur structure métier. Le nouveau stockage IndexedDB ajoute des métadonnées de synchronisation et des copies de secours, pas une nouvelle base métier distante.

## 6. Vérifications locales

**Correction 1.4.5 :** 30 contrôles du Cahier réussis : filtre par défaut, exclusion des séances assurées/reportées et des dates non passées, ordre décroissant, classes et trois trimestres, historique complet, confirmation/report/décochage par le formulaire natif, conservation des champs supplémentaires, cas vide et mobile sombre à 320/390 px. Les suites d’interface (86), de mode clair/sombre (45) et des commandes essentielles (33) ont aussi été relancées avec succès. Aucun changement au SQL ou au moteur de synchronisation.

**Ajout 1.4.4 :** 34 contrôles du volet mobile réussis : repli par défaut, boutons accessibles après ouverture, clavier, états réseau, mode sombre, passage mobile/ordinateur, hauteur réduite de 393 à 187 px, écrans étroits/courts et données inchangées. Les suites des commandes essentielles (33, adaptées au volet), fusion d’interface (86), clair/sombre (45), cloche (27) et trimestres (38) ont été relancées avec succès. Aucun changement au moteur de synchronisation ni au SQL dans cette version.

**Correction 1.4.3 :** 45 contrôles du mode clair/sombre réussis : bascule, absence d’ouverture du Cloud, conservation du choix, treize vues, formulaires, clavier, mobile, impression claire et données inchangées. Les 10 contrôles de cache/mise à jour incluent un véritable rechargement hors ligne en mode sombre. Les suites synchronisation simulée (30), commandes essentielles (33), fusion d’interface (86), cloche (27) et tri des cours (12) ont été relancées avec succès. Aucune opération sur la base ou le dépôt réels.

**Ajout 1.4.2 :** 27 contrôles de la cloche réussis (compteur, animation, liste, confirmation/décochage, changement de date, mobile, pause, réduction des animations, aucune écriture automatique). Les 33 contrôles des commandes essentielles, les 86 contrôles de fusion et les 12 contrôles du tri des cours ont été relancés avec succès. La synchronisation et le SQL ne changent pas dans cet ajout.

**Correction 1.4.1 :** 12 contrôles ciblés ont réussi (ordre complet sur toutes les pages, deux classes, recherche, CSV, séance du jour, début/fin d’année, mobile et données inchangées). La suite de fusion de 86 contrôles a également été relancée avec succès. Les autres résultats ci-dessous proviennent de la validation 1.4.0 ; le moteur de synchronisation n’a pas été modifié par cette correction.

| Suite | Résultat |
|---|---:|
| Fusion trois voies, ajouts, suppressions, listes par ID, choix explicites | 213 contrôles réussis |
| Deux navigateurs isolés, réseau coupé, conflits, CAS, comptes, onglets | 30 contrôles réussis |
| Service worker réel : rechargement hors ligne, mise à jour incomplète, validation sans perte | 9 contrôles réussis |
| Fonction SQL sur PostgreSQL local PGlite, schéma du dépôt et RLS | 13 contrôles réussis |
| Commandes essentielles ordinateur/mobile | 33 contrôles réussis |
| Cinq écrans fusionnés et treize vues ordinateur/mobile | 86 contrôles réussis |
| Trimestres, emploi du temps et navigation | 38 contrôles réussis |
| Régression du suivi des notions et conservation des données | 19 contrôles réussis |

Les échanges Cloud de navigateur ont été **simulés**, sans URL, clé ou données réelles de votre projet. Le test SQL local vérifie l’exécution, le refus d’un identifiant périmé et l’isolation des propriétaires ; il ne reproduit pas deux connexions PostgreSQL concurrentes réelles. Le scénario navigateur force une collision de version et vérifie la reprise.

Le banc de test utilise le véritable service worker et un serveur sans accès à Supabase. Les huit PDF ajoutés sont disponibles dans ce banc ; huit anciens PDF non copiés dans l’environnement local y retournent 404, sans empêcher le cache de l’interface. Leur disponibilité réelle doit être contrôlée via le compteur après publication.

Aucune donnée de test, configuration privée ou dépendance du banc de test n’est incluse dans l’archive. L’aperçu local ne charge pas votre sauvegarde : des compteurs à zéro n’indiquent pas une suppression de vos données.

## 7. Retour arrière

Conserver tous les exports et les deux versions des conflits. Ne supprimer ni la table, ni les instantanés, ni le stockage du navigateur.

Un retour à l’ancien code réintroduit son comportement d’envoi direct : désactiver les échanges automatiques et cesser les modifications simultanées avant cette opération. Ne pas mélanger durablement anciens et nouveaux clients écrivains.

La commande de retrait de la fonction SQL figure en commentaire dans le script ; **ne pas l’exécuter tant que cette version est utilisée**. Garder la fonction en place ne supprime aucune donnée et n’oblige pas à l’utiliser.
