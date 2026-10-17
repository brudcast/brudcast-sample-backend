import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadConfig } from "../../src/config/env.ts";

describe("loadConfig", () => {
  it("names every missing setting", () => {
    assert.throws(() => loadConfig({}), /BRUDCAST_API_URL, BRUDCAST_API_KEY, BRUDCAST_APPLICATION_ID, BRUDCAST_IDENTITY_SECRET/);
  });

  it("trims the trailing slash of the API URL and defaults the port", () => {
    const loaded = loadConfig({
      BRUDCAST_API_URL: "http://localhost:8086/api/v1/user/",
      BRUDCAST_API_KEY: "bk_live_x",
      BRUDCAST_APPLICATION_ID: "app",
      BRUDCAST_IDENTITY_SECRET: "bis_x",
    });
    assert.equal(loaded.apiUrl, "http://localhost:8086/api/v1/user");
    assert.equal(loaded.port, 4000);
    assert.equal(loaded.host, "0.0.0.0");
  });
});
