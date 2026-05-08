import { downloadUrl, repoUrl, SITE } from "@/site";

export default function Page() {
  return (
    <main className="page">
      <header className="hero">
        <div className="brand">
          <span className="brand__mark">⌥</span>
          <span className="brand__name">{SITE.title}</span>
        </div>
        <h1 className="hero__title">Mac에서 GunZ를 즐기세요.</h1>
        <p className="hero__sub">{SITE.tagline}</p>
        <div className="cta">
          <a className="btn btn--primary" href={downloadUrl()}>
            macOS용 다운로드 ({SITE.releaseTag})
          </a>
          <a className="btn btn--ghost" href={repoUrl()}>GitHub</a>
        </div>
        <p className="hero__meta">
          Apple Silicon · macOS 14+ · 약 600MB · 코드 서명 없음
        </p>
      </header>

      <section className="section">
        <h2>설치 방법</h2>
        <ol className="steps">
          <li>
            <strong>다운로드</strong>한 <code>GunZ-Mac.zip</code>의 압축을 풉니다.
          </li>
          <li>
            <strong>GunZ Mac.app</strong>을 <code>/Applications</code> 폴더로 이동합니다.
          </li>
          <li>
            처음 실행 시 “확인되지 않은 개발자” 경고가 뜹니다.
            <ul>
              <li>앱을 <strong>우클릭 → 열기</strong> 후 다이얼로그에서 <strong>열기</strong>를 다시 클릭하세요.</li>
              <li>또는 <em>시스템 설정 → 개인정보 보호 및 보안</em>에서 차단된 앱을 허용하세요.</li>
            </ul>
          </li>
          <li>
            첫 실행 시 Wine 환경 초기화로 1~2분이 걸립니다. 이후 실행은 빠릅니다.
          </li>
        </ol>
      </section>

      <section className="section">
        <h2>서버 주소 변경</h2>
        <p>
          기본적으로 <code>config.json</code>에 적힌 서버로 접속합니다.
          다른 서버에 붙으려면 .app 패키지 안의 설정을 직접 편집하세요.
        </p>
        <pre>{`# 1. 앱 패키지 내부 보기 (우클릭 → 패키지 내용 보기)
GunZ Mac.app/Contents/Resources/config.json

# 2. server_ip 값을 원하는 서버로 교체
{
  "server_ip": "203.0.113.10",
  "server_port": 6000
}`}</pre>
      </section>

      <section className="section">
        <h2>문제 해결</h2>
        <details>
          <summary>실행 시 “손상되어 열 수 없습니다”라고 나옵니다.</summary>
          <p>
            macOS Gatekeeper가 격리한 상태입니다. 터미널에서 다음을 실행하세요:
          </p>
          <pre>{`xattr -cr "/Applications/GunZ Mac.app"`}</pre>
        </details>
        <details>
          <summary>창이 안 뜨거나 즉시 종료됩니다.</summary>
          <p>
            로그를 확인하세요. <code>~/Library/Logs/GunZMac/</code>에
            <code>launcher.log</code>, <code>forwarder.log</code>, <code>gunz.log</code>가 있습니다.
          </p>
        </details>
        <details>
          <summary>서버에 접속할 수 없습니다.</summary>
          <p>
            <code>config.json</code>의 IP가 정확한지, 서버에서 6000번 포트가 열려 있는지 확인하세요.
            로컬 Mac에서 <code>nc -vz &lt;서버IP&gt; 6000</code>으로 도달 가능 여부를 점검할 수 있습니다.
          </p>
        </details>
        <details>
          <summary>완전히 삭제하려면?</summary>
          <pre>{`rm -rf "/Applications/GunZ Mac.app"
rm -rf ~/Library/Application\\ Support/GunZMac
rm -rf ~/Library/Logs/GunZMac`}</pre>
        </details>
      </section>

      <footer className="foot">
        <p>
          이 빌드는 RefinedGunz(Asunaya/RefinedGunz)의 공개 클라이언트를 macOS용으로 패키징한 것입니다.
          GunZ는 MAIET Entertainment의 상표입니다.
        </p>
      </footer>

      <style>{`
        .page { max-width: 880px; margin: 0 auto; padding: 56px 24px 96px; }
        .hero { padding: 56px 0 24px; border-bottom: 1px solid var(--line); }
        .brand { display: flex; align-items: center; gap: 10px; color: var(--muted); letter-spacing: .12em; text-transform: uppercase; font-size: 12px; }
        .brand__mark { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 6px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #1a0f06; font-weight: 800; }
        .hero__title { font-size: clamp(36px, 6vw, 56px); line-height: 1.1; margin: 24px 0 12px; letter-spacing: -.02em; }
        .hero__sub { color: var(--muted); font-size: 18px; margin: 0 0 28px; }
        .cta { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; padding: 14px 20px; border-radius: 12px; font-weight: 600; text-decoration: none; transition: transform .12s ease, background .12s ease; }
        .btn--primary { background: linear-gradient(135deg, var(--accent), #ff8a3a); color: #160805; }
        .btn--primary:hover { transform: translateY(-1px); }
        .btn--ghost { border: 1px solid var(--line); color: var(--fg); }
        .btn--ghost:hover { background: var(--bg-2); }
        .hero__meta { margin-top: 18px; color: var(--muted); font-size: 13px; }
        .section { margin-top: 48px; }
        .section h2 { font-size: 22px; margin: 0 0 16px; letter-spacing: -.01em; }
        .steps { padding-left: 22px; }
        .steps > li { margin: 10px 0; }
        details { border: 1px solid var(--line); border-radius: 10px; padding: 12px 16px; margin: 10px 0; background: var(--bg-2); }
        details > summary { cursor: pointer; font-weight: 600; }
        .foot { margin-top: 64px; padding-top: 24px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }
      `}</style>
    </main>
  );
}
