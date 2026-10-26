# AXIOS Risk pitch outline

1. **Maintenance investigations** — Target users are maintenance coordinators who reconcile telemetry with service records and shift notes. The hypothesis is that traceable evidence reduces time spent reconciling conflicting reports. No measured time saving is claimed.
2. **A conflicting generator report** — Synthetic coolant reading: 108 °C. Synthetic load: 48%. An operator note says normal. The product preserves the disagreement and requests verification.
3. **Investigation workflow** — Zetaris queries the federated evidence view. Meterless retains provenance in an evidence graph. NVIDIA Nemotron proposes cited hypotheses. The UI pairs each claim with its source and a verification step.
4. **Technical implementation** — Next.js on Vercel, server functions, Neon Postgres, an eve agent, signed sessions and bounded tool access. Stored raw observations allow graph reconstruction rather than relying on serverless memory.
5. **Product demonstration** — Insert screenshots from the deployed sample and connected investigation. Show an unresolved case as well as a useful lead. Live screenshots and a finished slide deck remain pending deployment.
6. **Validation and next steps** — Local evidence and conformance tests passed. Complete sponsor connectivity, operator review of asset limits and a supervised pilot. Add equipment-specific evidence rules and evaluate against labeled maintenance cases before operational use.

Development disclosure: Codex assisted implementation. Cursor was not used. Sponsor calls require live verification before claiming a completed integration. Use this outline to produce the event's final visual slide deck after the deployment screenshots exist.
