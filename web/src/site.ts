// Replace with your GitHub repo and release tag when deploying.
// e.g. GITHUB_OWNER=myuser, GITHUB_REPO=gunz-mac, RELEASE_TAG=v0.1.0
export const SITE = {
  title: "GunZ Mac",
  tagline: "GunZ on Mac in a single double-click",
  githubOwner: process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "YOUR_GITHUB_USER",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "gunz-mac",
  releaseTag: process.env.NEXT_PUBLIC_RELEASE_TAG ?? "v0.1.0",
  zipName: process.env.NEXT_PUBLIC_ZIP_NAME ?? "GunZ-Mac-0.1.0.zip",
} as const;

export function downloadUrl(): string {
  return `https://github.com/${SITE.githubOwner}/${SITE.githubRepo}/releases/download/${SITE.releaseTag}/${SITE.zipName}`;
}

export function repoUrl(): string {
  return `https://github.com/${SITE.githubOwner}/${SITE.githubRepo}`;
}
