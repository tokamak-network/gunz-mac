#!/usr/bin/env bash
# MatchServer.exe 실행 래퍼 (systemd unit이 호출)
set -euo pipefail

INSTALL_DIR="/opt/gunz"
export WINEPREFIX="${WINEPREFIX:-$INSTALL_DIR/wineprefix}"
export WINEDEBUG="${WINEDEBUG:-fixme-all,err-all}"
export DISPLAY="${DISPLAY:-}"

mkdir -p "$WINEPREFIX"

# Wine prefix 초기화 (최초 1회)
if [[ ! -f "$WINEPREFIX/system.reg" ]]; then
  WINEDLLOVERRIDES="mscoree=,mshtml=" wineboot --init >/dev/null 2>&1 || true
  # wineserver가 백그라운드에 남는 경우 종료 대기
  wineserver -w 2>/dev/null || true
fi

cd "$INSTALL_DIR/server"
exec wine MatchServer.exe
