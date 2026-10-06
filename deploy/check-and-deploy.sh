#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="main"
STATE_DIR="${HOME}/.local/state/homescreen"
DEPLOYED_SHA_FILE="${STATE_DIR}/deployed-sha"
LOCK_FILE="${STATE_DIR}/autodeploy.lock"

mkdir -p "${STATE_DIR}"

# Förhindra att två deploy-körningar kan pågå samtidigt.
exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  exit 0
fi

cd "${REPO_DIR}"

# Vi skriver aldrig över lokala, ospårade kodändringar automatiskt.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Auto-deploy avbruten: repot har lokala ändringar."
  exit 1
fi

echo "Kontrollerar GitHub efter uppdateringar..."
git fetch --quiet origin "${BRANCH}"

REMOTE_SHA="$(git rev-parse "origin/${BRANCH}")"
CURRENT_SHA="$(git rev-parse HEAD)"
DEPLOYED_SHA=""

if [[ -f "${DEPLOYED_SHA_FILE}" ]]; then
  DEPLOYED_SHA="$(cat "${DEPLOYED_SHA_FILE}")"
fi

# Första gången betraktar vi nuvarande lokala version som redan driftsatt.
if [[ -z "${DEPLOYED_SHA}" ]]; then
  DEPLOYED_SHA="${CURRENT_SHA}"
  printf '%s\n' "${DEPLOYED_SHA}" > "${DEPLOYED_SHA_FILE}"
fi

if [[ "${REMOTE_SHA}" == "${DEPLOYED_SHA}" ]]; then
  echo "Ingen ny version att driftsätta."
  exit 0
fi

# Acceptera bara vanliga fast-forward-uppdateringar.
if ! git merge-base --is-ancestor "${CURRENT_SHA}" "${REMOTE_SHA}"; then
  echo "Auto-deploy avbruten: lokala main har divergerat från origin/main."
  exit 1
fi

OLD_SHA="${CURRENT_SHA}"

echo "Ny version hittad: ${REMOTE_SHA}"
git pull --ff-only --quiet origin "${BRANCH}"

install_dependencies_if_needed() {
  local directory="$1"
  local lockfile="$2"

  if [[ ! -d "${directory}/node_modules" ]]; then
    echo "Installerar dependencies i ${directory}..."
    (cd "${directory}" && npm ci)
    return
  fi

  if git diff --quiet "${OLD_SHA}" "${REMOTE_SHA}" -- "${lockfile}"; then
    return
  fi

  echo "package-lock har ändrats i ${directory}; installerar dependencies..."
  (cd "${directory}" && npm ci)
}

install_dependencies_if_needed "homescreen/client" "homescreen/client/package-lock.json"
install_dependencies_if_needed "homescreen/server" "homescreen/server/package-lock.json"

echo "Bygger frontend..."
(cd homescreen/client && npm run build)

echo "Bygger backend..."
(cd homescreen/server && npm run build)

# Markera först efter att båda byggen har lyckats.
printf '%s\n' "${REMOTE_SHA}" > "${DEPLOYED_SHA_FILE}"

echo "Deploy lyckades. Raspberry Pi startas om för att läsa in den nya versionen."
sudo -n systemctl reboot
