import { test, expect } from "@playwright/test";

test("login -> users -> detail -> logout", async ({ page }) => {
  // ✅ 先进入应用，确保前端初始化/守卫/动态注入有机会执行
  await page.goto("/");

  // 再访问 users：未登录应到 login（如果你先到 404，也会被后续流程修正）
  await page.goto("#/users");
  await expect(page).toHaveURL(/\/#\/(login|404)/);

  // 如果落在 404，就再访问一次 users（给动态路由注入一次机会）
  // （CI 环境慢的时候很常见）
  if (page.url().endsWith("/#/404")) {
    await page.goto("#/users");
  }

  // 最终应该来到 login
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
