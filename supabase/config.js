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
     • synchronisation bidirectionnelle après chaque enregistrement (auto: true) ;
     • sur un nouvel appareil, l'espace Cloud est repris ; si des données locales
       existent, l'application demande s'il faut les fusionner ou ouvrir le Cloud ;
     • coupure réseau : travail local, puis reprise au retour du réseau.

   Accès protégé (auth: true) : chaque professeur utilise son propre compte
   Supabase (Authentication → Users). La connexion est requise sur chaque
   appareil et la session y reste ouverte. Le nom d'appareil vide est généré
   localement ; vous pouvez le personnaliser depuis les réglages Cloud.
   ========================================================================= */
window.STI_SUPABASE = {
  url:   "https://oaahxobzbnmaohcmdrbu.supabase.co",   // projet « aymenessouyah-vie-scolaire »
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYWh4b2J6Ym5tYW9oY21kcmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNDE2MDAsImV4cCI6MjEwNjcxNzYwMH0.e6cVFx7_BoF8jFvIAows2i-awIEaM6MS3K4LdCq4INs",   // clé anon publique du projet
  table: "espace_pedagogique",        // table créée par supabase/schema.sql
  // Nom automatique et distinct par navigateur ; modifiable dans Cloud → Configuration.
  device: "",
  auto:  true,                        // synchronisation automatique à chaque enregistrement
  auth:  true,                        // accès protégé par mot de passe
  admin: "aymenessouyah@gmail.com"    // compte administrateur : gestion des professeurs
};
