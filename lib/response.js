// @ts-check

/** @type {import('..').CreateAckEventInterface} */
export function createAckEvent() {
  const data = {
    choices: [
      {
        delta: { content: ``, role: "assistant" },
      },
    ],
  };
  return `data: ${JSON.stringify(data)}\n\n`;
}

/** @type {import('..').CreateTextEventInterface} */
export function createTextEvent(message) {
  const data = {
    choices: [
      {
        delta: { content: message, role: "assistant" },
      },
    ],
  };
  return `data: ${JSON.stringify(data)}\n\n`;
}

/** @type {import('..').CreateConfirmationEventInterface} */
export function createConfirmationEvent({ id, title, message, metadata }) {
  const event = "copilot_confirmation";
  const data = {
    type: "action",
    title,
    message,
    confirmation: { id, ...metadata },
  };
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** @type {import('..').CreateReferencesEventInterface} */
export function createReferencesEvent(references) {
  const event = "copilot_references";
  const data = references;
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** @type {import('..').CreateErrorsEventInterface} */
export function createErrorsEvent(errors) {
  const event = "copilot_errors";
  const data = errors;
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** @type {import('..').CreateDoneEventInterface} */
export function createDoneEvent() {
  const data = {
    choices: [
      {
        finish_reason: "stop",
        delta: { content: null },
      },
    ],
  };
  return `data: ${JSON.stringify(data)}\n\ndata: [DONE]\n\n`;
}
