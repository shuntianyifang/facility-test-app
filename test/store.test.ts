import { describe, expect, it } from "vitest";
import { TaskStore } from "../server/store.js";
import { filterTasks } from "../shared/task.js";

describe("task domain", () => {
  it("starts empty and trims titles", () => {
    const store = new TaskStore(() => "one");
    expect(store.list()).toEqual([]);
    expect(store.create("  写测试  ")).toEqual({ id: "one", title: "写测试", completed: false });
  });
  it.each(["", "   ", "\t\n", "x".repeat(121)])(
    "rejects invalid title %j without storing a task",
    (title) => {
      const store = new TaskStore();
      expect(() => store.create(title)).toThrow();
      expect(store.list()).toEqual([]);
    },
  );
  it("accepts exactly 120 characters", () =>
    expect(new TaskStore().create("x".repeat(120)).title).toHaveLength(120));
  it("returns snapshots that cannot mutate stored state", () => {
    const store = new TaskStore(() => "one");
    const task = store.create("original");
    task.title = "changed";
    store.list()[0].completed = true;
    expect(store.list()).toEqual([{ id: "one", title: "original", completed: false }]);
  });
  it("toggles, filters and deletes tasks", () => {
    let id = 0;
    const store = new TaskStore(() => String(++id));
    store.create("first");
    store.create("second");
    expect(store.setCompleted("1", true)?.completed).toBe(true);
    expect(filterTasks(store.list(), "all")).toHaveLength(2);
    expect(filterTasks(store.list(), "active").map((task) => task.id)).toEqual(["2"]);
    expect(filterTasks(store.list(), "completed").map((task) => task.id)).toEqual(["1"]);
    store.setCompleted("1", false);
    expect(filterTasks(store.list(), "completed")).toEqual([]);
    expect(store.delete("1")).toBe(true);
    expect(store.delete("1")).toBe(false);
    expect(store.setCompleted("missing", true)).toBeUndefined();
  });
  it("does not share state between instances", () => {
    const first = new TaskStore();
    first.create("local");
    expect(new TaskStore().list()).toEqual([]);
  });
});
