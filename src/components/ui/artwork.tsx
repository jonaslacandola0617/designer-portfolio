import Image from "next/image";
import type { PublicImage } from "@/features/projects/types";
export function Artwork({
  image,
  priority = false,
}: {
  image: PublicImage;
  priority?: boolean;
}) {
  return (
    <Image
      src={image.url}
      alt={image.altText}
      width={image.width ?? 1200}
      height={image.height ?? 900}
      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 1100px"
      priority={priority}
      className="artwork"
    />
  );
}
