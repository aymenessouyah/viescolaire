# Vie scolaire — fusion de l’interface fournie et de l’application STI

**Projet :** [aymenessouyah/viescolaire](https://github.com/aymenessouyah/viescolaire)  
**Version proposée :** `v1.3.2-sti-essential`  
**État :** préparée et testée localement, **non publiée**. Aucune modification effectuée dans GitHub ni dans la base Supabase réelle.

## Ce qui est intégré

| Classe | Identité visuelle | Organisation | Référentiel |
|---|---|---|---|
| **3SI1** | Bleu | Mardi et jeudi ; deux groupes de 2 h par jour | 269 entrées, Smart Book p. 58–72 |
| **4SI2** | Vert | Lundi et vendredi ; deux groupes de 2 h par jour | 333 entrées, Smart Book p. 83–100 |

Le nom **4SI2** est conservé, conformément à votre confirmation. Il n’y a pas de renommage vers 4SI1 et pas de migration des identifiants des élèves ou des classes.

- **Suivi des notions** disponible dans **Outils STI & données**, en complément des cinq écrans du modèle.
- Recherche et filtres par domaine et état de couverture.
- Cases à cocher dans les **fiches de séance existantes**.
- Compteurs et historique des séances pour chaque notion.
- Export CSV de la couverture de la classe sélectionnée.
- Deux livres PDF et six fiches PDF de 3SI ajoutés à la bibliothèque du suivi.
- Couleurs de classe : **3SI1 bleu, 4SI2 vert**.
- Suivi **commun aux deux groupes**, pas deux couvertures indépendantes.

## Interface fournie : reprise de la structure, pas seulement des couleurs

Le fichier `index.html` partagé sert de modèle pour la navigation, les composants et les cinq écrans principaux. Son CSS est repris et limité aux nouveaux écrans pour ne pas perturber les anciens modules. Les textes et chiffres de démonstration ne sont pas importés.

| Écran du modèle | Adaptation STI reliée aux données existantes |
|---|---|
| Tableau de bord | Quatre indicateurs, courbe prévu/effectué, anneau par classe, séances du jour, fiches récentes et couverture des livres |
| Suivi des cours | Tableau des séances, recherche, filtres 3SI1/4SI2, pagination, export CSV et accès aux fiches |
| Fiche pédagogique | Liste des séances et document papier, préparation de référence distincte du réalisé, notions cochées, devoirs, observations privées, mode classe et impression |
| Avancement des cours | Onglets de classes, domaines du Smart Book, jauge, barres et accès direct au référentiel filtré |
| Répartition des devoirs | Calendrier mensuel, liste des évaluations, filtres à venir/dates passées, charge par classe et ajout d’une épreuve |

### Navigation et actions

- Le menu principal reprend les cinq entrées du modèle. Une section **Planification**, directement visible, ajoute **Emploi du temps** et trois boutons **Répartition — 1er / 2e / 3e trimestre**. Chaque bouton ouvre le trimestre correspondant dans la répartition existante et conserve le choix de classe 3SI1/4SI2. Le bouton actif suit aussi le sélecteur de trimestre à l’intérieur de la page.
- **Outils STI & données** conserve les six autres vues : suivi des notions, calendrier tunisien, programme/compétences, élèves/notes/présences, cahier détaillé et annexes.
- Une barre **COMPTE & SAUVEGARDE** est désormais toujours visible en haut, y compris sur téléphone et après défilement : **Connexion / compte**, **Cloud**, **Envoyer au Cloud**, **Restaurer du Cloud**, **Imprimer**, **Exporter** et **Séance du jour**. Aucun réglage n’est nécessaire pour faire apparaître ces boutons. L’installation de l’application reste proposée selon les capacités du navigateur.
- Le menu du compte conserve connexion/changement de compte, profil, administration, déconnexion et mise à jour. L’icône de réglages supérieure ouvre directement la configuration Cloud. Le profil reste aussi accessible en bas du menu.
- L’état réseau et l’état de la sauvegarde existants sont affichés dans cette barre. Les commandes d’envoi et de restauration appellent les fonctions existantes ; la restauration manuelle conserve sa demande de confirmation avant remplacement. Ce ne sont pas encore des commandes de fusion bidirectionnelle automatique.
- La recherche supérieure fonctionne avec Entrée et ouvre le suivi des cours. Elle recherche dans les titres, contenus, préparations et notions cochées.
- La cloche affiche les prochaines échéances connues du planning. Ce sont des rappels locaux, pas des notifications envoyées aux élèves.
- **Nouvelle séance** ouvre un choix de créneau, puis le formulaire existant. Cela crée ou complète une fiche sans déplacer la date, renuméroter les séances ou modifier les groupes. Si aucune séance n’est prévue aujourd’hui, **Fiche du jour** propose aussi ce choix.
- **Réutiliser titre et devoirs** préremplit uniquement ces deux champs dans le formulaire de la séance cible. Rien n’est enregistré avant validation. Les coches, le statut, le contenu réalisé et les observations ne sont pas copiés.
- **Nouveau devoir** ajoute une épreuve à `store.epreuves[classe]`, avec la structure existante : `id`, `titre`, `type`, `date`, `bareme`, `tags`. La fonction `save()` existante assure sa sauvegarde. L’action d’accès aux notes ouvre le module élèves/épreuves conservé.

### Graphiques et chiffres : règles explicites

- Élèves : nombre d’élèves enregistrés dans les listes du profil.
- Couverture moyenne : moyenne arithmétique des pourcentages indépendants des deux Smart Books, pas maîtrise des élèves ni couverture de tout le programme.
- Notes saisies : notes numériques effectivement présentes, hors absences ; aucun nombre de copies à corriger n’est inventé.
- Heures des graphiques : durée prévue affectée aux fiches communes confirmées, **4 h enseignant par fiche** (2 groupes de 2 h). Ce n’est pas une mesure indépendante des durées réellement effectuées si une séance a été écourtée.
- Le réalisé ne compte que `done === true` pour une date non future. La courbe s’arrête au mois courant ; elle ne projette pas le réalisé dans le futur.
- Activité récente : fiches renseignées triées par date de séance, **pas un journal horodaté des modifications**.
- Évaluations : épreuves saisies et créneaux DC/DS du planning. Une épreuve saisie pour la même classe et la même date masque l’entrée prévisionnelle dans cet affichage, sans la supprimer des données. Les périodes officielles de synthèse, vacances et semaines bloquées restent consultables via le lien **Calendrier officiel**.
- Une date d’évaluation passée n’implique ni remise des copies ni correction terminée. Les taux fictifs de rendu et de correction du modèle ne sont pas repris.

### Présentation et conservation

Fond crème pointillé, menu vert forêt, or, cartes ivoire, typographie **Fraunces / Inter** et disposition du modèle. Les repères de **3SI1 restent bleus et ceux de 4SI2 verts**. Les polices sont incorporées au CSS avec leurs licences SIL OFL ; les graphiques SVG n’ont pas de dépendance CDN.

Les nouveaux écrans utilisent la même structure de sauvegarde que l’application. Aucune nouvelle base, clé métier locale ou table n’est créée. Les fonctions d’envoi et de restauration ne sont pas remplacées. Le module de suivi, les référentiels et les PDF de la version précédente restent identiques.

L’interface est adaptée au mobile ; le menu se ferme après navigation et gère le focus clavier. La fiche papier est imprimable sans le menu et sans sa colonne de sélection ; le mode classe masque les observations privées.

**L’aperçu local n’importe pas votre sauvegarde distante.** Des compteurs à zéro signifient qu’aucune donnée personnelle n’est chargée dans cet aperçu, pas que vos données ont été effacées.

Cette archive **remplace le paquet précédent**. Elle contient l’interface fusionnée, le suivi des livres et les ajustements déjà livrés. Elle s’applique par fusion au dépôt existant, pas comme un projet autonome.

## Règles de calcul

1. Chaque entrée reprend une ligne des tableaux du livre. Certaines lignes regroupent plusieurs syntaxes. Les attributs HTML sont des précisions associées, pas des entrées séparées.
2. Une notion compte une seule fois dans la couverture ; son nombre d’utilisations et son historique restent visibles.
3. Elle compte uniquement si elle est cochée dans une séance **explicitement assurée**, dont la date n’est pas future.
4. Une séance simplement échue, à venir ou reportée n’augmente pas la couverture.
5. Les deux instructions barrées « ne pas utiliser » des annexes sont exclues du dénominateur.
6. Les anciens indicateurs de séances ont également été corrigés : une date passée n’est plus assimilée à une séance assurée.

**Pour un suivi commun**, confirmer la fiche lorsque le contenu commun a été traité avec les deux groupes. Si un groupe prend du retard, laisser les éléments concernés en prévision et le préciser dans les observations.

Ce taux mesure la **couverture des tableaux du livre**, ni toute la matière STI, ni la maîtrise individuelle des élèves. Les domaines systèmes, réseaux et objets connectés ne sont pas couverts par ces seuls tableaux.

## Planning de 4SI2

La proposition du premier trimestre est recalée sur les indications fournies :

- PHP à partir du **vendredi 9 octobre 2026** ;
- DC1 reporté au **lundi 2 novembre 2026** ;
- correction du DC1 proposée au **vendredi 6 novembre**.

**Les dates, numéros et clés des séances restent inchangés.** Les ajustements portent sur le contenu de référence des 22 premiers créneaux de 4SI2. La ventilation détaillée des cours et les dates non confirmées restent des propositions.

Les fiches déjà personnalisées — titres, observations, devoirs, état, champs supplémentaires — ne sont pas écrasées. Un avertissement apparaît dans une fiche de 4SI2 si son titre personnalisé diffère du planning recalé. Il faut alors comparer et décider manuellement.

Les autres répartitions, dont les trimestres 2 et 3 du dépôt, sont conservées. Cette mise à jour n’est pas une validation complète de tous leurs contenus, horaires ou échéances.

## Intégration Supabase : pas de nouvelle table imposée

Le dépôt prévoit une table `public.espace_pedagogique`, contenant des instantanés dans une colonne `payload` de type `jsonb`.

Le suivi complète chaque fiche existante dans `payload.seances` :

```json
{
  "4SI2|10": {
    "title": "Titre personnalisé conservé",
    "contenu": "Déroulement réellement effectué",
    "devoirs": "Travail à domicile",
    "obs": "Observations",
    "done": true,
    "notions": ["identifiant-stable-du-referentiel"],
    "notionsVersion": "smart-books-2026-v1"
  }
}
```

L’identifiant ci-dessus est illustratif ; l’application enregistre les identifiants réels de la classe.

- Les fonctions existantes d’envoi, de restauration et d’export JSON transportent les nouvelles coches via `seances`.
- Une ancienne sauvegarde sans ces champs reste lisible : elle n’invente aucune utilisation.
- Le profil, les classes, les élèves, les épreuves, les notes et les présences restent dans leur structure existante.
- Le schéma SQL et les règles RLS ne sont pas modifiés par cette archive.
- `supabase/config.js` n’est **pas** remplacé.

**Limite de vérification :** le SQL public du dépôt a été examiné. L’envoi et la restauration ont été testés avec un transport simulé, **pas avec votre base réelle ni un compte connecté**. La présence effective des colonnes, des droits et des politiques RLS dans Supabase doit être confirmée dans votre environnement. Ne réexécutez pas les anciens scripts SQL pour installer ce suivi : ce n’est pas nécessaire si la base correspond au schéma du dépôt.

## Publication sûre

### 1. Sauvegarder avant toute mise à jour

- Depuis le site actuel, exportez vos données en JSON sur l’appareil qui contient la version la plus complète.
- Vérifiez séparément que votre sauvegarde cloud actuelle fonctionne.
- Conservez une copie du code actuel ou créez une branche de travail.
- N’envoyez ni mot de passe, ni jeton GitHub, ni clé `service_role`.

### 2. Fusionner les fichiers de l’archive dans le dépôt

Décompressez **`Mise-a-jour-viescolaire-STI.zip`**.

Les fichiers sont rangés directement selon l’arborescence du dépôt :

```text
index.html                         modifié : cinq écrans, barre supérieure, navigation et modules
sw.js                              modifié : version du cache et nouveaux fichiers
assets/app.js                      modifié : navigation, branchement du rendu, conservation des fiches, compteurs
assets/style.css                   modifié : 4SI2 en vert
assets/suivi-sti.js                 nouveau : suivi, filtres, historique, cases à cocher
assets/suivi-sti.css                nouveau : présentation du suivi
assets/theme-classe.css             nouveau : thème crème/vert/or et polices intégrées, mobile et impression
assets/theme-classe.js              nouveau : navigation, repères de classe, profil et accessibilité
assets/interface-reference.css     nouveau : CSS du modèle et adaptation aux écrans STI
assets/interface-reference.js      nouveau : cinq écrans reliés au store existant
 data/livres-sti.js                 nouveau : référentiels et liens des livres
 data/ajustements-sti.js            nouveau : proposition de planning T1 de 4SI2
 docs/sti-smart-book-3si-2026.pdf    nouveau
 docs/sti-smart-book-4si-2026.pdf    nouveau
 docs/fiches-3si-2026/              six nouveaux PDF
```

**Fusionnez les dossiers, ne supprimez pas les dossiers existants.** L’archive ne contient pas tout le projet. Conservez notamment les autres fichiers `assets/`, les données d’origine, `documents/`, `icons/`, `supabase/`, `manifest.webmanifest` et les outils OCR.

Dans l’interface GitHub : ouvrir le dépôt, idéalement une branche de travail, puis **Add file → Upload files**. Déposer les fichiers et dossiers extraits à la racine, sans créer un niveau supplémentaire portant le nom de l’archive. Examiner les changements avant le commit.

Les clés de données et le format historique `classe|numéro` sont conservés. Ne remplacez pas `index.html` par l’ancienne page autonome développée dans cette conversation : utilisez uniquement les fichiers de cette archive pour l’intégration.

### 3. Tester, puis publier

Vérifiez avant fusion dans `main` :

- Les onglets habituels et vos données existantes restent accessibles.
- Le nouvel onglet **Suivi des notions** est présent.
- Les classes sont **3SI1** et **4SI2**, bleu et vert.
- Une notion cochée dans une séance non assurée reste prévue.
- La confirmation d’une séance passée la fait compter une seule fois.
- Deux utilisations d’une même notion donnent une seule notion couverte, mais deux séances dans l’historique.
- Une coche retirée recalcule la couverture.
- L’historique de 3SI1 ne change pas lorsque 4SI2 est modifiée.
- Le DC1 de référence de 4SI2 est au 02/11/2026 et PHP commence au 09/10/2026.
- Les titres personnalisés éventuellement conservés ont été relus.

Sur la version publiée, connectez-vous vous-même, enregistrez une modification identifiable, vérifiez la réussite de l’envoi, puis contrôlez la restauration sur un second appareil **après sauvegarde de ses données locales**. Ce test final est indispensable pour valider votre configuration réelle Supabase.

### 4. Actualiser les appareils

La version de l’application et du service worker passe à `v1.3.0-sti-fusion`. Le rafraîchissement du cache est limité aux caches de cette application, pas aux autres sites ou applications du même domaine.

Actualisez les onglets ouverts et l’application installée sur chaque appareil. Évitez de continuer à modifier les mêmes fiches dans une ancienne version : un ancien client ne connaît pas le champ des notions.

## Retour arrière

Si nécessaire, revenez au commit précédent des fichiers d’application. Ne supprimez pas la table Supabase, les instantanés ou le stockage local. Conservez l’export JSON créé avant publication et les sauvegardes contenant les nouvelles coches.

Le site utilise déjà un système d’instantanés, pas une fusion collaborative en temps réel. L’envoi depuis plusieurs appareils peut créer des versions divergentes ; vérifiez l’appareil source avant une restauration.

## Tests effectués localement

- Syntaxe JavaScript des fichiers modifiés.
- Chargement de l’interface sans erreur JavaScript détectée.
- Référentiels séparés de 269 et 333 entrées.
- Absence de précochage automatique.
- Couverture réalisée, prévisionnelle, dédoublonnage et historique.
- Blocage de la déclaration d’une séance future comme assurée.
- Retrait de coches et persistance après rechargement.
- Conservation des titres personnalisés et des champs supplémentaires des fiches.
- Conservation des champs élèves et notes dans le contrat de sauvegarde testé.
- Envoi et restauration **simulés** du payload Supabase avec les coches.
- Contrôles de date du DC1 et de l’introduction à PHP.
- Affichage mobile sans débordement horizontal détecté dans les treize vues.
- Navigation latérale, sélection de 3SI1/4SI2 et repères bleu/vert sur ordinateur et téléphone.
- Comparaison des sources avec le paquet précédent : module de suivi, référentiels et PDF identiques ; branchement du nouveau rendu ajouté à `app.js`, sans remplacement de la sauvegarde.
- Ouverture du profil et des fiches de séance après application du thème.
- Menu mobile : ouverture, fermeture après navigation, Échap et retour du focus.
- Contrôle des styles d’impression : menu masqué et contenu en pleine largeur.
- Données métier inchangées par les interactions de thème testées, après initialisation normale des modules existants.

**La prévisualisation locale bloque les appels au projet Supabase réel.** Son état « sauvegarde locale seulement » est volontaire et ne diagnostique pas un problème de votre site en production.

### Vérifications de la fusion 1.3.0

85 contrôles automatisés ont réussi : structure du tableau de bord, recherche, filtre par classe, CSV, sélection des fiches, mode classe, réutilisation sans validation, saisie par le formulaire conservé, recalcul des graphiques, couverture par domaine, DC1 du 2 novembre, ajout d’épreuve, persistance après rechargement, transport dans le payload existant, notifications, outils de compte, treize vues sur ordinateur/mobile et styles d’impression. Aucun problème JavaScript détecté dans ce parcours.

La suite de régression précédente a également réussi, y compris le blocage du réalisé futur, le dédoublonnage des notions, la conservation des champs supplémentaires et l’envoi/restauration cloud **simulés**. Aucune écriture dans la base réelle n’a été effectuée. Les données de test ont été supprimées du navigateur de contrôle et ne sont pas incluses dans l’archive.

### Ajout 1.3.1 — accès directs aux trimestres

38 contrôles ciblés ont réussi : les trois trimestres pour chacune des deux classes, nombre de séances correspondant au trimestre, sélection active du menu, conservation de la classe, accès direct à l’emploi du temps, navigation mobile et maintien de la barre Compte/Cloud. Aucun changement des données métier ni des fonctions de sauvegarde. La suite de fusion (85 contrôles) a également été relancée avec succès.

**Hors ligne et synchronisation bidirectionnelle : demande en attente.** Cette version ajoute les boutons demandés en priorité. Elle ne met pas encore en œuvre la nouvelle synchronisation automatique dans les deux sens ni la gestion des conflits entre appareils ; le comportement de sauvegarde précédent est conservé.

### Ajout 1.3.2 — compte et Cloud prioritaires

Les boutons essentiels ont été déplacés dans l’en-tête fixe ; ils ne sont plus derrière l’icône de réglages. Aucun appel réel n’a été fait à la base. Un identifiant d’état Cloud dupliqué dans l’ancien écran Annexes a été renommé pour que chaque affichage ait un identifiant unique.

33 contrôles ciblés ont réussi : visibilité immédiate sur ordinateur/mobile, maintien lors du défilement, menu du compte, fenêtre de connexion, configuration Cloud, envoi/restauration sans configuration qui demandent les paramètres, export JSON, absence de débordement et conservation des données. La suite de fusion (86 contrôles), les 38 contrôles des trimestres et la régression du transport Cloud simulé ont aussi réussi.

La nouvelle synchronisation hors ligne/bidirectionnelle reste **en attente**, conformément à la priorité donnée aux commandes visibles. Ne pas confondre cette amélioration d’interface avec une nouvelle gestion des conflits entre appareils.
