# GunZ Mac

macOS Apple Silicon에서 GunZ: The Duel(RefinedGunz)을 실행하기 위한 패키지·서버·랜딩 페이지 모음입니다.

## 구성

```
gunz-mac/
├─ server/          # Linux VPS 서버 배포 스크립트
├─ client/launcher/ # .app 안에 들어가는 런처와 TCP 포워더
├─ packaging/       # GunZ Mac.app 빌드 스크립트
├─ web/             # Vercel에 배포하는 다운로드 랜딩 페이지 (Next.js)
└─ docs/            # 사용자/운영자용 가이드
```

## 빠르게 시작하기 (개요)

1. **서버 구축** — DigitalOcean droplet에 `server/install.sh`를 실행해 MatchServer를 띄웁니다.
2. **.app 빌드** — `packaging/build-app.sh --server-ip <DROPLET_IP>`로 self-contained `GunZ Mac.app`을 만듭니다.
3. **GitHub Releases 업로드** — 생성된 `.zip`을 `gh release create`로 업로드합니다.
4. **랜딩 페이지 배포** — `web/`을 Vercel에 연결하고 다운로드 링크를 노출합니다.

자세한 단계는 [docs/digitalocean-setup.md](docs/digitalocean-setup.md)와 아래 설명을 따르세요.

## 1. 서버 (Linux VPS)

`server/install.sh`는 Ubuntu 22.04 droplet에서 다음 작업을 자동으로 처리합니다.

- WineHQ-stable 설치
- `gunz` 시스템 사용자 생성
- RefinedGunz 서버 자산 다운로드(`/opt/gunz/server`)
- `server.ini` 기본 설정 작성 (test 모드, 안티치트 OFF)
- systemd 서비스 등록 (`gunz-server`)
- ufw 방화벽 규칙 (TCP 6000, UDP 7700-7800)

```bash
# DigitalOcean droplet (Ubuntu 22.04)에서
git clone https://github.com/<YOUR>/gunz-mac.git
cd gunz-mac/server
sudo ./install.sh
```

운영 명령:
```bash
systemctl status gunz-server
journalctl -u gunz-server -f
sudo systemctl restart gunz-server
```

## 2. macOS 클라이언트 패키징

`packaging/build-app.sh`가 다음 항목을 하나의 `.app`으로 묶습니다.

- Wine 11.0 (Mac용, 약 666MB)
- RefinedGunz 클라이언트 (Gunz.exe + 자산, 약 277MB)
- 런처 셸 스크립트와 Python TCP 포워더
- 사용자 서버 IP가 적힌 `config.json`

```bash
./packaging/build-app.sh \
  --server-ip 203.0.113.10 \
  --server-port 6000 \
  --version 0.1.0
# 결과: dist/GunZ Mac.app, dist/GunZ-Mac-0.1.0.zip
```

`Gunz.exe`가 서버 주소를 `127.0.0.1`로 하드코딩해 두었기 때문에, 런처가 실행 시 `127.0.0.1:6000` → `<서버IP>:6000`으로 트래픽을 중계하는 작은 Python TCP 포워더를 띄웁니다.

## 3. GitHub Releases 업로드

```bash
gh release create v0.1.0 dist/GunZ-Mac-0.1.0.zip \
  --title "GunZ Mac v0.1.0" \
  --notes "macOS Apple Silicon 패키지"
```

## 4. Vercel 랜딩 페이지

`web/`은 Next.js 16 프로젝트입니다. Vercel 대시보드에서 GitHub repo를 import하면 자동 배포됩니다.

환경변수:
- `NEXT_PUBLIC_GITHUB_OWNER` — 자신의 GitHub 사용자/조직
- `NEXT_PUBLIC_GITHUB_REPO` — 보통 `gunz-mac`
- `NEXT_PUBLIC_RELEASE_TAG` — 예: `v0.1.0`
- `NEXT_PUBLIC_ZIP_NAME` — 예: `GunZ-Mac-0.1.0.zip`

로컬 미리보기:
```bash
cd web
npm install
npm run dev
```

## 5. 알려진 제약과 면책

- 서버는 **test 모드**로 동작합니다. 인증/티켓/안티치트는 모두 꺼져 있습니다.
- RefinedGunz v0.6.0(2018년 빌드)을 기반으로 하므로 일부 자산이 누락된 메시지가 로그에 보일 수 있습니다 (게임 동작에는 영향 없음).
- macOS 코드 서명을 하지 않았으므로 Gatekeeper가 첫 실행을 막습니다 — 우클릭 → 열기로 우회.
- GunZ는 MAIET Entertainment의 상표입니다. 본 패키지는 RefinedGunz 커뮤니티 포크의 공개 빌드를 사용합니다.

## 라이선스

이 저장소의 스크립트와 웹사이트 코드는 자유롭게 수정/재배포 가능합니다. 동봉되는 GunZ/RefinedGunz 자산의 권리는 각 저작권자에게 있습니다.
