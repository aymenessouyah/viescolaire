/* Établissement, classes, emploi du temps et calendrier scolaire tunisien 2026-2027.
   Fichier de données — modifiable sans toucher au code de l'application.
   Sauvegarde distante / versionnement : voir README.md */
(function (root) {
'use strict';
const SCHOOL = {
  prof: "Aymen Essouyah",
  lycee: "Lycée Rafèha Ariana",
  matiere: "Systèmes & Technologies de l'Informatique (STI)",
  annee: "2026 - 2027",
  rentreeProfs: "2026-09-14",
  rentreeEleves: "2026-09-15",
  finAnnee: "2027-06-30"
};

/* Classes : jours de séance (0=dim … 6=sam), 2 h par séance et par groupe */
const CLASSES = {
  "3SI1": { short:"3SI1", long:"3<sup>ème</sup> année Sciences de l'Informatique — groupe 1", days:[2,4], dayTxt:"Mardi & Jeudi", heures:2, groupes:2, fin:"2027-05-29",
            note:"Classe de 3<sup>ème</sup> SI (matière STI) — mardi de 8 h à 12 h et jeudi de 13 h à 17 h, deux groupes de 2 h par jour. Période d'enseignement calculée jusqu'à la semaine bloquée de fin mai 2027 ; le mois de juin est consacré aux épreuves nationales, aux corrections et aux conseils de classe." },
  "4SI2": { short:"4SI2", long:"4<sup>ème</sup> année Sciences de l'Informatique — groupe 2", days:[1,5], dayTxt:"Lundi & Vendredi", heures:2, groupes:2, fin:"2027-05-15",
            note:"Classe de 4<sup>ème</sup> SI (matière STI) — lundi et vendredi de 8 h à 12 h, deux groupes de 2 h par jour ; la session du Baccalauréat se déroule en juin 2027." }
};

/* Horaires hebdomadaires réels : pour chaque jour de cours, les 2 créneaux de 2 h (un par groupe) */
const HORAIRES_DEFAUT = {
  "3SI1": {
    2: [ { g:"Groupe 1", s:"08:00", e:"10:00" }, { g:"Groupe 2", s:"10:00", e:"12:00" } ],
    4: [ { g:"Groupe 1", s:"13:00", e:"15:00" }, { g:"Groupe 2", s:"15:00", e:"17:00" } ]
  },
  "4SI2": {
    1: [ { g:"Groupe 1", s:"08:00", e:"10:00" }, { g:"Groupe 2", s:"10:00", e:"12:00" } ],
    5: [ { g:"Groupe 1", s:"08:00", e:"10:00" }, { g:"Groupe 2", s:"10:00", e:"12:00" } ]
  }
};

/* Calendrier scolaire officiel tunisien — année 2026-2027 (ministère de l'Éducation) */
const VACANCES = [
  { label:"Vacances de mi-trimestre 1", from:"2026-10-26", to:"2026-11-01" },
  { label:"Vacances d'hiver",           from:"2026-12-14", to:"2026-12-27" },
  { label:"Vacances de mi-trimestre 2", from:"2027-02-01", to:"2027-02-07" },
  { label:"Vacances de printemps",      from:"2027-03-15", to:"2027-03-28" }
];
const FERIES = [
  { date:"2026-10-15", label:"Fête de l'Évacuation" },
  { date:"2026-12-17", label:"Fête de la Révolution et de la Jeunesse (pendant les vacances d'hiver)" },
  { date:"2027-01-01", label:"Jour de l'An" },
  { date:"2027-03-20", label:"Fête de l'Indépendance (pendant les vacances de printemps)" },
  { date:"2027-04-09", label:"Fête des Martyrs" },
  { date:"2027-05-01", label:"Fête du Travail" }
];
/* Fêtes religieuses : dates fixées par l'observation lunaire */
const A_CONFIRMER = [
  { label:"Aïd el-Fitr (Aïd el-Sghir)", periode:"autour du 19 - 21 mars 2027", note:"chevauchant les vacances de printemps" },
  { label:"Aïd el-Idha (Aïd el-Kébir)", periode:"autour du 16 - 18 mai 2027", note:"période de suspension des cours du 3<sup>e</sup> trimestre" },
  { label:"Ras El Am El Hijri (Nouvel An hégirien)", periode:"juin 2027", note:"date fixée en temps opportun par les autorités religieuses" },
  { label:"Mouled (Mawlid an-Nabi)", periode:"septembre 2026", note:"tombant avant la rentrée des élèves" },
  { label:"Baccalauréat — session principale 2027", periode:"juin 2027", note:"épreuves écrites, calendrier publié par le ministère" }
];
/* Périodes de suspension des cours (semaines bloquées) */
const SUSPENSIONS = [
  { from:"2026-12-07", to:"2026-12-12", label:"Suspension des cours — devoirs de synthèse du 1<sup>er</sup> trimestre" },
  { from:"2027-03-04", to:"2027-03-13", label:"Suspension des cours — devoirs de synthèse du 2<sup>e</sup> trimestre" },
  { from:"2027-05-24", to:"2027-05-29", label:"Suspension des cours — devoirs de synthèse du 3<sup>e</sup> trimestre (3SI1)" , classes:["3SI1"] }
];
/* Jalons officiels — régime de la « surveillance continue » 2026-2027 */
const JALONS = [
  { date:"2026-09-14", type:"info",  label:"Pré-rentrée des enseignants", s:"Prise de service dans les établissements" },
  { date:"2026-09-15", type:"start", label:"Rentrée des élèves — début des cours", s:"Début de l'année scolaire 2026-2027" },
  { date:"2026-10-15", type:"hol",   label:"Fête de l'Évacuation", s:"Jour férié — séance de 3SI1 reportée (jeudi)" },
  { from:"2026-10-26", to:"2026-11-01", type:"vac", label:"Vacances de mi-trimestre 1", s:"Reprise des cours le lundi 2 novembre 2026" },
  { date:"2026-11-21", type:"eval",  label:"Devoirs de contrôle du 1<sup>er</sup> trimestre — dernier délai", s:"Épreuves écrites et corrections" },
  { from:"2026-11-23", to:"2026-12-05", type:"eval", label:"Devoirs de synthèse du 1<sup>er</sup> trimestre", s:"Pendant le déroulement normal des cours" },
  { from:"2026-12-07", to:"2026-12-12", type:"bloc", label:"Semaine bloquée — devoirs de synthèse du 1<sup>er</sup> trimestre", s:"Suspension des cours et épreuves" },
  { from:"2026-12-14", to:"2026-12-27", type:"vac", label:"Vacances d'hiver", s:"Reprise des cours le lundi 28 décembre 2026" },
  { from:"2026-12-28", to:"2027-01-02", type:"eval", label:"Correction et remise des devoirs de synthèse (T1)", s:"Remise des copies aux élèves" },
  { date:"2027-01-02", type:"admin", label:"Saisie des notes du 1<sup>er</sup> trimestre", s:"Plateforme de la vie scolaire" },
  { from:"2027-01-06", to:"2027-01-09", type:"admin", label:"Conseils de classe — 1<sup>er</sup> trimestre", s:"" },
  { from:"2027-02-01", to:"2027-02-07", type:"vac", label:"Vacances de mi-trimestre 2", s:"Reprise des cours le lundi 8 février 2027" },
  { date:"2027-02-20", type:"eval",  label:"Devoirs de contrôle du 2<sup>e</sup> trimestre — dernier délai", s:"Épreuves écrites et corrections" },
  { from:"2027-02-22", to:"2027-03-03", type:"eval", label:"Devoirs de synthèse du 2<sup>e</sup> trimestre", s:"Pendant le déroulement normal des cours" },
  { from:"2027-03-04", to:"2027-03-13", type:"bloc", label:"Semaine bloquée — devoirs de synthèse du 2<sup>e</sup> trimestre", s:"Suspension des cours ; chevauche l'Aïd el-Fitr" },
  { from:"2027-03-15", to:"2027-03-28", type:"vac", label:"Vacances de printemps", s:"Inclut la Fête de l'Indépendance (20 mars)" },
  { from:"2027-03-29", to:"2027-04-03", type:"eval", label:"Correction et remise des devoirs de synthèse (T2)", s:"" },
  { date:"2027-04-03", type:"admin", label:"Saisie des notes du 2<sup>e</sup> trimestre", s:"" },
  { from:"2027-04-06", to:"2027-04-10", type:"admin", label:"Conseils de classe — 2<sup>e</sup> trimestre", s:"" },
  { date:"2027-04-09", type:"hol",   label:"Fête des Martyrs", s:"Jour férié — séance de 4SI2 non assurée (vendredi)" },
  { date:"2027-04-30", type:"eval",  label:"4SI2 — dernier délai des devoirs de contrôle (T3)", s:"Classes de 4<sup>ème</sup> année secondaire" },
  { date:"2027-05-01", type:"hol",   label:"Fête du Travail", s:"Jour férié (samedi)" },
  { date:"2027-05-08", type:"eval",  label:"3SI1 — dernier délai des devoirs de contrôle (T3)", s:"1<sup>re</sup>, 2<sup>e</sup> et 3<sup>e</sup> années secondaires" },
  { from:"2027-05-05", to:"2027-05-12", type:"bloc", label:"4SI2 — devoirs de synthèse du 3<sup>e</sup> trimestre", s:"Épreuves (5, 6, 7, 10, 11 et 12 mai 2027)" },
  { from:"2027-05-10", to:"2027-05-22", type:"eval", label:"3SI1 — devoirs de synthèse du 3<sup>e</sup> trimestre", s:"Pendant le déroulement normal des cours" },
  { from:"2027-05-24", to:"2027-05-29", type:"bloc", label:"3SI1 — semaine bloquée du 3<sup>e</sup> trimestre", s:"Suspension des cours ; coïncide avec l'Aïd el-Idha" },
  { from:"2027-06-10", to:"2027-06-11", type:"eval", label:"3SI1 — correction et remise des devoirs de synthèse", s:"" },
  { date:"2027-06-12", type:"admin", label:"Saisie des notes du 3<sup>e</sup> trimestre", s:"" },
  { from:"2027-06-24", to:"2027-06-26", type:"admin", label:"Conseils de classe — 3<sup>e</sup> trimestre", s:"" },
  { date:"2027-06-30", type:"end",   label:"Clôture de l'année scolaire", s:"Fin de l'année scolaire pour les élèves" }
];
/* Devoirs de synthèse n°1 : semaine bloquée du 7 au 12 décembre 2026 */
const DS1 = {
  "3SI1": { dates:["2026-12-08","2026-12-10"], main:"2026-12-08" },
  "4SI2": { dates:["2026-12-07","2026-12-11"], main:"2026-12-07" }
};

const MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MOIS_S = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const JOURS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const JOURS_S = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];

const REFERENCE = { SCHOOL, CLASSES, HORAIRES_DEFAUT, VACANCES, FERIES, A_CONFIRMER, SUSPENSIONS, JALONS, DS1, MOIS, MOIS_S, JOURS, JOURS_S };
root.STI_DATA = root.STI_DATA || {};
root.STI_DATA.reference = REFERENCE;
})(typeof window !== 'undefined' ? window : globalThis);
