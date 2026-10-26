# AXIOS Risk

An evidence-backed maintenance investigator for teams handling telemetry, maintenance records and shift notes.

**Target:** Open Agent Hackathon, Track 02: The Agent That Can Explain Why.

**Status:** implemented and locally tested. Vercel team authorization and live backend/provider setup remain required. No production deployment or competition submission is claimed.

Repository: https://github.com/code-up-matrix/AXIOS-RISK

## Run and verify

Requires Node 24. Install with `npm ci`, then run `npm run check`. These checks do not require live credentials. See `.env.example` for configuration names.

Before connected development, link the correct Vercel project, attach its database and pull its environment. Run `npm run db:migrate`, then `npm run dev`. Open the workspace and use `/access` for connected operations. Public sample behavior is explicitly labeled.

## Product and integration

The sample path builds a Meterless graph from synthetic records, reports a source conflict and exports evidence. Connected work reads a qualified Zetaris SQL view, applies reviewed per-asset limits, obtains cited NVIDIA Nemotron hypotheses through AI Gateway, and stores the report in Postgres. An eve agent provides a conversational investigation interface. Optional default shell/file tools are disabled.

Required Zetaris view columns: `id, asset, kind, at, metric, value, unit, source`. `kind` is telemetry, maintenance or operator. Configure `ZETARIS_EVIDENCE_VIEW` as `schema.table`. Query input is a restricted asset identifier, never arbitrary model SQL. Configure `ASSET_LIMITS_JSON` as an object keyed by asset with `coolantMax`, `oilMin`, `moderateLoad` and a documented `source`. Do not copy synthetic limits to real equipment.

Live proof still needed: actual Zetaris query, configured equipment limits, NVIDIA model response, saved report, and a browser recording. The runtime model catalog listed `nvidia/nemotron-3.5-lightning` on the research date; no successful model request is claimed yet. Meterless upstream code and conformance tests retain attribution in THIRD_PARTY.md. Operational decisions require a qualified technician.

## Evidence and handoff

- [Deployment and operations](docs/DEPLOYMENT.md)
- [Hackathon fit and submission checklist](docs/HACKATHON.md)
- [Demo recording script](docs/DEMO.md)
- [Research and event links](docs/RESEARCH.md)
- [Verification record](docs/VERIFICATION.md)

New application code is MIT licensed. AI-assisted implementation with Codex is disclosed. Third-party dependencies remain under their own licenses. Review and understand the code before submission; eligibility and awards are the organizer's decision.
