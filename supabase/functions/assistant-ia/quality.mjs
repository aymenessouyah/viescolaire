// DeepSeek JSON Schemas and provider-neutral deterministic result checks.
// This module is deliberately free of Deno and provider calls so its rules can be
// exercised locally in Node tests as well as in the Edge Function.

const schemaString = { type: "string" };
const schemaNumber = { type: "number" };
const schemaInteger = { type: "integer" };
const schemaStringArray = { type: "array", items: schemaString };
const schemaArray = items => ({ type: "array", items });
const schemaObject = properties => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
const schemaEnum = values => ({ type: "string", enum: values });

export const DEEPSEEK_RESPONSE_SCHEMAS = {
  fiche: schemaObject({
    titre: schemaString, objectifs: schemaStringArray, prerequis: schemaStringArray,
    deroulement: schemaArray(schemaObject({
      phase: schemaString, duree: schemaString, activite_enseignant: schemaString,
      activite_eleve: schemaString, trace: schemaString,
    })),
    notions: schemaStringArray, competences: schemaStringArray, travail_maison: schemaString,
    supports: schemaStringArray, evaluation: schemaString, remediation: schemaString,
  }),
  exercices: schemaObject({
    titre: schemaString, format: schemaString, duree: schemaString, bareme_total: schemaString,
    introduction: schemaString, notions: schemaStringArray,
    exercices: schemaArray(schemaObject({
      titre: schemaString, points: schemaString, enonce: schemaString,
      questions: schemaArray(schemaObject({ enonce: schemaString, bareme: schemaString })),
      correction: schemaString,
    })),
    competences: schemaStringArray,
  }),
  correction: schemaObject({
    note: schemaNumber, sur: schemaNumber, confiance: schemaEnum(["haute", "moyenne", "faible"]),
    questions: schemaArray(schemaObject({
      question: schemaString, points_attribues: schemaNumber, points_max: schemaNumber,
      justification: schemaString, erreurs: schemaStringArray, elements_corrects: schemaStringArray,
    })),
    appreciation: schemaString, remediation: schemaStringArray,
    transcription_incertaine: schemaStringArray, limites_analyse: schemaStringArray,
  }),
  transcription: schemaObject({
    transcription: schemaString, transcription_incertaine: schemaStringArray,
    confiance_globale: schemaEnum(["haute", "moyenne", "faible"]), pages_lues: schemaInteger,
  }),
  bareme: schemaObject({
    titre: schemaString, type_devoir: schemaEnum(["théorique", "pratique"]), total: schemaNumber,
    criteres: schemaArray(schemaObject({ question: schemaString, points: schemaNumber, criteres: schemaStringArray })),
    regles: schemaStringArray,
  }),
  cahier: schemaObject({
    titre: schemaString, contenu: schemaString, notions: schemaStringArray,
    travail_maison: schemaString, observations: schemaString, points_a_reprendre: schemaString,
  }),
  repartition: schemaObject({
    titre: schemaString, avertissements: schemaStringArray,
    seances: schemaArray(schemaObject({
      numero: schemaInteger, date: schemaString, titre: schemaString, domaine: schemaString,
      type: schemaString, objectif: schemaString, travail_maison: schemaString,
    })),
  }),
  document: schemaObject({
    titre: schemaString, type_document: schemaString, contenu: schemaString,
    changements: schemaStringArray, points_a_verifier: schemaStringArray,
  }),
};

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function isText(value, required = true) {
  return typeof value === "string" && (!required || value.trim().length > 0);
}
function isStringArray(value) {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function isISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function isEnum(value, choices) {
  return typeof value === "string" && choices.includes(value.trim().toLocaleLowerCase("fr"));
}

export function validateResult(task, result) {
  if (!isRecord(result)) return false;
  if (task === "fiche") return isText(result.titre)
    && isStringArray(result.objectifs) && result.objectifs.length > 0
    && isStringArray(result.prerequis)
    && Array.isArray(result.deroulement) && result.deroulement.length > 0
    && result.deroulement.every(phase => isRecord(phase)
      && ["phase", "duree", "activite_enseignant", "activite_eleve", "trace"].every(key => isText(phase[key])))
    && isStringArray(result.notions) && isStringArray(result.competences)
    && isText(result.travail_maison, false) && isStringArray(result.supports)
    && isText(result.evaluation) && isText(result.remediation);
  if (task === "exercices") return isText(result.titre) && isText(result.format)
    && isText(result.duree) && isText(result.bareme_total) && isText(result.introduction)
    && isStringArray(result.notions) && isStringArray(result.competences)
    && Array.isArray(result.exercices) && result.exercices.length > 0
    && result.exercices.every(exercise => isRecord(exercise)
      && isText(exercise.titre) && isText(exercise.points, false) && isText(exercise.enonce)
      && isText(exercise.correction) && Array.isArray(exercise.questions) && exercise.questions.length > 0
      && exercise.questions.every(question => isRecord(question)
        && isText(question.enonce) && isText(question.bareme, false)));
  if (task === "correction") return isFiniteNumber(result.note) && isFiniteNumber(result.sur)
    && isEnum(result.confiance, ["haute", "moyenne", "faible"])
    && Array.isArray(result.questions) && result.questions.length > 0
    && result.questions.every(question => isRecord(question)
      && isText(question.question) && isFiniteNumber(question.points_attribues)
      && isFiniteNumber(question.points_max) && isText(question.justification)
      && isStringArray(question.erreurs) && isStringArray(question.elements_corrects))
    && isText(result.appreciation) && isStringArray(result.remediation)
    && isStringArray(result.transcription_incertaine) && isStringArray(result.limites_analyse);
  if (task === "transcription") return isText(result.transcription)
    && isStringArray(result.transcription_incertaine)
    && isEnum(result.confiance_globale, ["haute", "moyenne", "faible"])
    && Number.isInteger(result.pages_lues) && result.pages_lues > 0;
  if (task === "bareme") return isText(result.titre)
    && isEnum(result.type_devoir, ["théorique", "pratique"])
    && isFiniteNumber(result.total)
    && Array.isArray(result.criteres) && result.criteres.length > 0
    && result.criteres.every(criterion => isRecord(criterion)
      && isText(criterion.question) && isFiniteNumber(criterion.points) && criterion.points >= 0
      && isStringArray(criterion.criteres) && criterion.criteres.length > 0)
    && isStringArray(result.regles);
  if (task === "cahier") return isText(result.titre) && isText(result.contenu)
    && isStringArray(result.notions) && isText(result.travail_maison, false)
    && isText(result.observations, false) && isText(result.points_a_reprendre, false);
  if (task === "repartition") return isText(result.titre) && isStringArray(result.avertissements)
    && Array.isArray(result.seances) && result.seances.length > 0
    && result.seances.every(session => isRecord(session)
      && Number.isInteger(session.numero) && session.numero > 0
      && isISODate(session.date)
      && ["titre", "domaine", "type", "objectif"].every(key => isText(session[key]))
      && isText(session.travail_maison, false));
  if (task === "document") return isText(result.titre) && isText(result.type_document)
    && isText(result.contenu) && isStringArray(result.changements) && isStringArray(result.points_a_verifier);
  return false;
}

function numericAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const match = value.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const amount = Number(match[0]);
  return Number.isFinite(amount) ? amount : null;
}

function durationInMinutes(value) {
  if (typeof value !== "string") return null;
  const text = value.trim().toLocaleLowerCase("fr").replace(",", ".");
  const hours = text.match(/^(\d+(?:\.\d+)?)\s*h(?:eures?)?(?:\s*(\d+(?:\.\d+)?)\s*(?:min(?:ute)?s?)?)?$/);
  if (hours) return Number(hours[1]) * 60 + Number(hours[2] || 0);
  const minutes = text.match(/^(\d+(?:\.\d+)?)\s*(?:min(?:ute)?s?)$/);
  return minutes ? Number(minutes[1]) : null;
}

export function requestConsistencyError(task, result, payload, maxDocumentChars = 80_000) {
  if (task === "transcription") {
    if (["note", "sur", "points_attribues", "points_max", "appreciation"].some(key => key in result)) {
      return "La prélecture doit fournir une transcription sans évaluation.";
    }
    const photos = Number(payload?.input?.nombre_de_photos);
    if (Number.isInteger(photos) && photos > 0 && result.pages_lues > photos) {
      return "Le nombre de pages transcrites dépasse le nombre de photos transmises. Vérifiez la copie.";
    }
  }
  if (task === "fiche") {
    if (result.deroulement.length < 4 || result.deroulement.length > 7) {
      return "Le déroulement doit comporter de 4 à 7 phases pour une séance de 2 heures.";
    }
    const durations = result.deroulement.map(phase => durationInMinutes(phase.duree));
    if (durations.some(minutes => minutes === null)) return "Exprimez chaque durée en minutes ou en heures afin de vérifier les 120 minutes de la séance.";
    const totalMinutes = durations.reduce((sum, minutes) => sum + minutes, 0);
    if (totalMinutes < 110 || totalMinutes > 130) {
      return `Les durées de la fiche totalisent ${totalMinutes} minutes au lieu d’environ 120.`;
    }
  }
  if (task === "exercices") {
    const expected = Number(payload?.input?.nombre);
    if (Number.isInteger(expected) && expected > 0 && result.exercices.length !== expected) {
      return `Le modèle a produit ${result.exercices.length} exercice(s) au lieu de ${expected}.`;
    }
    const declaredTotal = numericAmount(result.bareme_total);
    const exercisePoints = result.exercices.map(exercise => numericAmount(exercise.points));
    if (exercisePoints.some(points => points !== null && points < 0)) return "Le barème d’un exercice ne peut pas contenir de points négatifs.";
    if (declaredTotal !== null && declaredTotal < 0) return "Le barème total annoncé ne peut pas être négatif.";
    if (declaredTotal !== null && exercisePoints.every(points => points !== null)) {
      const sum = exercisePoints.reduce((total, points) => total + points, 0);
      if (Math.abs(sum - declaredTotal) > 0.05) return "La somme des points des exercices ne correspond pas au barème total annoncé.";
    }
  }
  if (task === "repartition") {
    const expected = Array.isArray(payload?.input?.seances) ? payload.input.seances : [];
    if (result.seances.length !== expected.length) return "La répartition ne contient pas exactement les séances du planning.";
    const inconsistent = expected.some((session, index) => {
      const proposed = result.seances[index] || {};
      return Number(proposed.numero) !== Number(session.numero) || String(proposed.date) !== String(session.date);
    });
    if (inconsistent) return "Le modèle a modifié un numéro ou une date de séance.";
  }
  if (task === "correction") {
    const note = Number(result.note);
    const sur = Number(result.sur);
    const requestedMaximum = payload?.input?.note_maximale ?? payload?.input?.sur ?? sur;
    const maximum = Number(requestedMaximum);
    if (!Number.isFinite(sur) || sur <= 0 || note < 0 || note > sur) return "La note proposée est hors des limites du barème.";
    if (!Number.isFinite(maximum) || maximum <= 0 || Math.abs(sur - maximum) > 0.001) return "Le total de la note ne correspond pas au maximum demandé.";
    const questions = result.questions;
    if (questions.some(item => item.points_attribues < 0 || item.points_max < 0 || item.points_attribues > item.points_max)) {
      return "Un score détaillé dépasse le maximum de sa question. Vérifiez la correction.";
    }
    const awarded = questions.reduce((sum, item) => sum + item.points_attribues, 0);
    const available = questions.reduce((sum, item) => sum + item.points_max, 0);
    if (Math.abs(awarded - note) > 0.05) return "La somme des points attribués ne correspond pas à la note totale.";
    if (Math.abs(available - sur) > 0.05) return "La somme des points maximaux détaillés ne correspond pas au barème total.";
  }
  if (task === "bareme") {
    const maximum = Number(payload?.input?.note_maximale);
    const total = Number(result.total);
    const sum = result.criteres.reduce((acc, item) => acc + Number(item.points), 0);
    if (!Number.isFinite(maximum) || maximum <= 0 || total !== maximum) return "Le total du barème proposé ne correspond pas à la note maximale demandée.";
    if (Math.abs(sum - maximum) > 0.001) return "La somme des critères ne correspond pas au total du barème.";
    const type = String(payload?.input?.type_devoir || "").trim().toLocaleLowerCase("fr");
    if (type && String(result.type_devoir).trim().toLocaleLowerCase("fr") !== type) return "Le type de devoir indiqué dans le barème ne correspond pas à la demande.";
  }
  if (task === "document") {
    const input = payload?.input || {};
    const source = typeof input.document_a_remplacer === "string" ? input.document_a_remplacer : "";
    if (!source.trim()) return "Le texte source à réviser est manquant.";
    if (source.length > maxDocumentChars) return `Le document dépasse la limite de ${maxDocumentChars} caractères.`;
    if (!String(input.titre || "").trim() || !String(input.type_document || "").trim()) return "Le titre et le type du document sont obligatoires.";
    if (String(result.contenu).length > maxDocumentChars * 2) return "La version proposée est trop volumineuse pour l’historique local.";
  }
  return "";
}
