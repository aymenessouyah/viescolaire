/* Contenu du guide du professeur (bouton « Aide »).
   Source unique : l'application affiche ces rubriques et `docs/AIDE-ENSEIGNANT.md`
   en est généré par `tools/aide-md.js` (un test vérifie qu'ils restent identiques).
   Chaque rubrique : id, catégorie, titre, vue (onglet concerné), résumé,
   objectif, étapes, astuces éventuelles. */
(function (root) {
  'use strict';

  root.STI_DATA = root.STI_DATA || {};
  root.STI_DATA.aide = {
    version: 'aide-enseignant-v1',
    titre: 'Guide du professeur',
    intro: 'Cet espace réunit la vie scolaire d’une année : séances et fiches, notions du Smart Book, ' +
      'annexes, élèves, notes, présences, cahier de textes et sauvegardes. Ce guide décrit chaque écran, ' +
      'dans l’ordre où vous l’utiliserez dans l’année. Il est consultable à tout moment par le bouton ' +
      '« Aide » ou la touche F1.',

    categories: [
      { id: 'decouvrir', titre: 'Découvrir la plateforme' },
      { id: 'enseigner', titre: 'Préparer et donner cours' },
      { id: 'eleves', titre: 'Suivre les élèves' },
      { id: 'organiser', titre: 'Organiser l’année' },
      { id: 'donnees', titre: 'Données et sécurité' }
    ],

    sections: [
      {
        id: 'demarrer', categorie: 'decouvrir', titre: 'Premiers pas', vue: 'v-dash', icone: 'home',
        resume: 'Se connecter et faire le tour de l’espace en cinq minutes.',
        objectif: 'Vous devez pouvoir ouvrir une séance, cocher les notions traitées et enregistrer le cahier de textes.',
        etapes: [
          'Ouvrez le bouton « Compte » en haut à droite, puis « Se connecter » et saisissez votre courriel et votre mot de passe.',
          'Dans la barre latérale, vérifiez la classe affichée (3SI1 ou 4SI2) et l’année scolaire 2026-2027.',
          'Allez dans « Suivi des cours », choisissez la séance du jour et cliquez dessus : la fiche de séance s’ouvre.',
          'Cochez les notions réellement traitées, écrivez le contenu, puis cochez « Séance assurée » et enregistrez.',
          'Vérifiez dans « Cahier de textes » que la séance apparaît bien à sa date.'
        ],
        astuces: [
          'Sans connexion, la plateforme s’ouvre en lecture seule : aucun élève, aucune note, aucune donnée personnelle ne s’affiche.',
          'Tout est enregistré dans le navigateur immédiatement ; la sauvegarde en ligne vient ensuite.'
        ]
      },
      {
        id: 'navigation', categorie: 'decouvrir', titre: 'Se repérer dans l’interface', vue: 'v-dash', icone: 'grid',
        resume: 'Barre latérale, barre d’état, barre d’outils et raccourcis.',
        objectif: 'Savoir où se trouvent les onglets, la recherche, les sauvegardes et les impressions.',
        etapes: [
          'La barre latérale regroupe les onglets, classés en « Pilotage » puis dans le groupe « Outils STI & données ».',
          'La barre d’état, sous l’en-tête, affiche la date, le bouton « Rechercher » et l’état de la sauvegarde.',
          'La barre d’outils de l’en-tête contient : compte, sauvegarde Cloud, centre d’impression, export JSON, installation et « Nouvelle séance ».',
          'Le bouton « Aide » (icône point d’interrogation) ouvre ce guide ; la touche F1 ouvre la même fenêtre.',
          'Sur téléphone, le bouton ☰ ouvre la barre latérale.'
        ],
        astuces: ['Sur ordinateur : Ctrl + K pour chercher, F1 pour l’aide, Échap pour fermer une fenêtre.']
      },
      {
        id: 'installation', categorie: 'decouvrir', titre: 'Installer l’application et travailler hors ligne', vue: 'v-dash', icone: 'install',
        resume: 'Ajouter la plateforme à l’écran d’accueil et l’utiliser sans Internet.',
        objectif: 'L’application doit s’ouvrir en plein écran, sans adresse ni barre du navigateur.',
        etapes: [
          'Ouvrez la plateforme dans Chrome, Edge ou Safari.',
          'Sur téléphone : menu du navigateur → « Ajouter à l’écran d’accueil ». Sur ordinateur : icône d’installation dans la barre d’adresse ou bouton « Installer » du menu Compte.',
          'Une fois installée, elle fonctionne hors ligne : les documents et scripts sont mis en cache.',
          'Après une mise à jour du site, un bandeau « Une nouvelle version est prête » apparaît : cliquez sur « Mettre à jour ».'
        ],
        astuces: [
          'Si un ancien écran persiste, utilisez « Forcer la mise à jour » dans le menu Compte (les données locales sont conservées).',
          'Installez l’application sur chaque appareil utilisé, puis connectez-vous sur chacun.'
        ]
      },
      {
        id: 'recherche', categorie: 'decouvrir', titre: 'Recherche globale (Ctrl + K)', icone: 'search',
        resume: 'Retrouver une séance, une notion, une annexe, un élève ou un document en deux mots.',
        objectif: 'Atteindre n’importe quel contenu de la plateforme sans connaître son onglet.',
        etapes: [
          'Appuyez sur Ctrl + K (⌘ + K sur Mac) ou cliquez sur « Rechercher » dans la barre d’état.',
          'Tapez quelques lettres : les accents et les majuscules n’ont pas d’importance.',
          'Utilisez ↑ et ↓ pour parcourir les résultats, Entrée pour ouvrir, Échap pour fermer.',
          'Un résultat de type Notion ouvre l’onglet « Suivi des notions » sur la fiche concernée ; un résultat Élève mène à sa classe.'
        ],
        astuces: ['La recherche couvre aussi les 234 éléments des annexes et les 631 notions des deux livres.']
      },

      {
        id: 'tableau-bord', categorie: 'enseigner', titre: 'Tableau de bord', vue: 'v-dash', icone: 'home',
        resume: 'La photographie de l’année : prochaine séance, avancement, alertes du calendrier.',
        objectif: 'Voir en un écran où vous en êtes et ce qui arrive.',
        etapes: [
          'La carte « Prochaine séance » indique la date, la classe et le contenu prévu.',
          'Les compteurs résument la couverture des notions par classe et les séances restantes.',
          'Les alertes signalent les vacances, jours fériés, devoirs de contrôle et devoirs de synthèse à venir.',
          'La carte de sauvegarde rappelle la date du dernier enregistrement local ou distant.'
        ],
        astuces: ['Cliquez sur la date d’une séance pour ouvrir directement sa fiche.']
      },
      {
        id: 'seances', categorie: 'enseigner', titre: 'Suivi des cours et fiches de séance', vue: 'v-cours', icone: 'list',
        resume: 'Ouvrir la séance du jour, écrire son contenu, cocher les notions et les annexes.',
        objectif: 'Chaque séance donnée doit être marquée « assurée » avec son contenu et ses notions.',
        etapes: [
          'Choisissez la classe, puis repérez la séance par sa date dans la liste.',
          'Cliquez sur la séance : la fenêtre de fiche s’ouvre (titre, préparation, contenu, devoirs, observations).',
          'Le panneau « Notions utilisées » propose les notions prévues par la répartition ; décochez celles qui n’ont pas été traitées.',
          'Le panneau des annexes permet de cocher les éléments des cinq annexes réellement mobilisés.',
          'Cochez « Séance assurée » une fois la séance faite, puis « Enregistrer ».',
          'Le bouton « Nouvelle séance » de l’en-tête ouvre une fiche vierge.'
        ],
        astuces: [
          'Tant que « Séance assurée » n’est pas cochée, les notions restent « prévues » et ne comptent pas dans la couverture.',
          'Le bouton d’export CSV du suivi produit un tableau de couverture à ouvrir dans un tableur.'
        ]
      },
      {
        id: 'fiche', categorie: 'enseigner', titre: 'Fiche pédagogique imprimable', vue: 'v-fiche', icone: 'book',
        resume: 'La fiche de préparation détaillée, prête à imprimer ou à projeter.',
        objectif: 'Disposer d’une fiche de cours complète, avec objectifs, déroulé et supports.',
        etapes: [
          'Choisissez la classe et le bloc ou la séance.',
          'Vérifiez les objectifs, les notions associées et les annexes proposées.',
          'Utilisez « Imprimer » pour obtenir la fiche au format papier ou PDF.',
          'Le centre d’impression de l’en-tête permet d’imprimer plusieurs fiches d’un coup.'
        ],
        astuces: ['Les fiches fournies dans le dépôt sont des bases de travail : adaptez-les à votre progression réelle.']
      },
      {
        id: 'avancement', categorie: 'enseigner', titre: 'Avancement des cours', vue: 'v-avancement', icone: 'target',
        resume: 'Où en est chaque classe, domaine par domaine.',
        objectif: 'Comparer la progression réelle avec la répartition prévue.',
        etapes: [
          'Choisissez la classe.',
          'Lisez la progression par domaine (HTML5, CSS3, JavaScript, SQL / BD, Systèmes, Réseaux, IoT).',
          'Repérez les domaines en retard et les séances non confirmées.',
          'Utilisez la recherche globale ou « Suivi des notions » pour ajuster les coches.'
        ],
        astuces: ['Les pourcentages portent sur le référentiel du livre (298 notions en 3SI1, 333 en 4SI2).']
      },
      {
        id: 'devoirs', categorie: 'enseigner', titre: 'Répartition des devoirs', vue: 'v-devoirs', icone: 'pen',
        resume: 'Devoirs de contrôle et de synthèse placés sur l’année.',
        objectif: 'Éviter les chevauchements et annoncer les dates aux élèves.',
        etapes: [
          'Consultez les devoirs de contrôle (DC) et de synthèse (DS) proposés pour chaque classe.',
          'Vérifiez les dates avec le calendrier officiel et vos conseils de classe.',
          'Ajustez si nécessaire vos épreuves dans « Mes classes & élèves » → « Épreuves & notes ».'
        ],
        astuces: ['Le bouton « Pré-remplir DC / DS officiels » crée les épreuves aux dates du calendrier.']
      },
      {
        id: 'notions', categorie: 'enseigner', titre: 'Suivi des notions du Smart Book', vue: 'v-suivi', icone: 'target',
        resume: 'Les 298 notions 3SI1 et 333 notions 4SI2, avec leurs pages et leur état.',
        objectif: 'Savoir exactement quelles notions sont abordées, prévues ou encore à traiter.',
        etapes: [
          'Choisissez la classe et filtrez par domaine ou par état (abordée, prévue, à aborder).',
          'Cliquez sur une notion pour voir son détail : description, pages, séances où elle apparaît.',
          'Cochez les notions depuis la fiche de séance : c’est là que le suivi se met à jour.',
          'Le compteur par domaine, en haut, indique la couverture de chacun.'
        ],
        astuces: [
          'La recherche interne de cet écran filtre le référentiel ; Ctrl + K le fait depuis n’importe où.',
          'Les notions issues des encadrés « Complément » du livre sont signalées.'
        ]
      },
      {
        id: 'annexes', categorie: 'enseigner', titre: 'Annexes et mémo', vue: 'v-ref', icone: 'book',
        resume: 'Les cinq annexes (HTML5, CSS3, JavaScript, PHP, SQL) et le mémo consolidé.',
        objectif: 'Retrouver rapidement la bonne fiche d’annexe à distribuer ou à projeter.',
        etapes: [
          'Choisissez « Mémo consolidé » (contenu réorganisé par compétence) ou « Annexes intégrales ».',
          'Utilisez le champ de recherche pour filtrer les 234 éléments.',
          'Le panneau de couverture indique les éléments déjà abordés, prévus ou restants.',
          'Les documents PDF de référence sont accessibles depuis la même page.'
        ],
        astuces: ['Une annexe cochée dans une fiche de séance compte automatiquement dans la couverture.']
      },
      {
        id: 'programme', categorie: 'enseigner', titre: 'Programme et compétences', vue: 'v-prog', icone: 'target',
        resume: 'Les compétences officielles reliées aux savoirs, aux annexes et aux séances.',
        objectif: 'Préparer une progression conforme au programme et aux attendus.',
        etapes: [
          'Choisissez la classe.',
          'Ouvrez une compétence pour voir ses savoirs associés, ses annexes et ses séances.',
          'Utilisez les liens vers l’aide pédagogique et les annexes PDF.'
        ],
        astuces: ['La plateforme propose ; c’est vous qui vérifiez la conformité au programme officiel.']
      },
      {
        id: 'agent', categorie: 'enseigner', titre: 'Agent Vie Scolaire AI', vue: 'v-agent', icone: 'cpu',
        resume: 'Un assistant pour préparer fiches, exercices, corrections et répartitions.',
        objectif: 'Gagner du temps sur la préparation, sans jamais publier de données d’élèves.',
        etapes: [
          'Ouvrez « Agent Vie Scolaire AI » et choisissez le type de document (fiche, exercices, correction, répartition).',
          'Décrivez la classe, le thème et les contraintes, puis lancez la génération.',
          'Relisez le résultat, corrigez-le : rien n’est enregistré sans votre validation explicite.',
          'Une copie photographiée est d’abord transcrite ; les incertitudes sont signalées avant correction.',
          'La génération IA nécessite une fonction Supabase configurée ; sans elle, l’agent reste un espace de rédaction local.'
        ],
        astuces: [
          'N’envoyez jamais de nom d’élève, de note ou de copie nominative à l’assistant.',
          'Documents libres : texte collé, TXT, Markdown et HTML uniquement (pas de PDF ni de Word).'
        ]
      },

      {
        id: 'eleves', categorie: 'eleves', titre: 'Mes classes et élèves', vue: 'v-eleves', icone: 'users',
        resume: 'Créer les classes, saisir les élèves, gérer les groupes et les numéros de PC.',
        objectif: 'Disposer d’une liste à jour pour l’appel, les notes et les bulletins.',
        etapes: [
          'Ouvrez « Mes classes & élèves » puis l’onglet « Élèves ».',
          'Ajoutez un élève (nom, prénom, groupe, numéro de PC) ou importez un fichier CSV.',
          'Vérifiez les groupes : les séances sont communes, mais les groupes servent aux TP.',
          'Exportez la liste en CSV pour la partager ou l’archiver.'
        ],
        astuces: [
          'Les noms saisis en arabe sont conservés et affichés à côté du nom latin.',
          'Les données d’élèves sont privées : elles ne sont visibles que sur votre compte.'
        ]
      },
      {
        id: 'presences', categorie: 'eleves', titre: 'Appel et présences', vue: 'v-eleves', icone: 'check',
        resume: 'Pointer la classe en quelques secondes, y compris à la voix.',
        objectif: 'Tenir un relevé d’assiduité fiable pour chaque séance.',
        etapes: [
          'Ouvrez « Mes classes & élèves » → onglet « Présences », puis choisissez la date.',
          'Cliquez sur le statut d’un élève pour le faire défiler : présent, absent, exclu, sorti, entrée par billet, retard.',
          '« Tous présents » remplit la séance, « Vider » efface le pointage du jour.',
          'Le bouton de dictée permet d’annoncer les états à voix haute (« Ahmed absent », « billet pour Youssef »).'
        ],
        astuces: [
          'Le compteur du bas résume présents, absents et autres états de la séance.',
          'Les absences apparaissent dans le bilan de trimestre et dans les bulletins.'
        ]
      },
      {
        id: 'notes', categorie: 'eleves', titre: 'Épreuves, notes et bulletins', vue: 'v-eleves', icone: 'pen',
        resume: 'Créer une épreuve, saisir les notes, éditer les bulletins.',
        objectif: 'Calculer les moyennes et produire les bulletins du trimestre.',
        etapes: [
          'Onglet « Épreuves & notes » : créez une épreuve (titre, type, date, barème, notions évaluées).',
          'Saisissez les notes élève par élève, ou importez-les depuis un CSV.',
          'Cochez « absent » plutôt que 0 lorsqu’un élève n’a pas composé.',
          'Onglet « Bulletins » : choisissez le trimestre, vérifiez les moyennes et imprimez.',
          'Onglet « Points faibles » : repérez les notions les moins réussies pour remédier.'
        ],
        astuces: [
          'Renseigner les notions évaluées dans l’épreuve alimente automatiquement l’analyse des points faibles.',
          'Les notes restent dans votre navigateur et dans votre sauvegarde : aucune note n’est publiée automatiquement.'
        ]
      },
      {
        id: 'competences-eleves', categorie: 'eleves', titre: 'Compétences des élèves', vue: 'v-eleves', icone: 'target',
        resume: 'Évaluer chaque élève par compétence officielle, trimestre par trimestre.',
        objectif: 'Suivre les acquis individuels et préparer le conseil de classe.',
        etapes: [
          'Onglet « Compétences », choisissez le trimestre puis l’élève.',
          'Pour chaque compétence, choisissez : acquis, en cours, à renforcer (ou laissez vide).',
          'La synthèse du bas agrège les états de toute la classe.',
          'Retrouvez la même synthèse, prête à imprimer, dans « Bilan & données ».'
        ],
        astuces: ['Un état vide signifie « non évaluée » : il n’est pas compté comme un échec.']
      },
      {
        id: 'bilan', categorie: 'eleves', titre: 'Bilan de fin de trimestre', vue: 'v-bilan', icone: 'check',
        resume: 'La synthèse prête pour le conseil de classe, imprimable en PDF.',
        objectif: 'Présenter en une page l’assiduité, la couverture du programme et les résultats de la classe.',
        etapes: [
          'Ouvrez « Bilan & données », choisissez la classe et le trimestre.',
          'Lisez les compteurs : séances assurées, notions vues, moyenne de classe, absences, élèves à suivre.',
          'Consultez le détail par domaine, les compétences et le tableau des élèves à suivre.',
          'Cliquez sur « Imprimer / PDF » pour obtenir la feuille du conseil de classe.'
        ],
        astuces: [
          'Aucun calcul n’est enregistré : le bilan est recalculé à chaque affichage, il suit donc vos dernières saisies.',
          'Les élèves sont signalés au-delà de seuils explicites (moyenne < 10, 3 absences, 2 compétences à renforcer).'
        ]
      },

      {
        id: 'edt', categorie: 'organiser', titre: 'Emploi du temps', vue: 'v-edt', icone: 'clock',
        resume: 'Les créneaux des deux classes, modifiables et enregistrés.',
        objectif: 'Afficher l’emploi du temps réel, y compris après un changement d’horaires.',
        etapes: [
          'Vérifiez les créneaux de chaque classe (3SI1 : mardi et jeudi ; 4SI2 : lundi et vendredi).',
          'Modifiez un horaire si l’établissement change la grille.',
          'Les séances du calendrier et du cahier suivent ces créneaux.'
        ],
        astuces: ['Chaque journée comporte deux groupes de deux heures : huit heures par semaine et par classe.']
      },
      {
        id: 'calendrier', categorie: 'organiser', titre: 'Calendrier tunisien', vue: 'v-cal', icone: 'calendar',
        resume: 'Rentrée, vacances, jours fériés, devoirs et conseils de classe.',
        objectif: 'Planifier sans tomber sur un jour férié ou une période de vacances.',
        etapes: [
          'Parcourez l’année 2026-2027 : rentrée le 15 septembre 2026, fin le 30 juin 2027.',
          'Repérez les vacances, les jours fériés et les périodes de devoirs.',
          'Les dates religieuses dépendant de l’observation lunaire sont signalées « à confirmer ».',
          'Le calendrier peut être exporté pour l’ajouter à votre agenda.'
        ],
        astuces: ['Les séances ne sont jamais générées un jour férié ou pendant les vacances.']
      },
      {
        id: 'repartition', categorie: 'organiser', titre: 'Répartition annuelle', vue: 'v-rep', icone: 'list',
        resume: 'La progression par blocs, trimestre par trimestre.',
        objectif: 'Suivre le plan de l’année et savoir ce qui reste à faire.',
        etapes: [
          'Choisissez la classe et le trimestre.',
          'Lisez les blocs dans l’ordre, avec leur durée et les notions associées.',
          'Le compteur du haut indique les séances restantes à planifier.',
          'Les blocs peuvent être ouverts pour créer la fiche de séance correspondante.'
        ],
        astuces: ['Ne renumérotez pas les séances : les fiches déjà enregistrées sont rattachées à leur numéro.']
      },
      {
        id: 'cahier', categorie: 'organiser', titre: 'Cahier de textes', vue: 'v-cahier', icone: 'pen',
        resume: 'Le relevé chronologique des séances, avec signature du professeur.',
        objectif: 'Produire un cahier de textes présentable, à imprimer ou à faire viser.',
        etapes: [
          'Choisissez la classe et la période.',
          'Vérifiez le contenu de chaque séance : titre, contenu, devoirs, observations.',
          'Ajoutez votre signature manuscrite depuis « Compte » → « Profil » (elle est répétée à la fin de chaque journée).',
          'Utilisez le centre d’impression pour générer le cahier en PDF.'
        ],
        astuces: ['Les séances non confirmées restent visibles mais signalées : parfait pour repérer un oubli.']
      },
      {
        id: 'impression', categorie: 'organiser', titre: 'Imprimer et exporter', icone: 'print',
        resume: 'Centre d’impression, PDF et exports CSV / JSON.',
        objectif: 'Obtenir un document papier ou un fichier sans passer par un autre logiciel.',
        etapes: [
          'Le bouton imprimante de l’en-tête ouvre le centre d’impression (fiches, répartitions, cahier de textes).',
          'Choisissez le document et les filtres, puis lancez l’impression ; « Enregistrer au format PDF » est proposé par le navigateur.',
          'Dans « Mes classes & élèves », les boutons d’export produisent des CSV lisibles dans un tableur.',
          'Le bouton d’export JSON de l’en-tête enregistre tout l’espace dans un fichier unique.'
        ],
        astuces: ['Sur mobile, l’impression PDF passe par le partage du navigateur : choisissez « Imprimer » puis « Enregistrer en PDF ».']
      },
      {
        id: 'carte', categorie: 'organiser', titre: 'Carte de visite du site', vue: 'v-carte', icone: 'web',
        resume: 'Partager l’adresse de la plateforme avec un QR code.',
        objectif: 'Faire découvrir l’espace pédagogique à un collègue ou en salle des professeurs.',
        etapes: [
          'Ouvrez l’onglet « Carte de visite ».',
          'Imprimez la carte, téléchargez le PDF, le PNG ou le SVG.',
          'Le bouton « Partager l’adresse » copie le lien de la plateforme.'
        ],
        astuces: ['La carte ne contient aucune donnée personnelle : uniquement le nom du site et son adresse.']
      },

      {
        id: 'sauvegarde', categorie: 'donnees', titre: 'Sauvegarde locale, Cloud et Google Drive', icone: 'cloud',
        resume: 'Où sont vos données, quand partent-elles, comment les retrouver.',
        objectif: 'Ne jamais perdre une saisie et savoir restaurer un appareil.',
        etapes: [
          'Chaque modification est d’abord enregistrée dans ce navigateur (sauvegarde locale immédiate).',
          'Si la base Cloud est configurée et que vous êtes connecté, les données partent vers Supabase et se synchronisent entre appareils.',
          '« Recevoir et fusionner » récupère les données d’un autre appareil sans écraser vos saisies récentes.',
          'La sauvegarde Google Drive crée, après votre accord, une copie datée dans votre propre Drive.',
          'En cas de doute, exportez le JSON avant toute manipulation importante.'
        ],
        astuces: [
          'Un appareil non connecté reste utilisable : les modifications repartiront à la prochaine connexion.',
          'Aucune donnée n’est envoyée tant que vous n’avez pas accepté la sauvegarde en ligne.'
        ]
      },
      {
        id: 'profil', categorie: 'donnees', titre: 'Profil, badge et signature', icone: 'users',
        resume: 'Votre nom, votre matière, votre photo et votre signature manuscrite.',
        objectif: 'Des documents à votre nom, signés, sans ressaisie.',
        etapes: [
          'Ouvrez « Compte » → « Profil ».',
          'Renseignez le nom, la fonction et la discipline affichés sur les documents.',
          'Ajoutez une photo (JPEG, PNG ou WebP) pour le badge du professeur.',
          'Dessinez votre signature : elle apparaîtra au bas du cahier de textes.',
          'Enregistrez : le profil est repris partout dans la plateforme.'
        ],
        astuces: ['La photo et la signature restent privées, dans votre compte.']
      },
      {
        id: 'controle', categorie: 'donnees', titre: 'Contrôle des données et sauvegarde JSON', vue: 'v-bilan', icone: 'shield',
        resume: 'Détecter une incohérence et sauvegarder ou restaurer tout l’espace.',
        objectif: 'Garder des données cohérentes et pouvoir tout réinstaller en un fichier.',
        etapes: [
          'En bas de « Bilan & données », lisez le contrôle : fiches orphelines, identifiants inconnus, doublons, notes rattachées à une épreuve supprimée, appels hors séance.',
          'Chaque point indique combien d’éléments sont concernés et lesquels.',
          '« Exporter le JSON complet » télécharge un fichier daté contenant tout l’espace et le rapport de contrôle.',
          '« Importer un JSON… » relit le fichier, affiche un aperçu, puis ne remplace vos données qu’après confirmation.'
        ],
        astuces: [
          'Un point « À vérifier » n’est pas forcément une erreur : c’est souvent une trace d’une suppression volontaire.',
          'Conservez un export par trimestre : c’est la meilleure assurance.'
        ]
      },
      {
        id: 'confidentialite', categorie: 'donnees', titre: 'Données des élèves et confidentialité', icone: 'lock',
        resume: 'Ce qui reste privé, ce qui peut sortir, et ce qu’il ne faut jamais envoyer.',
        objectif: 'Utiliser la plateforme sans exposer les données personnelles des élèves.',
        etapes: [
          'Les classes, élèves, notes, présences et bulletins ne s’affichent que sur votre compte connecté.',
          'Aucune note n’est publiée ni transmise automatiquement : vous validez chaque document.',
          'L’assistant IA ne doit recevoir ni nom d’élève, ni note nominative, ni copie identifiable.',
          'Les exports CSV et JSON restent sous votre responsabilité : stockez-les dans un espace protégé.',
          'La politique de confidentialité complète est accessible depuis le pied de page.'
        ],
        astuces: ['Sur un poste partagé, déconnectez-vous et évitez d’enregistrer le mot de passe dans le navigateur.']
      },
      {
        id: 'raccourcis', categorie: 'donnees', titre: 'Raccourcis clavier', icone: 'code',
        resume: 'Les gestes qui font gagner du temps.',
        objectif: 'Travailler plus vite sans chercher dans les menus.',
        etapes: [
          'Ctrl + K ou ⌘ + K : recherche globale.',
          'F1 ou ? : ouvrir ou fermer ce guide.',
          'Échap : fermer la fenêtre ouverte (fiche, aide, recherche).',
          '↑ et ↓ puis Entrée : parcourir et ouvrir un résultat de recherche.'
        ],
        astuces: ['Dans le champ de recherche, Ctrl + K relance la palette sur un nouveau mot.']
      },
      {
        id: 'depannage', categorie: 'donnees', titre: 'Dépannage et questions fréquentes', icone: 'alert',
        resume: 'Les problèmes courants et leur solution.',
        objectif: 'Se débloquer seul avant de perdre du temps.',
        etapes: [
          'Un écran vide ou ancien : menu Compte → « Forcer la mise à jour » (les données restent enregistrées).',
          'Les données n’apparaissent plus : vérifiez que vous êtes connecté au bon compte, puis « Recevoir et fusionner ».',
          'Un bandeau de version apparaît : le fichier de l’application est plus ancien que la page, appliquez la mise à jour.',
          'Une impression coupe le tableau : choisissez l’orientation paysage ou réduisez les marges dans la fenêtre d’impression.',
          'Un point d’intégrité persiste : ouvrez le contrôle des données, notez la clé concernée et corrigez depuis l’écran cité.'
        ],
        astuces: ['Avant toute manipulation risquée, exportez le JSON complet : il contient tout.']
      }
    ],

    faq: [
      {
        q: 'La plateforme peut-elle fonctionner sans Internet ?',
        r: 'Oui. Une fois ouverte, elle est mise en cache et reste utilisable hors ligne ; les sauvegardes en ligne reprennent à la reconnexion.'
      },
      {
        q: 'Où sont enregistrées mes notes et mes élèves ?',
        r: 'Dans votre navigateur d’abord, puis dans votre espace Cloud si la synchronisation est configurée et que vous êtes connecté. Vous pouvez à tout moment exporter un fichier JSON complet.'
      },
      {
        q: 'Puis-je utiliser la plateforme sur plusieurs appareils ?',
        r: 'Oui : connectez-vous sur chaque appareil avec le même compte, puis utilisez « Recevoir et fusionner » pour récupérer les dernières saisies.'
      },
      {
        q: 'L’assistant IA remplace-t-il ma préparation ?',
        r: 'Non. Il propose des brouillons que vous relisez et corrigez ; rien n’est enregistré sans votre validation, et aucune donnée d’élève ne doit lui être transmise.'
      },
      {
        q: 'Que faire avant de changer d’ordinateur ?',
        r: 'Exportez le JSON complet depuis l’en-tête ou depuis « Bilan & données », puis importez-le sur le nouvel appareil après connexion.'
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
