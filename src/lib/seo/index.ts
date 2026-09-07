import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://design.jonasl.online";

export const defaultSocialImageUrl = new URL(
  "/opengraph-image",
  siteUrl,
).toString();

const defaultSocialAlt =
  "Jonas Lacandola — Independent Visual Designer portfolio";

type SeoImage = {
  url: string;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
};

function socialImageDescriptor(
  image?: string | SeoImage | null,
  imageAlt?: string,
) {
  if (!image) {
    return {
      url: defaultSocialImageUrl,
      width: 1200,
      height: 630,
      alt: imageAlt || defaultSocialAlt,
    };
  }

  if (typeof image === "string") {
    return {
      url: image,
      alt: imageAlt || defaultSocialAlt,
    };
  }

  return {
    url: image.url,
    ...(image.width ? { width: image.width } : {}),
    ...(image.height ? { height: image.height } : {}),
    alt: image.altText?.trim() || imageAlt || defaultSocialAlt,
  };
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string | SeoImage | null,
  imageAlt?: string,
): Metadata {
  const socialImage = socialImageDescriptor(image, imageAlt);

  return {
    title,
    description,
    alternates: { canonical: new URL(path, siteUrl) },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: new URL(path, siteUrl),
      siteName: "Jonas Lacandola",
      locale: "en_PH",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
