/* RÉFÉRENTIEL DE COMPÉTENCES — pont entre l'aide pédagogique, les annexes de cours et les séances.
   Pour chaque classe et chaque compétence officielle :
     memo      : identifiant de la section correspondante dans data/memo.js
     annexes   : annexes de cours à mobiliser (fichiers PDF du dossier docs/)
     blocs     : numéros des blocs de la répartition du 1er trimestre qui traitent la compétence
     eval      : blocs d'évaluation (devoirs et corrections) rattachés
     aide      : renvoi à l'aide pédagogique (page / niveau)
     atelier   : activité proposée en classe (adaptation pédagogique)
     attendu   : ce que l'élève doit savoir faire à l'issue du 1er trimestre */
(function (root) {
'use strict';

const COMPETENCES = {
"3SI1": [
  { code:"D", domaine:"Systèmes, technologies et Internet",
    t:"Créer et publier un site web interactif",
    sous:"HTML5 &bull; CSS3 &bull; JavaScript — construire une page web structurée, mise en forme et interactive, puis la valider.",
    memo:["web","js","qualite"],
    annexes:["docs/Annexe-HTML5.pdf","docs/Annexe-CSS3.pdf","docs/Annexe-JavaScript.pdf"],
    aide:"Aide pédagogique 3SI1 — p. 4 à 6",
    blocs:[1,2,3,4,5,8,9,12,13], eval:[6,7,10,11,14],
    atelier:"Projet « Le fleuriste du Rafèha » : page de présentation du lycée, formulaire de commande, animations CSS3, contrôles et calculs en JavaScript.",
    attendu:["Structurer une page avec les éléments sémantiques HTML5","Mettre en forme et positionner les blocs en CSS3 (flex, position, transitions)","Créer et contrôler un formulaire (types d'input, événements, validation en JS)","Écrire un script externe utilisant variables, conditions, boucles, fonctions et objets prédéfinis","Valider le code HTML5 et CSS3 et corriger les erreurs signalées"] },

  { code:"A", domaine:"Systèmes, technologies et Internet",
    t:"Programmer un objet connecté",
    sous:"Composants matériels, programmation Micro-Python / Arduino, échange de données, téléversement sur carte ESP32.",
    memo:["systemes"], annexes:[], aide:"Aide pédagogique 3SI1 — p. 2",
    blocs:[], eval:[], periode:"2e et 3e trimestres",
    atelier:"Atelier pratique : identification des entrées/sorties d'un objet connecté, écriture d'un module Micro-Python et téléversement sur ESP32.",
    attendu:["Définir un objet connecté et citer ses composants matériels","Écrire un programme pour interagir avec le matériel","Configurer la communication réseau et échanger des données","Tester le programme et le corriger"] },

  { code:"B", domaine:"Systèmes, technologies et Internet",
    t:"Exploiter les fonctionnalités d'un système d'exploitation",
    sous:"Types de systèmes, déploiement (installer, configurer, mettre à jour), sécurisation, machines virtuelles.",
    memo:["systemes"], annexes:[], aide:"Aide pédagogique 3SI1 — p. 3",
    blocs:[], eval:[], periode:"2e trimestre",
    atelier:"TP machine virtuelle : déployer un système propriétaire et un système libre, comparer, puis sécuriser le poste (antivirus, pare-feu).",
    attendu:["Définir un système d'exploitation et distinguer ses types","Déployer un SE : installer, configurer, mettre à jour","Sécuriser un ordinateur à l'aide de logiciels de protection"] },

  { code:"C", domaine:"Systèmes, technologies et Internet",
    t:"Acquérir les notions de base d'un réseau local",
    sous:"Classification des réseaux (LAN, WAN, MAN), paramétrage (IP, DNS, masque, MAC), architectures, sécurisation.",
    memo:["systemes"], annexes:[], aide:"Aide pédagogique 3SI1 — p. 3",
    blocs:[], eval:[], periode:"2e et 3e trimestres",
    atelier:"Exercice pratique : plan d'adressage de la salle informatique, configuration des postes, test de connectivité.",
    attendu:["Définir un réseau et le classifier selon son étendue","Paramétrer un composant réseau (adresse IP, DNS, masque, adresse MAC)","Distinguer les architectures client/serveur et poste à poste","Configurer un pare-feu et une liste d'accès"] },

  { code:"E", domaine:"Gestion de données",
    t:"Créer et gérer une base de données relationnelle",
    sous:"Concepts fondamentaux, contraintes d'intégrité, manipulation de la structure et des données avec MySQL.",
    memo:["sql"], annexes:["docs/Annexe-SQL.pdf"], aide:"Aide pédagogique 3SI1 — p. 6",
    blocs:[], eval:[], periode:"2e et 3e trimestres",
    atelier:"Base de données « Gestion du club informatique » : 4 tables au maximum, création avec l'outil visuel puis découverte des commandes SQL générées.",
    attendu:["Définir une BDR, son utilité et les fonctionnalités d'un SGBDR","Maîtriser les notions : table, relation (1:1, 1:n, n:m), enregistrement, champ, clés, contraintes","Manipuler la structure d'une BDR (créer, modifier, supprimer tables et colonnes)","Élaborer des requêtes SQL simples, sans jointures ni fonctions d'agrégat"] }
],
"4SI2": [
  { code:"A", domaine:"Gestion de données",
    t:"S'approprier les concepts fondamentaux d'une BDR",
    sous:"Contraintes d'intégrité, conversion entre représentation graphique et textuelle, évaluation et correction d'une représentation.",
    memo:["sql"], annexes:["docs/Annexe-SQL.pdf"], aide:"Aide pédagogique 4SI2 — p. 7",
    blocs:[8], eval:[10,11,14],
    atelier:"Activités autour de représentations erronées d'une base : détecter les anomalies puis proposer une correction répondant aux contraintes.",
    attendu:["Appliquer les contraintes de table, de domaine et d'intégrité référentielle","Convertir une représentation graphique en représentation textuelle et inversement","Évaluer et corriger la représentation d'une BDR"] },

  { code:"B", domaine:"Gestion de données",
    t:"Manipuler la structure d'une BDR en mode SQL",
    sous:"CREATE DATABASE / CREATE TABLE, ALTER TABLE (colonnes, types, contraintes), DROP TABLE / DATABASE.",
    memo:["sql"], annexes:["docs/Annexe-SQL.pdf"], aide:"Aide pédagogique 4SI2 — p. 8",
    blocs:[8], eval:[10,11,14],
    atelier:"Création de la base « Location de véhicules » (tables Vehicule, Client, Location) puis modification de la structure en mode SQL.",
    attendu:["Créer une base et des tables en SQL","Modifier la structure d'une table (ajouter, modifier, supprimer une colonne ou une contrainte)","Supprimer des tables et des bases de données"] },

  { code:"C", domaine:"Gestion de données",
    t:"Manipuler et interroger les données d'une BDR en mode SQL",
    sous:"INSERT, UPDATE, DELETE ; requêtes mono-table, jointures, requêtes imbriquées, fonctions d'agrégat et groupements.",
    memo:["sql"], annexes:["docs/Annexe-SQL.pdf"], aide:"Aide pédagogique 4SI2 — p. 8 (directive : sous-requêtes non corrélées)",
    blocs:[8], eval:[10,11,14],
    atelier:"Série de requêtes sur la base « Location » : consultations filtrées, statistiques par groupe, extraction de la ligne correspondant au maximum.",
    attendu:["Insérer, modifier et supprimer des lignes","Écrire des requêtes mono-table, avec jointures et avec sous-requêtes non corrélées","Utiliser les fonctions d'agrégat avec GROUP BY et HAVING","Importer et exporter des données et des structures au format SQL"] },

  { code:"D", domaine:"Systèmes, technologies et Internet",
    t:"Créer un site web interactif",
    sous:"HTML5 (&lt;datalist&gt;, événements clavier/souris/média), CSS3 (sélecteurs avancés, transformations), JavaScript (switch, while, DOM, fichier externe).",
    memo:["web","js","qualite"],
    annexes:["docs/Annexe-HTML5.pdf","docs/Annexe-CSS3.pdf","docs/Annexe-JavaScript.pdf"],
    aide:"Aide pédagogique 4SI2 — p. 9 à 11",
    blocs:[1,2,3,4,5,13], eval:[6,7,10,11,14],
    atelier:"Projet « Fleurs du Lycée » puis épreuves du Bac pratique : positionnement et float en CSS, interactivité et contrôle de formulaire en JavaScript (sans pattern).",
    attendu:["Réviser et consolider les éléments HTML5, les formulaires et les événements","Appliquer des sélecteurs CSS3 adaptés (attributs, états, sélecteurs de lien)","Ajouter des transformations, transitions et animations","Utiliser switch et while, accéder aux éléments (getElementById, getElementsByName) et modifier contenu, attributs et styles","Stocker le script dans un fichier externe et valider le code"] },

  { code:"E", domaine:"Systèmes, technologies et Internet",
    t:"Créer un site web dynamique (PHP et base de données)",
    sous:"Structure d'un script PHP, types de données, echo, require, $_GET / $_POST, connexion à une BD et exploitation des résultats.",
    memo:["php","sql"], annexes:["docs/Annexe-PHP.pdf","docs/Annexe-SQL.pdf"],
    aide:"Aide pédagogique 4SI2 — p. 11 et 12",
    blocs:[9,12,13], eval:[10,11,14],
    atelier:"Site dynamique « Carnet d'adresses » : formulaire d'ajout en POST, insertion en base, affichage des contacts par une requête SELECT, suppression avec confirmation.",
    attendu:["Reconnaître le principe de fonctionnement d'un site web dynamique et exploiter un environnement de travail","Manipuler variables, types, tableaux et structures de contrôle en PHP ; utiliser echo et require","Transmettre des données par URL ($_GET) et par formulaire ($_POST)","Se connecter à une BD, exécuter des requêtes SELECT, INSERT, DELETE, UPDATE et exploiter les résultats dans la page"] }
]
};

root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.competences = COMPETENCES;
})(typeof window !== 'undefined' ? window : globalThis);
