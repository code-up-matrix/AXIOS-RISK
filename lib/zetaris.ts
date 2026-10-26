import { randomUUID } from "node:crypto";
import { z } from "zod";
import { required, AppError } from "./security";
import { Observation } from "./risk";
export async function readAsset(asset: string) {
  if (!/^[A-Z0-9-]{1,40}$/.test(asset))
    throw new AppError(400, "Invalid asset identifier.");
  const base = new URL(required("ZETARIS_REST_URL"));
  if (
    base.protocol !== "https:" &&
    !(process.env.NODE_ENV !== "production" && base.hostname === "localhost")
  )
    throw new AppError(503, "Zetaris must use HTTPS.");
  const table = process.env.ZETARIS_EVIDENCE_VIEW || "maintenance.evidence";
  if (!/^[a-zA-Z_][\w]*\.[a-zA-Z_][\w]*$/.test(table))
    throw new AppError(503, "Invalid Zetaris view configuration.");
  // Asset grammar excludes quotes; table is operator-configured and strictly validated. No user-supplied SQL.
  const sql = `SELECT id, asset, kind, at, metric, value, unit, source FROM ${table} WHERE asset = '${asset}' ORDER BY at DESC LIMIT 200`;
  const r = await fetch(base.href.replace(/\/$/, "") + "/sql-editor/sqls/run", {
    method: "POST",
    redirect: "error",
    headers: {
      Authorization: `Bearer ${required("ZETARIS_API_KEY")}`,
      "X-Org-ID": required("ZETARIS_ORG_ID"),
      "X-Request-ID": randomUUID(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      queryId: randomUUID(),
      sql,
      source: "SqlEditor",
      limit: 200,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new AppError(502, `Zetaris query failed (${r.status}).`);
  const data = await r.json();
  if (!Array.isArray(data.data))
    throw new AppError(502, "Unexpected Zetaris response.");
  const keys = [
    "id",
    "asset",
    "kind",
    "at",
    "metric",
    "value",
    "unit",
    "source",
  ];
  const rows = data.data.map((row: unknown) =>
    Array.isArray(row)
      ? Object.fromEntries(keys.map((k, i) => [k, row[i]]))
      : row,
  );
  for (const row of rows) {
    if (
      ["coolant_c", "load_pct", "oil_pressure_bar"].includes(row.metric) &&
      typeof row.value === "string" &&
      row.value.trim() !== ""
    )
      row.value = Number(row.value);
    if (typeof row.at === "string" && !row.at.endsWith("Z"))
      row.at = new Date(row.at).toISOString();
  }
  const parsed = z.array(Observation).max(200).safeParse(rows);
  if (!parsed.success)
    throw new AppError(502, "Zetaris rows do not match the evidence schema.");
  if (!parsed.data.length)
    throw new AppError(404, "No records found for that asset.");
  return { rows: parsed.data, sql };
}
