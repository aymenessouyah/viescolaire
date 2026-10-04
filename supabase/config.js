/* =========================================================================
   Configuration Supabase — Espace pédagogique STI
   -------------------------------------------------------------------------
   Deux façons de configurer la sauvegarde distante :

   1) Depuis l'application (recommandé, aucune modification de fichier) :
      bouton « Cloud » dans l'en-tête → renseigner l'URL du projet et la clé
      publique, puis « Enregistrer et tester ». La configuration est mémorisée
      dans le navigateur de l'appareil.

   2) En modifiant ce fichier (pratique pour un déploiement sur plusieurs
      appareils : la configuration est alors commune à tous).

   Remplacer les valeurs ci-dessous puis publier sur GitHub.
   La clé attendue est la clé PUBLIQUE du projet (« anon / publishable »),
   jamais la clé « service_role » qui contourne les règles de sécurité.
   ========================================================================= */
window.STI_SUPABASE = {
  url:   "",                          // ex. "https://abcdefghijkl.supabase.co"
  anonKey: "",                        // clé publique du projet
  table: "espace_pedagogique",        // table créée par supabase/schema.sql
  device: "Poste principal — Prof. Aymen",
  auto:  false                        // true : envoi automatique à chaque enregistrement
};
