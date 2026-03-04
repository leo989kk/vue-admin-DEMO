import { test, expect } from "@playwright/test";

test("login -> users -> detail -> logout", async ({ page }) => {
  // 访问 users，会被守卫踢到 login
  await page.goto("#/users");
  await expect(page).toHaveURL(/\/#\/login/);

  // 登录
  await page.getByLabel("账号").fill("admin");
  await page.getByLabel("密码").fill("123456");
  await page.getByRole("button", { name: "登录" }).click();

  // 进入 users
  await page.goto("#/users");
  await expect(page).toHaveURL(/\/#\/users/);

  // 表格有数据（Alice/Bob/Charlie）
  await expect(page.getByText("Alice")).toBeVisible();

  // 进入详情
  await page.goto("#/users/1");
  await expect(page.getByText("用户详情")).toBeVisible();

  // 退出
  await page.getByRole("button", { name: "退出" }).click();
  await expect(page).toHaveURL(/\/#\/login/);
});
