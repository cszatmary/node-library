import os from "os";
import path from "path";

import { fs } from "../../src";

function createFixture(tmpDir: string): string {
  const rootDir = path.join(tmpDir, `test-${Date.now()}`);
  fs.mkdirSync(rootDir).unwrap();
  fs.writeFileSync(path.join(rootDir, "file1"), "hello").unwrap();
  fs.writeFileSync(path.join(rootDir, "file2"), "world").unwrap();

  const subDir = path.join(rootDir, "subdir");
  fs.mkdirSync(subDir).unwrap();
  fs.writeFileSync(path.join(subDir, "file3"), "foo").unwrap();

  return rootDir;
}

describe("fs/file.ts", () => {
  let tmpDir: string;

  beforeEach(async () => {
    const r = await fs.mkdtemp(`${os.tmpdir}${path.sep}`);
    tmpDir = r.unwrap();
  });

  afterEach(async () => {
    await fs.removeAll(tmpDir);
  });

  describe("fileExists()", () => {
    it("returns false when the path does not exist", async () => {
      const exists = await fs.fileExists(path.join(tmpDir, "foo.ts"));
      expect(exists).toBe(false);
    });

    it("returns true when the path exists", async () => {
      const p = path.join(tmpDir, "foo.ts");
      await fs.writeFile(p, "const n = 1;");
      const exists = await fs.fileExists(p);
      expect(exists).toBe(true);
    });
  });

  describe("fileExistsSync()", () => {
    it("returns false when the path does not exist", () => {
      const exists = fs.fileExistsSync(path.join(tmpDir, "foo.ts"));
      expect(exists).toBe(false);
    });

    it("returns true when the path exists", () => {
      const p = path.join(tmpDir, "foo.ts");
      fs.writeFileSync(p, "const n = 1;");
      const exists = fs.fileExistsSync(p);
      expect(exists).toBe(true);
    });
  });

  describe("remove()", () => {
    it("removes the file", async () => {
      const p = path.join(tmpDir, "foo.ts");
      fs.writeFileSync(p, "const n = 1;").unwrap();
      const r = await fs.remove(p);
      expect(r.isSuccess()).toBe(true);
      expect(fs.fileExistsSync(p)).toBe(false);
    });

    it("removes the empty directory", async () => {
      const p = path.join(tmpDir, "bar");
      fs.mkdirSync(p).unwrap();
      const r = await fs.remove(p);
      expect(r.isSuccess()).toBe(true);
      expect(fs.fileExistsSync(p)).toBe(false);
    });

    it("fails if the directory is not empty", async () => {
      const p = path.join(tmpDir, "bar");
      fs.mkdirSync(p).unwrap();
      const fp = path.join(p, "foo.ts");
      fs.writeFileSync(fp, "const n = 1;").unwrap();
      const r = await fs.remove(p);
      expect(r.isFailure()).toBe(true);
      expect(fs.fileExistsSync(p)).toBe(true);
    });
  });

  describe("removeSync()", () => {
    it("removes the file", () => {
      const p = path.join(tmpDir, "foo.ts");
      fs.writeFileSync(p, "const n = 1;").unwrap();
      const r = fs.removeSync(p);
      expect(r.isSuccess()).toBe(true);
      expect(fs.fileExistsSync(p)).toBe(false);
    });

    it("removes the empty directory", () => {
      const p = path.join(tmpDir, "bar");
      fs.mkdirSync(p).unwrap();
      const r = fs.removeSync(p);
      expect(r.isSuccess()).toBe(true);
      expect(fs.fileExistsSync(p)).toBe(false);
    });

    it("fails if the directory is not empty", () => {
      const p = path.join(tmpDir, "bar");
      fs.mkdirSync(p).unwrap();
      const fp = path.join(p, "foo.ts");
      fs.writeFileSync(fp, "const n = 1;").unwrap();
      const r = fs.removeSync(p);
      expect(r.isFailure()).toBe(true);
      expect(fs.fileExistsSync(p)).toBe(true);
    });
  });

  describe("removeAll()", () => {
    it("deletes files and directories recursively", async () => {
      const p = createFixture(tmpDir);
      const r = await fs.removeAll(p);
      expect(r.isSuccess()).toBe(true);
      expect(fs.fileExistsSync(p)).toBe(false);
    });

    it("does nothing when the file doesn't exist", async () => {
      const p = path.join(tmpDir, "foo");
      const r = await fs.removeAll(p);
      expect(r.isSuccess()).toBe(true);
    });
  });

  describe("removeAllSync()", () => {
    it("deletes files and directories recursively", () => {
      const p = createFixture(tmpDir);
      const r = fs.removeAllSync(p);
      expect(r.isSuccess()).toBe(true);
      expect(fs.fileExistsSync(p)).toBe(false);
    });

    it("does nothing when the file doesn't exist", () => {
      const p = path.join(tmpDir, "foo");
      const r = fs.removeAllSync(p);
      expect(r.isSuccess()).toBe(true);
    });
  });
});
