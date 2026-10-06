#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_SYSTEMD_DIR="${HOME}/.config/systemd/user"
STATE_DIR="${HOME}/.local/state/homescreen"

mkdir -p "${USER_SYSTEMD_DIR}" "${STATE_DIR}"

cd "${REPO_DIR}"

echo "Installerar dependencies vid behov..."
if [[ ! -d homescreen/client/node_modules ]]; then
  (cd homescreen/client && npm ci)
fi

if [[ ! -d homescreen/server/node_modules ]]; then
  (cd homescreen/server && npm ci)
fi

echo "Bygger nuvarande version..."
(cd homescreen/client && npm run build)
(cd homescreen/server && npm run build)

# Nuvarande commit är den version som precis byggdes och betraktas som driftsatt.
git rev-parse HEAD > "${STATE_DIR}/deployed-sha"

cp deploy/homescreen-autodeploy.service "${USER_SYSTEMD_DIR}/homescreen-autodeploy.service"
cp deploy/homescreen-autodeploy.timer "${USER_SYSTEMD_DIR}/homescreen-autodeploy.timer"

systemctl --user daemon-reload
systemctl --user enable --now homescreen-autodeploy.timer

echo
echo "Auto-deploy-timern är installerad."
echo "Status: systemctl --user status homescreen-autodeploy.timer"
echo "Nästa körningar: systemctl --user list-timers homescreen-autodeploy.timer"
echo
echo "OBS: automatisk reboot efter lyckad deploy kräver ett separat, begränsat sudo-tillstånd för 'systemctl reboot'."
