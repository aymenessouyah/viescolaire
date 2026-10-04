/* Répartition du 1er trimestre — contenu des documents officiels (3SI1 et 4SI2).
   Fichier de données — modifiable sans toucher au code de l'application.
   Sauvegarde distante / versionnement : voir README.md */
(function (root) {
'use strict';
const PLAN = {
  "3SI1": [
    { n:2, t:"Rappel HTML & CSS (2 séances)", k:"cours", o:"VS Code", d:"HTML5 / CSS3",
      det:"Révision et consolidation : structure d'un document HTML5, règles CSS3, mise en forme du texte, bordures et arrière-plan." },
    { n:2, t:"Rappel HTML & CSS (2 séances)", k:"cours", o:"VS Code", d:"HTML5 / CSS3",
      det:"Suite de la consolidation : listes, tableaux, images, liens et formulaires — validité du code HTML5/CSS3." },
    { n:2, t:"Position : absolute, relative, fixed, sticky — Flex", k:"cours", o:"VS Code", d:"HTML5 / CSS3",
      det:"Positionnement et dimensionnement des éléments ; conteneurs flexibles (display: flex)." },
    { n:2, t:"Projet « Fleurs du Lycée » : position + transition + animation + formulaire", k:"cours", o:"VS Code", d:"HTML5 / CSS3",
      det:"Entraînement sur un site réel : transitions et animations CSS3, création d'un formulaire complet." },
    { n:1, t:"Projet « Fleurs du Lycée » — suite : formulaire", k:"cours", o:"VS Code", d:"HTML5 / CSS3",
      det:"Finalisation du formulaire (types d'input, étiquettes, validation HTML5) et des styles associés." },
    { n:1, t:"Devoir de contrôle n°1", k:"dc", o:"Sujet + machine", d:"Évaluation",
      det:"Épreuve écrite/pratique du 1er trimestre sur HTML5, CSS3 et le positionnement." },
    { n:1, t:"Correction du devoir de contrôle n°1", k:"corr", o:"Copies + vidéoprojecteur", d:"Évaluation",
      det:"Correction détaillée, remédiation et retour sur les erreurs les plus fréquentes." },
    { n:2, t:"JavaScript : rôle, emplacement et syntaxe", k:"cours", o:"VS Code", d:"JavaScript",
      det:"Comment un navigateur affiche une page web ; rôle du JavaScript ; emplacement du code ; syntaxe et intégration d'un fichier externe — TP1 + TP2 + projet Fleurs (partie JS)." },
    { n:2, t:"Événements, affichage et entrées", k:"cours", o:"VS Code", d:"JavaScript",
      det:"Déclencheurs d'événements (onclick, oninput…), instructions d'affichage (alert, innerHTML, write), entrées via l'invite (prompt) et les champs de formulaire (getElementById) — TP2 + TP3." },
    { n:1, t:"Devoir de contrôle n°2", k:"dc", o:"Sujet + machine", d:"Évaluation",
      det:"Épreuve du 1er trimestre sur les bases du langage JavaScript et la manipulation du DOM." },
    { n:1, t:"Correction du devoir de contrôle n°2", k:"corr", o:"Copies + vidéoprojecteur", d:"Évaluation",
      det:"Correction détaillée et remédiation." },
    { n:2, t:"Traitements sur les objets et structures de contrôle", k:"cours", o:"VS Code", d:"JavaScript",
      det:"Les objets Date, String, Array, Number et Math ; méthodes prédéfinies ; portée des variables ; structures de contrôle ; manipulation de modules." },
    { n:2, t:"Série JavaScript : variables, fonctions, événements", k:"cours", o:"VS Code", d:"JavaScript",
      det:"Résolution d'une série d'exercices et consolidation des acquis avant la semaine des devoirs de synthèse." },
    { n:2, t:"Correction du devoir de synthèse n°1", k:"corr", o:"Copies + vidéoprojecteur", d:"Évaluation",
      det:"Correction et remise des copies du devoir de synthèse n°1 (semaine bloquée du 7 au 12 décembre 2026)." }
  ],
  "4SI2": [
    { n:1, t:"Rappel HTML & CSS", k:"cours", o:"VS Code", d:"HTML5 / CSS3",
      det:"Révision des notions de base : disposition d'un document HTML5 et règles CSS3." },
    { n:2, t:"Rappel HTML & CSS : position et display", k:"cours", o:"VS Code", d:"HTML5 / CSS3",
      det:"Position : absolute, relative, fixed, sticky ; display : inline, inline-block, block, flex." },
    { n:2, t:"Projet « Fleurs du Lycée » : position + transition + animation + formulaire", k:"cours", o:"VS Code", d:"HTML5 / CSS3",
      det:"Transitions et animations CSS3, formulaire complet et mise en page du projet." },
    { n:2, t:"Projet « Fleurs du Lycée » — partie JavaScript", k:"cours", o:"VS Code", d:"JavaScript",
      det:"Interactivité du projet : événements, validation des champs de formulaire en JavaScript (sans attribut pattern)." },
    { n:2, t:"Bac pratique 2024 — partie CSS + JavaScript", k:"cours", o:"VS Code", d:"Épreuve pratique",
      det:"Entraînement sur une épreuve du Baccalauréat pratique : exploitation de la partie CSS et JavaScript." },
    { n:1, t:"Devoir de contrôle n°1", k:"dc", o:"Sujet + machine", d:"Évaluation",
      det:"Épreuve du 1er trimestre : CSS3 (positionnement) et JavaScript." },
    { n:1, t:"Correction du devoir de contrôle n°1", k:"corr", o:"Copies + vidéoprojecteur", d:"Évaluation",
      det:"Correction détaillée et remédiation." },
    { n:2, t:"Base de données : LDD + LMD (rappel)", k:"cours", o:"MySQL / VS Code", d:"Bases de données",
      det:"Langage de définition de données et langage de manipulation : création de tables (CREATE, ALTER), insertion et requêtes SELECT simples." },
    { n:2, t:"Création d'un site web dynamique — introduction à PHP", k:"cours", o:"VS Code + serveur local", d:"PHP",
      det:"Principe de fonctionnement d'un site web dynamique ; structure de base d'un script PHP ; variables et types ; echo ; environnement de travail." },
    { n:1, t:"Devoir de contrôle n°2", k:"dc", o:"Sujet + machine", d:"Évaluation",
      det:"Épreuve du 1er trimestre : bases de données (SQL) et introduction au PHP." },
    { n:1, t:"Correction du devoir de contrôle n°2", k:"corr", o:"Copies + vidéoprojecteur", d:"Évaluation",
      det:"Correction détaillée et remédiation." },
    { n:2, t:"PHP : données, connexion à la base et requêtes", k:"cours", o:"VS Code + serveur local", d:"PHP / BD",
      det:"Récupération des données (formulaires, $_GET / $_POST), connexion avec la base de données, exécution de requêtes ; entrées/sorties, structures de données et types structurés en PHP." },
    { n:2, t:"Bac pratique 2018 & 2025 — CSS, JavaScript et PHP", k:"cours", o:"VS Code + serveur local", d:"Épreuve pratique",
      det:"Partie CSS (position + float), partie JavaScript, puis PHP (connexion + insertion dans la base de données)." },
    { n:1, t:"Correction du devoir de synthèse n°1", k:"corr", o:"Copies + vidéoprojecteur", d:"Évaluation",
      det:"Correction et remise des copies du devoir de synthèse n°1 (semaine bloquée du 7 au 12 décembre 2026)." }
  ]
};
root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.repartition = PLAN;
})(typeof window !== 'undefined' ? window : globalThis);
