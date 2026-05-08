#!/usr/bin/env bash
# .app 내부의 진짜 진입점.
# Resources/config.json을 읽어 TCP 포워더를 띄우고 Gunz.exe를 실행한다.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# launcher.sh sits at Contents/Resources/launcher/, so Resources is its parent
RES="$(cd "$SCRIPT_DIR/.." && pwd)"

CONFIG="$RES/config.json"
WINE_BIN="$RES/wine/bin/wine"
GAME_DIR="$RES/game"
FORWARDER="$RES/launcher/forwarder.py"

export WINEPREFIX="${WINEPREFIX:-$HOME/Library/Application Support/GunZMac/wineprefix}"
export WINEDEBUG="${WINEDEBUG:--all}"

LOG_DIR="$HOME/Library/Logs/GunZMac"
mkdir -p "$LOG_DIR" "$WINEPREFIX"

log() { printf '[gunz] %s\n' "$*" | tee -a "$LOG_DIR/launcher.log"; }
die() {
  log "ERROR: $*"
  osascript -e "display alert \"GunZ Mac\" message \"$*\" as critical" >/dev/null 2>&1 || true
  exit 1
}

read_json_field() {
  /usr/bin/python3 -c "import json,sys
with open(sys.argv[1]) as f:
    print(json.load(f).get(sys.argv[2], ''))" "$1" "$2"
}

[[ -f "$CONFIG" ]] || die "config.json이 없습니다: $CONFIG"
SERVER_IP="$(read_json_field "$CONFIG" server_ip)"
SERVER_PORT="$(read_json_field "$CONFIG" server_port)"
SERVER_PORT="${SERVER_PORT:-6000}"
[[ -n "$SERVER_IP" ]] || die "config.json의 server_ip가 비어 있습니다."

[[ -x "$WINE_BIN" ]] || die "Wine 바이너리가 없습니다: $WINE_BIN"
[[ -f "$GAME_DIR/Gunz.exe" ]] || die "Gunz.exe가 없습니다: $GAME_DIR/Gunz.exe"
[[ -f "$FORWARDER" ]] || die "forwarder.py가 없습니다: $FORWARDER"

log "==== GunZ Mac launch $(date '+%F %T') ===="
log "server: $SERVER_IP:$SERVER_PORT"
log "wineprefix: $WINEPREFIX"

# 첫 실행 시 wine prefix 초기화
if [[ ! -f "$WINEPREFIX/system.reg" ]]; then
  log "Wine prefix 초기화 중..."
  WINEDLLOVERRIDES="mscoree=,mshtml=" "$WINE_BIN" wineboot --init >>"$LOG_DIR/wineboot.log" 2>&1 || true
  "$RES/wine/bin/wineserver" -w 2>/dev/null || true
fi

# TCP 포워더 시작 (127.0.0.1:PORT -> SERVER_IP:PORT)
# 서버가 이미 로컬에 있으면 포워더 불필요
FWD_PID=""
if [[ "$SERVER_IP" != "127.0.0.1" && "$SERVER_IP" != "localhost" ]]; then
  /usr/bin/python3 "$FORWARDER" \
    --listen "127.0.0.1:$SERVER_PORT" \
    --upstream "$SERVER_IP:$SERVER_PORT" \
    >>"$LOG_DIR/forwarder.log" 2>&1 &
  FWD_PID=$!
  log "forwarder PID: $FWD_PID ($SERVER_IP:$SERVER_PORT)"
else
  log "server is localhost; skipping forwarder"
fi

cleanup() {
  log "shutdown"
  if [[ -n "$FWD_PID" ]]; then
    kill "$FWD_PID" 2>/dev/null || true
    wait "$FWD_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

cd "$GAME_DIR"
log "launching Gunz.exe"
"$WINE_BIN" Gunz.exe "$@" >>"$LOG_DIR/gunz.log" 2>&1
RC=$?
log "Gunz.exe exited with code $RC"
exit $RC
