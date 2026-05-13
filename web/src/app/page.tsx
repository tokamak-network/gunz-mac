import { fetchLatestRelease, releasesUrl, repoUrl, SITE } from "@/site";

export default async function Page() {
  const release = await fetchLatestRelease();
  const downloadHref = release?.zipUrl ?? releasesUrl();
  const downloadLabel = release ? `Download for macOS (${release.tag})` : "View releases";

  return (
    <main className="page">
      <header className="hero">
        <div className="brand">
          <span className="brand__mark">⌥</span>
          <span className="brand__name">{SITE.title}</span>
        </div>
        <h1 className="hero__title">Play GunZ on your Mac.</h1>
        <p className="hero__sub">{SITE.tagline}</p>
        <div className="cta">
          <a className="btn btn--primary" href={downloadHref}>
            {downloadLabel}
          </a>
          <a className="btn btn--ghost" href={repoUrl()}>GitHub</a>
        </div>
        <p className="hero__meta">
          Apple Silicon · macOS 14+ · ~600MB · Unsigned
        </p>
      </header>

      <section className="section">
        <h2>Installation</h2>
        <ol className="steps">
          <li>
            <strong>Download</strong> and unzip <code>GunZ-Mac.zip</code>.
          </li>
          <li>
            Move <strong>GunZ Mac.app</strong> to the <code>/Applications</code> folder.
          </li>
          <li>
            On first launch, you may see an “unidentified developer” warning.
            <ul>
              <li><strong>Right-click → Open</strong>, then click <strong>Open</strong> again in the dialog.</li>
              <li>Or allow the blocked app from <em>System Settings → Privacy &amp; Security</em>.</li>
            </ul>
          </li>
          <li>
            The first launch takes 1–2 minutes to initialize the Wine environment. Subsequent launches are fast.
          </li>
        </ol>
      </section>

      <section className="section">
        <h2>Changing the Server Address</h2>
        <p>
          By default, the app connects to the server specified in <code>config.json</code>.
          To connect to a different server, edit the settings inside the .app package directly.
        </p>
        <pre>{`# 1. View package contents (right-click → Show Package Contents)
GunZ Mac.app/Contents/Resources/config.json

# 2. Replace the server_ip value with your desired server
{
  "server_ip": "203.0.113.10",
  "server_port": 6000
}`}</pre>
      </section>

      <section className="section">
        <h2>Troubleshooting</h2>
        <details>
          <summary>“The app is damaged and can’t be opened.”</summary>
          <p>
            macOS Gatekeeper has quarantined the app. Run the following in Terminal:
          </p>
          <pre>{`xattr -cr "/Applications/GunZ Mac.app"`}</pre>
        </details>
        <details>
          <summary>The window doesn’t appear or the app quits immediately.</summary>
          <p>
            Check the logs. You’ll find <code>launcher.log</code>, <code>forwarder.log</code>, and <code>gunz.log</code>
            in <code>~/Library/Logs/GunZMac/</code>.
          </p>
        </details>
        <details>
          <summary>Can’t connect to the server.</summary>
          <p>
            Make sure the IP in <code>config.json</code> is correct and port 6000 is open on the server.
            You can check reachability from your Mac with <code>nc -vz &lt;server-ip&gt; 6000</code>.
          </p>
        </details>
        <details>
          <summary>How do I uninstall completely?</summary>
          <pre>{`rm -rf "/Applications/GunZ Mac.app"
rm -rf ~/Library/Application\\ Support/GunZMac
rm -rf ~/Library/Logs/GunZMac`}</pre>
        </details>
      </section>

      <footer className="foot">
        <p>
          This build packages the public RefinedGunz client (Asunaya/RefinedGunz) for macOS.
          GunZ is a trademark of MAIET Entertainment.
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
