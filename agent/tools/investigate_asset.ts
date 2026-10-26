import { defineTool } from "eve/tools";
import { z } from "zod";
import { readAsset } from "../../lib/zetaris";
import { investigate, limitsFor } from "../../lib/risk";
import { explain } from "../../lib/nemotron";
export default defineTool({
  description:
    "Read an asset through Zetaris, build a Meterless evidence graph and request a cited NVIDIA Nemotron analysis. No equipment controls.",
  inputSchema: z.object({ asset: z.string().regex(/^[A-Z0-9-]{1,40}$/) }),
  async execute({ asset }) {
    const data = await readAsset(asset);
    const limits = limitsFor(asset);
    return {
      ...(await investigate(data.rows, limits)),
      ...(await explain(data.rows, limits)),
      sql: data.sql,
      mode: "connected",
    };
  },
});
