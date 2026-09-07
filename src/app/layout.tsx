import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";
import "./globals.css";
import { fraunces, grotesk, mono } from "@/lib/fonts";
export const metadata: Metadata = { metadataBase: new URL(siteUrl) };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
