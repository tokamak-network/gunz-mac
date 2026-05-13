export const SITE = {
  title: "GunZ Mac",
  tagline: "GunZ on Mac in a single double-click",
  githubOwner: process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "tokamak-network",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "gunz-mac",
} as const;

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
