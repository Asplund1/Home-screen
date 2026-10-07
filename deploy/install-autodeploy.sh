#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_SYSTEMD_DIR="${HOME}/.config/systemd/user"
STATE_DIR="${HOME}/.local/state/homescreen"
SYSTEMCTL_PATH="$(command -v systemctl)"
SUDOERS_FILE="/etc/sudoers.d/homescreen-autodeploy"

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

echo "Konfigurerar begränsad sudo-rättighet för automatisk reboot..."
if [[ "${SYSTEMCTL_PATH}" != "/usr/bin/systemctl" ]]; then
  echo "Avbryter sudo-konfiguration: systemctl hittades på oväntad plats: ${SYSTEMCTL_PATH}"
  echo "Auto-deploy är installerad, men automatisk reboot är inte aktiverad."
  exit 0
fi

SUDOERS_RULE="${USER} ALL=(root) NOPASSWD: /usr/bin/systemctl reboot"
printf '%s\n' "${SUDOERS_RULE}" | sudo tee "${SUDOERS_FILE}" >/dev/null
sudo chmod 440 "${SUDOERS_FILE}"
sudo visudo -cf "${SUDOERS_FILE}"

echo
echo "Auto-deploy är installerad."
echo "Status: systemctl --user status homescreen-autodeploy.timer"
echo "Nästa körningar: systemctl --user list-timers homescreen-autodeploy.timer"
echo "Logg: journalctl --user -u homescreen-autodeploy.service -n 30"
echo
echo "Framtida uppdateringar på main hämtas, byggs och rebootar Pi:n automatiskt efter lyckad build."
