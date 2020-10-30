import { inspect } from "util";
import { uuid } from "../../src";

describe("uuid/uuid.ts", () => {
  describe("nil uuid", () => {
    it("treats all nil uuids as equal", () => {
      const nilUUID = uuid.nil;
      const nilInstance = uuid.mustFromString("00000000-0000-0000-0000-000000000000");

      // nil uuid is a singleton and will always be the same instance
      expect(nilUUID).toBe(uuid.nil);
      expect(nilUUID.toString()).toBe("00000000-0000-0000-0000-000000000000");
      expect(nilUUID.equals(nilInstance)).toBe(true);
    });
  });

  describe("fromString()", () => {
    it("creates a UUID from the string", () => {
      const r = uuid.fromString("1d4f6d02-1146-48a8-b0ad-f562220303de");
      expect(r).toBeSuccess();
    });

    test.each([
      ["abcde", "uuid: incorrect UUID length: abcde"],
      [
        "1d4f6d021-146-48a8-b0ad-f562220303de",
        "uuid: incorrect UUID format: 1d4f6d021-146-48a8-b0ad-f562220303de",
      ],
      [
        "1h4f6d02-1146-48a8-b0ad-f562220303de",
        "uuid: invalid character in UUID: 1h4f6d02-1146-48a8-b0ad-f562220303de",
      ],
      [
        "1d4f6d02-1146-78a8-b0ad-f562220303de",
        "uuid: invalid UUID version: 1d4f6d02-1146-78a8-b0ad-f562220303de",
      ],
    ])("fails if the string %s is an invalid uuid", (str, reason) => {
      const r = uuid.fromString(str);
      expect(r.unwrapFailure().error()).toBe(reason);
    });
  });

  describe("mustFromString()", () => {
    it("creates a UUID from the string", () => {
      expect(() => {
        uuid.mustFromString("1d4f6d02-1146-48a8-b0ad-f562220303de");
      }).not.toPanic();
    });

    test.each([
      ["abcde", "uuid: incorrect UUID length: abcde"],
      [
        "1d4f6d021-146-48a8-b0ad-f562220303de",
        "uuid: incorrect UUID format: 1d4f6d021-146-48a8-b0ad-f562220303de",
      ],
      [
        "1h4f6d02-1146-48a8-b0ad-f562220303de",
        "uuid: invalid character in UUID: 1h4f6d02-1146-48a8-b0ad-f562220303de",
      ],
      [
        "1d4f6d02-1146-78a8-b0ad-f562220303de",
        "uuid: invalid UUID version: 1d4f6d02-1146-78a8-b0ad-f562220303de",
      ],
    ])("panics when the string %s is an invalid uuid", (str, reason) => {
      expect(() => {
        uuid.mustFromString(str);
      }).toPanic(reason);
    });
  });

  describe("v4", () => {
    const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    it("creates a valid v4 uuid", () => {
      const u = uuid.newV4();
      expect(u.toString()).toMatch(v4Regex);
      expect(u.version()).toBe(uuid.Version.v4);
      expect(u.variant()).toBe(uuid.Variant.rfc4122);
    });

    it("creates a v4 uuid from the uuid string", () => {
      const uuidString = "1d4f6d02-1146-48a8-b0ad-f562220303de";
      const u = uuid.mustFromString(uuidString);
      expect(u.toString()).toBe(uuidString);
      expect(u.version()).toBe(uuid.Version.v4);
      expect(u.variant()).toBe(uuid.Variant.rfc4122);
    });

    describe("v3 / v5", () => {
      const namespace = uuid.mustFromString("1d4f6d02-1146-48a8-b0ad-f562220303de");

      it("creates a valid v3 uuid", () => {
        const u = uuid.newV3(namespace, "hello");
        expect(u.toString()).toBe("2dcc63e2-4ad4-30e2-98a9-609940113153");
      });

      it("creates a valid v3 uuid", () => {
        const u = uuid.newV5(namespace, "hello");
        expect(u.toString()).toBe("0b6de54f-2342-5355-aa90-44957e68d403");
      });

      it("creates the same uuid for the same namespace and name", () => {
        const uuid1 = uuid.newV5(namespace, "always the same");
        const uuid2 = uuid.newV5(namespace, "always the same");
        expect(uuid1.equals(uuid2)).toBe(true);
      });
    });

    describe("inspect", () => {
      it("returns just the type when depth is zero", () => {
        const uuidString = "1d4f6d02-1146-48a8-b0ad-f562220303de";
        const u = uuid.mustFromString(uuidString);
        const s = inspect(u, { depth: -1 });
        expect(s).toBe("UUID {}");
      });

      it("returns a string representation of the UUID", () => {
        const uuidString = "1d4f6d02-1146-48a8-b0ad-f562220303de";
        const u = uuid.mustFromString(uuidString);
        const s = inspect(u);
        expect(s).toBe("UUID { 1d4f6d02-1146-48a8-b0ad-f562220303de }");
      });
    });
  });
});
