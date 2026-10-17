import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { welcomeMessage } from "../../src/messages/welcome.message.ts";

describe("welcomeMessage", () => {
  const { design, inbox } = welcomeMessage({ name: "ada", deepLink: "brudcast-sample://welcome" });

  it("greets the user by name in the modal and the inbox", () => {
    assert.equal(design.format, "modal");
    assert.deepEqual(design.blocks[0], {
      id: "title",
      type: "text",
      role: "title",
      text: "Welcome, ada",
      style: { size: null, weight: "bold", align: "center", color: null, darkColor: null },
    });
    assert.equal(inbox.title, "Welcome, ada");
    assert.equal(inbox.addToInbox, true);
  });

  it("opens the deep link from its main button and closes from the other", () => {
    const actions = design.blocks.flatMap((block) => (block.type === "button" ? [[block.id, block.action.type, block.action.value]] : []));
    assert.deepEqual(actions, [
      ["start", "deeplink", "brudcast-sample://welcome"],
      ["later", "dismiss", null],
    ]);
  });
});
