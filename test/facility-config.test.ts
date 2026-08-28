import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const config = JSON.parse(readFileSync(new URL("../.facility.json", import.meta.url), "utf8"));

describe("manual Facility test configuration", () => {
  it("keeps planning and implementation in the local platform", () => {
    expect(config.executionLane).toEqual({
      architect: "platform",
      "codex-architect": "platform",
      builder: "platform",
      "codex-builder": "platform",
    });
  });

  it("uses only the intended DeepSeek model without credential or billing fields", () => {
    expect(config.models).toEqual({
      codexPlan: "deepseek-v4-flash",
      codexBuild: "deepseek-v4-flash",
    });
    expect(Object.keys(config).sort()).toEqual([
      "checks",
      "executionLane",
      "models",
      "packageInstall",
      "provision",
    ]);
  });

  it("requires frozen dependencies and every application acceptance check", () => {
    expect(config.packageInstall).toBe("pnpm install --frozen-lockfile");
    expect(config.provision).toBe("pnpm setup");
    expect(config.checks).toEqual([
      "pnpm lint",
      "pnpm typecheck",
      "pnpm test",
      "pnpm test:e2e",
      "pnpm build",
    ]);
  });

  it("keeps GitHub Actions limited to the existing credential-free application CI", () => {
    const workflows = new URL("../.github/workflows/", import.meta.url);
    expect(readdirSync(workflows).sort()).toEqual(["ci.yml"]);
    const workflow = readFileSync(new URL("ci.yml", workflows), "utf8");
    expect(workflow).not.toMatch(/\b(?:schedule|pull_request_target)\s*:/);
    expect(workflow).not.toMatch(/secrets\s*(?:\.|\[)|DEEPSEEK_API_KEY|OPENAI_API_KEY/);
    expect(workflow).toContain("pnpm verify");
  });
});
