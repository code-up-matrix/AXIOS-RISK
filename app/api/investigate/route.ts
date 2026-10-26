import { z } from "zod";
import { handle, body, sameOrigin, session, json } from "@/lib/security";
import { rateLimit, saveReport } from "@/lib/db";
import { investigate, samples, DEMO_LIMITS, limitsFor } from "@/lib/risk";
import { readAsset } from "@/lib/zetaris";
import { explain } from "@/lib/nemotron";
export const maxDuration = 90;
export async function POST(request: Request) {
  return handle(async () => {
    sameOrigin(request);
    const input = await body(
      request,
      z.discriminatedUnion("mode", [
        z.object({
          mode: z.literal("sample"),
          scenario: z.enum(["cooling", "incomplete"]),
        }),
        z.object({
          mode: z.literal("connected"),
          asset: z.string().regex(/^[A-Z0-9-]{1,40}$/),
        }),
      ]),
    );
    if (input.mode === "sample")
      return json({
        ...(await investigate(samples[input.scenario], DEMO_LIMITS)),
        mode: "sample",
        persisted: false,
      });
    const who = session(request);
    await rateLimit("investigate:" + who.sub, 10);
    const data = await readAsset(input.asset);
    const limits = limitsFor(input.asset);
    const report = {
      ...(await investigate(data.rows, limits)),
      ...(await explain(data.rows, limits)),
      sql: data.sql,
      mode: "connected",
    };
    const saved = await saveReport(who.sub, "investigation", report);
    return json({ ...report, id: saved.id, persisted: true });
  });
}
