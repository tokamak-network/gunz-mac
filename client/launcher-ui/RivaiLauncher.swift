// RIVAI Launcher — cinematic SwiftUI launcher for the GunZ Mac bundle.
//
// Compile (release):
//   swiftc -O -parse-as-library -target arm64-apple-macosx14.0 \
//     -framework AppKit -framework SwiftUI \
//     client/launcher-ui/RivaiLauncher.swift \
//     -o dist/stage/GunZMac
//
// The compiled binary is dropped into `GunZ Mac.app/Contents/MacOS/GunZMac`.
// It reads `Contents/Resources/config.json`, shows a launcher window, and on
// PLAY spawns `Contents/Resources/launcher/launcher.sh` which actually runs
// the TCP/UDP forwarders + Wine + Gunz.exe.

import SwiftUI
import AppKit

// MARK: - App entry

@main
struct RivaiLauncherApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup("RIVAI") {
            ContentView(model: appDelegate.model)
                .frame(width: 1120, height: 700)
                .background(WindowConfigurator())
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    let model = LauncherModel()

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    func applicationWillTerminate(_ notification: Notification) {
        model.stop()
    }
}

private struct WindowConfigurator: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let v = NSView()
        DispatchQueue.main.async {
            if let win = v.window {
                win.titlebarAppearsTransparent = true
                win.isMovableByWindowBackground = true
                win.standardWindowButton(.miniaturizeButton)?.isHidden = true
                win.standardWindowButton(.zoomButton)?.isHidden = true
                win.backgroundColor = .black
            }
        }
        return v
    }
    func updateNSView(_ nsView: NSView, context: Context) {}
}

// MARK: - Model

struct ServerConfig: Decodable {
    let server_ip: String
    let server_port: Int?
}

enum LaunchState: Equatable {
    case idle
    case running
    case error(String)
}

final class LauncherModel: ObservableObject {
    @Published var state: LaunchState = .idle
    @Published var serverIP: String = "—"
    @Published var serverPort: Int = 6000
    @Published var version: String = "0.0.0"

    private var task: Process?

    init() {
        loadConfig()
        if let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
            version = v
        }
    }

    private func loadConfig() {
        guard let res = Bundle.main.resourcePath else { return }
        let cfg = URL(fileURLWithPath: res).appendingPathComponent("config.json")
        if let data = try? Data(contentsOf: cfg),
           let parsed = try? JSONDecoder().decode(ServerConfig.self, from: data) {
            serverIP = parsed.server_ip
            serverPort = parsed.server_port ?? 6000
        }
    }

    func play() {
        guard case .idle = state else { return }
        guard let res = Bundle.main.resourcePath else {
            state = .error("Resource path not found")
            return
        }
        let script = URL(fileURLWithPath: res)
            .appendingPathComponent("launcher")
            .appendingPathComponent("launcher.sh")
        guard FileManager.default.fileExists(atPath: script.path) else {
            state = .error("launcher.sh not found")
            return
        }

        let p = Process()
        p.executableURL = URL(fileURLWithPath: "/bin/bash")
        p.arguments = [script.path]
        p.environment = ProcessInfo.processInfo.environment
        p.terminationHandler = { [weak self] proc in
            DispatchQueue.main.async {
                guard let self = self else { return }
                if proc.terminationStatus == 0 || proc.terminationReason == .uncaughtSignal {
                    self.state = .idle
                } else {
                    self.state = .error("Game exited with code \(proc.terminationStatus). Check Logs.")
                }
                self.task = nil
                NSApp.activate(ignoringOtherApps: true)
            }
        }
        do {
            try p.run()
            task = p
            state = .running
        } catch {
            state = .error(error.localizedDescription)
        }
    }

    func stop() {
        task?.terminate()
        task = nil
    }

    func openLogs() {
        let path = ("~/Library/Logs/GunZMac" as NSString).expandingTildeInPath
        try? FileManager.default.createDirectory(atPath: path, withIntermediateDirectories: true)
        NSWorkspace.shared.open(URL(fileURLWithPath: path))
    }

    func openServerSettings() {
        guard let res = Bundle.main.resourcePath else { return }
        let cfg = URL(fileURLWithPath: res).appendingPathComponent("config.json")
        NSWorkspace.shared.activateFileViewerSelecting([cfg])
    }
}

// MARK: - Theme

private enum Theme {
    static let ember = Color(red: 1.00, green: 0.36, blue: 0.18)
    static let emberDim = Color(red: 0.95, green: 0.45, blue: 0.18)
    static let bronze = Color(red: 0.80, green: 0.55, blue: 0.28)
    static let bg0 = Color(red: 0.03, green: 0.02, blue: 0.03)
    static let bg1 = Color(red: 0.07, green: 0.04, blue: 0.04)
    static let panel = Color.white.opacity(0.04)
    static let panelLine = Color.white.opacity(0.07)
    static let textHi = Color.white
    static let textMid = Color.white.opacity(0.62)
    static let textLo = Color.white.opacity(0.32)
}

// MARK: - Ember particle background

private struct Ember {
    var xRel: CGFloat
    var phase: CGFloat
    var speed: CGFloat
    var wiggleAmp: CGFloat
    var wiggleFreq: CGFloat
    var radius: CGFloat
    var brightness: CGFloat
}

private struct EmberField: View {
    let embers: [Ember]

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0/60.0)) { ctx in
            Canvas { gc, size in
                let t = ctx.date.timeIntervalSinceReferenceDate
                for e in embers {
                    let raw = (t * Double(e.speed) + Double(e.phase))
                    let progress = CGFloat(raw - floor(raw))
                    let baseX = e.xRel * size.width
                    let wiggle = sin(progress * .pi * 2 * e.wiggleFreq) * e.wiggleAmp
                    let x = baseX + wiggle
                    let y = size.height - progress * size.height * 1.05
                    let life = pow(1 - progress, 1.3)
                    let twinkle = 0.6 + 0.4 * sin(progress * 18)
                    let alpha = life * e.brightness * twinkle
                    let r = e.radius * (0.7 + 0.6 * life)
                    let rect = CGRect(x: x - r, y: y - r, width: r * 2, height: r * 2)
                    let color = Color(
                        red: 1.0,
                        green: 0.35 + 0.30 * Double(life),
                        blue: 0.10 + 0.10 * Double(life),
                        opacity: Double(alpha)
                    )
                    gc.fill(Path(ellipseIn: rect), with: .color(color))
                }
            }
        }
        .blendMode(.plusLighter)
        .allowsHitTesting(false)
    }

    static func make(count: Int) -> [Ember] {
        (0..<count).map { _ in
            Ember(
                xRel: CGFloat.random(in: 0...1),
                phase: CGFloat.random(in: 0...1),
                speed: CGFloat.random(in: 0.04...0.13),
                wiggleAmp: CGFloat.random(in: 8...28),
                wiggleFreq: CGFloat.random(in: 0.4...1.4),
                radius: CGFloat.random(in: 0.7...2.2),
                brightness: CGFloat.random(in: 0.35...0.95)
            )
        }
    }
}

// MARK: - Pulse (idle ring around PLAY)

private struct PulseRing: View {
    @State private var animate = false
    var body: some View {
        Circle()
            .stroke(Theme.ember.opacity(0.35), lineWidth: 1)
            .scaleEffect(animate ? 1.35 : 1.0)
            .opacity(animate ? 0 : 0.7)
            .onAppear {
                withAnimation(.easeOut(duration: 2.4).repeatForever(autoreverses: false)) {
                    animate = true
                }
            }
    }
}

// MARK: - Content

struct ContentView: View {
    @ObservedObject var model: LauncherModel
    @State private var embers = EmberField.make(count: 90)
    @State private var hoverPlay = false

    var body: some View {
        ZStack {
            backdrop
            EmberField(embers: embers)
            vignette
            grain

            VStack(spacing: 0) {
                topBar
                    .padding(.horizontal, 36)
                    .padding(.top, 22)
                    .padding(.bottom, 14)

                Divider().background(Theme.panelLine)

                HStack(alignment: .top, spacing: 28) {
                    leftPane
                    rightPane
                        .frame(width: 320)
                }
                .padding(.horizontal, 36)
                .padding(.top, 28)
                .padding(.bottom, 18)

                Spacer(minLength: 0)

                bottomBar
                    .padding(.horizontal, 36)
                    .padding(.bottom, 28)
            }
        }
        .preferredColorScheme(.dark)
    }

    // MARK: backdrop

    private var backdrop: some View {
        ZStack {
            Theme.bg0
            LinearGradient(
                colors: [Theme.bg1, Theme.bg0, .black],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
            // forge glow
            RadialGradient(
                colors: [Theme.ember.opacity(0.30), .clear],
                center: UnitPoint(x: 0.82, y: 1.10),
                startRadius: 30,
                endRadius: 640
            )
            // dawn rim
            RadialGradient(
                colors: [Theme.bronze.opacity(0.12), .clear],
                center: UnitPoint(x: 0.10, y: -0.10),
                startRadius: 30,
                endRadius: 500
            )
        }
        .ignoresSafeArea()
    }

    private var vignette: some View {
        RadialGradient(
            colors: [.clear, .clear, .black.opacity(0.55)],
            center: .center,
            startRadius: 240,
            endRadius: 760
        )
        .allowsHitTesting(false)
        .ignoresSafeArea()
    }

    // Subtle film grain via repeating tiny noise dots.
    private var grain: some View {
        Canvas { gc, size in
            var rng = SystemRandomNumberGenerator()
            let count = 380
            for _ in 0..<count {
                let x = CGFloat(Double(rng.next() % 10_000) / 10_000.0) * size.width
                let y = CGFloat(Double(rng.next() % 10_000) / 10_000.0) * size.height
                let a = Double(rng.next() % 1000) / 22_000.0 + 0.005
                gc.fill(
                    Path(ellipseIn: CGRect(x: x, y: y, width: 0.8, height: 0.8)),
                    with: .color(Color.white.opacity(a))
                )
            }
        }
        .allowsHitTesting(false)
        .opacity(0.5)
        .blendMode(.softLight)
    }

    // MARK: top bar

    private var topBar: some View {
        HStack(spacing: 22) {
            HStack(spacing: 10) {
                emblem
                Text("RIVAI")
                    .font(.system(size: 17, weight: .black))
                    .tracking(8)
                    .foregroundColor(Theme.textHi)
            }
            Spacer()
            navTab("PLAY", active: true)
            navTab("PATCH", active: false)
            navTab("LORE", active: false)
            Spacer()
            profilePill
        }
    }

    private var emblem: some View {
        ZStack {
            Circle()
                .stroke(Theme.ember.opacity(0.7), lineWidth: 1)
                .frame(width: 24, height: 24)
            Circle()
                .fill(Theme.ember.opacity(0.18))
                .frame(width: 22, height: 22)
            Image(systemName: "flame.fill")
                .font(.system(size: 11, weight: .black))
                .foregroundColor(Theme.ember)
        }
    }

    private func navTab(_ label: String, active: Bool) -> some View {
        VStack(spacing: 6) {
            Text(label)
                .font(.system(size: 11, weight: .heavy))
                .tracking(4)
                .foregroundColor(active ? Theme.textHi : Theme.textLo)
            Rectangle()
                .fill(active ? Theme.ember : .clear)
                .frame(width: 26, height: 2)
        }
        .padding(.horizontal, 6)
    }

    private var profilePill: some View {
        HStack(spacing: 10) {
            Circle()
                .fill(LinearGradient(colors: [Theme.ember, Theme.bronze],
                                     startPoint: .top, endPoint: .bottom))
                .frame(width: 22, height: 22)
                .overlay(Text("R").font(.system(size: 11, weight: .black)).foregroundColor(.black))
            VStack(alignment: .leading, spacing: 1) {
                Text("GUEST")
                    .font(.system(size: 9, weight: .heavy))
                    .tracking(2)
                    .foregroundColor(Theme.textLo)
                Text("rivai_001")
                    .font(.system(size: 11, weight: .heavy))
                    .foregroundColor(Theme.textHi)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(
            Capsule().fill(Theme.panel)
                .overlay(Capsule().stroke(Theme.panelLine, lineWidth: 1))
        )
    }

    // MARK: left pane (hero)

    private var leftPane: some View {
        VStack(alignment: .leading, spacing: 22) {
            statusBadge
            wordmark
            tagline
            Spacer(minLength: 8)
            ctaRow
        }
    }

    private var statusBadge: some View {
        HStack(spacing: 10) {
            Circle().fill(statusColor)
                .frame(width: 7, height: 7)
                .shadow(color: statusColor, radius: 4)
            Text(statusLabel)
                .font(.system(size: 10, weight: .heavy))
                .tracking(4)
                .foregroundColor(Theme.textMid)
            Text("·").foregroundColor(Theme.textLo)
            Text("CLOSED ALPHA")
                .font(.system(size: 10, weight: .heavy))
                .tracking(4)
                .foregroundColor(Theme.textLo)
        }
    }

    private var wordmark: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("RIVAI")
                .font(.system(size: 148, weight: .black))
                .tracking(-7)
                .foregroundStyle(
                    LinearGradient(
                        colors: [
                            Color.white,
                            Color(white: 0.78),
                            Theme.bronze.opacity(0.85),
                        ],
                        startPoint: .top, endPoint: .bottom
                    )
                )
                .shadow(color: Theme.ember.opacity(0.35), radius: 26, x: 0, y: 14)
                .overlay(
                    // ember underline
                    GeometryReader { geo in
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [.clear, Theme.ember, .clear],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .frame(height: 1)
                            .offset(y: geo.size.height - 2)
                    }
                )
            Text("⟶  CHAPTER 0  ·  THE FORGE")
                .font(.system(size: 10, weight: .heavy))
                .tracking(6)
                .foregroundColor(Theme.bronze)
        }
    }

    private var tagline: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Channel the instinct.")
                .font(.system(size: 22, weight: .semibold))
                .foregroundColor(Theme.textHi)
            Text("Master the duel.")
                .font(.system(size: 22, weight: .semibold))
                .foregroundColor(Theme.textMid)
        }
    }

    private var ctaRow: some View {
        HStack(spacing: 14) {
            playButton
            ghostButton("LOGS", systemImage: "doc.text.below.ecg", action: model.openLogs)
            ghostButton("SERVER", systemImage: "network", action: model.openServerSettings)
            Spacer()
            if case .error(let msg) = model.state {
                Text(msg)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.red)
                    .lineLimit(2)
                    .frame(maxWidth: 260, alignment: .leading)
            }
        }
    }

    private var playButton: some View {
        Button(action: { model.play() }) {
            ZStack {
                if !playDisabled { PulseRing().frame(width: 70, height: 70).offset(x: -56) }
                HStack(spacing: 14) {
                    ZStack {
                        Circle().fill(Color.black.opacity(0.12)).frame(width: 30, height: 30)
                        if isRunning {
                            ProgressView()
                                .controlSize(.small)
                                .progressViewStyle(.circular)
                                .tint(.black)
                        } else {
                            Image(systemName: "play.fill")
                                .font(.system(size: 12, weight: .black))
                                .foregroundColor(.black)
                                .offset(x: 1)
                        }
                    }
                    Text(isRunning ? "IN GAME" : "PLAY")
                        .font(.system(size: 15, weight: .black))
                        .tracking(6)
                        .foregroundColor(.black)
                }
                .padding(.leading, 12)
                .padding(.trailing, 26)
                .padding(.vertical, 14)
                .background(
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [Color.white, Color(white: 0.88)],
                                startPoint: .top, endPoint: .bottom
                            )
                        )
                        .overlay(
                            Capsule().stroke(Theme.ember.opacity(hoverPlay ? 0.7 : 0.35), lineWidth: 1)
                        )
                )
                .shadow(color: Theme.ember.opacity(hoverPlay ? 0.55 : 0.30), radius: hoverPlay ? 38 : 22, x: 0, y: 6)
                .scaleEffect(hoverPlay && !playDisabled ? 1.02 : 1.0)
                .animation(.spring(response: 0.32, dampingFraction: 0.7), value: hoverPlay)
            }
        }
        .buttonStyle(.plain)
        .disabled(playDisabled)
        .opacity(playDisabled && !isRunning ? 0.55 : 1.0)
        .onHover { hoverPlay = $0 }
    }

    private func ghostButton(_ label: String, systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: systemImage)
                    .font(.system(size: 11, weight: .heavy))
                Text(label)
                    .font(.system(size: 10, weight: .heavy))
                    .tracking(3)
            }
            .foregroundColor(Theme.textMid)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                Capsule()
                    .fill(Theme.panel)
                    .overlay(Capsule().stroke(Theme.panelLine, lineWidth: 1))
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: right pane (news + trinity)

    private var rightPane: some View {
        VStack(alignment: .leading, spacing: 18) {
            newsCard
            trinityCard
            socialRow
        }
    }

    private var newsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionHeader("DISPATCH", count: 3)
            newsItem(
                tag: "PATCH",
                title: "0.2 — The Forge Update",
                desc: "Launcher reborn. New TCP/UDP forwarders for Locator handoff.",
                hue: Theme.ember
            )
            Divider().background(Theme.panelLine)
            newsItem(
                tag: "EVENT",
                title: "Closed Alpha Trials",
                desc: "Hand-picked duelists test the trinity. Sign up via Discord.",
                hue: Theme.bronze
            )
            Divider().background(Theme.panelLine)
            newsItem(
                tag: "LORE",
                title: "Bao's Council",
                desc: "Why peace required a weapon — Chapter II of the cycle.",
                hue: .white.opacity(0.6)
            )
        }
        .padding(18)
        .background(panelBg)
    }

    private func newsItem(tag: String, title: String, desc: String, hue: Color) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Rectangle()
                .fill(hue)
                .frame(width: 2, height: 36)
            VStack(alignment: .leading, spacing: 4) {
                Text(tag)
                    .font(.system(size: 9, weight: .heavy))
                    .tracking(3)
                    .foregroundColor(hue.opacity(0.95))
                Text(title)
                    .font(.system(size: 12, weight: .heavy))
                    .foregroundColor(Theme.textHi)
                Text(desc)
                    .font(.system(size: 11))
                    .foregroundColor(Theme.textMid)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private var trinityCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader("THE TRINITY", count: nil)
            VStack(spacing: 10) {
                trinityRow(
                    glyph: "scope",
                    name: "REVOLVER",
                    role: "Precision · Long",
                    fill: 0.72
                )
                trinityRow(
                    glyph: "burst.fill",
                    name: "SHOTGUN",
                    role: "Storm · Close",
                    fill: 0.86
                )
                trinityRow(
                    glyph: "shield.lefthalf.filled",
                    name: "SWORD",
                    role: "Deflect · Reflex",
                    fill: 0.64
                )
            }
        }
        .padding(18)
        .background(panelBg)
    }

    private func trinityRow(glyph: String, name: String, role: String, fill: CGFloat) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 6)
                    .fill(Theme.panel)
                    .frame(width: 32, height: 32)
                Image(systemName: glyph)
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(Theme.ember)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.system(size: 11, weight: .heavy))
                    .tracking(3)
                    .foregroundColor(Theme.textHi)
                Text(role)
                    .font(.system(size: 10))
                    .foregroundColor(Theme.textLo)
            }
            Spacer()
            // capability bar
            ZStack(alignment: .leading) {
                Capsule().fill(Theme.panel).frame(width: 64, height: 4)
                Capsule()
                    .fill(LinearGradient(
                        colors: [Theme.ember, Theme.bronze],
                        startPoint: .leading, endPoint: .trailing
                    ))
                    .frame(width: 64 * fill, height: 4)
            }
        }
    }

    private var socialRow: some View {
        HStack(spacing: 10) {
            socialChip("DISCORD", systemImage: "bubble.left.and.bubble.right.fill")
            socialChip("TWITTER", systemImage: "bird.fill")
            socialChip("GUIDE", systemImage: "book.fill")
        }
    }

    private func socialChip(_ label: String, systemImage: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: systemImage)
                .font(.system(size: 9, weight: .heavy))
            Text(label)
                .font(.system(size: 9, weight: .heavy))
                .tracking(2)
        }
        .foregroundColor(Theme.textMid)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            Capsule().fill(Theme.panel)
                .overlay(Capsule().stroke(Theme.panelLine, lineWidth: 1))
        )
    }

    private func sectionHeader(_ title: String, count: Int?) -> some View {
        HStack(spacing: 8) {
            Rectangle().fill(Theme.ember).frame(width: 3, height: 11)
            Text(title)
                .font(.system(size: 10, weight: .heavy))
                .tracking(4)
                .foregroundColor(Theme.textHi)
            Spacer()
            if let c = count {
                Text("\(c)")
                    .font(.system(size: 9, weight: .heavy))
                    .tracking(2)
                    .foregroundColor(Theme.textLo)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(
                        Capsule().fill(Theme.panel)
                    )
            }
        }
    }

    private var panelBg: some View {
        RoundedRectangle(cornerRadius: 14)
            .fill(Theme.panel)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(Theme.panelLine, lineWidth: 1)
            )
    }

    // MARK: bottom bar

    private var bottomBar: some View {
        HStack(spacing: 14) {
            metaPill(label: "SERVER", value: "\(model.serverIP):\(model.serverPort)", accent: Theme.ember)
            metaPill(label: "BUILD", value: "v\(model.version)", accent: Theme.bronze)
            metaPill(label: "REGION", value: "—", accent: .white.opacity(0.5))
            Spacer()
            Text("© 2026 RIVAI · forged by Kaiven")
                .font(.system(size: 9, weight: .heavy))
                .tracking(3)
                .foregroundColor(Theme.textLo)
        }
    }

    private func metaPill(label: String, value: String, accent: Color) -> some View {
        HStack(spacing: 8) {
            Circle().fill(accent).frame(width: 5, height: 5)
            Text(label)
                .font(.system(size: 9, weight: .heavy))
                .tracking(2.5)
                .foregroundColor(Theme.textLo)
            Text(value)
                .font(.system(size: 10, weight: .heavy))
                .tracking(1.5)
                .foregroundColor(Theme.textMid)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(
            Capsule()
                .fill(Theme.panel)
                .overlay(Capsule().stroke(Theme.panelLine, lineWidth: 1))
        )
    }

    // MARK: derived

    private var playDisabled: Bool {
        if case .running = model.state { return true }
        return false
    }

    private var isRunning: Bool {
        if case .running = model.state { return true }
        return false
    }

    private var statusColor: Color {
        switch model.state {
        case .idle: return Color(red: 0.45, green: 0.95, blue: 0.55)
        case .running: return Theme.ember
        case .error: return .red
        }
    }

    private var statusLabel: String {
        switch model.state {
        case .idle: return "READY"
        case .running: return "IN GAME"
        case .error: return "ERROR"
        }
    }
}
