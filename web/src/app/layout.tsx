import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--rivai-font",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RIVAI — Coming Soon",
  description: "A new rivalry begins. Sign up to be the first to hear about our launch. Inspired by GunZ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
