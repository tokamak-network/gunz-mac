import type { Metadata } from "next";
import Image from "next/image";
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
          Play to Earn turned games into work.
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
    <section id="core" className={styles.section} data-section="2">
      <span className={styles.sectionLabel}>§ 02 / The Core</span>
      <div className={styles.content}>
        <p className={styles.eyebrow}>The Core · Game for Fun</p>
        <h2 className={styles.lesson}>The game is just a game.</h2>

        <figure className={styles.imageCard}>
          <Image
            src="/p2g/weapon-mechanics.png"
            alt="Weapon mechanics — sword, shotgun, revolver and dodge/ambush counterplay"
            width={2000}
            height={1151}
            sizes="(max-width: 720px) 92vw, 800px"
            priority
            className={styles.imageCardImg}
          />
          <figcaption className={styles.imageCardCaption}>
            sword · shotgun · revolver <span aria-hidden>·</span> dodge ↔ ambush
          </figcaption>
        </figure>

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
    <section id="record" className={styles.section} data-section="3">
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

type MetaCard = { label: string; desc: string; color: string };

/* The Record is gray (neutral witness). Each meta-game that grows from
   it gets its own color — a different game, a different hue. */
const META_CARDS: MetaCard[] = [
  { label: "Odds Market",    desc: "predictions priced on records", color: "#ffd166" },
  { label: "Ladder",         desc: "ranks computed from records",   color: "#4cc9f0" },
  { label: "Fan Tokens",     desc: "holders earn on player wins",   color: "#ef476f" },
  { label: "Lore Archive",   desc: "legendary matches, minted",     color: "#c77dff" },
  { label: "Replay Theater", desc: "every record, replayable",      color: "#06d6a0" },
  { label: "Guild Score",    desc: "team's aggregate record",       color: "#f9844a" },
  { label: "Tournament",     desc: "brackets seeded by records",    color: "#b5e48c" },
  { label: "+",              desc: "community-built",               color: "#9aa5b1" },
];

/* Organic scatter — the Record sits at the center (50,50) and the 8
   meta-games are strewn around it like leaves off a tree. Positions are
   hand-placed (% of the canvas) with varying radius so they feel scattered,
   not ringed; `bow` bends each branch for an organic, limb-like curve. */
const CENTER = { x: 50, y: 50 };

type Node = { x: number; y: number; bow: number };

const NODES: Node[] = [
  { x: 15, y: 23, bow: 8 }, // 0 Odds Market
  { x: 38, y: 10, bow: -7 }, // 1 Ladder
  { x: 63, y: 14, bow: 6 }, // 2 Fan Tokens
  { x: 88, y: 33, bow: -8 }, // 3 Lore Archive
  { x: 82, y: 66, bow: 8 }, // 4 Replay Theater
  { x: 55, y: 89, bow: -6 }, // 5 Guild Score
  { x: 26, y: 82, bow: 7 }, // 6 Tournament
  { x: 10, y: 56, bow: -8 }, // 7 +
];

/* cubic bezier from the center out to a node, bowed perpendicular by `bow` */
function branchPath(n: Node): string {
  const dx = n.x - CENTER.x;
  const dy = n.y - CENTER.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len; // perpendicular unit vector
  const py = dx / len;
  const c1x = CENTER.x + dx * 0.35 + px * n.bow;
  const c1y = CENTER.y + dy * 0.35 + py * n.bow;
  const c2x = CENTER.x + dx * 0.72 + px * n.bow;
  const c2y = CENTER.y + dy * 0.72 + py * n.bow;
  return `M ${CENTER.x} ${CENTER.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${n.x} ${n.y}`;
}

function MetaGamesSection() {
  return (
    <section id="ecosystem" className={styles.section} data-section="4">
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

        <div className={styles.canopy}>
          {/* branches: 8 dashed colored curves from the center Record out to
              each scattered node. .branch[data-index=N] pairs with the card */}
          <svg
            className={styles.branches}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {META_CARDS.map((c, i) => (
              <path
                key={i}
                className={styles.branch}
                data-index={i}
                d={branchPath(NODES[i])}
                stroke={c.color}
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* center Record */}
          <div
            className={styles.centerRecord}
            style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
          >
            <div>Record</div>
            <div className={styles.recordId}>#1,287</div>
          </div>

          {/* scattered meta-game cards */}
          {META_CARDS.map((c, i) => (
            <div
              key={c.label}
              className={styles.metaCard}
              data-index={i}
              style={
                {
                  left: `${NODES[i].x}%`,
                  top: `${NODES[i].y}%`,
                  "--c": c.color,
                } as React.CSSProperties
              }
            >
              <div className={styles.metaCardLabel}>{c.label}</div>
              <div className={styles.metaCardDesc}>{c.desc}</div>
            </div>
          ))}
        </div>

        <p className={styles.caption}>
          Records are not endpoints. They are seeds.
        </p>
      </div>
    </section>
  );
}
