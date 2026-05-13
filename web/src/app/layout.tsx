import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GunZ Mac",
  description: "Run GunZ: The Duel on macOS Apple Silicon via Wine + DXVK.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
