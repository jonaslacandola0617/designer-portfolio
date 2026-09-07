import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jonas Lacandola — Visual Design Portfolio",
    short_name: "JL Design",
    description:
      "Graphic design portfolio of Jonas Lacandola, an independent visual designer based in Pampanga, Philippines.",
    start_url: "/",
    display: "browser",
    background_color: "#F2F0EA",
    theme_color: "#F2F0EA",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
