export const SITE = {
  title: "GunZ Mac",
  tagline: "GunZ on Mac in a single double-click",
  githubOwner: process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "tokamak-network",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "gunz-mac",
} as const;

/* ============================================================
   Studio — Tokamak Games (route: /studio)
   The top-level brand layer above individual titles.
   ============================================================ */

export const STUDIO = {
  name: "Tokamak Games",
  thesis: "Game for Fun. Blockchain for Glory.",
  lead:
    "We build skill-first games where every match becomes a permanent, " +
    "public record — powered by Play to Glory on Tokamak Network.",
  chain: "Tokamak Network",
  social: {
    discord: "https://discord.gg/tokamak",
    x: "https://x.com/tokamak_network",
    github: "https://github.com/tokamak-network",
  },
} as const;

export type GameStatus = "live" | "coming-soon" | "in-dev";

export type Game = {
  slug: string;
  title: string;
  tagline: string;
  genre: string;
  platform: string;
  status: GameStatus;
  href: string;
  cta: string;
  flagship?: boolean;
};

export const STATUS_LABEL: Record<GameStatus, string> = {
  live: "Live",
  "coming-soon": "Coming Soon",
  "in-dev": "In Development",
};

export const GAMES: Game[] = [
  {
    slug: "rivai",
    title: "RIVAI",
    tagline: "A new rivalry begins.",
    genre: "Skill-based PvP",
    platform: "PC",
    status: "coming-soon",
    href: "/",
    cta: "Get notified",
    flagship: true,
  },
  {
    slug: "gunz-mac",
    title: "GunZ Mac",
    tagline: "GunZ on your Mac in a single double-click.",
    genre: "Action Shooter",
    platform: "macOS",
    status: "live",
    href: "/download",
    cta: "Download",
  },
];

export type ReleaseInfo = {
  tag: string;
  zipName: string;
  zipUrl: string;
};

export function repoUrl(): string {
  return `https://github.com/${SITE.githubOwner}/${SITE.githubRepo}`;
}

export function releasesUrl(): string {
  return `${repoUrl()}/releases`;
}

export async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${SITE.githubOwner}/${SITE.githubRepo}/releases/latest`,
      {
        next: { revalidate: 600 },
        headers: { Accept: "application/vnd.github+json" },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tag_name?: string;
      assets?: { name: string; browser_download_url: string }[];
    };
    const asset = data.assets?.find((a) => a.name.toLowerCase().endsWith(".zip"));
    if (!data.tag_name || !asset) return null;
    return {
      tag: data.tag_name,
      zipName: asset.name,
      zipUrl: asset.browser_download_url,
    };
  } catch {
    return null;
  }
}
