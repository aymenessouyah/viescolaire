/* Fiches pédagogiques 4SI2 — modèle « S8-9 version 3 ».
   50 fiches, une par séance : objectifs, méthode, prérequis, critères de réussite,
   déroulement sur 120 min, travail à la maison.
   Ces contenus alimentent la boîte de fiche pédagogique du site ; ils sont
   préremplis automatiquement et modifiables par l'enseignant (les modifications
   sont conservées dans le navigateur, sans toucher à ce fichier).
   Fichier de données — modifiable sans toucher au code de l'application. */
(function (root) {
'use strict';
const FICHES_4SI2 = {
 "1": {
  "n": 1,
  "titre": "Rappel HTML5 — structure sémantique et formulaires",
  "date": "2026-09-18",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5",
  "pages": "p. 83-85",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "Rôle de chaque balise sémantique et différence avec <div> / <span>",
     "structure type d'un document HTML5",
     "les types d'input et leurs attributs (required, min, max, placeholder)"
    ]
   },
   {
    "titre": "Structure sémantique HTML5",
    "items": [
     "Identifier les zones sémantiques d'une page (header, nav, main, section, article, aside, footer)."
    ]
   },
   {
    "titre": "Formulaires et types d'input",
    "items": [
     "Construire un formulaire HTML5 avec les types d'input du programme (date, time, email, tel, password, range…"
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Balisage HTML de base vu en 3e année : titres, paragraphes, listes, liens, images"
  ],
  "criteres": [
   "Structure sémantique = squelette lisible par la machine ; un formulaire HTML5 se valide d'abord par ses types d'input, ensuite par JavaScript.",
   "Produire : Reprise de la page « club » : réécriture avec les balises sémantiques, puis ajout d'un…",
   "Éviter : Confondre <section> et <div> : une section porte toujours un titre."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Balisage HTML de base vu en 3e année : titres, paragraphes, listes, liens, images.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "On projette la page d'accueil d'un club de lycée entièrement construite en <div>. Les élèves doivent montrer où se trouve le menu, le contenu principal et le pied de page : personne ne peut le dire sans lire tout le code. Constat : le navigateur affiche, mais la machine ne comprend pas la structure. Présenter les consignes : Reprise de la page « club » : réécriture avec les balises sémantiques, puis ajout d'un formulaire d'inscription (nom, e-mail, date de naissance…",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rôle de chaque balise sémantique et différence avec <div> / <span> ; structure type d'un document HTML5 ; les types d'input et leurs attributs (required, min, max, placeholder) ; rôle du validateur W3C. Assister à la correction pour chaque élève ; Par deux : mise en forme du formulaire (fieldset, legend, label), ajout de figure et figcaption pour les photos, passage au validateur W3C et…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Rôle de chaque balise sémantique et différence avec <div> / <span> • structure type d'un document HTML5 • les types d'input et leurs attributs (required, min, max, placeholder) • Confondre <section> et <div> : une section porte toujours un titre. • Oublier le <label> associé au champ.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   }
  ],
  "maison": "Terminer la page (zéro erreur au validateur) et l'apporter en fichier .html sur clé USB.",
  "trace": "Structure sémantique = squelette lisible par la machine ; un formulaire HTML5 se valide d'abord par ses types d'input, ensuite par JavaScript.",
  "erreurs": [
   "Confondre <section> et <div> : une section porte toujours un titre.",
   "Oublier le <label> associé au champ."
  ],
  "prerequis_technique": "Balisage HTML de base vu en 3e année : titres, paragraphes, listes, liens, images.",
  "axes": [
   "Structure sémantique HTML5",
   "Formulaires et types d'input",
   "Validation du code"
  ],
  "objectifs_cours": [
   "Identifier les zones sémantiques d'une page (header, nav, main, section, article, aside, footer).",
   "Construire un formulaire HTML5 avec les types d'input du programme (date, time, email, tel, password, range, button).",
   "Valider un document avec le validateur du W3C et corriger erreurs et avertissements."
  ]
 },
 "2": {
  "n": 2,
  "titre": "Rappel CSS3 — sélecteurs et mise en forme",
  "date": "2026-09-21",
  "tri": 1,
  "nature": "cours",
  "domaines": "CSS3",
  "pages": "p. 87-89",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     "Sélecteurs d'élément, de classe, d'identifiant, de groupe et universel",
     "spécificité",
     "propriétés de texte"
    ]
   },
   {
    "titre": "Sélecteurs et spécificité",
    "items": [
     "Choisir le sélecteur le plus précis et le plus stable (classe plutôt qu'id)."
    ]
   },
   {
    "titre": "Texte, bordures, arrière-plans",
    "items": [
     "Appliquer les propriétés de texte, d'arrière-plan et de bordure."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Feuille de style externe : fichier",
   "css et balise <link>"
  ],
  "criteres": [
   "Une classe se réutilise, un id est unique ; largeur totale = content + padding + border (+ margin hors boîte).",
   "Produire : Page « menu du restaurant scolaire » : sélecteurs de classe et de groupe, mise en forme…",
   "Éviter : Multiplier les id au lieu des classes."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Feuille de style externe : fichier .css et balise <link>.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Deux versions d'une même page sont montrées : l'une avec styles en ligne, l'autre avec une feuille externe. On compare le volume de code, puis on demande le temps nécessaire pour changer la couleur de tous les titres. Présenter les consignes : Page « menu du restaurant scolaire » : sélecteurs de classe et de groupe, mise en forme du texte, bordures et arrière-plans.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Sélecteurs d'élément, de classe, d'identifiant, de groupe et universel ; spécificité ; propriétés de texte ; couleurs et arrière-plans ; bordures ; box-sizing et calcul de largeur. Assister à la correction pour chaque élève ; Calcul de largeur totale de deux colonnes en pourcentage avec padding, puis validation CSS3 et correction.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Sélecteurs d'élément, de classe, d'identifiant, de groupe et universel • spécificité • propriétés de texte • Multiplier les id au lieu des classes. • Colonnes qui débordent faute de box-sizing: border-box.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Finir la feuille de style du menu en allant du sélecteur le plus général au plus précis.",
  "trace": "Une classe se réutilise, un id est unique ; largeur totale = content + padding + border (+ margin hors boîte).",
  "erreurs": [
   "Multiplier les id au lieu des classes.",
   "Colonnes qui débordent faute de box-sizing: border-box."
  ],
  "prerequis_technique": "Feuille de style externe : fichier .css et balise <link>.",
  "axes": [
   "Sélecteurs et spécificité",
   "Texte, bordures, arrière-plans",
   "Modèle de boîte"
  ],
  "objectifs_cours": [
   "Choisir le sélecteur le plus précis et le plus stable (classe plutôt qu'id).",
   "Appliquer les propriétés de texte, d'arrière-plan et de bordure.",
   "Expliquer le modèle de boîte et calculer la largeur totale d'un élément."
  ]
 },
 "3": {
  "n": 3,
  "titre": "Rappel CSS3 — positionnement, flex et animations",
  "date": "2026-09-25",
  "tri": 1,
  "nature": "cours",
  "domaines": "CSS3",
  "pages": "p. 89-90",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     "Rôle de position, coordonnées, z-index et contextes d'empilement",
     "display:flex, justify-content, align-items, gap",
     "transition et @keyframes."
    ]
   },
   {
    "titre": "Position absolute / relative / fixed / sticky",
    "items": [
     "Choisir le positionnement adapté : relative sur le parent, absolute sur l'enfant, fixed pour un bandeau, sticky…"
    ]
   },
   {
    "titre": "Flexbox",
    "items": [
     "Construire une mise en page à deux ou trois colonnes avec flex."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Sélecteurs CSS et modèle de boîte (séance 2)"
  ],
  "criteres": [
   "Un élément absolu se positionne par rapport à son premier ancêtre positionné ; flex remplace les flottants pour aligner.",
   "Produire : Page « Fleurs du lycée » : bandeau fixed, badge absolute dans une carte relative…",
   "Éviter : Parent non positionné : l'élément absolu part de la page."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Sélecteurs CSS et modèle de boîte (séance 2).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un bandeau de navigation qui disparaît au défilement et un badge « nouveau » systématiquement mal placé : les élèves proposent des solutions intuitives, puis découvrent position et z-index. Présenter les consignes : Page « Fleurs du lycée » : bandeau fixed, badge absolute dans une carte relative, sommaire sticky, galerie en flex à trois colonnes.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rôle de position, coordonnées, z-index et contextes d'empilement ; display:flex, justify-content, align-items, gap ; transition et @keyframes. Assister à la correction pour chaque élève ; Ajout d'une transition au survol des cartes et d'une animation d'apparition ; test sur les postes et correction.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Rôle de position, coordonnées, z-index et contextes d'empilement • display:flex, justify-content, align-items, gap • transition et @keyframes. • Parent non positionné : l'élément absolu part de la page. • z-index sans effet car position: static.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Reproduire la maquette distribuée (trois colonnes + bandeau) sans utiliser float.",
  "trace": "Un élément absolu se positionne par rapport à son premier ancêtre positionné ; flex remplace les flottants pour aligner.",
  "erreurs": [
   "Parent non positionné : l'élément absolu part de la page.",
   "z-index sans effet car position: static."
  ],
  "prerequis_technique": "Sélecteurs CSS et modèle de boîte (séance 2).",
  "axes": [
   "Position absolute / relative / fixed / sticky",
   "Flexbox",
   "Transitions et animations"
  ],
  "objectifs_cours": [
   "Choisir le positionnement adapté : relative sur le parent, absolute sur l'enfant, fixed pour un bandeau, sticky pour un sommaire.",
   "Construire une mise en page à deux ou trois colonnes avec flex.",
   "Ajouter une transition et une animation simple."
  ]
 },
 "4": {
  "n": 4,
  "titre": "Rappel BD — modèle relationnel, clés et contraintes (LDD)",
  "date": "2026-09-28",
  "tri": 1,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 95",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Base de données",
     "Table / relation",
     "Clé composée",
     "Relation 1:1"
    ]
   },
   {
    "titre": "Modèle relationnel et cardinalités",
    "items": [
     "Distinguer entité, association, cardinalité et les traduire en tables."
    ]
   },
   {
    "titre": "Clés et contraintes d'intégrité",
    "items": [
     "Choisir clé primaire et clé étrangère et écrire les contraintes d'intégrité."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Notions de table, champ, enregistrement (3e année)"
  ],
  "criteres": [
   "La contrainte garantit la cohérence : clé primaire = unicité, clé étrangère = référence valide.",
   "Produire : Sous phpMyAdmin : création de la base « club » et des tables adhérents, activites…",
   "Éviter : Insérer une ligne avant la table référencée."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Notions de table, champ, enregistrement (3e année).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le fichier des adhérents du club est un tableur : la même personne apparaît deux fois, un numéro de téléphone traîne dans la colonne du nom. Question : comment empêcher cela ? Présenter les consignes : Sous phpMyAdmin : création de la base « club » et des tables adhérents, activites, inscriptions, avec clés et contraintes.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Relations 1:1, 1:n, n:m et table de jonction ; clé primaire simple ou composée ; clé étrangère ; contraintes de domaine, de table, référentielle ; syntaxe CREATE TABLE et types MySQL. Assister à la correction pour chaque élève ; Écriture du script SQL complet sur feuille puis exécution ; test des contraintes en tentant des insertions interdites (clé dupliquée, référence…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Insérer une ligne avant la table référencée. • Oublier AUTO_INCREMENT ou choisir une taille de champ trop courte.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Rédiger le script de création de la base du club et le rapporter sur clé USB.",
  "trace": "La contrainte garantit la cohérence : clé primaire = unicité, clé étrangère = référence valide.",
  "erreurs": [
   "Insérer une ligne avant la table référencée.",
   "Oublier AUTO_INCREMENT ou choisir une taille de champ trop courte."
  ],
  "prerequis_technique": "Notions de table, champ, enregistrement (3e année).",
  "axes": [
   "Modèle relationnel et cardinalités",
   "Clés et contraintes d'intégrité",
   "CREATE DATABASE / CREATE TABLE"
  ],
  "objectifs_cours": [
   "Distinguer entité, association, cardinalité et les traduire en tables.",
   "Choisir clé primaire et clé étrangère et écrire les contraintes d'intégrité.",
   "Créer une base et ses tables en SQL puis vérifier la structure obtenue."
  ]
 },
 "5": {
  "n": 5,
  "titre": "Rappel SQL — LMD : INSERT, UPDATE, DELETE",
  "date": "2026-10-02",
  "tri": 1,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 95-96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Base de données",
     "Table / relation",
     "Clé composée",
     "Relation 1:1"
    ]
   },
   {
    "titre": "INSERT INTO",
    "items": [
     "Insérer des lignes avec et sans liste de colonnes."
    ]
   },
   {
    "titre": "UPDATE et DELETE",
    "items": [
     "Modifier et supprimer des lignes en contrôlant la clause WHERE."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "CREATE TABLE et contraintes (séance 4)"
  ],
  "criteres": [
   "Pas de UPDATE ni de DELETE sans WHERE relu ; l'export SQL est la sauvegarde de référence.",
   "Produire : Insertion de dix adhérents et de quatre activités ; modification des niveaux …",
   "Éviter : Utiliser = au lieu de IS NULL."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : CREATE TABLE et contraintes (séance 4).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un UPDATE lancé sans WHERE : toute la colonne des niveaux prend la même valeur. Les élèves cherchent comment éviter que cela se reproduise en salle informatique. Présenter les consignes : Insertion de dix adhérents et de quatre activités ; modification des niveaux ; suppression d'une inscription ; vérification par SELECT COUNT(*).",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Syntaxe INSERT INTO ... VALUES et INSERT ... SET ; UPDATE ... SET ... WHERE ; DELETE ... WHERE ; nécessité d'une sauvegarde avant modification ; export / import de fichier .sql. Assister à la correction pour chaque élève ; Export de la base, suppression d'une table, réimportation ; rédaction d'une procédure écrite « avant toute mise à jour : SELECT puis UPDATE ».",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Utiliser = au lieu de IS NULL. • Supprimer une ligne référencée par une clé étrangère.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Rédiger les cinq requêtes LMD de la série distribuée.",
  "trace": "Pas de UPDATE ni de DELETE sans WHERE relu ; l'export SQL est la sauvegarde de référence.",
  "erreurs": [
   "Utiliser = au lieu de IS NULL.",
   "Supprimer une ligne référencée par une clé étrangère."
  ],
  "prerequis_technique": "CREATE TABLE et contraintes (séance 4).",
  "axes": [
   "INSERT INTO",
   "UPDATE et DELETE",
   "Import / export SQL"
  ],
  "objectifs_cours": [
   "Insérer des lignes avec et sans liste de colonnes.",
   "Modifier et supprimer des lignes en contrôlant la clause WHERE.",
   "Exporter et importer une base au format SQL."
  ]
 },
 "6": {
  "n": 6,
  "titre": "Rappel SQL — SELECT simple et jointures",
  "date": "2026-10-05",
  "tri": 1,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Ordre d'écriture SELECT ... FROM ... WHERE ... ORDER BY",
     "opérateurs de comparaison",
     "joker % dans LIKE"
    ]
   },
   {
    "titre": "SELECT, filtres et tri",
    "items": [
     "Écrire une requête SELECT avec filtres et tri."
    ]
   },
   {
    "titre": "LIKE, BETWEEN, IN",
    "items": [
     "Utiliser LIKE, BETWEEN et IN et gérer les valeurs nulles."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "LMD : INSERT, UPDATE, DELETE (séance 5)"
  ],
  "criteres": [
   "Une jointure relie deux tables par l'égalité de leurs clés ; sans elle, le produit cartésien multiplie les lignes.",
   "Produire : Douze requêtes progressives sur la base du club : filtres, tri, LIKE, BETWEEN, IN.",
   "Éviter : Alias déclaré mais non utilisé dans la condition."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : LMD : INSERT, UPDATE, DELETE (séance 5).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Question du secrétariat : « quels adhérents de Gafsa ont participé à l'activité Théâtre en 2026 ? » La réponse se trouve dans deux tables différentes. Présenter les consignes : Douze requêtes progressives sur la base du club : filtres, tri, LIKE, BETWEEN, IN.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Ordre d'écriture SELECT ... FROM ... WHERE ... ORDER BY ; alias ; opérateurs de comparaison ; joker % dans LIKE ; jointure interne et condition sur clé étrangère ; piège du produit cartésien. Assister à la correction pour chaque élève ; Cinq requêtes à deux tables ; comparaison du nombre de lignes avec et sans condition de jointure.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Ordre d'écriture SELECT ... FROM ... WHERE ... ORDER BY • opérateurs de comparaison • joker % dans LIKE • Alias déclaré mais non utilisé dans la condition. • Confondre WHERE et HAVING.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Écrire les cinq requêtes à deux tables du sujet distribué.",
  "trace": "Une jointure relie deux tables par l'égalité de leurs clés ; sans elle, le produit cartésien multiplie les lignes.",
  "erreurs": [
   "Alias déclaré mais non utilisé dans la condition.",
   "Confondre WHERE et HAVING."
  ],
  "prerequis_technique": "LMD : INSERT, UPDATE, DELETE (séance 5).",
  "axes": [
   "SELECT, filtres et tri",
   "LIKE, BETWEEN, IN",
   "Jointure sur clé étrangère"
  ],
  "objectifs_cours": [
   "Écrire une requête SELECT avec filtres et tri.",
   "Utiliser LIKE, BETWEEN et IN et gérer les valeurs nulles.",
   "Relier deux tables par leur clé (jointure interne) avec alias."
  ]
 },
 "7": {
  "n": 7,
  "titre": "PHP — variables, types, tableaux, boucles et formulaires",
  "date": "2026-10-09",
  "tri": 1,
  "nature": "cours",
  "domaines": "PHP",
  "pages": "p. 97-98",
  "duree": 120,
  "objectifs": [
   {
    "titre": "PHP",
    "items": [
     "Environnement XAMPP et dossier htdocs",
     "balises <?php ?>",
     "variables et concaténation"
    ]
   },
   {
    "titre": "Variables, types et tableaux",
    "items": [
     "Écrire un script PHP qui affiche un contenu dynamique."
    ]
   },
   {
    "titre": "Boucles et structures de contrôle",
    "items": [
     "Manipuler tableaux indicés et associatifs avec for et foreach."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Formulaires HTML5 (séance 1) et logique algorithmique de base"
  ],
  "criteres": [
   "PHP s'exécute sur le serveur : l'élève ne voit que le HTML produit ; toute donnée externe est suspecte et doit être contrôlée.",
   "Produire : Formulaire HTML vers traitement PHP : récupération du nom et de l'âge, affichage…",
   "Éviter : Oublier le point-virgule ou confondre = et ==."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Formulaires HTML5 (séance 1) et logique algorithmique de base.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le formulaire d'inscription du club affiche toujours « Bienvenue » sans le nom de la personne : les élèves veulent afficher le nom réellement saisi. Présenter les consignes : Formulaire HTML vers traitement PHP : récupération du nom et de l'âge, affichage conditionnel, boucle sur une liste de niveaux.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Environnement XAMPP et dossier htdocs ; balises <?php ?> ; echo ; variables et concaténation ; types ; tableaux ; boucles ; $_GET / $_POST ; isset() ; différences entre GET et POST. Assister à la correction pour chaque élève ; Contrôle de saisie : champ vide, âge hors bornes, e-mail sans @ ; messages d'erreur et conservation des valeurs saisies.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Environnement XAMPP et dossier htdocs • balises <?php ?> • variables et concaténation • Oublier le point-virgule ou confondre = et ==. • Lire $_POST alors que le formulaire est en method=\"get\".",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   }
  ],
  "maison": "Terminer le formulaire contrôlé et le déposer dans htdocs.",
  "trace": "PHP s'exécute sur le serveur : l'élève ne voit que le HTML produit ; toute donnée externe est suspecte et doit être contrôlée.",
  "erreurs": [
   "Oublier le point-virgule ou confondre = et ==.",
   "Lire $_POST alors que le formulaire est en method=\"get\"."
  ],
  "prerequis_technique": "Formulaires HTML5 (séance 1) et logique algorithmique de base.",
  "axes": [
   "Variables, types et tableaux",
   "Boucles et structures de contrôle",
   "$_GET / $_POST et contrôle de saisie"
  ],
  "objectifs_cours": [
   "Écrire un script PHP qui affiche un contenu dynamique.",
   "Manipuler tableaux indicés et associatifs avec for et foreach.",
   "Transmettre les données d'un formulaire et les contrôler côté serveur."
  ]
 },
 "8": {
  "n": 8,
  "titre": "PHP–MySQL — connexion, extraction et affichage des données",
  "date": "2026-10-12",
  "tri": 1,
  "nature": "cours",
  "domaines": "PHP",
  "pages": "p. 99-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "PHP",
    "items": [
     "Fonctions MySQLi",
     "Erreurs de serveur",
     "Affichage simplifié"
    ]
   },
   {
    "titre": "Connexion MySQLi",
    "items": [
     "Établir une connexion à MySQL et sélectionner la base."
    ]
   },
   {
    "titre": "Exécution d'un SELECT",
    "items": [
     "Exécuter une requête SELECT et parcourir le jeu de résultats."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "PHP de base (séance 7) et SELECT (séance 6)"
  ],
  "criteres": [
   "Le script ne contient aucune donnée : il interroge la base et met en forme ce qu'il reçoit.",
   "Produire : Connexion puis affichage de tous les adhérents dans un tableau HTML avec en-têtes.",
   "Éviter : Connexion codée en dur sans test d'erreur."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : PHP de base (séance 7) et SELECT (séance 6).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "La liste des adhérents est recopiée à la main dans le HTML : deux versions différentes circulent déjà. Comment afficher toujours la version de la base ? Présenter les consignes : Connexion puis affichage de tous les adhérents dans un tableau HTML avec en-têtes.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "mysqli_connect, mysqli_select_db, mysqli_query, mysqli_fetch_assoc, mysqli_fetch_row, mysqli_num_rows, mysqli_close ; traitement du cas « aucun résultat ». Assister à la correction pour chaque élève ; Affichage filtré (WHERE niveau = ...) avec compteur de lignes et message « aucun adhérent » si le résultat est vide.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Fonctions MySQLi • Erreurs de serveur • Affichage simplifié • Connexion codée en dur sans test d'erreur. • Boucle infinie car le fetch est mal placé dans la condition.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   }
  ],
  "maison": "Adapter le script pour afficher la liste des activités avec leur nombre d'inscrits (COUNT).",
  "trace": "Le script ne contient aucune donnée : il interroge la base et met en forme ce qu'il reçoit.",
  "erreurs": [
   "Connexion codée en dur sans test d'erreur.",
   "Boucle infinie car le fetch est mal placé dans la condition."
  ],
  "prerequis_technique": "PHP de base (séance 7) et SELECT (séance 6).",
  "axes": [
   "Connexion MySQLi",
   "Exécution d'un SELECT",
   "Affichage dans un tableau HTML"
  ],
  "objectifs_cours": [
   "Établir une connexion à MySQL et sélectionner la base.",
   "Exécuter une requête SELECT et parcourir le jeu de résultats.",
   "Générer un tableau HTML à partir des données reçues."
  ]
 },
 "9": {
  "n": 9,
  "titre": "PHP–MySQL — insertion des données d'un formulaire",
  "date": "2026-10-16",
  "tri": 1,
  "nature": "cours",
  "domaines": "PHP",
  "pages": "p. 99",
  "duree": 120,
  "objectifs": [
   {
    "titre": "PHP",
    "items": [
     "Fonctions MySQLi",
     "Erreurs de serveur"
    ]
   },
   {
    "titre": "Formulaire vers script",
    "items": [
     "Enregistrer les données d'un formulaire dans une table."
    ]
   },
   {
    "titre": "INSERT et contrôles",
    "items": [
     "Vérifier le nombre de lignes affectées et récupérer l'identifiant créé."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Formulaires (séance 7) et connexion (séance 8)"
  ],
  "criteres": [
   "Insérer = contrôler d'abord, écrire ensuite, confirmer enfin.",
   "Produire : Formulaire d'inscription relié à la base : insertion d'un adhérent et message de…",
   "Éviter : Insertion vide car l'attribut name diffère de la clé lue dans $_POST."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Formulaires (séance 7) et connexion (séance 8).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Les inscriptions du club sont saisies sur papier puis recopiées : deux semaines de retard. Objectif : saisie directe en ligne, sans double saisie. Présenter les consignes : Formulaire d'inscription relié à la base : insertion d'un adhérent et message de confirmation avec son numéro.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Chaîne formulaire → $_POST → contrôle → INSERT ; mysqli_affected_rows ; mysqli_insert_id ; message de confirmation ; principe de moindre confiance dans les données reçues. Assister à la correction pour chaque élève ; Ajout des contrôles (champs obligatoires, âge, e-mail), test des cas limites et correction des messages.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Fonctions MySQLi • Erreurs de serveur • Insertion vide car l'attribut name diffère de la clé lue dans $_POST. • Réaffichage brut du texte saisi par l'utilisateur.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   }
  ],
  "maison": "Rédiger la fiche « que faire si l'insertion échoue ? » en trois vérifications ordonnées.",
  "trace": "Insérer = contrôler d'abord, écrire ensuite, confirmer enfin.",
  "erreurs": [
   "Insertion vide car l'attribut name diffère de la clé lue dans $_POST.",
   "Réaffichage brut du texte saisi par l'utilisateur."
  ],
  "prerequis_technique": "Formulaires (séance 7) et connexion (séance 8).",
  "axes": [
   "Formulaire vers script",
   "INSERT et contrôles",
   "Sécurité de base"
  ],
  "objectifs_cours": [
   "Enregistrer les données d'un formulaire dans une table.",
   "Vérifier le nombre de lignes affectées et récupérer l'identifiant créé.",
   "Éviter les erreurs d'insertion : champ vide, mauvais type, doublon."
  ]
 },
 "10": {
  "n": 10,
  "titre": "PHP–MySQL — mise à jour, suppression et recherche",
  "date": "2026-10-19",
  "tri": 1,
  "nature": "cours",
  "domaines": "PHP",
  "pages": "p. 99-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "PHP",
    "items": [
     "Fonctions MySQLi",
     "Erreurs de serveur",
     "Affichage simplifié"
    ]
   },
   {
    "titre": "UPDATE et DELETE depuis PHP",
    "items": [
     "Modifier et supprimer un enregistrement depuis une page PHP."
    ]
   },
   {
    "titre": "Recherche multicritères",
    "items": [
     "Construire une recherche selon un critère choisi par l'utilisateur."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Connexion et insertion (séances 8 et 9)"
  ],
  "criteres": [
   "Toute modification passe par un identifiant unique et une confirmation explicite.",
   "Produire : Page « fiche adhérent » avec boutons Modifier et Supprimer ; formulaire pré-rempli et…",
   "Éviter : Supprimer sans clause WHERE."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Connexion et insertion (séances 8 et 9).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un adhérent a changé de numéro de téléphone : il faut corriger sa fiche sans toucher au reste de la base. Présenter les consignes : Page « fiche adhérent » avec boutons Modifier et Supprimer ; formulaire pré-rempli et enregistrement de la mise à jour.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "UPDATE ... WHERE id = ? ; DELETE avec page de confirmation ; WHERE construit à partir d'un critère choisi ; pagination simple des résultats. Assister à la correction pour chaque élève ; Page de recherche par nom, par niveau ou par activité, avec affichage du nombre de résultats.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Fonctions MySQLi • Erreurs de serveur • Affichage simplifié • Supprimer sans clause WHERE. • Identifiant absent de l'URL : script qui s'arrête sur une erreur SQL.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   }
  ],
  "maison": "Terminer la recherche par activité et préparer les questions de révision du DC1.",
  "trace": "Toute modification passe par un identifiant unique et une confirmation explicite.",
  "erreurs": [
   "Supprimer sans clause WHERE.",
   "Identifiant absent de l'URL : script qui s'arrête sur une erreur SQL."
  ],
  "prerequis_technique": "Connexion et insertion (séances 8 et 9).",
  "axes": [
   "UPDATE et DELETE depuis PHP",
   "Recherche multicritères",
   "CRUD complet"
  ],
  "objectifs_cours": [
   "Modifier et supprimer un enregistrement depuis une page PHP.",
   "Construire une recherche selon un critère choisi par l'utilisateur.",
   "Enchaîner les pages liste, fiche, modification et suppression avec confirmation."
  ]
 },
 "11": {
  "n": 11,
  "titre": "Atelier bac pratique — méthode, barème et révision avant le DC1",
  "date": "2026-10-23",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5 / CSS3 / JS",
  "pages": "p. 83-94",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "Lecture du cahier des charges",
     "repérage des livrables attendus",
     "barème indicatif"
    ]
   },
   {
    "titre": "JavaScript",
    "items": [
     "Lecture du cahier des charges",
     "repérage des livrables attendus",
     "barème indicatif"
    ]
   },
   {
    "titre": "Analyse du sujet et barème",
    "items": [
     "Découper un sujet d'épreuve pratique en tâches et en points."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Ensemble du programme du 1er trimestre"
  ],
  "criteres": [
   "En épreuve pratique, on écrit d'abord ce qui est sûr et rapporte ; on vérifie le résultat attendu avant de passer à la suite.",
   "Produire : Partie CSS du sujet, guidée puis en autonomie : position, float, largeurs, couleurs.",
   "Éviter : Commencer par la question la plus longue."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Ensemble du programme du 1er trimestre.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Distribution d'un sujet de bac pratique sans corrigé : avant de commencer, les élèves doivent estimer le temps nécessaire à chaque question et l'ordre de traitement. Présenter les consignes : Partie CSS du sujet, guidée puis en autonomie : position, float, largeurs, couleurs.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Lecture du cahier des charges ; repérage des livrables attendus ; barème indicatif ; règle « commencer par ce qui rapporte le plus de points et se termine sûrement » ; vérification finale. Assister à la correction pour chaque élève ; Partie JavaScript (validation, calcul, affichage), autocorrection au barème, puis révision ciblée PHP et SQL pour le DC1 du 2 novembre.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Lecture du cahier des charges • repérage des livrables attendus • barème indicatif • Commencer par la question la plus longue. • Rendre sans avoir testé le fichier enregistré.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   }
  ],
  "maison": "Revoir les fiches de rappel HTML, CSS, SQL et PHP pour le devoir de contrôle n°1.",
  "trace": "En épreuve pratique, on écrit d'abord ce qui est sûr et rapporte ; on vérifie le résultat attendu avant de passer à la suite.",
  "erreurs": [
   "Commencer par la question la plus longue.",
   "Rendre sans avoir testé le fichier enregistré."
  ],
  "prerequis_technique": "Ensemble du programme du 1er trimestre.",
  "axes": [
   "Analyse du sujet et barème",
   "Partie CSS et JavaScript",
   "Gestion du temps d'épreuve"
  ],
  "objectifs_cours": [
   "Découper un sujet d'épreuve pratique en tâches et en points.",
   "Réaliser la partie CSS puis la partie JavaScript dans le temps imparti.",
   "S'auto-évaluer avec le barème officiel avant de rendre."
  ]
 },
 "12": {
  "n": 12,
  "titre": "Devoir de contrôle n°1",
  "date": "2026-11-02",
  "tri": 1,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5 et CSS3",
    "items": [
     "Évaluer les acquis du 1er trimestre, en théorie et en pratique."
    ]
   },
   {
    "titre": "SQL : LDD, LMD, jointure",
    "items": [
     "Vérifier la capacité à écrire une requête SQL correcte et un script PHP fonctionnel."
    ]
   },
   {
    "titre": "PHP : formulaires et PHP–MySQL",
    "items": [
     "Diagnostiquer les besoins de remédiation avant le devoir de synthèse."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 11"
  ],
  "criteres": [
   "Barème : pratique 60 %, théorie 40 % ; la syntaxe exacte et le résultat affiché comptent autant que la démarche.",
   "Produire : Partie théorique : lecture de code, complément de requêtes, schéma et contraintes.",
   "Éviter : Requête SQL écrite sans WHERE alors que la consigne le demandait."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Partie 1 : structure HTML5, formulaire, positionnement CSS3. Partie 2 : SQL — LDD, LMD, SELECT et jointure. Partie 3 …",
    "eleves": "• Écoutent les consignes • Préparent la machine et le matériel",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Distribuer le sujet ; répondre uniquement aux questions de forme.",
    "eleves": "• Lisent le sujet • Repèrent les parties et l'ordre de traitement",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Épreuve",
    "duree": 100,
    "prof": "Partie théorique : lecture de code, complément de requêtes, schéma et contraintes. Partie pratique sur machine : formulaire contrôlé, requête SQL, script PHP d'affichage.",
    "eleves": "• Composent • Testent leur production • Gèrent leur temps",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Ramasser les copies et les fichiers ; recueillir les impressions à chaud.",
    "eleves": "• Enregistrent et rendent • Expriment les difficultés rencontrées",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Aucun travail écrit ; relire les fiches 1 à 11 avant la séance de correction.",
  "trace": "Barème : pratique 60 %, théorie 40 % ; la syntaxe exacte et le résultat affiché comptent autant que la démarche.",
  "erreurs": [
   "Requête SQL écrite sans WHERE alors que la consigne le demandait.",
   "Script non testé : erreur de connexion non détectée par l'élève."
  ],
  "prerequis_technique": "Séances 1 à 11.",
  "axes": [
   "HTML5 et CSS3",
   "SQL : LDD, LMD, jointure",
   "PHP : formulaires et PHP–MySQL"
  ],
  "objectifs_cours": [
   "Évaluer les acquis du 1er trimestre, en théorie et en pratique.",
   "Vérifier la capacité à écrire une requête SQL correcte et un script PHP fonctionnel.",
   "Diagnostiquer les besoins de remédiation avant le devoir de synthèse."
  ]
 },
 "13": {
  "n": 13,
  "titre": "Correction du DC1 et consolidation JavaScript : validation de formulaire et structures de contrôle",
  "date": "2026-11-06",
  "tri": 1,
  "nature": "correction",
  "domaines": "JavaScript",
  "pages": "p. 91-94",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction et remédiation du DC1",
    "items": [
     "Comprendre ses erreurs et corriger sa copie du DC1."
    ]
   },
   {
    "titre": "Validation JavaScript de formulaire",
    "items": [
     "Valider un formulaire en JavaScript sans utiliser l'attribut pattern."
    ]
   },
   {
    "titre": "Structures switch et while",
    "items": [
     "Utiliser getElementsByName, switch et while pour modifier contenu, styles et attributs."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC1",
   "JavaScript de 3e année (variables, fonctions, événements)"
  ],
  "criteres": [
   "La validation côté client améliore l'expérience, la validation côté serveur assure la sécurité : les deux sont exigées.",
   "Produire : Correction guidée du DC1, question par question, avec rédaction de la bonne réponse au…",
   "Éviter : Utiliser alert() comme seule validation."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Copies annotées projetées : trois erreurs reviennent dans toutes les copies. On part de ces erreurs pour…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC1, question par question, avec rédaction de la bonne réponse au tableau.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Barème commenté du DC1 et remédiation ciblée ; rappel : script dans un fichier externe, événements, validation champ par champ, getElementsByName, switch, while, modification du DOM. Exercices de rattrapage : Reprise du formulaire d'inscription : validation JavaScript complète (champs vides, âge, e-mail), messages d'erreur et blocage de l'envoi.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : La validation côté client améliore l'expérience, la validation côté serveur assure la sécurité : les deux sont exigées.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Terminer la validation JavaScript du formulaire et la tester avec des cas limites.",
  "trace": "La validation côté client améliore l'expérience, la validation côté serveur assure la sécurité : les deux sont exigées.",
  "erreurs": [
   "Utiliser alert() comme seule validation.",
   "Comparer avec = au lieu de == ou ==="
  ],
  "prerequis_technique": "DC1 ; JavaScript de 3e année (variables, fonctions, événements).",
  "axes": [
   "Correction et remédiation du DC1",
   "Validation JavaScript de formulaire",
   "Structures switch et while"
  ],
  "objectifs_cours": [
   "Comprendre ses erreurs et corriger sa copie du DC1.",
   "Valider un formulaire en JavaScript sans utiliser l'attribut pattern.",
   "Utiliser getElementsByName, switch et while pour modifier contenu, styles et attributs."
  ]
 },
 "14": {
  "n": 14,
  "titre": "SQL — jointures et sous-requêtes",
  "date": "2026-11-09",
  "tri": 1,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Jointure interne et condition sur clé étrangère",
     "alias de tables",
     "condition supplémentaire dans le WHERE"
    ]
   },
   {
    "titre": "Jointure sur deux et trois tables",
    "items": [
     "Écrire une jointure interne sur deux et trois tables avec alias."
    ]
   },
   {
    "titre": "Sous-requêtes non corrélées",
    "items": [
     "Écrire une sous-requête non corrélée dans la clause WHERE."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "SELECT et jointure simple (séance 6)"
  ],
  "criteres": [
   "On joint sur les clés, on filtre ensuite ; une sous-requête remplace une valeur que l'on ne connaît pas à l'avance.",
   "Produire : Trois jointures à deux tables, puis deux requêtes à trois tables sur la base du club.",
   "Éviter : Condition de jointure placée dans le WHERE après une jointure déjà filtrée."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : SELECT et jointure simple (séance 6).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "« Quels adhérents ont participé à une activité animée par un intervenant extérieur ? » Trois tables sont nécessaires ; on cherche la démarche avant la syntaxe. Présenter les consignes : Trois jointures à deux tables, puis deux requêtes à trois tables sur la base du club.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Jointure interne et condition sur clé étrangère ; alias de tables ; condition supplémentaire dans le WHERE ; sous-requêtes avec IN, =, comparaison à un agrégat ; méthode : écrire d'abord les tables, puis la condition, puis les colonnes. Assister à la correction pour chaque élève ; Quatre sous-requêtes (IN, =, > avec AVG) et vérification du résultat par une seconde écriture de la requête.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Jointure interne et condition sur clé étrangère • alias de tables • condition supplémentaire dans le WHERE • Condition de jointure placée dans le WHERE après une jointure déjà filtrée. • Sous-requête qui renvoie plusieurs lignes avec l'opérateur =.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Rédiger les requêtes de la série « jointures et sous-requêtes » pour la séance du 13 novembre.",
  "trace": "On joint sur les clés, on filtre ensuite ; une sous-requête remplace une valeur que l'on ne connaît pas à l'avance.",
  "erreurs": [
   "Condition de jointure placée dans le WHERE après une jointure déjà filtrée.",
   "Sous-requête qui renvoie plusieurs lignes avec l'opérateur =."
  ],
  "prerequis_technique": "SELECT et jointure simple (séance 6).",
  "axes": [
   "Jointure sur deux et trois tables",
   "Sous-requêtes non corrélées",
   "Méthode de construction"
  ],
  "objectifs_cours": [
   "Écrire une jointure interne sur deux et trois tables avec alias.",
   "Écrire une sous-requête non corrélée dans la clause WHERE.",
   "Construire une requête complexe pas à pas et vérifier son résultat."
  ]
 },
 "15": {
  "n": 15,
  "titre": "Série d'exercices — jointures, sous-requêtes, agrégations, fonctions de chaînes et de dates",
  "date": "2026-11-13",
  "tri": 1,
  "nature": "cours",
  "domaines": "SQL / BD · PHP / JS",
  "pages": "p. 95-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Base de données",
     "Table / relation",
     "Clé composée",
     "Relation 1:1"
    ]
   },
   {
    "titre": "PHP",
    "items": [
     "Affichage simplifié"
    ]
   },
   {
    "titre": "Jointures, sous-requêtes, agrégations",
    "items": [
     "Consolider l'écriture des requêtes multi-tables et des agrégats."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 6, 14 et 7 (chaînes, tableaux en PHP)"
  ],
  "criteres": [
   "Même besoin, trois syntaxes : savoir traduire une opération de chaîne ou de date d'un langage à l'autre.",
   "Produire : Huit exercices d'agrégation et de regroupement, corrigés au tableau à mesure.",
   "Éviter : Mélanger les noms de fonctions PHP et JavaScript."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 6, 14 et 7 (chaînes, tableaux en PHP).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Série d'exercices distribuée : chaque question est tirée d'un sujet d'examen ou d'un besoin réel du club (âges, dates d'inscription, initiales, tri alphabétique). Présenter les consignes : Huit exercices d'agrégation et de regroupement, corrigés au tableau à mesure.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "COUNT, SUM, AVG, MIN, MAX avec GROUP BY et HAVING ; fonctions de chaînes : CONCAT, UPPER, LENGTH en SQL ; strlen, substr, str_replace, explode en PHP ; length, charAt, indexOf, slice, toUpperCase en JavaScript ; date et strtotime en PHP, objet Date en JavaScript. Assister à la correction pour chaque élève ; Huit exercices sur les chaînes et les dates en PHP puis en JavaScript ; comparaison des deux syntaxes.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Mélanger les noms de fonctions PHP et JavaScript. • Oublier que les indices de chaîne commencent à 0.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Terminer la série ; les questions 13 à 16 seront ramassées.",
  "trace": "Même besoin, trois syntaxes : savoir traduire une opération de chaîne ou de date d'un langage à l'autre.",
  "erreurs": [
   "Mélanger les noms de fonctions PHP et JavaScript.",
   "Oublier que les indices de chaîne commencent à 0."
  ],
  "prerequis_technique": "Séances 6, 14 et 7 (chaînes, tableaux en PHP).",
  "axes": [
   "Jointures, sous-requêtes, agrégations",
   "Fonctions de chaînes",
   "Fonctions de dates"
  ],
  "objectifs_cours": [
   "Consolider l'écriture des requêtes multi-tables et des agrégats.",
   "Utiliser les fonctions de chaînes en SQL, en PHP et en JavaScript.",
   "Formater et calculer sur des dates en PHP et en JavaScript."
  ]
 },
 "16": {
  "n": 16,
  "titre": "Devoir de contrôle n°2",
  "date": "2026-11-16",
  "tri": 1,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "PHP–MySQL en situation",
    "items": [
     "Évaluer la capacité à faire communiquer un formulaire, PHP et la base."
    ]
   },
   {
    "titre": "JavaScript de validation",
    "items": [
     "Vérifier la maîtrise des requêtes multi-tables et des agrégats."
    ]
   },
   {
    "titre": "SQL : jointures, sous-requêtes, agrégats",
    "items": [
     "Contrôler la qualité du code produit (lisibilité, contrôles, test)."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 7 à 15"
  ],
  "criteres": [
   "Barème : chaque partie est indépendante ; une partie non terminée ne doit pas empêcher de traiter les autres.",
   "Produire : Parties 1 et 2 sur machine, dans l'ordre choisi par l'élève.",
   "Éviter : Script PHP non testé faute de temps."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Partie 1 : formulaire, contrôle de saisie, connexion, INSERT, UPDATE, DELETE, affichage et recherche. Partie 2 …",
    "eleves": "• Écoutent les consignes • Préparent la machine et le matériel",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Distribuer le sujet ; répondre uniquement aux questions de forme.",
    "eleves": "• Lisent le sujet • Repèrent les parties et l'ordre de traitement",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Épreuve",
    "duree": 100,
    "prof": "Parties 1 et 2 sur machine, dans l'ordre choisi par l'élève. Partie 3 (SQL) sur la base d'examen, requêtes à écrire et à tester.",
    "eleves": "• Composent • Testent leur production • Gèrent leur temps",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Ramasser les copies et les fichiers ; recueillir les impressions à chaud.",
    "eleves": "• Enregistrent et rendent • Expriment les difficultés rencontrées",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Aucun ; relire les fiches 7 à 15 avant la correction.",
  "trace": "Barème : chaque partie est indépendante ; une partie non terminée ne doit pas empêcher de traiter les autres.",
  "erreurs": [
   "Script PHP non testé faute de temps.",
   "Agrégat utilisé sans GROUP BY cohérent."
  ],
  "prerequis_technique": "Séances 7 à 15.",
  "axes": [
   "PHP–MySQL en situation",
   "JavaScript de validation",
   "SQL : jointures, sous-requêtes, agrégats"
  ],
  "objectifs_cours": [
   "Évaluer la capacité à faire communiquer un formulaire, PHP et la base.",
   "Vérifier la maîtrise des requêtes multi-tables et des agrégats.",
   "Contrôler la qualité du code produit (lisibilité, contrôles, test)."
  ]
 },
 "17": {
  "n": 17,
  "titre": "Correction du DC2 et remédiation",
  "date": "2026-11-20",
  "tri": 1,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DC2",
    "items": [
     "Identifier la cause exacte de chaque erreur du DC2."
    ]
   },
   {
    "titre": "Requêtes et scripts en erreur",
    "items": [
     "Corriger une requête SQL et un script PHP fautifs."
    ]
   },
   {
    "titre": "Remédiation individualisée",
    "items": [
     "Fixer un objectif personnel mesurable pour la suite du trimestre."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC2 (séance 16)"
  ],
  "criteres": [
   "Trois réflexes avant de rendre : tester, relire la consigne, vérifier le résultat affiché.",
   "Produire : Correction guidée, partie par partie, avec réécriture au tableau des requêtes et scripts…",
   "Éviter : Recopier la correction sans comprendre la cause."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies sont rendues avec le barème détaillé ; chaque élève doit classer ses erreurs en trois familles …",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée, partie par partie, avec réécriture au tableau des requêtes et scripts attendus.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Analyse des erreurs dominantes : connexion non testée, requête sans condition, agrégat mal groupé, formulaire non contrôlé ; méthode de vérification avant de rendre. Exercices de rattrapage : Exercices de rattrapage ciblés selon les trois familles d'erreurs ; entretien individuel avec six élèves.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Trois réflexes avant de rendre : tester, relire la consigne, vérifier le résultat affiché.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Reprendre intégralement le script de la partie 1 et le rapporter corrigé.",
  "trace": "Trois réflexes avant de rendre : tester, relire la consigne, vérifier le résultat affiché.",
  "erreurs": [
   "Recopier la correction sans comprendre la cause.",
   "Ne pas tester après correction."
  ],
  "prerequis_technique": "DC2 (séance 16).",
  "axes": [
   "Correction du DC2",
   "Requêtes et scripts en erreur",
   "Remédiation individualisée"
  ],
  "objectifs_cours": [
   "Identifier la cause exacte de chaque erreur du DC2.",
   "Corriger une requête SQL et un script PHP fautifs.",
   "Fixer un objectif personnel mesurable pour la suite du trimestre."
  ]
 },
 "18": {
  "n": 18,
  "titre": "JavaScript — les objets natifs : String, Date, Array, Number et Math",
  "date": "2026-11-23",
  "tri": 1,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 91-94",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "String : length, charAt, indexOf, slice, toUpperCase, replace",
     "Date : new Date(), getDate, getDay, getMonth, getFullYear, toLocaleDateString",
     "Array : length, parcours, push, join"
    ]
   },
   {
    "titre": "Objets String et Date",
    "items": [
     "Manipuler les méthodes usuelles des objets String et Date."
    ]
   },
   {
    "titre": "Objets Array, Number et Math",
    "items": [
     "Parcourir un tableau et utiliser les méthodes de Math."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "JavaScript de 3e année : variables, fonctions, événements (séance 13 pour la validation)"
  ],
  "criteres": [
   "Un objet natif = des données + des méthodes prêtes à l'emploi ; les indices commencent à 0 et les mois aussi.",
   "Produire : Trois mini-programmes guidés : initiales d'un nom, date du jour en français, tirage au…",
   "Éviter : Oublier les parenthèses de new Date()."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : JavaScript de 3e année : variables, fonctions, événements (séance 13 pour la validation).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le club veut afficher automatiquement la date du jour au format jj/mm/aaaa et tirer au sort le nom d'un volontaire : deux besoins, deux objets natifs. Présenter les consignes : Trois mini-programmes guidés : initiales d'un nom, date du jour en français, tirage au sort dans une liste d'adhérents.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "String : length, charAt, indexOf, slice, toUpperCase, replace ; Date : new Date(), getDate, getDay, getMonth, getFullYear, toLocaleDateString ; Array : length, parcours, push, join ; Number : conversions, parseInt, parseFloat ; Math : round, floor, ceil, abs, random. Assister à la correction pour chaque élève ; Exercice : statistiques simples sur un tableau de notes (moyenne, note maximale, arrondi) avec affichage dans la page.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • String : length, charAt, indexOf, slice, toUpperCase, replace • Date : new Date(), getDate, getDay, getMonth, getFullYear… • Array : length, parcours, push, join • Oublier les parenthèses de new Date(). • getMonth() utilisé sans ajouter 1 à l'affichage.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Terminer les trois mini-programmes ; préparer la série d'exercices du 27 novembre.",
  "trace": "Un objet natif = des données + des méthodes prêtes à l'emploi ; les indices commencent à 0 et les mois aussi.",
  "erreurs": [
   "Oublier les parenthèses de new Date().",
   "getMonth() utilisé sans ajouter 1 à l'affichage."
  ],
  "prerequis_technique": "JavaScript de 3e année : variables, fonctions, événements (séance 13 pour la validation).",
  "axes": [
   "Objets String et Date",
   "Objets Array, Number et Math",
   "Applications concrètes"
  ],
  "objectifs_cours": [
   "Manipuler les méthodes usuelles des objets String et Date.",
   "Parcourir un tableau et utiliser les méthodes de Math.",
   "Choisir l'objet natif adapté au besoin d'un programme."
  ]
 },
 "19": {
  "n": 19,
  "titre": "JavaScript — série d'exercices : fonctions, événements et objets natifs",
  "date": "2026-11-27",
  "tri": 1,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 91-94",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "Déclaration et appel de fonctions, paramètres, return, portée locale et globale",
     "événements onclick, onchange, onkeyup, onmouseover, onsubmit",
     "rappel des objets natifs"
    ]
   },
   {
    "titre": "Fonctions et portée",
    "items": [
     "Écrire et appeler des fonctions avec paramètres et valeur de retour."
    ]
   },
   {
    "titre": "Événements",
    "items": [
     "Associer le bon événement au bon traitement."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 13 et 18"
  ],
  "criteres": [
   "Une fonction qui ne retourne rien ne peut pas être réutilisée dans un calcul ; l'événement choisi détermine le moment du traitement.",
   "Produire : Six exercices guidés : fonction de calcul, fonction de contrôle de saisie, compteur avec…",
   "Éviter : Variable globale utilisée sans nécessité."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 13 et 18.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Série d'exercices distribuée, présentée comme un entraînement chronométré aux questions de JavaScript du devoir de synthèse. Présenter les consignes : Six exercices guidés : fonction de calcul, fonction de contrôle de saisie, compteur avec événement, changement de style au survol.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Déclaration et appel de fonctions, paramètres, return, portée locale et globale ; événements onclick, onchange, onkeyup, onmouseover, onsubmit ; rappel des objets natifs ; relecture des erreurs classiques. Assister à la correction pour chaque élève ; Six exercices en autonomie issus de sujets d'examen, correction croisée entre binômes puis validation au tableau.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Déclaration et appel de fonctions, paramètres, return, portée locale… • événements onclick, onchange, onkeyup, onmouseover, onsubmit • rappel des objets natifs • Variable globale utilisée sans nécessité. • onclick sur un élément chargé après le script (script sans defer).",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Finir la série ; noter les deux exercices non réussis pour la révision du 4 décembre.",
  "trace": "Une fonction qui ne retourne rien ne peut pas être réutilisée dans un calcul ; l'événement choisi détermine le moment du traitement.",
  "erreurs": [
   "Variable globale utilisée sans nécessité.",
   "onclick sur un élément chargé après le script (script sans defer)."
  ],
  "prerequis_technique": "Séances 13 et 18.",
  "axes": [
   "Fonctions et portée",
   "Événements",
   "Objets natifs en exercices"
  ],
  "objectifs_cours": [
   "Écrire et appeler des fonctions avec paramètres et valeur de retour.",
   "Associer le bon événement au bon traitement.",
   "Résoudre une série d'exercices mêlant fonctions, événements et objets natifs."
  ]
 },
 "20": {
  "n": 20,
  "titre": "CSS3 — états, sélecteurs d'attributs et transformations",
  "date": "2026-11-30",
  "tri": 1,
  "nature": "cours",
  "domaines": "CSS3 / HTML5",
  "pages": "p. 87-90, 83-85",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     "Pseudo-classes : link, visited, hover, focus, active",
     "sélecteurs d'attributs : élément[attribut], élément[attribut=valeur]",
     "transform : translate, rotate, scale"
    ]
   },
   {
    "titre": "HTML5",
    "items": [
     "Pseudo-classes : link, visited, hover, focus, active",
     "sélecteurs d'attributs : élément[attribut], élément[attribut=valeur]",
     "transform : translate, rotate, scale"
    ]
   },
   {
    "titre": "Pseudo-classes de lien et d'état",
    "items": [
     "Styler un lien et un champ selon leur état (:link, :visited, :hover, :focus)."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 2 et 3 (sélecteurs, positionnement)"
  ],
  "criteres": [
   "Les pseudo-classes remplacent une partie du JavaScript d'autrefois ; l'ordre LVHA (link, visited, hover, active) évite les conflits.",
   "Produire : Mise en forme complète du menu (états des liens) et des champs du formulaire (focus…",
   "Éviter : Ordre des pseudo-classes incorrect : hover sans effet."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 2 et 3 (sélecteurs, positionnement).",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un menu dont les liens ne réagissent pas au survol et un champ sans retour visuel au focus : les élèves doivent rendre la page « vivante » sans JavaScript. Présenter les consignes : Mise en forme complète du menu (états des liens) et des champs du formulaire (focus, hover).",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Pseudo-classes : link, visited, hover, focus, active ; sélecteurs d'attributs : élément[attribut], élément[attribut=valeur] ; transform : translate, rotate, scale ; <datalist> ; onkeydown, onkeyup, onmouseover, onmouseout. Assister à la correction pour chaque élève ; Carte de visite animée : transformation au survol, datalist pour la ville, compteur de caractères avec onkeyup.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Pseudo-classes : link, visited, hover, focus, active • sélecteurs d'attributs : élément[attribut], élément[attribut=valeur] • transform : translate, rotate, scale • Ordre des pseudo-classes incorrect : hover sans effet. • Confondre transform et transition.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   }
  ],
  "maison": "Appliquer les états et transformations à la page du projet personnel.",
  "trace": "Les pseudo-classes remplacent une partie du JavaScript d'autrefois ; l'ordre LVHA (link, visited, hover, active) évite les conflits.",
  "erreurs": [
   "Ordre des pseudo-classes incorrect : hover sans effet.",
   "Confondre transform et transition."
  ],
  "prerequis_technique": "Séances 2 et 3 (sélecteurs, positionnement).",
  "axes": [
   "Pseudo-classes de lien et d'état",
   "Sélecteurs d'attributs",
   "Transformations et événements HTML5"
  ],
  "objectifs_cours": [
   "Styler un lien et un champ selon leur état (:link, :visited, :hover, :focus).",
   "Cibler un élément par la valeur d'un de ses attributs.",
   "Appliquer une transformation et exploiter datalist et les événements clavier et souris."
  ]
 },
 "21": {
  "n": 21,
  "titre": "Révision générale du trimestre et préparation du DS1",
  "date": "2026-12-04",
  "tri": 1,
  "nature": "cours",
  "domaines": "Révision",
  "pages": "p. 83-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS3 et JavaScript",
    "items": [
     "Réviser l'ensemble des notions du trimestre sous forme d'exercices."
    ]
   },
   {
    "titre": "SQL et PHP–MySQL",
    "items": [
     "Traiter un sujet type de devoir de synthèse en temps limité."
    ]
   },
   {
    "titre": "Méthode d'épreuve",
    "items": [
     "Repérer ses points faibles avant l'épreuve du 7 décembre."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 20"
  ],
  "criteres": [
   "Un devoir de synthèse se prépare en s'entraînant sur un sujet complet, pas en relisant le cours.",
   "Produire : Traitement du sujet type en temps limité (90 min), sans aide, dans les conditions de…",
   "Éviter : Arriver sans avoir relu les requêtes SQL."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 1 à 20.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Annonce de la semaine bloquée et du devoir de synthèse du 7 décembre ; le contrat de la séance est de traiter un sujet complet en 90 minutes. Présenter les consignes : Traitement du sujet type en temps limité (90 min), sans aide, dans les conditions de l'épreuve.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rappels express : positionnement et transform, validation JavaScript et objets natifs, requêtes SQL (agrégats, jointures, sous-requêtes), chaîne formulaire → PHP → base. Assister à la correction pour chaque élève ; Autocorrection au barème, puis reprise ciblée des deux questions les moins réussies.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Rappels express : positionnement et transform, validation JavaScript… • Affichage simplifié • Arriver sans avoir relu les requêtes SQL. • Sacrifier la partie pratique par manque de gestion du temps.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse"
   }
  ],
  "maison": "Réviser les fiches 1 à 20 ; le devoir de synthèse n°1 a lieu le lundi 7 décembre.",
  "trace": "Un devoir de synthèse se prépare en s'entraînant sur un sujet complet, pas en relisant le cours.",
  "erreurs": [
   "Arriver sans avoir relu les requêtes SQL.",
   "Sacrifier la partie pratique par manque de gestion du temps."
  ],
  "prerequis_technique": "Séances 1 à 20.",
  "axes": [
   "CSS3 et JavaScript",
   "SQL et PHP–MySQL",
   "Méthode d'épreuve"
  ],
  "objectifs_cours": [
   "Réviser l'ensemble des notions du trimestre sous forme d'exercices.",
   "Traiter un sujet type de devoir de synthèse en temps limité.",
   "Repérer ses points faibles avant l'épreuve du 7 décembre."
  ]
 },
 "22": {
  "n": 22,
  "titre": "Correction du DS1 et bilan du 1er trimestre",
  "date": "2026-12-28",
  "tri": 1,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DS1",
    "items": [
     "Comprendre le barème et les attentes du devoir de synthèse."
    ]
   },
   {
    "titre": "Bilan du 1er trimestre",
    "items": [
     "Faire le bilan de son trimestre et fixer deux objectifs pour le 2e."
    ]
   },
   {
    "titre": "Méthode de travail en sujets de bac",
    "items": [
     "Comprendre la méthode de travail qui structure le 2e trimestre (sujets de bac)."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Devoir de synthèse n°1 (semaine bloquée du 7 au 12 décembre)"
  ],
  "criteres": [
   "Le 2e trimestre s'apprend sur les sujets d'examen : on corrige, on comprend le barème, on recommence.",
   "Produire : Correction guidée du DS1, question par question ; chaque élève note la cause de sa perte…",
   "Éviter : Ne pas identifier la cause de ses erreurs."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Copies du DS1 rendues avec le barème officiel ; projection de deux copies anonymes (une réussie, une…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DS1, question par question ; chaque élève note la cause de sa perte de points.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction et commentaire du barème ; synthèse des erreurs récurrentes ; présentation du 2e trimestre : correction de sujets théoriques et pratiques du baccalauréat. Exercices de rattrapage : Bilan individuel : moyenne, points forts, deux objectifs écrits ; présentation du calendrier du 2e trimestre et du rythme de travail.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Le 2e trimestre s'apprend sur les sujets d'examen : on corrige, on comprend le barème, on recommence.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Choisir un sujet de bac pratique et le lire intégralement avant le 4 janvier.",
  "trace": "Le 2e trimestre s'apprend sur les sujets d'examen : on corrige, on comprend le barème, on recommence.",
  "erreurs": [
   "Ne pas identifier la cause de ses erreurs.",
   "Confondre le devoir de synthèse et le contrôle continu."
  ],
  "prerequis_technique": "Devoir de synthèse n°1 (semaine bloquée du 7 au 12 décembre).",
  "axes": [
   "Correction du DS1",
   "Bilan du 1er trimestre",
   "Méthode de travail en sujets de bac"
  ],
  "objectifs_cours": [
   "Comprendre le barème et les attentes du devoir de synthèse.",
   "Faire le bilan de son trimestre et fixer deux objectifs pour le 2e.",
   "Comprendre la méthode de travail qui structure le 2e trimestre (sujets de bac)."
  ]
 },
 "23": {
  "n": 23,
  "titre": "Bases de données — contraintes d'intégrité et correction de représentations",
  "date": "2027-01-04",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 95",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Cardinalités",
     "Base de données",
     "Table / relation",
     "Clé composée"
    ]
   },
   {
    "titre": "Contraintes de domaine, de table, référentielle",
    "items": [
     "Identifier les trois familles de contraintes et leur rôle."
    ]
   },
   {
    "titre": "Représentation graphique et textuelle",
    "items": [
     "Convertir une représentation graphique en représentation textuelle et inversement."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Modèle relationnel et LDD (séance 4)",
   "le 1er trimestre a introduit les jointures (séance 14)"
  ],
  "criteres": [
   "Un schéma se lit dans l'ordre : entités, identifiants, associations, cardinalités, contraintes — et chaque clé étrangère doit correspondre à une clé primaire existante.",
   "Produire : Correction collective du schéma piégé, puis conversion graphique → textuelle.",
   "Éviter : Confondre cardinalité et clé étrangère."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Modèle relationnel et LDD (séance 4) ; le 1er trimestre a introduit les jointures (séance 14).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un schéma de base fourni comporte trois défauts volontaires (clé étrangère oubliée, cardinalité fausse, champ non atomique). Les élèves ont dix minutes pour les trouver. Présenter les consignes : Correction collective du schéma piégé, puis conversion graphique → textuelle.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rappel des contraintes et de leur écriture SQL ; conventions d'écriture (clé primaire soulignée, clé étrangère suivie de #) ; méthode de relecture d'un schéma : entités, clés, associations, cardinalités, contraintes. Assister à la correction pour chaque élève ; Deux schémas extraits de sujets de bac : détection d'anomalies, correction et justification écrite.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Cardinalités • Base de données • Table / relation • Confondre cardinalité et clé étrangère. • Laisser un champ composé (adresse complète) dans une seule colonne.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Corriger le troisième schéma distribué et rédiger la justification en trois lignes.",
  "trace": "Un schéma se lit dans l'ordre : entités, identifiants, associations, cardinalités, contraintes — et chaque clé étrangère doit correspondre à une clé primaire existante.",
  "erreurs": [
   "Confondre cardinalité et clé étrangère.",
   "Laisser un champ composé (adresse complète) dans une seule colonne."
  ],
  "prerequis_technique": "Modèle relationnel et LDD (séance 4) ; le 1er trimestre a introduit les jointures (séance 14).",
  "axes": [
   "Contraintes de domaine, de table, référentielle",
   "Représentation graphique et textuelle",
   "Détection et correction d'anomalies"
  ],
  "objectifs_cours": [
   "Identifier les trois familles de contraintes et leur rôle.",
   "Convertir une représentation graphique en représentation textuelle et inversement.",
   "Détecter les anomalies d'un schéma proposé et le corriger."
  ]
 },
 "24": {
  "n": 24,
  "titre": "Sujets théoriques de bac (2020 et 2021) — correction commentée",
  "date": "2027-01-08",
  "tri": 2,
  "nature": "cours",
  "domaines": "Bac théorique",
  "pages": "p. 95-96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Questions de cours",
    "items": [
     "Se confronter à la forme exacte des questions théoriques du bac."
    ]
   },
   {
    "titre": "Schéma et contraintes",
    "items": [
     "Comparer ses réponses au barème officiel."
    ]
   },
   {
    "titre": "Requêtes SQL du sujet",
    "items": [
     "Repérer les questions à rédiger (justification) et celles à calculer."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séance 23",
   "SQL du 1er trimestre"
  ],
  "criteres": [
   "Une question théorique se répond avec le vocabulaire du cours : « clé étrangère », « contrainte d'intégrité référentielle », pas avec des périphrases.",
   "Produire : Traitement du sujet 2020 en 40 minutes, conditions réelles.",
   "Éviter : Répondre par un exemple au lieu d'une définition."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séance 23 ; SQL du 1er trimestre.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Les sujets 2020 et 2021 sont distribués en deux rotations : la moitié de la classe traite l'un, l'autre moitié l'autre, puis on échange les corrigés. Présenter les consignes : Traitement du sujet 2020 en 40 minutes, conditions réelles.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Structure d'un sujet théorique de STI : questions de cours, schéma à compléter ou à corriger, écriture de requêtes ; attentes du correcteur : vocabulaire exact, requête syntaxiquement valide, justification. Assister à la correction pour chaque élève ; Correction commentée au barème, puis traitement du sujet 2021 en autonomie et échange des corrigés entre binômes.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Répondre par un exemple au lieu d'une définition. • Requête écrite sans respecter la casse et la ponctuation.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujet du bac · barème · copies"
   }
  ],
  "maison": "Rédiger proprement la question de schéma du sujet 2021 pour la séance du 15 janvier.",
  "trace": "Une question théorique se répond avec le vocabulaire du cours : « clé étrangère », « contrainte d'intégrité référentielle », pas avec des périphrases.",
  "erreurs": [
   "Répondre par un exemple au lieu d'une définition.",
   "Requête écrite sans respecter la casse et la ponctuation."
  ],
  "prerequis_technique": "Séance 23 ; SQL du 1er trimestre.",
  "axes": [
   "Questions de cours",
   "Schéma et contraintes",
   "Requêtes SQL du sujet"
  ],
  "objectifs_cours": [
   "Se confronter à la forme exacte des questions théoriques du bac.",
   "Comparer ses réponses au barème officiel.",
   "Repérer les questions à rédiger (justification) et celles à calculer."
  ]
 },
 "25": {
  "n": 25,
  "titre": "SQL — fonctions d'agrégat et regroupements",
  "date": "2027-01-11",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Fonctions d'agrégat",
     "GROUP BY sur une ou deux colonnes",
     "ordre logique d'exécution (FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY)."
    ]
   },
   {
    "titre": "COUNT, SUM, AVG, MIN, MAX",
    "items": [
     "Choisir l'agrégat adapté à la question posée."
    ]
   },
   {
    "titre": "GROUP BY",
    "items": [
     "Grouper les résultats et filtrer sur le groupe."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "SELECT et jointures (séances 6, 14 et 15)"
  ],
  "criteres": [
   "WHERE filtre avant le regroupement, HAVING après ; toute colonne non agrégée du SELECT doit figurer dans le GROUP BY.",
   "Produire : Six requêtes d'agrégation simple sur la base du club (effectifs, moyennes, extrêmes).",
   "Éviter : HAVING utilisé à la place de WHERE."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : SELECT et jointures (séances 6, 14 et 15).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "« Combien d'adhérents par niveau, et quelle est la moyenne d'âge des groupes de plus de cinq personnes ? » Deux questions, deux niveaux de filtrage. Présenter les consignes : Six requêtes d'agrégation simple sur la base du club (effectifs, moyennes, extrêmes).",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Fonctions d'agrégat ; GROUP BY sur une ou deux colonnes ; HAVING ; ordre logique d'exécution (FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY). Assister à la correction pour chaque élève ; Quatre requêtes avec GROUP BY et HAVING ; comparaison d'un même besoin écrit avec WHERE puis avec HAVING pour faire apparaître la différence.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Fonctions d'agrégat • GROUP BY sur une ou deux colonnes • ordre logique d'exécution (FROM, WHERE, GROUP BY, HAVING, SELECT… • HAVING utilisé à la place de WHERE. • Colonne du SELECT absente du GROUP BY.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Écrire les cinq requêtes d'agrégation de la série ; elles seront réutilisées dans le sujet 2022.",
  "trace": "WHERE filtre avant le regroupement, HAVING après ; toute colonne non agrégée du SELECT doit figurer dans le GROUP BY.",
  "erreurs": [
   "HAVING utilisé à la place de WHERE.",
   "Colonne du SELECT absente du GROUP BY."
  ],
  "prerequis_technique": "SELECT et jointures (séances 6, 14 et 15).",
  "axes": [
   "COUNT, SUM, AVG, MIN, MAX",
   "GROUP BY",
   "HAVING et différence avec WHERE"
  ],
  "objectifs_cours": [
   "Choisir l'agrégat adapté à la question posée.",
   "Grouper les résultats et filtrer sur le groupe.",
   "Distinguer WHERE (filtre de lignes) et HAVING (filtre de groupes)."
  ]
 },
 "26": {
  "n": 26,
  "titre": "Sujet théorique de bac 2022 — correction et série SQL",
  "date": "2027-01-15",
  "tri": 2,
  "nature": "cours",
  "domaines": "Bac théorique · SQL",
  "pages": "p. 96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Correction commentée du sujet 2022 : agrégats, jointures et sous-requêtes",
     "méthode d'écriture d'une requête complexe (tables, liaison, filtre, colonnes, tri)."
    ]
   },
   {
    "titre": "Correction du sujet 2022",
    "items": [
     "Analyser un sujet théorique complet et son barème."
    ]
   },
   {
    "titre": "Série SQL ciblée",
    "items": [
     "Écrire les requêtes du sujet sans aide."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 24 et 25"
  ],
  "criteres": [
   "Une requête complexe s'écrit dans un ordre fixe : les tables, la liaison, le filtre, les colonnes, le tri.",
   "Produire : Correction guidée des questions de schéma et de cours du sujet 2022.",
   "Éviter : Jointure oubliée alors que la question porte sur deux tables."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 24 et 25.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le sujet 2022 est projeté ; les élèves découvrent d'abord les questions, puis proposent un ordre de traitement et une estimation du temps. Présenter les consignes : Correction guidée des questions de schéma et de cours du sujet 2022.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Correction commentée du sujet 2022 : agrégats, jointures et sous-requêtes ; méthode d'écriture d'une requête complexe (tables, liaison, filtre, colonnes, tri). Assister à la correction pour chaque élève ; Série de six requêtes du même type en autonomie, avec corrigé distribué en fin de séance et auto-évaluation.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Correction commentée du sujet 2022 : agrégats, jointures et… • méthode d'écriture d'une requête complexe (tables, liaison, filtre… • Jointure oubliée alors que la question porte sur deux tables. • Agrégat mélangé à une colonne non groupée.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujet du bac · barème · copies"
   }
  ],
  "maison": "Refaire sans aide les deux requêtes les moins réussies de la série.",
  "trace": "Une requête complexe s'écrit dans un ordre fixe : les tables, la liaison, le filtre, les colonnes, le tri.",
  "erreurs": [
   "Jointure oubliée alors que la question porte sur deux tables.",
   "Agrégat mélangé à une colonne non groupée."
  ],
  "prerequis_technique": "Séances 24 et 25.",
  "axes": [
   "Correction du sujet 2022",
   "Série SQL ciblée",
   "Erreurs récurrentes"
  ],
  "objectifs_cours": [
   "Analyser un sujet théorique complet et son barème.",
   "Écrire les requêtes du sujet sans aide.",
   "Identifier ses erreurs récurrentes en SQL."
  ]
 },
 "27": {
  "n": 27,
  "titre": "BD — évolution de la structure et import / export SQL",
  "date": "2027-01-18",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 95-96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Base de données",
     "Table / relation",
     "Clé composée",
     "Relation 1:1"
    ]
   },
   {
    "titre": "ALTER TABLE : ajouter, modifier, supprimer",
    "items": [
     "Faire évoluer la structure d'une table sans perdre les données."
    ]
   },
   {
    "titre": "DROP TABLE / DROP DATABASE",
    "items": [
     "Supprimer tables et base dans le bon ordre."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "LDD et LMD (séances 4 et 5)"
  ],
  "criteres": [
   "On modifie d'abord la structure, puis les données ; on sauvegarde toujours avant un DROP.",
   "Produire : Trois évolutions de structure guidées : ajout de colonne, modification de type, ajout…",
   "Éviter : DROP de la table référencée avant la table qui la référence."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : LDD et LMD (séances 4 et 5).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le club ajoute un champ « date d'inscription » et supprime une table devenue inutile : comment faire sans casser la base en production ? Présenter les consignes : Trois évolutions de structure guidées : ajout de colonne, modification de type, ajout d'une contrainte.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "ALTER TABLE ... ADD / MODIFY / DROP ; ADD CONSTRAINT et DROP CONSTRAINT ; DROP TABLE, DROP DATABASE ; ordre des opérations et dépendances ; export et import de fichiers .sql (structure et données). Assister à la correction pour chaque élève ; Suppression ordonnée de deux tables liées, export complet de la base, restauration dans une seconde base et vérification par COUNT.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • DROP de la table référencée avant la table qui la référence. • ALTER sans vérifier les données existantes (troncature silencieuse).",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Rédiger le script d'évolution de la base d'examen (trois instructions) et l'exporter.",
  "trace": "On modifie d'abord la structure, puis les données ; on sauvegarde toujours avant un DROP.",
  "erreurs": [
   "DROP de la table référencée avant la table qui la référence.",
   "ALTER sans vérifier les données existantes (troncature silencieuse)."
  ],
  "prerequis_technique": "LDD et LMD (séances 4 et 5).",
  "axes": [
   "ALTER TABLE : ajouter, modifier, supprimer",
   "DROP TABLE / DROP DATABASE",
   "Import et export SQL"
  ],
  "objectifs_cours": [
   "Faire évoluer la structure d'une table sans perdre les données.",
   "Supprimer tables et base dans le bon ordre.",
   "Exporter et restaurer une base au format SQL."
  ]
 },
 "28": {
  "n": 28,
  "titre": "Sujets théoriques de bac (2023 et 2024) — correction commentée",
  "date": "2027-01-22",
  "tri": 2,
  "nature": "cours",
  "domaines": "Bac théorique",
  "pages": "p. 95-96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Sujets 2023 et 2024",
    "items": [
     "Traiter deux sujets théoriques récents dans les conditions de l'épreuve."
    ]
   },
   {
    "titre": "Requêtes complètes",
    "items": [
     "Écrire des requêtes complètes (jointures, sous-requêtes, agrégats)."
    ]
   },
   {
    "titre": "Attentes du correcteur",
    "items": [
     "Formuler une synthèse des attentes du correcteur."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 23 à 27"
  ],
  "criteres": [
   "Les sujets se ressemblent : la même famille de questions revient chaque année, seule la base change.",
   "Produire : Sujet 2023 en 40 minutes, en conditions réelles.",
   "Éviter : Perdre du temps sur une question à faible barème."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 23 à 27.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Les deux sujets sont traités en temps limité, puis corrigés au barème ; la classe construit collectivement une fiche « ce que le correcteur attend ». Présenter les consignes : Sujet 2023 en 40 minutes, en conditions réelles.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Correction commentée des sujets 2023 et 2024 ; mise en évidence des questions récurrentes (schéma, contraintes, requêtes) et de leur formulation. Assister à la correction pour chaque élève ; Correction croisée du sujet 2024, puis rédaction collective de la fiche des attentes du correcteur (six règles).",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Perdre du temps sur une question à faible barème. • Ne pas justifier les clés dans la question de schéma.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujet du bac · barème · copies"
   }
  ],
  "maison": "Apprendre la fiche des attentes du correcteur et réviser pour le DC3 du 25 janvier.",
  "trace": "Les sujets se ressemblent : la même famille de questions revient chaque année, seule la base change.",
  "erreurs": [
   "Perdre du temps sur une question à faible barème.",
   "Ne pas justifier les clés dans la question de schéma."
  ],
  "prerequis_technique": "Séances 23 à 27.",
  "axes": [
   "Sujets 2023 et 2024",
   "Requêtes complètes",
   "Attentes du correcteur"
  ],
  "objectifs_cours": [
   "Traiter deux sujets théoriques récents dans les conditions de l'épreuve.",
   "Écrire des requêtes complètes (jointures, sous-requêtes, agrégats).",
   "Formuler une synthèse des attentes du correcteur."
  ]
 },
 "29": {
  "n": 29,
  "titre": "Devoir de contrôle n°3",
  "date": "2027-01-25",
  "tri": 2,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "BD et contraintes",
    "items": [
     "Évaluer la maîtrise des bases de données et du SQL."
    ]
   },
   {
    "titre": "SQL : agrégats, jointures, sous-requêtes",
    "items": [
     "Vérifier la capacité à corriger un schéma et à écrire des requêtes complètes."
    ]
   },
   {
    "titre": "LDD et import / export",
    "items": [
     "Préparer la séquence de sujets pratiques, qui commence le 8 février."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 23 à 28"
  ],
  "criteres": [
   "Barème : schéma 30 %, requêtes 50 %, évolution de structure et import / export 20 %.",
   "Produire : Partie théorique sur copie : schéma, contraintes, justification des clés.",
   "Éviter : Schéma corrigé sans justification."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Partie théorique : représentation d'une BDR, contraintes d'intégrité, schéma à corriger. Partie pratique : CREATE /…",
    "eleves": "• Écoutent les consignes • Préparent la machine et le matériel",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Distribuer le sujet ; répondre uniquement aux questions de forme.",
    "eleves": "• Lisent le sujet • Repèrent les parties et l'ordre de traitement",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Épreuve",
    "duree": 100,
    "prof": "Partie théorique sur copie : schéma, contraintes, justification des clés. Partie pratique sur machine : évolution de structure et cinq requêtes à tester.",
    "eleves": "• Composent • Testent leur production • Gèrent leur temps",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Ramasser les copies et les fichiers ; recueillir les impressions à chaud.",
    "eleves": "• Enregistrent et rendent • Expriment les difficultés rencontrées",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Aucun ; relire les fiches 23 à 28 avant la correction.",
  "trace": "Barème : schéma 30 %, requêtes 50 %, évolution de structure et import / export 20 %.",
  "erreurs": [
   "Schéma corrigé sans justification.",
   "Requête testée mais résultat non vérifié."
  ],
  "prerequis_technique": "Séances 23 à 28.",
  "axes": [
   "BD et contraintes",
   "SQL : agrégats, jointures, sous-requêtes",
   "LDD et import / export"
  ],
  "objectifs_cours": [
   "Évaluer la maîtrise des bases de données et du SQL.",
   "Vérifier la capacité à corriger un schéma et à écrire des requêtes complètes.",
   "Préparer la séquence de sujets pratiques, qui commence le 8 février."
  ]
 },
 "30": {
  "n": 30,
  "titre": "Correction du DC3 et remédiation",
  "date": "2027-01-29",
  "tri": 2,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DC3",
    "items": [
     "Comprendre chaque point perdu au DC3."
    ]
   },
   {
    "titre": "Requêtes et schémas fautifs",
    "items": [
     "Corriger un schéma et des requêtes fautives."
    ]
   },
   {
    "titre": "Remédiation ciblée",
    "items": [
     "Fixer un objectif avant la séquence de bacs pratiques."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC3 (séance 29)"
  ],
  "criteres": [
   "Une erreur de schéma coûte plus cher qu'une erreur de syntaxe : elle entraîne toutes les requêtes suivantes.",
   "Produire : Correction guidée du DC3 avec réécriture au tableau des requêtes attendues.",
   "Éviter : Corriger au hasard sans justifier."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Copies rendues avec le barème ; classement des erreurs en trois familles (schéma, requête, méthode) pour…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC3 avec réécriture au tableau des requêtes attendues.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Analyse des erreurs dominantes ; rappel de la méthode d'écriture d'une requête ; points de vigilance sur les contraintes et les cardinalités. Exercices de rattrapage : Batterie de rattrapage : trois schémas à corriger et quatre requêtes à écrire ; entretiens individuels.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Une erreur de schéma coûte plus cher qu'une erreur de syntaxe : elle entraîne toutes les requêtes suivantes.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Reprendre la partie théorique du DC3 à la maison.",
  "trace": "Une erreur de schéma coûte plus cher qu'une erreur de syntaxe : elle entraîne toutes les requêtes suivantes.",
  "erreurs": [
   "Corriger au hasard sans justifier.",
   "Négliger l'ordre des tables dans la jointure."
  ],
  "prerequis_technique": "DC3 (séance 29).",
  "axes": [
   "Correction du DC3",
   "Requêtes et schémas fautifs",
   "Remédiation ciblée"
  ],
  "objectifs_cours": [
   "Comprendre chaque point perdu au DC3.",
   "Corriger un schéma et des requêtes fautives.",
   "Fixer un objectif avant la séquence de bacs pratiques."
  ]
 },
 "31": {
  "n": 31,
  "titre": "Bac pratique 2024 — épreuve complète puis correction",
  "date": "2027-02-08",
  "tri": 2,
  "nature": "sujet de bac",
  "domaines": "Bac pratique",
  "pages": "p. 83-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Partie CSS3 du sujet",
    "items": [
     "Traiter un sujet d'épreuve pratique complet en conditions réelles."
    ]
   },
   {
    "titre": "Partie JavaScript",
    "items": [
     "Respecter le barème et la gestion du temps."
    ]
   },
   {
    "titre": "Partie PHP et base de données",
    "items": [
     "Analyser ses erreurs avec le corrigé officiel."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Ensemble du programme",
   "méthode vue à la séance 11"
  ],
  "criteres": [
   "Le sujet se traite dans l'ordre du barème, pas dans l'ordre du document.",
   "Produire : Épreuve complète en 2 h : CSS (position, float, transform), JavaScript (validation…",
   "Éviter : Partie CSS trop longue : le PHP est laissé de côté."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer le sujet et rappeler la répartition du temps ainsi que le barème.",
    "eleves": "• Lisent le sujet • Planifient l'ordre de traitement",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Répondre aux questions de forme ; rappeler la règle : terminer ce que l'on commence.",
    "eleves": "• Notent le temps par partie • Préparent les fichiers de travail",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Constatations",
    "duree": 95,
    "prof": "Épreuve complète en 2 h : CSS (position, float, transform), JavaScript (validation, événements), PHP et base de données. Correction guidée au barème, question par question, avec comparaison entre la production de l'élève et le corrigé. Assister les élèves individuellement.",
    "eleves": "• Composent sur machine • Testent au fur et à mesure • Vérifient le résultat attendu",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Corriger au barème : Le sujet se traite dans l'ordre du barème, pas dans l'ordre du document.",
    "eleves": "• Comparent leur production au corrigé • Notent les écarts",
    "moyens": "Sujet du bac · machine · XAMPP"
   }
  ],
  "maison": "Reprendre la partie PHP du sujet 2024 non terminée.",
  "trace": "Le sujet se traite dans l'ordre du barème, pas dans l'ordre du document.",
  "erreurs": [
   "Partie CSS trop longue : le PHP est laissé de côté.",
   "Fichiers non enregistrés au bon endroit."
  ],
  "prerequis_technique": "Ensemble du programme ; méthode vue à la séance 11.",
  "axes": [
   "Partie CSS3 du sujet",
   "Partie JavaScript",
   "Partie PHP et base de données"
  ],
  "objectifs_cours": [
   "Traiter un sujet d'épreuve pratique complet en conditions réelles.",
   "Respecter le barème et la gestion du temps.",
   "Analyser ses erreurs avec le corrigé officiel."
  ]
 },
 "32": {
  "n": 32,
  "titre": "Devoir de contrôle n°4",
  "date": "2027-02-12",
  "tri": 2,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS3 et JavaScript",
    "items": [
     "Évaluer la capacité à produire une page interactive complète."
    ]
   },
   {
    "titre": "PHP–MySQL",
    "items": [
     "Vérifier la chaîne formulaire → contrôle → base."
    ]
   },
   {
    "titre": "Question de SQL",
    "items": [
     "Préparer la comparaison avec le barème de l'épreuve pratique."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 23 à 31"
  ],
  "criteres": [
   "Barème : JavaScript 40 %, PHP et base 40 %, CSS 20 % ; la page doit fonctionner, pas seulement « avoir l'air bonne ».",
   "Produire : Parties 1 et 2 sur machine, dans l'ordre choisi.",
   "Éviter : CSS négligé alors qu'il rapporte des points faciles."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Partie 1 : CSS3 et JavaScript sur une page fournie (mise en page, validation, calcul). Partie 2 : PHP–MySQL…",
    "eleves": "• Écoutent les consignes • Préparent la machine et le matériel",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Distribuer le sujet ; répondre uniquement aux questions de forme.",
    "eleves": "• Lisent le sujet • Repèrent les parties et l'ordre de traitement",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Épreuve",
    "duree": 100,
    "prof": "Parties 1 et 2 sur machine, dans l'ordre choisi. Question de SQL puis vérifications finales (test des scripts, relecture du sujet).",
    "eleves": "• Composent • Testent leur production • Gèrent leur temps",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Ramasser les copies et les fichiers ; recueillir les impressions à chaud.",
    "eleves": "• Enregistrent et rendent • Expriment les difficultés rencontrées",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Aucun ; relire les fiches 13 à 20 et 7 à 10 avant la correction.",
  "trace": "Barème : JavaScript 40 %, PHP et base 40 %, CSS 20 % ; la page doit fonctionner, pas seulement « avoir l'air bonne ».",
  "erreurs": [
   "CSS négligé alors qu'il rapporte des points faciles.",
   "Formulaire non contrôlé côté serveur."
  ],
  "prerequis_technique": "Séances 23 à 31.",
  "axes": [
   "CSS3 et JavaScript",
   "PHP–MySQL",
   "Question de SQL"
  ],
  "objectifs_cours": [
   "Évaluer la capacité à produire une page interactive complète.",
   "Vérifier la chaîne formulaire → contrôle → base.",
   "Préparer la comparaison avec le barème de l'épreuve pratique."
  ]
 },
 "33": {
  "n": 33,
  "titre": "Correction du DC4 et exploitation du barème",
  "date": "2027-02-15",
  "tri": 2,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DC4",
    "items": [
     "Comparer sa production au barème de l'épreuve pratique du bac."
    ]
   },
   {
    "titre": "Comparaison avec le barème du bac",
    "items": [
     "Identifier les tâches les plus rentables en points."
    ]
   },
   {
    "titre": "Objectifs individuels",
    "items": [
     "Définir un plan de travail pour les trois séances suivantes."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC4 (séance 32)"
  ],
  "criteres": [
   "En pratique, mieux vaut dix points sûrs que vingt points commencés : on termine ce qu'on commence.",
   "Produire : Correction guidée du DC4 au barème type bac.",
   "Éviter : Laisser une fonction à moitié écrite."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies sont confrontées au corrigé officiel d'un sujet de bac : l'écart entre les deux est le programme…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC4 au barème type bac.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction détaillée ; comparaison des barèmes ; hiérarchie des tâches (ce qui rapporte, ce qui coûte) ; plan de travail individuel. Exercices de rattrapage : Atelier : chaque élève reprend la question où il a perdu le plus de points et la refait entièrement ; entretiens individuels.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : En pratique, mieux vaut dix points sûrs que vingt points commencés : on termine ce qu'on commence.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Refaire intégralement la partie la moins réussie du DC4.",
  "trace": "En pratique, mieux vaut dix points sûrs que vingt points commencés : on termine ce qu'on commence.",
  "erreurs": [
   "Laisser une fonction à moitié écrite.",
   "Ne pas tester son travail avant de rendre."
  ],
  "prerequis_technique": "DC4 (séance 32).",
  "axes": [
   "Correction du DC4",
   "Comparaison avec le barème du bac",
   "Objectifs individuels"
  ],
  "objectifs_cours": [
   "Comparer sa production au barème de l'épreuve pratique du bac.",
   "Identifier les tâches les plus rentables en points.",
   "Définir un plan de travail pour les trois séances suivantes."
  ]
 },
 "34": {
  "n": 34,
  "titre": "Bac pratique 2025 — épreuve complète puis correction",
  "date": "2027-02-19",
  "tri": 2,
  "nature": "sujet de bac",
  "domaines": "Bac pratique",
  "pages": "p. 83-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Partie CSS3 du sujet",
    "items": [
     "Confirmer les acquis sur un sujet plus récent."
    ]
   },
   {
    "titre": "Partie JavaScript",
    "items": [
     "Améliorer la gestion du temps par rapport au sujet 2024."
    ]
   },
   {
    "titre": "Partie PHP et base de données",
    "items": [
     "Repérer les questions régulières d'une session à l'autre."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séance 31 et correction du DC4 (séance 33)"
  ],
  "criteres": [
   "La méthode se stabilise : mêmes étapes, même ordre, quel que soit le sujet.",
   "Produire : Épreuve complète en 2 h sur le sujet 2025 : CSS, JavaScript, PHP et base de données.",
   "Éviter : Refaire les mêmes erreurs de gestion du temps."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer le sujet et rappeler la répartition du temps ainsi que le barème.",
    "eleves": "• Lisent le sujet • Planifient l'ordre de traitement",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Répondre aux questions de forme ; rappeler la règle : terminer ce que l'on commence.",
    "eleves": "• Notent le temps par partie • Préparent les fichiers de travail",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Constatations",
    "duree": 95,
    "prof": "Épreuve complète en 2 h sur le sujet 2025 : CSS, JavaScript, PHP et base de données. Correction commentée, puis comparaison du temps prévu et du temps réel, avec réajustement de la stratégie. Assister les élèves individuellement.",
    "eleves": "• Composent sur machine • Testent au fur et à mesure • Vérifient le résultat attendu",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Corriger au barème : La méthode se stabilise : mêmes étapes, même ordre, quel que soit le sujet.",
    "eleves": "• Comparent leur production au corrigé • Notent les écarts",
    "moyens": "Sujet du bac · machine · XAMPP"
   }
  ],
  "maison": "Lister les trois questions qui reviennent dans tous les sujets traités.",
  "trace": "La méthode se stabilise : mêmes étapes, même ordre, quel que soit le sujet.",
  "erreurs": [
   "Refaire les mêmes erreurs de gestion du temps.",
   "Négliger la vérification finale."
  ],
  "prerequis_technique": "Séance 31 et correction du DC4 (séance 33).",
  "axes": [
   "Partie CSS3 du sujet",
   "Partie JavaScript",
   "Partie PHP et base de données"
  ],
  "objectifs_cours": [
   "Confirmer les acquis sur un sujet plus récent.",
   "Améliorer la gestion du temps par rapport au sujet 2024.",
   "Repérer les questions régulières d'une session à l'autre."
  ]
 },
 "35": {
  "n": 35,
  "titre": "Bac pratique (session de rattrapage) — épreuve et correction",
  "date": "2027-02-22",
  "tri": 2,
  "nature": "sujet de bac",
  "domaines": "Bac pratique",
  "pages": "p. 83-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Sujet de rattrapage : CSS et JavaScript",
    "items": [
     "Traiter seul un sujet non encore rencontré."
    ]
   },
   {
    "titre": "Partie PHP et base",
    "items": [
     "S'autocorriger avec le corrigé officiel."
    ]
   },
   {
    "titre": "Autonomie et autocorrection",
    "items": [
     "Identifier les tâches les plus rentables en points."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 31 et 34"
  ],
  "criteres": [
   "Un sujet inconnu se traite avec la même méthode qu'un sujet connu : la méthode est ce qui reste le jour de l'examen.",
   "Produire : Épreuve complète en 2 h, en autonomie, sans aide du professeur.",
   "Éviter : Se décourager face à un sujet inhabituel."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer le sujet et rappeler la répartition du temps ainsi que le barème.",
    "eleves": "• Lisent le sujet • Planifient l'ordre de traitement",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Répondre aux questions de forme ; rappeler la règle : terminer ce que l'on commence.",
    "eleves": "• Notent le temps par partie • Préparent les fichiers de travail",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Constatations",
    "duree": 95,
    "prof": "Épreuve complète en 2 h, en autonomie, sans aide du professeur. Correction collective : comparaison des productions, mise en évidence des tâches les plus rentables et des erreurs coûteuses. Assister les élèves individuellement.",
    "eleves": "• Composent sur machine • Testent au fur et à mesure • Vérifient le résultat attendu",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Corriger au barème : Un sujet inconnu se traite avec la même méthode qu'un sujet connu : la méthode est ce qui reste le jour de l'examen.",
    "eleves": "• Comparent leur production au corrigé • Notent les écarts",
    "moyens": "Sujet du bac · machine · XAMPP"
   }
  ],
  "maison": "Rédiger sa propre fiche « mes cinq réflexes en épreuve pratique ».",
  "trace": "Un sujet inconnu se traite avec la même méthode qu'un sujet connu : la méthode est ce qui reste le jour de l'examen.",
  "erreurs": [
   "Se décourager face à un sujet inhabituel.",
   "Ne pas réutiliser les schémas déjà pratiqués."
  ],
  "prerequis_technique": "Séances 31 et 34.",
  "axes": [
   "Sujet de rattrapage : CSS et JavaScript",
   "Partie PHP et base",
   "Autonomie et autocorrection"
  ],
  "objectifs_cours": [
   "Traiter seul un sujet non encore rencontré.",
   "S'autocorriger avec le corrigé officiel.",
   "Identifier les tâches les plus rentables en points."
  ]
 },
 "36": {
  "n": 36,
  "titre": "Sujet théorique de bac 2025 et synthèse de méthode",
  "date": "2027-02-26",
  "tri": 2,
  "nature": "cours",
  "domaines": "Bac théorique",
  "pages": "p. 95-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Sujet théorique 2025",
    "items": [
     "Traiter le sujet théorique le plus récent."
    ]
   },
   {
    "titre": "Règles de rédaction",
    "items": [
     "Rédiger des réponses conformes aux attentes du correcteur."
    ]
   },
   {
    "titre": "Synthèse de méthode",
    "items": [
     "Formaliser une méthode de rédaction en six règles."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 24, 26 et 28"
  ],
  "criteres": [
   "Une réponse courte, exacte et justifiée vaut mieux qu'une réponse longue et approximative.",
   "Produire : Traitement du sujet théorique 2025 en 40 minutes.",
   "Éviter : Recopier l'énoncé au lieu de répondre."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 24, 26 et 28.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le sujet 2025 est distribué puis corrigé en direct ; on compare trois rédactions d'une même réponse pour montrer l'effet du vocabulaire exact. Présenter les consignes : Traitement du sujet théorique 2025 en 40 minutes.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Correction du sujet ; règles de rédaction : définition avant exemple, justification des clés, requête normalisée (casse, ponctuation), vocabulaire du programme, réponse courte et complète, vérification finale. Assister à la correction pour chaque élève ; Correction au barème, puis rédaction collective et distribution de la fiche « six règles de rédaction ».",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujet du bac · barème · copies"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Recopier l'énoncé au lieu de répondre. • Oublier de souligner la clé primaire.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujet du bac · barème · copies"
   }
  ],
  "maison": "Apprendre la fiche des six règles ; elle sera exigée dans le DS2.",
  "trace": "Une réponse courte, exacte et justifiée vaut mieux qu'une réponse longue et approximative.",
  "erreurs": [
   "Recopier l'énoncé au lieu de répondre.",
   "Oublier de souligner la clé primaire."
  ],
  "prerequis_technique": "Séances 24, 26 et 28.",
  "axes": [
   "Sujet théorique 2025",
   "Règles de rédaction",
   "Synthèse de méthode"
  ],
  "objectifs_cours": [
   "Traiter le sujet théorique le plus récent.",
   "Rédiger des réponses conformes aux attentes du correcteur.",
   "Formaliser une méthode de rédaction en six règles."
  ]
 },
 "37": {
  "n": 37,
  "titre": "Révision générale du 2e trimestre et préparation du DS2",
  "date": "2027-03-01",
  "tri": 2,
  "nature": "cours",
  "domaines": "Révision",
  "pages": "p. 83-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "BD théorique",
    "items": [
     "Mobiliser l'ensemble des acquis du trimestre."
    ]
   },
   {
    "titre": "SQL et PHP–MySQL",
    "items": [
     "Traiter un sujet type de devoir de synthèse en temps limité."
    ]
   },
   {
    "titre": "CSS et JavaScript",
    "items": [
     "Se préparer au DS2 de la semaine bloquée."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 23 à 36"
  ],
  "criteres": [
   "Le devoir de synthèse porte sur le trimestre entier : la révision se fait par sujets, pas par chapitres.",
   "Produire : Sujet type de devoir de synthèse traité en 90 minutes.",
   "Éviter : Réviser seulement les derniers chapitres."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 23 à 36.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Annonce du DS2 (semaine du 4 au 13 mars) ; contrat de séance : un sujet complet en 90 minutes, sans aide. Présenter les consignes : Sujet type de devoir de synthèse traité en 90 minutes.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rappels express : conditions d'un schéma correct, requêtes d'agrégation et jointures, chaîne formulaire → PHP → base, validation JavaScript. Assister à la correction pour chaque élève ; Autocorrection au barème et reprise des deux questions les moins réussies.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Rappels express : conditions d'un schéma correct, requêtes… • Affichage simplifié • Réviser seulement les derniers chapitres. • Ne pas s'entraîner à écrire des requêtes à la main.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse"
   }
  ],
  "maison": "Réviser les fiches 23 à 36 pour le DS2 (semaine du 4 au 13 mars).",
  "trace": "Le devoir de synthèse porte sur le trimestre entier : la révision se fait par sujets, pas par chapitres.",
  "erreurs": [
   "Réviser seulement les derniers chapitres.",
   "Ne pas s'entraîner à écrire des requêtes à la main."
  ],
  "prerequis_technique": "Séances 23 à 36.",
  "axes": [
   "BD théorique",
   "SQL et PHP–MySQL",
   "CSS et JavaScript"
  ],
  "objectifs_cours": [
   "Mobiliser l'ensemble des acquis du trimestre.",
   "Traiter un sujet type de devoir de synthèse en temps limité.",
   "Se préparer au DS2 de la semaine bloquée."
  ]
 },
 "38": {
  "n": 38,
  "titre": "Correction du DS2, bilan et plan de révision",
  "date": "2027-03-29",
  "tri": 3,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DS2",
    "items": [
     "Comprendre le barème du DS2 et ses erreurs."
    ]
   },
   {
    "titre": "Bilan du 2e trimestre",
    "items": [
     "Faire le bilan du trimestre consacré aux sujets de bac."
    ]
   },
   {
    "titre": "Plan de révision jusqu'au bac",
    "items": [
     "Construire un plan de révision personnel jusqu'à l'épreuve."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Devoir de synthèse n°2 (semaine bloquée du 4 au 13 mars)"
  ],
  "criteres": [
   "La dernière ligne droite se joue sur les lacunes identifiées, pas sur la relecture du cours.",
   "Produire : Correction guidée du DS2, question par question.",
   "Éviter : Réviser sans priorité."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Copies rendues avec le barème ; chaque élève établit un tableau à deux colonnes : ce qui est acquis, ce qui…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DS2, question par question.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction commentée du DS2 ; analyse des écarts entre les sujets traités et les résultats ; présentation du 3e trimestre (révisions et bacs blancs). Exercices de rattrapage : Construction du plan de révision individuel : trois priorités, deux sujets à refaire, un objectif de note.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : La dernière ligne droite se joue sur les lacunes identifiées, pas sur la relecture du cours.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Commencer le plan de révision et refaire le premier sujet choisi.",
  "trace": "La dernière ligne droite se joue sur les lacunes identifiées, pas sur la relecture du cours.",
  "erreurs": [
   "Réviser sans priorité.",
   "Refaire uniquement ce qui est déjà réussi."
  ],
  "prerequis_technique": "Devoir de synthèse n°2 (semaine bloquée du 4 au 13 mars).",
  "axes": [
   "Correction du DS2",
   "Bilan du 2e trimestre",
   "Plan de révision jusqu'au bac"
  ],
  "objectifs_cours": [
   "Comprendre le barème du DS2 et ses erreurs.",
   "Faire le bilan du trimestre consacré aux sujets de bac.",
   "Construire un plan de révision personnel jusqu'à l'épreuve."
  ]
 },
 "39": {
  "n": 39,
  "titre": "Révision bac — bases de données (théorie)",
  "date": "2027-04-02",
  "tri": 3,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 95",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Cardinalités",
     "Base de données",
     "Table / relation",
     "Clé composée"
    ]
   },
   {
    "titre": "Schéma et contraintes",
    "items": [
     "Réviser la théorie des bases de données sous forme de questions d'examen."
    ]
   },
   {
    "titre": "Conversion texte / graphique",
    "items": [
     "Traiter les questions de schéma, de clés et de contraintes."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Ensemble du programme de bases de données (1er et 2e trimestres)"
  ],
  "criteres": [
   "Un schéma correct est atomique, identifié, et toutes ses associations sont traduites par des clés étrangères.",
   "Produire : Série de six questions théoriques extraites de sujets de bac, traitées à l'écrit.",
   "Éviter : Oublier de souligner la clé primaire."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Ensemble du programme de bases de données (1er et 2e trimestres).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Question d'ouverture : « un schéma peut-il être faux ? » ; trois schémas projetés, un seul est correct. Présenter les consignes : Série de six questions théoriques extraites de sujets de bac, traitées à l'écrit.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Représentation graphique et textuelle ; clés primaires et étrangères ; contraintes d'intégrité ; cardinalités ; anomalies classiques (champ non atomique, clé étrangère absente, cardinalité inversée). Assister à la correction pour chaque élève ; Correction au barème, puis exercice de conversion graphique → textuelle sur deux schémas.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Cardinalités • Base de données • Table / relation • Oublier de souligner la clé primaire. • Confondre association et entité.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Refaire les deux schémas non réussis et justifier chaque correction.",
  "trace": "Un schéma correct est atomique, identifié, et toutes ses associations sont traduites par des clés étrangères.",
  "erreurs": [
   "Oublier de souligner la clé primaire.",
   "Confondre association et entité."
  ],
  "prerequis_technique": "Ensemble du programme de bases de données (1er et 2e trimestres).",
  "axes": [
   "Schéma et contraintes",
   "Conversion texte / graphique",
   "Anomalies à corriger"
  ],
  "objectifs_cours": [
   "Réviser la théorie des bases de données sous forme de questions d'examen.",
   "Traiter les questions de schéma, de clés et de contraintes.",
   "Repérer les anomalies classiques d'un schéma."
  ]
 },
 "40": {
  "n": 40,
  "titre": "Révision bac — SQL (LDD, LMD, requêtes)",
  "date": "2027-04-05",
  "tri": 3,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 95-96",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Base de données",
     "Table / relation",
     "Clé composée",
     "Relation 1:1"
    ]
   },
   {
    "titre": "LDD et LMD",
    "items": [
     "Écrire sans aide toutes les familles de requêtes du programme."
    ]
   },
   {
    "titre": "Jointures et sous-requêtes",
    "items": [
     "Réviser les fonctions d'agrégat et les regroupements."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 23 à 29 et 39"
  ],
  "criteres": [
   "L'écriture à la main est l'épreuve réelle : le jour du bac, il n'y a ni aide ni coloration syntaxique.",
   "Produire : Défi chronométré de dix requêtes, corrigé immédiatement.",
   "Éviter : Dépendre de l'autocomplétion."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 23 à 29 et 39.",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Défi chronométré : dix requêtes en 40 minutes, de la création de table à la sous-requête, sur une base d'examen. Présenter les consignes : Défi chronométré de dix requêtes, corrigé immédiatement.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rappels : CREATE / ALTER ; INSERT / UPDATE / DELETE ; SELECT avec jointures ; COUNT, SUM, AVG, MIN, MAX ; GROUP BY, HAVING ; sous-requêtes. Assister à la correction pour chaque élève ; Reprise des requêtes échouées, puis écriture de deux requêtes complexes à main levée (sans machine).",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Dépendre de l'autocomplétion. • Négliger la ponctuation et les guillemets.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Refaire le défi en moins de 35 minutes.",
  "trace": "L'écriture à la main est l'épreuve réelle : le jour du bac, il n'y a ni aide ni coloration syntaxique.",
  "erreurs": [
   "Dépendre de l'autocomplétion.",
   "Négliger la ponctuation et les guillemets."
  ],
  "prerequis_technique": "Séances 23 à 29 et 39.",
  "axes": [
   "LDD et LMD",
   "Jointures et sous-requêtes",
   "Agrégats et regroupements"
  ],
  "objectifs_cours": [
   "Écrire sans aide toutes les familles de requêtes du programme.",
   "Réviser les fonctions d'agrégat et les regroupements.",
   "Gagner en vitesse d'écriture SQL."
  ]
 },
 "41": {
  "n": 41,
  "titre": "Devoir de contrôle n°5",
  "date": "2027-04-12",
  "tri": 3,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS3 et JavaScript",
    "items": [
     "Évaluer les acquis avant les dernières épreuves."
    ]
   },
   {
    "titre": "PHP–MySQL",
    "items": [
     "Vérifier la vitesse d'exécution sur une épreuve pratique."
    ]
   },
   {
    "titre": "SQL",
    "items": [
     "Cibler les révisions des trois séances restantes."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 39 et 40 plus les séances du 2e trimestre"
  ],
  "criteres": [
   "Barème : JavaScript 40 %, PHP et base 40 %, CSS 20 % ; le temps de vérification doit être réservé dès le début.",
   "Produire : Parties 1 et 2 sur machine.",
   "Éviter : Sauter la vérification finale."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Partie 1 : CSS3 et JavaScript sur une page. Partie 2 : PHP — contrôle de saisie et enregistrement en base. Partie 3 …",
    "eleves": "• Écoutent les consignes • Préparent la machine et le matériel",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Distribuer le sujet ; répondre uniquement aux questions de forme.",
    "eleves": "• Lisent le sujet • Repèrent les parties et l'ordre de traitement",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Épreuve",
    "duree": 100,
    "prof": "Parties 1 et 2 sur machine. Partie 3 et vérifications finales.",
    "eleves": "• Composent • Testent leur production • Gèrent leur temps",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Ramasser les copies et les fichiers ; recueillir les impressions à chaud.",
    "eleves": "• Enregistrent et rendent • Expriment les difficultés rencontrées",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Aucun ; relire la fiche des cinq réflexes rédigée en février.",
  "trace": "Barème : JavaScript 40 %, PHP et base 40 %, CSS 20 % ; le temps de vérification doit être réservé dès le début.",
  "erreurs": [
   "Sauter la vérification finale.",
   "Oublier de fermer la connexion à la base."
  ],
  "prerequis_technique": "Séances 39 et 40 plus les séances du 2e trimestre.",
  "axes": [
   "CSS3 et JavaScript",
   "PHP–MySQL",
   "SQL"
  ],
  "objectifs_cours": [
   "Évaluer les acquis avant les dernières épreuves.",
   "Vérifier la vitesse d'exécution sur une épreuve pratique.",
   "Cibler les révisions des trois séances restantes."
  ]
 },
 "42": {
  "n": 42,
  "titre": "Correction du DC5 et remédiation",
  "date": "2027-04-16",
  "tri": 3,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DC5",
    "items": [
     "Corriger le DC5 et comprendre chaque point perdu."
    ]
   },
   {
    "titre": "Remédiation individualisée",
    "items": [
     "Recevoir une remédiation adaptée à son profil."
    ]
   },
   {
    "titre": "Dernière ligne droite",
    "items": [
     "Arrêter les priorités personnelles avant le DC6 et le DS3."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC5 (séance 41)"
  ],
  "criteres": [
   "Dans les trois dernières séances, on ne peut plus tout revoir : on consolide ce qui rapporte le plus.",
   "Produire : Correction guidée du DC5, question par question.",
   "Éviter : Vouloir tout réviser à la fois."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Copies rendues avec des annotations ciblées ; trois profils d'erreurs sont annoncés et chaque élève se…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC5, question par question.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction au barème type bac ; rappel des points de barème de l'épreuve pratique ; hiérarchie des révisions restantes. Exercices de rattrapage : Remédiation par profil : exercices de rattrapage adaptés, entretiens individuels, rédaction d'une liste de trois priorités.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Dans les trois dernières séances, on ne peut plus tout revoir : on consolide ce qui rapporte le plus.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Travailler les trois priorités personnelles avant le DC6 du 26 avril.",
  "trace": "Dans les trois dernières séances, on ne peut plus tout revoir : on consolide ce qui rapporte le plus.",
  "erreurs": [
   "Vouloir tout réviser à la fois.",
   "Négliger la partie théorique, souvent plus rentable."
  ],
  "prerequis_technique": "DC5 (séance 41).",
  "axes": [
   "Correction du DC5",
   "Remédiation individualisée",
   "Dernière ligne droite"
  ],
  "objectifs_cours": [
   "Corriger le DC5 et comprendre chaque point perdu.",
   "Recevoir une remédiation adaptée à son profil.",
   "Arrêter les priorités personnelles avant le DC6 et le DS3."
  ]
 },
 "43": {
  "n": 43,
  "titre": "Révision bac — PHP et site dynamique",
  "date": "2027-04-19",
  "tri": 3,
  "nature": "cours",
  "domaines": "PHP",
  "pages": "p. 97-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "PHP",
    "items": [
     "Affichage simplifié"
    ]
   },
   {
    "titre": "Structure d'un script PHP",
    "items": [
     "Réviser PHP en tant que langage d'examen : syntaxe, formulaires, base."
    ]
   },
   {
    "titre": "Formulaires et connexion MySQLi",
    "items": [
     "Refaire les enchaînements liste, ajout, modification, suppression."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 7 à 10, 15 et les sujets pratiques du 2e trimestre"
  ],
  "criteres": [
   "Le PHP d'examen se limite au programme : inutile d'aller chercher des fonctions hors référentiel.",
   "Produire : Quatre exercices guidés : affichage, insertion, modification, suppression.",
   "Éviter : Utiliser des fonctions absentes du référentiel."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 7 à 10, 15 et les sujets pratiques du 2e trimestre.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un sujet de bac sous les yeux : on cherche toutes les questions qui relèvent de PHP, puis on les traite une à une. Présenter les consignes : Quatre exercices guidés : affichage, insertion, modification, suppression.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rappels : structure d'un script, echo, variables, tableaux, boucles ; $_GET / $_POST ; mysqli_connect, mysqli_query, fetch, num_rows ; CRUD ; fonctions de chaînes et de dates ; require. Assister à la correction pour chaque élève ; Deux exercices d'examen non guidés sur les chaînes et les dates, corrigés au barème.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Affichage simplifié • Utiliser des fonctions absentes du référentiel. • Connexion non testée avant la requête.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes PHP · XAMPP · base d'examen"
   }
  ],
  "maison": "Refaire l'exercice d'insertion sans aide et le tester sur la base d'examen.",
  "trace": "Le PHP d'examen se limite au programme : inutile d'aller chercher des fonctions hors référentiel.",
  "erreurs": [
   "Utiliser des fonctions absentes du référentiel.",
   "Connexion non testée avant la requête."
  ],
  "prerequis_technique": "Séances 7 à 10, 15 et les sujets pratiques du 2e trimestre.",
  "axes": [
   "Structure d'un script PHP",
   "Formulaires et connexion MySQLi",
   "CRUD et fonctions de chaînes et de dates"
  ],
  "objectifs_cours": [
   "Réviser PHP en tant que langage d'examen : syntaxe, formulaires, base.",
   "Refaire les enchaînements liste, ajout, modification, suppression.",
   "Utiliser les fonctions de chaînes et de dates."
  ]
 },
 "44": {
  "n": 44,
  "titre": "Révision bac — HTML5, CSS3 et JavaScript",
  "date": "2027-04-23",
  "tri": 3,
  "nature": "cours",
  "domaines": "HTML5 / CSS3 / JS",
  "pages": "p. 83-94",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "Rappels : structure sémantique, formulaires et datalist",
     "sélecteurs CSS3, pseudo-classes, positionnement, transform",
     "événements, validation, objets natifs, modification du contenu et des styles."
    ]
   },
   {
    "titre": "JavaScript",
    "items": [
     "Rappels : structure sémantique, formulaires et datalist",
     "sélecteurs CSS3, pseudo-classes, positionnement, transform",
     "événements, validation, objets natifs, modification du contenu et des styles."
    ]
   },
   {
    "titre": "HTML5 et CSS3",
    "items": [
     "Réviser la partie « site web » du programme."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 3, 13, 18 à 20 et les sujets pratiques"
  ],
  "criteres": [
   "Une page web d'examen se compose de trois couches : structure, présentation, comportement — et l'énoncé indique toujours laquelle est demandée.",
   "Produire : Trois exercices CSS3 et deux exercices JavaScript guidés, sur la page fournie.",
   "Éviter : Mélanger style et structure (styles en ligne)."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 1 à 3, 13, 18 à 20 et les sujets pratiques.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Partant d'une page fournie, les élèves doivent lister tout ce qui pourrait être demandé au bac sur cette seule page. Présenter les consignes : Trois exercices CSS3 et deux exercices JavaScript guidés, sur la page fournie.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rappels : structure sémantique, formulaires et datalist ; sélecteurs CSS3, pseudo-classes, positionnement, transform ; événements, validation, objets natifs, modification du contenu et des styles. Assister à la correction pour chaque élève ; Questions théoriques (rôle du validateur, différence GET/POST, événements) corrigées au barème.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Rappels : structure sémantique, formulaires et datalist • sélecteurs CSS3, pseudo-classes, positionnement, transform • événements, validation, objets natifs, modification du contenu et des… • Mélanger style et structure (styles en ligne). • Confondre validation HTML5 et validation JavaScript.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   }
  ],
  "maison": "Refaire l'exercice de positionnement et le montrer au début de la séance suivante.",
  "trace": "Une page web d'examen se compose de trois couches : structure, présentation, comportement — et l'énoncé indique toujours laquelle est demandée.",
  "erreurs": [
   "Mélanger style et structure (styles en ligne).",
   "Confondre validation HTML5 et validation JavaScript."
  ],
  "prerequis_technique": "Séances 1 à 3, 13, 18 à 20 et les sujets pratiques.",
  "axes": [
   "HTML5 et CSS3",
   "JavaScript",
   "Questions théoriques liées au web"
  ],
  "objectifs_cours": [
   "Réviser la partie « site web » du programme.",
   "Refaire les manipulations de DOM et de validation.",
   "Répondre aux questions théoriques sur le web."
  ]
 },
 "45": {
  "n": 45,
  "titre": "Devoir de contrôle n°6",
  "date": "2027-04-26",
  "tri": 3,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Questions théoriques",
    "items": [
     "Traiter un sujet type bac complet."
    ]
   },
   {
    "titre": "Partie CSS et JavaScript",
    "items": [
     "Évaluer l'ensemble du programme avant le devoir de synthèse."
    ]
   },
   {
    "titre": "Partie PHP et base de données",
    "items": [
     "Vérifier l'endurance sur une épreuve longue."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 39 à 44"
  ],
  "criteres": [
   "Barème type bac ; la répartition des points doit guider l'ordre de traitement.",
   "Produire : Parties théoriques et CSS.",
   "Éviter : Déséquilibre entre les parties."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Sujet en quatre parties : questions théoriques de bases de données, partie CSS, partie JavaScript, partie PHP et base…",
    "eleves": "• Écoutent les consignes • Préparent la machine et le matériel",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Distribuer le sujet ; répondre uniquement aux questions de forme.",
    "eleves": "• Lisent le sujet • Repèrent les parties et l'ordre de traitement",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Épreuve",
    "duree": 100,
    "prof": "Parties théoriques et CSS. Parties JavaScript et PHP, puis vérifications.",
    "eleves": "• Composent • Testent leur production • Gèrent leur temps",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Ramasser les copies et les fichiers ; recueillir les impressions à chaud.",
    "eleves": "• Enregistrent et rendent • Expriment les difficultés rencontrées",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Aucun ; relire les fiches 39 à 44 avant la correction.",
  "trace": "Barème type bac ; la répartition des points doit guider l'ordre de traitement.",
  "erreurs": [
   "Déséquilibre entre les parties.",
   "Questions théoriques traitées en dernier, sans temps restant."
  ],
  "prerequis_technique": "Séances 39 à 44.",
  "axes": [
   "Questions théoriques",
   "Partie CSS et JavaScript",
   "Partie PHP et base de données"
  ],
  "objectifs_cours": [
   "Traiter un sujet type bac complet.",
   "Évaluer l'ensemble du programme avant le devoir de synthèse.",
   "Vérifier l'endurance sur une épreuve longue."
  ]
 },
 "46": {
  "n": 46,
  "titre": "Correction du DC6 et remédiation",
  "date": "2027-04-30",
  "tri": 3,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DC6",
    "items": [
     "Corriger le DC6 au barème type bac."
    ]
   },
   {
    "titre": "Dernières remédiations",
    "items": [
     "Recevoir une dernière remédiation ciblée."
    ]
   },
   {
    "titre": "Consignes individuelles",
    "items": [
     "Partir avec des consignes personnelles pour le jour de l'épreuve."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC6 (séance 45)"
  ],
  "criteres": [
   "Le jour de l'épreuve : lire tout le sujet, commencer par ce qui est sûr, réserver dix minutes de vérification.",
   "Produire : Correction guidée du DC6.",
   "Éviter : Arriver sans matériel le jour de l'épreuve."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies sont rendues avec le barème ; le dernier délai officiel des devoirs de contrôle de 4e année est…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC6.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction détaillée ; synthèse des acquis de l'année ; consignes pratiques (matériel, gestion du temps, vérifications, ce qui est autorisé). Exercices de rattrapage : Entretiens individuels courts (3 minutes par élève) avec deux consignes personnelles écrites.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Le jour de l'épreuve : lire tout le sujet, commencer par ce qui est sûr, réserver dix minutes de vérification.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Préparer le bac blanc théorique du 3 mai.",
  "trace": "Le jour de l'épreuve : lire tout le sujet, commencer par ce qui est sûr, réserver dix minutes de vérification.",
  "erreurs": [
   "Arriver sans matériel le jour de l'épreuve.",
   "Ne pas réserver de temps de vérification."
  ],
  "prerequis_technique": "DC6 (séance 45).",
  "axes": [
   "Correction du DC6",
   "Dernières remédiations",
   "Consignes individuelles"
  ],
  "objectifs_cours": [
   "Corriger le DC6 au barème type bac.",
   "Recevoir une dernière remédiation ciblée.",
   "Partir avec des consignes personnelles pour le jour de l'épreuve."
  ]
 },
 "47": {
  "n": 47,
  "titre": "Révision générale — bac blanc théorique",
  "date": "2027-05-03",
  "tri": 3,
  "nature": "cours",
  "domaines": "Révision",
  "pages": "p. 83-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Épreuve complète",
    "items": [
     "Simuler l'épreuve théorique du baccalauréat."
    ]
   },
   {
    "titre": "Correction commentée",
    "items": [
     "Améliorer la rédaction et la justification."
    ]
   },
   {
    "titre": "Méthodologie",
    "items": [
     "Corriger ses derniers réflexes de méthode."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 39 à 46"
  ],
  "criteres": [
   "Une copie bien présentée, avec des réponses justifiées et des requêtes exactes, gagne les points que la copie confuse perd.",
   "Produire : Bac blanc théorique en 2 h.",
   "Éviter : Réponses non justifiées."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 39 à 46.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Bac blanc écrit de 2 h, sur le modèle de l'épreuve nationale, dans les conditions réelles. Présenter les consignes : Bac blanc théorique en 2 h.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Épreuve complète puis correction commentée : gestion du temps, rédaction des requêtes, justification des choix techniques, présentation de la copie. Assister à la correction pour chaque élève ; Correction commentée et rédaction d'une fiche de méthode individuelle (une page).",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Épreuve complète puis correction commentée : gestion du temps… • Affichage simplifié • Réponses non justifiées. • Requêtes non testées mentalement avant d'être écrites.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse"
   }
  ],
  "maison": "Apprendre sa fiche de méthode pour le jour de l'épreuve.",
  "trace": "Une copie bien présentée, avec des réponses justifiées et des requêtes exactes, gagne les points que la copie confuse perd.",
  "erreurs": [
   "Réponses non justifiées.",
   "Requêtes non testées mentalement avant d'être écrites."
  ],
  "prerequis_technique": "Séances 39 à 46.",
  "axes": [
   "Épreuve complète",
   "Correction commentée",
   "Méthodologie"
  ],
  "objectifs_cours": [
   "Simuler l'épreuve théorique du baccalauréat.",
   "Améliorer la rédaction et la justification.",
   "Corriger ses derniers réflexes de méthode."
  ]
 },
 "48": {
  "n": 48,
  "titre": "Devoir de synthèse n°3",
  "date": "2027-05-07",
  "tri": 3,
  "nature": "devoir de synthèse",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Programme complet de l'année",
    "items": [
     "Évaluer l'ensemble du programme de l'année."
    ]
   },
   {
    "titre": "Épreuve de synthèse",
    "items": [
     "Se situer avant l'épreuve nationale."
    ]
   },
   {
    "titre": "Conditions du baccalauréat",
    "items": [
     "Valider les compétences attendues à l'examen."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Ensemble du programme de 4e année SI (STI)"
  ],
  "criteres": [
   "Épreuve de synthèse : mêmes exigences que le baccalauréat, sur l'ensemble du programme.",
   "Produire : Partie théorique : bases de données, web, questions de cours.",
   "Éviter : Réviser sélectivement."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Épreuve de synthèse couvrant les cinq domaines : HTML5, CSS3, JavaScript, SQL / bases de données et PHP.",
    "eleves": "• Écoutent les consignes • Préparent la machine et le matériel",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Distribuer le sujet ; répondre uniquement aux questions de forme.",
    "eleves": "• Lisent le sujet • Repèrent les parties et l'ordre de traitement",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Épreuve",
    "duree": 100,
    "prof": "Partie théorique : bases de données, web, questions de cours. Partie pratique : page interactive, requêtes SQL, script PHP.",
    "eleves": "• Composent • Testent leur production • Gèrent leur temps",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Ramasser les copies et les fichiers ; recueillir les impressions à chaud.",
    "eleves": "• Enregistrent et rendent • Expriment les difficultés rencontrées",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Relire les fiches 39 à 47 pour la correction du 14 mai.",
  "trace": "Épreuve de synthèse : mêmes exigences que le baccalauréat, sur l'ensemble du programme.",
  "erreurs": [
   "Réviser sélectivement.",
   "Négliger la partie pratique, la plus lourde en points."
  ],
  "prerequis_technique": "Ensemble du programme de 4e année SI (STI).",
  "axes": [
   "Programme complet de l'année",
   "Épreuve de synthèse",
   "Conditions du baccalauréat"
  ],
  "objectifs_cours": [
   "Évaluer l'ensemble du programme de l'année.",
   "Se situer avant l'épreuve nationale.",
   "Valider les compétences attendues à l'examen."
  ]
 },
 "49": {
  "n": 49,
  "titre": "Bac blanc pratique et révision encadrée",
  "date": "2027-05-10",
  "tri": 3,
  "nature": "sujet de bac",
  "domaines": "Bac pratique",
  "pages": "p. 83-100",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Bac blanc pratique",
    "items": [
     "Simuler l'épreuve pratique du baccalauréat."
    ]
   },
   {
    "titre": "Révision encadrée",
    "items": [
     "Consolider les automatismes d'écriture et de test."
    ]
   },
   {
    "titre": "Automatismes",
    "items": [
     "Recevoir une réponse individuelle aux dernières questions."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 39 à 48"
  ],
  "criteres": [
   "La vitesse vient de la répétition des mêmes gestes : structurer, écrire, tester, vérifier.",
   "Produire : Bac blanc pratique en 2 h (CSS, JavaScript, PHP et base de données).",
   "Éviter : Improviser la structure du code."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer le sujet et rappeler la répartition du temps ainsi que le barème.",
    "eleves": "• Lisent le sujet • Planifient l'ordre de traitement",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Répondre aux questions de forme ; rappeler la règle : terminer ce que l'on commence.",
    "eleves": "• Notent le temps par partie • Préparent les fichiers de travail",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Constatations",
    "duree": 95,
    "prof": "Bac blanc pratique en 2 h (CSS, JavaScript, PHP et base de données). Correction et révision encadrée : chaque élève reprend la partie où il a été le plus lent. Assister les élèves individuellement.",
    "eleves": "• Composent sur machine • Testent au fur et à mesure • Vérifient le résultat attendu",
    "moyens": "Sujet du bac · machine · XAMPP"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Corriger au barème : La vitesse vient de la répétition des mêmes gestes : structurer, écrire, tester, vérifier.",
    "eleves": "• Comparent leur production au corrigé • Notent les écarts",
    "moyens": "Sujet du bac · machine · XAMPP"
   }
  ],
  "maison": "Relire les fiches 1 à 48 : la correction du DS3 et les consignes finales ont lieu le 14 mai.",
  "trace": "La vitesse vient de la répétition des mêmes gestes : structurer, écrire, tester, vérifier.",
  "erreurs": [
   "Improviser la structure du code.",
   "Ne pas tester avant de passer à la question suivante."
  ],
  "prerequis_technique": "Séances 39 à 48.",
  "axes": [
   "Bac blanc pratique",
   "Révision encadrée",
   "Automatismes"
  ],
  "objectifs_cours": [
   "Simuler l'épreuve pratique du baccalauréat.",
   "Consolider les automatismes d'écriture et de test.",
   "Recevoir une réponse individuelle aux dernières questions."
  ]
 },
 "50": {
  "n": 50,
  "titre": "Correction du DS3 et consignes pour le baccalauréat",
  "date": "2027-05-14",
  "tri": 3,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DS3",
    "items": [
     "Comprendre le barème du devoir de synthèse n°3."
    ]
   },
   {
    "titre": "Bilan de l'année",
    "items": [
     "Faire le bilan de l'année et mesurer la progression."
    ]
   },
   {
    "titre": "Consignes pour le baccalauréat",
    "items": [
     "Partir avec des consignes claires pour l'épreuve de STI."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Devoir de synthèse n°3 (séance 48) et fin du programme"
  ],
  "criteres": [
   "Le programme est terminé : les deux dernières semaines servent à consolider, pas à apprendre du neuf.",
   "Produire : Correction commentée du DS3 au barème, question par question.",
   "Éviter : Continuer à apprendre de nouvelles notions au détriment de la consolidation."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Dernière séance de l'année : les copies du DS3 sont rendues et commentées ; la session du baccalauréat se…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction commentée du DS3 au barème, question par question.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction et remise des copies (période officielle du 13 au 15 mai) ; bilan de l'année ; consignes pratiques pour l'épreuve de STI ; rappel du calendrier du baccalauréat. Exercices de rattrapage : Bilan individuel et collectif : progression sur l'année, points forts, conseils personnalisés ; distribution de la fiche de consignes.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Le programme est terminé : les deux dernières semaines servent à consolider, pas à apprendre du neuf.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Réviser avec les fiches de méthode et les sujets corrigés jusqu'à l'épreuve.",
  "trace": "Le programme est terminé : les deux dernières semaines servent à consolider, pas à apprendre du neuf.",
  "erreurs": [
   "Continuer à apprendre de nouvelles notions au détriment de la consolidation.",
   "Négliger la présentation de la copie."
  ],
  "prerequis_technique": "Devoir de synthèse n°3 (séance 48) et fin du programme.",
  "axes": [
   "Correction du DS3",
   "Bilan de l'année",
   "Consignes pour le baccalauréat"
  ],
  "objectifs_cours": [
   "Comprendre le barème du devoir de synthèse n°3.",
   "Faire le bilan de l'année et mesurer la progression.",
   "Partir avec des consignes claires pour l'épreuve de STI."
  ]
 }
};
root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.fiches4SI2 = FICHES_4SI2;
})(typeof window !== 'undefined' ? window : globalThis);
