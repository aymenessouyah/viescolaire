# Refonte de l’Agent Vie Scolaire AI — cycle en 9 étapes

## But
Faire évoluer l’agent par étapes vérifiables, en conservant les données locales et la règle actuelle : toute proposition est relue et validée par l’enseignant avant application. Ce document sert de cadrage ; il ne modifie pas encore le comportement de génération.

## Audit de l’existant

| Étape du cours | État actuel | À compléter pour la refonte |
| --- | --- | --- |
| **1. Définir le besoin** | L’interface expose six parcours de génération (fiche, exercices, correction, cahier, répartition, document) et une bibliothèque locale de sources. La correction comprend deux sous-étapes possibles : proposition de barème et transcription de photos. | Formaliser ci-dessous les besoins et critères de réussite de référence par parcours. Ils restent à confirmer par l’enseignant avant toute évolution fonctionnelle. |
| **2. Choisir le modèle et le system prompt** | DeepSeek est appelé côté Supabase. Le modèle est configurable par secret ; les consignes sont organisées par tâche, les sorties utilisent des schémas JSON et des prompts partagés approuvés peuvent être sélectionnés. | Versionner les consignes et leurs contrats de sortie ; établir une évaluation avant de changer de modèle ou de prompt. |
| **3. Ajouter les tools** | Les fonctionnalités sont des parcours déterministes sélectionnés dans l’interface. L’IA renvoie des objets structurés ; le navigateur gère aperçu, validation, export et application explicite. Le modèle n’exécute pas lui-même des appels de fonctions arbitraires. | Documenter chaque opération autorisée comme un contrat explicite (entrée, sortie, droits, confirmation humaine) et refuser toute action non déclarée. |
| **4. Ajouter le RAG** | Le contexte vient des champs de la demande, des fichiers choisis et d’au plus trois extraits de bibliothèque sélectionnés explicitement (limite de 6 000 caractères par extrait). La fonction rappelle que ces extraits ne prouvent pas la conformité officielle. | Garder la sélection et la provenance visibles ; ajouter des contrôles de pertinence et des tests contre les instructions malveillantes contenues dans les sources. N’introduire une recherche vectorielle que si un besoin réel est confirmé. |
| **5. Mettre les traces** | Le code de la fonction indique qu’il ne journalise pas le contenu reçu. Un identifiant de requête est renvoyé pour une génération réussie ; il n’existe pas encore de vue de suivi agrégée des délais, erreurs et coûts. | Ajouter une observabilité minimale sans prompt, copie, image, nom, courriel ni document : tâche, version, résultat technique, durée et identifiant non sensible. Définir durée de conservation et accès avant toute collecte. |
| **6. Tester et évaluer** | Des schémas et validations déterministes contrôlent les réponses. La suite Node contient des tests du client, de la fonction Edge, de la qualité et des limites. | Constituer un jeu d’essai anonymisé par tâche, définir des critères de qualité et comparer les changements de modèle/prompt avant déploiement. Ne pas envoyer de vraies copies d’élèves dans les tests. |
| **7. Sécuriser** | La fonction vérifie le jeton Supabase, limite la taille des requêtes et des extraits, valide les tâches et les pièces jointes, retire des champs locaux et bloque les affirmations de conformité non vérifiées. Les secrets restent côté serveur. | Ajouter des quotas par compte, préciser les droits nécessaires par tâche et les limites de coût, tester les tentatives d’abus et les scénarios de fuite de données. |
| **8. Optimiser** | Le modèle et le budget de sortie sont configurables, avec des délais d’attente et des plafonds par tâche. Aucun cache applicatif ni routeur de modèles n’est en place. | Mesurer d’abord la qualité et le coût. Optimiser ensuite le contexte et les budgets ; ne mettre en cache que des contenus sûrs, non personnels et reproductibles. N’ajouter un routeur qu’avec des critères d’évaluation mesurés. |
| **9. Déployer, surveiller, itérer** | Le statut distant, la version du protocole et la configuration du fournisseur sont vérifiés avant la génération. Les erreurs de déploiement sont signalées. | Définir une procédure de publication et retour arrière, vérifier les migrations et secrets, surveiller les indicateurs agrégés définis à l’étape 5 et alimenter le jeu d’essai de l’étape 6. Toute itération reprend les tests avant la mise en ligne. |

## Étape 1 — Besoin et critères de réussite de référence

### Public, problème et résultat attendu

- **Utilisateur principal :** enseignant de Sciences et technologies de l’informatique (STI) des classes 3SI1 et 4SI2, connecté à son espace.
- **Problème à résoudre :** réduire le temps de préparation, de révision et de mise en forme des documents pédagogiques, sans substituer le jugement professionnel de l’enseignant ni transformer une proposition générée en décision scolaire.
- **Résultat attendu :** un brouillon structuré, exploitable et vérifiable, fondé sur les informations explicitement fournies ou sélectionnées. L’enseignant peut le corriger, le rejeter ou choisir de l’appliquer/exporter.
- **Règle commune :** toute incertitude, source manquante ou limite d’analyse est rendue visible. L’agent ne doit pas inventer un fait de séance, une réponse d’élève, un élément de programme, une date ou une conformité officielle.

### Parcours actifs et critères observables

| Parcours | Besoin et entrée nécessaire | Résultat utile | Critères de réussite de référence | Limites et décision humaine |
| --- | --- | --- | --- | --- |
| **Fiche pédagogique** | Préparer une séance planifiée. L’enseignant choisit une séance et fournit ou vérifie durée, méthode, objectif, consignes et notions/compétences utiles. | Fiche structurée avec objectifs, prérequis, déroulement, activités des deux côtés, traces, évaluation, remédiation et travail maison. | La séance et sa classe correspondent au choix; les phases sont structurées et leurs durées sont cohérentes avec la durée demandée; aucun champ ne prétend décrire un contenu effectivement enseigné. Les sources proposées restent identifiables. | L’enseignant vérifie la faisabilité et le contenu avant impression ou remplacement d’une préparation existante. Pas d’affirmation automatique de conformité officielle. |
| **Exercices** | Produire une série à partir d’un thème, du type théorique/pratique, du nombre et de la durée souhaités; notions, compétences, contraintes et sources sont facultatives. | Énoncés organisés, questions et corrigés associés, avec format, durée, notions, compétences et barème si pertinent. | Le nombre d’exercices respecte la demande; chaque exercice comporte un énoncé et un corrigé cohérent, les questions requises et un barème lisible; le niveau et le format suivent les paramètres. | L’enseignant vérifie l’exactitude disciplinaire, les réponses, la difficulté et l’adéquation au cours avant de distribuer ou remplacer une série. |
| **Correction de copies** | Évaluer une copie sur un sujet et un barème fourni ou préalablement validé. Utiliser un identifiant anonyme; texte, images de devoir théorique ou fichiers de code de devoir pratique sont possibles. | Analyse par question, points attribués/maximaux et justification, erreurs, éléments corrects, note proposée, appréciation, remédiation, confiance et limites. | La somme et l’échelle de la proposition sont cohérentes avec le barème/la note maximale; les passages illisibles ou données insuffisantes sont signalés; le code n’est jamais présenté comme exécuté; l’identité de l’élève n’est pas nécessaire à la tâche. | La note n’est ni inscrite ni transmise automatiquement. L’enseignant relit et valide; aucune utilisation avec données directement identifiantes. |
| **Cahier de textes** | Préparer une entrée pour une séance sélectionnée à partir du contenu réellement déclaré comme réalisé et des devoirs/observations fournis. | Brouillon avec titre, contenu, notions, travail maison, observations et points à reprendre. | L’entrée renvoie à la séance choisie; le contenu reflète les informations disponibles; le travail maison absent est indiqué comme non renseigné plutôt qu’inventé. | Ne pas transformer une préparation prévue en réalisation certaine. L’enseignant vérifie et décide explicitement de l’insertion ou du remplacement local. |
| **Répartition** | Organiser la progression sur une période choisie à partir des séances et dates du planning, de l’avancement connu et des consignes de l’enseignant. | Proposition par séance avec numéro/date, titre, domaine, type, objectif, travail maison éventuel et avertissements. | Chaque séance retournée correspond à une séance fournie; les dates existantes sont préservées; les avertissements signalent les informations manquantes ou contraintes incompatibles. | L’agent ne crée, ne déplace et ne confirme aucune date. L’enseignant examine la progression puis choisit explicitement les séances à appliquer. |
| **Document libre** | Réviser un document textuel fourni (titre, type, texte source et consignes facultatives); une cible historique peut être choisie pour comparaison. | Version révisée, changements proposés et points à vérifier, avec comparaison avant/après et conservation des versions locales. | La source reste disponible sans altération automatique; les changements sont lisibles et les incertitudes sont signalées; la version antérieure peut être retrouvée/restaurée dans l’historique. | Ne pas inventer de référence juridique ou administrative. L’enseignant vérifie et déclenche explicitement l’enregistrement/remplacement ou l’export. |
| **Bibliothèque de sources** | Classer localement les documents et extraits par titre, catégorie, classe, provenance et tags; sélectionner explicitement les références utiles à une génération. | Sources organisées sur l’appareil, puis références et extraits choisis affichés avec leur provenance dans le contexte de la demande. | Aucune source n’est envoyée par le seul fait de l’importer ou de la stocker; seules les sources sélectionnées sont jointes, dans les plafonds existants (trois sources, 6 000 caractères par extrait); la provenance reste visible. | Les documents restent locaux par défaut. Un extrait n’est ni une validation ni une preuve de conformité officielle; l’enseignant choisit ce qui est transmis. |

### Sous-étapes du parcours de correction

- **Proposition de barème (facultative)** — à partir du sujet, du type de devoir et de la note maximale, fournir des critères et leur total. Réussite : le total correspond à l’échelle demandée et chaque critère possède un nombre de points explicite. L’enseignant doit relire et modifier/valider le barème avant qu’il ne serve à corriger.
- **Transcription de photos (facultative)** — pour un devoir théorique photographié, fournir une transcription, la confiance globale et les segments incertains. Réussite : l’incertitude reste visible et le texte est éditable. L’enseignant relit; si des segments restent incertains, une confirmation explicite est nécessaire pour poursuivre. Aucune correction de copie n’est lancée par le seul test de connexion ou par la prévisualisation.

### Critères communs de validation avant d’engager les étapes suivantes

1. La requête n’est envoyée qu’après authentification et vérification de l’état/version de la fonction distante; si le précontrôle échoue, aucune génération n’est lancée.
2. La réponse satisfait le contrat structuré de la tâche et passe les contrôles déterministes; sinon elle est rejetée et rien n’est appliqué.
3. L’enseignant peut distinguer les faits fournis, les propositions de l’agent, les sources sélectionnées et les incertitudes.
4. Aucun résultat n’écrit automatiquement dans le planning, le cahier, le registre, le fichier source ou un document de référence.
5. Les données personnelles non nécessaires sont évitées; les copies et images sont anonymisées par l’enseignant avant envoi. Les tests de qualité utilisent des cas synthétiques ou anonymisés.
6. Pour les dimensions pédagogiques subjectives (clarté, niveau, exactitude disciplinaire et utilité), ces critères constituent une base à confirmer avec l’enseignant; ils ne sont pas considérés comme approuvés ni mesurés tant qu’un jeu d’évaluation n’est pas établi à l’étape 6.

### Hors périmètre de la première phase

- Recherche vectorielle ou collecte automatique de documents officiels.
- Envoi automatique de notes, présence, cahier, planning, fichiers ou documents vers un système tiers.
- Écriture sans confirmation, notation autonome, décision disciplinaire ou certification de conformité au programme.
- Introduction d’un nouveau modèle, d’un cache, d’un routeur ou de traces contenant du contenu utilisateur.

## Étape 2 — Modèle, prompts et contrats de sortie

### État de référence constaté dans le code

| Élément | Fonctionnement actuel |
| --- | --- |
| **Fournisseur et modèle** | Appel serveur à l’API DeepSeek Responses. Le modèle vient du secret `DEEPSEEK_MODEL`, avec `deepseek-flash` comme valeur de repli. `DEEPSEEK_API_KEY` reste côté serveur. |
| **Consignes** | Un socle `COMMON_RULES`, un prompt `TASK_PROMPTS[task]`, puis zéro à cinq prompts partagés approuvés et limités à la tâche. Le serveur vérifie que chaque prompt choisi est toujours publié. |
| **Tâches serveur** | Huit contrats : `fiche`, `exercices`, `correction`, `transcription`, `bareme`, `cahier`, `repartition` et `document`. Les deux tâches intermédiaires `transcription` et `bareme` servent le parcours correction; la bibliothèque elle-même n’est pas une tâche de génération. |
| **Format** | Chaque tâche possède un schéma JSON strict dans `quality.mjs` (`additionalProperties: false`). Les réponses sont ensuite passées par `validateResult` et `requestConsistencyError`; le schéma seul ne suffit donc pas à accepter une réponse. |
| **Paramètres d’appel** | Réponse non diffusée en continu, effort de raisonnement `none`; délai serveur 90 s. Le plafond par défaut est de 5 000 tokens, 7 000 pour une répartition trimestrielle ou 12 000 pour un document/une répartition annuelle; le secret de configuration est borné entre 1 000 et 12 000. Température actuelle : 0,1 pour correction, transcription et cahier; 0,35 pour les autres tâches. |
| **Métadonnées** | Le résultat retourne fournisseur, modèle, protocole, identifiant de requête et nombre d’images. Les versions du prompt et du schéma ne sont pas encore explicites dans le contrat de réponse. Le texte du prompt n’est pas renvoyé comme métadonnée. |

### Décisions de cadrage pour cette étape

1. **Conserver DeepSeek dans la première itération.** Aucun changement de fournisseur ou de modèle n’est justifié sans jeu d’évaluation, comparaison de qualité, de latence et de coût à l’étape 6.
2. **Rendre les changements reproductibles.** Associer à chaque génération une version de prompt commun, une version de prompt de tâche et une version de schéma, en plus du modèle et du protocole. Les identifiants doivent être stables; une modification de contenu crée une nouvelle version, au lieu de réécrire silencieusement l’ancienne.
3. **Préserver la hiérarchie des consignes.** Les prompts partagés restent des compléments facultatifs subordonnés aux règles communes, à la tâche, au schéma, à la confidentialité et aux limites de vérité. Ils ne peuvent ni élargir les permissions ni supprimer une validation humaine.
4. **Ne pas tracer le contenu pour assurer la reproductibilité.** Enregistrer éventuellement des identifiants de versions et une empreinte de configuration non réversible, jamais le prompt composé, la copie, les images, les pièces jointes ni les données personnelles.
5. **Garder le schéma et les contrôles déterministes comme barrière.** Une réponse refusée par le schéma, les validateurs ou les contrôles de cohérence ne devient pas un résultat affichable ou applicable.

### Contrat de versionnement proposé — à implémenter après validation

- Manifeste côté serveur par tâche : `prompt_set_version`, `task_prompt_version` et `schema_version`.
- Métadonnées de génération : `provider`, `model`, ces trois identifiants, `protocol` et un `request_id` aléatoire; aucune valeur du prompt ou des champs de saisie.
- Prompts partagés : conserver l’identifiant publié existant et ajouter une version immuable ou une empreinte de contenu. Toute correction administrative publie une nouvelle version et conserve l’ancienne pour l’audit; l’enseignant voit toujours le titre et la provenance avant sélection.
- Changement incompatible de champs, de types ou de règles : nouvelle version de schéma et incrément explicite de protocole; le client refuse les réponses dont le protocole ne correspond pas.
- Le nombre/nommage exact des versions est à stabiliser dans les tests avant de modifier la fonction Edge. Cette section est une proposition de conception, pas un changement déjà déployé.

### Critères de sortie de l’étape 2

- Un manifeste relie chaque tâche à son prompt, son schéma et au protocole, sans consigne dupliquée ni version ambiguë.
- Des tests vérifient les huit tâches, les champs obligatoires, l’interdiction des propriétés supplémentaires et les contrôles déterministes de cohérence.
- Un changement de prompt ou de modèle produit des identifiants distincts et peut être comparé à l’ancien sans exposer de données réelles.
- Les prompts partagés ne peuvent être sélectionnés que s’ils sont publiés, autorisés pour la tâche et toujours subordonnés aux règles communes.
- Les critères pédagogiques qualitatifs restent à évaluer sur le jeu synthétique de l’étape 6; aucun modèle n’est promu sur la seule base d’une démonstration.

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
