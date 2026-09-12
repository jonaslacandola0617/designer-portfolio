import localFont from "next/font/local";

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

export const playfair = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2",
      style: "normal",
      weight: "400 900",
    },
    {
      path: "../../node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2",
      style: "italic",
      weight: "400 900",
    },
  ],
  variable: "--register-playfair",
  display: "swap",
});

export const manrope = localFont({
  src: "../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--register-manrope",
  display: "swap",
});
