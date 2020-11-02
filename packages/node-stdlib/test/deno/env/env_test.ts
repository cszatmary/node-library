import { testing } from "../deps.ts";
import { env } from "../../../dist/deno/mod.ts";

Deno.test("env.isEnvSet", () => {
  const tests = [
    // var, expected
    ["ISAVAR", true],
    ["NOTAVAR", false],
  ] as const;

  for (const [key, expected] of tests) {
    if (expected) {
      Deno.env.set(key, "true");
    }

    testing.assertEquals(env.isEnvSet(key), expected);

    if (expected) {
      Deno.env.delete(key);
    }
  }
});

Deno.test("env.getEnv", () => {
  const tests = [
    // var, set, default, expected
    ["ISAVAR", true, undefined, "true"],
    ["NOTAVAR", false, undefined, ""],
    ["NOTAVAR", false, "nope", "nope"],
  ] as const;

  for (const [key, set, defaultValue, expected] of tests) {
    if (set) {
      Deno.env.set(key, expected);
    }

    const got = env.getEnv(key, defaultValue);
    testing.assertEquals(got, expected);

    if (set) {
      Deno.env.delete(key);
    }
  }
});

Deno.test("env.setEnv", () => {
  const key = "NOT_SET";
  testing.assertEquals(env.isEnvSet(key), false);

  env.setEnv(key, "now it is");
  testing.assertEquals(env.getEnv(key), "now it is");

  Deno.env.delete(key);
});

Deno.test("env.setEnv", () => {
  const key = "NOT_SET";
  env.setEnv(key, "now it is");
  testing.assertEquals(env.getEnv(key), "now it is");

  env.unsetEnv(key);
  testing.assertEquals(env.isEnvSet(key), false);
});
