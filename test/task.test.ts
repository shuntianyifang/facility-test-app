import { describe, expect, it } from "vitest";
import { filterByQuery, filterTasks, matchesQuery, type Task } from "../shared/task.js";

const tasks: Task[] = [
  { id: "1", title: "写第一个测试", completed: false },
  { id: "2", title: "Review 登录页面", completed: true },
  { id: "3", title: "写 README", completed: false },
];

describe("matchesQuery", () => {
  it("matches everything when the query is empty or whitespace only", () => {
    expect(matchesQuery("写测试", "")).toBe(true);
    expect(matchesQuery("写测试", "   ")).toBe(true);
    expect(matchesQuery("写测试", "\t\n")).toBe(true);
  });
  it("matches case-insensitive substrings", () => {
    expect(matchesQuery("Review 登录页面", "review")).toBe(true);
    expect(matchesQuery("Review 登录页面", "REVIEW")).toBe(true);
    expect(matchesQuery("Review 登录页面", "登录")).toBe(true);
  });
  it("trims the query before matching", () => {
    expect(matchesQuery("写第一个测试", "  测试  ")).toBe(true);
    expect(matchesQuery("写第一个测试", " 写 ")).toBe(true);
  });
  it("does not match unrelated titles", () => {
    expect(matchesQuery("写第一个测试", "部署")).toBe(false);
    expect(matchesQuery("写第一个测试", "est")).toBe(false);
  });
});

describe("filterByQuery", () => {
  it("returns all tasks for an empty or whitespace-only query", () => {
    expect(filterByQuery(tasks, "")).toEqual(tasks);
    expect(filterByQuery(tasks, "   ")).toEqual(tasks);
  });
  it("filters by case-insensitive substring", () => {
    expect(filterByQuery(tasks, "review").map((task) => task.id)).toEqual(["2"]);
    expect(filterByQuery(tasks, "写").map((task) => task.id)).toEqual(["1", "3"]);
  });
  it("returns an empty list when nothing matches", () => {
    expect(filterByQuery(tasks, "不存在的关键词")).toEqual([]);
  });
  it("composes with the existing status filter", () => {
    expect(filterByQuery(filterTasks(tasks, "active"), "写").map((task) => task.id)).toEqual([
      "1",
      "3",
    ]);
    expect(filterByQuery(filterTasks(tasks, "completed"), "review").map((task) => task.id)).toEqual(
      ["2"],
    );
    expect(filterByQuery(filterTasks(tasks, "completed"), "写")).toEqual([]);
  });
});
