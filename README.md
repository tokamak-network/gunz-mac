# GunZ Mac

A package, server, and landing page bundle for running GunZ: The Duel (RefinedGunz) on macOS Apple Silicon.

## Layout

```
gunz-mac/
├─ server/          # Linux VPS deployment scripts
├─ client/launcher/ # In-app launcher and TCP forwarder
├─ packaging/       # GunZ Mac.app build script
├─ web/             # Download landing page deployed to Vercel (Next.js)
└─ docs/            # User and operator guides
```

## Quick Start (overview)

1. **Stand up the server** — run `server/install.sh` on a DigitalOcean droplet to bring up MatchServer.
2. **Build the .app** — run `packaging/build-app.sh --server-ip <DROPLET_IP>` to produce a self-contained `GunZ Mac.app`.
3. **Upload to GitHub Releases** — push the generated `.zip` with `gh release create`.
4. **Deploy the landing page** — connect `web/` to Vercel and surface the download link.

For step-by-step instructions see [docs/digitalocean-setup.md](docs/digitalocean-setup.md) and the sections below.

## 1. Server (Linux VPS)

`server/install.sh` automates the following on an Ubuntu 22.04 droplet:

- Installs WineHQ-stable
- Creates the `gunz` system user
- Downloads RefinedGunz server assets to `/opt/gunz/server`
- Writes a default `server.ini` (test mode, anti-cheat OFF)
- Registers a systemd service (`gunz-server`)
- Configures ufw firewall rules (TCP 6000, UDP 7700-7800)

```bash
# On a DigitalOcean droplet (Ubuntu 22.04)
git clone https://github.com/<YOUR>/gunz-mac.git
cd gunz-mac/server
sudo ./install.sh
```

Operational commands:
```bash
systemctl status gunz-server
journalctl -u gunz-server -f
sudo systemctl restart gunz-server
```

## 2. macOS Client Packaging

`packaging/build-app.sh` bundles the following into a single `.app`:

- Wine 11.0 (macOS build, ~666 MB)
- RefinedGunz client (Gunz.exe + assets, ~277 MB)
- Launcher shell script and Python TCP forwarder
- A `config.json` containing the user's server IP

```bash
./packaging/build-app.sh \
  --server-ip 203.0.113.10 \
  --server-port 6000 \
  --version 0.1.0
# Output: dist/GunZ Mac.app, dist/GunZ-Mac-0.1.0.zip
```

`Gunz.exe` hardcodes the server address to `127.0.0.1`, so on launch the bundle starts a small Python TCP forwarder that relays `127.0.0.1:6000` → `<SERVER_IP>:6000`.

## 3. GitHub Releases Upload

```bash
gh release create v0.1.0 dist/GunZ-Mac-0.1.0.zip \
  --title "GunZ Mac v0.1.0" \
  --notes "macOS Apple Silicon package"
```

## 4. Vercel Landing Page

`web/` is a Next.js 16 project. Importing the GitHub repo from the Vercel dashboard is enough to trigger automatic deployment.

Environment variables:
- `NEXT_PUBLIC_GITHUB_OWNER` — your GitHub user or org
- `NEXT_PUBLIC_GITHUB_REPO` — usually `gunz-mac`
- `NEXT_PUBLIC_RELEASE_TAG` — e.g. `v0.1.0`
- `NEXT_PUBLIC_ZIP_NAME` — e.g. `GunZ-Mac-0.1.0.zip`

Local preview:
```bash
cd web
npm install
npm run dev
```

## 5. Known Limitations and Disclaimer

- The server runs in **test mode**. Authentication, ticketing, and anti-cheat are all disabled.
- The build is based on RefinedGunz v0.6.0 (2018), so a few "missing asset" messages may appear in the logs (gameplay is not affected).
- The macOS bundle is unsigned, so Gatekeeper will block the first launch — right-click → Open to bypass.
- GunZ is a trademark of MAIET Entertainment. This package uses public builds of the community-maintained RefinedGunz fork.

## License

Scripts and website code in this repository are free to modify and redistribute. Rights to the bundled GunZ / RefinedGunz assets remain with their respective copyright holders.
