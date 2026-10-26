"use client";
import { useState } from "react";
import { Workspace, Download, post } from "@/components/workspace";
import type { Finding, Observation } from "@/lib/risk";
type Report = {
  asset: string;
  findings: Finding[];
  observations: Observation[];
  sourceCount: number;
  eventCount: number;
  mode: string;
  persisted: boolean;
  model?: string;
  hypotheses?: {
    claim: string;
    evidenceIds: string[];
    verificationStep: string;
  }[];
};
export default function Page() {
  const [scenario, setScenario] = useState("cooling");
  const [asset, setAsset] = useState("GEN-01");
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(mode: string) {
    setBusy(true);
    setError("");
    try {
      setReport(
        await post(
          "/api/investigate",
          mode === "sample" ? { mode, scenario } : { mode, asset },
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Investigation failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace name="AXIOS / RISK" tag="MAINTENANCE INTELLIGENCE">
      <section className="hero">
        <div>
          <span className="eyebrow">THE AGENT THAT CAN EXPLAIN WHY</span>
          <h1>
            Find the cause.
            <br />
            <em>Keep the evidence.</em>
          </h1>
          <p>
            Bring sensor readings, maintenance history and shift notes into one
            investigation. See what agrees, what conflicts, and what to check
            next.
          </p>
        </div>
        <div className="hero-symbol">
          01
          <span>
            OBSERVE
            <br />
            CONNECT
            <br />
            EXPLAIN
          </span>
        </div>
      </section>
      <div className="workspace-grid">
        <aside className="panel">
          <div className="panel-title">
            <span>Start an investigation</span>
            <span className="number">01</span>
          </div>
          <label>
            Sample case
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            >
              <option value="cooling">
                Generator overheating · conflicting notes
              </option>
              <option value="incomplete">
                Noise report · missing telemetry
              </option>
            </select>
          </label>
          <p className="caption">Synthetic records. No live equipment data.</p>
          <button onClick={() => run("sample")} disabled={busy}>
            {busy ? "Investigating…" : "Investigate sample →"}
          </button>
          <div className="divider" />
          <label>
            Connected asset
            <input
              value={asset}
              onChange={(e) => setAsset(e.target.value.toUpperCase())}
              maxLength={40}
            />
          </label>
          <button
            className="secondary"
            onClick={() => run("connected")}
            disabled={busy}
          >
            Investigate with Zetaris
          </button>
          <p className="caption">
            Workspace access and a configured data source are required.
          </p>
          <p role="alert" className="error">
            {error}
          </p>
          <div className="mini-list">
            <div>
              <b>Zetaris</b>
              <span>Federated source queries</span>
            </div>
            <div>
              <b>Meterless</b>
              <span>Evidence graph and provenance</span>
            </div>
            <div>
              <b>eve</b>
              <span>Durable AI investigation</span>
            </div>
          </div>
        </aside>
        <section>
          <div className="metrics">
            <div>
              <span>Evidence sources</span>
              <strong>{report?.sourceCount ?? "—"}</strong>
            </div>
            <div>
              <span>Graph events</span>
              <strong>{report?.eventCount ?? "—"}</strong>
            </div>
            <div>
              <span>Data mode</span>
              <strong className="metric-word">{report?.mode ?? "Ready"}</strong>
            </div>
          </div>
          {report ? (
            <>
              <div className="section-title">
                <h2>{report.asset} / Findings</h2>
                <Download data={report} name="axios-risk-evidence.json" />
              </div>
              {report.findings.map((f, i) => (
                <article className="panel finding" key={f.title}>
                  <div className="finding-heading">
                    <span className={"status " + f.severity}>
                      {f.severity === "action"
                        ? "Review required"
                        : f.severity === "unknown"
                          ? "Unresolved"
                          : "Conflict"}
                    </span>
                    <span className="number">0{i + 1}</span>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.explanation}</p>
                  <div className="evidence-tags">
                    {f.evidence.map((id) => (
                      <a key={id} href={"#" + id}>
                        {id} ↗
                      </a>
                    ))}
                  </div>
                  <div className="next-step">
                    <b>Next check</b>
                    <p>{f.nextStep}</p>
                  </div>
                </article>
              ))}
              <>
                {report.hypotheses?.map((h, i) => (
                  <article className="panel finding" key={i}>
                    <span className="eyebrow">
                      NVIDIA NEMOTRON · HYPOTHESIS
                    </span>
                    <h3>{h.claim}</h3>
                    <div className="evidence-tags">
                      {h.evidenceIds.map((id) => (
                        <a key={id} href={"#" + id}>
                          {id}
                        </a>
                      ))}
                    </div>
                    <p>{h.verificationStep}</p>
                  </article>
                ))}
              </>
              <div className="section-title">
                <h2>Source records</h2>
                <span className="caption">Every conclusion is traceable</span>
              </div>
              <div className="panel table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Record</th>
                      <th>Source</th>
                      <th>Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.observations.map((o) => (
                      <tr id={o.id} key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.kind}</td>
                        <td>
                          <b>{o.metric}</b>
                          <br />
                          {String(o.value)} {o.unit}
                          <br />
                          <small>{o.at}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="panel empty">
              <span className="empty-mark">⌁</span>
              <h2>
                A conclusion is only as good
                <br />
                as the evidence behind it.
              </h2>
              <p>
                Run the sample to inspect an overheating alert, an overdue
                service record and a conflicting operator note.
              </p>
              <div className="flow-labels">
                <span>Signals</span>
                <span>→</span>
                <span>Evidence</span>
                <span>→</span>
                <span>Next check</span>
              </div>
            </div>
          )}
          <p className="caption legal">
            Decision support only. Operating decisions require a qualified
            technician, manufacturer limits and site procedures.
          </p>
        </section>
      </div>
    </Workspace>
  );
}
