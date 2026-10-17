/**
 * The backend's settings.
 */
export interface Config {
  port: number;
  host: string;
  apiUrl: string;
  apiKey: string;
  applicationId: string;
  identitySecret: string;
}

const REQUIRED = ["BRUDCAST_API_URL", "BRUDCAST_API_KEY", "BRUDCAST_APPLICATION_ID", "BRUDCAST_IDENTITY_SECRET"] as const;

/**
 * Read the backend's settings from the environment.
 *
 * @param env - The environment, `process.env` by default
 * @returns The settings
 * @throws {Error} When a required setting is missing
 */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const missing = REQUIRED.filter((name) => !env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(`Set ${missing.join(", ")} in .env; see .env.example`);
  }

  const setting = (name: (typeof REQUIRED)[number]): string => (env[name] ?? "").trim();

  return {
    port: Number(env.PORT ?? 4000),
    host: env.HOST ?? "0.0.0.0",
    apiUrl: setting("BRUDCAST_API_URL").replace(/\/+$/, ""),
    apiKey: setting("BRUDCAST_API_KEY"),
    applicationId: setting("BRUDCAST_APPLICATION_ID"),
    identitySecret: setting("BRUDCAST_IDENTITY_SECRET"),
  };
}
