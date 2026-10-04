/* =========================================================================
   Configuration Supabase — Espace pédagogique STI
   -------------------------------------------------------------------------
   Deux façons de configurer la sauvegarde distante :

   1) Depuis l'application (recommandé, aucune modification de fichier) :
      bouton « Cloud » dans l'en-tête → renseigner l'URL du projet et la clé
      publique, puis « Enregistrer et tester ». La configuration est mémorisée
      dans le navigateur de l'appareil.

   2) En modifiant ce fichier (recommandé : la configuration devient commune à
      tous les appareils — téléphone, tablette, poste du lycée — sans rien
      saisir sur chacun d'eux).

   Remplacer les valeurs ci-dessous puis publier sur GitHub.
   La clé attendue est la clé PUBLIQUE du projet (« anon / publishable ») :
   elle est prévue pour être visible et reste protégée par les règles de
   sécurité (RLS) créées par supabase/schema.sql.
   Ne jamais utiliser la clé « service_role », qui contourne ces règles.

   Une fois ces deux valeurs renseignées : l'envoi automatique est actif, et à
   l'ouverture sur un nouvel appareil l'application propose de reprendre la
   dernière sauvegarde du cloud avant toute saisie locale.
   ========================================================================= */
window.STI_SUPABASE = {
  url:   "",                          // ex. "https://abcdefghijkl.supabase.co"
  anonKey: "",                        // clé publique du projet
  table: "espace_pedagogique",        // table créée par supabase/schema.sql
  device: "Poste principal — Prof. Aymen",
  auto:  false                        // true : envoi automatique à chaque enregistrement
};
