import { createApp } from "./app.ts";
import { loadConfig } from "./config/env.ts";
import { BrudcastClient } from "./services/brudcast/client.ts";

const config = loadConfig();
const client = new BrudcastClient({ apiUrl: config.apiUrl, apiKey: config.apiKey });

createApp({ config, client }).listen(config.port, config.host, () => {
  console.log(`Sample backend listening on http://${config.host}:${config.port}`);
});
