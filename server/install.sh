#!/usr/bin/env bash
# GunZ MatchServer 설치 스크립트 (Ubuntu 22.04)
# 사용법: VPS에 SSH로 접속한 뒤 root 권한으로 실행
#   curl -fsSL https://raw.githubusercontent.com/<USER>/gunz-mac/main/server/install.sh | sudo bash
# 또는 저장소를 클론한 뒤:
#   cd gunz-mac/server && sudo ./install.sh

set -euo pipefail

GUNZ_USER="gunz"
INSTALL_DIR="/opt/gunz"
SERVER_PORT="${SERVER_PORT:-6000}"
ASSET_URL="${ASSET_URL:-https://github.com/Asunaya/RefinedGunz/releases/download/v0.6.0/RGunz.zip}"

log() { printf '\033[0;36m[gunz]\033[0m %s\n' "$*"; }
err() { printf '\033[0;31m[gunz]\033[0m %s\n' "$*" >&2; }

require_root() {
  if [[ $EUID -ne 0 ]]; then
    err "이 스크립트는 root 권한이 필요합니다. sudo 로 실행해 주세요."
    exit 1
  fi
}

install_packages() {
  log "필수 패키지 설치"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y --no-install-recommends \
    ca-certificates curl unzip wget \
    ufw \
    software-properties-common \
    gnupg lsb-release
}

install_wine() {
  log "Wine 설치 (winehq-stable)"
  dpkg --add-architecture i386
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://dl.winehq.org/wine-builds/winehq.key | gpg --dearmor -o /etc/apt/keyrings/winehq-archive.key
  local UBUNTU_CODENAME
  UBUNTU_CODENAME="$(lsb_release -cs)"
  curl -fsSL "https://dl.winehq.org/wine-builds/ubuntu/dists/${UBUNTU_CODENAME}/winehq-${UBUNTU_CODENAME}.sources" \
    -o "/etc/apt/sources.list.d/winehq-${UBUNTU_CODENAME}.sources"
  apt-get update -y
  apt-get install -y --install-recommends winehq-stable || apt-get install -y wine
}

create_user() {
  if ! id -u "$GUNZ_USER" >/dev/null 2>&1; then
    log "사용자 $GUNZ_USER 생성"
    useradd --system --create-home --shell /bin/bash "$GUNZ_USER"
  fi
  install -d -o "$GUNZ_USER" -g "$GUNZ_USER" "$INSTALL_DIR" "$INSTALL_DIR/wineprefix"
}

download_server() {
  log "RefinedGunz 서버 자산 다운로드"
  local tmp
  tmp="$(mktemp -d)"
  curl -fL --retry 3 -o "$tmp/rgunz.zip" "$ASSET_URL"
  unzip -q "$tmp/rgunz.zip" -d "$tmp/unpacked"
  if [[ ! -d "$tmp/unpacked/Server" ]]; then
    err "RGunz 패키지에서 Server 폴더를 찾을 수 없습니다."
    exit 1
  fi
  rm -rf "$INSTALL_DIR/server"
  cp -R "$tmp/unpacked/Server" "$INSTALL_DIR/server"
  chown -R "$GUNZ_USER:$GUNZ_USER" "$INSTALL_DIR/server"
  rm -rf "$tmp"
}

write_config() {
  log "server.ini 기본 설정 적용"
  local INI="$INSTALL_DIR/server/server.ini"
  if [[ -f "$INI" ]]; then
    cp "$INI" "$INI.orig"
  fi
  cat > "$INI" <<EOF
[SERVER]
MAXUSER=500
SERVERID=1
SERVERNAME="GunZ Mac Server"
FREELOGINIP=""
KEEPERIP="127.0.0.1"
MONITORIP="127.0.0.1"
MONITORPORT=9000
MODE="test"
COUNTRY="BRZ"
LANGUAGE="BRZ"
USETICKET="0"

[LANGUAGE]
LANG_TYPE="eng"

[LOCALE]
DBAgentPort=5100
DBAgentIP=127.0.0.1

[FILTER]
USE="0"
ACCEPT_INVALID_IP="1"

[ENVIRONMENT]
USE_HSHIELD="0"
USE_XTRAP="0"
USE_EVENT="0"
USE_FILECRC="0"
USE_MD5="0"
EOF
  chown "$GUNZ_USER:$GUNZ_USER" "$INI"
}

install_systemd() {
  log "systemd 서비스 등록"
  install -m 0755 -o root -g root "$(dirname "$0")/run-server.sh" "$INSTALL_DIR/run-server.sh" 2>/dev/null \
    || cp "$(dirname "$0")/run-server.sh" "$INSTALL_DIR/run-server.sh"
  chmod +x "$INSTALL_DIR/run-server.sh"
  cp "$(dirname "$0")/systemd/gunz-server.service" /etc/systemd/system/gunz-server.service
  systemctl daemon-reload
  systemctl enable gunz-server.service
  systemctl restart gunz-server.service
}

configure_firewall() {
  log "방화벽 (ufw) 규칙 적용"
  ufw allow OpenSSH || true
  ufw allow "${SERVER_PORT}"/tcp comment "GunZ MatchServer TCP" || true
  ufw allow 7700:7800/udp comment "GunZ game UDP" || true
  yes | ufw enable || true
  ufw status verbose || true
}

print_summary() {
  log "설치 완료"
  cat <<EOF

==================== 요약 ====================
설치 위치 : $INSTALL_DIR
실행 사용자 : $GUNZ_USER
서비스    : systemctl status gunz-server
TCP 포트  : $SERVER_PORT
UDP 포트  : 7700-7800

서버 IP 확인:
  curl -s ifconfig.me
이 IP를 클라이언트 설정(config.json)에 입력하면 접속됩니다.
=============================================
EOF
}

main() {
  require_root
  install_packages
  install_wine
  create_user
  download_server
  write_config
  install_systemd
  configure_firewall
  print_summary
}

main "$@"
