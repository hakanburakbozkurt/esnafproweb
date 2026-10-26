import { expect, test, type Page } from "@playwright/test";

/** Ürünleri ve WhatsApp numarası olan yayındaki bir mağaza */
const SLUG = process.env.E2E_VITRIN_SLUG ?? "beepmobilestore";

const productCards = (page: Page) =>
  page.locator("#urunler").getByRole("button", { name: /detayları gör$/ });

async function openFirstProduct(page: Page) {
  await page.goto(`/${SLUG}`);
  const card = productCards(page).first();
  await expect(card, `${SLUG} vitrininde ürün yok`).toBeVisible();
  const name = (await card.getAttribute("aria-label"))!.replace(/ — detayları gör$/, "");
  await card.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/[?&]urun=/);
  return { card, dialog, name };
}

test.describe("Vitrin — ürün detayı", () => {
  test("kart tıklanınca detay açılır, adres ?urun= alır ve Escape kapatır", async ({ page }) => {
    const { card, dialog, name } = await openFirstProduct(page);

    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(name);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/[?&]urun=/);
    await expect(card).toBeFocused();
  });

  test("tarayıcının geri tuşu detayı kapatır", async ({ page }) => {
    const { dialog } = await openFirstProduct(page);

    await page.goBack();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`/${SLUG}$`));
  });

  test("paylaşılan ?urun= bağlantısı doğrudan detayı açar", async ({ page, browser }) => {
    const { name } = await openFirstProduct(page);
    const sharedUrl = page.url();

    const fresh = await browser.newPage();
    await fresh.goto(sharedUrl);
    const dialog = fresh.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(name);

    await dialog.getByRole("button", { name: "Kapat", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(fresh).not.toHaveURL(/[?&]urun=/);
    await fresh.close();
  });

  test("WhatsApp mesajı ürün adını ve ürün bağlantısını içerir", async ({ page }) => {
    const { dialog, name } = await openFirstProduct(page);
    const urunId = new URL(page.url()).searchParams.get("urun")!;

    const whatsapp = dialog.getByRole("link", { name: /WhatsApp'tan sor/ });
    test.skip((await whatsapp.count()) === 0, "Mağazanın WhatsApp numarası yok");

    const text = new URL((await whatsapp.getAttribute("href"))!).searchParams.get("text")!;
    expect(text).toContain(name);
    expect(text).toContain(`/${SLUG}?urun=${encodeURIComponent(urunId)}`);
  });

  test("bilinmeyen ürün kimliğinde detay açılmaz", async ({ page }) => {
    await page.goto(`/${SLUG}?urun=olmayan-urun`);
    await expect(productCards(page).first()).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("fotoğrafa dokununca tam ekran açılır; Escape önce onu, sonra detayı kapatır", async ({
    page,
  }) => {
    const { dialog } = await openFirstProduct(page);
    const photo = dialog.getByRole("button", { name: /^Fotoğraf 1: büyüt$/ });
    test.skip((await photo.count()) === 0, "Üründe fotoğraf yok");

    await photo.click();
    await expect(page.getByRole("dialog")).toHaveCount(2);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("Vitrin — mobil alt çubuk", () => {
  test("alt iletişim çubuğu yalnızca mobilde görünür ve içeriği örtmez", async ({
    page,
    isMobile,
  }) => {
    await page.goto(`/${SLUG}`);
    const bar = page.getByRole("navigation", { name: "Hızlı iletişim" });

    if (!isMobile) {
      await expect(bar).toBeHidden();
      return;
    }

    await expect(bar).toBeVisible();
    const padding = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.body).paddingBottom)
    );
    const barHeight = (await bar.boundingBox())!.height;
    expect(padding).toBeGreaterThanOrEqual(barHeight - 1);
  });
});
