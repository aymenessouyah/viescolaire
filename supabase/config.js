/* =========================================================================
   Configuration Supabase — Espace pédagogique STI
   -------------------------------------------------------------------------
   Deux façons de configurer la sauvegarde distante :

   1) En modifiant ce fichier (recommandé) : renseigner `url` et `anonKey`
      ci-dessous puis publier sur GitHub. Tous les appareils — téléphone,
      tablette, poste du lycée — utilisent alors la même base, sans rien
      saisir sur chacun d'eux.

   2) Depuis l'application : bouton « Cloud » de l'en-tête → coller l'URL et
      la clé → « Enregistrer et tester ». La configuration est alors mémorisée
      dans le navigateur de cet appareil seulement.

   La clé attendue est la clé PUBLIQUE du projet (« anon / publishable »).
   Elle est prévue pour être visible ; ce sont les règles de sécurité (RLS)
   créées par supabase/schema.sql qui protègent réellement la base.
   Ne jamais utiliser la clé « service_role », qui contourne ces règles.

   Mode de fonctionnement une fois configuré :
     • envoi automatique à chaque enregistrement (auto: true) ;
     • sur un nouvel appareil, l'application propose de reprendre la dernière
       sauvegarde du cloud avant toute saisie locale ;
     • coupure réseau : travail local, puis reprise automatique de l'envoi.

   Accès protégé (auth: true) : la base n'accepte que le compte unique créé
   dans Supabase (Authentication → Users). L'application demande alors la
   connexion (fenêtre « Connexion à la sauvegarde distante ») sur chaque
   appareil et garde la session ouverte ensuite.
   ========================================================================= */
window.STI_SUPABASE = {
  url:   "https://oaahxobzbnmaohcmdrbu.supabase.co",   // projet « aymenessouyah-vie-scolaire »
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYWh4b2J6Ym5tYW9oY21kcmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNDE2MDAsImV4cCI6MjEwNjcxNzYwMH0.e6cVFx7_BoF8jFvIAows2i-awIEaM6MS3K4LdCq4INs",   // clé anon publique du projet
  table: "espace_pedagogique",        // table créée par supabase/schema.sql
  device: "Poste principal — Prof. Aymen",
  auto:  true,                        // envoi automatique à chaque enregistrement
  auth:  true,                        // accès protégé par mot de passe
  admin: "aymenessouyah@gmail.com"    // compte administrateur : gestion des professeurs
};
