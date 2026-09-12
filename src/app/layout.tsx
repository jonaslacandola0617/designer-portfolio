import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/seo";
import "./globals.css";
import { manrope, mono, playfair } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Jonas Lacandola — Design Portfolio",
  authors: [{ name: "Jonas Lacandola", url: siteUrl }],
  creator: "Jonas Lacandola",
  publisher: "Jonas Lacandola",
  referrer: "strict-origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#EEE8DC",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-PH"
      className={`${manrope.variable} ${playfair.variable} ${mono.variable}`}
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
