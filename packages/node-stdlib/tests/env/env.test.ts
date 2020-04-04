import { env } from "../../src";

describe("env/env.ts", () => {
  describe("isEnvSet()", () => {
    it("returns true when the env var is set", () => {
      expect(env.isEnvSet("NODE_ENV")).toBe(true);
    });

    it("returns false when the env var is not set", () => {
      expect(env.isEnvSet("NOTAVAR")).toBe(false);
    });
  });

  describe("getEnv()", () => {
    it("returns the env var when it is set", () => {
      expect(env.getEnv("NODE_ENV")).toBe("test");
    });

    it("returns the defaultValue when the env var is not set", () => {
      expect(env.getEnv("NOTAVAR", "nope")).toBe("nope");
      expect(env.getEnv("NOTAVAR")).toBe("");
    });
  });

  describe("setEnv()", () => {
    it("sets the env var to the given value", () => {
      expect(env.isEnvSet("NOT_SET")).toBe(false);
      env.setEnv("NOT_SET", "now it is");
      expect(env.getEnv("NOT_SET")).toBe("now it is");
    });
  });

  describe("unsetEnv()", () => {
    env.setEnv("NOT_SET", "now it is");
    expect(env.getEnv("NOT_SET")).toBe("now it is");
    env.unsetEnv("NOT_SET");
    expect(env.isEnvSet("NOT_SET")).toBe(false);
  });
});
