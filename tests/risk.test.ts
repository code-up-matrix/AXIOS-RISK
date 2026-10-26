import { describe, it, expect } from "vitest";
import { investigate, samples, DEMO_LIMITS } from "../lib/risk";
describe("evidence investigations", () => {
  it("keeps contradictory evidence and produces a provenance graph", async () => {
    const report = await investigate(samples.cooling, DEMO_LIMITS);
    expect(report.findings.some((f) => f.title === "Sources disagree")).toBe(
      true,
    );
    expect(report.eventCount).toBeGreaterThan(0);
    for (const f of report.findings)
      for (const id of f.evidence)
        expect(report.observations.some((r) => r.id === id)).toBe(true);
  });
  it("does not invent a fault when only a noise note exists", async () => {
    const report = await investigate(samples.incomplete, DEMO_LIMITS);
    expect(report.findings[0].severity).toBe("unknown");
  });
  it("uses configured limits instead of hardcoded demonstration limits", async () => {
    const report = await investigate(samples.cooling, {
      ...DEMO_LIMITS,
      coolantMax: 120,
    });
    expect(report.findings.some((f) => f.severity === "action")).toBe(false);
  });
  it("prevents mixing assets in one conclusion", async () => {
    await expect(
      investigate([...samples.cooling, ...samples.incomplete], DEMO_LIMITS),
    ).rejects.toThrow("one asset");
  });
});
