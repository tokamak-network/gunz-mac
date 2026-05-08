# DigitalOcean에서 GunZ 서버 구축하기

처음 VPS를 사용하는 분도 따라할 수 있도록 단계별로 정리했습니다.

## 1. DigitalOcean 가입과 결제 등록

1. https://www.digitalocean.com/ 접속 → **Sign up**
2. 이메일/Google/GitHub 중 편한 방법으로 가입
3. 신용카드 등록 (소액 인증 결제 후 환불됨)
4. 가입 후 보통 **$200 / 60일 크레딧**이 자동 지급되어 무료로 시작 가능

## 2. Droplet (가상서버) 생성

대시보드에서 **Create → Droplets**.

| 옵션 | 권장 값 |
|------|---------|
| Region | Singapore (한국에서 핑이 가장 낮음) — 또는 SFO/Frankfurt |
| Image | **Ubuntu 22.04 (LTS) x64** |
| Type | **Basic** |
| CPU | Regular (Intel/Disk: SSD) |
| Plan | **$6/mo · 1GB RAM · 1 vCPU · 25GB SSD · 1TB transfer** |
| Authentication | **SSH Key** (권장) — 비밀번호도 가능 |
| Hostname | `gunz-server` |

> SSH 키가 없으면 로컬 Mac에서:
> ```bash
> ssh-keygen -t ed25519 -C "gunz"
> cat ~/.ssh/id_ed25519.pub
> ```
> 출력된 `ssh-ed25519 …` 한 줄을 DigitalOcean **Add SSH Key** 칸에 붙여 넣습니다.

**Create Droplet** 클릭. 약 30~60초 후 droplet이 생성되고 **공인 IPv4 주소**가 표시됩니다. 이 IP가 곧 게임 서버 주소입니다.

## 3. SSH로 접속

```bash
ssh root@<DROPLET_IP>
```

처음 접속 시 fingerprint 확인 → `yes`. SSH 키를 등록했다면 비밀번호 없이 바로 접속됩니다.

## 4. 서버 설치 스크립트 실행

이 저장소를 droplet에 복제한 뒤 `install.sh`를 실행합니다.

```bash
# Git이 없다면
apt-get update && apt-get install -y git

# 저장소 복제 (GitHub repo 생성 후 자신의 URL로 교체)
git clone https://github.com/<YOUR_USER>/gunz-mac.git
cd gunz-mac/server
chmod +x install.sh run-server.sh
sudo ./install.sh
```

스크립트가 다음 작업을 자동 수행합니다.
- 필수 패키지 설치 (curl, unzip, ufw)
- WineHQ 저장소 추가 + Wine 설치
- `gunz` 시스템 사용자 생성
- RefinedGunz 서버 자산 다운로드(`/opt/gunz/server`)
- `server.ini` 기본 설정 작성
- systemd 서비스 등록 (`gunz-server`)
- 방화벽 규칙: TCP 6000, UDP 7700–7800

설치가 끝나면 마지막에 **공인 IP**와 사용 안내가 출력됩니다. 이 IP를 클라이언트 `config.json`에 적어 주세요.

## 5. 서비스 상태 확인

```bash
systemctl status gunz-server      # 동작 확인
journalctl -u gunz-server -f      # 실시간 로그
ss -tnlp | grep 6000              # 포트 6000 LISTEN 확인
```

## 6. 외부에서 포트 도달 확인

로컬 Mac 터미널에서:
```bash
nc -vz <DROPLET_IP> 6000
```
`Connection succeeded` 가 나오면 인터넷에서 접속 가능합니다.

## 7. 자주 쓰는 운영 명령

```bash
sudo systemctl restart gunz-server     # 재시작
sudo systemctl stop gunz-server        # 정지
sudo tail -f /var/log/gunz-server.log  # 게임 서버 로그
```

설정을 바꾸려면 `/opt/gunz/server/server.ini`를 편집한 뒤 `systemctl restart gunz-server`.

## 8. 비용 관리 팁

- 더 이상 안 쓰는 droplet은 **반드시 Destroy**해야 과금이 멈춥니다.
- **Snapshot**으로 백업해 두면 destroy 후 같은 상태로 복원 가능 (스냅샷은 별도 소액 과금).

## 문제 해결

| 증상 | 확인 |
|------|------|
| `wine: command not found` | `apt-get install --install-recommends winehq-stable` 다시 실행 |
| 포트가 LISTEN 안 됨 | `journalctl -u gunz-server -n 100` 로 에러 확인 |
| 클라이언트에서 접속 실패 | `ufw status`로 6000 포트 허용 여부 확인 |
| 한국에서 핑이 높음 | droplet region을 Singapore로 재생성 |
