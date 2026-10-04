/* Compétences et savoirs associés — aide pédagogique ministérielle STI.
   Fichier de données — modifiable sans toucher au code de l'application.
   Sauvegarde distante / versionnement : voir README.md */
(function (root) {
'use strict';
const PROGRAMME = {
  "3SI1": {
    titre:"3<sup>ème</sup> année SI — matière STI",
    sous:"Aide pédagogique 2024-2025 (document de référence du ministère de l'Éducation) — compétences et savoirs associés.",
    domaines:[
      { nom:"Systèmes, technologies et Internet", ico:"cpu", comps:[
        { code:"A", t:"Programmer un objet connecté", tri:["T2","T3"],
          items:["Configurer la communication réseau de l'objet connecté","Échanger des données via l'objet connecté","Tester le programme et le corriger","Écriture d'un programme en Micro-Python ou Arduino, téléversement sur carte ESP32"],
          piste:"Réviser les concepts et composants matériels d'un objet connecté : entrées, sorties, unité de traitement, supports de stockage, moyens de communication." },
        { code:"B", t:"Exploiter les fonctionnalités d'un système d'exploitation", tri:["T2"],
          items:["Définir un système d'exploitation","Distinguer les types de SE : PC (Windows, Linux, macOS), mobile (Android, iOS), embarqué (WatchOS, TVOS, QNX…)","Déployer un SE : installer, configurer et mettre à jour","Sécuriser un ordinateur (logiciels de protection, antivirus)"],
          piste:"Utiliser une machine virtuelle (VMware…) pour manipuler des systèmes d'exploitation propriétaires et libres." },
        { code:"C", t:"Acquérir les notions de base d'un réseau local", tri:["T2","T3"],
          items:["Définir un réseau et le classifier selon son étendue (LAN, WAN, MAN)","Paramétrer un composant réseau : adresse IP, DNS, masque réseau, adresse MAC","Reconnaître les architectures client/serveur et poste à poste","Sécuriser un réseau : pare-feu et listes d'accès"],
          piste:"Travailler sur des cas concrets issus de la vie de l'apprenant (salle informatique, réseau domestique)." },
        { code:"D", t:"Créer et publier un site web interactif", tri:["T1"],
          items:["HTML5 : balises d'en-tête (&lt;link&gt;, &lt;script&gt;, &lt;meta&gt;, &lt;title&gt;), conteneurs (&lt;div&gt;, &lt;span&gt;, &lt;iframe&gt;), structuration sémantique (&lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, &lt;section&gt;, &lt;article&gt;, &lt;aside&gt;, &lt;footer&gt;), multimédia (&lt;figure&gt;, &lt;figcaption&gt;, &lt;source&gt;), formulaires (date, time, email, tel, password, range, button)","Événements HTML : onfocus, onblur, onclick, oninput, onchange, onload","CSS3 : sélecteurs d'élément, d'identifiant, de classe, de groupe et universel ; mise en forme du texte, de l'arrière-plan et des bordures ; positionnement et dimensionnement ; animations et transitions","JavaScript : emplacement du script et fichier externe ; entrées (prompt) et sorties (innerHTML, write, alert) ; getElementById ; variables et constantes (let/const) ; types string, number, boolean, array, date ; portée locale et globale","Structures de contrôle : if, else, else if, switch ; for, while, do…while ; déclaration et appel de modules","Assurer la validité du code HTML5 et CSS3 (outils de validation, correction des erreurs et avertissements)"],
          piste:"Exploiter un éditeur Web WYSIWYG intégrant le HTML5 ; présenter les traitements sur les champs du formulaire sous forme de modules." }
      ]},
      { nom:"Gestion de données", ico:"db", comps:[
        { code:"E", t:"Créer et gérer une base de données relationnelle", tri:["T2","T3"],
          items:["Définir une BDR, son utilité et un SGBDR (fonctionnalités)","Notions : table, relation (1:1, 1:n, n:m), enregistrement, champ, clé primaire, clé étrangère, contraintes d'intégrité","Distinguer les contraintes : de table, de domaine, référentielle","Propriétés d'un champ : nom, type, taille, contraintes","Manipuler la structure : créer une BDR, ajouter / modifier / supprimer tables, colonnes et contraintes","Manipuler les données : consultation, ajout, suppression, modification"],
          piste:"Exemples de BDR simplifiées (4 tables au maximum) touchant le vécu de l'apprenant ; SGBDR MySQL ; requêtes SQL simples sans jointures ni fonctions agrégats ; convention : clé primaire soulignée, clé étrangère suivie de #." }
      ]}
    ]
  },
  "4SI2": {
    titre:"4<sup>ème</sup> année SI — matière STI",
    sous:"Aide pédagogique 2024-2025 (document de référence du ministère de l'Éducation) — compétences et savoirs associés.",
    domaines:[
      { nom:"Gestion de données", ico:"db", comps:[
        { code:"A", t:"S'approprier les concepts fondamentaux d'une BDR", tri:["T1","T3"],
          items:["Appliquer les contraintes d'intégrité : contrainte de table, de domaine et d'intégrité référentielle","Convertir une représentation graphique d'une BDR en représentation textuelle et inversement","Évaluer et corriger une représentation (textuelle/graphique) d'une BDR"],
          piste:"Activités construites autour de représentations erronées : détecter les anomalies puis proposer une correction. Convention : clé primaire soulignée, clé étrangère suivie du symbole #." },
        { code:"B", t:"Manipuler la structure d'une BDR en mode SQL", tri:["T1","T3"],
          items:["Créer une base de données et des tables (CREATE DATABASE / CREATE TABLE)","Modifier la structure d'une table : colonnes et contraintes (ALTER TABLE … ADD / DROP / MODIFY / ADD CONSTRAINT)","Supprimer des tables et des bases (DROP TABLE / DROP DATABASE)"],
          piste:"Faire découvrir toute commande SQL générée par l'outil visuel lors de la manipulation de la BDR." },
        { code:"C", t:"Manipuler et interroger les données en mode SQL", tri:["T1","T2","T3"],
          items:["Insérer, modifier et supprimer des données : INSERT, UPDATE, DELETE","Importation et exportation au format SQL (données et structure)","Requêtes mono-table, avec jointures, requêtes imbriquées (sous-requêtes non corrélées dans la clause WHERE)","Fonctions d'agrégat et groupements : COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING"],
          piste:"Adopter le standard SQL pour exploiter une BDR ; prévoir des activités d'importation / exportation au format SQL." }
      ]},
      { nom:"Systèmes, technologies et Internet", ico:"web", comps:[
        { code:"D", t:"Créer un site web interactif", tri:["T1"], 
          items:["HTML5 : intégrer &lt;datalist&gt; ; exploiter les événements onkeydown, onkeyup, onmouseover, onmouseout, onplay, onpause","CSS3 : sélecteurs de lien (:link, :visited), d'état (:hover, :focus), d'attributs (élément[attribut=valeur] ou élément[attribut])","Appliquer une transformation à un élément (transform)","JavaScript : structures switch et while ; accès aux éléments par getElementsByName ; modification du contenu, des attributs et des styles des éléments de la page","Le script JavaScript doit être stocké dans un fichier externe","Le contrôle d'un champ de formulaire est effectué en JavaScript, sans recours à l'attribut pattern"],
          piste:"Réviser et consolider les acquis des années précédentes : variables et portée, objets String, Array, Math, Date et Number, instructions d'affichage et d'entrée, structures de contrôle, fonctions, validation HTML5/CSS3." },
        { code:"E", t:"Créer un site web dynamique (PHP + base de données)", tri:["T1","T2"],
          items:["Reconnaître le principe de fonctionnement d'un site web dynamique et exploiter un environnement de travail","PHP : structure de base d'un script ; variables entières, réelles, booléennes, chaînes, tableaux indicés et associatifs ; instruction echo","Structures de contrôle : if ; for, while, do…while ; importation d'un fichier avec require","Transmission des données : variables superglobales $_GET et $_POST (URL et formulaire)","Interaction avec une base de données : connexion au serveur, sélection de la base, requêtes SELECT, INSERT, DELETE, UPDATE et exploitation des résultats dans la page web"],
          piste:"Habituer les apprenants à exploiter, en PHP, des requêtes SQL générées en mode assisté ; prévoir la manipulation de la date et de l'heure, ainsi que des traitements sur les objets string et array." }
      ]}
    ]
  }
};
root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.programme = PROGRAMME;
})(typeof window !== 'undefined' ? window : globalThis);
