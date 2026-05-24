import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Play to Glory — wireframe",
  description:
    "A blockchain game that is, first, a game. Game for Fun. Blockchain for Glory.",
};

export default function P2GPage() {
  return (
    <div className={styles.page}>
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
      <span className={styles.sectionLabel}>§ 1</span>
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
      <span className={styles.sectionLabel}>§ 2</span>
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
      <span className={styles.sectionLabel}>§ 3</span>
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

type MetaCard = { label: string; desc: string; col: 1 | 2 | 3; row: 1 | 2 | 3 };

const META_CARDS: MetaCard[] = [
  { label: "Odds Market",    desc: "predictions priced on records", col: 1, row: 1 },
  { label: "Ladder",         desc: "ranks computed from records",   col: 2, row: 1 },
  { label: "Fan Tokens",     desc: "holders earn on player wins",   col: 3, row: 1 },
  { label: "Lore Archive",   desc: "legendary matches, minted",     col: 1, row: 2 },
  { label: "Replay Theater", desc: "every record, replayable",      col: 3, row: 2 },
  { label: "Guild Score",    desc: "team's aggregate record",       col: 1, row: 3 },
  { label: "Tournament",     desc: "brackets seeded by records",    col: 2, row: 3 },
  { label: "+",              desc: "community-built",               col: 3, row: 3 },
];

function MetaGamesSection() {
  return (
    <section className={styles.section} data-section="4">
      <span className={styles.sectionLabel}>§ 4</span>
      <div className={styles.content}>
        <p className={styles.eyebrow}>The Ecosystem · Meta-games</p>
        <h2 className={styles.lesson}>
          From one match, many games grow.
        </h2>

        <p className={styles.sublead}>
          Like sports — broadcast, betting, fan culture, leagues —
          all built on top of the same skill-based matches.
        </p>

        <div className={styles.constellationWrap}>
          <div className={styles.constellation}>
            <svg
              className={styles.connections}
              viewBox="0 0 3 3"
              preserveAspectRatio="none"
              aria-hidden
            >
              {META_CARDS.map((c) => (
                <line
                  key={c.label}
                  x1="1.5"
                  y1="1.5"
                  x2={c.col - 0.5}
                  y2={c.row - 0.5}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="6 6"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <div className={styles.gridCells}>
              {[1, 2, 3].flatMap((row) =>
                [1, 2, 3].map((col) => {
                  if (col === 2 && row === 2) {
                    return (
                      <div key={`${row}-${col}`} className={styles.centerRecord}>
                        <div>Record</div>
                        <div className={styles.recordId}>#1,287</div>
                      </div>
                    );
                  }
                  const card = META_CARDS.find(
                    (c) => c.col === col && c.row === row,
                  )!;
                  return (
                    <div key={`${row}-${col}`} className={styles.metaCard}>
                      <div className={styles.metaCardLabel}>{card.label}</div>
                      <div className={styles.metaCardDesc}>{card.desc}</div>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        <p className={styles.caption}>
          Records are not endpoints. They are seeds.
        </p>
      </div>
    </section>
  );
}
