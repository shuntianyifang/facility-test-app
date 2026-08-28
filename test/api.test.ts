import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../server/app.js";

describe("task API (local deterministic integration)", () => {
  let app: ReturnType<typeof buildApp>;
  beforeEach(() => {
    app = buildApp();
  });
  afterEach(async () => {
    await app.close();
  });
  it("provides health and an empty collection", async () => {
    expect((await app.inject("/healthz")).json()).toEqual({ ok: true });
    expect((await app.inject("/api/tasks")).json()).toEqual([]);
  });
  it("implements create, read, update, and delete", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { title: "  hello  " },
    });
    expect(created.statusCode).toBe(201);
    const task = created.json();
    expect(task).toMatchObject({ title: "hello", completed: false });
    expect((await app.inject("/api/tasks")).json()).toEqual([task]);
    const updated = await app.inject({
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      payload: { completed: true },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().completed).toBe(true);
    expect((await app.inject({ method: "DELETE", url: `/api/tasks/${task.id}` })).statusCode).toBe(
      204,
    );
    expect((await app.inject("/api/tasks")).json()).toEqual([]);
    expect((await app.inject({ method: "DELETE", url: `/api/tasks/${task.id}` })).statusCode).toBe(
      404,
    );
  });
  it.each([
    {},
    { title: "" },
    { title: "   " },
    { title: 3 },
    { title: null },
    { title: "x".repeat(121) },
    { title: "ok", extra: true },
  ])("rejects invalid create payload %j", async (payload) => {
    expect((await app.inject({ method: "POST", url: "/api/tasks", payload })).statusCode).toBe(400);
    expect((await app.inject("/api/tasks")).json()).toEqual([]);
  });
  it.each([{}, { completed: "true" }, { completed: 1 }, { completed: true, title: "overwrite" }])(
    "rejects invalid update payload %j",
    async (payload) => {
      const task = (
        await app.inject({ method: "POST", url: "/api/tasks", payload: { title: "untouched" } })
      ).json();
      expect(
        (await app.inject({ method: "PATCH", url: `/api/tasks/${task.id}`, payload })).statusCode,
      ).toBe(400);
      expect((await app.inject("/api/tasks")).json()[0]).toEqual(task);
    },
  );
  it("rejects malformed JSON and missing task IDs", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/tasks",
      headers: { "content-type": "application/json" },
      payload: "{",
    });
    expect(response.statusCode).toBe(400);
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: "/api/tasks/missing",
          payload: { completed: true },
        })
      ).statusCode,
    ).toBe(404);
  });
  it("retains literal markup as data", async () => {
    const title = "<script>alert(1)</script>";
    expect(
      (await app.inject({ method: "POST", url: "/api/tasks", payload: { title } })).json().title,
    ).toBe(title);
  });
});
