import { expect, test } from "@playwright/test";

const PROTECTED_PAGES = [
  { path: "/yonetim", next: "/yonetim" },
  { path: "/dukkan-ayarlari/urunler", next: "/dukkan-ayarlari/urunler" },
  { path: "/yonetim/harita-pazari", next: "/yonetim/harita-pazari" },
];

test.describe("Giriş yapılmamış kullanıcı", () => {
  for (const { path, next } of PROTECTED_PAGES) {
    test(`${path} giriş kartı gösterir ve geri dönüş adresini korur`, async ({ page }) => {
      await page.goto(path);
      const login = page.locator(`a[href="/giris?next=${next}"]`);
      await expect(login).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Yönetim — hızlı menü" })).toHaveCount(0);
    });
  }
});
