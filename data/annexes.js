/* Annexes de cours élaborées par A. Essouyah (HTML5, CSS3, JavaScript, PHP, SQL).
   Fichier de données — modifiable sans toucher au code de l'application.
   Sauvegarde distante / versionnement : voir README.md */
(function (root) {
'use strict';
const ANNEXES = [
  { id:"html", t:"Annexe HTML5", ico:"code", pdf:"Annexe HTML5 By A.E.pdf", pages:"6 pages",
    res:"Balises HTML5, attributs détaillés et exemples issus du projet « Le fleuriste du Rafèha ».",
    apports:["Attributs détaillés de &lt;link&gt;, &lt;script&gt;, &lt;ol&gt; et &lt;img&gt; (href, rel, type, src, reversed, start, alt, srcset)","Exemples de code pour chaque famille de balises (tableau complet, figure + vidéo + sources, details/summary, formulaire fieldset + datalist)","Événements complémentaires : onchange, onkeydown, onkeyup","Tableau des types et attributs &lt;input&gt; conservé à l'identique"],
    sections:[
      { t:"Éléments de 1<sup>er</sup> niveau", rows:[
        ["<code>&lt;html&gt;</code>","Représente la racine d'un document HTML. Tout autre élément du document doit être un descendant de cet élément.","&lt;html lang=\"fr\"&gt; … &lt;/html&gt;"],
        ["<code>&lt;head&gt;</code>","Fournit les informations générales (métadonnées) sur le document : titre, liens vers scripts et feuilles de style.",""],
        ["<code>&lt;body&gt;</code>","Indique au navigateur où commence et où se termine le corps de la page.",""]
      ]},
      { t:"Éléments d'en-tête", rows:[
        ["<code>&lt;link&gt;</code>","Définit la relation entre le document courant et une ressource externe (feuille de style, icône de barre de titre…).<br><b>Attributs :</b> <i>href</i> (URL de la ressource liée, absolue ou relative), <i>rel</i> (relation entre le document et la ressource), <i>type</i> (type de contenu — ici <code>text/css</code>).","&lt;link rel=\"stylesheet\" href=\"styles.css\" type=\"text/css\"&gt;"],
        ["<code>&lt;meta&gt;</code>","Représente toute information de métadonnées qui ne peut pas être représentée par &lt;base&gt;, &lt;link&gt;, &lt;script&gt;, &lt;style&gt; ou &lt;title&gt;.","&lt;meta charset=\"UTF-8\" name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"&gt;"],
        ["<code>&lt;script&gt;</code>","Intègre ou fait référence à un script exécutable (généralement du JavaScript).<br><b>Attributs :</b> <i>src</i> (URI d'un script externe — un élément avec <code>src</code> ne doit pas contenir de code), <i>type</i> (type de script).","&lt;script src=\"controles.js\"&gt;&lt;/script&gt;"],
        ["<code>&lt;style&gt;</code>","Définit les informations de style (CSS) pour un document. Attributs : type, media.",""],
        ["<code>&lt;title&gt;</code>","Définit le titre du document.","&lt;title&gt;Le fleuriste du Rafèha&lt;/title&gt;"]
      ]},
      { t:"Structuration d'une page web", rows:[
        ["<code>&lt;header&gt;</code>","Conteneur pour le contenu d'introduction ou un ensemble de liens de navigation.",""],
        ["<code>&lt;nav&gt;</code>","Définit un ensemble de liens de navigation.",""],
        ["<code>&lt;footer&gt;</code>","Définit un pied de page pour un document ou une section.",""],
        ["<code>&lt;section&gt;</code>","Définit une section dans un document.",""],
        ["<code>&lt;article&gt;</code>","Spécifie un contenu indépendant et autonome.",""],
        ["<code>&lt;aside&gt;</code>","Définit un contenu en dehors du contenu principal. Souvent placé sous forme de barre latérale.",""],
        ["<code>&lt;main&gt;</code>","Définit le contenu principal d'un document.",""]
      ]},
      { t:"Conteneurs", rows:[
        ["<code>&lt;span&gt;</code>","Regroupe des éléments dans un bloc de contenu.",""],
        ["<code>&lt;div&gt;</code>","Grouper plusieurs éléments HTML de type block.",""],
        ["<code>&lt;iframe&gt;</code>","Définit un cadre en ligne. Attributs : src, name.",""]
      ]},
      { t:"Listes", rows:[
        ["<code>&lt;ul&gt;</code>","Définit une liste à puces.",""],
        ["<code>&lt;ol&gt;</code>","Définit une liste ordonnée.<br><b>Attributs :</b> <i>reversed</i> (liste en ordre inverse, éléments numérotés de haut en bas), <i>type</i> (a : minuscules, A : majuscules, i : chiffres romains minuscules, I : chiffres romains majuscules, 1 : chiffres — par défaut), <i>start</i> (entier de départ, toujours en chiffres arabes même pour des lettres ou des chiffres romains : pour commencer à « d » ou « iv », utiliser <code>start=\"4\"</code>).","&lt;ol start=\"2\" type=\"I\"&gt;\n  <li>Choix Fleurs</li>\n  <li>Achat</li>\n&lt;/ol&gt;"],
        ["<code>&lt;li&gt;</code>","Définit un élément dans une liste.",""]
      ]},
      { t:"Textes et médias", rows:[
        ["<code>&lt;cite&gt;</code>","Définit le titre d'une œuvre.","&lt;cite&gt;Tous droits réservés par&lt;/cite&gt; Lycée Rafèha"],
        ["<code>&lt;p&gt;</code>","Définit un paragraphe.",""],
        ["<code>&lt;source&gt;</code>","Spécifie plusieurs ressources multimédias pour les éléments multimédias. Attributs : src, type, media.","&lt;source src=\"media/flower.webm\" type=\"video/webm\"&gt;"],
        ["<code>&lt;h1&gt;…&lt;h6&gt;</code>","Définit un titre de niveau n (de 1 à 6).",""],
        ["<code>&lt;hr&gt;</code>","Définit une rupture thématique sous forme de ligne horizontale.",""],
        ["<code>&lt;img&gt;</code>","Intègre une image.<br><b>Attributs :</b> <i>src</i>, <i>alt</i> (description textuelle alternative), <i>srcset</i>, <i>width/height</i>, <i>title</i>.","&lt;img src=\"media/orchidee.jpg\" alt=\"orchidee\" width=\"100\" height=\"100\" title=\"orchidee\"&gt;"],
        ["<code>&lt;figure&gt;</code>","Spécifie un conteneur autonome qui peut contenir divers éléments (image, vidéo, légende…).","&lt;figure&gt;\n  &lt;figcaption&gt;&lt;cite&gt;Tous droits réservés par&lt;/cite&gt; Lycée Rafèha&lt;/figcaption&gt;\n  &lt;video controls width=\"250\"&gt;\n    &lt;source src=\"media/flower.webm\" type=\"video/webm\"&gt;\n    &lt;source src=\"media/flower.mp4\" type=\"video/mp4\"&gt;\n    Votre navigateur ne prend pas en charge les vidéos HTML5.\n  &lt;/video&gt;\n&lt;/figure&gt;"],
        ["<code>&lt;figcaption&gt;</code>","Définit une légende pour un élément &lt;figure&gt;.",""],
        ["<code>&lt;audio&gt;</code> / <code>&lt;video&gt;</code>","Intégrer du contenu sonore / vidéo dans un document. Attributs : controls, src.",""],
        ["<code>&lt;a&gt;</code>","Définit un lien hypertexte via l'attribut href. Attributs : href, target.",""],
        ["<code>&lt;br&gt;</code>","Définit un retour à la ligne.",""],
        ["<code>&lt;address&gt;</code>","Définit les coordonnées de l'auteur / propriétaire d'un document ou d'un article.","&lt;address&gt;Adresse : Cité Rafèha, Mnihla, Ariana&lt;/address&gt;"],
        ["<code>&lt;output&gt;</code>","Conteneur dans lequel un site ou une application peut injecter le résultat d'un calcul ou d'une action utilisateur.",""],
        ["<code>&lt;mark&gt;</code>","Définit le texte qui doit être marqué ou mis en surbrillance.","&lt;mark&gt;de Rafèha&lt;/mark&gt;"],
        ["<code>&lt;details&gt;</code> / <code>&lt;summary&gt;</code>","Détails supplémentaires que l'utilisateur peut ouvrir et fermer (attribut <i>open</i>) / en-tête visible de l'élément &lt;details&gt;.","&lt;details class=\"f1\"&gt;\n  &lt;summary&gt;Plus d'informations sur Orchidées&lt;/summary&gt;\n  Les orchidées sont une famille de plantes à fleurs…\n&lt;/details&gt;"]
      ]},
      { t:"Tableaux", rows:[
        ["<code>&lt;table&gt;</code>","Définit un tableau.","&lt;table border=\"1\"&gt;\n  &lt;caption&gt;Tableau de choix&lt;/caption&gt;\n  &lt;thead&gt;\n    &lt;th&gt;Fleurs disponibles&lt;/th&gt;\n    &lt;th&gt;Fleurs choisie(s)&lt;/th&gt;\n  &lt;/thead&gt;\n  &lt;tbody&gt;\n    &lt;tr&gt;&lt;td&gt;Orchidées&lt;/td&gt;&lt;td&gt;Tulipa&lt;/td&gt;&lt;/tr&gt;\n  &lt;/tbody&gt;\n  &lt;tfoot&gt;\n    &lt;td colspan=\"2\"&gt;Tous droits réservés&lt;/td&gt;\n  &lt;/tfoot&gt;\n&lt;/table&gt;"],
        ["<code>&lt;thead&gt;</code> / <code>&lt;tbody&gt;</code> / <code>&lt;tfoot&gt;</code>","Définissent respectivement l'en-tête, le corps et le pied d'un tableau.",""],
        ["<code>&lt;caption&gt;</code>","Définit une légende de tableau.",""],
        ["<code>&lt;tr&gt;</code> / <code>&lt;th&gt;</code> / <code>&lt;td&gt;</code>","Ligne du tableau / cellule d'en-tête / cellule de données.",""]
      ]},
      { t:"Événements", rows:[
        ["<code>onblur</code> / <code>onfocus</code>","Se déclenchent au moment où l'élément perd / obtient le focus.",""],
        ["<code>onclick</code>","Se déclenche lors d'un clic sur l'élément.",""],
        ["<code>oninput</code> / <code>onchange</code>","Se déclenchent dès que la valeur d'un élément a changé / lorsque la valeur d'un élément est modifiée.",""],
        ["<code>onload</code>","Se déclenche lorsque la page est complètement chargée.",""],
        ["<code>onmouseover</code> / <code>onmouseout</code>","Se déclenchent lorsque le pointeur survole / sort de l'élément.",""],
        ["<code>onplay</code> / <code>onpause</code>","Se déclenchent au début de la lecture d'un fichier audio/vidéo / lors d'une mise en pause.",""],
        ["<code>onsubmit</code>","Se déclenche lorsqu'un formulaire est soumis.",""],
        ["<code>onkeydown</code> / <code>onkeyup</code>","Se déclenchent lorsqu'une touche du clavier est pressée / relâchée.",""]
      ]},
      { t:"Attributs globaux", rows:[
        ["<code>class</code>","Spécifie un nom de classe pour un élément.",""],
        ["<code>hidden</code>","Renseigne la visibilité d'un élément.",""],
        ["<code>id</code>","Spécifie un identifiant unique pour un élément HTML.",""],
        ["<code>lang</code>","Spécifie la langue du contenu de l'élément.",""],
        ["<code>style</code>","Spécifie un style en ligne.",""],
        ["<code>title</code>","Spécifie des informations supplémentaires sur un élément.",""]
      ]},
      { t:"Éléments de formulaire", rows:[
        ["<code>&lt;form&gt;</code>","Crée un formulaire HTML.<br><b>Attributs :</b> <i>action</i>, <i>method</i> (\"get\", \"post\"), <i>target</i> (\"_self\", \"_blank\", \"_parent\", \"_top\", nom de cadre).","&lt;form action=\"traitement.php\" method=\"post\"&gt;…&lt;/form&gt;"],
        ["<code>&lt;fieldset&gt;</code> / <code>&lt;legend&gt;</code>","Regroupe des éléments liés dans un formulaire / définit la légende de l'élément &lt;fieldset&gt;.",""],
        ["<code>&lt;label&gt;</code>","Définit un libellé pour un élément graphique (attribut <i>for</i>).","&lt;label for=\"nom\"&gt;Nom et prénom :&lt;/label&gt;"],
        ["<code>&lt;datalist&gt;</code> / <code>&lt;option&gt;</code>","Liste d'options prédéfinies connectée à un élément &lt;input&gt; (via son attribut <i>list</i>) / option d'une liste de sélection (attribut <i>selected</i>).","&lt;input type=\"text\" id=\"pays\" list=\"pays_disponibles\"&gt;\n&lt;datalist id=\"pays_disponibles\"&gt;\n  &lt;option value=\"Tunisie\"&gt;Tunisie&lt;/option&gt;\n  &lt;option value=\"Algérie\"&gt;Algérie&lt;/option&gt;\n&lt;/datalist&gt;"],
        ["<code>&lt;select&gt;</code>","Définit une liste déroulante.","&lt;select name=\"fp\" id=\"fp\" size=\"3\"&gt;\n  &lt;option value=\"Orchidées\"&gt;Orchidées&lt;/option&gt;\n  &lt;option value=\"Tulipa\"&gt;Tulipa&lt;/option&gt;\n  &lt;option value=\"Paeonia\"&gt;Paeonia&lt;/option&gt;\n&lt;/select&gt;"],
        ["<code>&lt;textarea&gt;</code>","Définit une zone de saisie de texte multilignes. Attributs : name, cols, rows, readonly, required, disabled, placeholder, maxlength.","&lt;textarea name=\"remarque\" cols=\"25\" rows=\"12\" placeholder=\"N'hésitez pas si vous avez des remarques !\"&gt;&lt;/textarea&gt;"],
        ["<code>&lt;input&gt;</code> — types","button, reset, submit (name, value, disabled) &bull; text, email, tel (name, value, placeholder, readonly, required, disabled, list) &bull; password (name, value, placeholder, readonly, required, disabled) &bull; number, range (name, value, readonly, required, disabled, min, max) &bull; date, time (name, value, required, disabled, min, max) &bull; checkbox, radio (name, value, required, disabled, checked)","&lt;fieldset&gt;\n  &lt;legend&gt;&lt;mark&gt;Remplir le formulaire&lt;/mark&gt;&lt;/legend&gt;\n  &lt;label for=\"age\"&gt;Votre âge :&lt;/label&gt;\n  &lt;input type=\"range\" name=\"age\" id=\"age\" min=\"10\" max=\"120\"&gt;\n  &lt;output name=\"resultatage\"&gt;ans&lt;/output&gt;\n&lt;/fieldset&gt;"]
      ]}
    ]},
  { id:"css", t:"Annexe CSS3", ico:"palette", pdf:"Annexe CSS3 By A.E.pdf", pages:"9 pages",
    res:"Sélecteurs, propriétés, transformations et animations, avec un exemple commenté pour chaque propriété.",
    apports:["Sélecteurs d'attributs avancés : <code>^=</code>, <code>*=</code>, <code>$=</code>, indicateurs <code>i</code> et <code>s</code>","Exemples CSS pour list-style, arrière-plan (couleurs, repeat, size, super-propriété) et bordures","Détail des fonctions de transformation (rotate, skew, scale, translate) et des filtres (blur, grayscale, invert)","Exemple complet de transition au survol + note « différence entre animations et transitions »"],
    sections:[
      { t:"Sélecteurs", rows:[
        ["<code>*</code>","Sélectionne tous les éléments.",""],
        ["<code>element</code>","Sélectionne tous les éléments de type element.",""],
        ["<code>#id</code>","Cible un élément en fonction de la valeur de son attribut id.",""],
        ["<code>.class</code>","Cible les éléments en fonction de la valeur de leur attribut class.",""],
        ["<code>element[attr]</code>","Cible les éléments qui possèdent l'attribut attr.","a[href^=\"#\"] { background-color: gold; }      /* liens internes */\na[href*=\"example\"] { background-color: silver; } /* \"example\" n'importe où */\na[href*=\"insensitive\" i] { color: cyan; }        /* insensible à la casse */\na[href*=\"cAsE\" s] { color: pink; }               /* sensible à la casse */\na[href$=\".org\"] { color: red; }                  /* se termine par .org */"],
        ["<code>element[attr=valeur]</code>","Cible les éléments en fonction de la valeur de l'attribut attr.",""],
        ["<code>element.class</code>","Cible tous les éléments de type element selon la valeur de leur attribut class.",""],
        ["<code>a:link</code> / <code>a:visited</code>","Ciblent tous les liens non visités / visités.",""],
        ["<code>a:hover</code> / <code>a:active</code>","Ciblent l'élément survolé par la souris / les liens activés.",""],
        ["Regroupement","Pour grouper plusieurs sélecteurs dans une règle, il suffit de les lister en les séparant par des virgules « , ».","h1, h2, p { color: #0b2545; }"]
      ]},
      { t:"Propriétés de mise en forme du texte", rows:[
        ["<code>font-family</code>","Spécifie les noms de polices possibles par ordre de préférence.","font-family: Georgia, serif;"],
        ["<code>font-weight</code>","Manère dont les caractères doivent être affichés (bold ; bolder ; lighter).",""],
        ["<code>font-style</code>","Spécifie le style d'un texte (italic).",""],
        ["<code>font-size</code>","Spécifie la taille d'une police.",""],
        ["<code>font</code>","Super-propriété : combine font-family, font-weight, font-style et font-size.","font: italic bold 16px Georgia, serif;"],
        ["<code>text-align</code>","Alignement horizontal d'un texte (left ; center ; right ; justify).",""],
        ["<code>text-shadow</code>","Définit une ombre au texte.",""],
        ["<code>text-transform</code>","Transforme les caractères (uppercase ; lowercase ; capitalize).",""],
        ["<code>color</code>","Spécifie la couleur du texte.",""]
      ]},
      { t:"Propriétés des listes", rows:[
        ["<code>list-style-type</code>","Type de marqueur d'éléments de liste (circle ; square ; upper-roman ; lower-alpha).","list-style: square;"],
        ["<code>list-style-position</code>","Position des marqueurs (outside ; inside).","list-style: inside;"],
        ["<code>list-style-image</code>","Spécifie une image comme marqueur d'éléments de liste.","list-style-image: url(\"../media/rocket.svg\");"],
        ["<code>list-style</code>","Super-propriété : combine list-style-type, list-style-position et list-style-image.","list-style: georgian outside;\nlist-style: url(\"img/pip.svg\") inside;\nlist-style: lower-roman url(\"img/shape.png\") outside;\nlist-style: none;"]
      ]},
      { t:"Propriétés d'arrière-plan", rows:[
        ["<code>background-color</code>","Définit la couleur d'arrière-plan d'un élément.","/* nom, rgb() ou hexadécimal */\n.ex1 { background-color: teal; color: white; }\n.ex2 { background-color: rgb(153, 102, 153); }\n.ex3 { background-color: #777799; }"],
        ["<code>background-image</code>","Définit une image d'arrière-plan pour un élément.","background-image: url(\"https://example.com/bck.png\");"],
        ["<code>background-repeat</code>","Façon dont l'image est répétée (repeat ; repeat-x ; repeat-y).","background-repeat: repeat-x;"],
        ["<code>background-size</code>","Taille d'une image d'arrière-plan.","background-size: contain;\nbackground-size: cover;\nbackground-size: 30%;"],
        ["<code>background</code>","Super-propriété : combine background-color, background-image, background-repeat et background-size.","background: pink;\nbackground: url(\"starsolid.gif\") #99f repeat-y fixed;"]
      ]},
      { t:"Propriétés des tableaux", rows:[
        ["<code>table-layout</code>","Définit la façon de disposer les cellules, lignes et colonnes d'un tableau (auto ; fixed).","table-layout: fixed; width: 150px;"],
        ["<code>border-collapse</code>","Bordures des cellules fusionnées ou séparées (separate ; collapse).","border-collapse: collapse;"]
      ]},
      { t:"Propriétés des boîtes", rows:[
        ["<code>width</code> / <code>height</code>","Définissent la largeur / la hauteur d'un élément.",""],
        ["<code>position</code>","Type de positionnement (absolute ; fixed ; relative ; static ; sticky).",""],
        ["<code>float</code>","Fait flotter un élément dans un conteneur (left ; right ; none).",""],
        ["<code>padding</code>","Marge intérieure des 4 côtés.<br><b>1 valeur</b> : même écart aux 4 côtés &bull; <b>2 valeurs</b> : haut/bas puis droite/gauche &bull; <b>3 valeurs</b> : haut, droite/gauche, bas &bull; <b>4 valeurs</b> : haut, droite, bas, gauche.","padding: 10px;\npadding: 10px 20px;\npadding: 10px 20px 5px;\npadding: 10px 20px 5px 0;"],
        ["<code>margin</code> / <code>box-shadow</code>","Définit les marges d'un élément / ajoute des ombres à la boîte d'un élément.",""],
        ["<code>display</code>","Comportement d'affichage d'un élément (inline ; block ; inline-block).",""],
        ["<code>top</code> / <code>bottom</code> / <code>left</code> / <code>right</code>","Positionnement vertical ou horizontal d'un élément positionné.",""],
        ["<code>overflow</code>","Comportement du contenu qui déborde (visible ; hidden ; clip ; scroll ; auto).",""],
        ["<code>opacity</code>","Définit le niveau de transparence.",""]
      ]},
      { t:"Propriétés des bordures", rows:[
        ["<code>border-color</code> / <code>border-style</code>","Couleur / style des bordures d'un élément (none ; dotted ; inset ; …).","border-style: dotted;\nborder-style: inset;"],
        ["<code>border-radius</code>","Rayon des coins arrondis d'un élément.","border-radius: 30px;\nborder-radius: 25% 10%;\nborder-radius: 10% 30% 50% 70%;"],
        ["<code>border-width</code>","Largeur des bordures (medium ; thin ; thick ; valeur en px).","border-width: thin;\nborder-width: 20px;"],
        ["<code>border</code>","Super-propriété : combine border-color, border-style, border-width et border-radius.",""]
      ]},
      { t:"Transformation", rows:[
        ["<code>transform</code>","Applique un effet de transformation 2D ou 3D à un élément : <b>rotate()</b> (rotation), <b>skew()</b> (inclinaison horizontale et/ou verticale), <b>scale()</b> (agrandissement ou réduction d'échelle), <b>translate()</b> (déplacement selon un vecteur horizontal et vertical).","transform: rotate(90deg);\ntransform: skew(30deg);\ntransform: scale(2);     /* agrandissement */\ntransform: scale(0.5);   /* réduction */\ntransform: translate(120px);"]
      ]},
      { t:"Propriétés des images (filtres)", rows:[
        ["<code>filter</code>","Définit des filtres sur un élément : <b>blur()</b> (flou gaussien), <b>grayscale()</b> (niveaux de gris), <b>invert()</b> (inversion des couleurs).","filter: blur(15px);\nfilter: grayscale(80%);\nfilter: invert(40%);"]
      ]},
      { t:"Transition", rows:[
        ["<code>transition-delay</code> / <code>transition-duration</code> / <code>transition-property</code>","Délai avant le début de la transition / durée / propriétés concernées par l'effet.",".box {\n  border: solid 1px; display: block;\n  width: 100px; height: 100px;\n  background-color: #0000ff;\n  transition: width 2s, height 2s, background-color 2s, transform 2s;\n}\n.box:hover {\n  background-color: #ffcccc;\n  width: 200px; height: 200px;\n  transform: rotate(180deg);\n}"],
        ["<code>transition</code>","Super-propriété : combine transition-property, transition-duration et transition-delay.","transition: width 2s ease-in 0.5s;"]
      ]},
      { t:"Animation", rows:[
        ["<code>@keyframes</code>","Spécifie les états clés de l'animation.","@keyframes glisse {\n  from { left: 0; }\n  to   { left: 300px; }\n}"],
        ["<code>animation-name</code> / <code>animation-duration</code>","Nom de l'animation / durée de l'animation.",""],
        ["<code>animation-delay</code> / <code>animation-iteration-count</code> / <code>animation-direction</code>","Délai avant le début / nombre de répétitions / direction de l'animation.","animation: glisse 3s linear 1s infinite alternate;"],
        ["<code>animation</code>","Super-propriété : combine animation-name, animation-duration, animation-delay, animation-iteration-count et animation-direction.",""]
      ]},
      { t:"Différence entre animations et transitions", rows:[
        ["Transitions","Modifient progressivement la valeur de propriétés à la suite d'un changement d'état (par exemple <code>:hover</code>). L'enseignant garde peu de contrôle sur le déclenchement et la progression.",""],
        ["Animations","Offrent davantage de liberté et de contrôle sur le déclenchement et la progression du changement de valeur des propriétés animées (états clés, répétitions, direction).",""]
      ]}
    ]},
  { id:"js", t:"Annexe JavaScript", ico:"js", pdf:"Annexe JavaScript By A.E.pdf", pages:"4 pages",
    res:"Opérateurs, entrées/sorties, objets, sélection et modification des éléments HTML.",
    apports:["Tableaux comparatifs <code>prompt / alert / confirm</code> et <code>document.write / innerHTML / textContent</code>","Détail de <code>play()</code> et <code>pause()</code> (currentTime, volume, playbackRate)","<code>Number.isNaN()</code> vs <code>isNaN()</code> et table de conversion <code>Number(ch)</code>","Fonction <code>substring()</code> détaillée avec exemples, 9 constructeurs de <code>Date</code> et 3 formats de chaînes de date"],
    sections:[
      { t:"Opérateurs", rows:[
        ["Arithmétiques","<code>+</code> addition &bull; <code>-</code> soustraction &bull; <code>*</code> multiplication &bull; <code>/</code> division &bull; <code>%</code> reste de la division euclidienne.",""],
        ["Logiques","<code>&&</code> ET &bull; <code>||</code> OU &bull; <code>!</code> NON.",""],
        ["Comparaison","<code>==</code> égal &bull; <code>!=</code> différent &bull; <code>&gt;</code> supérieur &bull; <code>&gt;=</code> supérieur ou égal &bull; <code>&lt;</code> inférieur &bull; <code>&lt;=</code> inférieur ou égal.",""]
      ]},
      { t:"Entrées et sorties", rows:[
        ["<code>prompt()</code>","Affiche une boîte de dialogue avec une zone de saisie (retourne le texte saisi ou <code>null</code>).","var nom = prompt(\"Votre nom ?\");"],
        ["<code>alert()</code>","Affiche un message dans une boîte de dialogue.","alert(\"Bonjour \" + nom);"],
        ["<code>document.write()</code>","Affiche directement dans le document HTML.","document.write(\"&lt;h2&gt;Bienvenue&lt;/h2&gt;\");"],
        ["<code>innerHTML</code>","Propriété permettant d'afficher / modifier un contenu dynamique dans un élément HTML.","document.getElementById(\"res\").innerHTML = resultat;"]
      ]},
      { t:"Comparaison prompt() / alert() / confirm()", rows:[
        ["<code>prompt()</code>","Rôle : demander une valeur à l'utilisateur &bull; saisie d'un texte : ✔ &bull; retourne le texte saisi ou <code>null</code> &bull; bloque le code : oui &bull; usage rare.",""],
        ["<code>alert()</code>","Rôle : afficher un message &bull; aucun choix (bouton OK seulement) &bull; retourne <code>undefined</code> &bull; bloque le code : oui &bull; cas d'usage : avertissement simple.",""],
        ["<code>confirm()</code>","Rôle : poser une question Oui/Non &bull; deux choix (OK / Annuler) &bull; retourne <code>true</code> ou <code>false</code> &bull; bloque le code : oui &bull; cas d'usage : validation (ex. « Supprimer ? »).","if (confirm(\"Supprimer cet article ?\")) { … }"]
      ]},
      { t:"Comparaison document.write() / innerHTML / textContent", rows:[
        ["<code>document.write()</code>","Type d'usage : écrire pendant le chargement de la page &bull; remplace toute la page après chargement &bull; accepte du HTML : oui &bull; efface tout le document si utilisé après chargement : oui &bull; obsolète, déconseillé &bull; usage typique : scripts anciens.",""],
        ["<code>innerHTML</code>","Modifier le contenu HTML d'un élément &bull; remplace tout le contenu de l'élément &bull; accepte du HTML : oui &bull; n'efface pas le document &bull; moderne, recommandé &bull; usage : ajouter du HTML.",""],
        ["<code>textContent</code>","Insérer du texte brut &bull; remplace tout le texte de l'élément &bull; n'accepte pas le HTML &bull; n'efface pas le document &bull; moderne, recommandé &bull; usage : ajouter du texte simple.","document.getElementById(\"msg\").textContent = \"Texte brut\";"]
      ]},
      { t:"Fonctions / méthodes", rows:[
        ["<code>isNaN(ch)</code>","Retourne <code>true</code> si l'argument n'est pas convertible en un nombre, sinon <code>false</code>.","isNaN(\"blabla\"); // true"],
        ["<code>Number.isNaN()</code>","Détermine strictement si la valeur est exactement <code>NaN</code>, sans conversion — version plus robuste que <code>isNaN</code> de l'objet global.","Number.isNaN(NaN); // true\nNumber.isNaN(0 / 0); // true\nNumber.isNaN(\"37\"); // false\nNumber.isNaN(\"blabla\"); // false"],
        ["<code>Number(ch)</code>","Convertit une chaîne en un nombre (retourne <code>NaN</code> si la conversion est impossible).","Number(\"37\"); // 37\nNumber(\"37.5\"); // 37.5\nNumber(\"blabla\"); // NaN\nNumber(true); // 1  |  Number(false); // 0\nNumber(null); // 0  |  Number(undefined); // NaN"],
        ["<code>parseFloat(ch)</code>","Convertit une chaîne en un réel.","parseFloat(\"3.14m\"); // 3.14"],
        ["<code>parseInt(ch [,b])</code>","Convertit une chaîne en un entier exprimé dans la base b.","parseInt(\"101\", 2); // 5"],
        ["<code>String(a)</code>","Convertit la valeur a en une chaîne.","String(2026); // \"2026\""]
      ]},
      { t:"Objet Math", rows:[
        ["<code>abs(x)</code> / <code>sqrt(x)</code>","Valeur absolue / racine carrée.",""],
        ["<code>round(x)</code> / <code>trunc(x)</code>","Retourne l'entier le plus proche / la troncature entière (suppression de la partie décimale).",""],
        ["<code>random()</code>","Retourne un réel aléatoire dans [0, 1[.","Math.round(Math.random() * 100);"]
      ]},
      { t:"Les chaînes de caractères", rows:[
        ["<code>+</code> / <code>ch.length</code>","Opérateur de concaténation / propriété retournant la longueur de ch.",""],
        ["<code>ch.indexOf(ch1 [,p])</code>","Position de la 1<sup>re</sup> occurrence de ch1 dans ch, en effectuant la recherche à partir de la position p (sinon -1).",""],
        ["<code>ch.lastIndexOf(ch1 [,p])</code>","Position de la dernière occurrence de ch1 dans ch à partir de la position p.",""],
        ["<code>ch.substring(d, f)</code>","Retourne une sous-chaîne de ch entre l'indice de début d et l'indice de fin f (non compris).","var s = \"Mozilla\";\ns.substring(0,3); // \"Moz\"\ns.substring(4,7); // \"lla\"\ns.substring(4);   // \"lla\"\n// si d = f → chaîne vide ; si f est omis → jusqu'à la fin\n// arguments négatifs ou NaN → traités comme 0\n// arguments > s.length → traités comme s.length\n// si d > f, les deux valeurs sont interverties"],
        ["<code>ch.replace(ch1, ch2)</code>","Retourne une chaîne où la 1<sup>re</sup> occurrence de ch1 dans ch est remplacée par ch2.",""],
        ["<code>ch.toLowerCase()</code> / <code>ch.toUpperCase()</code>","Convertissent tous les caractères de ch en minuscules / majuscules.",""],
        ["<code>ch.trim()</code>","Supprime les espaces existants au début et à la fin de ch.",""],
        ["<code>String.fromCharCode(n1, …, nn)</code>","Retourne une chaîne formée par la concaténation des résultats de conversion des codes passés en paramètres.","String.fromCharCode(65, 66, 67); // \"ABC\"\nString.fromCharCode(8212); // \"—\""]
      ]},
      { t:"L'objet Date", rows:[
        ["Création","Il existe 9 façons de créer un objet Date : <code>new Date()</code>, <code>new Date(dateString)</code>, <code>new Date(year, month)</code>, puis avec day, hours, minutes, seconds, ms, et <code>new Date(milliseconds)</code>.","var d = new Date(); // date courante :\n// Fri Nov 21 2025 18:14:07 GMT+0100 (UTC+01:00)"],
        ["Formats de chaîne","Trois types de chaînes : <b>ISO Date</b> \"2025-11-21\" &bull; <b>Short Date</b> \"11/21/2025\" &bull; <b>Long Date</b> \"Nov 21 2025\" ou \"21 Nov 2025\".","new Date(\"2025-11-21\")"],
        ["Méthodes","<code>d.getDate()</code> jour du mois (1 à 31) &bull; <code>d.getMonth()</code> numéro du mois (0 à 11) &bull; <code>d.getFullYear()</code> année sur 4 chiffres &bull; <code>d.toString()</code> chaîne représentant la date d.",""]
      ]},
      { t:"L'objet Array", rows:[
        ["<code>length</code>","Propriété qui représente le nombre d'éléments dans un tableau. Pour créer un tableau, utiliser les littéraux de tableau <code>[ ]</code>.","var t = [12, 5, 8];\nt.length; // 3"]
      ]},
      { t:"Sélection et modification des éléments HTML", rows:[
        ["<code>document.getElementById()</code>","Permet de sélectionner un élément unique en fonction de son identifiant.","var v = document.getElementById(\"nom\").value;"],
        ["<code>document.getElementsByName()</code>","Permet de sélectionner tous les éléments ayant le même nom.",""],
        ["<code>selectedIndex</code>","Pour une liste déroulante (<code>&lt;select&gt;</code>), propriété utilisée pour récupérer l'indice de l'option sélectionnée.","var i = document.getElementById(\"fp\").selectedIndex;"],
        ["<code>element.attribut = valeur</code>","Change la valeur de l'attribut d'un élément HTML. Se limiter aux attributs <i>value, checked, disabled, readonly, src, muted</i>.",""],
        ["<code>element.style.propriété = valeur</code>","Change le style d'un élément HTML. Se limiter aux propriétés <i>color, background, border, font, width, height</i>.",""],
        ["<code>element.méthode()</code>","Effectue une action sur un élément HTML. Se limiter aux méthodes <code>play()</code> et <code>pause()</code>.",""],
        ["<code>play()</code> / <code>pause()</code>","Démarrer la lecture / mettre en pause. Aucun paramètre, mais on peut préparer le média : <code>currentTime</code> (position en s), <code>volume</code> (0 à 1), <code>playbackRate</code> (vitesse 0.5 à 2).","nvideo.currentTime = 10;\nnvideo.volume = 0.5;\nnvideo.playbackRate = 1.5;\nnvideo.play();\nnvideo.pause();"]
      ]}
    ]},
  { id:"php", t:"Annexe PHP", ico:"server", pdf:"Annexe PHP By A.E.pdf", pages:"10 pages",
    res:"Pages web dynamiques : variables, chaînes, tableaux, MySQL et fonctions date/heure.",
    apports:["Fonctions de manipulation de variables : <code>gettype</code>, <code>settype</code>, <code>is_*</code>, <code>isset</code>, <code>unset</code>","Nouvelles fonctions de chaînes : <code>implode</code>, <code>explode</code>, <code>strrev</code>, <code>chr</code>, <code>ord</code>, <code>strpos</code>, <code>strcmp</code>","Tableaux : initialisation, parcours (pointeur interne) et tri","Accès MySQL en PHP : <code>mysqli_connect</code>, <code>mysqli_query</code>, <code>mysqli_fetch_array</code>, <code>mysqli_num_rows</code>…","Fonctions date/heure : <code>checkdate</code>, <code>date</code>, <code>getdate</code>, <code>time</code>, <code>mktime</code>, <code>strtotime</code>"],
    sections:[
      { t:"Généralités", rows:[
        ["Définition","PHP (Personal Home Page Hypertext Preprocessor) est un langage de scripts qui s'intègre aux pages HTML et permet de réaliser des pages dynamiques.",""],
        ["Constante","Pour utiliser une constante, il faut utiliser la fonction <code>define()</code>.",""],
        ["Concaténation","Le signe <code>.</code> signifie que les variables seront concaténées.","echo(\"&lt;HR&gt;\" . font . ecole);"]
      ]},
      { t:"Fonctions de manipulation de variables", rows:[
        ["<code>gettype($nom_var)</code>","Détermine le type de données de la variable (\"integer\", \"double\", \"string\", \"array\", \"object\", \"class\" ou \"unknown type\").","$x = 2.3;\necho(gettype($x)); // double"],
        ["<code>settype($nom_var, \"type\")</code>","Définit explicitement le type d'une variable.","$x = 2.3;\nsettype($x, \"integer\"); echo $x; // 2\n$actif = TRUE; settype($actif, \"string\"); // \"1\""],
        ["<code>is_string</code> / <code>is_array</code>","Indiquent si la variable est de type chaîne / tableau.","if (is_array($myVar)) { … }"],
        ["<code>is_double</code> (= is_float, is_real) / <code>is_integer</code> (= is_long, is_int)","Indiquent si une variable est de type double/réel ou entier.","if (is_int($myVar)) { … }"],
        ["<code>isset($nom_var)</code>","Sert à savoir si une variable possède une valeur (renvoie true ou false).","$x = 2.3; $val = isset($x); // true"],
        ["<code>unset($nom_var)</code>","Détruit une variable.","unset($x); // isset($x) donne false"]
      ]},
      { t:"Chaînes de caractères", rows:[
        ["Définition et accès","Une chaîne est un ensemble de caractères entre guillemets simples ou doubles. On peut accéder à un caractère à l'intérieur d'une chaîne.","$myString = \"Il était une fois\";\nprint $myString[4]; // \"t\" — 5<sup>e</sup> caractère (on commence à 0)"],
        ["<code>substr(source, début [, taille])</code>","Retourne un segment de chaîne.","substr('abcdef', 1);    // bcdef\nsubstr('abcdef', 1, 3); // bcd\nsubstr('abcdef', 0, 4); // abcd"],
        ["<code>trim(str)</code>","Retourne la chaîne nettoyée (espaces en début et fin supprimés).",""],
        ["<code>strlen(str)</code>","Retourne la longueur de la chaîne.","strlen('abcdef'); // 6"],
        ["<code>implode(separator, tableau)</code>","Rassemble les éléments d'un tableau en une chaîne.","$ch = implode(\",\", array('lastname','email','phone'));\n// lastname,email,phone"],
        ["<code>explode(separator, string)</code>","Retourne un tableau contenant les éléments de la chaîne séparés par separator.","$pieces = explode(\" \", \"piece1 piece2 piece3\");\necho $pieces[0]; // piece1"],
        ["<code>str_replace(modèle, remplacement, chaîne)</code>","Remplace toutes les occurrences de modèle dans chaîne par remplacement.",""],
        ["<code>chr(ascii)</code> / <code>ord(string)</code>","Retournent le caractère dont le code ASCII est donné / la valeur ASCII du 1<sup>er</sup> caractère d'une chaîne.",""],
        ["<code>strpos(ch1, ch [, position])</code>","Recherche la 1<sup>re</sup> occurrence d'un caractère dans une chaîne et retourne sa position numérique.",""],
        ["<code>strcmp(str1, str2)</code>","Compare deux chaînes : retourne &lt; 0 si str1 &lt; str2, &gt; 0 si str1 &gt; str2, 0 si égales.<br><b>N.B. :</b> <code>strcasecmp</code> est identique mais effectue une comparaison insensible à la casse.",""],
        ["<code>strrev(ch)</code>","Inverse l'ordre des caractères d'une chaîne.",""],
        ["<code>strtolower(ch)</code> / <code>strtoupper(ch)</code>","Convertissent tous les caractères d'une chaîne en minuscules / majuscules.",""]
      ]},
      { t:"Les tableaux", rows:[
        ["Deux types","Tableaux à indices de type entier (le premier indice est 0) et tableaux associatifs (indices de type chaîne). Contrairement à PASCAL, on peut stocker des éléments de types différents dans un même tableau.",""],
        ["Initialisation","Affectation directe (<code>$tab[0]='P'</code> ou même <code>$tab[]='P'</code>) ou fonction <code>array()</code>.","$tab = array('P', 2);\n$vente = array('lundi'=>7, 'mardi'=>5, 'jeudi'=>9);"],
        ["Parcours (pointeur interne)","Tout tableau possède un pointeur interne qui conserve l'indice et la valeur de l'élément actif : <code>current()</code> valeur de l'élément actif, <code>key()</code> indice, <code>reset()</code> retour au début, <code>pos()</code> valeur de l'élément actif, <code>next()</code> avance, <code>prev()</code> recule, <code>end()</code> positionne en fin, <code>sizeof()</code> nombre d'éléments.",""],
        ["Tri","<code>sort()</code> tri croissant, <code>rsort()</code> tri décroissant ; pour trier un tableau par indice : <code>ksort()</code> et <code>krsort()</code>.",""]
      ]},
      { t:"Utiliser MySQL avec PHP", rows:[
        ["<code>mysqli_connect(host, user, password)</code>","Définition de la connexion au serveur de base de données.",""],
        ["<code>mysqli_select_db(connexion, nom_bd [, lien])</code>","Sélection de la base de données.",""],
        ["<code>mysqli_query(connexion, requête [, lien])</code>","Exécution de la requête : envoie au serveur MySQL une instruction SQL à exécuter.",""],
        ["<code>mysqli_fetch_array(connexion, result [, type])</code>","Exploitation d'une requête SQL : extrait la ligne sous forme d'un tableau associatif.",""],
        ["<code>mysqli_num_rows()</code>","Retourne le nombre d'enregistrements retournés par la sélection.",""],
        ["<code>mysqli_affected_rows()</code>","Suite à une commande UPDATE, indique combien de lignes ont été modifiées.",""],
        ["<code>mysqli_insert_id()</code>","Retourne le dernier identifiant généré par un champ de type AUTO_INCREMENT.",""],
        ["<code>mysqli_error()</code>","Retourne l'erreur MySQL.",""]
      ]},
      { t:"Fonctions relatives aux types date et heure", rows:[
        ["Timestamp","Un timestamp est un entier long contenant le nombre de secondes entre le début de l'époque UNIX (1<sup>er</sup> janvier 1970 00:00:00 GMT) et la date considérée.",""],
        ["<code>checkdate(m, j, a)</code>","Retourne TRUE si la date représentée par le mois m, le jour j et l'année a est valide, sinon FALSE.<br><b>N.B. :</b> l'ordre des arguments n'est pas l'ordre français ; l'année doit être comprise entre 1 et 32767, le mois entre 1 et 12, et le jour doit exister dans le mois (années bissextiles prises en compte).","$j=30; $m=11; $a=2024;\nif (checkdate($m,$j,$a)==true) $d=$j.\"/\".$m.\"/\".$a;\nelse $d=\"donnée invalide\";\necho($d);"],
        ["<code>date(format [, timestamp])</code>","Retourne une date sous forme de chaîne, au format donné, à partir du timestamp fourni ou de la date/heure courante.","$d = date(\"Y-m-d H:i:s\");\necho(\"Nous sommes le : \" . $d);"],
        ["<code>getdate([timestamp])</code>","Retourne un tableau associatif contenant les informations de date et d'heure : seconds, minutes, hours, mday, wday, mon, year, yday, weekday, month.","$a = getdate();\necho(\"Les heures : \" . $a[\"hours\"]);\necho(\"Le nom du mois : \" . $a[\"month\"]);"],
        ["<code>time()</code>","Retourne le timestamp (entier long) représentant l'heure courante en secondes.","$a = time();\n$b = date(\"d/m/Y H:i:s\", $a);"],
        ["<code>mktime(h, min, sec, mois, jour, année [, is_dst])</code>","Retourne un timestamp correspondant aux arguments fournis, qui peuvent être omis de gauche à droite (les arguments manquants prennent la valeur courante).","$ns = mktime(12, 1500, 560, 21, 300, 2024);\n$d = date(\"d-m-Y H:i:s\", $ns);"],
        ["<code>strtotime(time [, now])</code>","Essaie de lire une date au format anglais et de la transformer en timestamp, relativement au timestamp now ou à la date courante.","strtotime(\"now\");\nstrtotime(\"10 September 2005\");\nstrtotime(\"+1 day\");\nstrtotime(\"+1 week\");\nstrtotime(\"+1 week 2 days 4 hours 2 seconds\");"]
      ]},
      { t:"Compléments (types, transtypage, opérateurs, superglobales)", rows:[
        ["<code>Types d'objets</code>","int (entier) &bull; float (réel) &bull; string (chaîne) &bull; bool (booléen) &bull; array (tableau).",""],
        ["<code>Opérateurs de transtypage</code>","(int) &bull; (float) &bull; (string) &bull; (bool) &bull; (array).",""],
        ["<code>Opérateurs</code>","Logiques : && , || , ! &bull; comparaison : == , != , &lt; , &lt;= , &gt; , &gt;= &bull; arithmétiques : + , - , * , / , % &bull; autres : = affectation, <code>.</code> concaténation.",""],
        ["<code>Variables superglobales</code>","<code>$_GET</code> : tableau associatif des valeurs passées au script via les paramètres d'URL &bull; <code>$_POST</code> : valeurs passées via un formulaire.",""],
        ["<code>Session / cookie</code>","Prendre connaissance du <code>var_dump($_GET)</code> en TP pour visualiser le contenu des superglobales.",""]
      ]}
    ]},
  { id:"sql", t:"Annexe SQL", ico:"db", pdf:"Annexe SQL By A.E.pdf", pages:"7 pages",
    res:"Fonctions standards, opérateurs et clauses optionnelles — partie LDD et partie LMD.",
    apports:["LDD détaillé avec exemples complets (<code>CREATE TABLE</code> Vehicule / Location / Client, toutes les variantes d'<code>ALTER TABLE</code>)","Fonctions de chaînes SQL : <code>CONCAT</code>, <code>LENGTH</code>, <code>SUBSTRING</code> (4 syntaxes), <code>LEFT</code>, <code>RIGHT</code>","Fonctions de dates : <code>TIMESTAMP</code>, <code>DAY*</code>, <code>MONTH</code>, <code>YEAR</code>, <code>NOW</code>, <code>DATEADD</code>, <code>DATEDIFF</code>","Astuce <code>timestamp</code> pour la valeur par défaut <code>CURRENT_TIMESTAMP</code>, exemples de <code>UPDATE</code> avec <code>SUBSTR</code>"],
    sections:[
      { t:"Partie LDD — création et modification des tables", rows:[
        ["<code>CREATE TABLE</code>","CREATE TABLE nom_table ( Nom_Colonne1 type_colonne1 [[CONSTRAINT] contrainte-col], … [CONSTRAINT] contrainte-table);","CREATE TABLE Vehicule(\n  immat_Vehicule VARCHAR(10) PRIMARY KEY,\n  marque VARCHAR(20) NOT NULL CHECK(marque IN ('Peugeot','Renault','Fiat','Opel')),\n  model VARCHAR(20) NOT NULL,\n  date_acq YEAR NOT NULL\n);"],
        ["Clé étrangère et contrainte de table","<code>REFERENCES … ON DELETE CASCADE</code> et <code>CONSTRAINT … PRIMARY KEY(…)</code> pour une clé primaire composée.","CREATE TABLE Location(\n  immat_Vehicule VARCHAR(10) REFERENCES Vehicule(immat_Vehicule) ON DELETE CASCADE,\n  NCIN_Cli VARCHAR(8) REFERENCES Client(NCIN_Cli) ON DELETE CASCADE,\n  date_loc TIMESTAMP DEFAULT CURRENT_TIMESTAMP CHECK(date_loc &lt;= NOW()),\n  duree_loc INT(3) CHECK(duree_loc &gt; 0),\n  cout_loc DECIMAL(8,3) CHECK(cout_loc &gt; 0),\n  CONSTRAINT PK_Location PRIMARY KEY(immat_Vehicule, NCIN_Cli)\n);"],
        ["Astuce <code>CURRENT_TIMESTAMP</code>","Pour attribuer la date du jour comme valeur par défaut, il faut utiliser le type <b>timestamp</b>, sinon cela ne fonctionne pas avec le type <i>date</i>.","date_loc TIMESTAMP DEFAULT CURRENT_TIMESTAMP"],
        ["<code>ALTER TABLE … ADD COLUMN</code>","Ajout de colonnes à une table (les parenthèses autour du nom de colonne sont facultatives pour une seule colonne).","ALTER TABLE Client\nADD COLUMN (Tel_Cli) VARCHAR(10);"],
        ["<code>ALTER TABLE … MODIFY COLUMN</code>","Modification du type d'une colonne.","ALTER TABLE Client\nMODIFY COLUMN Tel_Cli INT(8);\n\n/* valeur par défaut : modifier la colonne */\nALTER TABLE Client\nMODIFY COLUMN Ville VARCHAR(20) DEFAULT 'Tunis';"],
        ["<code>ALTER TABLE … DROP COLUMN</code>","Suppression d'une colonne d'une table.","ALTER TABLE Client\nDROP COLUMN Adresse_Cli;"],
        ["<code>ALTER TABLE … ADD CONSTRAINT</code>","Ajout d'une contrainte (vérifier que les valeurs d'une colonne sont comprises dans un intervalle).","ALTER TABLE Vehicule\nADD CONSTRAINT CHECK Annee_Acq BETWEEN 2000 AND 2022;"],
        ["Modification de la clé primaire","Remplacer la clé primaire actuelle par une clé primaire composée.","ALTER TABLE Location\nDROP PRIMARY KEY,\nADD PRIMARY KEY (immat_Vehicule, NCIN_Cli, date_loc);"],
        ["Suppression d'une contrainte","Supprimer la clé primaire d'une table.","ALTER TABLE Client\nDROP PRIMARY KEY;"],
        ["Activer / désactiver une contrainte","Désactiver puis réactiver les clés d'une table.","ALTER TABLE Client DISABLE KEYS;\nALTER TABLE Client ENABLE KEYS;"],
        ["<code>ALTER TABLE … RENAME TO</code>","Renommer une table.","ALTER TABLE Vehicule RENAME TO Voiture;"],
        ["<code>DROP TABLE</code> / <code>DROP DATABASE</code>","Supprimer une table / une base de données.","DROP TABLE Client;\nDROP DATABASE Gestion_Location;"]
      ]},
      { t:"Partie LMD — interrogation et mise à jour", rows:[
        ["Clauses GROUP BY / HAVING","Regrouper les lignes et filtrer les groupes obtenus.","SELECT Cod_cli, COUNT(*) \"Nombre d'achat\"\nFROM ventes\nGROUP BY Cod_cli\nHAVING COUNT(*) &gt;= 2;"],
        ["Opérateurs","DISTINCT, BETWEEN, LIKE, IN, AND, OR, =, !=, &lt;, &gt;.",""],
        ["Fonctions d'agrégation","COUNT, AVG, MAX, MIN, SUM — avec possibilité de sous-requêtes pour retrouver la ligne correspondant à l'extremum.","SELECT COUNT(*) FROM Articles WHERE num_frs = 777;\nSELECT AVG(pa_art) FROM articles;\nSELECT SUM(pa_art)/COUNT(*) FROM articles;\n\nSELECT des_art \"Article plus cher\" FROM articles\nWHERE pv_art = (SELECT MAX(pv_art) FROM articles);\n\nSELECT num_art FROM articles\nWHERE pv_art = (SELECT MIN(pv_art) FROM articles);"],
        ["<code>UPDATE</code>","Modifie des lignes existantes ; très souvent utilisée avec WHERE pour préciser les lignes concernées.","UPDATE Employé\nSET Salaire = Salaire * 1.15\nWHERE anciennete &gt; 10;\n\n/* supprimer le premier caractère d'une colonne */\nUPDATE table SET nom_colonne = SUBSTR(nom_colonne, 2) WHERE condition;\n\n/* supprimer le dernier caractère */\nUPDATE table\nSET nom_colonne = SUBSTR(nom_colonne, 1, CHAR_LENGTH(nom_colonne) - 1)\nWHERE condition;"]
      ]},
      { t:"Fonctions sur les chaînes de caractères", rows:[
        ["<code>CONCAT()</code>","Concatène les valeurs de plusieurs colonnes pour n'en former qu'une seule chaîne.","SELECT id, CONCAT(prenom, ' ', nom) AS affichage_nom\nFROM utilisateur;\n\nSELECT id, prenom, nom FROM utilisateur\nWHERE CONCAT(prenom, ' ', nom) LIKE 'Mohamed Ouni';"],
        ["<code>LENGTH()</code>","Calcule la longueur d'une chaîne (en octets ; un caractère multi-octets compte pour un).","SELECT LENGTH('exemple'); -- 7\nSELECT id, login, ville, telephone FROM utilisateur\nWHERE LENGTH(telephone) &lt; 10;"],
        ["<code>SUBSTRING()</code> / <code>SUBSTR()</code>","Segmenter une chaîne — 4 syntaxes : <code>SUBSTRING(chaine, debut)</code> &bull; <code>SUBSTRING(chaine FROM debut)</code> &bull; <code>SUBSTRING(chaine, debut, longueur)</code> &bull; <code>SUBSTRING(chaine FROM debut FOR longueur)</code>.","/* exclure le premier caractère */\nSELECT SUBSTR(nom_colonne, 2) AS colonne_sans_first FROM table WHERE condition;\n\n/* exclure le dernier caractère */\nSELECT SUBSTR(nom_colonne, 1, CHAR_LENGTH(nom_colonne) - 1) AS colonne_sans_last\nFROM table WHERE condition;"],
        ["<code>LEFT()</code>","Retourne le nombre souhaité de caractères parmi les premiers caractères d'une chaîne (tronque volontairement le texte).","SELECT LEFT('abcdefghij', 2);  -- 'ab'\nSELECT LEFT('abcdefghij', 40); -- 'abcdefghij'\nSELECT LEFT('abcdefghij', 0);  -- ''\nSELECT LEFT('abcdefghij', -1); -- ''\nSELECT LEFT('abcdefghij', NULL); -- NULL"],
        ["<code>RIGHT()</code>","Extrait la fin d'une chaîne en définissant la longueur souhaitée.","SELECT RIGHT('abcdefghij', 3);  -- 'hij'\nSELECT RIGHT('abcdefghij', 40); -- 'abcdefghij'\nSELECT RIGHT('abcdefghij', 0);  -- ''\nSELECT RIGHT('abcdefghij', NULL); -- NULL"]
      ]},
      { t:"Types et fonctions de date", rows:[
        ["Types","DATE (ex. 2024-11-04) &bull; TIME (ex. 23:44:05) &bull; DATETIME (ex. 2024-11-04 23:44:05) &bull; YEAR (ex. 2024).",""],
        ["<code>TIMESTAMP()</code>","Obtient un DATETIME à partir d'une DATE. Avec 1 argument, une date est transformée en DATETIME ; avec 2 arguments, une date et une heure sont combinées.","SELECT TIMESTAMP(\"2024-09-15\");        -- 2024-09-15 00:00:00\nSELECT TIMESTAMP(\"2024-09-15\", \"10:35\"); -- 2024-09-15 10:35:00"],
        ["<code>DAY()</code> (syn. DAYOFMONTH)","Retourne le jour dans le mois (1 à 31). Variantes : <code>DAYNAME()</code> nom du jour de la semaine, <code>DAYOFWEEK()</code> jour dans la semaine (1 = dimanche, 2 = lundi, …), <code>DAYOFYEAR()</code> jour dans l'année (1 à 366).",""],
        ["<code>MONTH()</code>","Extrait le numéro de mois à partir d'une date au format AAAA-MM-JJ. Attention : la fonction ne retourne pas les zéros pour les mois de '01' à '09'.","SELECT MONTH('2025-01-01'); -- 1\nSELECT MONTH('1999-12-01'); -- 12"],
        ["<code>YEAR()</code>","Extrait une année à partir d'une date au format AAAA-MM-JJ.","SELECT YEAR('2024-03-01'); -- 2024"],
        ["<code>NOW()</code>","Retourne la date et l'heure du système.","SELECT NOW(); -- 2024-02-22 16:19:43"],
        ["<code>DATEADD(interval, number, date)</code>","Ajoute un intervalle (year, month, …) à une date puis renvoie la date.","SELECT DATEADD(year, 1, '2024/08/25');  -- 2025-08-25\nSELECT DATEADD(month, -2, '2024/12/25'); -- 2024-10-25"],
        ["<code>DATEDIFF(interval, date1, date2)</code>","Renvoie la différence entre deux dates, sous forme d'entier.","SELECT DATEDIFF(year, '2024/08/25', '2011/08/25'); -- -13\nSELECT DATEDIFF(hour, '2024/11/25 07:00', '2024/11/25 10:45'); -- 3"]
      ]},
      { t:"Compléments (opérateurs, contraintes, SELECT standard)", rows:[
        ["Types de données","INT &bull; DECIMAL &bull; CHAR &bull; VARCHAR &bull; TEXT &bull; DATE &bull; TIME &bull; DATETIME (complétés par YEAR dans cette annexe).",""],
        ["Contraintes d'intégrité","NOT NULL &bull; DEFAULT &bull; CHECK &bull; PRIMARY KEY &bull; UNIQUE &bull; FOREIGN KEY &bull; REFERENCES &bull; ON UPDATE CASCADE &bull; ON DELETE CASCADE.",""],
        ["Opérateurs de comparaison","= &bull; &lt;&gt; &bull; &gt; &bull; &lt; &bull; &gt;= &bull; &lt;= &bull; IN &bull; BETWEEN &bull; LIKE &bull; IS.",""],
        ["Squelette de SELECT","SELECT [DISTINCT] expression [[AS] alias] FROM table [WHERE condition] [GROUP BY critère] [HAVING condition] [ORDER BY expression [ASC|DESC]].","SELECT des_art, pv_art FROM articles\nWHERE pv_art &gt; 500\nORDER BY pv_art DESC;"],
        ["Manipulation des données","INSERT INTO table [(colonnes)] VALUES (valeurs) &bull; DELETE FROM table [WHERE condition].",""]
      ]}
    ]}
];
root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.annexes = ANNEXES;
})(typeof window !== 'undefined' ? window : globalThis);
