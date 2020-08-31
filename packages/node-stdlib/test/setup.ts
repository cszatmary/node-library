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
    let thrown: Error | undefined;

    if (this.promise && received instanceof Error) {
      thrown = received;
    } else if (typeof received !== "function") {
      throw new Error("toPanic: received value must be a function");
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
        message: (): string => "expected function to panic",
      };
    }

    if (expected === undefined) {
      return {
        pass: true,
        message: (): string => "expected function to not panic",
      };
    }

    if (typeof expected !== "string") {
      throw new Error("expected value must be a string");
    }

    return {
      pass: expected === thrown.message,
      message: (): string => `expected function to panic with message ${expected}`,
    };
  },
});

export {};
