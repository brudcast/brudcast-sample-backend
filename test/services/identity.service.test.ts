import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { userHash } from "../../src/services/identity.service.ts";

describe("userHash", () => {
  it("matches the HMAC the delivery service checks", () => {
    const expected = createHmac("sha256", "bis_test_secret").update("user-42").digest("hex");
    assert.equal(userHash("bis_test_secret", "user-42"), expected);
    assert.match(userHash("bis_test_secret", "user-42"), /^[0-9a-f]{64}$/);
  });
});
