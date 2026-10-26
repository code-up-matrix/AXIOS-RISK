import { eveChannel } from "eve/channels/eve";
import { localDev, vercelOidc, type AuthFn } from "eve/channels/auth";
import { session, sameOrigin } from "../../lib/security";
import { rateLimit } from "../../lib/db";
const workspace: AuthFn<Request> = async (request) => {
  try {
    const who = session(request);
    if (request.method === "POST") {
      sameOrigin(request);
      await rateLimit("agent:" + who.sub, 10);
    }
    return {
      authenticator: "workspace-cookie",
      principalId: who.sub,
      principalType: "user",
      attributes: { role: who.role },
    };
  } catch {
    return null;
  }
};
export default eveChannel({ auth: [workspace, vercelOidc(), localDev()] });
