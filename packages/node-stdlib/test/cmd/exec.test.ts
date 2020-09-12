import { cmd } from "../../src";

describe("cmd/exec.ts", () => {
  describe("exec()", () => {
    it("executes the command asynchronously", async () => {
      const r = await cmd.exec("echo", ["hello"]);
      const res = r.unwrap();

      expect(res.status).toBe(0);
      expect(res.stdout?.toString()).toBe("hello\n");
      expect(res.stderr?.length).toBe(0);
    });
  });

  describe("execSync()", () => {
    it("executes the command synchronously", () => {
      const r = cmd.execSync("echo", ["hello"]);
      const res = r.unwrap();

      expect(res.status).toBe(0);
      expect(res.stdout?.toString()).toBe("hello\n");
      expect(res.stderr?.length).toBe(0);
    });
  });
});
