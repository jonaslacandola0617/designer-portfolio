import { test, expect } from "@playwright/test";
import sharp from "sharp";

test("media management uses styled delete warnings and supports bulk deletion", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page
    .getByLabel("Email", { exact: true })
    .fill(process.env.ADMIN_EMAIL!);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Enter Studio →" }).click();
  await expect(page).toHaveURL(/\/admin\/projects$/);
  await page.goto("/admin/media");

  const name = "browser-upload-" + Date.now() + ".png";
  const bytes = await sharp({
    create: {
      width: 320,
      height: 240,
      channels: 3,
      background: "#637568",
    },
  })
    .png()
    .toBuffer();

  await page.getByRole("button", { name: "+ Upload", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name,
    mimeType: "image/png",
    buffer: bytes,
  });
  await expect(page.getByText(/1 image\(s\) uploaded/)).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole("button", { name: "Close dialog" }).click();

  let card = page.locator("article.media-tile").filter({ hasText: name });
  await card.hover();
  await card.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.getByText(/320 × 240/)).toBeVisible();
  await page
    .getByLabel("Alt text", { exact: true })
    .fill("Green rectangular test artwork");
  await page
    .getByRole("button", { name: "Save alt text", exact: true })
    .click();
  await expect(
    page.getByText("Alt text saved.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();

  await page.reload();
  card = page.locator("article.media-tile").filter({ hasText: name });
  await card.hover();
  await card.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.getByLabel("Alt text", { exact: true })).toHaveValue(
    "Green rectangular test artwork",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect
    .poll(() =>
      card.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);

  await card.hover();
  await card.getByRole("button", { name: "Replace", exact: true }).click();
  const replacement = "replacement-" + name;
  await page.locator('input[type="file"]').setInputFiles({
    name: replacement,
    mimeType: "image/png",
    buffer: bytes,
  });
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15000 });

  card = page.locator("article.media-tile").filter({ hasText: replacement });
  await card.hover();
  await card.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.getByLabel("Alt text", { exact: true })).toHaveValue(
    "Green rectangular test artwork",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();

  await card.hover();
  await card.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Delete image?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete image", exact: true })
    .click();
  await expect(card).toHaveCount(0);

  const sample = page
    .locator("article.media-tile")
    .filter({ hasText: "sample-nightshift.svg" });
  await sample.hover();
  await expect(
    sample.getByRole("button", { name: "Delete", exact: true }),
  ).toBeDisabled();

  const bulkA = "bulk-a-" + Date.now() + ".png";
  const bulkB = "bulk-b-" + Date.now() + ".png";
  await page.getByRole("button", { name: "+ Upload", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles([
    { name: bulkA, mimeType: "image/png", buffer: bytes },
    { name: bulkB, mimeType: "image/png", buffer: bytes },
  ]);
  await expect(page.getByText(/2 image\(s\) uploaded/)).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole("button", { name: "Close dialog" }).click();

  const bulkACard = page
    .locator("article.media-tile")
    .filter({ hasText: bulkA });
  const bulkBCard = page
    .locator("article.media-tile")
    .filter({ hasText: bulkB });
  await expect(bulkACard).toBeVisible();
  await expect(bulkBCard).toBeVisible();

  await page
    .getByRole("button", { name: "Select media", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Select " + bulkA, exact: true })
    .click();
  await page
    .getByRole("button", { name: "Select " + bulkB, exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete selected (2)", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Delete 2 images?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete 2 images", exact: true })
    .click();
  await expect(bulkACard).toHaveCount(0);
  await expect(bulkBCard).toHaveCount(0);

  await page.getByRole("button", { name: "+ Upload", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "invalid.png",
    mimeType: "image/png",
    buffer: Buffer.from("This is not an image"),
  });
  await expect(page.getByText(/Upload failed/)).toBeVisible();
  await expect(
    page.locator("article.media-tile").filter({ hasText: "invalid.png" }),
  ).toHaveCount(0);
});
