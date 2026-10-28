// Gemini CLI 0.55.1 infers "gateway" from GOOGLE_GEMINI_BASE_URL, but its
// noninteractive validator rejects that type. Explicit API-key auth still
// honors the same proxy URL and the sandbox's isolated placeholder key.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const filename = path.join(process.cwd(), ".gemini", "settings.json");
fs.mkdirSync(path.dirname(filename), { recursive: true });
const settings = fs.existsSync(filename)
  ? JSON.parse(fs.readFileSync(filename, "utf8"))
  : {};
settings.security = {
  ...settings.security,
  auth: { ...settings.security?.auth, selectedType: "gemini-api-key" },
};
fs.writeFileSync(filename, JSON.stringify(settings, null, 2), { mode: 0o600 });
const executable = process.env.GH_AW_GEMINI_EXECUTABLE || "gemini";
const prefix = JSON.parse(process.env.GH_AW_GEMINI_EXECUTABLE_ARGS || "[]");
const result = spawnSync(executable, [...prefix, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});
if (result.error) {
  console.error("Unable to start Gemini CLI:", result.error.message);
}
process.exit(result.status ?? 1);