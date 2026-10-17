import assert from "node:assert/strict";
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { welcomeMessage } from "../../../src/messages/welcome.message.ts";
import { BrudcastApiError, BrudcastClient } from "../../../src/services/brudcast/client.ts";
import type { InAppMessageRequest } from "../../../src/services/brudcast/types.ts";
import { listen } from "../../helpers/server.ts";

describe("BrudcastClient", () => {
  const message: InAppMessageRequest = {
    applicationId: "a",
    externalId: "u",
    ...welcomeMessage({ name: "u", deepLink: "brudcast-sample://welcome" }),
  };

  let seen: { url?: string; headers: IncomingHttpHeaders; body: unknown } | undefined;
  let reply: { status: number; body: unknown } = { status: 202, body: {} };
  let brudcast: Server;
  let base = "";

  before(async () => {
    brudcast = createServer(async (request, response) => {
      let raw = "";
      for await (const chunk of request) raw += chunk;
      seen = { url: request.url, headers: request.headers, body: JSON.parse(raw) };
      response.writeHead(reply.status, { "Content-Type": "application/json" });
      response.end(JSON.stringify(reply.body));
    });
    base = await listen(brudcast);
  });

  after(() => brudcast.close());

  it("authenticates with the API key and unwraps the envelope", async () => {
    reply = { status: 202, body: { success: true, data: { messageId: "m1" } } };
    const client = new BrudcastClient({ apiUrl: `${base}/api/v1/user`, apiKey: "bk_live_x" });
    assert.deepEqual(await client.sendInAppMessage(message), { messageId: "m1" });
    assert.equal(seen?.url, "/api/v1/user/in-app/messages");
    assert.equal(seen?.headers.authorization, "Bearer bk_live_x");
    assert.deepEqual(seen?.body, message);
  });

  it("throws the API's error body", async () => {
    reply = { status: 403, body: { message: "nope" } };
    const client = new BrudcastClient({ apiUrl: base, apiKey: "k" });
    await assert.rejects(
      client.sendInAppMessage(message),
      (err) => err instanceof BrudcastApiError && err.status === 403 && (err.body as { message: string }).message === "nope",
    );
  });
});
