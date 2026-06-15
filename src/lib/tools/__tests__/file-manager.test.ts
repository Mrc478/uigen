import { test, expect, vi, beforeEach } from "vitest";
import { buildFileManagerTool } from "@/lib/tools/file-manager";
import { VirtualFileSystem } from "@/lib/file-system";

const mockVfs = {
  rename: vi.fn(),
  deleteFile: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

const tool = buildFileManagerTool(mockVfs as unknown as VirtualFileSystem);

// rename command

test("rename returns success when VFS rename succeeds", async () => {
  mockVfs.rename.mockReturnValue(true);
  const result = await tool.execute({ command: "rename", path: "/old.jsx", new_path: "/new.jsx" });
  expect(result).toMatchObject({ success: true });
  expect((result as any).message).toContain("/old.jsx");
  expect((result as any).message).toContain("/new.jsx");
});

test("rename calls VFS rename with the correct paths", async () => {
  mockVfs.rename.mockReturnValue(true);
  await tool.execute({ command: "rename", path: "/components/Button.jsx", new_path: "/components/Btn.jsx" });
  expect(mockVfs.rename).toHaveBeenCalledWith("/components/Button.jsx", "/components/Btn.jsx");
});

test("rename returns failure when VFS rename returns false", async () => {
  mockVfs.rename.mockReturnValue(false);
  const result = await tool.execute({ command: "rename", path: "/old.jsx", new_path: "/new.jsx" });
  expect(result).toMatchObject({ success: false });
  expect((result as any).error).toBeDefined();
});

test("rename returns failure without calling VFS when new_path is missing", async () => {
  const result = await tool.execute({ command: "rename", path: "/old.jsx" });
  expect(result).toMatchObject({ success: false, error: "new_path is required for rename command" });
  expect(mockVfs.rename).not.toHaveBeenCalled();
});

test("rename does not call deleteFile", async () => {
  mockVfs.rename.mockReturnValue(true);
  await tool.execute({ command: "rename", path: "/old.jsx", new_path: "/new.jsx" });
  expect(mockVfs.deleteFile).not.toHaveBeenCalled();
});

// delete command

test("delete returns success when VFS deleteFile succeeds", async () => {
  mockVfs.deleteFile.mockReturnValue(true);
  const result = await tool.execute({ command: "delete", path: "/App.jsx" });
  expect(result).toMatchObject({ success: true });
  expect((result as any).message).toContain("/App.jsx");
});

test("delete calls VFS deleteFile with the correct path", async () => {
  mockVfs.deleteFile.mockReturnValue(true);
  await tool.execute({ command: "delete", path: "/src/utils.ts" });
  expect(mockVfs.deleteFile).toHaveBeenCalledWith("/src/utils.ts");
});

test("delete returns failure when VFS deleteFile returns false", async () => {
  mockVfs.deleteFile.mockReturnValue(false);
  const result = await tool.execute({ command: "delete", path: "/nonexistent.jsx" });
  expect(result).toMatchObject({ success: false });
  expect((result as any).error).toBeDefined();
});

test("delete does not call rename", async () => {
  mockVfs.deleteFile.mockReturnValue(true);
  await tool.execute({ command: "delete", path: "/App.jsx" });
  expect(mockVfs.rename).not.toHaveBeenCalled();
});

// error cases

test("unknown command returns failure", async () => {
  const result = await (tool.execute as any)({ command: "unknown", path: "/App.jsx" });
  expect(result).toMatchObject({ success: false });
});
