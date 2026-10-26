import { it, expect } from "vitest";
import { POST } from "../app/api/investigate/route";
function request(body: unknown, origin = "https://app.test") {
  return new Request("https://app.test/api/investigate", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
it("runs the full synthetic API path without database or model credentials", async () => {
  const response = await POST(request({ mode: "sample", scenario: "cooling" }));
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.mode).toBe("sample");
  expect(data.persisted).toBe(false);
  expect(data.findings.length).toBeGreaterThan(0);
});
it("rejects connected work without a session and cross-site requests", async () => {
  expect(
    (await POST(request({ mode: "connected", asset: "GEN-01" }))).status,
  ).toBe(401);
  expect(
    (
      await POST(
        request({ mode: "sample", scenario: "cooling" }, "https://other.test"),
      )
    ).status,
  ).toBe(403);
});
