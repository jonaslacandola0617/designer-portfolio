import { createHash } from "node:crypto";
import { db } from "@/lib/db";
export async function allowLogin(email: string) {
  const key = createHash("sha256").update(email.toLowerCase()).digest("hex");
  const now = new Date();
  await db.loginAttempt.deleteMany({ where: { expiresAt: { lt: now } } });
  const attempt = await db.loginAttempt.upsert({
    where: { key },
    create: { key, count: 1, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    update: { count: { increment: 1 } },
  });
  return attempt.count <= 10;
}
