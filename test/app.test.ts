import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { createApp } from "../src/app.ts";
import { userHash } from "../src/services/identity.service.ts";
import { BrudcastApiError } from "../src/services/brudcast/client.ts";
import type { InAppMessageRequest } from "../src/services/brudcast/types.ts";
import { listen, postJson } from "./helpers/server.ts";

const config = { applicationId: "01a146f6-6a66-7438-a25f-d25a1fbf9eec", identitySecret: "bis_test_secret" };

describe("the app", () => {
  const sent: InAppMessageRequest[] = [];
  let refuse = false;
  let base = "";
  let server: Server;

  before(async () => {
    const client = {
      async sendInAppMessage(message: InAppMessageRequest) {
        if (refuse) throw new BrudcastApiError(422, { message: "Invalid design" });
        sent.push(message);
        return { messageId: "m1" };
      },
    };
    server = createServer(createApp({ config, client }));
    base = await listen(server);
  });

  after(() => server.close());

  const post = (path: string, body: unknown) => postJson(`${base}${path}`, body);

  describe("POST /login", () => {
    it("returns the external id and its hash", async () => {
      const response = await post("/login", { userId: " user-42 ", email: "ada@example.com" });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        externalId: "user-42",
        userHash: userHash("bis_test_secret", "user-42"),
        email: "ada@example.com",
      });
    });

    it("treats a missing or blank email as none", async () => {
      assert.equal(((await (await post("/login", { userId: "user-42" })).json()) as { email: unknown }).email, null);
      assert.equal(((await (await post("/login", { userId: "user-42", email: " " })).json()) as { email: unknown }).email, null);
    });

    it("refuses an invalid user id or email, naming each field", async () => {
      const response = await post("/login", { userId: "x".repeat(192), email: "not-an-email" });
      assert.equal(response.status, 422);
      const fields = ((await response.json()) as { errors: { field: string }[] }).errors.map((error) => error.field);
      assert.deepEqual(fields.sort(), ["email", "userId"]);
      assert.equal((await post("/login", {})).status, 422);
    });
  });

  describe("POST /welcome", () => {
    it("sends the welcome message to the user through Brudcast", async () => {
      const response = await post("/welcome", { externalId: " user-42 " });
      assert.equal(response.status, 202);
      const message = sent.at(-1);
      assert.equal(message?.applicationId, config.applicationId);
      assert.equal(message?.externalId, "user-42");
      assert.equal(message?.design.format, "modal");
      assert.equal(message?.inbox?.addToInbox, true);
    });

    it("refuses a request without an external id", async () => {
      assert.equal((await post("/welcome", {})).status, 422);
    });

    it("passes a Brudcast refusal back as a 502", async () => {
      refuse = true;
      const response = await post("/welcome", { externalId: "user-42" });
      refuse = false;
      assert.equal(response.status, 502);
      assert.deepEqual(((await response.json()) as { brudcast: unknown }).brudcast, { message: "Invalid design" });
    });
  });

  describe("everything else", () => {
    it("answers health checks and unknown routes", async () => {
      assert.equal((await fetch(`${base}/health`)).status, 200);
      assert.equal((await fetch(`${base}/nope`)).status, 404);
    });

    it("refuses a body that is not JSON, too large, or not an object", async () => {
      const malformed = await fetch(`${base}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{not json" });
      assert.equal(malformed.status, 400);
      assert.equal((await post("/login", { userId: "x".repeat(20_000) })).status, 413);
      assert.equal((await post("/login", ["user-42"])).status, 422);
    });
  });
});
