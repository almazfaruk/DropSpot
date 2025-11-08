import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Kullanıcı Auth Akışı", () => {
  test("Kayıt ol ve giriş yap", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.fill('input[placeholder="E-posta"]', "user1@a.com");
    await page.fill('input[placeholder="Şifre"]', "123");
    await page.click("text=Kayıt Ol");

    await expect(page).toHaveURL(`${BASE_URL}/login`);

    await page.fill('input[placeholder="E-posta"]', "user1@a.com");
    await page.fill('input[placeholder="Şifre"]', "123");
    await page.getByRole("button", { name: "Giriş Yap" }).click();

    await expect(page).toHaveURL(`${BASE_URL}/drops`);
  });
});
