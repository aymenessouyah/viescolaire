/* Référentiel « fonctions et propriétés » des annexes HTML5, CSS3, JavaScript, SQL, PHP
   Source : Récapitulatif des fonctions et propriétés des annexes — 4ème SI (A. Essouyah).
   Sert de grille d'avancement : une case par fonction / propriété / balise.
   Structure : STI_ANNEXES[nom] = { label, court, couleur, cats:[ {n, items:[{c,d}] } ] } */
(function (root) {
  root.STI_ANNEXES = {

    HTML5: {
      label: 'HTML5', court: 'HTML', couleur: '#e4661f',
      cats: [
        { n: 'Structure du document', items: [
          { c: 'html', d: 'racine du document' },
          { c: 'head', d: 'métadonnées du document' },
          { c: 'body', d: 'corps de la page' },
          { c: 'title', d: 'titre du document' },
          { c: 'meta', d: 'charset, name, content, http-equiv' },
          { c: 'link', d: 'ressource externe : href, rel, type' },
          { c: 'script', d: 'script intégré ou externe : src, type' },
          { c: 'style', d: 'styles CSS internes : type, media' }
        ]},
        { n: "Structuration d'une page", items: [
          { c: 'header', d: 'contenu d’introduction / navigation' },
          { c: 'nav', d: 'liens de navigation' },
          { c: 'main', d: 'contenu principal' },
          { c: 'section', d: 'section du document' },
          { c: 'article', d: 'contenu indépendant et autonome' },
          { c: 'aside', d: 'contenu annexe (barre latérale)' },
          { c: 'footer', d: 'pied de page' }
        ]},
        { n: 'Conteneurs', items: [
          { c: 'div', d: 'conteneur de type bloc' },
          { c: 'span', d: 'conteneur en ligne' },
          { c: 'iframe', d: 'cadre en ligne : src, name' }
        ]},
        { n: 'Listes', items: [
          { c: 'ul', d: 'liste à puces' },
          { c: 'ol', d: 'liste ordonnée : reversed, type, start' },
          { c: 'li', d: 'élément de liste' }
        ]},
        { n: 'Tableaux', items: [
          { c: 'table, caption, thead, tbody, tfoot, tr, th, td', d: 'structure d’un tableau' },
          { c: 'colspan, rowspan', d: 'fusion de cellules' }
        ]},
        { n: 'Texte et média', items: [
          { c: 'h1 à h6', d: 'titres' },
          { c: 'p', d: 'paragraphe' },
          { c: 'br', d: 'retour à la ligne' },
          { c: 'hr', d: 'ligne horizontale' },
          { c: 'cite', d: 'titre d’une œuvre' },
          { c: 'mark', d: 'texte surligné' },
          { c: 'address', d: 'coordonnées de l’auteur' },
          { c: 'a', d: 'lien hypertexte : href, target' },
          { c: 'img', d: 'image : src, alt, srcset, width, height, title' },
          { c: 'audio', d: 'son : controls, src' },
          { c: 'video', d: 'vidéo : controls, src, width' },
          { c: 'source', d: 'ressource multimédia : src, type, media' },
          { c: 'figure, figcaption', d: 'conteneur autonome et sa légende' },
          { c: 'details, summary', d: 'contenu repliable (attribut open)' },
          { c: 'output', d: 'résultat d’un calcul ou d’une action' }
        ]},
        { n: 'Formulaires', items: [
          { c: 'form', d: 'action, method (get, post), target, name' },
          { c: 'fieldset, legend', d: 'regroupement et légende' },
          { c: 'label', d: 'attribut : for' },
          { c: 'input', d: 'champ de saisie' },
          { c: 'select, option', d: 'liste déroulante : name, id, size, value' },
          { c: 'datalist', d: 'options liées à un input via list' },
          { c: 'textarea', d: 'name, cols, rows, readonly, required, disabled, placeholder, maxlength' },
          { c: 'types de input', d: 'button, reset, submit, text, email, tel, password, number, range, date, time, checkbox, radio' },
          { c: 'attributs de input', d: 'name, value, placeholder, readonly, required, disabled, list, min, max, checked' }
        ]},
        { n: 'Événements', items: [
          { c: 'onblur', d: 'perte du focus' },
          { c: 'onfocus', d: 'obtention du focus' },
          { c: 'onclick', d: 'clic sur l’élément' },
          { c: 'oninput', d: 'la valeur change (en direct)' },
          { c: 'onchange', d: 'la valeur est modifiée' },
          { c: 'onload', d: 'page entièrement chargée' },
          { c: 'onmouseover / onmouseout', d: 'survol / sortie de la souris' },
          { c: 'onplay / onpause', d: 'lecture / pause audio-vidéo' },
          { c: 'onsubmit', d: 'soumission du formulaire' },
          { c: 'onkeydown / onkeyup', d: 'touche pressée / relâchée' }
        ]},
        { n: 'Attributs globaux', items: [
          { c: 'class, hidden, id, lang, style, title', d: 'communs à tous les éléments' }
        ]}
      ]
    },

    CSS3: {
      label: 'CSS3', court: 'CSS', couleur: '#38968e',
      cats: [
        { n: 'Sélecteurs', items: [
          { c: '*', d: 'tous les éléments' },
          { c: 'element', d: 'par type (ex. head)' },
          { c: '#id', d: 'par identifiant' },
          { c: '.class', d: 'par classe' },
          { c: 'element.class', d: 'élément d’une classe donnée' },
          { c: 'element[attr]', d: 'élément possédant l’attribut' },
          { c: 'element[attr=valeur]', d: 'valeur exacte de l’attribut' },
          { c: '[attr^="…"]', d: 'commence par' },
          { c: '[attr*="…"]', d: 'contient (i insensible, s sensible à la casse)' },
          { c: '[attr$="…"]', d: 'finit par' },
          { c: 'groupement', d: 'sélecteurs séparés par la virgule' }
        ]},
        { n: 'Pseudo-classes', items: [
          { c: 'a:link, a:visited, a:hover, a:active', d: 'états d’un lien' }
        ]},
        { n: 'Texte', items: [
          { c: 'font-family', d: 'police' },
          { c: 'font-weight', d: 'bold, bolder, lighter' },
          { c: 'font-style', d: 'italic' },
          { c: 'font-size', d: 'taille' },
          { c: 'font', d: 'raccourci' },
          { c: 'text-align', d: 'left, center, right, justify' },
          { c: 'text-shadow', d: 'ombre du texte' },
          { c: 'text-transform', d: 'uppercase, lowercase, capitalize' },
          { c: 'color', d: 'couleur du texte' }
        ]},
        { n: 'Listes', items: [
          { c: 'list-style-type', d: 'circle, square, upper-roman, lower-alpha' },
          { c: 'list-style-position', d: 'outside, inside' },
          { c: 'list-style-image', d: 'image de puce' },
          { c: 'list-style', d: 'raccourci' }
        ]},
        { n: 'Arrière-plan', items: [
          { c: 'background-color', d: 'couleur de fond' },
          { c: 'background-image', d: 'image de fond' },
          { c: 'background-repeat', d: 'repeat, repeat-x, repeat-y, no-repeat' },
          { c: 'background-size', d: 'contain, cover, %' },
          { c: 'background', d: 'raccourci' }
        ]},
        { n: 'Tableaux', items: [
          { c: 'table-layout', d: 'auto, fixed' },
          { c: 'border-collapse', d: 'separate, collapse' }
        ]},
        { n: 'Boîtes et positionnement', items: [
          { c: 'width, height', d: 'dimensions' },
          { c: 'position', d: 'absolute, fixed, relative, static, sticky' },
          { c: 'float', d: 'left, right, none' },
          { c: 'padding', d: 'marges internes' },
          { c: 'margin', d: 'marges externes' },
          { c: 'box-shadow', d: 'ombre de la boîte' },
          { c: 'display', d: 'inline, block, inline-block' },
          { c: 'top, bottom, left, right', d: 'décalages' },
          { c: 'overflow', d: 'visible, hidden, clip, scroll, auto' },
          { c: 'opacity', d: 'transparence' },
          { c: 'clear', d: 'annuler un flottement' },
          { c: 'z-index', d: 'empilement' }
        ]},
        { n: 'Bordures', items: [
          { c: 'border-color', d: 'couleur' },
          { c: 'border-style', d: 'none, dotted, inset, solid…' },
          { c: 'border-radius', d: 'coins arrondis' },
          { c: 'border-width', d: 'medium, thin, thick, px' },
          { c: 'border', d: 'raccourci' }
        ]},
        { n: 'Transformation', items: [
          { c: 'transform', d: 'rotate(), skew(), scale(), translate()' }
        ]},
        { n: 'Images (filtres)', items: [
          { c: 'filter', d: 'blur(), grayscale(), invert()' }
        ]},
        { n: 'Transition', items: [
          { c: 'transition-delay', d: 'délai' },
          { c: 'transition-duration', d: 'durée' },
          { c: 'transition-property', d: 'propriété animée' },
          { c: 'transition', d: 'raccourci' }
        ]},
        { n: 'Animation', items: [
          { c: '@keyframes', d: 'étapes de l’animation' },
          { c: 'animation-name', d: 'nom de l’animation' },
          { c: 'animation-delay', d: 'délai' },
          { c: 'animation-duration', d: 'durée' },
          { c: 'animation-iteration-count', d: 'nombre de répétitions' },
          { c: 'animation-direction', d: 'sens' },
          { c: 'animation', d: 'raccourci' }
        ]}
      ]
    },

    JavaScript: {
      label: 'JavaScript', court: 'JS', couleur: '#b8860b',
      cats: [
        { n: 'Opérateurs', items: [
          { c: 'logiques', d: '&& (ET), || (OU), ! (NON)' },
          { c: 'comparaison', d: '==, !=, >, >=, <, <=' },
          { c: 'arithmétiques', d: '+, -, *, /, %' }
        ]},
        { n: 'Entrées / sorties', items: [
          { c: 'alert()', d: 'affiche un message' },
          { c: 'prompt()', d: 'boîte de saisie' },
          { c: 'confirm()', d: 'question OK / Annuler' },
          { c: 'document.write()', d: 'écrit dans le document (obsolète)' },
          { c: 'innerHTML', d: 'modifie le contenu HTML d’un élément' },
          { c: 'textContent', d: 'modifie le texte brut d’un élément' }
        ]},
        { n: 'Conversion et test', items: [
          { c: 'isNaN(ch)', d: 'true si non convertible en nombre' },
          { c: 'Number.isNaN(x)', d: 'teste strictement si la valeur est NaN' },
          { c: 'Number(ch)', d: 'convertit en nombre' },
          { c: 'parseFloat(ch)', d: 'convertit en réel' },
          { c: 'parseInt(ch [,b])', d: 'convertit en entier dans la base b' },
          { c: 'String(a)', d: 'convertit en chaîne' }
        ]},
        { n: 'Objet Math', items: [
          { c: 'Math.abs(x)', d: 'valeur absolue' },
          { c: 'Math.sqrt(x)', d: 'racine carrée' },
          { c: 'Math.round(x)', d: 'arrondi' },
          { c: 'Math.trunc(x)', d: 'partie entière' },
          { c: 'Math.random()', d: 'nombre aléatoire' }
        ]},
        { n: 'Chaînes de caractères', items: [
          { c: '+', d: 'concaténation' },
          { c: 'ch.length', d: 'longueur' },
          { c: 'ch.indexOf(ch1 [,p])', d: 'première occurrence' },
          { c: 'ch.lastIndexOf(ch1 [,p])', d: 'dernière occurrence' },
          { c: 'ch.substring(d, f)', d: 'sous-chaîne' },
          { c: 'ch.replace(ch1, ch2)', d: 'remplace la première occurrence' },
          { c: 'ch.toLowerCase() / toUpperCase()', d: 'minuscules / majuscules' },
          { c: 'ch.trim()', d: 'supprime les espaces de début et de fin' },
          { c: 'String.fromCharCode(…)', d: 'chaîne à partir de codes' }
        ]},
        { n: 'Objet Date', items: [
          { c: 'new Date()', d: 'date courante' },
          { c: 'new Date(ch)', d: 'à partir d’une chaîne (ISO, courte, longue)' },
          { c: 'getDate(), getMonth(), getFullYear()', d: 'composantes de la date' },
          { c: 'toString()', d: 'affichage de la date' }
        ]},
        { n: 'Tableaux', items: [
          { c: 'length', d: 'nombre d’éléments' },
          { c: 'littéral [ ]', d: 'création d’un tableau' }
        ]},
        { n: 'DOM : sélection et modification', items: [
          { c: 'document.getElementById()', d: 'sélection par identifiant' },
          { c: 'document.getElementsByName()', d: 'sélection par nom' },
          { c: 'element.attribut = valeur', d: 'value, checked, disabled, readonly, src, muted' },
          { c: 'element.style.propriété = valeur', d: 'color, background, border, font, width, height' },
          { c: 'element.méthode()', d: 'play(), pause()' },
          { c: 'currentTime, volume, playbackRate', d: 'préparation d’un média' },
          { c: 'select.selectedIndex', d: 'liste déroulante' }
        ]}
      ]
    },

    SQL: {
      label: 'SQL', court: 'SQL', couleur: '#1f3a5f',
      cats: [
        { n: 'LDD (définition des données)', items: [
          { c: 'CREATE TABLE', d: 'CONSTRAINT, PRIMARY KEY, REFERENCES … ON DELETE CASCADE, NOT NULL, CHECK, DEFAULT' },
          { c: 'ALTER TABLE', d: 'ADD / MODIFY / DROP COLUMN, ADD CONSTRAINT, ADD / DROP PRIMARY KEY, DISABLE / ENABLE KEYS, RENAME TO' },
          { c: 'DROP TABLE / DROP DATABASE', d: 'suppression' },
          { c: 'types', d: 'VARCHAR, INT, DECIMAL, DATE, TIME, DATETIME, TIMESTAMP, YEAR' }
        ]},
        { n: 'LMD (manipulation des données)', items: [
          { c: 'commandes', d: 'SELECT, FROM, WHERE, UPDATE … SET, INSERT, DELETE' },
          { c: 'clauses', d: 'GROUP BY, ORDER BY, HAVING' },
          { c: 'opérateurs', d: 'DISTINCT, BETWEEN, IN, LIKE' }
        ]},
        { n: 'Fonctions de chaînes', items: [
          { c: 'CONCAT()', d: 'concaténation' },
          { c: 'LENGTH() / CHAR_LENGTH()', d: 'longueur' },
          { c: 'SUBSTRING() / SUBSTR()', d: 'extraction' },
          { c: 'LEFT() / RIGHT()', d: 'extrémités' }
        ]},
        { n: 'Fonctions de date et heure', items: [
          { c: 'NOW(), TIMESTAMP()', d: 'date et heure courantes' },
          { c: 'DAY(), DAYNAME(), DAYOFMONTH(), DAYOFWEEK(), DAYOFYEAR()', d: 'composantes du jour' },
          { c: 'MONTH(), YEAR()', d: 'mois et année' },
          { c: 'DATEADD()', d: 'ajout d’un intervalle' },
          { c: 'DATEDIFF()', d: 'écart entre deux dates' }
        ]}
      ]
    },

    PHP: {
      label: 'PHP', court: 'PHP', couleur: '#6a4c93',
      cats: [
        { n: 'Types, transtypage et opérateurs', items: [
          { c: 'types', d: 'int, float, string, bool, array' },
          { c: 'transtypage', d: '(int), (float), (string), (bool), (array)' },
          { c: 'opérateurs', d: 'logiques &&, || ; affectation = ; concaténation .' }
        ]},
        { n: 'Variables et constantes', items: [
          { c: 'define(), gettype(), settype()', d: 'constantes et types' },
          { c: 'is_string(), is_array(), is_double(), is_integer()', d: 'tests de type' },
          { c: 'isset(), unset()', d: 'existence d’une variable' }
        ]},
        { n: 'Fonctions mathématiques', items: [
          { c: 'abs(), sqrt(), round(), rand()', d: 'calculs' }
        ]},
        { n: 'Chaînes de caractères', items: [
          { c: 'chr(), ord()', d: 'code ↔ caractère' },
          { c: 'strlen(), substr(), substr_replace()', d: 'longueur et extraction' },
          { c: 'strpos()', d: 'recherche' },
          { c: 'strcmp(), strcasecmp()', d: 'comparaison' },
          { c: 'strrev(), str_replace(), strtolower(), strtoupper(), trim()', d: 'transformation' },
          { c: 'implode(), explode()', d: 'chaîne ↔ tableau' }
        ]},
        { n: 'Date et heure', items: [
          { c: 'date(), getdate()', d: 'affichage de la date' },
          { c: 'time(), mktime(), strtotime(), checkdate()', d: 'calculs et vérification' }
        ]},
        { n: 'Tableaux', items: [
          { c: 'array(), count(), sizeof()', d: 'création et taille' },
          { c: 'current(), pos(), key(), reset(), end(), next(), prev()', d: 'parcours par pointeur interne' },
          { c: 'sort(), rsort(), ksort(), krsort()', d: 'tri' }
        ]},
        { n: 'Langage et divers', items: [
          { c: 'echo, print', d: 'affichage' },
          { c: 'die(), require()', d: 'arrêt et inclusion' }
        ]},
        { n: 'Variables superglobales', items: [
          { c: '$_GET, $_POST', d: 'données transmises au serveur' }
        ]},
        { n: 'MySQL avec MySQLi (style procédural)', items: [
          { c: 'mysqli_connect()', d: 'connexion au serveur' },
          { c: 'mysqli_select_db()', d: 'sélection de la base' },
          { c: 'mysqli_query()', d: 'exécution d’une requête SQL' },
          { c: 'mysqli_fetch_array()', d: 'ligne (tableau associatif et numérique)' },
          { c: 'mysqli_fetch_row()', d: 'ligne (tableau indexé)' },
          { c: 'mysqli_num_rows()', d: 'nombre de lignes d’un résultat' },
          { c: 'mysqli_affected_rows()', d: 'nombre de lignes affectées' },
          { c: 'mysqli_insert_id()', d: 'dernier identifiant AUTO_INCREMENT' },
          { c: 'mysqli_error()', d: 'message d’erreur' },
          { c: 'mysqli_close()', d: 'fermeture de la connexion' }
        ]}
      ]
    }
  };

  /* total : nombre de fonctions / propriétés référencées */
  root.STI_ANNEXES_TOTAL = Object.keys(root.STI_ANNEXES).reduce(function (t, k) {
    return t + root.STI_ANNEXES[k].cats.reduce(function (s, c) { return s + c.items.length; }, 0);
  }, 0);
})(this);
