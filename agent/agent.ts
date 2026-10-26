import { defineAgent } from "eve";
export default defineAgent({
  defaultTools: false,
  model: "openai/gpt-6-luna-fast",
  reasoning: "high",
  limits: {
    sessionUsage: ({ window }) =>
      window.inputTokens - window.cacheReadTokens >= 80000 ||
      window.outputTokens >= 8000 ||
      (window.costUsd ?? 0) >= 1,
    sessionTimeoutMs: 86400000,
  },
});
