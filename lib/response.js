// @ts-check

/** @type {import('..').CreateAckEventInterface} */
export function createAckEvent() {
  return {
    data: {
      choices: [
        {
          delta: { content: ``, role: "assistant" },
        },
      ],
    },
    toString() {
      return `data: ${JSON.stringify(this.data)}\n\n`;
    },
  };
}

/** @type {import('..').CreateTextEventInterface} */
export function createTextEvent(message) {
  return {
    data: {
      choices: [
        {
          delta: { content: message, role: "assistant" },
        },
      ],
    },
    toString() {
      return `data: ${JSON.stringify(this.data)}\n\n`;
    },
  };
}

/** @type {import('..').CreateConfirmationEventInterface} */
export function createConfirmationEvent({ id, title, message, metadata }) {
  return {
    event: "copilot_confirmation",
    data: {
      type: "action",
      title,
      message,
      confirmation: { id, ...metadata },
    },
    toString() {
      return `event: ${this.event}\ndata: ${JSON.stringify(this.data)}\n\n`;
    },
  };
}

/** @type {import('..').CreateReferencesEventInterface} */
export function createReferencesEvent(references) {
  return {
    event: "copilot_references",
    data: references,
    toString() {
      return `event: ${this.event}\ndata: ${JSON.stringify(this.data)}\n\n`;
    },
  };
}

/** @type {import('..').CreateErrorsEventInterface} */
export function createErrorsEvent(errors) {
  return {
    event: "copilot_errors",
    data: errors,
    toString() {
      return `event: ${this.event}\ndata: ${JSON.stringify(this.data)}\n\n`;
    },
  };
}

/** @type {import('..').CreateDoneEventInterface} */
export function createDoneEvent() {
  return {
    data: {
      choices: [
        {
          finish_reason: "stop",
          delta: { content: null },
        },
      ],
    },
    toString() {
      return `data: ${JSON.stringify(this.data)}\n\ndata: [DONE]\n\n`;
    },
  };
}
