import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { slugify } from "@/features/projects/domain";
export interface Storage {
  presign(key: string, mime: string, size: number): Promise<string>;
  verifyAndPromote(
    key: string,
    finalKey: string,
    mime: string,
    size: number,
  ): Promise<{ width: number; height: number }>;
  remove(key: string): Promise<void>;
  publicUrl(key: string): string;
}
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export function storageKey(fileName: string, mime: string) {
  return `portfolio/${new Date().getUTCFullYear()}/${randomUUID()}-${slugify(fileName.replace(/\.[^.]+$/, "")).slice(0, 60) || "image"}.${extensions[mime]}`;
}
export function createStorage(): Storage {
  const bucket = process.env.S3_BUCKET;
  const base = process.env.S3_PUBLIC_BASE_URL;
  if (
    !bucket ||
    !base ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY
  )
    throw new Error("Media storage is not configured.");
  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "auto",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  return {
    presign: (key, mime, size) =>
      getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: mime,
          ContentLength: size,
        }),
        { expiresIn: 300 },
      ),
    async verifyAndPromote(key, finalKey, mime, size) {
      const object = await client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );
      if (
        object.ContentLength !== size ||
        object.ContentType !== mime ||
        !object.Body
      )
        throw new Error(
          "Uploaded file does not match its declared size or format.",
        );
      const bytes = await object.Body.transformToByteArray();
      if (bytes.length !== size) throw new Error("Incomplete upload.");
      const metadata = await sharp(bytes, {
        limitInputPixels: 80_000_000,
      }).metadata();
      const expected =
        mime === "image/jpeg"
          ? "jpeg"
          : mime === "image/avif"
            ? "heif"
            : mime.split("/")[1];
      if (
        metadata.format !== expected ||
        (mime === "image/avif" && metadata.compression !== "av1") ||
        !metadata.width ||
        !metadata.height ||
        (metadata.pages ?? 1) > 1
      )
        throw new Error("Use a valid, still JPEG, PNG, WebP or AVIF image.");
      await sharp(bytes, { limitInputPixels: 80_000_000 })
        .resize(1, 1)
        .toBuffer();
      // Persist the verified bytes under an immutable key, separate from the reusable upload URL.
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: finalKey,
          Body: bytes,
          ContentType: mime,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      return { width: metadata.width, height: metadata.height };
    },
    async remove(key) {
      if (!/^(portfolio|pending)\//.test(key) || key.includes(".."))
        throw new Error("Invalid storage key.");
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
    publicUrl: (key) => `${base.replace(/\/$/, "")}/${key}`,
  };
}
