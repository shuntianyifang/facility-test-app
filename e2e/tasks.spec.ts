import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const tasks = await (await request.get("/api/tasks")).json();
  for (const task of tasks) await request.delete(`/api/tasks/${task.id}`);
});

test("a user can add, complete, filter, restore, and delete a task", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "留白，是开始的地方。" })).toBeVisible();
  await page.getByLabel("下一步想做什么？").fill("写第一个测试");
  await page.getByRole("button", { name: "添加任务" }).click();
  const checkbox = page.getByRole("checkbox", { name: "完成：写第一个测试" });
  await expect(checkbox).not.toBeChecked();
  // Completion is confirmed by the server, so wait for the controlled state.
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await page.getByRole("button", { name: "待完成", exact: true }).click();
  await expect(checkbox).toHaveCount(0);
  await page.getByRole("button", { name: "已完成", exact: true }).click();
  await expect(checkbox).toBeVisible();
  await checkbox.click();
  await expect(page.getByRole("status")).toContainText("任务已恢复为待完成");
  await page.getByRole("button", { name: "全部任务", exact: true }).click();
  await page.reload();
  await expect(checkbox).not.toBeChecked();
  await page.getByRole("button", { name: "删除：写第一个测试" }).click();
  await expect(checkbox).toHaveCount(0);
});

test("the header shows the active task count and stays stable across filters", async ({ page }) => {
  await page.goto("/");
  const badge = page.locator(".active-badge");
  await expect(badge).toHaveText("0 待完成");
  await expect(badge).toHaveAttribute("aria-label", "0 个待完成任务");
  await page.getByLabel("下一步想做什么？").fill("写第一个测试");
  await page.getByRole("button", { name: "添加任务" }).click();
  await expect(badge).toHaveText("1 待完成");
  await page.getByLabel("下一步想做什么？").fill("写第二个测试");
  await page.getByRole("button", { name: "添加任务" }).click();
  await expect(badge).toHaveText("2 待完成");
  const checkbox = page.getByRole("checkbox", { name: "完成：写第二个测试" });
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await expect(badge).toHaveText("1 待完成");
  await page.getByRole("button", { name: "已完成", exact: true }).click();
  await expect(badge).toHaveText("1 待完成");
  await page.getByRole("button", { name: "待完成", exact: true }).click();
  await expect(badge).toHaveText("1 待完成");
  await page.getByRole("button", { name: "全部任务", exact: true }).click();
  await expect(badge).toHaveText("1 待完成");
});

test("blank titles are rejected and script-like text is not executed", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("下一步想做什么？").fill("   ");
  await page.getByRole("button", { name: "添加任务" }).click();
  await expect(page.getByRole("alert")).toContainText("不能只包含空格");
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await page.getByLabel("下一步想做什么？").fill("<script>alert(1)</script>");
  await page.getByRole("button", { name: "添加任务" }).click();
  await expect(page.getByRole("listitem")).toContainText("<script>alert(1)</script>");
  await expect(page.locator(".task-title script")).toHaveCount(0);
});

test("failed mutations leave existing tasks unchanged", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("下一步想做什么？").fill("保留这项任务");
  await page.getByRole("button", { name: "添加任务" }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await page.route("**/api/tasks/*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "测试服务暂时不可用" }),
    }),
  );
  await page.getByRole("button", { name: "删除：保留这项任务" }).click();
  await expect(page.getByRole("alert")).toContainText("测试服务暂时不可用");
  await expect(page.getByRole("checkbox")).toHaveCount(1);
});

test("mobile layout keeps the primary action usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("下一步想做什么？").fill("手机端任务");
  await page.getByRole("button", { name: "添加任务" }).click();
  await expect(page.getByRole("checkbox", { name: "完成：手机端任务" })).toBeVisible();
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflows).toBe(false);
});
