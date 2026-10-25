# Agent STI — installation et activation

L'**Agent STI** est un véritable agent pédagogique intégré à Vie Scolaire. Il récupère le contexte nécessaire, appelle un modèle d'IA par une fonction serveur et produit des documents structurés que l'enseignant peut vérifier, exporter ou appliquer.

## Outils inclus

- **Fiche pédagogique** : objectifs, prérequis, phases de 2 h, notions, évaluation, travail et remédiation ; insertion possible dans la préparation d'une séance.
- **Séries d'exercices** : énoncés théoriques ou pratiques, questions, corrigés et barème ; export HTML et impression.
- **Correction de copies** : choix explicite entre devoir **théorique** et **pratique** ; texte, photos, captures et fichiers HTML/CSS/JS/PHP/SQL/TXT/JSON pour le pratique. Pour les copies théoriques photographiées, l'agent transcrit d'abord les réponses sans les noter. La transcription est éditable; les passages incertains sont signalés et l'enseignant doit confirmer explicitement s'il poursuit malgré l'avertissement. La correction utilise ensuite le texte relu, sans renvoyer les photos lors du second appel. Barème fourni par l'enseignant ou proposé d'abord par l'agent puis modifiable avant correction. Justification question par question, limites de l'analyse, note proposée et remédiation. Le code n'est jamais prétendu exécuté et aucune note n'est saisie automatiquement.
- **Cahier de textes** : reformulation limitée au contenu réellement déclaré ; la séance n'est jamais confirmée automatiquement.
- **Répartition** : proposition séance par séance avec dates et numéros inchangés ; seules les séances futures peuvent recevoir la proposition.

## Architecture

```text
Navigateur / GitHub Pages
  → Supabase Auth (session du professeur)
  → Edge Function assistant-ia
  → Google Gemini API `generateContent`
  → JSON validé et affiché dans l'Agent STI
```

La clé de l'IA est un **secret Supabase**. Elle n'apparaît ni dans GitHub, ni dans le JavaScript, ni dans les réponses de la fonction.

## 1. Choisir le modèle

La fonction appelle directement l’API **Google Gemini `generateContent`**. Il faut un modèle Gemini qui prend en charge les images et le mode JSON : ces capacités sont nécessaires à la transcription manuscrite et aux documents structurés.

Réglages disponibles dans les secrets Supabase :

| Secret | Rôle |
|---|---|
| `GEMINI_API_KEY` | Clé privée Gemini — obligatoire. Le projet Supabase actuel possède déjà ce secret. |
| `GEMINI_MODEL` | Identifiant du modèle à utiliser — facultatif; par défaut `gemini-3.8-flash`. |
| `GEMINI_MODELE` | Ancien nom accepté pour le réglage du modèle, afin de rester compatible avec `corriger-ia`. |
| `GEMINI_MAX_OUTPUT_TOKENS` | Limite de réponse, de 1000 à 12000; facultatif. |

Le modèle par défaut est `gemini-3.8-flash`. Si ce modèle n’est pas disponible sur votre compte, définissez `GEMINI_MODEL` avec un modèle Gemini prenant en charge les images et la sortie JSON :

```bash
supabase secrets set GEMINI_MODEL="MODELE_GEMINI_DISPONIBLE"
```

La clé API reste un secret côté serveur; ne la communiquez pas dans une conversation, un ticket ou un fichier du dépôt. Si `GEMINI_API_KEY` n’existe pas ou doit être renouvelée, ajoutez-la directement dans Supabase → Edge Functions → Secrets.

## 2. Déployer la fonction

Depuis la racine du projet, avec la CLI Supabase et un compte ayant accès au projet :

```bash
supabase login
supabase link --project-ref oaahxobzbnmaohcmdrbu
supabase functions deploy assistant-ia --project-ref oaahxobzbnmaohcmdrbu
```

La fonction utilise `verify_jwt = false` au gateway pour que le précontrôle CORS `OPTIONS`, qui ne contient pas de jeton, puisse atteindre la fonction. Cela ne rend pas les générations anonymes : `assistant-ia/index.ts` exige un Bearer token et vérifie chaque `POST` auprès de Supabase Auth. Ne supprimez pas ce contrôle d’authentification dans le code.

Après le déploiement, la fonction est appelée automatiquement à partir de l'URL Supabase déjà configurée dans l'application :

```text
https://oaahxobzbnmaohcmdrbu.supabase.co/functions/v1/assistant-ia
```

## 3. Publier l'interface

Ajouter au dépôt les fichiers modifiés, notamment :

```text
assets/agent-sti.js
assets/agent-sti.css
supabase/functions/assistant-ia/index.ts
supabase/config.toml
index.html
assets/app.js
assets/interface-reference.js
sw.js
AGENT_IA.md
```

Puis publier sur la branche utilisée par GitHub Pages. La version du service worker a été incrémentée pour éviter que les appareils conservent l'ancienne interface en cache.

## 4. Vérifier le fonctionnement

1. Ouvrir Vie Scolaire et se connecter avec le compte professeur.
2. Ouvrir **Agent STI · IA** dans le menu principal.
3. Cliquer sur **Tester la connexion**. Le modèle configuré doit apparaître.
4. Générer d'abord une courte série théorique, puis une courte série pratique pour vérifier l'adaptation au type de devoir.
5. Tester une correction théorique avec une copie fictive et un barème fourni.
6. Tester une copie manuscrite fictive en photo : relire et modifier la transcription; si un passage est signalé, vérifier l'avertissement et la confirmation avant de poursuivre.
7. Tester une correction pratique avec de petits fichiers de code anonymisés : choisir **L’agent propose le barème**, relire et modifier la proposition, puis lancer la correction. Vérifier que le rapport distingue bien l'analyse du code du fonctionnement à tester.
8. Vérifier les points et les faits avant toute application ou export.

## Protection des données

- Envoyer uniquement la séance, le thème ou la copie nécessaire à la demande ; l'agent n'envoie pas la base complète des élèves.
- Utiliser des identifiants anonymes (« Copie 1 ») plutôt que les noms complets.
- Les images sont réduites dans le navigateur, limitées à six par demande, puis transmises à la fonction pour l'analyse. Pour une copie manuscrite théorique, elles servent d'abord à la transcription; après relecture, le second appel de correction reçoit le texte et non les photos.
- Les fichiers de code sont limités à huit fichiers de 200 Ko chacun ; ils sont lus localement et ne sont pas enregistrés dans l'historique.
- Les corrections et les propositions de barème ne sont pas ajoutées à l'historique local des générations.
- Les autres documents récents sont conservés dans le navigateur pour être rouverts ; ils peuvent être effacés depuis l'agent.
- Aucune correction n'est enregistrée dans les notes et aucune séance n'est marquée assurée sans action de l'enseignant.

## Dépannage

| Message | Vérification |
|---|---|
| `Connexion professeur requise` | Se reconnecter depuis le bouton Compte de la plateforme. |
| `Agent non configuré` | Vérifier `GEMINI_API_KEY` dans Supabase → Edge Functions → Secrets. Vérifier aussi que `GEMINI_MODEL` est disponible sur le compte. |
| Code 401 ou 403 de Gemini | Vérifier la clé, le compte et les autorisations du modèle. |
| Le texte fonctionne mais pas les photos | Choisir un modèle Gemini vision et vérifier que les images sont transmises en `inlineData`. |
| Réponse JSON incomplète | Réessayer, réduire la demande ou choisir un modèle Gemini prenant bien en charge le mode JSON. |
| Délai dépassé | Réduire le nombre d'images ou de séances demandées, puis réessayer. |

## Limites volontaires

L'agent propose ; l'enseignant décide. Une correction automatique peut se tromper, notamment sur une écriture manuscrite ou un barème ambigu. Le détail des points, les passages incertains et la justification sont donc toujours affichés pour contrôle.
