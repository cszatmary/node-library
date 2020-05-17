import { inspect } from "util";
import { core } from "../../src";

describe("core/uuid.ts", () => {
  describe("nil uuid", () => {
    it("treats all nil uuids as equal", () => {
      const nilUUID = core.UUID.nil;
      const nilInstance = core.UUID.fromString("00000000-0000-0000-0000-000000000000");

      // nil uuid is a singleton and will always be the same instance
      expect(nilUUID).toBe(core.UUID.nil);
      expect(nilUUID.toString()).toBe("00000000-0000-0000-0000-000000000000");
      expect(nilUUID.equals(nilInstance!)).toBe(true);
    });
  });

  describe("fromString()", () => {
    it("returns undefined when the string is an invalid uuid", () => {
      expect(core.UUID.fromString("abcde")).toBeUndefined();
      expect(core.UUID.fromString("1h4f6d02-1146-48a8-b0ad-f562220303de")).toBeUndefined();
    });

    it("returns undefined if the uuid has an invalid version", () => {
      expect(core.UUID.fromString("1d4f6d02-1146-78a8-b0ad-f562220303de")).toBeUndefined();
    });
  });

  describe("v4", () => {
    const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    it("creates a valid v4 uuid", () => {
      const uuid = core.UUID.v4();
      expect(uuid.toString()).toMatch(v4Regex);
      expect(uuid.version()).toBe(core.UUIDVersion.v4);
      expect(uuid.variant()).toBe(core.UUIDVariant.rfc4122);
    });

    it("creates a v4 uuid from the uuid string", () => {
      const uuidString = "1d4f6d02-1146-48a8-b0ad-f562220303de";
      const uuid = core.UUID.fromString(uuidString);
      expect(uuid?.toString()).toBe(uuidString);
      expect(uuid?.version()).toBe(core.UUIDVersion.v4);
      expect(uuid?.variant()).toBe(core.UUIDVariant.rfc4122);
    });

    describe("v3 / v5", () => {
      const namespace = core.UUID.fromString("1d4f6d02-1146-48a8-b0ad-f562220303de")!;

      it("creates a valid v3 uuid", () => {
        const uuid = core.UUID.v3(namespace, "hello");
        expect(uuid.toString()).toBe("2dcc63e2-4ad4-30e2-98a9-609940113153");
      });

      it("creates a valid v3 uuid", () => {
        const uuid = core.UUID.v5(namespace, "hello");
        expect(uuid.toString()).toBe("0b6de54f-2342-5355-aa90-44957e68d403");
      });

      it("creates the same uuid for the same namespace and name", () => {
        const uuid1 = core.UUID.v5(namespace, "always the same");
        const uuid2 = core.UUID.v5(namespace, "always the same");
        expect(uuid1.equals(uuid2)).toBe(true);
      });
    });

    describe("inspect", () => {
      it("returns just the type when depth is zero", () => {
        const uuidString = "1d4f6d02-1146-48a8-b0ad-f562220303de";
        const uuid = core.UUID.fromString(uuidString)!;
        const s = inspect(uuid, { depth: -1 });
        expect(s).toBe("UUID {}");
      });

      it("returns a string representation of the box", () => {
        const uuidString = "1d4f6d02-1146-48a8-b0ad-f562220303de";
        const uuid = core.UUID.fromString(uuidString)!;
        const s = inspect(uuid);
        expect(s).toBe("UUID { 1d4f6d02-1146-48a8-b0ad-f562220303de }");
      });
    });
  });
});
