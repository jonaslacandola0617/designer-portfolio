import { test, expect } from "@playwright/test";
test("admin publishing lifecycle, ordering, settings and logout", async ({
  page,
  browser,
}) => {
  const title = `Browser test ${Date.now()}`;
  const slug = title.toLowerCase().replaceAll(" ", "-");
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page
    .getByLabel("Email", { exact: true })
    .fill(process.env.ADMIN_EMAIL!);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Enter Studio →", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/projects$/);
  await page.getByRole("link", { name: "+ New project", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill(title);
  await expect(page.getByLabel("Slug", { exact: true })).toHaveValue(slug);
  await page
    .getByLabel("Short description", { exact: true })
    .fill("An automated fictional test project.");
  await page
    .getByLabel("Brief", { exact: true })
    .fill("Browser verification of the publishing workflow.");
  await page.getByLabel("Role", { exact: true }).fill("Graphic designer");
  await page.getByRole("button",{name:"Upload cover artwork",exact:true}).click();
  await page.getByRole("button",{name:"Select sample-nightshift.svg",exact:true}).click();
  await page.getByRole("button",{name:"Add gallery image",exact:true}).click();
  await page.getByRole("button",{name:"Select sample-motion-energy.svg",exact:true}).click();
  await page.getByRole("button",{name:"Edit gallery image sample-motion-energy.svg",exact:true}).click();
  await page
    .getByLabel("Caption", { exact: true })
    .fill("Gallery caption from browser test");
  await page
    .getByRole("combobox", { name: "Layout hint", exact: true })
    .selectOption("FULL_WIDTH");
  await page.getByRole("button",{name:"Close dialog"}).click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/(?!new)[^/]+$/);
  const editUrl = page.url();
  const id = editUrl.split("/").pop();
  const visitor = await browser.newContext();
  const publicPage = await visitor.newPage();
  expect((await publicPage.goto(`/work/${slug}`))?.status()).toBe(404);
  await page.goto(`/admin/preview/${id}`);
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await publicPage.goto(`/admin/preview/${id}`);
  await expect(publicPage).toHaveURL(/\/admin\/login/);
  await page.goto(editUrl);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Project saved.", { exact: true })).toBeVisible();
  await publicPage.goto(`/work/${slug}`);
  await expect(
    publicPage.getByText(title, { exact: true }).first(),
  ).toBeVisible();
  await expect(
    publicPage.getByText("Gallery caption from browser test"),
  ).toBeVisible();
  await publicPage.goto("/work");
  await expect(
    publicPage.getByText(title, { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Project saved.", { exact: true })).toBeVisible();
  expect((await publicPage.goto(`/work/${slug}`))?.status()).toBe(404);
  await publicPage.goto("/work");
  await expect(
    publicPage.getByText(title, { exact: true }).first(),
  ).toHaveCount(0);
  await page.goto("/admin/projects");
  await page.getByRole("button",{name:"Manage order",exact:true}).click();
  await page
    .getByRole("button", { name: "Move down", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Save project order", exact: true })
    .click();
  await expect(page.getByText("Change saved.", { exact: true })).toBeVisible();
  await page.goto("/admin/settings");
  const availability = page.getByLabel("Availability", { exact: true });
  const original = await availability.inputValue();
  await availability.fill("Available for browser verification");
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await expect(page.getByRole("status").first()).toContainText(
    "Settings saved.",
  );
  await publicPage.goto("/contact");
  await expect(
    publicPage.getByText("Available for browser verification").first(),
  ).toBeVisible();
  await availability.fill(original);
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page.goto("/admin/projects");
  await page.getByRole("button",{name:"Manage order",exact:true}).click();
  const row = page
    .locator(".sortable-item")
    .filter({ has: page.getByRole("link", { name: title, exact: true }) });
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Delete project?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete project", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: title, exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin/settings");
  await expect(page).toHaveURL(/\/admin\/login/);
  await visitor.close();
});
test("public routes, SEO and small-screen layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/work", "/about", "/contact"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /design\.jonasl\.online\/?$/,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /^https?:\/\//,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
    "href",
    /icon\.svg/,
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    /manifest\.webmanifest/,
  );

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).not.toContain("/admin/");

  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");

  const icon = await page.request.get("/icon.svg");
  expect(icon.ok()).toBe(true);
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");

  const socialImage = await page.request.get("/opengraph-image");
  expect(socialImage.ok()).toBe(true);
  expect(socialImage.headers()["content-type"]).toContain("image/png");

  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(manifest.headers()["content-type"]).toContain("application/manifest+json");

  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
