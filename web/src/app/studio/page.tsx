import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import HeroVideo from "./HeroVideo";
import NotifyForm from "./NotifyForm";
import { GAMES, STATUS_LABEL, STUDIO } from "@/site";

export const metadata: Metadata = {
  title: "Tokamak Games — Play to Glory game studio",
  description:
    "Tokamak Games builds skill-first games on Play to Glory. Game for Fun. Blockchain for Glory.",
};

const FLAGSHIP = GAMES.find((g) => g.flagship) ?? GAMES[0];

export default function StudioPage() {
  return (
    <div className={styles.page}>
      <SiteNav />
      <Hero />
      <PlayToGlory />
      <Community />
      <SiteFooter />
    </div>
  );
}

/* ============================================================
   Nav — studio brand left, sections + email CTA right.
   ============================================================ */

function SiteNav() {
  return (
    <nav className={styles.nav}>
      <Link href="/studio" className={styles.navBrand}>
        <Image
          src="/tokamak-logo.png"
          alt=""
          aria-hidden
          width={25}
          height={25}
          className={styles.navMark}
          priority
        />
        <span className={styles.navBrandText}>{STUDIO.name}</span>
      </Link>
      <div className={styles.navLinks}>
        <a href="#play-to-glory">Play to Glory</a>
        <Link href="/p2g">Manifesto</Link>
        <a href="#community">Community</a>
      </div>
      <a href="#notify" className={styles.navCta}>
        Get Notified
      </a>
    </nav>
  );
}

/* ============================================================
   Hero — flagship first. The title IS the game (RIVAI);
   the studio is the frame around it.
   ============================================================ */

function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.heroMedia}>
        <HeroVideo src="/landing.mp4" />
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroInner}>
        <p className={styles.heroEyebrow}>Flagship Title</p>
        <h1 className={styles.heroTitle}>{FLAGSHIP.title}</h1>
        <p className={styles.heroTagline}>{FLAGSHIP.tagline}</p>

        <div id="notify" className={styles.notify}>
          <NotifyForm />
        </div>

        <p className={styles.heroStudioline}>
          A <strong>{STUDIO.name}</strong> title — built on{" "}
          <Link href="/p2g">Play to Glory</Link>.
        </p>
      </div>

      <div className={styles.heroStatus}>
        <span className={styles.statusDot} aria-hidden />
        {STATUS_LABEL[FLAGSHIP.status]}
      </div>
    </section>
  );
}

/* ============================================================
   Play to Glory — condensed 3-pillar summary. Each pillar
   deep-links into the full /p2g editorial.
   ============================================================ */

type Pillar = {
  n: string;
  title: string;
  lesson: string;
  desc: string;
  href: string;
};

const PILLARS: Pillar[] = [
  {
    n: "01",
    title: "Game for Fun",
    lesson: "The game is just a game.",
    desc: "Skill-based PvP. No tokens inside the match, no pay-to-win, no shortcut for bots.",
    href: "/p2g#core",
  },
  {
    n: "02",
    title: "Blockchain for Glory",
    lesson: "Every match becomes a permanent, public fact.",
    desc: "Not currency — a witness. The chain remembers who won, when, against whom.",
    href: "/p2g#record",
  },
  {
    n: "03",
    title: "The Ecosystem",
    lesson: "From one match, many games grow.",
    desc: "Ladders, odds markets, fan tokens, tournaments — all built on the same records.",
    href: "/p2g#ecosystem",
  },
];

function PlayToGlory() {
  return (
    <section id="play-to-glory" className={styles.p2g}>
      <p className={styles.eyebrow}>§ Play to Glory</p>
      <h2 className={styles.p2gQuote}>
        Game for Fun.
        <br />
        Blockchain for Glory.
      </h2>
      <p className={styles.p2gLead}>
        Play to Earn turned games into work. Play to Glory makes them count
        again — every match leaves a permanent, public trace.
      </p>

      <div className={styles.pillars}>
        {PILLARS.map((p) => (
          <Link key={p.n} href={p.href} className={styles.pillar}>
            <span className={styles.pillarNum}>§{p.n}</span>
            <h3 className={styles.pillarTitle}>{p.title}</h3>
            <p className={styles.pillarLesson}>{p.lesson}</p>
            <p className={styles.pillarDesc}>{p.desc}</p>
            <span className={styles.pillarMore}>
              Read more <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>

      <div className={styles.p2gFooterCta}>
        <Link href="/p2g" className={styles.btnGhost}>
          Read the full manifesto <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

/* ============================================================
   Community.
   ============================================================ */

function Community() {
  return (
    <section id="community" className={styles.join}>
      <p className={styles.eyebrow}>§ Community</p>
      <h2 className={styles.sectionTitle}>Get in the arena.</h2>
      <p className={styles.lead}>
        Build with us, or just come play. The rivalry is open.
      </p>
      <div className={styles.joinCtas}>
        <a href={STUDIO.social.discord} className={styles.btnPrimary}>
          Discord
        </a>
        <a href={STUDIO.social.x} className={styles.btnGhost}>
          X / Twitter
        </a>
      </div>
    </section>
  );
}

/* ============================================================
   Footer.
   ============================================================ */

function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerCols}>
        <FooterCol title="RIVAI">
          <a href="#notify">Get notified</a>
        </FooterCol>
        <FooterCol title="Play to Glory">
          <a href="#play-to-glory">Overview</a>
          <Link href="/p2g">Manifesto</Link>
        </FooterCol>
        <FooterCol title="Community">
          <a href={STUDIO.social.discord}>Discord</a>
          <a href={STUDIO.social.x}>X / Twitter</a>
          <a href={STUDIO.social.github}>GitHub</a>
        </FooterCol>
      </div>
      <div className={styles.footerBottom}>
        <span className={styles.footerCopy}>© 2026 {STUDIO.name}</span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.footerCol}>
      <span className={styles.footerColTitle}>{title}</span>
      {children}
    </div>
  );
}
