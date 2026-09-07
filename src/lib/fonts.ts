import localFont from "next/font/local";
export const fraunces = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--register-fraunces",
  display: "swap",
});
export const grotesk = localFont({
  src: "../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  variable: "--register-grotesk",
  display: "swap",
});
export const mono = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
      weight: "500",
    },
  ],
  variable: "--register-mono",
  display: "swap",
});
