# Assistant pédagogique STI — architecture et étapes

## Objectif et règle pédagogique

L’assistant aide l’enseignant de lycée tunisien à préparer et à relire ses supports. Il **ne certifie pas** la conformité au programme : l’enseignant vérifie la provenance, l’édition, les pages et l’applicabilité des documents et valide les propositions. Les classes actuellement intégrées sont 3SI1 et 4SI2 ; les données, dates et horaires du dépôt sont des paramètres de départ à vérifier et non une garantie d’actualité.

## Architecture en place

```text
Navigateur / PWA
  ├─ Formulaires : classe, objectifs, durée, contraintes, sujet et barème
  ├─ Bibliothèque locale IndexedDB : métadonnées, fichier facultatif, extrait saisi
  ├─ Sélection explicite : trois extraits au maximum et aperçu des champs et pièces jointes
  ├─ Fonction Edge Supabase assistant-ia : authentification, secret serveur,
  │    consignes pédagogiques, schéma JSON et contrôles métier
  │      └─ Fournisseur IA configuré côté serveur (DeepSeek dans ce dépôt)
  └─ Proposition à vérifier → comparaison et décision de l’enseignant
         ├─ insertion explicite dans le planning ou la fiche
         ├─ validation locale, éventuellement ajustée, d’une note
         └─ export HTML, impression/PDF ou tableur XLSX adapté
```

Les secrets ne sont pas placés dans le navigateur. La sélection d’un extrait transmet son **texte** et sa provenance à la fonction IA ; elle ne transmet pas le fichier de la bibliothèque. Les données des formulaires, images et fichiers de code explicitement joints à une correction peuvent néanmoins être transmis. L’aperçu permet de les contrôler avant chaque envoi. La détection de données personnelles n’est pas exhaustive.

Le dépôt contient une fonction Edge préparée ; elle n’est pas automatiquement déployée par une modification Git. Les générations nécessitent Internet, une session Supabase et une fonction distante compatible (protocole `sti-pedagogique-2026-10-27`), déployée et configurée. Une ancienne version est bloquée avant génération. Voir [AGENT_IA.md](../AGENT_IA.md). L’interface locale, la bibliothèque et les exports ne nécessitent pas d’appel IA ; la bibliothèque reste sur cet appareil.

## Étapes réalisées

1. **Cadrage et réutilisation** : maintien de l’application existante, des sessions et des profils, ainsi que du parcours de génération et de transcription.
2. **Sources documentaires** : classement local par catégorie, classe, origine, édition, page et mots-clés ; fichier et extrait facultatifs ; recherche, modification, téléchargement et suppression. Trois extraits au plus peuvent être sélectionnés pour une fiche, des exercices ou une répartition. Le bouton « Archiver » enregistre volontairement la proposition au format HTML dans la bibliothèque ; pour un sujet, cette copie comprend le corrigé. Aucun extrait n’est créé automatiquement. Le fichier original externe reste inchangé.
3. **Préparation** : fiches avec durée ajustable, exercices et devoirs théoriques/pratiques avec corrigés et barèmes, répartition d’un trimestre ou de l’année à partir des séances disponibles. Le serveur vérifie notamment la durée, les nombres, les dates et les totaux quand ils sont exploitables.
4. **Correction assistée** : sujet et barème de l’enseignant, réponses textuelles, images ou fichiers de code ; prélecture séparée pour les copies théoriques photographiées ; points et justifications question par question. La note proposée peut être modifiée par l’enseignant avec justification puis validée explicitement ; elle n’est jamais saisie automatiquement dans le registre.
5. **Exports** : HTML complet ; impression avec choix « Enregistrer en PDF » dans le navigateur ; XLSX pour fiches, exercices, répartitions et corrections. Pour les exercices, une sortie « élève » enlève les sections corrigé ; relire les énoncés avant toute diffusion. Les exports des exercices « avec corrigé » et l’Excel contiennent les réponses.
6. **Vérification** : tests automatisés `node --test tests/*.test.js` et contrôles des parcours dans un navigateur. Les contrôles de conformité par expressions sont uniquement des garde-fous contre certaines formulations, pas une vérification sémantique du programme.

## Limites et précautions

- **Sources** : aucune extraction automatique des PDF ou DOCX, aucune vérification de l’origine, de l’édition ou des pages. Ouvrir le fichier et coller manuellement les passages pertinents. Les autres sources du dépôt ne sont pas automatiquement lues par le modèle. Un extrait partiel ne prouve pas la conformité de l’ensemble d’une proposition.
- **Bibliothèque locale** : IndexedDB dépend du navigateur et de son quota. Les fichiers et extraits ne sont ni chiffrés ni synchronisés ni inclus dans les sauvegardes Cloud/Drive existantes. Un utilisateur ayant accès au même appareil peut les lire ; conserver les originaux dans une sauvegarde séparée. Effacer les données du navigateur peut les supprimer.
- **Copies et travaux pratiques** : anonymiser aussi les images et fichiers et vérifier les règles de l’établissement et la base légale avant transmission à un fournisseur externe, en particulier pour des mineurs. L’anonymisation n’est pas automatique. L’IA ne peut pas exécuter les programmes ni certifier les résultats de tests qu’on ne lui a pas fournis. Les erreurs, passages illisibles et points sont à contrôler sur la copie originale.
- **Validation des notes** : la note finale validée et ses ajustements ne vivent qu’en mémoire pendant la consultation ; ils ne sont pas ajoutés à l’historique ni au registre. Exporter si nécessaire, puis saisir manuellement après contrôle. Les copies d’élèves et leurs corrections ne disposent pas du bouton d’archivage ; seuls les supports génériques sont archivables par ce parcours.
- **Année complète** : la proposition utilise uniquement les séances présentes dans le calendrier actif. Une longue demande peut dépasser le temps ou la taille de réponse du fournisseur ; en cas d’échec, travailler trimestre par trimestre. Les dates et numéros sont contrôlés ; l’application ne modifie que les séances futures, non assurées et non verrouillées après confirmation.
- **Exports** : XLSX est un fichier Open XML, avec textes insérés comme chaînes et non comme formules. PDF dépend de la fonction d’impression du navigateur ; il ne s’agit pas d’un moteur de génération PDF autonome.

## Évolutions possibles, à valider avant mise en production

- Traitement documentaire optionnel côté serveur (extraction PDF/DOCX, OCR, citations vérifiables par page) avec quotas, consentement, contrôle qualité, stockage privé et politiques d’accès RLS.
- Bibliothèque chiffrée et synchronisée entre appareils, sauvegarde et restauration explicites, gestion des versions, droits par professeur et éventuelles ressources partagées.
- Outils de tests pratiques en bac à sable isolé, sans réseau ni accès aux données privées, avec limites de ressources ; aucun code élève ne doit être exécuté par la fonction IA existante.
- Classes, niveaux, calendriers, durées et barèmes entièrement configurables, puis validations pilotes par des enseignants de STI.

Aucune migration, activation de service payant ni opération sur la base distante ne doit être exécutée sans accord explicite.
