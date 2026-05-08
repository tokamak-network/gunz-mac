#!/usr/bin/env bash
# Builds GunZ Mac.app — a self-contained .app bundling Wine, the RefinedGunz
# client, the launcher, and a config.json with the upstream server IP.
#
# Usage:
#   build-app.sh [--server-ip <IP>] [--server-port <PORT>]
# Outputs:
#   dist/GunZ Mac.app
#   dist/GunZ-Mac.zip
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$REPO_ROOT/dist"
STAGE="$DIST/stage"
APP="$DIST/GunZ Mac.app"

SERVER_IP="${GUNZ_SERVER_IP:-203.0.113.10}"
SERVER_PORT="${GUNZ_SERVER_PORT:-6000}"
APP_VERSION="${GUNZ_APP_VERSION:-0.1.0}"

WINE_SRC_DEFAULT="/Users/geonwoo/Workspace/Source-Gunz-Clean-VS-2022/dist/macos/wine-stable/Wine Stable.app/Contents/Resources/wine"
WINE_SRC="${GUNZ_WINE_SRC:-$WINE_SRC_DEFAULT}"

CLIENT_SRC_DEFAULT="/Users/geonwoo/Game/build/refinedgunz"
CLIENT_SRC="${GUNZ_CLIENT_SRC:-$CLIENT_SRC_DEFAULT}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --server-ip) SERVER_IP="$2"; shift 2 ;;
    --server-port) SERVER_PORT="$2"; shift 2 ;;
    --version) APP_VERSION="$2"; shift 2 ;;
    --wine-src) WINE_SRC="$2"; shift 2 ;;
    --client-src) CLIENT_SRC="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,8p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

log() { printf '\033[0;36m[build]\033[0m %s\n' "$*"; }
die() { printf '\033[0;31m[build]\033[0m %s\n' "$*" >&2; exit 1; }

[[ -d "$WINE_SRC" ]] || die "wine 소스가 없습니다: $WINE_SRC (--wine-src로 지정)"
[[ -f "$CLIENT_SRC/Gunz.exe" ]] || die "RefinedGunz 클라이언트가 없습니다: $CLIENT_SRC (--client-src로 지정)"

log "appdir 정리 ($APP)"
rm -rf "$APP" "$STAGE"
mkdir -p "$DIST" "$STAGE"

log "App 골격 생성"
mkdir -p "$APP/Contents/MacOS" \
         "$APP/Contents/Resources/launcher" \
         "$APP/Contents/Resources/wine" \
         "$APP/Contents/Resources/game"

# Info.plist
cat > "$APP/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key><string>GunZ Mac</string>
  <key>CFBundleName</key><string>GunZ Mac</string>
  <key>CFBundleIdentifier</key><string>app.gunz-mac</string>
  <key>CFBundleVersion</key><string>${APP_VERSION}</string>
  <key>CFBundleShortVersionString</key><string>${APP_VERSION}</string>
  <key>CFBundleExecutable</key><string>GunZMac</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSMinimumSystemVersion</key><string>14.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>LSApplicationCategoryType</key><string>public.app-category.action-games</string>
  <key>NSHumanReadableCopyright</key><string>RefinedGunz client (community fork). Wine bundled.</string>
</dict>
</plist>
EOF

# 진입 바이너리 (간단한 bash 래퍼)
cat > "$APP/Contents/MacOS/GunZMac" <<'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "$0")/.." && pwd)"
exec "$DIR/Resources/launcher/launcher.sh" "$@"
EOF
chmod +x "$APP/Contents/MacOS/GunZMac"

log "런처 스크립트 복사"
cp "$REPO_ROOT/client/launcher/launcher.sh" "$APP/Contents/Resources/launcher/launcher.sh"
cp "$REPO_ROOT/client/launcher/forwarder.py" "$APP/Contents/Resources/launcher/forwarder.py"
chmod +x "$APP/Contents/Resources/launcher/launcher.sh"

log "config.json 작성 (server=$SERVER_IP:$SERVER_PORT)"
cat > "$APP/Contents/Resources/config.json" <<EOF
{
  "server_ip": "${SERVER_IP}",
  "server_port": ${SERVER_PORT}
}
EOF

log "Wine 동봉 ($(du -sh "$WINE_SRC" | awk '{print $1}'))"
cp -R "$WINE_SRC/" "$APP/Contents/Resources/wine/"
chmod +x "$APP/Contents/Resources/wine/bin/"* 2>/dev/null || true

log "RefinedGunz 클라이언트 동봉 ($(du -sh "$CLIENT_SRC" | awk '{print $1}'))"
# 게임 자산 복사 (Gunz.dmp나 mlog.txt 같은 잔여 로그는 제외)
rsync -a --exclude='Gunz.dmp' --exclude='mlog.txt' --exclude='.DS_Store' \
  "$CLIENT_SRC/" "$APP/Contents/Resources/game/"

log "쿼런틴 속성 제거"
xattr -cr "$APP" 2>/dev/null || true

log "App 크기"
du -sh "$APP"

log "ZIP 압축"
ZIP_PATH="$DIST/GunZ-Mac-${APP_VERSION}.zip"
( cd "$DIST" && /usr/bin/zip -r -y -q "$(basename "$ZIP_PATH")" "GunZ Mac.app" )
log "결과물: $ZIP_PATH ($(du -sh "$ZIP_PATH" | awk '{print $1}'))"

cat <<EOF

==================== 완료 ====================
.app  : $APP
.zip  : $ZIP_PATH
서버  : $SERVER_IP:$SERVER_PORT

업로드:
  gh release create v$APP_VERSION "$ZIP_PATH" \\
    --title "GunZ Mac v$APP_VERSION" --notes "macOS 패키지"
=============================================
EOF
