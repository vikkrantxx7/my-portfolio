import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("wiki Gemini authentication", () => {
  it("selects API-key authentication while preserving MCP configuration and the proxy", () => {
    const dir = mkdtempSync(join(tmpdir(), "wiki-auth-"));
    try {
      mkdirSync(join(dir, ".gemini"));
      const settings = { mcpServers: { github: { url: "http://gateway.test" } }, tools: { core: ["read_file"] } };
      writeFileSync(join(dir, ".gemini/settings.json"), JSON.stringify(settings));
      const fakeCli = join(dir, "fake-cli.cjs");
      writeFileSync(fakeCli, 'console.log(JSON.stringify({args:process.argv.slice(2),proxy:process.env.GOOGLE_GEMINI_BASE_URL,key:process.env.GEMINI_API_KEY}));');
      const result = spawnSync(process.execPath, [resolve(".github/aw/gemini-api-key.cjs"), "--prompt", "test input"], {
        cwd: dir,
        env: { ...process.env, GEMINI_API_KEY: "placeholder-test-key", GOOGLE_GEMINI_BASE_URL: "http://proxy.test", GH_AW_GEMINI_EXECUTABLE: process.execPath, GH_AW_GEMINI_EXECUTABLE_ARGS: JSON.stringify([fakeCli]) },
        encoding: "utf8",
      });
      expect(result.status).toBe(0);
      expect(JSON.parse(readFileSync(join(dir, ".gemini/settings.json"), "utf8"))).toEqual({ ...settings, security: { auth: { selectedType: "gemini-api-key" } } });
      expect(JSON.parse(result.stdout)).toEqual({ args: ["--prompt", "test input"], proxy: "http://proxy.test", key: "placeholder-test-key" });
      expect(readFileSync(join(dir, ".gemini/settings.json"), "utf8")).not.toContain("placeholder-test-key");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  it("fails closed on malformed settings", () => {
    const dir = mkdtempSync(join(tmpdir(), "wiki-auth-"));
    try {
      mkdirSync(join(dir, ".gemini"));
      writeFileSync(join(dir, ".gemini/settings.json"), "not json");
      const result = spawnSync(process.execPath, [resolve(".github/aw/gemini-api-key.cjs")], { cwd: dir, encoding: "utf8" });
      expect(result.status).not.toBe(0);
      expect(readFileSync(join(dir, ".gemini/settings.json"), "utf8")).toBe("not json");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});