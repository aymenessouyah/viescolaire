#!/usr/bin/env bash
# Publication de l'espace pédagogique STI sur GitHub — à lancer une seule fois.
#
#   ./publier.sh                                  (questions posées à l'écran)
#   ./publier.sh <identifiant> [nom-du-depot]     (tout en une commande)
#
# Prérequis : git installé et authentifié (git config --global user.name / user.email).
set -e

ID_DEFAUT="aymenessouyah"
DEPOT_DEFAUT="viescolaire"
ID="${1:-$ID_DEFAUT}"
DEPOT="${2:-}"

if [ -z "$ID" ]; then
  printf "Votre identifiant GitHub [%s] : " "$ID_DEFAUT"
  read -r ID
  ID="${ID:-$ID_DEFAUT}"
fi
if [ -z "$ID" ]; then echo "Identifiant manquant — arrêt."; exit 1; fi

if [ -z "$DEPOT" ]; then
  printf "Nom du dépôt [%s] : " "$DEPOT_DEFAUT"
  read -r DEPOT
  DEPOT="${DEPOT:-$DEPOT_DEFAUT}"
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git n'est pas installé. Installez-le (https://git-scm.com/downloads) ou utilisez la méthode par glisser-déposer décrite dans le README (§3)."
  exit 1
fi

git init -b main 2>/dev/null || git init        # réinitialise aussi une copie dont le dossier .git est incomplet
if git remote get-url origin >/dev/null 2>&1; then git remote remove origin; fi

git add -A
git -c user.name="${GIT_AUTHOR_NAME:-Aymen Essouyah}" \
    -c user.email="${GIT_AUTHOR_EMAIL:-aymen.essouyah@example.tn}" \
    commit -m "Espace pédagogique STI 2026-2027 — version multi-fichiers (PWA)" || echo "(rien de nouveau à valider)"
git branch -M main
git remote add origin "https://github.com/$ID/$DEPOT.git"

echo
echo "Envoi vers https://github.com/$ID/$DEPOT …"
git push -u origin main

echo
echo "=============================================================="
echo " Dépôt  : https://github.com/$ID/$DEPOT"
echo " Pages  : Settings → Pages → Deploy from a branch → main → /(root)"
echo " Site   : https://$ID.github.io/$DEPOT/"
echo "=============================================================="
