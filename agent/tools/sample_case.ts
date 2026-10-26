import { defineTool } from "eve/tools";
import { z } from "zod";
import { samples, investigate, DEMO_LIMITS } from "../../lib/risk";
export default defineTool({
  description: "Run an explicitly synthetic maintenance example.",
  inputSchema: z.object({ scenario: z.enum(["cooling", "incomplete"]) }),
  async execute({ scenario }) {
    return {
      ...(await investigate(samples[scenario], DEMO_LIMITS)),
      mode: "synthetic sample",
    };
  },
});
