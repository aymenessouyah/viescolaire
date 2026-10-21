# Mise à jour de Vie scolaire — suivi des notions STI

**Projet :** [aymenessouyah/viescolaire](https://github.com/aymenessouyah/viescolaire)  
**Version proposée :** `v1.2.0-sti-books`  
**État :** préparée et testée localement, **non publiée**. Aucune modification effectuée dans GitHub ni dans la base Supabase réelle.

## Ce qui est intégré

| Classe | Identité visuelle | Organisation | Référentiel |
|---|---|---|---|
| **3SI1** | Bleu | Mardi et jeudi ; deux groupes de 2 h par jour | 269 entrées, Smart Book p. 58–72 |
| **4SI2** | Vert | Lundi et vendredi ; deux groupes de 2 h par jour | 333 entrées, Smart Book p. 83–100 |

Le nom **4SI2** est conservé, conformément à votre confirmation. Il n’y a pas de renommage vers 4SI1 et pas de migration des identifiants des élèves ou des classes.

- Nouvel onglet **Suivi des notions**, ajouté à l’application existante.
- Recherche et filtres par domaine et état de couverture.
- Cases à cocher dans les **fiches de séance existantes**.
- Compteurs et historique des séances pour chaque notion.
- Export CSV de la couverture de la classe sélectionnée.
- Deux livres PDF et six fiches PDF de 3SI ajoutés à la bibliothèque du suivi.
- Couleurs de classe : **3SI1 bleu, 4SI2 vert**.
- Suivi **commun aux deux groupes**, pas deux couvertures indépendantes.

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
index.html                         modifié : chargement du module et nouvel onglet
sw.js                              modifié : version du cache et nouveaux fichiers
assets/app.js                      modifié : branchements, conservation des fiches, compteurs
assets/style.css                   modifié : 4SI2 en vert
assets/suivi-sti.js                 nouveau : suivi, filtres, historique, cases à cocher
assets/suivi-sti.css                nouveau : présentation du suivi
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

La version de l’application et du service worker passe à `v1.2.0-sti-books`. Le rafraîchissement du cache est limité aux caches de cette application, pas aux autres sites ou applications du même domaine.

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
- Affichage mobile sans débordement horizontal détecté.

**La prévisualisation locale bloque les appels au projet Supabase réel.** Son état « sauvegarde locale seulement » est volontaire et ne diagnostique pas un problème de votre site en production.
