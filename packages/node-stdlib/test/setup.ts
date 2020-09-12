declare global {
  // eslint-disable-next-line
  namespace jest {
    interface Matchers<R> {
      toPanic(msg?: string): R;
    }
  }
}

expect.extend({
  // eslint-disable-next-line @typescript-eslint/ban-types
  toPanic(received: Function, expected: unknown): jest.CustomMatcherResult {
    const {
      matcherErrorMessage,
      matcherHint,
      printExpected,
      printReceived,
      printWithType,
    } = this.utils;

    // Make sure expected is a string if it is present
    if (expected !== undefined && typeof expected !== "string") {
      throw new Error(
        matcherErrorMessage(
          matcherHint("toPanic"),
          `${this.utils.EXPECTED_COLOR("expected")} value must be a string`,
          printWithType("Expected", expected, printExpected),
        ),
      );
    }

    let thrown: Error | undefined;

    if (this.promise && received instanceof Error) {
      thrown = received;
    } else if (typeof received !== "function") {
      throw new Error(
        matcherErrorMessage(
          matcherHint("toPanic"),
          `${this.utils.RECEIVED_COLOR("received")} value must be a function`,
          printWithType("Received", received, printReceived),
        ),
      );
    } else {
      try {
        received();
      } catch (e) {
        thrown = e;
      }
    }

    if (!thrown || !(thrown instanceof Error) || thrown.name !== "panic") {
      return {
        pass: false,
        message: (): string => `${matcherHint(".toPanic")}

Expected received function to panic`,
      };
    }

    if (expected === undefined) {
      return {
        pass: true,
        message: (): string => `${matcherHint(".not.toPanic")}

Expected received function to not panic`,
      };
    }

    const { message } = thrown;
    const pass = expected === message;

    return {
      pass,
      message: (): string => `${matcherHint(".toPanic")}

Expected to panic with message:${pass ? " not" : ""}
  ${printExpected(expected)}

Received
  ${printReceived(message)}`,
    };
  },
});

export {};
