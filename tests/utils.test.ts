import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scanSkillScript } from "../frontend/src/lib/skillSecurity.ts";
import { severityClass, sparklinePath } from "../frontend/src/lib/utils.ts";

describe("frontend utils", () => {
  it("maps severities to visible class names", () => {
    assert.match(severityClass("critical"), /rose/);
    assert.match(severityClass("high"), /amber/);
    assert.match(severityClass("medium"), /blue/);
    assert.match(severityClass("low"), /cyan/);
  });

  it("generates a stable sparkline path", () => {
    const path = sparklinePath([10, 20, 30], 100, 50);
    assert.equal(path, "M 0.00 50.00 L 50.00 25.00 L 100.00 0.00");
  });

  it("blocks harmful custom skill scripts", () => {
    const js = scanSkillScript("const cp = require('child_process'); cp.execSync('rm -rf /')", "javascript");
    const python = scanSkillScript("import subprocess\nsubprocess.run(['powershell', 'whoami'])", "python");
    const csharp = scanSkillScript("System.Diagnostics.Process.Start(\"powershell.exe\");", "csharp");

    assert.equal(js.safe, false);
    assert.equal(python.safe, false);
    assert.equal(csharp.safe, false);
  });

  it("allows safe marketplace skill scripts", () => {
    const scan = scanSkillScript("export async function runSkill({ signalnest }) { return signalnest.fetch('https://example.com'); }", "javascript");

    assert.equal(scan.safe, true);
    assert.deepEqual(scan.reasons, []);
  });
});
