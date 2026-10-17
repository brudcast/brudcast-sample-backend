import type { Config } from "./config/env.ts";
import type { BrudcastClient } from "./services/brudcast/client.ts";

/**
 * What the app's controllers need: the settings and a Brudcast API client.
 */
export interface AppDeps {
  config: Pick<Config, "applicationId" | "identitySecret">;
  client: Pick<BrudcastClient, "sendInAppMessage">;
}
