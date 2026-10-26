import { json } from "@/lib/security";
import config from "@/project.json";
export async function GET() {
  const missing = config.requiredEnv.filter((name) => !process.env[name]);
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN)
    missing.push("AI_GATEWAY_AUTH");
  return json({
    application: config.name,
    status: missing.length
      ? "configuration_required"
      : "configured_not_live_verified",
    missing,
    mode: missing.length ? "configuration_required" : "connected",
    version: "0.1.0",
  });
}
