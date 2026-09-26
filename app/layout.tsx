import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/jetbrains-mono";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Andres Ortiz — Systems Reel 2026",
  description:
    "Andres Ortiz, software engineer in Quito. AI systems, software and cloud architecture — built as systems, not demos.",
  openGraph: {
    title: "Andres Ortiz — Systems Reel 2026",
    description: "AI systems · software & cloud architecture. Quito, Ecuador.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Andres Ortiz — Systems Reel 2026",
    description: "AI systems · software & cloud architecture. Quito, Ecuador.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
