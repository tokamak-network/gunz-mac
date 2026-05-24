import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import styles from "./page.module.css";

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Play to Glory — wireframe",
  description:
    "A blockchain game that is, first, a game. Game for Fun. Blockchain for Glory.",
};

export default function P2GPage() {
  return (
    <div className={`${mono.variable} ${styles.page}`}>
      <HeroSection />
      <GameSection />
      <RecordSection />
      <MetaGamesSection />
    </div>
  );
}

/* ============================================================
   § 1  HERO
   Job: position P2G as the alternative to P2E in the first
   3 seconds, before the visitor scrolls.
   ============================================================ */

function HeroSection() {
  return (
    <section className={styles.section} data-section="1">
      <span className={styles.sectionLabel}>§ 01 / Hero</span>
      <div className={styles.content}>
        <h1 className={styles.title}>Play to Glory</h1>
        <div className={styles.subtitle}>
          <span>Game for Fun.</span>
          <span>Blockchain for Glory.</span>
        </div>

        <hr className={styles.heroDivider} />

        <p className={styles.heroNote}>
          Play to Earn turned games into labor.
          <br />
          Play to Glory makes them count again.
        </p>

        <div className={styles.scrollHint}>↓ scroll</div>
      </div>
    </section>
  );
}

/* ============================================================
   § 2  GAME — "Game for Fun"
   Job: prove the core game is real skill, not a token sink.
   Lesson: "The game is just a game."
   ============================================================ */

function GameSection() {
  return (
    <section className={styles.section} data-section="2">
      <span className={styles.sectionLabel}>§ 02 / The Core</span>
      <div className={styles.content}>
        <p className={styles.eyebrow}>The Core · Game for Fun</p>
        <h2 className={styles.lesson}>The game is just a game.</h2>

        <div className={styles.imagePlaceholder}>
          <strong>[ weapon mechanics image ]</strong>
          sword · shotgun · revolver
          <br />
          dodge ↔ ambush counterplay
        </div>

        <p className={styles.caption}>
          Skill-based PvP. No tokens inside the match.
          No pay-to-win. No shortcut for bots.
        </p>

        <p className={styles.bridge}>
          And every match leaves a trace. <span aria-hidden>↓</span>
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   § 3  RECORD — "Blockchain for Glory"
   Job: flip the visitor's "blockchain = money" prior.
   Lesson: "The chain is a witness, not a wallet."
   ============================================================ */

function RecordSection() {
  return (
    <section className={styles.section} data-section="3">
      <span className={styles.sectionLabel}>§ 03 / The Record</span>
      <div className={styles.content}>
        <p className={styles.eyebrow}>The Record · Blockchain for Glory</p>
        <h2 className={styles.lesson}>
          Every match becomes a public, permanent fact.
        </h2>

        <div className={styles.recordCard}>
          <Row k="Match" v="#1,287" />
          <Row k="Players" v="alice  vs  bob" />
          <Row k="Time" v="2026-05-23 14:02 UTC" />
          <hr className={styles.recordDivider} />
          <Row k="Block" v="#128,471,902" />
          <Row
            k="Tx"
            v={
              <>
                0x4a7b…9bc2 <a href="#">↗ explorer</a>
              </>
            }
          />
        </div>

        <p className={styles.caption}>
          Not currency. <em>Witness.</em>
          <br />
          The chain remembers who won, when, against whom — forever.
        </p>

        <p className={styles.bridge}>
          One record is a fact. Many records compose.{" "}
          <span aria-hidden>↓</span>
        </p>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className={styles.recordRow}>
      <span className={styles.recordKey}>{k}</span>
      <span className={styles.recordVal}>{v}</span>
    </div>
  );
}

/* ============================================================
   § 4  META-GAMES
   Job: show the payoff — records seed a whole ecosystem,
   like sports does.
   Lesson: "From one match, many games grow."
   ============================================================ */

type MetaCard = { label: string; desc: string };

const META_CARDS: MetaCard[] = [
  { label: "Odds Market",    desc: "predictions priced on records" },
  { label: "Ladder",         desc: "ranks computed from records" },
  { label: "Fan Tokens",     desc: "holders earn on player wins" },
  { label: "Lore Archive",   desc: "legendary matches, minted" },
  { label: "Replay Theater", desc: "every record, replayable" },
  { label: "Guild Score",    desc: "team's aggregate record" },
  { label: "Tournament",     desc: "brackets seeded by records" },
  { label: "+",              desc: "community-built" },
];

/* Card x positions in the SVG viewBox 0..600:
   8 equal slots, each 75 wide; center of slot N (1-indexed) = (N - 0.5) * 75 */
const ROOT_X = META_CARDS.map((_, i) => (i + 0.5) * 75);
const TRUNK_X = 300; // center of viewBox width (600/2)
const SPLIT_Y = 30;  // where the trunk ends and roots begin

function MetaGamesSection() {
  return (
    <section className={styles.section} data-section="4">
      <span className={styles.sectionLabel}>§ 04 / The Ecosystem</span>
      <div className={styles.content}>
        <p className={styles.eyebrow}>The Ecosystem · Meta-games</p>
        <h2 className={styles.lesson}>
          From one match, many games grow.
        </h2>

        <p className={styles.sublead}>
          Like sports — broadcast, betting, fan culture, leagues —
          all built on top of the same skill-based matches.
        </p>

        <div className={styles.tree}>
          {/* stem: record sits at top */}
          <div className={styles.stem}>
            <div className={styles.centerRecord}>
              <div>Record</div>
              <div className={styles.recordId}>#1,287</div>
            </div>
          </div>

          {/* branches: solid trunk line + 8 dashed root curves */}
          <svg
            className={styles.branches}
            viewBox="0 0 600 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <line
              x1={TRUNK_X}
              y1="0"
              x2={TRUNK_X}
              y2={SPLIT_Y}
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {ROOT_X.map((x, i) => (
              <path
                key={i}
                d={`M ${TRUNK_X} ${SPLIT_Y} C ${TRUNK_X} 65 ${x} 80 ${x} 100`}
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* roots: meta-game cards in one row (collapses to 2×4 on mobile) */}
          <div className={styles.roots}>
            {META_CARDS.map((c) => (
              <div key={c.label} className={styles.metaCard}>
                <div className={styles.metaCardLabel}>{c.label}</div>
                <div className={styles.metaCardDesc}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className={styles.caption}>
          Records are not endpoints. They are seeds.
        </p>
      </div>
    </section>
  );
}
