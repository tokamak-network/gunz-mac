# GitHub repo + Vercel 연동

이 디렉터리(`gunz-mac/`)를 GitHub에 올리고 Vercel로 랜딩 페이지를 배포하는 절차입니다.

## 1. GitHub repo 생성

GitHub.com → **New repository**:
- Repository name: `gunz-mac`
- Public 또는 Private (배포만 한다면 Public 권장)
- README, .gitignore, license 자동 생성은 모두 **OFF** (이미 로컬에 있음)

## 2. 로컬에서 첫 푸시

```bash
cd /Users/geonwoo/Game/gunz-mac

git init
git add .
git commit -m "init: GunZ Mac packaging + server + landing page"

git branch -M main
git remote add origin https://github.com/<YOUR>/gunz-mac.git
git push -u origin main
```

> 큰 빌드 산출물(`dist/`)은 `.gitignore`로 제외됩니다. 이는 GitHub Releases에 별도 업로드합니다.

## 3. Releases에 .zip 업로드

서버 빌드 후 생성된 `dist/GunZ-Mac-<VERSION>.zip`:

```bash
# gh CLI 설치 (한 번만)
brew install gh
gh auth login

# 새 릴리스 생성
gh release create v0.1.0 dist/GunZ-Mac-0.1.0.zip \
  --title "GunZ Mac v0.1.0" \
  --notes "초기 macOS 패키지. Apple Silicon."
```

## 4. Vercel 프로젝트 만들기

1. https://vercel.com → **Sign in with GitHub**
2. **Add New… → Project** → 방금 만든 `gunz-mac` repo 선택
3. **Root Directory**: `web`을 지정 (중요!)
4. **Framework Preset**: Next.js 자동 인식됨
5. **Environment Variables**에 다음 추가:
   - `NEXT_PUBLIC_GITHUB_OWNER` = `<YOUR>`
   - `NEXT_PUBLIC_GITHUB_REPO` = `gunz-mac`
   - `NEXT_PUBLIC_RELEASE_TAG` = `v0.1.0`
   - `NEXT_PUBLIC_ZIP_NAME` = `GunZ-Mac-0.1.0.zip`
6. **Deploy** 클릭

배포 URL은 보통 `https://<project>.vercel.app` 형태로 자동 부여됩니다.

## 5. 사용자 도메인 (선택)

도메인이 있다면 Vercel 프로젝트 설정 → **Domains**에서 추가하고, 도메인 등록업체에서 CNAME 또는 A 레코드를 Vercel이 안내하는 값으로 설정하세요. TLS는 자동 발급됩니다.

## 6. 새 버전 배포 시

1. `packaging/build-app.sh`로 새 버전 빌드
2. `gh release create v<NEW>` 로 .zip 업로드
3. Vercel **Settings → Environment Variables**에서 `NEXT_PUBLIC_RELEASE_TAG`, `NEXT_PUBLIC_ZIP_NAME` 갱신
4. Vercel 대시보드 → **Redeploy**
