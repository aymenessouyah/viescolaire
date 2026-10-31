/* Fiches pédagogiques 3SI1 — modèle « S8-9 version 3 ».
   54 fiches, une par séance : objectifs, méthode, prérequis, critères de réussite,
   déroulement sur 120 min, travail à la maison.
   Ces contenus alimentent la boîte de fiche pédagogique du site ; ils sont
   préremplis automatiquement et modifiables par l'enseignant (les modifications
   sont conservées dans le navigateur, sans toucher à ce fichier).
   Fichier de données — modifiable sans toucher au code de l'application. */
(function (root) {
'use strict';
const FICHES_3SI1 = {
 "1": {
  "n": 1,
  "titre": "HTML5 — structure d'un document : doctype, html, head, body",
  "date": "2026-09-15",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5",
  "pages": "p. 67",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "Présentation de la matière, du programme et du Smart Book 3e",
     "rôle des balises <!DOCTYPE html>, <html lang>, <head>, <body>",
     "title, meta charset, meta viewport"
    ]
   },
   {
    "titre": "Anatomie d'un document HTML5",
    "items": [
     "Identifier le rôle du doctype, de html, de head et de body dans un document."
    ]
   },
   {
    "titre": "Head et métadonnées",
    "items": [
     "Écrire l'en-tête d'une page : title, meta charset, meta viewport."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Aucun prérequis : première séance de l'année",
   "le traitement de texte et le navigateur sont supposés connus"
  ],
  "criteres": [
   "Une page web est un document texte structuré ; sans doctype ni encodage déclaré, le navigateur interprète le fichier au hasard.",
   "Produire : Création du dossier « sti-3si1 », du fichier index.html et du squelette minimal …",
   "Éviter : Enregistrer le fichier sans l'extension .html."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Aucun prérequis : première séance de l'année ; le traitement de texte et le navigateur sont supposés connus.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "On affiche deux pages enregistrées dans le dossier d'un élève : la première s'ouvre sans mise en forme, la seconde n'affiche qu'une page blanche. Aucune des deux n'a de structure correcte : les élèves cherchent l'erreur avant tout apport théorique. Présenter les consignes : Création du dossier « sti-3si1 », du fichier index.html et du squelette minimal ; ouverture dans le navigateur et modification du titre de l'onglet.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Présentation de la matière, du programme et du Smart Book 3e ; rôle des balises <!DOCTYPE html>, <html lang>, <head>, <body> ; title, meta charset, meta viewport ; imbrication et indentation ; arborescence du dossier de travail. Assister à la correction pour chaque élève ; Par deux : ajout de métadonnées (auteur, description, viewport), indentation du code, enregistrement puis ouverture du même fichier sur un autre…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Présentation de la matière, du programme et du Smart Book 3e • rôle des balises <!DOCTYPE html>, <html lang>, <head>, <body> • title, meta charset, meta viewport • Enregistrer le fichier sans l'extension .html. • Confondre le contenu affiché (body) et les métadonnées (head).",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   }
  ],
  "maison": "Rapporter sur clé USB le fichier index.html du dossier personnel, indentation correcte et titre renseigné.",
  "trace": "Une page web est un document texte structuré ; sans doctype ni encodage déclaré, le navigateur interprète le fichier au hasard.",
  "erreurs": [
   "Enregistrer le fichier sans l'extension .html.",
   "Confondre le contenu affiché (body) et les métadonnées (head)."
  ],
  "prerequis_technique": "Aucun prérequis : première séance de l'année ; le traitement de texte et le navigateur sont supposés connus.",
  "axes": [
   "Anatomie d'un document HTML5",
   "Head et métadonnées",
   "Organisation du dossier de travail"
  ],
  "objectifs_cours": [
   "Identifier le rôle du doctype, de html, de head et de body dans un document.",
   "Écrire l'en-tête d'une page : title, meta charset, meta viewport.",
   "Créer, nommer et enregistrer correctement son dossier et ses fichiers de travail."
  ]
 },
 "2": {
  "n": 2,
  "titre": "HTML5 — titres, paragraphes, listes et mise en forme de base",
  "date": "2026-09-17",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5",
  "pages": "p. 67",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "h1 à h6 et hiérarchie",
     "paragraphe, saut de ligne, séparateur",
     "ul, ol, dl, dt, dd"
    ]
   },
   {
    "titre": "Hiérarchie des titres",
    "items": [
     "Respecter la hiérarchie h1 à h6 sans sauter de niveau."
    ]
   },
   {
    "titre": "Paragraphes et listes",
    "items": [
     "Structurer un contenu en paragraphes et en listes (non ordonnée, ordonnée, de définition)."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Squelette d'un document HTML5 (séance 1)"
  ],
  "criteres": [
   "Un seul h1 par page et une hiérarchie continue : le plan de la page doit rester lisible sans la feuille de style.",
   "Produire : Rédaction de la page « présentation personnelle » : titre unique, sous-titres, deux…",
   "Éviter : Descendre de h2 à h4."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Squelette d'un document HTML5 (séance 1).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Trois pages d'élèves sont projetées : sur chacune, le texte est écrit en gras à coups de <b> et les titres sont des paragraphes agrandis par la balise <font>. On demande ce qui se passe si l'on demande à une machine de lire le plan de la page. Présenter les consignes : Rédaction de la page « présentation personnelle » : titre unique, sous-titres, deux paragraphes, une liste ordonnée de loisirs et une liste non…",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "h1 à h6 et hiérarchie ; paragraphe, saut de ligne, séparateur ; ul, ol, dl, dt, dd ; strong, em, mark ; balises obsolètes (b, i, font, center) et raison de leur abandon. Assister à la correction pour chaque élève ; Ajout d'une liste de définition (sigles STI, HTML, CSS) et d'un passage mis en valeur ; relecture croisée et correction des hiérarchies fautives.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • h1 à h6 et hiérarchie • paragraphe, saut de ligne, séparateur • ul, ol, dl, dt, dd • Descendre de h2 à h4. • Utiliser <br> à répétition pour créer des paragraphes.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   }
  ],
  "maison": "Terminer la page personnelle et vérifier que le plan des titres reste cohérent si les styles sont supprimés.",
  "trace": "Un seul h1 par page et une hiérarchie continue : le plan de la page doit rester lisible sans la feuille de style.",
  "erreurs": [
   "Descendre de h2 à h4.",
   "Utiliser <br> à répétition pour créer des paragraphes."
  ],
  "prerequis_technique": "Squelette d'un document HTML5 (séance 1).",
  "axes": [
   "Hiérarchie des titres",
   "Paragraphes et listes",
   "Emphase et balises à éviter"
  ],
  "objectifs_cours": [
   "Respecter la hiérarchie h1 à h6 sans sauter de niveau.",
   "Structurer un contenu en paragraphes et en listes (non ordonnée, ordonnée, de définition).",
   "Utiliser strong, em et mark au lieu des balises de présentation obsolètes."
  ]
 },
 "3": {
  "n": 3,
  "titre": "HTML5 — liens, images et chemins de fichiers",
  "date": "2026-09-22",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5",
  "pages": "p. 67-68",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "href, target, title",
     "lien interne, externe, ancre avec identifiant et lien de messagerie mailto",
     "img, alt, width, height"
    ]
   },
   {
    "titre": "Liens internes, externes et ancres",
    "items": [
     "Écrire un lien interne, un lien externe, une ancre et un lien de messagerie."
    ]
   },
   {
    "titre": "Images et textes alternatifs",
    "items": [
     "Insérer une image avec un texte alternatif, une largeur et une hauteur."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Titres, paragraphes et listes (séance 2)"
  ],
  "criteres": [
   "Un lien est un chemin vers un fichier : relatif au dossier courant, il survit au changement de poste ; le texte alternatif rend l'image compréhensible sans elle.",
   "Produire : Galerie de trois pages reliées entre elles (accueil, photos, contact) avec menu de…",
   "Éviter : Écrire une URL complète pour un fichier de son propre dossier."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Titres, paragraphes et listes (séance 2).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "La page d'accueil d'un site de club contient trois liens : un seul fonctionne. Le premier pointe vers un chemin absolu du disque, le deuxième a une faute de casse, le troisième ouvre une image à la place d'une page. On part de ces trois pannes. Présenter les consignes : Galerie de trois pages reliées entre elles (accueil, photos, contact) avec menu de navigation identique et une ancre vers le haut de page.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "href, target, title ; lien interne, externe, ancre avec identifiant et lien de messagerie mailto ; img, alt, width, height ; chemins relatifs, absolus, dossier parent (../) ; casse des noms de fichiers. Assister à la correction pour chaque élève ; Ajout d'images redimensionnées avec texte alternatif, correction des chemins fautifs, test de tous les liens de la galerie.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • href, target, title • lien interne, externe, ancre avec identifiant et lien de messagerie… • img, alt, width, height • Écrire une URL complète pour un fichier de son propre dossier. • Image sans alt ni dimensions : mise en page qui saute au chargement.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   }
  ],
  "maison": "Relier les trois pages de la galerie, tester chaque lien et corriger les chemins cassés.",
  "trace": "Un lien est un chemin vers un fichier : relatif au dossier courant, il survit au changement de poste ; le texte alternatif rend l'image compréhensible sans elle.",
  "erreurs": [
   "Écrire une URL complète pour un fichier de son propre dossier.",
   "Image sans alt ni dimensions : mise en page qui saute au chargement."
  ],
  "prerequis_technique": "Titres, paragraphes et listes (séance 2).",
  "axes": [
   "Liens internes, externes et ancres",
   "Images et textes alternatifs",
   "Chemins relatifs"
  ],
  "objectifs_cours": [
   "Écrire un lien interne, un lien externe, une ancre et un lien de messagerie.",
   "Insérer une image avec un texte alternatif, une largeur et une hauteur.",
   "Choisir un chemin relatif correct et repérer un dossier parent."
  ]
 },
 "4": {
  "n": 4,
  "titre": "HTML5 — tableaux et données tabulaires",
  "date": "2026-09-24",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5",
  "pages": "p. 68",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "table, caption, thead, tbody, tfoot, tr, th, td",
     "colspan et rowspan",
     "scope et summary"
    ]
   },
   {
    "titre": "Structure d'un tableau",
    "items": [
     "Construire un tableau avec caption, thead, tbody et tfoot."
    ]
   },
   {
    "titre": "Fusion de cellules",
    "items": [
     "Fusionner des cellules avec colspan et rowspan sans perdre la logique du tableau."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Structure du document et listes (séances 1 et 2)"
  ],
  "criteres": [
   "Un tableau sert à croiser des données : en-têtes déclarés, cellules fusionnées avec parcimonie, jamais pour remplacer une mise en page.",
   "Produire : Reprise de l'emploi du temps : caption, en-tête de colonnes, ligne de créneaux horaires…",
   "Éviter : Fusionner des cellules sans garder le compte des colonnes."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Structure du document et listes (séances 1 et 2).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Deux versions de l'emploi du temps de la classe sont affichées : la première est faite de colonnes en espaces insécables, la seconde en tableau. On demande laquelle reste lisible sur un téléphone et laquelle peut être lue par un lecteur d'écran. Présenter les consignes : Reprise de l'emploi du temps : caption, en-tête de colonnes, ligne de créneaux horaires et contenu des séances.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "table, caption, thead, tbody, tfoot, tr, th, td ; colspan et rowspan ; scope et summary ; différence entre données tabulaires et tableau de mise en page. Assister à la correction pour chaque élève ; Insertion d'une pause déjeuner fusionnée (colspan) et d'une colonne de groupe fusionnée sur deux lignes (rowspan) ; vérification de l'affichage et de…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • table, caption, thead, tbody, tfoot, tr, th, td • colspan et rowspan • scope et summary • Fusionner des cellules sans garder le compte des colonnes. • Utiliser un tableau pour aligner trois blocs de texte.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   }
  ],
  "maison": "Reproduire le tableau des notes du trimestre (matières en lignes, devoirs en colonnes) avec en-têtes corrects.",
  "trace": "Un tableau sert à croiser des données : en-têtes déclarés, cellules fusionnées avec parcimonie, jamais pour remplacer une mise en page.",
  "erreurs": [
   "Fusionner des cellules sans garder le compte des colonnes.",
   "Utiliser un tableau pour aligner trois blocs de texte."
  ],
  "prerequis_technique": "Structure du document et listes (séances 1 et 2).",
  "axes": [
   "Structure d'un tableau",
   "Fusion de cellules",
   "Accessibilité du tableau"
  ],
  "objectifs_cours": [
   "Construire un tableau avec caption, thead, tbody et tfoot.",
   "Fusionner des cellules avec colspan et rowspan sans perdre la logique du tableau.",
   "Renseigner scope et un résumé pour rendre le tableau lisible sans voir la mise en forme."
  ]
 },
 "5": {
  "n": 5,
  "titre": "HTML5 — formulaires : champs, étiquettes et boutons",
  "date": "2026-09-29",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5",
  "pages": "p. 68-69",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "form, action, method",
     "input text, password, email, tel, number, date, radio, checkbox, file, submit, reset",
     "label, select et option, textarea"
    ]
   },
   {
    "titre": "Champs et types d'input",
    "items": [
     "Choisir le type d'input adapté à chaque donnée demandée."
    ]
   },
   {
    "titre": "Étiquettes et groupes",
    "items": [
     "Associer chaque champ à une étiquette et regrouper les champs liés dans un fieldset."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Tableaux et structure du document (séances 1 à 4)"
  ],
  "criteres": [
   "Le type d'input est la première validation : bien choisi, il évite la moitié des erreurs de saisie avant tout script.",
   "Produire : Formulaire d'inscription au club informatique : nom, mot de passe, e-mail, téléphone…",
   "Éviter : Champ sans attribut name : valeur jamais transmise."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Tableaux et structure du document (séances 1 à 4).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Une fiche d'inscription papier circule en classe : les élèves doivent la transposer en page web. Très vite se pose la question du contrôle : comment empêcher un numéro de téléphone dans le champ du nom, sans écrire de programme ? Présenter les consignes : Formulaire d'inscription au club informatique : nom, mot de passe, e-mail, téléphone, date de naissance, niveau (select), deux boutons radio, une…",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "form, action, method ; input text, password, email, tel, number, date, radio, checkbox, file, submit, reset ; label, select et option, textarea ; fieldset et legend ; required, placeholder, value, name, checked. Assister à la correction pour chaque élève ; Mise en forme du formulaire en fieldset et legend, association systématique des label, ajout des attributs required et placeholder, test de la saisie…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • form, action, method • input text, password, email, tel, number, date, radio, checkbox… • label, select et option, textarea • Champ sans attribut name : valeur jamais transmise. • label sans attribut for relié à l'identifiant du champ.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   }
  ],
  "maison": "Terminer le formulaire et vérifier que chaque champ possède une étiquette associée et un attribut name.",
  "trace": "Le type d'input est la première validation : bien choisi, il évite la moitié des erreurs de saisie avant tout script.",
  "erreurs": [
   "Champ sans attribut name : valeur jamais transmise.",
   "label sans attribut for relié à l'identifiant du champ."
  ],
  "prerequis_technique": "Tableaux et structure du document (séances 1 à 4).",
  "axes": [
   "Champs et types d'input",
   "Étiquettes et groupes",
   "Attributs de contrôle de saisie"
  ],
  "objectifs_cours": [
   "Choisir le type d'input adapté à chaque donnée demandée.",
   "Associer chaque champ à une étiquette et regrouper les champs liés dans un fieldset.",
   "Utiliser required, placeholder, value et name pour préparer la saisie et son traitement."
  ]
 },
 "6": {
  "n": 6,
  "titre": "HTML5 — structuration sémantique d'une page",
  "date": "2026-10-01",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5",
  "pages": "p. 69",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "header, nav, main, section, article, aside, footer, figure et figcaption",
     "rôle de chaque zone",
     "différence avec div et span"
    ]
   },
   {
    "titre": "Balises sémantiques",
    "items": [
     "Identifier les zones d'une page : header, nav, main, section, article, aside, footer."
    ]
   },
   {
    "titre": "Plan de page d'un site",
    "items": [
     "Reconstruire le plan d'une page d'établissement avec les balises sémantiques."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Structure, titres, listes, liens, tableaux et formulaires (séances 1 à 5)"
  ],
  "criteres": [
   "La sémantique décrit le rôle du contenu : une page compréhensible sans CSS est une page bien structurée.",
   "Produire : Découpage au crayon de la maquette du site du lycée (cinq zones) puis réécriture de la…",
   "Éviter : Mettre plusieurs main dans une page."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Structure, titres, listes, liens, tableaux et formulaires (séances 1 à 5).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "La page d'accueil du lycée, entièrement construite en <div>, est projetée. Les élèves doivent montrer où se trouve le menu, le contenu principal et le pied de page : personne ne peut le dire sans lire tout le code. Présenter les consignes : Découpage au crayon de la maquette du site du lycée (cinq zones) puis réécriture de la page avec les balises sémantiques.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "header, nav, main, section, article, aside, footer, figure et figcaption ; rôle de chaque zone ; différence avec div et span ; plan de page type d'un site d'établissement. Assister à la correction pour chaque élève ; Ajout de deux articles d'actualité, d'une barre latérale et d'une figure légendée ; vérification du plan des titres obtenu.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • header, nav, main, section, article, aside, footer, figure et… • rôle de chaque zone • différence avec div et span • Mettre plusieurs main dans une page. • Utiliser section sans titre à l'intérieur.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   }
  ],
  "maison": "Transposer la page d'accueil du lycée en structure sémantique et rapporter le fichier .html.",
  "trace": "La sémantique décrit le rôle du contenu : une page compréhensible sans CSS est une page bien structurée.",
  "erreurs": [
   "Mettre plusieurs main dans une page.",
   "Utiliser section sans titre à l'intérieur."
  ],
  "prerequis_technique": "Structure, titres, listes, liens, tableaux et formulaires (séances 1 à 5).",
  "axes": [
   "Balises sémantiques",
   "Plan de page d'un site",
   "Différence avec div et span"
  ],
  "objectifs_cours": [
   "Identifier les zones d'une page : header, nav, main, section, article, aside, footer.",
   "Reconstruire le plan d'une page d'établissement avec les balises sémantiques.",
   "Expliquer pourquoi la sémantique aide le référencement et l'accessibilité."
  ]
 },
 "7": {
  "n": 7,
  "titre": "HTML5 — multimédia, attributs globaux et validation du code",
  "date": "2026-10-06",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5",
  "pages": "p. 69-70",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "audio, video, source, track",
     "formats usuels",
     "attributs globaux id, class, style, title, hidden, data-*"
    ]
   },
   {
    "titre": "Audio et vidéo",
    "items": [
     "Intégrer un son et une vidéo avec leurs formats de secours."
    ]
   },
   {
    "titre": "Attributs globaux",
    "items": [
     "Utiliser les attributs globaux id, class, title, hidden et data-* à bon escient."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Structure sémantique de la page (séance 6)"
  ],
  "criteres": [
   "Valider son code avant de le rendre : le validateur relève les erreurs que le navigateur, lui, corrige silencieusement.",
   "Produire : Intégration d'une vidéo et d'un fichier audio avec contrôles, texte de secours et légende…",
   "Éviter : Oublier l'attribut controls : lecteur invisible."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Structure sémantique de la page (séance 6).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "La page d'accueil du club contient une vidéo de présentation qui ne démarre pas et un lecteur sans commandes. Le passage au validateur W3C, projeté en direct, affiche dix-sept erreurs : on les trie ensemble. Présenter les consignes : Intégration d'une vidéo et d'un fichier audio avec contrôles, texte de secours et légende ; ajustement des dimensions.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "audio, video, source, track ; formats usuels ; attributs globaux id, class, style, title, hidden, data-* ; commentaires ; types d'erreurs relevées par le validateur W3C. Assister à la correction pour chaque élève ; Validation du document au W3C, correction des erreurs relevées et rédaction d'une fiche « erreurs fréquentes » ; synthèse du domaine HTML5.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • audio, video, source, track • formats usuels • attributs globaux id, class, style, title, hidden, data-* • Oublier l'attribut controls : lecteur invisible. • Imbriquer des balises de bloc dans un paragraphe.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes HTML5 · VS Code · navigateur"
   }
  ],
  "maison": "Corriger son document jusqu'à zéro erreur au validateur et l'apporter en séance.",
  "trace": "Valider son code avant de le rendre : le validateur relève les erreurs que le navigateur, lui, corrige silencieusement.",
  "erreurs": [
   "Oublier l'attribut controls : lecteur invisible.",
   "Imbriquer des balises de bloc dans un paragraphe."
  ],
  "prerequis_technique": "Structure sémantique de la page (séance 6).",
  "axes": [
   "Audio et vidéo",
   "Attributs globaux",
   "Validation W3C du document"
  ],
  "objectifs_cours": [
   "Intégrer un son et une vidéo avec leurs formats de secours.",
   "Utiliser les attributs globaux id, class, title, hidden et data-* à bon escient.",
   "Valider un document avec le validateur du W3C et corriger erreurs et avertissements."
  ]
 },
 "8": {
  "n": 8,
  "titre": "CSS3 — introduction, syntaxe et sélecteurs simples",
  "date": "2026-10-08",
  "tri": 1,
  "nature": "cours",
  "domaines": "CSS3",
  "pages": "p. 71",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     "Séparation fond / forme",
     "feuille externe (link), interne (style), en ligne",
     "syntaxe règle / sélecteur / déclaration"
    ]
   },
   {
    "titre": "Rôle du CSS et insertion",
    "items": [
     "Choisir la feuille de style externe et expliquer pourquoi elle est la règle."
    ]
   },
   {
    "titre": "Syntaxe et sélecteurs simples",
    "items": [
     "Écrire une règle CSS correcte : sélecteur, propriété, valeur."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "HTML5 : structure, titres, listes, liens, tableaux, formulaires, sémantique (séances 1 à 7)"
  ],
  "criteres": [
   "Séparer le fond de la forme : une seule feuille externe modifie tout le site d'un coup, un style en ligne ne se réutilise jamais.",
   "Produire : Création de style.css et première mise en forme de la page du club : couleurs de fond et…",
   "Éviter : Confondre # (id) et . (classe) dans le sélecteur."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : HTML5 : structure, titres, listes, liens, tableaux, formulaires, sémantique (séances 1 à 7).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Deux versions d'une même page sont montrées : l'une avec des styles en ligne sur chaque balise, l'autre avec une feuille externe de vingt lignes. Question : combien de temps pour changer la couleur de tous les titres dans chaque cas ? Présenter les consignes : Création de style.css et première mise en forme de la page du club : couleurs de fond et de texte, titres, listes et liens.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Séparation fond / forme ; feuille externe (link), interne (style), en ligne ; syntaxe règle / sélecteur / déclaration ; sélecteurs d'élément, de classe, d'identifiant, de groupe et universel ; priorités de base. Assister à la correction pour chaque élève ; Comparaison des trois méthodes d'insertion sur un même contenu, mesure du volume de code, puis choix argumenté de la feuille externe.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Séparation fond / forme • feuille externe (link), interne (style), en ligne • syntaxe règle / sélecteur / déclaration • Confondre # (id) et . (classe) dans le sélecteur. • Oublier le point-virgule ou l'accolade fermante : règles ignorées.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Écrire la feuille style.css de la page personnelle et la lier par <link>.",
  "trace": "Séparer le fond de la forme : une seule feuille externe modifie tout le site d'un coup, un style en ligne ne se réutilise jamais.",
  "erreurs": [
   "Confondre # (id) et . (classe) dans le sélecteur.",
   "Oublier le point-virgule ou l'accolade fermante : règles ignorées."
  ],
  "prerequis_technique": "HTML5 : structure, titres, listes, liens, tableaux, formulaires, sémantique (séances 1 à 7).",
  "axes": [
   "Rôle du CSS et insertion",
   "Syntaxe et sélecteurs simples",
   "Priorités de base"
  ],
  "objectifs_cours": [
   "Choisir la feuille de style externe et expliquer pourquoi elle est la règle.",
   "Écrire une règle CSS correcte : sélecteur, propriété, valeur.",
   "Distinguer sélecteur d'élément, de classe, d'identifiant, de groupe et universel."
  ]
 },
 "9": {
  "n": 9,
  "titre": "CSS3 — texte, couleurs et arrière-plans",
  "date": "2026-10-13",
  "tri": 1,
  "nature": "cours",
  "domaines": "CSS3",
  "pages": "p. 71-72",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     "font-family et piles de secours",
     "font-size, font-weight, font-style",
     "line-height, letter-spacing, text-align, text-decoration"
    ]
   },
   {
    "titre": "Familles de polices",
    "items": [
     "Composer une pile de polices avec famille de secours."
    ]
   },
   {
    "titre": "Couleurs et transparence",
    "items": [
     "Régler taille, graisse, interligne, espacement et alignement du texte."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Sélecteurs et syntaxe CSS (séance 8)"
  ],
  "criteres": [
   "Le contraste et l'interligne décident de la lisibilité ; une police sans secours casse la page sur un autre poste.",
   "Produire : Charte graphique de la page du club : palettes de couleurs, titres, corps de texte, liens…",
   "Éviter : Texte gris clair sur fond blanc."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Sélecteurs et syntaxe CSS (séance 8).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Une affiche du club est reproduite par deux élèves : chez l'un, le texte est illisible sur fond sombre ; chez l'autre, la police change d'un poste à l'autre. On cherche ensemble les deux causes. Présenter les consignes : Charte graphique de la page du club : palettes de couleurs, titres, corps de texte, liens ; application aux titres et aux paragraphes.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "font-family et piles de secours ; font-size, font-weight, font-style ; line-height, letter-spacing, text-align, text-decoration ; couleurs nommées, hexadécimales, rgb et rgba ; background-color, background-image, position, repeat, size. Assister à la correction pour chaque élève ; Arrière-plan illustré d'une section avec dégradé, ajustement du contraste et de l'interligne, test de lisibilité à l'écran et à l'impression.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • font-family et piles de secours • font-size, font-weight, font-style • line-height, letter-spacing, text-align, text-decoration • Texte gris clair sur fond blanc. • Police exotique sans famille de secours.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Appliquer la charte retenue à toutes les pages de la galerie et vérifier le contraste.",
  "trace": "Le contraste et l'interligne décident de la lisibilité ; une police sans secours casse la page sur un autre poste.",
  "erreurs": [
   "Texte gris clair sur fond blanc.",
   "Police exotique sans famille de secours."
  ],
  "prerequis_technique": "Sélecteurs et syntaxe CSS (séance 8).",
  "axes": [
   "Familles de polices",
   "Couleurs et transparence",
   "Arrière-plans"
  ],
  "objectifs_cours": [
   "Composer une pile de polices avec famille de secours.",
   "Régler taille, graisse, interligne, espacement et alignement du texte.",
   "Appliquer couleurs et arrière-plans en hexadécimal et en rgba."
  ]
 },
 "10": {
  "n": 10,
  "titre": "CSS3 — bordures, marges et modèle de boîte",
  "date": "2026-10-20",
  "tri": 1,
  "nature": "cours",
  "domaines": "CSS3",
  "pages": "p. 72",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     "border, border-radius",
     "margin, padding",
     "width, height, min et max"
    ]
   },
   {
    "titre": "Bordures et arrondis",
    "items": [
     "Appliquer bordures, arrondis et ombres légères."
    ]
   },
   {
    "titre": "Marges, remplissage et dimensions",
    "items": [
     "Distinguer margin et padding et calculer la largeur totale d'un bloc."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Texte, couleurs et arrière-plans (séance 9)"
  ],
  "criteres": [
   "Largeur réelle = contenu + padding + bordure avec le modèle par défaut ; box-sizing: border-box fait entrer padding et bordure dans la largeur déclarée.",
   "Produire : Cartes d'actualité sur la page du club : bordures, arrondis, marges intérieures et…",
   "Éviter : Additionner mentalement des pourcentages et des marges."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Texte, couleurs et arrière-plans (séance 9).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Une carte d'actualité dépasse de son conteneur de douze pixels et déborde à droite de l'écran. Les élèves proposent des correctifs ; la mesure au basculement des marges montre que le compte de largeur ne tombe jamais juste. Présenter les consignes : Cartes d'actualité sur la page du club : bordures, arrondis, marges intérieures et extérieures, largeur fixe et centrage.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "border, border-radius ; margin, padding ; width, height, min et max ; box-sizing: border-box ; overflow: hidden, auto, scroll ; centrage d'un bloc par marges automatiques. Assister à la correction pour chaque élève ; Exercice de mesures sur une maquette fournie : calcul de la largeur totale de deux blocs, correction par box-sizing, réglage du débordement du texte…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • border, border-radius • margin, padding • width, height, min et max • Additionner mentalement des pourcentages et des marges. • Texte long écrasé faute d'overflow réglé.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Reprendre les cartes en border-box et vérifier qu'aucun bloc ne déborde de son conteneur.",
  "trace": "Largeur réelle = contenu + padding + bordure avec le modèle par défaut ; box-sizing: border-box fait entrer padding et bordure dans la largeur déclarée.",
  "erreurs": [
   "Additionner mentalement des pourcentages et des marges.",
   "Texte long écrasé faute d'overflow réglé."
  ],
  "prerequis_technique": "Texte, couleurs et arrière-plans (séance 9).",
  "axes": [
   "Bordures et arrondis",
   "Marges, remplissage et dimensions",
   "Modèle de boîte et débordements"
  ],
  "objectifs_cours": [
   "Appliquer bordures, arrondis et ombres légères.",
   "Distinguer margin et padding et calculer la largeur totale d'un bloc.",
   "Régler box-sizing et overflow pour maîtriser les débordements."
  ]
 },
 "11": {
  "n": 11,
  "titre": "CSS3 — affichage, positionnement et empilement ; révision avant le DC1",
  "date": "2026-10-22",
  "tri": 1,
  "nature": "cours",
  "domaines": "CSS3",
  "pages": "p. 72-73",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     "display: block, inline, inline-block, none",
     "position static, relative, absolute, fixed, sticky",
     "top, right, bottom, left"
    ]
   },
   {
    "titre": "Display et flux du document",
    "items": [
     "Choisir entre block, inline, inline-block et none selon le besoin."
    ]
   },
   {
    "titre": "Positionnement et empilement",
    "items": [
     "Positionner un bandeau fixe et une colonne latérale, régler float, clear et z-index."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Modèle de boîte et marges (séance 10)"
  ],
  "criteres": [
   "Un élément absolu se positionne par rapport à son premier ancêtre positionné ; sans ancêtre positionné, il part de la page.",
   "Produire : En-tête fixe du site, colonne latérale en position absolute dans un conteneur relative…",
   "Éviter : Oublier position: relative sur le conteneur."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Modèle de boîte et marges (séance 10).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Dans le site du club, le menu latéral passe sous le contenu et le bandeau de titre disparaît au défilement. Les élèves constatent, proposent, puis découvrent position et z-index ; la dernière demi-heure est consacrée à la révision du devoir. Présenter les consignes : En-tête fixe du site, colonne latérale en position absolute dans un conteneur relative, contenu avec marge compensée ; comparaison avec une mise en…",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "display: block, inline, inline-block, none ; position static, relative, absolute, fixed, sticky ; top, right, bottom, left ; z-index et contextes d'empilement ; float et clear ; liste des notions du DC1 (structure HTML5, listes, liens, images, tableaux, formulaires, sémantique, sélecteurs, boîte, positionnement). Assister à la correction pour chaque élève ; Révision du DC1 : questions types, lecture de code fautif à corriger, exercice de mise en page en temps limité et auto-évaluation avec le barème…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • display: block, inline, inline-block, none • position static, relative, absolute, fixed, sticky • top, right, bottom, left • Oublier position: relative sur le conteneur. • z-index sans effet car l'élément est en position static.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Réviser les fiches 1 à 11 : le devoir de contrôle n°1 a lieu mardi 3 novembre.",
  "trace": "Un élément absolu se positionne par rapport à son premier ancêtre positionné ; sans ancêtre positionné, il part de la page.",
  "erreurs": [
   "Oublier position: relative sur le conteneur.",
   "z-index sans effet car l'élément est en position static."
  ],
  "prerequis_technique": "Modèle de boîte et marges (séance 10).",
  "axes": [
   "Display et flux du document",
   "Positionnement et empilement",
   "Révision guidée avant le DC1"
  ],
  "objectifs_cours": [
   "Choisir entre block, inline, inline-block et none selon le besoin.",
   "Positionner un bandeau fixe et une colonne latérale, régler float, clear et z-index.",
   "Réviser les notions du DC1 du 3 novembre par des questions types et un exercice chronométré."
  ]
 },
 "12": {
  "n": 12,
  "titre": "Devoir de contrôle n°1",
  "date": "2026-11-03",
  "tri": 1,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5 : structure et formulaires",
    "items": [
     "Évaluer les acquis des séances 1 à 11 en théorie et en pratique."
    ]
   },
   {
    "titre": "CSS3 : sélecteurs et modèle de boîte",
    "items": [
     "Vérifier la capacité à produire une page structurée et mise en forme dans le temps imparti."
    ]
   },
   {
    "titre": "Positionnement et mise en page",
    "items": [
     "Identifier les besoins de remédiation pour la séance de correction."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 11"
  ],
  "criteres": [
   "Barème : pratique 60 %, théorie 40 % ; la structure et la validité du code comptent autant que l'apparence.",
   "Produire : Partie théorique : structure d'un document, rôle des balises sémantiques, types d'input…",
   "Éviter : Oublier la feuille de style externe demandée."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Partie théorique : questions de cours, lecture de code, repérage d'erreurs. Partie pratique : page à produire d'après…",
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
    "prof": "Partie théorique : structure d'un document, rôle des balises sémantiques, types d'input, sélecteurs et calcul de largeur. Partie pratique sur machine : page à réaliser d'après maquette, puis contrôle de validité et de conformité.",
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
  "trace": "Barème : pratique 60 %, théorie 40 % ; la structure et la validité du code comptent autant que l'apparence.",
  "erreurs": [
   "Oublier la feuille de style externe demandée.",
   "Formulaire sans attribut name : données non exploitables."
  ],
  "prerequis_technique": "Séances 1 à 11.",
  "axes": [
   "HTML5 : structure et formulaires",
   "CSS3 : sélecteurs et modèle de boîte",
   "Positionnement et mise en page"
  ],
  "objectifs_cours": [
   "Évaluer les acquis des séances 1 à 11 en théorie et en pratique.",
   "Vérifier la capacité à produire une page structurée et mise en forme dans le temps imparti.",
   "Identifier les besoins de remédiation pour la séance de correction."
  ]
 },
 "13": {
  "n": 13,
  "titre": "Correction du DC1 et CSS3 — transitions et transformations",
  "date": "2026-11-05",
  "tri": 1,
  "nature": "correction",
  "domaines": "CSS3",
  "pages": "p. 73-74",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction et remédiation du DC1",
    "items": [
     "Comprendre ses erreurs et corriger sa copie du DC1."
    ]
   },
   {
    "titre": "Transitions",
    "items": [
     "Ajouter une transition et une animation simple à un élément."
    ]
   },
   {
    "titre": "Transformations 2D",
    "items": [
     "Utiliser translate, rotate et scale pour un effet au survol."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC1 du 3 novembre",
   "séances 8 à 11 (sélecteurs, boîte, positionnement)"
  ],
  "criteres": [
   "Une transition adoucit un changement d'état ; une animation se déclare avec @keyframes ; les deux restent discrètes et rapides.",
   "Produire : Correction guidée du DC1, question par question, avec rédaction de la réponse attendue au…",
   "Éviter : Transition déclarée mais propriété jamais modifiée."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies du DC1 sont rendues avec le barème ; trois erreurs reviennent partout (stylesheet oubliée, marges…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC1, question par question, avec rédaction de la réponse attendue au tableau.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Barème commenté et remédiation ciblée (structure du document, sélecteurs, modèle de boîte) ; transition, duration, timing-function ; @keyframes ; transform: translate, rotate, scale. Exercices de rattrapage : Carte d'actualité animée : transition sur l'ombre et la position au survol, transformation d'une vignette, animation d'apparition au chargement.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Une transition adoucit un changement d'état ; une animation se déclare avec @keyframes ; les deux restent discrètes et rapides.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Appliquer une transition au survol des liens du menu et une transformation à la vignette d'accueil.",
  "trace": "Une transition adoucit un changement d'état ; une animation se déclare avec @keyframes ; les deux restent discrètes et rapides.",
  "erreurs": [
   "Transition déclarée mais propriété jamais modifiée.",
   "Animation infinie qui distrait du contenu."
  ],
  "prerequis_technique": "DC1 du 3 novembre ; séances 8 à 11 (sélecteurs, boîte, positionnement).",
  "axes": [
   "Correction et remédiation du DC1",
   "Transitions",
   "Transformations 2D"
  ],
  "objectifs_cours": [
   "Comprendre ses erreurs et corriger sa copie du DC1.",
   "Ajouter une transition et une animation simple à un élément.",
   "Utiliser translate, rotate et scale pour un effet au survol."
  ]
 },
 "14": {
  "n": 14,
  "titre": "CSS3 — pseudo-classes, pseudo-éléments et sélecteurs d'attributs",
  "date": "2026-11-10",
  "tri": 1,
  "nature": "cours",
  "domaines": "CSS3",
  "pages": "p. 73",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     ":hover, :focus, :first-child, :last-child, :nth-child, :not",
     "::before et ::after avec content",
     "sélecteurs d'attributs [type], [href^=…]"
    ]
   },
   {
    "titre": "Pseudo-classes et pseudo-éléments",
    "items": [
     "Utiliser :hover, :focus, :first-child, :nth-child et :not."
    ]
   },
   {
    "titre": "Sélecteurs d'attributs et combinés",
    "items": [
     "Insérer du contenu décoratif avec ::before et ::after."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Positionnement et transitions (séances 11 et 13)"
  ],
  "criteres": [
   "Le pseudo-élément crée du décor sans toucher au HTML ; le focus clavier doit être aussi visible que le survol.",
   "Produire : Menu de navigation horizontale : états de survol, de focus et de page courante, puces…",
   "Éviter : Utiliser :hover sans :focus."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Positionnement et transitions (séances 11 et 13).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un menu de navigation ne réagit ni au survol ni au clavier : l'élève ne voit pas où il se trouve. On demande ce qui distingue un lien « visité » d'un lien « actif » et comment le CSS peut le savoir. Présenter les consignes : Menu de navigation horizontale : états de survol, de focus et de page courante, puces personnalisées par pseudo-élément.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": ":hover, :focus, :first-child, :last-child, :nth-child, :not ; ::before et ::after avec content ; sélecteurs d'attributs [type], [href^=…] ; sélecteurs descendants, enfants (>) et frères (+, ~). Assister à la correction pour chaque élève ; Tableau de données zébré par :nth-child, ciblage des champs obligatoires par attribut, test du parcours au clavier.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • :hover, :focus, :first-child, :last-child, :nth-child, :not • ::before et ::after avec content • sélecteurs d'attributs [type], [href^=…] • Utiliser :hover sans :focus. • ::before sans propriété content : rien ne s'affiche.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Terminer le menu et vérifier les quatre états sur deux navigateurs.",
  "trace": "Le pseudo-élément crée du décor sans toucher au HTML ; le focus clavier doit être aussi visible que le survol.",
  "erreurs": [
   "Utiliser :hover sans :focus.",
   "::before sans propriété content : rien ne s'affiche."
  ],
  "prerequis_technique": "Positionnement et transitions (séances 11 et 13).",
  "axes": [
   "Pseudo-classes et pseudo-éléments",
   "Sélecteurs d'attributs et combinés",
   "États d'un menu de navigation"
  ],
  "objectifs_cours": [
   "Utiliser :hover, :focus, :first-child, :nth-child et :not.",
   "Insérer du contenu décoratif avec ::before et ::after.",
   "Cibler des éléments par attribut, par descendance, par enfant et par frère."
  ]
 },
 "15": {
  "n": 15,
  "titre": "CSS3 — mise en page adaptative et atelier de mise en page complète",
  "date": "2026-11-12",
  "tri": 1,
  "nature": "cours",
  "domaines": "HTML5 / CSS3",
  "pages": "p. 67-75",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "@media screen and (max-width: …)",
     "min-width",
     "unités relatives (%, em, rem, vw)"
    ]
   },
   {
    "titre": "CSS & structure",
    "items": [
     "@media screen and (max-width: …)",
     "min-width",
     "unités relatives (%, em, rem, vw)"
    ]
   },
   {
    "titre": "Media queries et unités relatives",
    "items": [
     "Écrire une media query et choisir des unités relatives."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 14 : HTML5 complet et CSS3 jusqu'aux sélecteurs avancés"
  ],
  "criteres": [
   "Une media query adapte les styles existants ; elle s'écrit à la fin de la feuille et ne remplace pas les règles générales.",
   "Produire : Réalisation guidée puis autonome de la page du lycée : structure HTML5, puis feuille de…",
   "Éviter : Recourir à !important pour masquer un problème de priorité."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 1 à 14 : HTML5 complet et CSS3 jusqu'aux sélecteurs avancés.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Une maquette imprimée de la page d'accueil du lycée est distribuée : en-tête, galerie de trois cartes, formulaire de contact. Elle est d'abord affichée sur un téléphone : les élèves voient la page devenir illisible. Présenter les consignes : Réalisation guidée puis autonome de la page du lycée : structure HTML5, puis feuille de style (texte, boîte, positionnement).",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "@media screen and (max-width: …) ; min-width ; unités relatives (%, em, rem, vw) ; images fluides ; enchaînement maquette → structure sémantique → feuille de style externe ; points de contrôle de validité. Assister à la correction pour chaque élève ; Ajout de deux media queries (700 px et 480 px), passage de trois colonnes à une colonne, image fluide, test par redimensionnement et contrôle de…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • @media screen and (max-width: …) • min-width • unités relatives (%, em, rem, vw) • Recourir à !important pour masquer un problème de priorité. • Media query écrite avant les styles qu'elle doit adapter.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   }
  ],
  "maison": "Ajouter une media query à la page du lycée et vérifier l'affichage sur trois largeurs d'écran.",
  "trace": "Une media query adapte les styles existants ; elle s'écrit à la fin de la feuille et ne remplace pas les règles générales.",
  "erreurs": [
   "Recourir à !important pour masquer un problème de priorité.",
   "Media query écrite avant les styles qu'elle doit adapter."
  ],
  "prerequis_technique": "Séances 1 à 14 : HTML5 complet et CSS3 jusqu'aux sélecteurs avancés.",
  "axes": [
   "Media queries et unités relatives",
   "Atelier : page complète du lycée",
   "Mise en page adaptative"
  ],
  "objectifs_cours": [
   "Écrire une media query et choisir des unités relatives.",
   "Réaliser une page complète à partir d'une maquette, du HTML à la feuille de style.",
   "Adapter la même page à deux largeurs d'écran sans dupliquer la feuille de style."
  ]
 },
 "16": {
  "n": 16,
  "titre": "Devoir de contrôle n°2",
  "date": "2026-11-17",
  "tri": 1,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS3 en situation",
    "items": [
     "Reproduire une maquette complète en respectant structure et mise en forme."
    ]
   },
   {
    "titre": "Reproduction de maquette",
    "items": [
     "Appliquer les états, transitions et transformations vus depuis le DC1."
    ]
   },
   {
    "titre": "Lecture d'une feuille de style fautive",
    "items": [
     "Diagnostiquer et corriger une feuille de style comportant des erreurs."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 15"
  ],
  "criteres": [
   "On lit une feuille de style en allant du plus général au plus précis ; une propriété inconnue est ignorée sans message du navigateur.",
   "Produire : Reproduction de la maquette : structure sémantique et feuille de style, du haut de page…",
   "Éviter : Cotes de la maquette non respectées."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Structure HTML5 de la maquette ; feuille de style externe ; texte, couleurs, boîte, positionnement, états et…",
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
    "prof": "Reproduction de la maquette : structure sémantique et feuille de style, du haut de page vers les cartes. Lecture et correction d'une feuille de style fautive (sélecteur erroné, propriété inconnue, priorité mal maîtrisée), puis contrôle de validité.",
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
  "maison": "Aucun travail écrit ; apporter la maquette corrigée en séance de correction.",
  "trace": "On lit une feuille de style en allant du plus général au plus précis ; une propriété inconnue est ignorée sans message du navigateur.",
  "erreurs": [
   "Cotes de la maquette non respectées.",
   "Correctifs ajoutés par !important au lieu de comprendre la priorité."
  ],
  "prerequis_technique": "Séances 1 à 15.",
  "axes": [
   "CSS3 en situation",
   "Reproduction de maquette",
   "Lecture d'une feuille de style fautive"
  ],
  "objectifs_cours": [
   "Reproduire une maquette complète en respectant structure et mise en forme.",
   "Appliquer les états, transitions et transformations vus depuis le DC1.",
   "Diagnostiquer et corriger une feuille de style comportant des erreurs."
  ]
 },
 "17": {
  "n": 17,
  "titre": "Correction du DC2 et atelier CSS3 — remédiation et synthèse",
  "date": "2026-11-19",
  "tri": 1,
  "nature": "correction",
  "domaines": "CSS3",
  "pages": "p. 71-75",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction et remédiation du DC2",
    "items": [
     "Comprendre ses erreurs et corriger sa copie du DC2."
    ]
   },
   {
    "titre": "Synthèse du domaine CSS3",
    "items": [
     "Consolider positionnement, priorités de sélecteurs et media queries."
    ]
   },
   {
    "titre": "Bilan avant le JavaScript",
    "items": [
     "Faire le bilan du domaine CSS3 avant le passage au JavaScript."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC2 du 17 novembre",
   "séances 8 à 15 (CSS3 complet)"
  ],
  "criteres": [
   "Priorité : id > classe > élément, et la dernière règle équivalente l'emporte ; une media query adapte, elle ne duplique pas la feuille de style.",
   "Produire : Correction guidée du DC2 au barème, avec reprise des blocs mal positionnés sur machine.",
   "Éviter : Recourir à !important pour masquer un problème de priorité."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Deux copies sont comparées : l'une obtient 14/20 avec une mise en page correcte, l'autre 8/20 avec des blocs…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC2 au barème, avec reprise des blocs mal positionnés sur machine.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Barème et remédiation sur le positionnement (ancêtre positionné, z-index), les priorités de sélecteurs et les media queries ; atelier de synthèse CSS3 (états, transformations, mise en page adaptative) ; bilan du domaine et préparation du JavaScript. Exercices de rattrapage : Atelier de synthèse : page d'accueil du club finalisée (menu à états, cartes animées, une seule media query) et contrôle de validité ; bilan écrit des acquis CSS3.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Priorité : id > classe > élément, et la dernière règle équivalente l'emporte ; une media query adapte, elle ne duplique pas la feuille de style.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Finaliser la page du club et arriver en séance 18 avec le dossier complet sur clé USB.",
  "trace": "Priorité : id > classe > élément, et la dernière règle équivalente l'emporte ; une media query adapte, elle ne duplique pas la feuille de style.",
  "erreurs": [
   "Recourir à !important pour masquer un problème de priorité.",
   "Feuille de style non testée sur une seconde largeur d'écran."
  ],
  "prerequis_technique": "DC2 du 17 novembre ; séances 8 à 15 (CSS3 complet).",
  "axes": [
   "Correction et remédiation du DC2",
   "Synthèse du domaine CSS3",
   "Bilan avant le JavaScript"
  ],
  "objectifs_cours": [
   "Comprendre ses erreurs et corriger sa copie du DC2.",
   "Consolider positionnement, priorités de sélecteurs et media queries.",
   "Faire le bilan du domaine CSS3 avant le passage au JavaScript."
  ]
 },
 "18": {
  "n": 18,
  "titre": "JavaScript — introduction, variables et types",
  "date": "2026-11-24",
  "tri": 1,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 76",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "Rôle du JavaScript (interactivité côté client)",
     "script externe et placement (fin de body ou defer)",
     "console du navigateur et messages"
    ]
   },
   {
    "titre": "Place du JavaScript dans la page",
    "items": [
     "Insérer un script externe et expliquer sa place dans le document."
    ]
   },
   {
    "titre": "Variables, types et opérateurs",
    "items": [
     "Déclarer des variables avec let et const et distinguer les types de base."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "HTML5 et CSS3 (séances 1 à 17)"
  ],
  "criteres": [
   "let pour une valeur qui change, const pour une valeur fixe ; === compare valeur et type, == compare après conversion.",
   "Produire : Premier script externe : affichage d'une date calculée, d'un message d'accueil et d'un…",
   "Éviter : Utiliser == et obtenir une égalité inattendue."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : HTML5 et CSS3 (séances 1 à 17).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "La page du club affiche une date de mise à jour écrite à la main, fausse depuis un mois. Question : comment faire calculer cette date par la page elle-même ? Le mot JavaScript est lâché, et un premier script est testé en direct. Présenter les consignes : Premier script externe : affichage d'une date calculée, d'un message d'accueil et d'un calcul (prix, remise) dans la page.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Rôle du JavaScript (interactivité côté client) ; script externe et placement (fin de body ou defer) ; console du navigateur et messages ; let, const ; types nombre, chaîne, booléen, null ; conversions ; opérateurs arithmétiques, comparaison, égalité stricte. Assister à la correction pour chaque élève ; Exercices de types et d'opérateurs : concaténation, conversion de chaîne en nombre, pièges de +, comparaison == et === ; débogage dans la console.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Rôle du JavaScript (interactivité côté client) • script externe et placement (fin de body ou defer) • console du navigateur et messages • Utiliser == et obtenir une égalité inattendue. • Placer le script dans head sans defer : éléments non encore créés.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Écrire un script qui affiche dans la page un calcul de moyenne à partir de trois notes saisies dans le code.",
  "trace": "let pour une valeur qui change, const pour une valeur fixe ; === compare valeur et type, == compare après conversion.",
  "erreurs": [
   "Utiliser == et obtenir une égalité inattendue.",
   "Placer le script dans head sans defer : éléments non encore créés."
  ],
  "prerequis_technique": "HTML5 et CSS3 (séances 1 à 17).",
  "axes": [
   "Place du JavaScript dans la page",
   "Variables, types et opérateurs",
   "Premier script et console"
  ],
  "objectifs_cours": [
   "Insérer un script externe et expliquer sa place dans le document.",
   "Déclarer des variables avec let et const et distinguer les types de base.",
   "Écrire un premier script qui affiche un résultat dans la page et le déboguer dans la console."
  ]
 },
 "19": {
  "n": 19,
  "titre": "JavaScript — conditions, boucles et interactions de base",
  "date": "2026-11-26",
  "tri": 1,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 76-77",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "if, else if, else",
     "opérateurs logiques && || !",
     "switch et break"
    ]
   },
   {
    "titre": "Structures conditionnelles",
    "items": [
     "Écrire un test à plusieurs branches avec if / else if / else et switch."
    ]
   },
   {
    "titre": "Boucles",
    "items": [
     "Répéter un traitement avec for, while et do…while en choisissant la boucle adaptée."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Variables, types et opérateurs (séance 18)"
  ],
  "criteres": [
   "Une condition se lit comme une phrase ; la boucle for sert quand le nombre de tours est connu, while quand il dépend d'une condition.",
   "Produire : Contrôle d'un mot de passe : longueur minimale, présence d'un chiffre, message adapté à…",
   "Éviter : Oublier break dans un switch : tous les cas s'exécutent."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Variables, types et opérateurs (séance 18).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le site du club doit refuser un mot de passe trop court. Un élève propose de vérifier « à la main » dans le HTML ; le test en direct montre qu'il faut une condition évaluée par la page. Présenter les consignes : Contrôle d'un mot de passe : longueur minimale, présence d'un chiffre, message adapté à chaque cas, trois essais autorisés avec while.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "if, else if, else ; opérateurs logiques && || ! ; switch et break ; for, while, do…while ; alert, confirm, prompt ; portée d'un bloc. Assister à la correction pour chaque élève ; Table de multiplication demandée à l'utilisateur, affichée dans la page avec for ; puis adaptation avec do…while et test des cas limites (0, texte).",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • if, else if, else • opérateurs logiques && || ! • switch et break • Oublier break dans un switch : tous les cas s'exécutent. • Boucle while sans modification de la condition : page figée.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Écrire un script qui affiche la mention correspondant à une moyenne saisie (six cas, switch).",
  "trace": "Une condition se lit comme une phrase ; la boucle for sert quand le nombre de tours est connu, while quand il dépend d'une condition.",
  "erreurs": [
   "Oublier break dans un switch : tous les cas s'exécutent.",
   "Boucle while sans modification de la condition : page figée."
  ],
  "prerequis_technique": "Variables, types et opérateurs (séance 18).",
  "axes": [
   "Structures conditionnelles",
   "Boucles",
   "Interactions avec l'utilisateur"
  ],
  "objectifs_cours": [
   "Écrire un test à plusieurs branches avec if / else if / else et switch.",
   "Répéter un traitement avec for, while et do…while en choisissant la boucle adaptée.",
   "Utiliser alert, confirm et prompt à bon escient dans une interaction simple."
  ]
 },
 "20": {
  "n": 20,
  "titre": "JavaScript — fonctions et tableaux",
  "date": "2026-12-01",
  "tri": 1,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 77",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "Déclaration, appel, paramètres, return",
     "portée des variables",
     "tableau : indice, length, parcours"
    ]
   },
   {
    "titre": "Fonctions et portée",
    "items": [
     "Déclarer une fonction avec paramètres et valeur de retour."
    ]
   },
   {
    "titre": "Tableaux et parcours",
    "items": [
     "Créer un tableau, le parcourir avec for et for…of."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Conditions et boucles (séance 19)"
  ],
  "criteres": [
   "Une fonction écrit une fois ce qui sert plusieurs fois ; un tableau se parcourt avec sa longueur, jamais avec une borne écrite en dur.",
   "Produire : Fonction de calcul de moyenne et d'affichage de la mention, appelée pour trois élèves …",
   "Éviter : return absent : la fonction renvoie undefined."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Conditions et boucles (séance 19).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le même calcul de moyenne est répété quatre fois dans le script du club. Les élèves doivent le rendre réutilisable : la notion de fonction arrive comme une réponse à un problème de duplication. Présenter les consignes : Fonction de calcul de moyenne et d'affichage de la mention, appelée pour trois élèves ; tableau de notes et parcours avec for puis for…of.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Déclaration, appel, paramètres, return ; portée des variables ; tableau : indice, length, parcours ; push, pop, splice, indexOf ; tableau de notes. Assister à la correction pour chaque élève ; Ajout et suppression de notes avec push, pop et splice, recherche d'une note avec indexOf, puis affichage du tableau sous forme de liste dans la page.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Déclaration, appel, paramètres, return • portée des variables • tableau : indice, length, parcours • return absent : la fonction renvoie undefined. • Parcours jusqu'à length au lieu de length - 1 : dernière valeur undefined.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Écrire une fonction qui reçoit un tableau de notes et renvoie la note maximale, puis l'utiliser dans la page.",
  "trace": "Une fonction écrit une fois ce qui sert plusieurs fois ; un tableau se parcourt avec sa longueur, jamais avec une borne écrite en dur.",
  "erreurs": [
   "return absent : la fonction renvoie undefined.",
   "Parcours jusqu'à length au lieu de length - 1 : dernière valeur undefined."
  ],
  "prerequis_technique": "Conditions et boucles (séance 19).",
  "axes": [
   "Fonctions et portée",
   "Tableaux et parcours",
   "Méthodes usuelles des tableaux"
  ],
  "objectifs_cours": [
   "Déclarer une fonction avec paramètres et valeur de retour.",
   "Créer un tableau, le parcourir avec for et for…of.",
   "Utiliser push, pop, splice et indexOf pour modifier un tableau."
  ]
 },
 "21": {
  "n": 21,
  "titre": "Atelier et révision générale du 1er trimestre — préparation du DS1",
  "date": "2026-12-03",
  "tri": 1,
  "nature": "cours",
  "domaines": "Révision",
  "pages": "p. 67-77",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Synthèse HTML5 / CSS3 / JavaScript",
    "items": [
     "Mobiliser les trois domaines du trimestre dans une même production."
    ]
   },
   {
    "titre": "Sujet type de devoir de synthèse",
    "items": [
     "Traiter un sujet type de devoir de synthèse dans le temps imparti."
    ]
   },
   {
    "titre": "Méthode de révision",
    "items": [
     "Organiser ses révisions et gérer son temps d'épreuve."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 20"
  ],
  "criteres": [
   "Réviser par erreurs plutôt que par pages : le devoir de synthèse reprend les mêmes questions sous une autre forme.",
   "Produire : Série de synthèse en trois temps : structure HTML5 d'une page de trois zones, feuille de…",
   "Éviter : Réviser uniquement le dernier chapitre."
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
    "prof": "Le devoir de synthèse n°1 a lieu la semaine du 7 au 12 décembre. La séance commence par la question : que faut-il réviser en priorité ? Les élèves construisent eux-mêmes la liste à partir de leurs erreurs. Présenter les consignes : Série de synthèse en trois temps : structure HTML5 d'une page de trois zones, feuille de style externe, script de validation d'un champ.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Série de synthèse HTML5 / CSS3 / JavaScript ; sujet type (page à produire, feuille de style, script de validation) ; barème et gestion du temps ; méthode de révision par fiches et par erreurs. Assister à la correction pour chaque élève ; Sujet type de devoir de synthèse traité en 50 minutes puis corrigé au barème ; chaque élève note les points à revoir avant l'épreuve.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Série de synthèse HTML5 / CSS3 / JavaScript • sujet type (page à produire, feuille de style, script de validation) • barème et gestion du temps • Réviser uniquement le dernier chapitre. • Commencer le sujet par la partie la plus longue.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse"
   }
  ],
  "maison": "Terminer le sujet type et réviser les fiches 1 à 20 pour le devoir de synthèse n°1.",
  "trace": "Réviser par erreurs plutôt que par pages : le devoir de synthèse reprend les mêmes questions sous une autre forme.",
  "erreurs": [
   "Réviser uniquement le dernier chapitre.",
   "Commencer le sujet par la partie la plus longue."
  ],
  "prerequis_technique": "Séances 1 à 20.",
  "axes": [
   "Synthèse HTML5 / CSS3 / JavaScript",
   "Sujet type de devoir de synthèse",
   "Méthode de révision"
  ],
  "objectifs_cours": [
   "Mobiliser les trois domaines du trimestre dans une même production.",
   "Traiter un sujet type de devoir de synthèse dans le temps imparti.",
   "Organiser ses révisions et gérer son temps d'épreuve."
  ]
 },
 "22": {
  "n": 22,
  "titre": "Correction du DS1 et bilan du 1er trimestre",
  "date": "2026-12-29",
  "tri": 2,
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
     "Faire le bilan de son trimestre et fixer deux objectifs pour le suivant."
    ]
   },
   {
    "titre": "Objectifs du 2e trimestre",
    "items": [
     "Se préparer au programme du 2e trimestre (JavaScript avancé et SQL)."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Devoir de synthèse n°1 (semaine bloquée du 7 au 12 décembre)"
  ],
  "criteres": [
   "Le 2e trimestre ajoute deux domaines nouveaux : le DOM et les bases de données ; le retard se creuse en une semaine, pas en un mois.",
   "Produire : Correction guidée du DS1, question par question ; chaque élève note la cause de sa perte…",
   "Éviter : Ne pas identifier la cause de ses erreurs."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies du DS1 sont rendues avec le barème officiel ; deux copies anonymes sont projetées (une réussie…",
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
    "prof": "Correction et commentaire du barème ; synthèse des erreurs récurrentes ; présentation du 2e trimestre : DOM, événements, validation, bases de données et SQL ; méthode de travail sur les exercices de programmation. Exercices de rattrapage : Bilan individuel : moyenne, points forts, deux objectifs écrits ; présentation du calendrier du 2e trimestre et du rythme de travail.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Le 2e trimestre ajoute deux domaines nouveaux : le DOM et les bases de données ; le retard se creuse en une semaine, pas en un mois.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Relire les fiches JavaScript de base (18 à 20) avant la séance sur le DOM.",
  "trace": "Le 2e trimestre ajoute deux domaines nouveaux : le DOM et les bases de données ; le retard se creuse en une semaine, pas en un mois.",
  "erreurs": [
   "Ne pas identifier la cause de ses erreurs.",
   "Confondre devoir de synthèse et contrôle continu."
  ],
  "prerequis_technique": "Devoir de synthèse n°1 (semaine bloquée du 7 au 12 décembre).",
  "axes": [
   "Correction du DS1",
   "Bilan du 1er trimestre",
   "Objectifs du 2e trimestre"
  ],
  "objectifs_cours": [
   "Comprendre le barème et les attentes du devoir de synthèse.",
   "Faire le bilan de son trimestre et fixer deux objectifs pour le suivant.",
   "Se préparer au programme du 2e trimestre (JavaScript avancé et SQL)."
  ]
 },
 "23": {
  "n": 23,
  "titre": "JavaScript — le DOM : sélectionner et modifier les éléments",
  "date": "2026-12-31",
  "tri": 2,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 77-78",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "document",
     "getElementById, querySelector, querySelectorAll",
     "innerHTML, textContent"
    ]
   },
   {
    "titre": "Accès aux éléments de la page",
    "items": [
     "Sélectionner un élément avec getElementById et querySelector."
    ]
   },
   {
    "titre": "Modification du contenu et des attributs",
    "items": [
     "Modifier texte, HTML, attributs, classes et styles d'un élément."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Fonctions et tableaux (séance 20)"
  ],
  "criteres": [
   "Le DOM est la représentation de la page en mémoire : modifier le DOM change l'affichage sans réécrire le fichier HTML.",
   "Produire : Modification d'un titre, d'un paragraphe et d'une image par JavaScript : textContent…",
   "Éviter : Modifier innerHTML avec du texte saisi par l'utilisateur."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Fonctions et tableaux (séance 20).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le titre de la page du club annonce une date fausse et la photo d'accueil change chaque saison. On demande comment modifier ces éléments sans toucher au fichier HTML. Présenter les consignes : Modification d'un titre, d'un paragraphe et d'une image par JavaScript : textContent, setAttribute et classList.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "document ; getElementById, querySelector, querySelectorAll ; innerHTML, textContent ; setAttribute, classList ; style ; bonnes pratiques (id uniques, script externe). Assister à la correction pour chaque élève ; Remplacement du contenu d'une liste à partir d'un tableau, ajout et retrait d'une classe au clic sur un bouton, vérification dans l'inspecteur.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • document • getElementById, querySelector, querySelectorAll • innerHTML, textContent • Modifier innerHTML avec du texte saisi par l'utilisateur. • Script exécuté avant le chargement des éléments.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Écrire un script qui remplit la liste des activités du club à partir d'un tableau de cinq valeurs.",
  "trace": "Le DOM est la représentation de la page en mémoire : modifier le DOM change l'affichage sans réécrire le fichier HTML.",
  "erreurs": [
   "Modifier innerHTML avec du texte saisi par l'utilisateur.",
   "Script exécuté avant le chargement des éléments."
  ],
  "prerequis_technique": "Fonctions et tableaux (séance 20).",
  "axes": [
   "Accès aux éléments de la page",
   "Modification du contenu et des attributs",
   "Bonnes pratiques"
  ],
  "objectifs_cours": [
   "Sélectionner un élément avec getElementById et querySelector.",
   "Modifier texte, HTML, attributs, classes et styles d'un élément.",
   "Séparer le code du contenu et nommer ses identifiants de façon unique."
  ]
 },
 "24": {
  "n": 24,
  "titre": "JavaScript — événements et réaction de la page",
  "date": "2027-01-05",
  "tri": 2,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 78",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "onclick, ondblclick, onmouseover, onmouseout, onchange, oninput, onkeyup, onsubmit",
     "addEventListener et removeEventListener",
     "objet event, event.target, event.preventDefault."
    ]
   },
   {
    "titre": "Événements de souris et de clavier",
    "items": [
     "Associer un traitement aux événements onclick, onchange, oninput, onsubmit."
    ]
   },
   {
    "titre": "addEventListener",
    "items": [
     "Utiliser addEventListener plutôt que les attributs HTML."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Manipulation du DOM (séance 23)"
  ],
  "criteres": [
   "Un événement est un fait qui se produit dans la page ; on y attache une fonction, on ne mélange pas HTML et JavaScript.",
   "Produire : Galerie d'images : clic sur une vignette pour afficher la grande image, survol pour…",
   "Éviter : Utiliser onclick=\"...\" dans le HTML au lieu de addEventListener."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Manipulation du DOM (séance 23).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le bouton « voir plus » de la galerie ne fait rien : l'élève a écrit la fonction mais ne l'a jamais reliée à un événement. La séance part de ce lien manquant. Présenter les consignes : Galerie d'images : clic sur une vignette pour afficher la grande image, survol pour changer l'opacité, compteur de clics affiché.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "onclick, ondblclick, onmouseover, onmouseout, onchange, oninput, onkeyup, onsubmit ; addEventListener et removeEventListener ; objet event, event.target, event.preventDefault. Assister à la correction pour chaque élève ; Menu interactif : ouverture et fermeture d'un sous-menu au clic, fermeture au clavier (Échap), contrôle du compteur de caractères d'un champ avec…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • onclick, ondblclick, onmouseover, onmouseout, onchange, oninput… • addEventListener et removeEventListener • objet event, event.target, event.preventDefault. • Utiliser onclick=\"...\" dans le HTML au lieu de addEventListener. • Oublier preventDefault sur un lien qui doit rester sur la page.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Ajouter à la galerie un bouton qui affiche ou masque la légende de l'image courante.",
  "trace": "Un événement est un fait qui se produit dans la page ; on y attache une fonction, on ne mélange pas HTML et JavaScript.",
  "erreurs": [
   "Utiliser onclick=\"...\" dans le HTML au lieu de addEventListener.",
   "Oublier preventDefault sur un lien qui doit rester sur la page."
  ],
  "prerequis_technique": "Manipulation du DOM (séance 23).",
  "axes": [
   "Événements de souris et de clavier",
   "addEventListener",
   "Objet event"
  ],
  "objectifs_cours": [
   "Associer un traitement aux événements onclick, onchange, oninput, onsubmit.",
   "Utiliser addEventListener plutôt que les attributs HTML.",
   "Exploiter l'objet event pour connaître la cible et la valeur saisie."
  ]
 },
 "25": {
  "n": 25,
  "titre": "JavaScript — validation d'un formulaire",
  "date": "2027-01-07",
  "tri": 2,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 78",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "value, trim",
     "test du vide",
     "expressions simples pour e-mail et téléphone"
    ]
   },
   {
    "titre": "Lecture des valeurs saisies",
    "items": [
     "Lire la valeur d'un champ et la tester avant l'envoi."
    ]
   },
   {
    "titre": "Contrôles de format et de bornes",
    "items": [
     "Contrôler le vide, le format d'un e-mail, d'un téléphone et les bornes numériques."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DOM et événements (séances 23 et 24)",
   "formulaire HTML5 (séance 5)"
  ],
  "criteres": [
   "La validation côté client améliore l'expérience, la validation côté serveur assure la sécurité : les deux sont exigées.",
   "Produire : Validation champ par champ du formulaire d'inscription : nom, e-mail, téléphone, date de…",
   "Éviter : Afficher l'erreur avec alert() uniquement."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : DOM et événements (séances 23 et 24) ; formulaire HTML5 (séance 5).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le formulaire d'inscription au club a reçu trois demandes vides et un faux numéro. Le serveur n'est pas encore programmé : comment refuser ces saisies dès la page ? Présenter les consignes : Validation champ par champ du formulaire d'inscription : nom, e-mail, téléphone, date de naissance, niveau ; message d'erreur sous chaque champ.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "value, trim ; test du vide ; expressions simples pour e-mail et téléphone ; bornes numériques ; affichage des messages (textContent, classe d'erreur) ; preventDefault et return false. Assister à la correction pour chaque élève ; Blocage de l'envoi tant que le formulaire est invalide, validation au fil de la saisie (oninput), puis test avec des cas limites.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • value, trim • test du vide • expressions simples pour e-mail et téléphone • Afficher l'erreur avec alert() uniquement. • Comparer une valeur numérique à une chaîne sans conversion.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Terminer la validation du formulaire et la tester avec des saisies vides, fausses et correctes.",
  "trace": "La validation côté client améliore l'expérience, la validation côté serveur assure la sécurité : les deux sont exigées.",
  "erreurs": [
   "Afficher l'erreur avec alert() uniquement.",
   "Comparer une valeur numérique à une chaîne sans conversion."
  ],
  "prerequis_technique": "DOM et événements (séances 23 et 24) ; formulaire HTML5 (séance 5).",
  "axes": [
   "Lecture des valeurs saisies",
   "Contrôles de format et de bornes",
   "Messages et blocage de l'envoi"
  ],
  "objectifs_cours": [
   "Lire la valeur d'un champ et la tester avant l'envoi.",
   "Contrôler le vide, le format d'un e-mail, d'un téléphone et les bornes numériques.",
   "Afficher un message d'erreur dans la page et bloquer l'envoi du formulaire."
  ]
 },
 "26": {
  "n": 26,
  "titre": "JavaScript — objets natifs : chaînes de caractères",
  "date": "2027-01-12",
  "tri": 2,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 78-79",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "length, charAt, indexOf, lastIndexOf, slice, substring, toUpperCase, toLowerCase, replace, split, trim…",
     "chaîne immuable."
    ]
   },
   {
    "titre": "Propriétés et méthodes des chaînes",
    "items": [
     "Utiliser length, charAt, indexOf et les conversions de casse."
    ]
   },
   {
    "titre": "Recherche et découpage",
    "items": [
     "Extraire une partie d'une chaîne avec slice et substring, la découper avec split."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Validation de formulaire (séance 25)"
  ],
  "criteres": [
   "Une chaîne ne se modifie pas : chaque méthode renvoie une nouvelle chaîne, il faut la stocker.",
   "Produire : Mise en forme d'un nom saisi : trim, découpage par espace, première lettre en majuscule…",
   "Éviter : Oublier de stocker le résultat de toUpperCase."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Validation de formulaire (séance 25).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Dans le formulaire, un élève a saisi « aymen ESSOUYAH » puis « AYMEN essouyah » : le fichier contient trois versions du même nom. On cherche comment imposer une forme unique. Présenter les consignes : Mise en forme d'un nom saisi : trim, découpage par espace, première lettre en majuscule, reste en minuscules.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "length, charAt, indexOf, lastIndexOf, slice, substring, toUpperCase, toLowerCase, replace, split, trim, concaténation ; chaîne immuable. Assister à la correction pour chaque élève ; Comptage des voyelles d'une phrase et comptage des mots ; recherche de la position d'un caractère et remplacement ; affichage du résultat.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • length, charAt, indexOf, lastIndexOf, slice, substring, toUpperCase… • chaîne immuable. • Oublier de stocker le résultat de toUpperCase. • Confondre slice et substring sur les bornes négatives.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Écrire une fonction qui reçoit un nom complet et renvoie « NOM Prénom » correctement formaté.",
  "trace": "Une chaîne ne se modifie pas : chaque méthode renvoie une nouvelle chaîne, il faut la stocker.",
  "erreurs": [
   "Oublier de stocker le résultat de toUpperCase.",
   "Confondre slice et substring sur les bornes négatives."
  ],
  "prerequis_technique": "Validation de formulaire (séance 25).",
  "axes": [
   "Propriétés et méthodes des chaînes",
   "Recherche et découpage",
   "Mise en forme d'un texte saisi"
  ],
  "objectifs_cours": [
   "Utiliser length, charAt, indexOf et les conversions de casse.",
   "Extraire une partie d'une chaîne avec slice et substring, la découper avec split.",
   "Nettoyer et mettre en forme un nom saisi par l'utilisateur."
  ]
 },
 "27": {
  "n": 27,
  "titre": "JavaScript — objets natifs : tableaux et objet Math",
  "date": "2027-01-14",
  "tri": 2,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 79",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "forEach, map, filter, join, sort et fonction de comparaison",
     "tableaux à deux dimensions",
     "Math.round, floor, ceil, abs, min, max, random."
    ]
   },
   {
    "titre": "Parcours et méthodes des tableaux",
    "items": [
     "Utiliser forEach, map, filter, join et sort sur un tableau."
    ]
   },
   {
    "titre": "Tableaux à deux dimensions",
    "items": [
     "Parcourir un tableau à deux dimensions (lignes et colonnes)."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Chaînes de caractères et tableaux (séances 20 et 26)"
  ],
  "criteres": [
   "map transforme, filter sélectionne, forEach parcourt : choisir la méthode selon le résultat attendu, pas selon l'habitude.",
   "Produire : Statistiques sur un tableau de notes : minimum, maximum, moyenne, nombre de notes…",
   "Éviter : sort sans fonction de comparaison : tri alphabétique sur des nombres."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Chaînes de caractères et tableaux (séances 20 et 26).",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le club veut tirer au sort deux gagnants parmi douze adhérents et calculer la moyenne des notes de la classe : deux besoins qui tombent sur les tableaux, l'aléatoire et les statistiques. Présenter les consignes : Statistiques sur un tableau de notes : minimum, maximum, moyenne, nombre de notes au-dessus de la moyenne (filter).",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "forEach, map, filter, join, sort et fonction de comparaison ; tableaux à deux dimensions ; Math.round, floor, ceil, abs, min, max, random. Assister à la correction pour chaque élève ; Tirage aléatoire de deux gagnants sans répétition, affichage d'un tableau de notes à deux dimensions (élèves × devoirs) et calcul des moyennes par…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • forEach, map, filter, join, sort et fonction de comparaison • tableaux à deux dimensions • Math.round, floor, ceil, abs, min, max, random. • sort sans fonction de comparaison : tri alphabétique sur des nombres. • random utilisé sans Math.floor : indices décimaux.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Écrire un script qui affiche la moyenne de chaque élève à partir d'un tableau à deux dimensions.",
  "trace": "map transforme, filter sélectionne, forEach parcourt : choisir la méthode selon le résultat attendu, pas selon l'habitude.",
  "erreurs": [
   "sort sans fonction de comparaison : tri alphabétique sur des nombres.",
   "random utilisé sans Math.floor : indices décimaux."
  ],
  "prerequis_technique": "Chaînes de caractères et tableaux (séances 20 et 26).",
  "axes": [
   "Parcours et méthodes des tableaux",
   "Tableaux à deux dimensions",
   "Objet Math"
  ],
  "objectifs_cours": [
   "Utiliser forEach, map, filter, join et sort sur un tableau.",
   "Parcourir un tableau à deux dimensions (lignes et colonnes).",
   "Employer Math.round, floor, ceil, min, max et random de façon contrôlée."
  ]
 },
 "28": {
  "n": 28,
  "titre": "Devoir de contrôle n°3",
  "date": "2027-01-19",
  "tri": 2,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Logique et structures de contrôle",
    "items": [
     "Évaluer les acquis JavaScript des séances 18 à 27."
    ]
   },
   {
    "titre": "DOM et événements",
    "items": [
     "Vérifier la capacité à manipuler le DOM et à traiter des événements."
    ]
   },
   {
    "titre": "Validation de formulaire",
    "items": [
     "Diagnostiquer les besoins de remédiation avant l'atelier du 21 janvier."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 18 à 27"
  ],
  "criteres": [
   "Barème : pratique 60 %, théorie 40 % ; un script qui ne s'exécute pas ne rapporte aucun point, même juste sur le papier.",
   "Produire : Partie théorique : prévoir l'affichage d'un script, corriger un script fautif, expliquer…",
   "Éviter : Script placé dans head sans defer."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Variables et types, conditions et boucles, fonctions et tableaux, sélection et modification des éléments, événements…",
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
    "prof": "Partie théorique : prévoir l'affichage d'un script, corriger un script fautif, expliquer la différence entre innerHTML et textContent. Partie pratique : page avec formulaire validé champ par champ et affichage dynamique d'une liste à partir d'un tableau.",
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
  "maison": "Aucun travail écrit ; relire les fiches 18 à 27 avant la séance de correction.",
  "trace": "Barème : pratique 60 %, théorie 40 % ; un script qui ne s'exécute pas ne rapporte aucun point, même juste sur le papier.",
  "erreurs": [
   "Script placé dans head sans defer.",
   "Variable déclarée dans une fonction et utilisée ailleurs."
  ],
  "prerequis_technique": "Séances 18 à 27.",
  "axes": [
   "Logique et structures de contrôle",
   "DOM et événements",
   "Validation de formulaire"
  ],
  "objectifs_cours": [
   "Évaluer les acquis JavaScript des séances 18 à 27.",
   "Vérifier la capacité à manipuler le DOM et à traiter des événements.",
   "Diagnostiquer les besoins de remédiation avant l'atelier du 21 janvier."
  ]
 },
 "29": {
  "n": 29,
  "titre": "Correction du DC3 et atelier JavaScript",
  "date": "2027-01-21",
  "tri": 2,
  "nature": "correction",
  "domaines": "JavaScript",
  "pages": "p. 76-79",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction et remédiation du DC3",
    "items": [
     "Comprendre ses erreurs de logique et de syntaxe et corriger sa copie."
    ]
   },
   {
    "titre": "Atelier mini-projet",
    "items": [
     "Réaliser un mini-projet interactif utilisant DOM, événements et fonctions."
    ]
   },
   {
    "titre": "Structuration d'un script",
    "items": [
     "Structurer un script en fonctions courtes et testables."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC3",
   "séances 18 à 27"
  ],
  "criteres": [
   "Un script lisible se découpe en fonctions qui font une seule chose ; on teste chaque fonction dans la console avant de l'intégrer.",
   "Produire : Correction guidée du DC3, question par question, avec réécriture des scripts fautifs au…",
   "Éviter : Fonction de calcul mêlée à l'affichage."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies du DC3 montrent trois familles d'erreurs : boucles infinies, fonctions sans return, événements non…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC3, question par question, avec réécriture des scripts fautifs au tableau.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Barème commenté ; remédiation sur les boucles, les fonctions et les événements ; méthode de construction d'un script en fonctions courtes ; tests pas à pas dans la console. Exercices de rattrapage : Atelier : calculatrice (ou convertisseur d'unités) en HTML et JavaScript — saisie, fonction de calcul, affichage du résultat, gestion des erreurs de saisie.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Un script lisible se découpe en fonctions qui font une seule chose ; on teste chaque fonction dans la console avant de l'intégrer.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Terminer la calculatrice et l'apporter en séance 30 pour le passage aux bases de données.",
  "trace": "Un script lisible se découpe en fonctions qui font une seule chose ; on teste chaque fonction dans la console avant de l'intégrer.",
  "erreurs": [
   "Fonction de calcul mêlée à l'affichage.",
   "Absence de test des cas limites (division par zéro, champ vide)."
  ],
  "prerequis_technique": "DC3 ; séances 18 à 27.",
  "axes": [
   "Correction et remédiation du DC3",
   "Atelier mini-projet",
   "Structuration d'un script"
  ],
  "objectifs_cours": [
   "Comprendre ses erreurs de logique et de syntaxe et corriger sa copie.",
   "Réaliser un mini-projet interactif utilisant DOM, événements et fonctions.",
   "Structurer un script en fonctions courtes et testables."
  ]
 },
 "30": {
  "n": 30,
  "titre": "SQL et bases de données — modèle relationnel, tables et clés",
  "date": "2027-01-26",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 80",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Base de données",
     "Table / relation",
     "Clé composée",
     "Cardinalités"
    ]
   },
   {
    "titre": "Base de données et SGBD",
    "items": [
     "Distinguer base de données, SGBD, table, champ et enregistrement."
    ]
   },
   {
    "titre": "Tables, clés et relations",
    "items": [
     "Identifier clé primaire, clé étrangère et relations 1:1, 1:N, N:M."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Aucun prérequis SQL : le domaine est nouveau",
   "les tableaux HTML (séance 4) servent d'image de départ"
  ],
  "criteres": [
   "Une clé primaire identifie une ligne, une clé étrangère la relie à une autre table : la cohérence est garantie par la structure, pas par la vigilance.",
   "Produire : Passage du tableur au schéma : trois entités (adhérent, activité, inscription)…",
   "Éviter : Confondre cardinalité et nombre d'enregistrements."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Aucun prérequis SQL : le domaine est nouveau ; les tableaux HTML (séance 4) servent d'image de départ.",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le fichier des adhérents du club est un tableur : la même personne apparaît deux fois et un numéro de téléphone traîne dans la colonne du nom. Question : comment empêcher cela par la structure elle-même ? Présenter les consignes : Passage du tableur au schéma : trois entités (adhérent, activité, inscription), cardinalités, clés primaires et étrangères ; schéma dessiné et…",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Base de données, SGBD, table/relation, champ/colonne, ligne/enregistrement ; clé primaire, clé étrangère, clé composée ; relations 1:1, 1:N, N:M et cardinalités ; valeur NULL ; présentation de phpMyAdmin et de la base de travail de l'année. Assister à la correction pour chaque élève ; Ouverture de phpMyAdmin, exploration de la base de travail, lecture de la structure des tables et des relations affichées.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Confondre cardinalité et nombre d'enregistrements. • Oublier la table de jonction dans une relation N:M.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Représenter le schéma de la base d'une bibliothèque (livres, adhérents, emprunts) avec ses cardinalités.",
  "trace": "Une clé primaire identifie une ligne, une clé étrangère la relie à une autre table : la cohérence est garantie par la structure, pas par la vigilance.",
  "erreurs": [
   "Confondre cardinalité et nombre d'enregistrements.",
   "Oublier la table de jonction dans une relation N:M."
  ],
  "prerequis_technique": "Aucun prérequis SQL : le domaine est nouveau ; les tableaux HTML (séance 4) servent d'image de départ.",
  "axes": [
   "Base de données et SGBD",
   "Tables, clés et relations",
   "Présentation de phpMyAdmin"
  ],
  "objectifs_cours": [
   "Distinguer base de données, SGBD, table, champ et enregistrement.",
   "Identifier clé primaire, clé étrangère et relations 1:1, 1:N, N:M.",
   "Représenter un besoin réel par un schéma relationnel et ouvrir la base de travail."
  ]
 },
 "31": {
  "n": 31,
  "titre": "SQL — LDD : créer une base et des tables avec leurs contraintes",
  "date": "2027-01-28",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 80",
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
    "titre": "CREATE DATABASE et USE",
    "items": [
     "Créer une base et une table avec les types adaptés."
    ]
   },
   {
    "titre": "Types de données et contraintes",
    "items": [
     "Écrire les contraintes PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK et DEFAULT."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Modèle relationnel et clés (séance 30)"
  ],
  "criteres": [
   "On crée d'abord les tables indépendantes, ensuite celles qui les référencent ; chaque contrainte écrite est une erreur future évitée.",
   "Produire : Création de la base « club » : tables adhérent, activite et inscription, avec types, clés…",
   "Éviter : Créer la table référençante avant la table référencée."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Modèle relationnel et clés (séance 30).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le script du club est prêt sur le papier ; exécuté, il refuse la moitié des insertions prévues. On cherche pourquoi dans l'ordre de création des tables et dans les contraintes oubliées. Présenter les consignes : Création de la base « club » : tables adhérent, activite et inscription, avec types, clés et contraintes ; exécution du script dans phpMyAdmin.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "CREATE DATABASE, USE ; CREATE TABLE ; types INT, DECIMAL, VARCHAR, CHAR, DATE, TEXT ; PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK, DEFAULT, AUTO_INCREMENT ; conventions d'écriture. Assister à la correction pour chaque élève ; Test des contraintes : insertion d'une clé dupliquée, d'une référence inexistante, d'un champ obligatoire vide ; correction du script en conséquence.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Créer la table référençante avant la table référencée. • VARCHAR sans taille ou taille trop courte.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Écrire sur feuille le script complet de création du schéma de la bibliothèque et le rapporter sur clé USB.",
  "trace": "On crée d'abord les tables indépendantes, ensuite celles qui les référencent ; chaque contrainte écrite est une erreur future évitée.",
  "erreurs": [
   "Créer la table référençante avant la table référencée.",
   "VARCHAR sans taille ou taille trop courte."
  ],
  "prerequis_technique": "Modèle relationnel et clés (séance 30).",
  "axes": [
   "CREATE DATABASE et USE",
   "Types de données et contraintes",
   "Conventions d'écriture"
  ],
  "objectifs_cours": [
   "Créer une base et une table avec les types adaptés.",
   "Écrire les contraintes PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK et DEFAULT.",
   "Respecter les conventions d'écriture d'un schéma (clé primaire soulignée, clé étrangère suivie de #)."
  ]
 },
 "32": {
  "n": 32,
  "titre": "SQL — LMD : INSERT, UPDATE et DELETE",
  "date": "2027-02-09",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 80-81",
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
    "titre": "UPDATE et DELETE sous condition",
    "items": [
     "Modifier et supprimer des lignes en contrôlant la clause WHERE."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "LDD et contraintes (séance 31)"
  ],
  "criteres": [
   "Toute modification commence par un SELECT de contrôle et se termine par une sauvegarde : sans WHERE, la requête porte sur toutes les lignes.",
   "Produire : Alimentation de la base du club : adhérents, activités et inscriptions, avec respect de…",
   "Éviter : UPDATE sans WHERE : toute la table est modifiée."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : LDD et contraintes (séance 31).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Une élève a lancé un DELETE sans condition sur la table des adhérents du club : la table est vide. On part de cet incident pour fixer la règle du WHERE et la sauvegarde avant toute manipulation. Présenter les consignes : Alimentation de la base du club : adhérents, activités et inscriptions, avec respect de l'ordre des clés étrangères.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "INSERT INTO … VALUES avec et sans liste de colonnes ; UPDATE … SET … WHERE ; DELETE … WHERE ; risque d'une mise à jour ou d'une suppression sans condition ; export et import au format SQL. Assister à la correction pour chaque élève ; Mise à jour des cotisations de trois adhérents, suppression des inscriptions d'une activité, puis export de la base et réimport dans une base de test.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • UPDATE sans WHERE : toute la table est modifiée. • Insérer une valeur de clé étrangère inexistante.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Écrire la série de requêtes d'alimentation de la base de la bibliothèque et l'exporter au format SQL.",
  "trace": "Toute modification commence par un SELECT de contrôle et se termine par une sauvegarde : sans WHERE, la requête porte sur toutes les lignes.",
  "erreurs": [
   "UPDATE sans WHERE : toute la table est modifiée.",
   "Insérer une valeur de clé étrangère inexistante."
  ],
  "prerequis_technique": "LDD et contraintes (séance 31).",
  "axes": [
   "INSERT INTO",
   "UPDATE et DELETE sous condition",
   "Import et export SQL"
  ],
  "objectifs_cours": [
   "Insérer des lignes avec et sans liste de colonnes.",
   "Modifier et supprimer des lignes en contrôlant la clause WHERE.",
   "Exporter et importer une base au format SQL."
  ]
 },
 "33": {
  "n": 33,
  "titre": "SQL — SELECT : filtres, tri et opérateurs",
  "date": "2027-02-11",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 81",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "SELECT … FROM … WHERE",
     "=, <, >, <=, >=, <>",
     "AND, OR, NOT"
    ]
   },
   {
    "titre": "SELECT et filtres",
    "items": [
     "Écrire une requête SELECT avec WHERE et les opérateurs de comparaison."
    ]
   },
   {
    "titre": "Opérateurs de comparaison et de liste",
    "items": [
     "Utiliser AND, OR, NOT, IS NULL, BETWEEN, IN et LIKE."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "LMD (séance 32)",
   "base du club alimentée"
  ],
  "criteres": [
   "Une requête se construit dans l'ordre : quoi afficher, dans quelle table, sous quelle condition, dans quel ordre.",
   "Produire : Dix requêtes de consultation sur la base du club : adhérents d'une ville, cotisations…",
   "Éviter : Confondre WHERE et ORDER BY."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : LMD (séance 32) ; base du club alimentée.",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le secrétariat du club demande « la liste des adhérents à jour de cotisation, par ordre alphabétique » : la demande est formulée en français, il faut la traduire en une requête unique. Présenter les consignes : Dix requêtes de consultation sur la base du club : adhérents d'une ville, cotisations entre deux dates, activités dont le nom contient « atelier »…",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "SELECT … FROM … WHERE ; =, <, >, <=, >=, <> ; AND, OR, NOT ; IS NULL, IS NOT NULL ; BETWEEN, IN, LIKE avec % ; ORDER BY ASC/DESC ; DISTINCT ; alias de colonnes. Assister à la correction pour chaque élève ; Requêtes de synthèse avec deux conditions combinées, tri sur deux colonnes, alias lisibles ; comparaison du résultat avec le résultat attendu fourni.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • SELECT … FROM … WHERE • =, <, >, <=, >=, <> • AND, OR, NOT • Confondre WHERE et ORDER BY. • LIKE sans % : la recherche devient une égalité.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Écrire les dix requêtes de consultation sur la base de la bibliothèque, avec le résultat attendu en commentaire.",
  "trace": "Une requête se construit dans l'ordre : quoi afficher, dans quelle table, sous quelle condition, dans quel ordre.",
  "erreurs": [
   "Confondre WHERE et ORDER BY.",
   "LIKE sans % : la recherche devient une égalité."
  ],
  "prerequis_technique": "LMD (séance 32) ; base du club alimentée.",
  "axes": [
   "SELECT et filtres",
   "Opérateurs de comparaison et de liste",
   "Tri et alias"
  ],
  "objectifs_cours": [
   "Écrire une requête SELECT avec WHERE et les opérateurs de comparaison.",
   "Utiliser AND, OR, NOT, IS NULL, BETWEEN, IN et LIKE.",
   "Trier avec ORDER BY et supprimer les doublons avec DISTINCT."
  ]
 },
 "34": {
  "n": 34,
  "titre": "Devoir de contrôle n°4",
  "date": "2027-02-16",
  "tri": 2,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Schéma, clés et contraintes",
    "items": [
     "Évaluer les acquis du domaine bases de données et SQL."
    ]
   },
   {
    "titre": "LDD et LMD",
    "items": [
     "Vérifier la capacité à écrire un script de création et des requêtes correctes."
    ]
   },
   {
    "titre": "SELECT : filtres et tri",
    "items": [
     "Diagnostiquer les besoins de remédiation avant les requêtes de sélection."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 30 à 33"
  ],
  "criteres": [
   "Barème : pratique 60 %, théorie 40 % ; en SQL, une requête juste mais malorthographiée ne renvoie rien.",
   "Produire : Partie théorique : compléter un schéma, souligner les clés, indiquer les cardinalités…",
   "Éviter : Requête sans WHERE alors que la consigne le demandait."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Schéma relationnel et cardinalités ; clés et contraintes ; CREATE TABLE ; INSERT, UPDATE, DELETE ; SELECT avec filtres…",
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
    "prof": "Partie théorique : compléter un schéma, souligner les clés, indiquer les cardinalités, corriger un script de création fautif. Partie pratique : création d'une table et de ses contraintes, alimentation, puis série de requêtes de consultation demandées au barème.",
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
  "maison": "Aucun travail écrit ; relire les fiches 30 à 33 avant la séance de correction.",
  "trace": "Barème : pratique 60 %, théorie 40 % ; en SQL, une requête juste mais malorthographiée ne renvoie rien.",
  "erreurs": [
   "Requête sans WHERE alors que la consigne le demandait.",
   "Clé étrangère déclarée sans contrainte de référence."
  ],
  "prerequis_technique": "Séances 30 à 33.",
  "axes": [
   "Schéma, clés et contraintes",
   "LDD et LMD",
   "SELECT : filtres et tri"
  ],
  "objectifs_cours": [
   "Évaluer les acquis du domaine bases de données et SQL.",
   "Vérifier la capacité à écrire un script de création et des requêtes correctes.",
   "Diagnostiquer les besoins de remédiation avant les requêtes de sélection."
  ]
 },
 "35": {
  "n": 35,
  "titre": "Correction du DC4 et SQL — requêtes de sélection",
  "date": "2027-02-18",
  "tri": 2,
  "nature": "correction",
  "domaines": "SQL / BD",
  "pages": "p. 81",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction et remédiation du DC4",
    "items": [
     "Comprendre ses erreurs de contraintes et de requêtes et corriger sa copie."
    ]
   },
   {
    "titre": "SELECT simple et filtres",
    "items": [
     "Écrire une requête SELECT avec WHERE et ORDER BY."
    ]
   },
   {
    "titre": "Alias de colonnes et tri du résultat",
    "items": [
     "Construire une requête sur deux ou trois tables avec alias."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC4",
   "séances 30 à 33"
  ],
  "criteres": [
   "Une requête de sélection s'écrit SELECT … FROM … WHERE … ORDER BY : le WHERE filtre les lignes, l'ORDER BY trie le résultat.",
   "Produire : Correction guidée du DC4, question par question, avec reprise des scripts de création…",
   "Éviter : Oublier le WHERE : toutes les lignes sont ramenées."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Deux tables, une question simple : « quelles activités suit chaque adhérent ? ». Sans requête de sélection, les élèves…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC4, question par question, avec reprise des scripts de création fautifs.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Barème commenté ; remédiation sur les contraintes et les requêtes fautives ; SELECT avec WHERE, opérateurs AND / OR / NOT, BETWEEN, IN, LIKE, ORDER BY, alias de colonnes. Exercices de rattrapage : Sélection adhérent–inscription–activité : construction pas à pas, alias, conditions, tri ; vérification du nombre de lignes obtenues.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Une requête de sélection s'écrit SELECT … FROM … WHERE … ORDER BY : le WHERE filtre les lignes, l'ORDER BY trie le résultat.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Écrire trois requêtes SELECT avec filtre sur le schéma de la bibliothèque.",
  "trace": "Une requête de sélection s'écrit SELECT … FROM … WHERE … ORDER BY : le WHERE filtre les lignes, l'ORDER BY trie le résultat.",
  "erreurs": [
   "Oublier le WHERE : toutes les lignes sont ramenées.",
   "Alias déclaré mais non utilisé dans les colonnes."
  ],
  "prerequis_technique": "DC4 ; séances 30 à 33.",
  "axes": [
   "Correction et remédiation du DC4",
   "SELECT simple et filtres",
   "Alias de colonnes et tri du résultat"
  ],
  "objectifs_cours": [
   "Comprendre ses erreurs de contraintes et de requêtes et corriger sa copie.",
   "Écrire une requête SELECT avec WHERE et ORDER BY.",
   "Construire une requête sur deux ou trois tables avec alias."
  ]
 },
 "36": {
  "n": 36,
  "titre": "SQL — fonctions d'agrégat et regroupements",
  "date": "2027-02-23",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 81",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "COUNT, COUNT(DISTINCT), SUM, AVG, MIN, MAX",
     "GROUP BY sur une ou deux colonnes",
     "différence WHERE / HAVING"
    ]
   },
   {
    "titre": "Fonctions d'agrégat",
    "items": [
     "Utiliser COUNT, SUM, AVG, MIN et MAX sur une colonne."
    ]
   },
   {
    "titre": "GROUP BY",
    "items": [
     "Regrouper les lignes avec GROUP BY sur une ou deux colonnes."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "SELECT simple et filtres (séance 35)"
  ],
  "criteres": [
   "WHERE filtre les lignes avant le regroupement, HAVING filtre les groupes après ; un agrégat sans GROUP BY renvoie une seule ligne.",
   "Produire : Statistiques sur la base du club : effectif total, effectif par activité, cotisation…",
   "Éviter : Condition d'agrégat écrite dans WHERE."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : SELECT simple et filtres (séance 35).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le bureau du club demande « combien d'adhérents par activité et quelle est la cotisation moyenne ». Une requête ligne à ligne ne peut pas répondre : il faut compter et regrouper. Présenter les consignes : Statistiques sur la base du club : effectif total, effectif par activité, cotisation moyenne et extrêmes, nombre d'adhérents sans téléphone.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "COUNT, COUNT(DISTINCT), SUM, AVG, MIN, MAX ; GROUP BY sur une ou deux colonnes ; HAVING ; différence WHERE / HAVING ; ordre logique : FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Assister à la correction pour chaque élève ; Requêtes avec GROUP BY et HAVING (activités de plus de trois inscrits), combinaison requête de sélection + agrégat + tri, vérification des résultats sur un jeu…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • COUNT, COUNT(DISTINCT), SUM, AVG, MIN, MAX • GROUP BY sur une ou deux colonnes • différence WHERE / HAVING • Condition d'agrégat écrite dans WHERE. • Colonne non regroupée et non agrégée dans le SELECT.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Écrire cinq requêtes d'agrégat sur la base de la bibliothèque, dont deux avec HAVING.",
  "trace": "WHERE filtre les lignes avant le regroupement, HAVING filtre les groupes après ; un agrégat sans GROUP BY renvoie une seule ligne.",
  "erreurs": [
   "Condition d'agrégat écrite dans WHERE.",
   "Colonne non regroupée et non agrégée dans le SELECT."
  ],
  "prerequis_technique": "SELECT simple et filtres (séance 35).",
  "axes": [
   "Fonctions d'agrégat",
   "GROUP BY",
   "HAVING et ordre d'exécution"
  ],
  "objectifs_cours": [
   "Utiliser COUNT, SUM, AVG, MIN et MAX sur une colonne.",
   "Regrouper les lignes avec GROUP BY sur une ou deux colonnes.",
   "Distinguer HAVING de WHERE et expliquer l'ordre d'exécution d'une requête."
  ]
 },
 "37": {
  "n": 37,
  "titre": "SQL — série d'exercices : filtres, tri et agrégats",
  "date": "2027-02-25",
  "tri": 2,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 81",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Série complète mêlant filtres, agrégats, regroupements et tri",
     "erreurs fréquentes (agrégat sans regroupement, colonne hors GROUP BY, alias oublié)",
     "méthode de vérification par requête de contrôle."
    ]
   },
   {
    "titre": "Requêtes avec filtres et tri",
    "items": [
     "Enchaîner filtre, agrégat et tri dans une même requête."
    ]
   },
   {
    "titre": "Agrégats et filtres combinés",
    "items": [
     "Traiter une série d'exercices du type de ceux de l'examen."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Sélection et fonctions d'agrégat (séances 35 et 36)"
  ],
  "criteres": [
   "Avant d'écrire, formuler la question en clair : quelle table, quelle condition de filtre, quel regroupement, quel tri.",
   "Produire : Six requêtes guidées sur le schéma du club : SELECT simple, filtre, tri, agrégat…",
   "Éviter : Agrégat sans GROUP BY : une seule ligne au lieu d'une par groupe."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Sélection et fonctions d'agrégat (séances 35 et 36).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Une série de huit énoncés est distribuée, tirée de sujets d'examen : chaque énoncé décrit un besoin en français. Les élèves doivent produire la requête et le résultat attendu avant d'exécuter. Présenter les consignes : Six requêtes guidées sur le schéma du club : requête de sélection simple, requête de sélection avec filtre, agrégat par groupe, requête de sélection + agrégat.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Série complète mêlant filtres, agrégats, regroupements et tri ; erreurs fréquentes (agrégat sans regroupement, colonne hors GROUP BY, alias oublié) ; méthode de vérification par requête de contrôle. Assister à la correction pour chaque élève ; Deux requêtes de synthèse en autonomie, puis correction commentée et rédaction collective de la fiche des erreurs fréquentes.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Série complète mêlant filtres, agrégats, regroupements et tri • erreurs fréquentes (lignes non filtrées, agrégat sans regroupement… • méthode de vérification par requête de contrôle. • Agrégat sans GROUP BY : une seule ligne au lieu d'une par groupe. • Compter des lignes au lieu de compter des valeurs distinctes.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Terminer la série et rédiger pour chaque requête le résultat attendu en une phrase.",
  "trace": "Avant d'écrire, formuler la question en clair : quelle table, quelle condition de filtre, quel regroupement, quel tri.",
  "erreurs": [
   "Agrégat sans GROUP BY : une seule ligne au lieu d'une par groupe.",
   "Compter des lignes au lieu de compter des valeurs distinctes."
  ],
  "prerequis_technique": "Sélection et fonctions d'agrégat (séances 35 et 36).",
  "axes": [
   "Requêtes avec filtres et tri",
   "Agrégats et filtres combinés",
   "Méthode de vérification"
  ],
  "objectifs_cours": [
   "Enchaîner filtre, agrégat et tri dans une même requête.",
   "Traiter une série d'exercices du type de ceux de l'examen.",
   "Vérifier un résultat par une requête de contrôle."
  ]
 },
 "38": {
  "n": 38,
  "titre": "Atelier de synthèse du 2e trimestre et préparation du DS2",
  "date": "2027-03-02",
  "tri": 2,
  "nature": "cours",
  "domaines": "JavaScript / SQL",
  "pages": "p. 76-81",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "Projet court : page HTML5, feuille de style, tableau de données, script de filtrage ou de validation",
     "sujet type de devoir de synthèse (JavaScript et SQL)",
     "méthode de révision et gestion du temps."
    ]
   },
   {
    "titre": "SQL · BD",
    "items": [
     "Projet court : page HTML5, feuille de style, tableau de données, script de filtrage ou de validation",
     "sujet type de devoir de synthèse (JavaScript et SQL)",
     "méthode de révision et gestion du temps."
    ]
   },
   {
    "titre": "Projet court JavaScript + SQL",
    "items": [
     "Réunir JavaScript et SQL dans une production unique."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 18 à 37"
  ],
  "criteres": [
   "Un sujet de synthèse se traite par blocs indépendants : sécuriser un bloc avant de passer au suivant.",
   "Produire : Projet court : page de consultation des activités du club avec tableau, filtre par…",
   "Éviter : Commencer par la partie la plus longue."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 18 à 37.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le devoir de synthèse n°2 a lieu la semaine du 4 au 13 mars. La séance commence par un projet court : une page de consultation alimentée par des données, comme dans un sujet d'examen. Présenter les consignes : Projet court : page de consultation des activités du club avec tableau, filtre par mot-clé en JavaScript et feuille de style.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Projet court : page HTML5, feuille de style, tableau de données, script de filtrage ou de validation ; sujet type de devoir de synthèse (JavaScript et SQL) ; méthode de révision et gestion du temps. Assister à la correction pour chaque élève ; Sujet type de devoir de synthèse traité en 50 minutes (requêtes SQL + script) puis corrigé au barème ; liste personnelle des points à revoir.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Projet court : page HTML5, feuille de style, tableau de données… • sujet type de devoir de synthèse (JavaScript et SQL) • méthode de révision et gestion du temps. • Commencer par la partie la plus longue. • Ne pas relire les requêtes avant de rendre.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   }
  ],
  "maison": "Terminer le sujet type et réviser les fiches 18 à 37 pour le devoir de synthèse n°2.",
  "trace": "Un sujet de synthèse se traite par blocs indépendants : sécuriser un bloc avant de passer au suivant.",
  "erreurs": [
   "Commencer par la partie la plus longue.",
   "Ne pas relire les requêtes avant de rendre."
  ],
  "prerequis_technique": "Séances 18 à 37.",
  "axes": [
   "Projet court JavaScript + SQL",
   "Sujet type de devoir de synthèse",
   "Bilan avant le DS2"
  ],
  "objectifs_cours": [
   "Réunir JavaScript et SQL dans une production unique.",
   "Traiter un sujet type de devoir de synthèse dans le temps imparti.",
   "Faire le point sur les acquis avant le devoir de synthèse n°2."
  ]
 },
 "39": {
  "n": 39,
  "titre": "Correction du DS2, bilan et plan de travail du 3e trimestre",
  "date": "2027-03-30",
  "tri": 3,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du DS2",
    "items": [
     "Comprendre le barème et corriger ses erreurs au devoir de synthèse n°2."
    ]
   },
   {
    "titre": "Bilan par domaine",
    "items": [
     "Faire le bilan par domaine et par élève."
    ]
   },
   {
    "titre": "Plan de travail du 3e trimestre",
    "items": [
     "Construire son plan de travail jusqu'à la fin de l'année."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Devoir de synthèse n°2 (semaine bloquée du 4 au 13 mars)"
  ],
  "criteres": [
   "Le 3e trimestre sert à consolider et à produire : le projet et les sujets complets remplacent la découverte.",
   "Produire : Correction guidée du DS2, question par question ; chaque élève note la cause de sa perte…",
   "Éviter : Ne pas relier ses erreurs à un domaine précis."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies du DS2 sont rendues avec le barème ; le tableau de classe par domaine est projeté. Chaque élève…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DS2, question par question ; chaque élève note la cause de sa perte de points par domaine.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction commentée du DS2 ; synthèse des erreurs par domaine (HTML5, CSS3, JavaScript, SQL) ; construction du plan de travail du 3e trimestre ; préparation de la 4e année. Exercices de rattrapage : Bilan par élève et par domaine, choix de deux objectifs écrits, présentation du calendrier du 3e trimestre (projet, DC5, DC6, bac blanc).",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Le 3e trimestre sert à consolider et à produire : le projet et les sujets complets remplacent la découverte.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Choisir le domaine à consolider et apporter trois exercices corrigés correspondants en séance 40.",
  "trace": "Le 3e trimestre sert à consolider et à produire : le projet et les sujets complets remplacent la découverte.",
  "erreurs": [
   "Ne pas relier ses erreurs à un domaine précis.",
   "Attendre la fin de l'année pour combler un retard identifié."
  ],
  "prerequis_technique": "Devoir de synthèse n°2 (semaine bloquée du 4 au 13 mars).",
  "axes": [
   "Correction du DS2",
   "Bilan par domaine",
   "Plan de travail du 3e trimestre"
  ],
  "objectifs_cours": [
   "Comprendre le barème et corriger ses erreurs au devoir de synthèse n°2.",
   "Faire le bilan par domaine et par élève.",
   "Construire son plan de travail jusqu'à la fin de l'année."
  ]
 },
 "40": {
  "n": 40,
  "titre": "SQL — fonctions d'agrégat et regroupements",
  "date": "2027-04-01",
  "tri": 3,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 81",
  "duree": 120,
  "objectifs": [
   {
    "titre": "SQL · BD",
    "items": [
     "Fonctions d'agrégat : COUNT, SUM, AVG, MIN, MAX",
     "GROUP BY sur une ou deux colonnes, HAVING",
     "comparaison à un agrégat"
    ]
   },
   {
    "titre": "GROUP BY et HAVING",
    "items": [
     "Regrouper des lignes avec GROUP BY et filtrer les groupes avec HAVING."
    ]
   },
   {
    "titre": "Comparaison avec un agrégat",
    "items": [
     "Comparer des agrégats par groupe et vérifier le résultat à la main."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Sélection et fonctions d'agrégat (séances 35 et 36)"
  ],
  "criteres": [
   "Un agrégat sans regroupement ramène une seule ligne ; avec GROUP BY, il s'applique à chaque groupe.",
   "Produire : Trois requêtes guidées avec COUNT, SUM et AVG, puis GROUP BY sur une colonne…",
   "Éviter : Mélanger une colonne et un agrégat sans GROUP BY."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Sélection et fonctions d'agrégat (séances 35 et 36).",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "« Quelle est la cotisation moyenne, et quels adhérents paient plus ? » La question demande deux temps : calculer l'agrégat, puis filtrer les groupes avec HAVING. Présenter les consignes : Trois agrégats et regroupements guidées : adhérents d'une activité donnée (IN), cotisation supérieure à la moyenne, activité la plus suivie.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Fonctions d'agrégat : COUNT, SUM, AVG, MIN, MAX ; GROUP BY sur une ou deux colonnes, HAVING ; comparaison à un agrégat ; combinaison filtre + agrégat + regroupement ; ordre de construction. Assister à la correction pour chaque élève ; Requête de synthèse combinant requête de sélection, agrégat et agrégat ; vérification de chaque étape par une requête intermédiaire affichée en commentaire.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Fonctions d'agrégat : COUNT, SUM, AVG, MIN, MAX • GROUP BY sur une ou deux colonnes, HAVING • comparaison à un agrégat • Mélanger une colonne et un agrégat sans GROUP BY. • Agrégat placé dans le WHERE au lieu du HAVING.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Écrire trois requêtes avec GROUP BY sur le schéma de la bibliothèque.",
  "trace": "Un agrégat sans regroupement ramène une seule ligne ; avec GROUP BY, il s'applique à chaque groupe.",
  "erreurs": [
   "Mélanger une colonne et un agrégat sans GROUP BY.",
   "Agrégat placé dans le WHERE au lieu du HAVING."
  ],
  "prerequis_technique": "Sélection et fonctions d'agrégat (séances 35 et 36).",
  "axes": [
   "GROUP BY et HAVING",
   "Comparaison avec un agrégat",
   "Requête complexe construite pas à pas"
  ],
  "objectifs_cours": [
   "Regrouper des lignes avec GROUP BY et filtrer les groupes avec HAVING.",
   "Comparer des agrégats par groupe et vérifier le résultat à la main.",
   "Construire une requête complexe en vérifiant chaque étape."
  ]
 },
 "41": {
  "n": 41,
  "titre": "SQL — révision générale et exercices types",
  "date": "2027-04-06",
  "tri": 3,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 80-81",
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
    "titre": "Schéma et contraintes",
    "items": [
     "Réviser de façon structurée l'ensemble du domaine SQL."
    ]
   },
   {
    "titre": "LDD, LMD et SELECT",
    "items": [
     "Traiter des exercices tirés des sujets d'examen et les corriger au barème."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 30 à 40"
  ],
  "criteres": [
   "En SQL, la révision se fait en écrivant des requêtes, pas en relisant un cours : six familles, une requête par famille.",
   "Produire : Reconstitution de mémoire du schéma du club et du script de création, puis comparaison…",
   "Éviter : Réviser le cours sans écrire de requêtes."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 30 à 40.",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Une fiche de révision du domaine est distribuée, avec les six familles de requêtes. Les élèves la complètent de mémoire, puis la confrontent au corrigé : l'écart indique exactement ce qu'il faut revoir. Présenter les consignes : Reconstitution de mémoire du schéma du club et du script de création, puis comparaison avec le corrigé.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Révision structurée : schéma et contraintes, LDD, LMD, SELECT avec filtres, agrégats et regroupements ; batterie d'exercices tirés des sujets d'examen ; barème. Assister à la correction pour chaque élève ; Batterie de six exercices d'examen (requêtes) corrigés au barème, avec classement personnel des erreurs par famille.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Réviser le cours sans écrire de requêtes. • Confondre WHERE et HAVING dans le choix de la solution.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Reprendre les requêtes échouées et les réécrire intégralement sur feuille.",
  "trace": "En SQL, la révision se fait en écrivant des requêtes, pas en relisant un cours : six familles, une requête par famille.",
  "erreurs": [
   "Réviser le cours sans écrire de requêtes.",
   "Confondre WHERE et HAVING dans le choix de la solution."
  ],
  "prerequis_technique": "Séances 30 à 40.",
  "axes": [
   "Schéma et contraintes",
   "LDD, LMD et SELECT",
   "Sélection, filtres et fonctions d'agrégat"
  ],
  "objectifs_cours": [
   "Réviser de façon structurée l'ensemble du domaine SQL.",
   "Traiter des exercices tirés des sujets d'examen et les corriger au barème.",
   "Identifier ses points faibles avant le projet et le DC5."
  ]
 },
 "42": {
  "n": 42,
  "titre": "Atelier projet — site complet, partie 1 : structure et mise en forme",
  "date": "2027-04-08",
  "tri": 3,
  "nature": "cours",
  "domaines": "HTML5 / CSS3",
  "pages": "p. 67-75",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "Cahier des charges (contenu, arborescence, charte)",
     "structure sémantique des trois pages",
     "feuille de style commune (menu, cartes, formulaire)"
    ]
   },
   {
    "titre": "CSS & structure",
    "items": [
     "Cahier des charges (contenu, arborescence, charte)",
     "structure sémantique des trois pages",
     "feuille de style commune (menu, cartes, formulaire)"
    ]
   },
   {
    "titre": "Cahier des charges du projet",
    "items": [
     "Rédiger un cahier des charges simple pour un site de trois pages."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 17 (HTML5 et CSS3) et 18 à 29 (JavaScript de base)"
  ],
  "criteres": [
   "Un projet se gagne au départ : arborescence et nommage décidés en une fois évitent les corrections en cascade.",
   "Produire : Rédaction du cahier des charges et de l'arborescence, puis réalisation de la structure…",
   "Éviter : Commencer par le graphisme avant l'arborescence."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 1 à 17 (HTML5 et CSS3) et 18 à 29 (JavaScript de base).",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le club veut un vrai site pour la fin de l'année : trois pages, un menu, une galerie et un formulaire. La séance commence par la répartition du travail en binômes et la rédaction du cahier des charges. Présenter les consignes : Rédaction du cahier des charges et de l'arborescence, puis réalisation de la structure HTML5 des trois pages avec menu identique.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Cahier des charges (contenu, arborescence, charte) ; structure sémantique des trois pages ; feuille de style commune (menu, cartes, formulaire) ; points de méthode (nommage, arborescence, validité du code). Assister à la correction pour chaque élève ; Feuille de style commune : charte de couleurs, menu à états, cartes de la galerie, formulaire ; contrôle de validité et suivi individualisé.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Cahier des charges (contenu, arborescence, charte) • structure sémantique des trois pages • feuille de style commune (menu, cartes, formulaire) • Commencer par le graphisme avant l'arborescence. • Dupliquer la feuille de style page par page.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   }
  ],
  "maison": "Avancer la structure et la feuille de style du projet ; apporter l'avancement en séance 44.",
  "trace": "Un projet se gagne au départ : arborescence et nommage décidés en une fois évitent les corrections en cascade.",
  "erreurs": [
   "Commencer par le graphisme avant l'arborescence.",
   "Dupliquer la feuille de style page par page."
  ],
  "prerequis_technique": "Séances 1 à 17 (HTML5 et CSS3) et 18 à 29 (JavaScript de base).",
  "axes": [
   "Cahier des charges du projet",
   "Structure HTML5 du site",
   "Feuille de style CSS3"
  ],
  "objectifs_cours": [
   "Rédiger un cahier des charges simple pour un site de trois pages.",
   "Réaliser la structure sémantique des pages du projet.",
   "Écrire une feuille de style commune et cohérente."
  ]
 },
 "43": {
  "n": 43,
  "titre": "Devoir de contrôle n°5",
  "date": "2027-04-13",
  "tri": 3,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Production d'une page complète",
    "items": [
     "Évaluer la capacité à produire une page complète en 2 h."
    ]
   },
   {
    "titre": "Script de validation ou d'interactivité",
    "items": [
     "Vérifier l'intégration d'un script dans une page mise en forme."
    ]
   },
   {
    "titre": "Questions de cours",
    "items": [
     "Contrôler la maîtrise des notions de cours en accompagnement."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 42"
  ],
  "criteres": [
   "Barème : pratique 70 %, théorie 30 % ; une page qui fonctionne et un code valide valent plus qu'une page décorée incomplète.",
   "Produire : Partie pratique : production de la page d'après maquette (structure, styles, états) et du…",
   "Éviter : Négliger la validité du code au profit du visuel."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : Structure HTML5, feuille de style CSS3, mise en page et mise en forme, script JavaScript de validation ou…",
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
    "prof": "Partie pratique : production de la page d'après maquette (structure, styles, états) et du script demandé. Partie théorique : questions de cours, lecture de code et requête SQL à compléter.",
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
  "maison": "Aucun travail écrit ; poursuivre le projet en binôme avant la séance 44.",
  "trace": "Barème : pratique 70 %, théorie 30 % ; une page qui fonctionne et un code valide valent plus qu'une page décorée incomplète.",
  "erreurs": [
   "Négliger la validité du code au profit du visuel.",
   "Script non testé après intégration dans la page."
  ],
  "prerequis_technique": "Séances 1 à 42.",
  "axes": [
   "Production d'une page complète",
   "Script de validation ou d'interactivité",
   "Questions de cours"
  ],
  "objectifs_cours": [
   "Évaluer la capacité à produire une page complète en 2 h.",
   "Vérifier l'intégration d'un script dans une page mise en forme.",
   "Contrôler la maîtrise des notions de cours en accompagnement."
  ]
 },
 "44": {
  "n": 44,
  "titre": "Correction du DC5 et atelier projet — partie 2 : interactivité",
  "date": "2027-04-15",
  "tri": 3,
  "nature": "correction",
  "domaines": "JavaScript",
  "pages": "p. 76-79",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction et remédiation du DC5",
    "items": [
     "Comprendre ses erreurs au DC5 et corriger sa production."
    ]
   },
   {
    "titre": "Interactivité du projet",
    "items": [
     "Ajouter au projet la validation de formulaire et les modifications du DOM."
    ]
   },
   {
    "titre": "Préparation de la présentation",
    "items": [
     "Préparer une présentation orale courte du projet."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC5",
   "séances 23 à 27 (DOM, événements, validation)"
  ],
  "criteres": [
   "Un projet se juge sur ce qui fonctionne : chaque fonctionnalité ajoutée doit être testée puis intégrée, jamais l'inverse.",
   "Produire : Correction guidée du DC5 au barème, avec reprise sur machine des points les plus coûteux.",
   "Éviter : Ajouter une fonctionnalité sans tester les précédentes."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les productions du DC5 sont comparées deux à deux : même maquette, résultats très différents. La correction…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC5 au barème, avec reprise sur machine des points les plus coûteux.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Barème commenté et remédiation ; validation de formulaire, modification du DOM, gestion des événements dans le projet ; préparation d'une présentation orale de trois minutes. Exercices de rattrapage : Atelier projet, partie 2 : validation du formulaire, galerie interactive, menu déroulant ; rédaction du plan de présentation orale.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Un projet se juge sur ce qui fonctionne : chaque fonctionnalité ajoutée doit être testée puis intégrée, jamais l'inverse.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Terminer l'interactivité du projet et préparer la présentation orale de trois minutes.",
  "trace": "Un projet se juge sur ce qui fonctionne : chaque fonctionnalité ajoutée doit être testée puis intégrée, jamais l'inverse.",
  "erreurs": [
   "Ajouter une fonctionnalité sans tester les précédentes.",
   "Formulaire validé uniquement par les attributs HTML5."
  ],
  "prerequis_technique": "DC5 ; séances 23 à 27 (DOM, événements, validation).",
  "axes": [
   "Correction et remédiation du DC5",
   "Interactivité du projet",
   "Préparation de la présentation"
  ],
  "objectifs_cours": [
   "Comprendre ses erreurs au DC5 et corriger sa production.",
   "Ajouter au projet la validation de formulaire et les modifications du DOM.",
   "Préparer une présentation orale courte du projet."
  ]
 },
 "45": {
  "n": 45,
  "titre": "JavaScript — révision générale et exercices types",
  "date": "2027-04-20",
  "tri": 3,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 76-79",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "Types et opérateurs",
     "conditions et boucles",
     "fonctions, portée et tableaux"
    ]
   },
   {
    "titre": "Types, opérateurs et logique",
    "items": [
     "Réviser l'ensemble du domaine JavaScript de façon structurée."
    ]
   },
   {
    "titre": "Fonctions, tableaux et objets natifs",
    "items": [
     "Traiter des exercices types et des exercices de lecture de code."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 18 à 29 et 44"
  ],
  "criteres": [
   "Lire un script comme une suite d'états : ce que contient chaque variable après chaque ligne.",
   "Produire : Exercices de lecture de code : prévoir l'affichage de trois scripts, justifier la…",
   "Éviter : Corriger au hasard sans lire le message d'erreur."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 18 à 29 et 44.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Trois scripts fautifs sont projetés : une boucle infinie, une fonction sans return, un événement non relié. Les élèves doivent dire ce qui ne va pas avant d'exécuter. Présenter les consignes : Exercices de lecture de code : prévoir l'affichage de trois scripts, justifier la réponse, puis vérifier dans la console.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Types et opérateurs ; conditions et boucles ; fonctions, portée et tableaux ; DOM et événements ; objets natifs (chaînes, Math) ; validation de formulaire ; lecture de code. Assister à la correction pour chaque élève ; Exercices types d'examen : correction de scripts fautifs, écriture d'une validation complète et d'un affichage dynamique ; correction au barème.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Types et opérateurs • conditions et boucles • fonctions, portée et tableaux • Corriger au hasard sans lire le message d'erreur. • Confondre affectation et comparaison dans les tests.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Réécrire intégralement les deux scripts échoués et les tester dans la console.",
  "trace": "Lire un script comme une suite d'états : ce que contient chaque variable après chaque ligne.",
  "erreurs": [
   "Corriger au hasard sans lire le message d'erreur.",
   "Confondre affectation et comparaison dans les tests."
  ],
  "prerequis_technique": "Séances 18 à 29 et 44.",
  "axes": [
   "Types, opérateurs et logique",
   "Fonctions, tableaux et objets natifs",
   "DOM, événements et validation"
  ],
  "objectifs_cours": [
   "Réviser l'ensemble du domaine JavaScript de façon structurée.",
   "Traiter des exercices types et des exercices de lecture de code.",
   "Corriger un script fautif en identifiant la cause de l'erreur."
  ]
 },
 "46": {
  "n": 46,
  "titre": "CSS3 — révision et mise en page avancée",
  "date": "2027-04-22",
  "tri": 3,
  "nature": "cours",
  "domaines": "CSS3",
  "pages": "p. 71-75",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS & structure",
    "items": [
     "Sélecteurs et priorité",
     "modèle de boîte et box-sizing",
     "positionnement, float et z-index"
    ]
   },
   {
    "titre": "Sélecteurs et modèle de boîte",
    "items": [
     "Réviser sélecteurs, priorité et modèle de boîte."
    ]
   },
   {
    "titre": "Positionnement et mise en page à deux colonnes",
    "items": [
     "Réaliser une mise en page à deux colonnes avec en-tête fixe et cartes."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 8 à 17 et 42"
  ],
  "criteres": [
   "Une mise en page qui casse sur petit écran n'est pas finie : la media query fait partie du travail, pas du bonus.",
   "Produire : Mise en page à deux colonnes avec en-tête fixe, cartes alignées et effets au survol, sans…",
   "Éviter : Hauteurs fixes qui provoquent des débordements."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 8 à 17 et 42.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "La page du projet est affichée sur trois largeurs d'écran : sur téléphone, le menu recouvre le contenu. La séance part de cette capture d'écran pour réviser positionnement et adaptation. Présenter les consignes : Mise en page à deux colonnes avec en-tête fixe, cartes alignées et effets au survol, sans float.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Sélecteurs et priorité ; modèle de boîte et box-sizing ; positionnement, float et z-index ; mise en page à deux colonnes, cartes et effets ; media queries ; erreurs de mise en page fréquentes. Assister à la correction pour chaque élève ; Ajout de deux media queries, correction des débordements et des superpositions, contrôle sur trois largeurs et sur les deux navigateurs du lycée.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Sélecteurs et priorité • modèle de boîte et box-sizing • positionnement, float et z-index • Hauteurs fixes qui provoquent des débordements. • Media query placée avant les règles générales.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes CSS3 · VS Code · navigateur"
   }
  ],
  "maison": "Adapter la page d'accueil du projet aux petits écrans et vérifier sur téléphone.",
  "trace": "Une mise en page qui casse sur petit écran n'est pas finie : la media query fait partie du travail, pas du bonus.",
  "erreurs": [
   "Hauteurs fixes qui provoquent des débordements.",
   "Media query placée avant les règles générales."
  ],
  "prerequis_technique": "Séances 8 à 17 et 42.",
  "axes": [
   "Sélecteurs et modèle de boîte",
   "Positionnement et mise en page à deux colonnes",
   "Adaptation aux petits écrans"
  ],
  "objectifs_cours": [
   "Réviser sélecteurs, priorité et modèle de boîte.",
   "Réaliser une mise en page à deux colonnes avec en-tête fixe et cartes.",
   "Adapter la page aux petits écrans avec une media query."
  ]
 },
 "47": {
  "n": 47,
  "titre": "HTML5, CSS3 et JavaScript — sujet de synthèse type",
  "date": "2027-04-27",
  "tri": 3,
  "nature": "cours",
  "domaines": "HTML5 / CSS3 / JavaScript",
  "pages": "p. 67-79",
  "duree": 120,
  "objectifs": [
   {
    "titre": "HTML5",
    "items": [
     "Sujet complet : page à produire d'après maquette, feuille de style, comportement JavaScript, plus une…",
     "barème détaillé et gestion du temps."
    ]
   },
   {
    "titre": "JavaScript",
    "items": [
     "Sujet complet : page à produire d'après maquette, feuille de style, comportement JavaScript, plus une…",
     "barème détaillé et gestion du temps."
    ]
   },
   {
    "titre": "Sujet complet type fin d'année",
    "items": [
     "Traiter un sujet complet dans le temps imparti."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 46"
  ],
  "criteres": [
   "Grille de relecture d'une épreuve : structure valide, styles appliqués, script testé, consignes relues.",
   "Produire : Traitement du sujet en conditions d'examen : structure, styles, script.",
   "Éviter : Rendre sans relire les consignes."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 1 à 46.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un sujet complet type fin d'année est distribué : maquette, cahier des charges, barème. Les élèves disposent de 90 minutes, comme à l'examen, puis la correction est projetée. Présenter les consignes : Traitement du sujet en conditions d'examen : structure, styles, script.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Sujet complet : page à produire d'après maquette, feuille de style, comportement JavaScript, plus une partie SQL ; barème détaillé et gestion du temps. Assister à la correction pour chaque élève ; Correction guidée au barème, point par point, avec rédaction de la grille de relecture à appliquer le jour de l'épreuve.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Sujet complet : page à produire d'après maquette, feuille de style… • barème détaillé et gestion du temps. • Sujet complet : page à produire d'après maquette, feuille de style… • Rendre sans relire les consignes. • Laisser une partie entière de côté faute de temps.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse · machine"
   }
  ],
  "maison": "Reprendre le sujet complet à la maison et le rendre corrigé en séance 48.",
  "trace": "Grille de relecture d'une épreuve : structure valide, styles appliqués, script testé, consignes relues.",
  "erreurs": [
   "Rendre sans relire les consignes.",
   "Laisser une partie entière de côté faute de temps."
  ],
  "prerequis_technique": "Séances 1 à 46.",
  "axes": [
   "Sujet complet type fin d'année",
   "Feuille de style et comportement",
   "Correction guidée au barème"
  ],
  "objectifs_cours": [
   "Traiter un sujet complet dans le temps imparti.",
   "Produire une page conforme à une maquette et un comportement JavaScript demandé.",
   "S'auto-évaluer avec le barème détaillé."
  ]
 },
 "48": {
  "n": 48,
  "titre": "Révision générale et préparation du DC6",
  "date": "2027-04-29",
  "tri": 3,
  "nature": "cours",
  "domaines": "Révision",
  "pages": "p. 67-81",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Fiche de révision des quatre domaines",
    "items": [
     "Réviser les quatre domaines à partir d'une fiche de synthèse."
    ]
   },
   {
    "titre": "Exercices ciblés sur les points faibles",
    "items": [
     "Traiter des exercices ciblés sur les points faibles relevés dans les devoirs."
    ]
   },
   {
    "titre": "Méthode d'épreuve",
    "items": [
     "Appliquer une méthode d'épreuve et de gestion du temps."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 1 à 47",
   "résultats des DC1 à DC5"
  ],
  "criteres": [
   "Réviser efficacement, c'est réviser ce que l'on rate : la liste de ses propres erreurs vaut mieux que le programme entier.",
   "Produire : Complétion de la fiche de révision et auto-contrôle des notions clés par questions…",
   "Éviter : Réviser des chapitres déjà maîtrisés."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 1 à 47 ; résultats des DC1 à DC5.",
    "eleves": "• Répondent aux questions",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Chaque élève dispose de son relevé d'erreurs depuis le début de l'année. La séance est organisée en ateliers : trois postes (HTML5/CSS3, JavaScript, SQL) et rotation selon les besoins identifiés. Présenter les consignes : Complétion de la fiche de révision et auto-contrôle des notions clés par questions croisées entre élèves.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Fiche de révision des quatre domaines ; exercices ciblés par famille d'erreurs ; méthode d'épreuve, ordre de traitement et gestion du temps avant le DC6 du 4 mai. Assister à la correction pour chaque élève ; Ateliers tournants sur les points faibles : exercices courts corrigés immédiatement ; rédaction d'une fiche personnelle de cinq erreurs à ne plus…",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Sujets corrigés · fiches de synthèse"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Fiche de révision des quatre domaines • exercices ciblés par famille d'erreurs • méthode d'épreuve, ordre de traitement et gestion du temps avant le… • Réviser des chapitres déjà maîtrisés. • Apprendre par cœur des requêtes sans comprendre la structure.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Sujets corrigés · fiches de synthèse"
   }
  ],
  "maison": "Relire la fiche personnelle des cinq erreurs et les exercices ciblés pour le devoir de contrôle n°6.",
  "trace": "Réviser efficacement, c'est réviser ce que l'on rate : la liste de ses propres erreurs vaut mieux que le programme entier.",
  "erreurs": [
   "Réviser des chapitres déjà maîtrisés.",
   "Apprendre par cœur des requêtes sans comprendre la structure."
  ],
  "prerequis_technique": "Séances 1 à 47 ; résultats des DC1 à DC5.",
  "axes": [
   "Fiche de révision des quatre domaines",
   "Exercices ciblés sur les points faibles",
   "Méthode d'épreuve"
  ],
  "objectifs_cours": [
   "Réviser les quatre domaines à partir d'une fiche de synthèse.",
   "Traiter des exercices ciblés sur les points faibles relevés dans les devoirs.",
   "Appliquer une méthode d'épreuve et de gestion du temps."
  ]
 },
 "49": {
  "n": 49,
  "titre": "Devoir de contrôle n°6",
  "date": "2027-05-04",
  "tri": 3,
  "nature": "devoir de contrôle",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "CSS3 avancé",
    "items": [
     "Évaluer les acquis du 3e trimestre en théorie et en pratique."
    ]
   },
   {
    "titre": "JavaScript : DOM, événements, validation",
    "items": [
     "Vérifier la maîtrise des domaines travaillés depuis le DC5."
    ]
   },
   {
    "titre": "SQL : sélection, filtres et agrégats",
    "items": [
     "Préparer le bac blanc de fin d'année."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 40 à 48"
  ],
  "criteres": [
   "Barème : pratique 60 %, théorie 40 % ; le bac blanc de mai portera sur le programme entier, celui-ci prépare la méthode.",
   "Produire : Partie théorique : lecture de code, complément de requêtes, correction d'une feuille de…",
   "Éviter : Requête de requête de sélection sans condition."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 5,
    "prof": "Rappeler les consignes générales et le barème : CSS3 avancé (positionnement, media queries, états) ; JavaScript (DOM, événements, validation) ; SQL (sélection…",
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
    "prof": "Partie théorique : lecture de code, complément de requêtes, correction d'une feuille de style. Partie pratique : page mise en forme et scriptée, puis requêtes SQL demandées au barème.",
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
  "maison": "Aucun travail écrit ; relire les fiches 40 à 48 avant la séance de correction.",
  "trace": "Barème : pratique 60 %, théorie 40 % ; le bac blanc de mai portera sur le programme entier, celui-ci prépare la méthode.",
  "erreurs": [
   "Requête de requête de sélection sans condition.",
   "Script testé uniquement sur un cas favorable."
  ],
  "prerequis_technique": "Séances 40 à 48.",
  "axes": [
   "CSS3 avancé",
   "JavaScript : DOM, événements, validation",
   "SQL : sélection, filtres et agrégats"
  ],
  "objectifs_cours": [
   "Évaluer les acquis du 3e trimestre en théorie et en pratique.",
   "Vérifier la maîtrise des domaines travaillés depuis le DC5.",
   "Préparer le bac blanc de fin d'année."
  ]
 },
 "50": {
  "n": 50,
  "titre": "Correction du DC6 et remédiation",
  "date": "2027-05-06",
  "tri": 3,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction et remédiation du DC6",
    "items": [
     "Comprendre ses erreurs au DC6 et corriger sa copie."
    ]
   },
   {
    "titre": "Conseils pour la 4e année",
    "items": [
     "Recevoir des conseils personnalisés pour la 4e année."
    ]
   },
   {
    "titre": "Préparation de l'épreuve du bac",
    "items": [
     "Identifier les acquis à consolider pendant l'été."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "DC6",
   "programme des séances 1 à 48"
  ],
  "criteres": [
   "Ce qui est acquis se consolide en 4e année ; ce qui ne l'est pas doit être repris avant la rentrée suivante.",
   "Produire : Correction guidée du DC6 au barème et remédiation ciblée par élève selon ses erreurs.",
   "Éviter : Croire que la 4e année reprend tout depuis le début."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies du DC6 sont rendues avec le barème ; un tableau de synthèse par élève et par domaine est…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du DC6 au barème et remédiation ciblée par élève selon ses erreurs.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction commentée du DC6 ; remédiation individualisée ; présentation du programme de 4e année (PHP, PHP–MySQL, préparation du bac) ; conseils de travail pour l'été. Exercices de rattrapage : Entretien individuel court : bilan de l'année, deux acquis solides, deux points à consolider ; présentation du programme de 4e année.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : Ce qui est acquis se consolide en 4e année ; ce qui ne l'est pas doit être repris avant la rentrée suivante.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Relire les fiches des domaines à consolider pendant l'été et préparer le bac blanc de mai.",
  "trace": "Ce qui est acquis se consolide en 4e année ; ce qui ne l'est pas doit être repris avant la rentrée suivante.",
  "erreurs": [
   "Croire que la 4e année reprend tout depuis le début.",
   "Abandonner le SQL après le dernier devoir."
  ],
  "prerequis_technique": "DC6 ; programme des séances 1 à 48.",
  "axes": [
   "Correction et remédiation du DC6",
   "Conseils pour la 4e année",
   "Préparation de l'épreuve du bac"
  ],
  "objectifs_cours": [
   "Comprendre ses erreurs au DC6 et corriger sa copie.",
   "Recevoir des conseils personnalisés pour la 4e année.",
   "Identifier les acquis à consolider pendant l'été."
  ]
 },
 "51": {
  "n": 51,
  "titre": "Révision — bases de données et SQL",
  "date": "2027-05-11",
  "tri": 3,
  "nature": "cours",
  "domaines": "SQL / BD",
  "pages": "p. 80-81",
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
    "titre": "Schéma, contraintes, LDD et LMD",
    "items": [
     "Reprendre le domaine SQL à partir des erreurs des devoirs."
    ]
   },
   {
    "titre": "SELECT, filtres et fonctions d'agrégat",
    "items": [
     "Enchaîner filtre, regroupement et tri dans une même requête."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 30 à 41 et 49"
  ],
  "criteres": [
   "Une requête se vérifie en la simplifiant : on teste d'abord le WHERE seul, puis on ajoute le regroupement et le tri.",
   "Produire : Reprise des trois familles d'erreurs : requête modèle écrite au tableau, puis trois…",
   "Éviter : Écrire la requête avant d'avoir identifié les tables."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 30 à 41 et 49.",
    "eleves": "• Répondent aux questions",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Le relevé d'erreurs SQL de la classe est projeté : trois familles d'erreurs reviennent. La séance est construite sur ces trois familles, avec une requête modèle pour chacune. Présenter les consignes : Reprise des trois familles d'erreurs : requête modèle écrite au tableau, puis trois exercices d'application immédiate.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Schéma relationnel et contraintes ; LDD et LMD ; SELECT, filtres et tri ; agrégats et regroupements ; série d'exercices corrigés. Assister à la correction pour chaque élève ; Série de six exercices type bac blanc corrigés au barème, avec contrôle du résultat par une seconde requête.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Base de données • Table / relation • Clé composée • Écrire la requête avant d'avoir identifié les tables. • Oublier le regroupement quand un agrégat côtoie une colonne.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "XAMPP / phpMyAdmin · base d'examen"
   }
  ],
  "maison": "Revoir les requêtes de la série et refaire celles qui ont échoué.",
  "trace": "Une requête se vérifie en la simplifiant : on teste d'abord le WHERE seul, puis on ajoute le regroupement et le tri.",
  "erreurs": [
   "Écrire la requête avant d'avoir identifié les tables.",
   "Oublier le regroupement quand un agrégat côtoie une colonne."
  ],
  "prerequis_technique": "Séances 30 à 41 et 49.",
  "axes": [
   "Schéma, contraintes, LDD et LMD",
   "SELECT, filtres et fonctions d'agrégat",
   "Agrégats et regroupements — exercices corrigés"
  ],
  "objectifs_cours": [
   "Reprendre le domaine SQL à partir des erreurs des devoirs.",
   "Enchaîner filtre, regroupement et tri dans une même requête.",
   "Traiter une série d'exercices corrigés type bac blanc."
  ]
 },
 "52": {
  "n": 52,
  "titre": "Révision — JavaScript et interactivité",
  "date": "2027-05-13",
  "tri": 3,
  "nature": "cours",
  "domaines": "JavaScript",
  "pages": "p. 76-79",
  "duree": 120,
  "objectifs": [
   {
    "titre": "JavaScript",
    "items": [
     "Logique et structures de contrôle",
     "fonctions, portée et tableaux",
     "DOM, événements, validation"
    ]
   },
   {
    "titre": "Logique, fonctions et tableaux",
    "items": [
     "Reprendre le domaine JavaScript à partir des erreurs relevées."
    ]
   },
   {
    "titre": "DOM, événements et validation",
    "items": [
     "Consolider DOM, événements et validation par un mini-projet."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Séances 18 à 29, 44 et 49"
  ],
  "criteres": [
   "Déboguer, c'est isoler : on réduit le script au cas qui échoue avant de le corriger.",
   "Produire : Correction guidée du script fautif : repérage des erreurs, message de la console…",
   "Éviter : Réécrire tout le script au lieu de corriger la ligne fautive."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 15,
    "prof": "Poser des questions pour rappeler les bases : Séances 18 à 29, 44 et 49.",
    "eleves": "• Répondent aux questions",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Un script d'examen comportant quatre erreurs est distribué : il ne produit pas ce qui est attendu. Les élèves doivent le corriger sans le réécrire entièrement. Présenter les consignes : Correction guidée du script fautif : repérage des erreurs, message de la console, correction minimale et test.",
    "eleves": "• Découvrent la situation et les consignes • Formulent le problème",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Constatations",
    "duree": 90,
    "prof": "Logique et structures de contrôle ; fonctions, portée et tableaux ; DOM, événements, validation ; objets natifs ; lecture de code et débogage dans la console. Assister à la correction pour chaque élève ; Mini-projet de consolidation : page avec formulaire validé, liste filtrée en temps réel et compteur ; présentation rapide entre binômes.",
    "eleves": "• Réalisent l'activité • Corrigent leurs erreurs avec l'aide de l'enseignant",
    "moyens": "Les annexes JavaScript · VS Code · console"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Demander aux élèves : • Logique et structures de contrôle • fonctions, portée et tableaux • DOM, événements, validation • Réécrire tout le script au lieu de corriger la ligne fautive. • Ignorer le message d'erreur de la console.",
    "eleves": "• Répondent aux questions • Discutent entre eux pour valoriser leurs acquis",
    "moyens": "Les annexes JavaScript · VS Code · console"
   }
  ],
  "maison": "Terminer le mini-projet et le rendre en séance 53 pour le bac blanc.",
  "trace": "Déboguer, c'est isoler : on réduit le script au cas qui échoue avant de le corriger.",
  "erreurs": [
   "Réécrire tout le script au lieu de corriger la ligne fautive.",
   "Ignorer le message d'erreur de la console."
  ],
  "prerequis_technique": "Séances 18 à 29, 44 et 49.",
  "axes": [
   "Logique, fonctions et tableaux",
   "DOM, événements et validation",
   "Mini-projet de consolidation"
  ],
  "objectifs_cours": [
   "Reprendre le domaine JavaScript à partir des erreurs relevées.",
   "Consolider DOM, événements et validation par un mini-projet.",
   "Lire et corriger un script d'examen en un temps limité."
  ]
 },
 "53": {
  "n": 53,
  "titre": "Bac blanc — sujet complet de fin d'année (2 h)",
  "date": "2027-05-18",
  "tri": 3,
  "nature": "sujet de bac",
  "domaines": "Bac blanc",
  "pages": "p. 67-81",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Sujet complet sur les quatre domaines",
    "items": [
     "Composer en conditions réelles sur l'ensemble du programme."
    ]
   },
   {
    "titre": "Conditions réelles d'épreuve",
    "items": [
     "Gérer son temps et ses priorités pendant une épreuve de 2 h."
    ]
   },
   {
    "titre": "Barème type examen",
    "items": [
     "Préparer la correction collective du sujet."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Programme complet de 3e année (séances 1 à 52)"
  ],
  "criteres": [
   "En épreuve longue, on sécurise d'abord ce qui est certain, on relit les consignes, on rend un dossier qui s'ouvre.",
   "Produire : Composition : lecture du sujet, planification du temps, production de la page et du…",
   "Éviter : Passer tout le temps sur la mise en forme."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer le sujet et rappeler la répartition du temps ainsi que le barème.",
    "eleves": "• Lisent le sujet • Planifient l'ordre de traitement",
    "moyens": "Sujet complet · machine · base de test"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Répondre aux questions de forme ; rappeler la règle : terminer ce que l'on commence.",
    "eleves": "• Notent le temps par partie • Préparent les fichiers de travail",
    "moyens": "Sujet complet · machine · base de test"
   },
   {
    "etape": "Constatations",
    "duree": 95,
    "prof": "Composition : lecture du sujet, planification du temps, production de la page et du script. Composition : partie SQL et relecture ; remise des fichiers et des copies à l'heure exacte. Assister les élèves individuellement.",
    "eleves": "• Composent sur machine • Testent au fur et à mesure • Vérifient le résultat attendu",
    "moyens": "Sujet complet · machine · base de test"
   },
   {
    "etape": "Évaluation",
    "duree": 5,
    "prof": "Corriger au barème : En épreuve longue, on sécurise d'abord ce qui est certain, on relit les consignes, on rend un dossier qui s'ouvre.",
    "eleves": "• Comparent leur production au corrigé • Notent les écarts",
    "moyens": "Sujet complet · machine · base de test"
   }
  ],
  "maison": "Aucun travail écrit ; préparer la correction collective en relisant les fiches 40 à 52.",
  "trace": "En épreuve longue, on sécurise d'abord ce qui est certain, on relit les consignes, on rend un dossier qui s'ouvre.",
  "erreurs": [
   "Passer tout le temps sur la mise en forme.",
   "Rendre un dossier incomplet sans nom d'élève."
  ],
  "prerequis_technique": "Programme complet de 3e année (séances 1 à 52).",
  "axes": [
   "Sujet complet sur les quatre domaines",
   "Conditions réelles d'épreuve",
   "Barème type examen"
  ],
  "objectifs_cours": [
   "Composer en conditions réelles sur l'ensemble du programme.",
   "Gérer son temps et ses priorités pendant une épreuve de 2 h.",
   "Préparer la correction collective du sujet."
  ]
 },
 "54": {
  "n": 54,
  "titre": "Correction du sujet complet et conseils pour la 4e année",
  "date": "2027-05-20",
  "tri": 3,
  "nature": "correction",
  "domaines": "Évaluation",
  "pages": "—",
  "duree": 120,
  "objectifs": [
   {
    "titre": "Correction du sujet complet",
    "items": [
     "Comprendre le barème du sujet complet et corriger ses erreurs."
    ]
   },
   {
    "titre": "Bilan de l'année par domaine",
    "items": [
     "Faire le bilan de l'année par domaine et par élève."
    ]
   },
   {
    "titre": "Conseils pour la 4e année",
    "items": [
     "Recevoir des conseils de travail pour l'été et pour la 4e année."
    ]
   }
  ],
  "methode": "Les connaissances se construisent et ne s'apprennent pas : le point de départ est l'action, à partir de laquelle l'apprenant engage une réflexion sur les objectifs de la séance.",
  "prerequis": [
   "Bac blanc (séance 53)",
   "programme complet"
  ],
  "criteres": [
   "La 4e année s'appuie sur ce qui est solide : un domaine consolidé vaut mieux que quatre domaines approximatifs.",
   "Produire : Correction guidée du sujet complet, question par question, avec reprise des erreurs les…",
   "Éviter : Ne pas conserver ses fiches et ses exercices corrigés."
  ],
  "etapes": [
   {
    "etape": "Rappel",
    "duree": 10,
    "prof": "Distribuer les copies et rappeler le barème : Les copies et les dossiers du bac blanc sont rendus avec le barème type examen ; deux productions anonymes…",
    "eleves": "• Prennent connaissance de leur note et du barème",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Mise en situation",
    "duree": 10,
    "prof": "Correction guidée du sujet complet, question par question, avec reprise des erreurs les plus coûteuses sur machine.",
    "eleves": "• Corrigent et annotent leur copie • Posent des questions",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Constatations",
    "duree": 85,
    "prof": "Correction commentée au barème ; bilan de l'année par domaine et par élève ; conseils de travail pour l'été ; présentation du programme de 4e année (PHP, PHP–MySQL, préparation du baccalauréat). Exercices de rattrapage : Bilan individuel et collectif de l'année ; conseils personnalisés et présentation du programme de 4e année.",
    "eleves": "• Classent leurs erreurs • Refont les questions échouées",
    "moyens": "Sujet · copies · machine"
   },
   {
    "etape": "Évaluation",
    "duree": 15,
    "prof": "Faire formuler les règles : La 4e année s'appuie sur ce qui est solide : un domaine consolidé vaut mieux que quatre domaines approximatifs.",
    "eleves": "• Recopient les règles • Fixent un objectif personnel",
    "moyens": "Sujet · copies · machine"
   }
  ],
  "maison": "Conserver les fiches de l'année et reprendre pendant l'été le domaine le plus fragile.",
  "trace": "La 4e année s'appuie sur ce qui est solide : un domaine consolidé vaut mieux que quatre domaines approximatifs.",
  "erreurs": [
   "Ne pas conserver ses fiches et ses exercices corrigés.",
   "Arriver en 4e année sans avoir rouvert le SQL."
  ],
  "prerequis_technique": "Bac blanc (séance 53) ; programme complet.",
  "axes": [
   "Correction du sujet complet",
   "Bilan de l'année par domaine",
   "Conseils pour la 4e année"
  ],
  "objectifs_cours": [
   "Comprendre le barème du sujet complet et corriger ses erreurs.",
   "Faire le bilan de l'année par domaine et par élève.",
   "Recevoir des conseils de travail pour l'été et pour la 4e année."
  ]
 }
};
root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.fiches3SI1 = FICHES_3SI1;
})(typeof window !== 'undefined' ? window : globalThis);
