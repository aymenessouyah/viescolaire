/* MÉMO CONSOLIDÉ — contenu des annexes de cours adapté aux compétences de l'aide pédagogique.
   Chaque rangée : [élément, description, exemple / repère, source]
   - « source » renvoie au fichier de l'annexe correspondante (onglet Annexes).
   - « seances » (facultatif) liste les séances du 1er trimestre qui traitent l'élément
     (b = bloc de la répartition ; le détail des dates est calculé par l'application). */
(function (root) {
'use strict';

const MEMO = [
/* ===================================================================== */
{
  id:"web", t:"C1 — Créer et publier un site web interactif : HTML5 &amp; CSS3", ico:"web",
  aide:"Aide pédagogique — 3SI1 : compétence D (site web interactif) ; 4SI2 : compétence D (créer un site web interactif).",
  sections:[
    { t:"Structure d'un document HTML5", src:"Annexe HTML5 — éléments de 1er niveau et d'en-tête",
      rows:[
        ["&lt;html&gt; &lt;head&gt; &lt;body&gt;","Racine du document, métadonnées (titre, liens, scripts) et corps de la page. Seuls les éléments d'en-tête se placent dans &lt;head&gt;.","&lt;html lang=\"fr\"&gt;\n &lt;head&gt;…&lt;/head&gt;\n &lt;body&gt;…&lt;/body&gt;\n&lt;/html&gt;","HTML5 · annexe de cours"],
        ["&lt;meta&gt;","Métadonnées : encodage des caractères, viewport (adaptation mobile), description.","&lt;meta charset=\"UTF-8\"&gt;\n&lt;meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"&gt;","HTML5"],
        ["&lt;title&gt; &lt;link&gt; &lt;style&gt;","Titre affiché dans l'onglet ; liaison des feuilles de style (href, rel, type) ; CSS interne.","&lt;link rel=\"stylesheet\" href=\"styles.css\" type=\"text/css\"&gt;","HTML5"],
        ["&lt;script&gt;","Intègre un script ou référence un fichier externe (src). Un élément avec src ne doit pas contenir de code.","&lt;script src=\"controles.js\"&gt;&lt;/script&gt;","JS · HTML5"]
      ]},
    { t:"Structuration sémantique et conteneurs", src:"Annexe HTML5 — structuration d'une page web",
      rows:[
        ["&lt;header&gt; &lt;nav&gt; &lt;main&gt; &lt;footer&gt;","En-tête (introduction ou navigation), ensemble de liens de navigation, contenu principal, pied de page.","&lt;header&gt;&lt;nav&gt;…&lt;/nav&gt;&lt;/header&gt;","HTML5 · séances 1 à 4"],
        ["&lt;section&gt; &lt;article&gt; &lt;aside&gt;","Section du document, contenu indépendant et autonome, contenu hors du flux principal (barre latérale).","&lt;article&gt;&lt;h2&gt;…&lt;/h2&gt;&lt;/article&gt;","HTML5"],
        ["&lt;div&gt; &lt;span&gt; &lt;iframe&gt;","Conteneur de blocs, regroupement en ligne, cadre en ligne (src, name).","&lt;div class=\"carte\"&gt;…&lt;/div&gt;","HTML5"],
        ["&lt;details&gt; &lt;summary&gt;","Bloc de détails que l'utilisateur ouvre et ferme à la demande (attribut open) et son en-tête visible.","&lt;details&gt;&lt;summary&gt;Plus d'infos&lt;/summary&gt;…&lt;/details&gt;","HTML5"]
      ]},
    { t:"Texte, listes, tableaux et médias", src:"Annexe HTML5 — textes et médias, listes, tableaux",
      rows:[
        ["&lt;h1&gt;…&lt;h6&gt; &lt;p&gt; &lt;br&gt; &lt;hr&gt;","Titres de niveau 1 à 6, paragraphe, retour à la ligne, séparateur thématique.","&lt;h1&gt;Le fleuriste du Rafèha&lt;/h1&gt;","HTML5"],
        ["&lt;ul&gt; &lt;ol&gt; &lt;li&gt;","Liste à puces, liste ordonnée (reversed ; type a/A/i/I/1 ; start) et élément de liste.","&lt;ol start=\"2\" type=\"I\"&gt;&lt;li&gt;Choix&lt;/li&gt;&lt;/ol&gt;","HTML5"],
        ["&lt;table&gt; &lt;thead&gt; &lt;tbody&gt; &lt;tfoot&gt;","Tableau, en-tête, corps et pied ; légende avec &lt;caption&gt; ; lignes &lt;tr&gt;, cellules &lt;th&gt; et &lt;td&gt;.","&lt;table border=\"1\"&gt;&lt;caption&gt;Choix&lt;/caption&gt;…&lt;/table&gt;","HTML5 — séances 1 à 4"],
        ["&lt;img&gt; &lt;figure&gt; &lt;figcaption&gt;","Image (src, alt, srcset, width/height) ; conteneur autonome avec légende pour une image, une vidéo ou un code.","&lt;img src=\"media/orchidee.jpg\" alt=\"orchidee\"&gt;","HTML5"],
        ["&lt;audio&gt; &lt;video&gt; &lt;source&gt;","Contenus sonore et vidéo (controls) et déclaration de plusieurs ressources multimédias (src, type).","&lt;video controls&gt;&lt;source src=\"flower.webm\" type=\"video/webm\"&gt;&lt;/video&gt;","HTML5"],
        ["&lt;a&gt; &lt;address&gt; &lt;cite&gt; &lt;mark&gt; &lt;output&gt;","Lien hypertexte (href, target), coordonnées de l'auteur, titre d'une œuvre, texte en surbrillance, conteneur de résultat de calcul.","&lt;a href=\"contact.html\" target=\"_blank\"&gt;Contact&lt;/a&gt;","HTML5"]
      ]},
    { t:"Formulaires HTML5", src:"Annexe HTML5 — éléments de formulaire",
      rows:[
        ["&lt;form&gt;","Crée un formulaire : action (traitement), method (get / post), target (_self, _blank, _parent, _top, nom de cadre).","&lt;form action=\"traitement.php\" method=\"post\"&gt;","HTML5 · séances 7 à 9 (3SI1)"],
        ["&lt;fieldset&gt; &lt;legend&gt; &lt;label&gt;","Groupe de champs, légende du groupe et libellé associé à un champ (attribut for).","&lt;fieldset&gt;&lt;legend&gt;Inscription&lt;/legend&gt;&lt;label for=\"nom\"&gt;Nom&lt;/label&gt;","HTML5"],
        ["Types de &lt;input&gt;","button, reset, submit &bull; text, email, tel &bull; password &bull; number, range (min, max) &bull; date, time (min, max) &bull; checkbox, radio (checked) — attributs communs : name, value, placeholder, readonly, required, disabled, list.","&lt;input type=\"range\" name=\"age\" min=\"10\" max=\"120\"&gt;","HTML5"],
        ["&lt;select&gt; &lt;option&gt; &lt;datalist&gt; &lt;textarea&gt;","Liste déroulante, option (selected), liste d'options prédéfinies reliée à un champ par l'attribut list (4SI2), zone de texte multilignes (cols, rows, maxlength).","&lt;input list=\"pays\"&gt;&lt;datalist id=\"pays\"&gt;&lt;option value=\"Tunisie\"&gt;&lt;/datalist&gt;","HTML5 — 4SI2 : &lt;datalist&gt;"]
      ]},
    { t:"Sélecteurs CSS3", src:"Annexe CSS3 — sélecteurs",
      rows:[
        ["Sélecteurs de base","* universel &bull; element (type) &bull; #id &bull; .class &bull; element.class &bull; regroupement par virgules « , ».","h1, .titre, #entete { color: #0b2545; }","CSS3 · séances 1 à 4"],
        ["Sélecteurs d'attributs","element[attr] &bull; element[attr=valeur] et opérateurs avancés : ^= (commence par), *= (contient), $= (finit par), indicateurs i (insensible à la casse) et s (sensible).","a[href$=\".org\"] { color: red; }","CSS3 — 4SI2"],
        ["Sélecteurs de lien et d'état","a:link, a:visited (liens non visités / visités) ; a:hover, a:focus, a:active (survol, focus, activation).","a:hover { background-color: gold; }","CSS3"]
      ]},
    { t:"Boîtes, mise en forme et positionnement", src:"Annexe CSS3 — propriétés des boîtes, texte, bordures, arrière-plan",
      rows:[
        ["width, height, margin, padding, box-shadow","Dimensions, marges, marge intérieure (1 à 4 valeurs : haut ; droite ; bas ; gauche), ombre de la boîte.","padding: 10px 20px 5px 0;","CSS3 · séances 3 à 6"],
        ["position, top/bottom/left/right, float, display","Positionnement absolute, fixed, relative, static, sticky ; décalages ; float (left, right, none) ; affichage inline, block, inline-block, flex.","position: sticky; top: 0;","CSS3 — séances 5-6 (3SI1) et 2-4 (4SI2)"],
        ["overflow, opacity, z-index","Débordement du contenu (visible, hidden, clip, scroll, auto), transparence, ordre d'empilement.","overflow: auto; opacity: 0.8;","CSS3"],
        ["Texte","font-family, font-weight, font-style, font-size, font (super-propriété), text-align, text-shadow, text-transform, color.","font: italic bold 16px Georgia, serif;","CSS3"],
        ["Bordures et arrière-plan","border-color, border-style, border-width, border-radius, border (super-propriété) ; background-color, background-image, background-repeat, background-size, background.","border-radius: 25% 10%;\nbackground: url(\"starsolid.gif\") #99f repeat-y fixed;","CSS3"],
        ["Listes et tableaux","list-style-type, list-style-position, list-style-image, list-style ; table-layout, border-collapse.","list-style: square inside;","CSS3"]
      ]},
    { t:"Transitions, animations, transformations et filtres", src:"Annexe CSS3 — transition, animation, transformation, filtres",
      rows:[
        ["transition-*","transition-property, transition-duration, transition-delay et super-propriété transition : changement progressif de propriétés après un changement d'état.","transition: width 2s, transform 2s;\n.box:hover { width: 200px; transform: rotate(180deg); }","CSS3 — projet « Fleurs du Lycée »"],
        ["@keyframes et animation-*","animation-name, animation-duration, animation-delay, animation-iteration-count, animation-direction et super-propriété animation : contrôle du déclenchement et de la progression.","@keyframes glisse { from{left:0} to{left:300px} }\nanimation: glisse 3s linear infinite alternate;","CSS3 — séances 7-8"],
        ["transform","rotate() rotation, skew() inclinaison, scale() échelle, translate() déplacement selon un vecteur.","transform: scale(1.2) rotate(5deg);","CSS3 — 4SI2"],
        ["filter","blur() flou gaussien, grayscale() niveaux de gris, invert() inversion des couleurs.","filter: grayscale(80%);","CSS3"],
        ["Différence animations / transitions","La transition suit un changement d'état ; l'animation offre plus de liberté et de contrôle (états clés, répétition, direction).","","CSS3 — à traiter en synthèse"]
      ]}
  ]
},
/* ===================================================================== */
{
  id:"js", t:"C2 — Interactivité : JavaScript", ico:"js",
  aide:"Aide pédagogique — 3SI1 : compétence D (langage JavaScript) ; 4SI2 : compétence D (structures switch / while, modification du DOM).",
  sections:[
    { t:"Intégration et syntaxe", src:"Annexe JavaScript — généralités",
      rows:[
        ["Emplacement du script","Repérer l'emplacement du script dans la page et l'intégrer à partir d'un fichier externe ; le script doit être stocké dans un fichier externe (4SI2).","&lt;script src=\"script.js\"&gt;&lt;/script&gt;","JS · séances 12-13 (3SI1)"],
        ["Variables et constantes","Déclaration explicite (let, const) ou implicite ; distinction de la portée locale et globale.","let age = 15;\nconst TVA = 0.19;","JS"],
        ["Types de données","string, number, boolean, array et date ; littéraux de tableau [ ] pour créer un tableau.","let notes = [12, 15, 8];","JS"],
        ["Conversion et test","isNaN(ch), Number(ch), parseInt(ch [,base]), parseFloat(ch), String(a) ; Number.isNaN() teste strictement la valeur NaN.","parseInt(\"101\", 2); // 5\nNumber(\"blabla\"); // NaN","JS"],
        ["Modules","Déclarer un module et l'appeler : organisation des traitements sur les champs d'un formulaire.","function verifierNom() { … }","JS — recommandation de l'aide pédagogique"]
      ]},
    { t:"Entrées, sorties et interaction avec l'utilisateur", src:"Annexe JavaScript — entrées / sorties et tableaux comparatifs",
      rows:[
        ["prompt()","Boîte de dialogue avec zone de saisie : retourne le texte saisi ou null. À utiliser avec parcimonie.","var nom = prompt(\"Votre nom ?\");","JS · séances 14-15 (3SI1)"],
        ["alert()","Boîte de message (bouton OK uniquement) ; retourne undefined.","alert(\"Bonjour \" + nom);","JS"],
        ["confirm()","Question Oui/Non : retourne true (OK) ou false (Annuler) — adapté aux validations (suppression…).","if (confirm(\"Supprimer ?\")) { … }","JS — complément"],
        ["document.write()","Écrit pendant le chargement de la page ; remplace tout le document s'il est utilisé après chargement : obsolète.","document.write(\"&lt;h2&gt;Bienvenue&lt;/h2&gt;\");","JS"],
        ["innerHTML / textContent","Modifier le contenu d'un élément HTML (innerHTML accepte du HTML) ou insérer du texte brut (textContent) — solutions modernes recommandées.","document.getElementById(\"res\").innerHTML = total;\ndocument.getElementById(\"msg\").textContent = \"Texte brut\";","JS"]
      ]},
    { t:"Accès et modification des éléments HTML", src:"Annexe JavaScript — sélection et modification",
      rows:[
        ["getElementById() / getElementsByName()","Sélectionner un élément unique par son identifiant / tous les éléments partageant le même nom (4SI2).","var v = document.getElementById(\"nom\").value;","JS · séances 14-15"],
        ["element.attribut = valeur","Modifier la valeur d'un attribut. Se limiter à value, checked, disabled, readonly, src, muted.","document.getElementById(\"ok\").checked = true;","JS"],
        ["element.style.propriété","Modifier le style d'un élément. Se limiter à color, background, border, font, width, height.","boite.style.background = \"#e9f2fb\";","JS"],
        ["selectedIndex","Pour une liste déroulante &lt;select&gt;, récupérer l'indice de l'option sélectionnée.","var i = document.getElementById(\"fp\").selectedIndex;","JS"],
        ["play() / pause()","Démarrer ou mettre en pause un média ; on peut préparer la lecture avec currentTime, volume (0 à 1) et playbackRate (0.5 à 2).","video.currentTime = 10; video.volume = 0.5; video.play();","JS — 4SI2 (onplay, onpause)"]
      ]},
    { t:"Structures de contrôle", src:"Annexe JavaScript — structures de contrôle (aide pédagogique) + annexe de cours",
      rows:[
        ["Conditionnelles","if, else, else if et switch : choisir le traitement selon la valeur ou la condition.","switch (jour) { case \"lundi\": … break; default: … }","JS · séances 18-19"],
        ["Itératives","for, while et do…while : répéter un traitement.","for (let i = 0; i &lt; notes.length; i++) { total += notes[i]; }","JS"],
        ["Fonctions","Déclaration et appel de fonction ; choix des structures de données et de contrôle appropriées.","function moyenne(t) { … }","JS"]
      ]},
    { t:"Objets prédéfinis", src:"Annexe JavaScript — Math, String, Array, Date",
      rows:[
        ["Math","abs(x), sqrt(x), round(x), trunc(x), random() dans [0, 1[.","Math.round(Math.random() * 100);","JS · séances 18-19"],
        ["String","length, indexOf(ch [,p]), lastIndexOf, substring(d, f) (f non compris, arguments négatifs traités comme 0, inversés si d &gt; f), replace, toLowerCase, toUpperCase, trim, String.fromCharCode().","var s = \"Mozilla\"; s.substring(0,3); // \"Moz\"","JS"],
        ["Array","Propriété length et littéraux [ ] ; parcours par indices.","notes.length; notes[0];","JS"],
        ["Date","new Date() et ses 9 constructeurs (année, mois, jour, heures, minutes, secondes, ms, millisecondes, chaîne) ; getDate() 1-31, getMonth() 0-11, getFullYear(), toString() ; formats ISO, court et long.","var d = new Date(); d.getFullYear();\nnew Date(\"2026-09-15\");","JS — 3SI1 : séances 18-19"]
      ]},
    { t:"Événements", src:"Annexe HTML5 — événements + annexe JavaScript",
      rows:[
        ["Événements de base","onclick, oninput, onchange, onfocus, onblur, onload : déclenchement d'un traitement au clic, à la saisie ou au chargement.","&lt;input id=\"nom\" oninput=\"verifier()\"&gt;","HTML5 · séances 14-15"],
        ["Événements complémentaires","onmouseover, onmouseout, onplay, onpause, onsubmit, onkeydown, onkeyup (4SI2).","&lt;input onkeydown=\"filtre(event)\"&gt;","HTML5 — 4SI2"],
        ["Validation d'un formulaire","Le contrôle des champs se fait en JavaScript, sans utiliser l'attribut pattern ; traitement de chaque champ sous forme de module.","function validerMail(ch) { return ch.includes(\"@\"); }","JS — directive de l'aide pédagogique"]
      ]}
  ]
},
/* ===================================================================== */
{
  id:"sql", t:"C3 — Gestion de données : bases de données et SQL", ico:"db",
  aide:"Aide pédagogique — 3SI1 : compétence E (créer et gérer une BDR) ; 4SI2 : compétences A, B et C (concepts, structure, interrogation).",
  sections:[
    { t:"Concepts fondamentaux d'une BDR", src:"Annexe SQL + aide pédagogique (convention d'écriture)",
      rows:[
        ["Terminologie","Table (relation), enregistrement (ligne), champ (colonne), clé primaire, clé étrangère, contraintes d'intégrité.","","SQL · 3SI1 : séances 22-23"],
        ["Cardinalités","Relation un à un (1:1), un à plusieurs (1:n), plusieurs à plusieurs (n:m).","1 : n","SQL — convention"],
        ["Représentation textuelle","Clé primaire soulignée, clé étrangère suivie du symbole # ; convertir une représentation graphique en représentation textuelle et inversement (4SI2).","Client(<u>NCIN_Cli</u>, nom, ville)\nLocation(<u>immat#</u>, <u>NCIN_Cli#</u>, date_loc)","SQL"],
      ]},
    { t:"LDD — définition et modification des données", src:"Annexe SQL — partie LDD",
      rows:[
        ["CREATE DATABASE / DROP DATABASE","Créer ou supprimer une base de données.","CREATE DATABASE Gestion_Location;","SQL · 4SI2 : séances 12-13"],
        ["CREATE TABLE","Créer une table : colonne1 type1 [contrainte], … ; contraintes de colonne et de table.","CREATE TABLE Vehicule(\n  immat_Vehicule VARCHAR(10) PRIMARY KEY,\n  marque VARCHAR(20) NOT NULL CHECK(marque IN ('Peugeot','Renault','Fiat')),\n  date_acq YEAR NOT NULL\n);","SQL"],
        ["Contraintes d'intégrité","NOT NULL, DEFAULT, CHECK, PRIMARY KEY, UNIQUE, FOREIGN KEY, REFERENCES, ON UPDATE CASCADE, ON DELETE CASCADE.","FOREIGN KEY (NCIN_Cli) REFERENCES Client(NCIN_Cli) ON DELETE CASCADE","SQL · 4SI2 : compétence A"],
        ["Clé primaire composée","CONSTRAINT nom PRIMARY KEY(colonne1, colonne2).","CONSTRAINT PK_Location PRIMARY KEY(immat_Vehicule, NCIN_Cli)","SQL"],
        ["Astuce dates","Pour attribuer la date du jour par défaut, utiliser le type timestamp, sinon la valeur DEFAULT CURRENT_TIMESTAMP ne fonctionne pas avec le type date.","date_loc TIMESTAMP DEFAULT CURRENT_TIMESTAMP CHECK(date_loc &lt;= NOW())","SQL"],
        ["ALTER TABLE","ADD COLUMN, MODIFY COLUMN (type ou DEFAULT), DROP COLUMN, ADD CONSTRAINT, DROP PRIMARY KEY / ADD PRIMARY KEY, DROP CONSTRAINT, ENABLE / DISABLE KEYS, RENAME TO.","ALTER TABLE Client MODIFY COLUMN Ville VARCHAR(20) DEFAULT 'Tunis';","SQL"],
        ["DROP TABLE","Supprimer une table.","DROP TABLE Client;","SQL"]
      ]},
    { t:"Types de données SQL", src:"Annexe SQL — types",
      rows:[
        ["Numériques et texte","INT &bull; DECIMAL &bull; CHAR (longueur fixe) &bull; VARCHAR (longueur variable) &bull; TEXT (longueur variable non fixée).","VARCHAR(20), DECIMAL(8,3)","SQL"],
        ["Dates et heures","DATE (2024-11-04) &bull; TIME (23:44:05) &bull; DATETIME (2024-11-04 23:44:05) &bull; YEAR (2024).","date_loc DATE, heure TIME","SQL"]
      ]},
    { t:"LMD — manipulation et interrogation", src:"Annexe SQL — partie LMD",
      rows:[
        ["INSERT / UPDATE / DELETE","Insérer des lignes, mettre à jour des colonnes (SET … WHERE), supprimer des lignes.","UPDATE Employe SET Salaire = Salaire * 1.15\nWHERE anciennete &gt; 10;","SQL · 4SI2 : séances 12-13"],
        ["SELECT mono-table","SELECT [DISTINCT] expression [[AS] alias] FROM table [WHERE condition] [ORDER BY expression [ASC|DESC]].","SELECT des_art, pv_art FROM articles\nWHERE pv_art &gt; 500 ORDER BY pv_art DESC;","SQL"],
        ["Opérateurs","= &bull; &lt;&gt; &bull; &gt; &bull; &lt; &bull; &gt;= &bull; &lt;= &bull; IN &bull; BETWEEN &bull; LIKE &bull; IS &bull; AND &bull; OR &bull; NOT.","WHERE ville IN ('Tunis','Ariana')\nAND pv_art BETWEEN 100 AND 500","SQL"],
        ["Fonctions d'agrégation et groupements","COUNT, SUM, AVG, MIN, MAX avec GROUP BY et HAVING.","SELECT Cod_cli, COUNT(*) \"Nombre d'achats\"\nFROM ventes GROUP BY Cod_cli\nHAVING COUNT(*) &gt;= 2;","SQL — 4SI2 : compétence C"],
        ["Requêtes imbriquées","Sous-requêtes non corrélées dans la clause WHERE (limite fixée par l'aide pédagogique).","SELECT des_art FROM articles\nWHERE pv_art = (SELECT MAX(pv_art) FROM articles);","SQL"],
        ["Jointures","Requêtes avec jointures entre plusieurs tables : associer les tables sans produit cartésien inutile.","SELECT c.nom, l.date_loc\nFROM Client c JOIN Location l\nON c.NCIN_Cli = l.NCIN_Cli;","SQL"]
      ]},
    { t:"Fonctions SQL sur les chaînes et les dates", src:"Annexe SQL — fonctions de chaînes et de dates",
      rows:[
        ["CONCAT() / LENGTH()","Concaténer plusieurs colonnes en une seule chaîne ; calculer la longueur d'une chaîne.","SELECT CONCAT(prenom, ' ', nom) AS affichage FROM utilisateur;\nWHERE LENGTH(telephone) &lt; 10","SQL"],
        ["SUBSTRING() / SUBSTR()","Segmenter une chaîne : SUBSTRING(chaine, debut) &bull; (chaine FROM debut) &bull; (chaine, debut, longueur) &bull; (chaine FROM debut FOR longueur).","SUBSTR(nom_colonne, 2)","SQL"],
        ["LEFT() / RIGHT()","Extraire les premiers / derniers caractères d'une chaîne selon une longueur.","LEFT('abcdefghij', 2); -- 'ab'\nRIGHT('abcdefghij', 3); -- 'hij'","SQL"],
        ["TIMESTAMP() / NOW()","Transformer une date en DATETIME (ou combiner date et heure) ; retourner la date et l'heure du système.","SELECT TIMESTAMP(\"2024-09-15\", \"10:35\"); -- 2024-09-15 10:35:00","SQL"],
        ["DAY, MONTH, YEAR","Extraire le jour (DAY, DAYNAME, DAYOFWEEK, DAYOFYEAR), le mois et l'année d'une date.","SELECT MONTH('2026-09-15'); -- 9","SQL"],
        ["DATEADD() / DATEDIFF()","Ajouter un intervalle à une date ; différence entre deux dates.","SELECT DATEADD(month, 3, '2026/09/15');\nSELECT DATEDIFF(year, '2026/09/15', '2027/09/15');","SQL"]
      ]}
  ]
},
/* ===================================================================== */
{
  id:"php", t:"C4 — Site web dynamique : PHP et MySQL", ico:"server",
  aide:"Aide pédagogique — 4SI2 : compétence E (créer un site web dynamique) : transmission des données, interaction avec une BD.",
  sections:[
    { t:"Principes et structure d'un script", src:"Annexe PHP — pages web dynamiques",
      rows:[
        ["Principe d'un site dynamique","PHP (Personal Home Page Hypertext Preprocessor) s'intègre aux pages HTML et permet de réaliser des pages dynamiques : le code est exécuté côté serveur, la page est générée avant d'être envoyée au navigateur.","&lt;?php echo \"Bonjour\"; ?&gt;","PHP · 4SI2 : séances 14-15"],
        ["Constantes et concaténation","Constante déclarée avec define() ; le signe . concatène les chaînes.","echo(\"&lt;hr&gt;\" . $ecole);","PHP"],
        ["require","Importer le contenu d'un fichier PHP dans un autre.","require \"entete.php\";","PHP"]
      ]},
    { t:"Variables, types et transtypage", src:"Annexe PHP — variables et types",
      rows:[
        ["Types","int (entier), float (réel), string (chaîne), bool (booléen), array (tableau).","$age = 16; $nom = \"Amine\"; $ok = true;","PHP"],
        ["Transtypage","(int), (float), (string), (bool), (array) et fonction settype($var, \"type\").","settype($x, \"integer\");","PHP"],
        ["gettype / is_* / isset / unset","Connaître le type (« integer », « double », « string », « array »…), tester le type, vérifier qu'une variable possède une valeur, détruire une variable.","gettype($x); // double\nif (is_array($t)) { … }\nisset($x);","PHP"],
        ["Opérateurs","Logiques && , || , ! &bull; comparaison == , != , &lt; , &lt;= , &gt; , &gt;= &bull; arithmétiques + , - , * , / , % &bull; affectation = &bull; concaténation .","","PHP"],
        ["Affichage et contrôles","Instruction d'affichage echo ; conditionnelle if ; itératives for, while et do…while.","if ($note &gt;= 10) echo \"Admis\";","PHP · 4SI2 : séances 14-15"]
      ]},
    { t:"Chaînes de caractères et tableaux", src:"Annexe PHP — chaînes et tableaux",
      rows:[
        ["Fonctions de chaînes","strlen (longueur), substr (segment), trim (nettoyage), str_replace, strrev, chr, ord, strpos, strcmp / strcasecmp, strtolower, strtoupper.","strlen('abcdef'); // 6\nsubstr('abcdef', 1, 3); // bcd","PHP"],
        ["Accès à un caractère","Une chaîne est un ensemble de caractères ; l'accès se fait par indice, en commençant à 0.","$s = \"Il était une fois\"; echo $s[4]; // t","PHP"],
        ["Tableaux indicés et associatifs","Indices entiers (premier indice 0) ou indices de type chaîne ; on peut stocker des types différents dans un même tableau.","$tab = array('P', 2);\n$vente = array('lundi'=&gt;7, 'mardi'=&gt;5);","PHP — 4SI2 : types de données structurées"],
        ["Initialisation et parcours","Affectation directe ($tab[0] = … ou $tab[] = …) ou array() ; parcours du pointeur interne : current, key, reset, next, prev, end, sizeof.","$tab[] = \"Tunis\";\nwhile (current($vente)) { … next($vente); }","PHP"],
        ["Tri","sort (croissant), rsort (décroissant) ; ksort et krsort pour trier par indice.","sort($notes);","PHP"],
        ["Implode / explode","Rassembler les éléments d'un tableau en une chaîne / transformer une chaîne en tableau selon un séparateur.","$ch = implode(\",\", $t);\n$pieces = explode(\" \", \"piece1 piece2\");","PHP"]
      ]},
    { t:"Transmission des données", src:"Annexe PHP + aide pédagogique (superglobales)",
      rows:[
        ["$_GET et $_POST","Tableaux associatifs des valeurs transmises au script : paramètres d'URL ($_GET) et champs d'un formulaire ($_POST).","$nom = $_POST['nom'];\n$page = $_GET['page'];","PHP — 4SI2 : compétence E"],
        ["Envoi par URL ou par formulaire","Transmettre des données via une URL en utilisant $_GET ou via un formulaire en utilisant $_POST.","&lt;form method=\"post\"&gt;…&lt;/form&gt;","PHP"]
      ]},
    { t:"Interaction avec une base de données MySQL", src:"Annexe PHP — utiliser MySQL avec PHP",
      rows:[
        ["mysqli_connect()","Définir la connexion au serveur de base de données (hôte, utilisateur, mot de passe).","$cn = mysqli_connect(\"localhost\", \"root\", \"\");","PHP · 4SI2 : séances 19-20"],
        ["mysqli_select_db()","Sélectionner la base de données à utiliser.","mysqli_select_db($cn, \"Gestion_Location\");","PHP"],
        ["mysqli_query()","Exécuter une requête : envoie au serveur MySQL une instruction SQL à exécuter (SELECT, INSERT, DELETE, UPDATE).","$r = mysqli_query($cn, \"SELECT * FROM Client\");","PHP"],
        ["mysqli_fetch_array()","Exploiter le résultat : extraire la ligne courante sous forme de tableau associatif.","while ($l = mysqli_fetch_array($r)) { echo $l['nom']; }","PHP"],
        ["mysqli_num_rows() / affected_rows()","Nombre d'enregistrements retournés par une sélection / nombre de lignes modifiées par un UPDATE.","$n = mysqli_num_rows($r);","PHP"],
        ["mysqli_insert_id() / mysqli_error()","Dernier identifiant généré par un champ AUTO_INCREMENT / retour de l'erreur MySQL.","echo mysqli_insert_id($cn);\necho mysqli_error($cn);","PHP"],
        ["Mode assisté","Habituer les apprenants à exploiter, en PHP, des requêtes SQL générées en mode assisté.","","Aide pédagogique — directive"]
      ]},
    { t:"Fonctions date et heure", src:"Annexe PHP — types date et heure",
      rows:[
        ["Timestamp","Entier long représentant le nombre de secondes écoulées depuis le 1er janvier 1970 à 00:00:00 GMT.","","PHP"],
        ["checkdate(m, j, a)","Vérifie la validité d'une date : année entre 1 et 32767, mois entre 1 et 12, jour existant dans le mois (années bissextiles prises en compte). L'ordre des arguments n'est pas l'ordre français.","if (checkdate(11, 30, 2026)) { … }","PHP"],
        ["date(format [, timestamp])","Formate une date et la retourne sous forme de chaîne (date courante si aucun timestamp).","date(\"d/m/Y H:i:s\");","PHP"],
        ["getdate([timestamp])","Tableau associatif : seconds, minutes, hours, mday, wday, mon, year, yday, weekday, month.","$a = getdate(); echo $a[\"hours\"];","PHP"],
        ["time() / mktime()","Timestamp courant / timestamp correspondant aux arguments fournis (année, mois, jour, heures, minutes, secondes).","$t = mktime(12, 30, 0, 9, 15, 2026);","PHP"],
        ["strtotime()","Lit une date au format anglais et la transforme en timestamp, relativement à la date courante.","strtotime(\"+1 week 2 days\");","PHP"]
      ]}
  ]
},
/* ===================================================================== */
{
  id:"systemes", t:"C5 — Systèmes, réseaux et objets connectés (3SI1)", ico:"cpu",
  aide:"Aide pédagogique — 3SI1 : compétences A (objets connectés), B (systèmes d'exploitation) et C (réseaux).",
  sections:[
    { t:"Objets connectés", src:"Aide pédagogique 3SI1 — compétence A",
      rows:[
        ["Concepts fondamentaux","Définir un objet connecté, ses composants matériels : entrées, sorties, unité de traitement, supports de stockage, moyens de communication.","","Aide pédagogique 3SI1"],
        ["Programmation","Écrire un programme en Micro-Python ou Arduino pour échanger des données au sein d'un réseau personnel ou local.","from machine import Pin","Aide pédagogique 3SI1"],
        ["Communication réseau","Configurer la communication réseau de l'objet connecté, échanger des données, tester le programme et le corriger.","","Aide pédagogique 3SI1"],
        ["Téléversement","Téléverser un programme dans la carte ESP32 pour tester son fonctionnement.","","Aide pédagogique 3SI1"]
      ]},
    { t:"Systèmes d'exploitation", src:"Aide pédagogique 3SI1 — compétence B",
      rows:[
        ["Définition et types","Définir un système d'exploitation et distinguer ses types : PC (Windows, Linux, macOS), mobiles (Android, iOS), embarqués (WatchOS, TVOS, QNX…).","","Aide pédagogique 3SI1"],
        ["Déploiement","Installer, configurer et mettre à jour un système d'exploitation ; utiliser une machine virtuelle (VMware…) pour manipuler des systèmes propriétaires et libres.","","Aide pédagogique 3SI1"],
        ["Sécurisation","Sécuriser un ordinateur à l'aide de logiciels de protection (antivirus, pare-feu).","","Aide pédagogique 3SI1"]
      ]},
    { t:"Réseaux locaux", src:"Aide pédagogique 3SI1 — compétence C",
      rows:[
        ["Définition et classification","Définir un réseau et le classifier selon son étendue : LAN, WAN, MAN.","","Aide pédagogique 3SI1"],
        ["Paramétrage","Paramétrer un composant réseau : adresse IP, serveurs DNS, masque réseau et adresse MAC.","","Aide pédagogique 3SI1"],
        ["Architectures","Reconnaître les architectures client/serveur et poste à poste.","","Aide pédagogique 3SI1"],
        ["Sécurisation réseau","Configurer le pare-feu et la liste d'accès pour sécuriser les postes de travail d'un réseau.","","Aide pédagogique 3SI1"]
      ]}
  ]
},
/* ===================================================================== */
{
  id:"qualite", t:"C6 — Validation et bonnes pratiques", ico:"check",
  aide:"Aide pédagogique — 3SI1 : assurer la validité du code HTML5 et CSS3 ; 4SI2 : script externe et contrôle en JavaScript.",
  sections:[
    { t:"Validation des documents", src:"Aide pédagogique — 3SI1",
      rows:[
        ["Outils de validation","Utiliser des outils de validation du code HTML5 et CSS3.","https://validator.w3.org","Aide pédagogique 3SI1"],
        ["Correction","Corriger les erreurs et les avertissements détectés par les validateurs.","","Aide pédagogique 3SI1"],
        ["Attributs des éléments","Pour chaque élément HTML, traiter les attributs qui lui correspondent (voir annexe).","","Aide pédagogique — directive"]
      ]},
    { t:"Bonnes pratiques imposées par le programme", src:"Aide pédagogique — directives",
      rows:[
        ["Fichier JavaScript externe","Le script JS doit être stocké dans un fichier externe (4SI2).","&lt;script src=\"controles.js\"&gt;&lt;/script&gt;","Aide pédagogique 4SI2"],
        ["Contrôle sans pattern","Le contrôle d'un champ de formulaire doit être effectué en JavaScript, sans utiliser l'attribut pattern.","function valider(ch) { … }","Aide pédagogique 4SI2"],
        ["Unités CSS","Pour exprimer les dimensions, se limiter aux unités pixel (px) et pourcentage (%).","width: 100%; height: 200px;","Aide pédagogique"],
        ["Requêtes SQL","Se limiter aux sous-requêtes non corrélées dans la clause WHERE ; adopter le standard SQL ; exemples de BDR de 4 tables au maximum touchant le vécu de l'apprenant.","","Aide pédagogique"],
        ["Manipulation DOM","Se limiter aux attributs value, checked, disabled, readonly, src, muted ; aux propriétés de style color, background, border, font, width, height ; aux méthodes play() et pause().","","Aide pédagogique"]
      ]}
  ]
}
];

root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.memo = MEMO;
})(typeof window !== 'undefined' ? window : globalThis);
