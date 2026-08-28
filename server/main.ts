import { buildApp } from "./app.js";

const app = buildApp({ serveStatic: !process.argv.includes("--api-only") });
const port = Number(process.env.PORT ?? 4312);
const host = process.env.HOST ?? "127.0.0.1";
try {
  await app.listen({ port, host });
  console.log(`Taskroom: http://${host}:${port} (in-memory data; restart clears tasks)`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    await app.close();
    process.exit(0);
  });
}
