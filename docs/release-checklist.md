# 릴리스 체크리스트

새 버전을 배포할 때 따라가는 순서입니다.

## 1. 서버

- [ ] Droplet에서 `git pull && sudo systemctl restart gunz-server`
- [ ] `journalctl -u gunz-server -n 50`로 정상 기동 확인
- [ ] 외부에서 `nc -vz <DROPLET_IP> 6000` 성공

## 2. 빌드

```bash
./packaging/build-app.sh \
  --server-ip <DROPLET_IP> \
  --server-port 6000 \
  --version <NEW_VERSION>
```

- [ ] `dist/GunZ Mac.app`을 직접 실행해 로그인 화면까지 도달 확인
- [ ] `~/Library/Logs/GunZMac/launcher.log`에서 `forwarder PID:` 줄 확인
- [ ] `dist/GunZ-Mac-<VERSION>.zip` 크기가 비정상적으로 작지 않은지 확인 (~580MB)

## 3. GitHub Releases

```bash
gh release create v<VERSION> dist/GunZ-Mac-<VERSION>.zip \
  --title "GunZ Mac v<VERSION>" \
  --notes-file docs/RELEASE_NOTES_<VERSION>.md
```

- [ ] 다운로드 URL 클릭으로 정상 다운로드 확인

## 4. 랜딩 페이지

Vercel 대시보드 → 프로젝트 환경변수 갱신:
- `NEXT_PUBLIC_RELEASE_TAG=v<VERSION>`
- `NEXT_PUBLIC_ZIP_NAME=GunZ-Mac-<VERSION>.zip`

`Redeploy`로 반영.

- [ ] 사이트에서 다운로드 버튼이 새 .zip을 가리키는지 확인
- [ ] 수동으로 한 번 다운로드 → 압축 해제 → 실행 검증

## 5. 모니터링

릴리스 후 24시간 동안:
- [ ] `journalctl -u gunz-server -n 200 | grep -i error`
- [ ] DigitalOcean 대시보드에서 트래픽/CPU 급증 여부 확인
