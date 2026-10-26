import { it, expect } from "vitest";
import { validateCitations } from "../lib/nemotron";
import { samples } from "../lib/risk";
it("rejects invented citations and accepts references to observed records", () => {
  const h = {
    claim: "Inspect cooling",
    evidenceIds: ["T-104"],
    verificationStep: "Calibrate the sensor",
  };
  expect(validateCitations([h], samples.cooling)).toEqual([h]);
  expect(() =>
    validateCitations([{ ...h, evidenceIds: ["invented"] }], samples.cooling),
  ).toThrow();
  expect(() =>
    validateCitations([{ ...h, evidenceIds: [] }], samples.cooling),
  ).toThrow();
});
