# Refonte de l’Agent Vie Scolaire AI — cycle en 9 étapes

## But
Faire évoluer l’agent par étapes vérifiables, en conservant les données locales et la règle actuelle : toute proposition est relue et validée par l’enseignant avant application. Ce document sert de cadrage ; il ne modifie pas encore le comportement de génération.

## Audit de l’existant

| Étape du cours | État actuel | À compléter pour la refonte |
| --- | --- | --- |
| **1. Définir le besoin** | L’agent vise les enseignants STI et propose sept parcours métier (fiche, exercices, correction, cahier, répartition, document, bibliothèque). Les résultats ne sont pas appliqués sans action de l’enseignant. | Définir pour chaque parcours l’utilisateur, l’entrée attendue, le résultat utile, les cas de refus et les critères de réussite. Séparer clairement les tâches réellement utilisées des pistes futures. |
| **2. Choisir le modèle et le system prompt** | DeepSeek est appelé côté Supabase. Le modèle est configurable par secret ; les consignes sont organisées par tâche, les sorties utilisent des schémas JSON et des prompts partagés approuvés peuvent être sélectionnés. | Versionner les consignes et leurs contrats de sortie ; établir une évaluation avant de changer de modèle ou de prompt. |
| **3. Ajouter les tools** | Les fonctionnalités sont des parcours déterministes sélectionnés dans l’interface. L’IA renvoie des objets structurés ; le navigateur gère aperçu, validation, export et application explicite. Le modèle n’exécute pas lui-même des appels de fonctions arbitraires. | Documenter chaque opération autorisée comme un contrat explicite (entrée, sortie, droits, confirmation humaine) et refuser toute action non déclarée. |
| **4. Ajouter le RAG** | Le contexte vient des champs de la demande, des fichiers choisis et d’au plus trois extraits de bibliothèque sélectionnés explicitement (limite de 6 000 caractères par extrait). La fonction rappelle que ces extraits ne prouvent pas la conformité officielle. | Garder la sélection et la provenance visibles ; ajouter des contrôles de pertinence et des tests contre les instructions malveillantes contenues dans les sources. N’introduire une recherche vectorielle que si un besoin réel est confirmé. |
| **5. Mettre les traces** | Le code de la fonction indique qu’il ne journalise pas le contenu reçu. Un identifiant de requête est renvoyé pour une génération réussie ; il n’existe pas encore de vue de suivi agrégée des délais, erreurs et coûts. | Ajouter une observabilité minimale sans prompt, copie, image, nom, courriel ni document : tâche, version, résultat technique, durée et identifiant non sensible. Définir durée de conservation et accès avant toute collecte. |
| **6. Tester et évaluer** | Des schémas et validations déterministes contrôlent les réponses. La suite Node contient des tests du client, de la fonction Edge, de la qualité et des limites. | Constituer un jeu d’essai anonymisé par tâche, définir des critères de qualité et comparer les changements de modèle/prompt avant déploiement. Ne pas envoyer de vraies copies d’élèves dans les tests. |
| **7. Sécuriser** | La fonction vérifie le jeton Supabase, limite la taille des requêtes et des extraits, valide les tâches et les pièces jointes, retire des champs locaux et bloque les affirmations de conformité non vérifiées. Les secrets restent côté serveur. | Ajouter des quotas par compte, préciser les droits nécessaires par tâche et les limites de coût, tester les tentatives d’abus et les scénarios de fuite de données. |
| **8. Optimiser** | Le modèle et le budget de sortie sont configurables, avec des délais d’attente et des plafonds par tâche. Aucun cache applicatif ni routeur de modèles n’est en place. | Mesurer d’abord la qualité et le coût. Optimiser ensuite le contexte et les budgets ; ne mettre en cache que des contenus sûrs, non personnels et reproductibles. N’ajouter un routeur qu’avec des critères d’évaluation mesurés. |
| **9. Déployer, surveiller, itérer** | Le statut distant, la version du protocole et la configuration du fournisseur sont vérifiés avant la génération. Les erreurs de déploiement sont signalées. | Définir une procédure de publication et retour arrière, vérifier les migrations et secrets, surveiller les indicateurs agrégés définis à l’étape 5 et alimenter le jeu d’essai de l’étape 6. Toute itération reprend les tests avant la mise en ligne. |

## Phases de réalisation et critères de passage

1. **Besoin (étape 1)** — approuver la fiche de besoin et les critères de réussite pour chaque parcours actif ; fixer les limites et les décisions réservées à l’enseignant.
2. **Contrat du modèle (étape 2)** — versionner prompt, modèle, schéma et protocole ; les tests confirment la structure, les limites et le refus des demandes hors périmètre.
3. **Tools (étape 3)** — décrire les opérations accessibles, leurs entrées/sorties et confirmations ; aucun outil ne peut écrire ou modifier des données sans confirmation explicite.
4. **Contexte/RAG (étape 4)** — expliciter les sources utilisées, leur provenance et les limites ; tester l’injection de consignes dans les documents et pièces jointes.
5. **Traces (étape 5)** — vérifier par test qu’aucun contenu, identifiant d’élève ou secret n’est enregistré ; documenter les champs, accès et durées de conservation.
6. **Évaluation (étape 6)** — établir un jeu d’essai sans données personnelles et des seuils d’acceptation par tâche ; toute évolution de prompt/modèle doit le passer.
7. **Sécurité (étape 7)** — tester authentification, quotas, droits et tailles maximales ; aucune hausse de dépense sans limite/configuration explicitement définie.
8. **Optimisation (étape 8)** — comparer coût, délai et qualité au niveau de référence ; ne garder que les optimisations qui ne dégradent pas les critères pédagogiques.
9. **Déploiement (étape 9)** — publication versionnée, test de santé, vérification du protocole et procédure de retour arrière ; surveiller puis reprendre au test (étape 6).

## Garde-fous conservés pendant toutes les étapes

- Aucun résultat de l’IA n’est appliqué automatiquement au planning, au cahier ou au registre des élèves.
- Les informations de profil et les champs locaux restent hors de la demande adressée au modèle.
- Les extraits choisis sont présentés comme du contexte fourni, jamais comme une preuve automatique de conformité officielle.
- Pas de journalisation des prompts, copies, photos, fichiers de code ou documents personnels.
- Les tests et jeux d’évaluation utilisent des exemples synthétiques ou anonymisés.
