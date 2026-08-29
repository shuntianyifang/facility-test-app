import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const tasks = await (await request.get("/api/tasks")).json();
  for (const task of tasks) await request.delete(`/api/tasks/${task.id}`);
});

async function addTask(page: import("@playwright/test").Page, title: string) {
  await page.getByLabel("下一步想做什么？").fill(title);
  await page.getByRole("button", { name: "添加任务" }).click();
}

test("search shows only matching titles and is case-insensitive", async ({ page }) => {
  await page.goto("/");
  await addTask(page, "Review PR 详情");
  await addTask(page, "写单元测试");
  await addTask(page, "review 部署文档");
  const search = page.getByLabel("搜索任务");
  await search.fill("REVIEW");
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await expect(page.locator(".task-list")).toContainText("Review PR 详情");
  await expect(page.locator(".task-list")).toContainText("review 部署文档");
  await expect(page.locator(".task-list")).not.toContainText("写单元测试");
  await expect(page.locator(".list-count")).toHaveText("2 个任务");
});

test("search composes with active and completed status filters", async ({ page }) => {
  await page.goto("/");
  await addTask(page, "alpha 待办");
  await addTask(page, "beta 待办");
  await page.getByRole("checkbox", { name: "完成：beta 待办" }).click();
  await expect(page.getByRole("checkbox", { name: "完成：beta 待办" })).toBeChecked();
  const search = page.getByLabel("搜索任务");
  await search.fill("待办");
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: "待完成", exact: true }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(page.locator(".task-list")).toContainText("alpha 待办");
  await expect(page.locator(".task-list")).not.toContainText("beta 待办");
  await page.getByRole("button", { name: "已完成", exact: true }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(page.locator(".task-list")).toContainText("beta 待办");
});

test("no match shows an empty list with a clear message", async ({ page }) => {
  await page.goto("/");
  await addTask(page, "写单元测试");
  await page.getByLabel("搜索任务").fill("不存在的关键词");
  await expect(page.getByRole("listitem")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "没有找到匹配的任务。" })).toBeVisible();
});

test("clearing the search restores the current status filter", async ({ page }) => {
  await page.goto("/");
  await addTask(page, "alpha 待办");
  await addTask(page, "beta 待办");
  await page.getByRole("checkbox", { name: "完成：beta 待办" }).click();
  await expect(page.getByRole("checkbox", { name: "完成：beta 待办" })).toBeChecked();
  await page.getByRole("button", { name: "待完成", exact: true }).click();
  const search = page.getByLabel("搜索任务");
  await search.fill("beta");
  await expect(page.getByRole("listitem")).toHaveCount(0);
  await search.fill("");
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(page.locator(".task-list")).toContainText("alpha 待办");
  await search.fill("   ");
  await expect(page.getByRole("listitem")).toHaveCount(1);
});

test("add, complete and delete still work while a search is active", async ({ page }) => {
  await page.goto("/");
  await addTask(page, "写单元测试");
  await page.getByLabel("搜索任务").fill("单元");
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await addTask(page, "部署指南");
  await addTask(page, "单元测试补充");
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await expect(page.locator(".task-list")).toContainText("写单元测试");
  await expect(page.locator(".task-list")).toContainText("单元测试补充");
  await expect(page.locator(".task-list")).not.toContainText("部署指南");
  const checkbox = page.getByRole("checkbox", { name: "完成：单元测试补充" });
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await page.getByRole("button", { name: "删除：写单元测试" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(page.locator(".task-list")).toContainText("单元测试补充");
});
