import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { TITLE_LIMIT } from "../shared/task.js";
import { TaskStore } from "./store.js";

export function buildApp({ store = new TaskStore(), serveStatic = false } = {}) {
  const app = Fastify({
    logger: false,
    bodyLimit: 16_384,
    ajv: { customOptions: { coerceTypes: false, removeAdditional: false } },
  });
  app.get("/healthz", async () => ({ ok: true }));
  app.get("/api/tasks", async () => store.list());
  app.post<{ Body: { title: string } }>(
    "/api/tasks",
    {
      schema: {
        body: {
          type: "object",
          required: ["title"],
          additionalProperties: false,
          properties: { title: { type: "string", minLength: 1, maxLength: TITLE_LIMIT } },
        },
      },
    },
    async (request, reply) => {
      try {
        return reply.code(201).send(store.create(request.body.title));
      } catch {
        return reply.code(400).send({ error: `任务标题应为 1–${TITLE_LIMIT} 个字符` });
      }
    },
  );
  app.patch<{ Params: { id: string }; Body: { completed: boolean } }>(
    "/api/tasks/:id",
    {
      schema: {
        body: {
          type: "object",
          required: ["completed"],
          additionalProperties: false,
          properties: { completed: { type: "boolean" } },
        },
      },
    },
    async (request, reply) => {
      const task = store.setCompleted(request.params.id, request.body.completed);
      return task ?? reply.code(404).send({ error: "任务不存在" });
    },
  );
  app.delete<{ Params: { id: string } }>("/api/tasks/:id", async (request, reply) => {
    if (!store.delete(request.params.id)) return reply.code(404).send({ error: "任务不存在" });
    return reply.code(204).send();
  });
  app.setErrorHandler((error, _request, reply) => {
    const code =
      error && typeof error === "object" && "statusCode" in error ? error.statusCode : 500;
    const status = typeof code === "number" && code >= 400 && code < 500 ? code : 500;
    reply.code(status).send({ error: status === 500 ? "服务暂时不可用" : "请求格式不正确" });
  });
  if (serveStatic)
    app.register(fastifyStatic, {
      root: fileURLToPath(new URL("../client/", import.meta.url)),
      prefix: "/",
    });
  return app;
}
