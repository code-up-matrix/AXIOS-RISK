import { z } from "zod";
import { WorldModel } from "./vendor/meterless/index";
export const Observation = z.object({
  id: z.string().min(1).max(80),
  asset: z.string().regex(/^[A-Z0-9-]{1,40}$/),
  kind: z.enum(["telemetry", "maintenance", "operator"]),
  at: z.string().datetime(),
  metric: z.string().max(60),
  value: z.union([z.number().finite(), z.string().max(500)]),
  unit: z.string().max(20),
  source: z.string().max(160),
});
export type Observation = z.infer<typeof Observation>;
export type Finding = {
  title: string;
  severity: "watch" | "action" | "unknown";
  explanation: string;
  evidence: string[];
  nextStep: string;
};
export const Limits = z.object({
  coolantMax: z.number().finite(),
  oilMin: z.number().finite(),
  moderateLoad: z.number().min(0).max(100),
  source: z.string().min(1),
});
export type Limits = z.infer<typeof Limits>;
export const DEMO_LIMITS: Limits = {
  coolantMax: 100,
  oilMin: 1.5,
  moderateLoad: 75,
  source: "Synthetic demonstration only",
};
export function limitsFor(asset: string): Limits {
  let all;
  try {
    all = JSON.parse(process.env.ASSET_LIMITS_JSON || "{}");
  } catch {
    throw new Error("Invalid ASSET_LIMITS_JSON");
  }
  return Limits.parse(all[asset]);
}
export function diagnose(rows: Observation[], limits: Limits): Finding[] {
  const latest = (metric: string) =>
    rows
      .filter((r) => r.metric === metric)
      .sort((a, b) => b.at.localeCompare(a.at))[0];
  const findings: Finding[] = [];
  const hot = latest("coolant_c"),
    load = latest("load_pct"),
    service = latest("radiator_service"),
    pressure = latest("oil_pressure_bar");
  if (hot && typeof hot.value === "number" && hot.value >= limits.coolantMax) {
    const evidence = [hot.id];
    if (load) evidence.push(load.id);
    if (service) evidence.push(service.id);
    findings.push({
      title:
        load &&
        typeof load.value === "number" &&
        load.value < limits.moderateLoad
          ? "Cooling-path inspection is the first lead"
          : "Elevated coolant temperature",
      severity: "action",
      explanation: `Coolant is ${hot.value} °C.${load ? ` Recorded load is ${load.value}%.` : ""}${service ? ` The maintenance record says “${service.value}”.` : ""} This supports an inspection priority, not a confirmed root cause.`,
      evidence,
      nextStep:
        "A qualified technician should compare calibrated readings and the equipment manual before deciding whether to isolate the asset. Inspect airflow and service records.",
    });
  }
  if (
    pressure &&
    typeof pressure.value === "number" &&
    pressure.value < limits.oilMin
  )
    findings.push({
      title: "Oil-pressure reading needs urgent review",
      severity: "action",
      explanation: `The recorded reading is ${pressure.value} bar. Compare against the configured limit source: ${limits.source}.`,
      evidence: [pressure.id],
      nextStep:
        "Follow the site shutdown procedure and manufacturer limits; do not act on this app alone.",
    });
  const note = latest("operator_status");
  if (
    note &&
    String(note.value).toLowerCase().includes("normal") &&
    hot &&
    Number(hot.value) >= limits.coolantMax
  )
    findings.push({
      title: "Sources disagree",
      severity: "watch",
      explanation:
        "The operator note reports normal operation while the sensor records an elevated temperature. Neither source is silently discarded.",
      evidence: [note.id, hot.id],
      nextStep:
        "Recheck the sensor and ask the operator for a timestamped observation.",
    });
  if (!findings.length)
    findings.push({
      title: "Insufficient evidence for a fault conclusion",
      severity: "unknown",
      explanation:
        "The available records do not establish a fault. Missing measurements and unverified service history remain unknown.",
      evidence: rows.map((r) => r.id),
      nextStep:
        "Collect current temperature, load, oil pressure and service history.",
    });
  return findings;
}
export async function investigate(input: unknown, limits: Limits) {
  const rows = z.array(Observation).min(1).max(200).parse(input);
  if (new Set(rows.map((r) => r.asset)).size !== 1)
    throw Error("Investigate one asset at a time.");
  const wm = new WorldModel({
    namespace: "maintenance",
    storage: "memory",
    conflictPolicy: "source-priority",
    sourcePriority: ["telemetry", "maintenance", "operator"],
  });
  await wm.ingest(
    rows.map((r) => ({
      externalId: r.id,
      type: "evidence",
      title: r.metric,
      text: `${r.value} ${r.unit}`,
      at: r.at,
      source: { kind: r.kind, at: r.at, url: r.source },
      entities: [{ type: "asset", name: r.asset }],
    })),
  );
  const graph = wm.stateShape();
  return {
    asset: rows[0].asset,
    limits,
    findings: diagnose(rows, limits),
    observations: rows,
    graph,
    eventCount: wm.events().length,
    sourceCount: new Set(rows.map((r) => r.kind)).size,
    disclaimer:
      "Decision support only. Synthetic examples use illustrative thresholds; operating decisions require qualified personnel and manufacturer limits.",
  };
}
export const samples: Record<string, Observation[]> = {
  cooling: [
    {
      id: "T-104",
      asset: "GEN-01",
      kind: "telemetry",
      at: "2026-10-26T10:00:00.000Z",
      metric: "coolant_c",
      value: 108,
      unit: "°C",
      source: "fixture:telemetry/T-104",
    },
    {
      id: "T-105",
      asset: "GEN-01",
      kind: "telemetry",
      at: "2026-10-26T10:00:00.000Z",
      metric: "load_pct",
      value: 48,
      unit: "%",
      source: "fixture:telemetry/T-105",
    },
    {
      id: "M-008",
      asset: "GEN-01",
      kind: "maintenance",
      at: "2026-10-25T16:00:00.000Z",
      metric: "radiator_service",
      value: "Airflow inspection overdue; cleaning not recorded",
      unit: "",
      source: "fixture:cmms/M-008",
    },
    {
      id: "O-022",
      asset: "GEN-01",
      kind: "operator",
      at: "2026-10-26T10:02:00.000Z",
      metric: "operator_status",
      value: "Normal operation",
      unit: "",
      source: "fixture:shift-log/O-022",
    },
  ],
  incomplete: [
    {
      id: "O-031",
      asset: "GEN-02",
      kind: "operator",
      at: "2026-10-26T09:00:00.000Z",
      metric: "operator_status",
      value: "Noise reported; instrument readings not recorded",
      unit: "",
      source: "fixture:shift-log/O-031",
    },
  ],
};
