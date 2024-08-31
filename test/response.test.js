// @ts-check

import { test, suite } from "node:test";

import {
  createAckEvent,
  createConfirmationEvent,
  createDoneEvent,
  createErrorsEvent,
  createReferencesEvent,
  createTextEvent,
} from "../index.js";

suite("response", () => {
  test("smoke", (t) => {
    t.assert.equal(typeof createAckEvent, "function");
  });

  test("createAckEvent()", (t) => {
    const event = createAckEvent();
    t.assert.equal(undefined, event.event);
    t.assert.snapshot(event.data);
    t.assert.snapshot(event.toString());
  });

  test("createDoneEvent()", (t) => {
    const event = createDoneEvent();
    t.assert.equal(undefined, event.event);
    t.assert.snapshot(event.data);
    t.assert.snapshot(event.toString());
  });

  test("createConfirmationEvent()", (t) => {
    const event = createConfirmationEvent({
      id: "123",
      title: "title",
      message: "message",
      metadata: { foo: "bar" },
    });
    t.assert.equal("copilot_confirmation", event.event);
    t.assert.snapshot(event.data);
    t.assert.snapshot(event.toString());
  });

  test("createErrorsEvent()", (t) => {
    const referenceError = {
      type: "reference",
      code: "1",
      message: "test reference error",
      identifier: "reference-identifier",
    };
    const functionError = {
      type: "function",
      code: "1",
      message: "test function error",
      identifier: "function-identifier",
    };
    const agentError = {
      type: "agent",
      code: "1",
      message: "test agent error",
      identifier: "agent-identifier",
    };
    const event = createErrorsEvent([
      referenceError,
      functionError,
      agentError,
    ]);
    t.assert.equal("copilot_errors", event.event);
    t.assert.snapshot(event.data);
    t.assert.snapshot(event.toString());
  });

  test("createReferencesEvent()", (t) => {
    const event = createReferencesEvent([
      {
        type: "test.story",
        id: "test",
        data: {
          file: "test.js",
          start: "1",
          end: "42",
          content: "function test() {...}",
        },
        is_implicit: false,
        metadata: {
          display_name: "Lines 1-42 from test.js",
          display_icon: "test-icon",
          display_url:
            "http://github.com/monalisa/hello-world/blob/main/test.js#L1-L42",
        },
      },
    ]);

    t.assert.equal("copilot_references", event.event);
    t.assert.snapshot(event.data);
    t.assert.snapshot(event.toString());
  });
});
