import { expect, test, type Page } from "@playwright/test";

/**
 * Esnaf hesabıyla panel testleri. E2E_EMAIL ve E2E_PASSWORD verilmezse atlanır.
 * Testler hiçbir zaman "Kaydet"e basmaz; değişiklikler İptal ile geri alınır.
 */
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL / E2E_PASSWORD tanımlı değil");

async function login(page: Page, next: string) {
  await page.goto(`/giris?next=${encodeURIComponent(next)}`);
  const form = page.locator("form").filter({ has: page.locator('input[autocomplete="current-password"]') });
  if ((await form.count()) === 0) {
    await page.getByRole("button", { name: "Giriş Yap", exact: true }).first().click();
  }
  await form.locator('input[name="email"]').fill(EMAIL!);
  await form.locator('input[name="password"]').fill(PASSWORD!);
  await form.getByRole("button", { name: "Giriş Yap" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/giris"), { timeout: 30_000 });
  if (!page.url().includes(next)) await page.goto(next);
}

const tabBar = (page: Page) => page.getByRole("navigation", { name: "Yönetim — hızlı menü" });

test.describe("Yönetim paneli", () => {
  test("ana sayfa: hızlı işlemler, skor dökümü ve tüm modüller", async ({ page }) => {
    await login(page, "/yonetim");

    await expect(page.getByRole("link", { name: /Ürün ekle/ }).first()).toHaveAttribute(
      "href",
      "/dukkan-ayarlari/urunler"
    );
    await expect(page.getByRole("heading", { name: "Tüm modüller" })).toBeVisible();

    await page.getByRole("button", { name: /Dökümü göster$/ }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("mobil sekme çubuğu yalnızca mobilde görünür; 'Daha fazla' menüsü açılır", async ({
    page,
    isMobile,
  }) => {
    await login(page, "/yonetim");

    if (!isMobile) {
      await expect(tabBar(page)).toBeHidden();
      return;
    }

    await expect(tabBar(page)).toBeVisible();
    await tabBar(page).getByRole("button", { name: /Daha fazla/ }).click();
    const more = page.getByRole("dialog", { name: "Diğer yönetim bölümleri" });
    await expect(more).toBeVisible();
    await more.getByRole("button", { name: "Kapat", exact: true }).click();
    await expect(more).toBeHidden();
  });

  test("ürünler: değişiklik yapınca mobilde kaydet çubuğu sekme çubuğunun yerini alır", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Yalnızca mobil davranış");
    await login(page, "/dukkan-ayarlari/urunler");

    const saveButton = page.getByRole("button", { name: "Ürünleri kaydet" });
    await expect(tabBar(page)).toBeVisible();
    await expect(saveButton).toBeHidden();

    const firstCard = page.getByRole("button", { name: /ürününü düzenle$/ }).first();
    test.skip((await firstCard.count()) === 0, "Mağazada ürün yok");
    await firstCard.click();

    const panel = page.getByRole("dialog");
    const nameInput = panel.getByLabel("Ürün / Hizmet adı");
    await nameInput.fill(`${await nameInput.inputValue()} (e2e)`);
    await panel.getByRole("button", { name: "Kapat", exact: true }).click();
    await expect(panel).toBeHidden();

    await expect(saveButton).toBeVisible();
    await expect(tabBar(page)).toBeHidden();

    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "İptal" }).click();

    await expect(saveButton).toBeHidden();
    await expect(tabBar(page)).toBeVisible();
  });
});
