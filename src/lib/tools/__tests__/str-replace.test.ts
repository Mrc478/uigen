import { test, expect, vi, beforeEach } from "vitest";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";
import { VirtualFileSystem } from "@/lib/file-system";

const mockVfs = {
  viewFile: vi.fn(),
  createFileWithParents: vi.fn(),
  replaceInFile: vi.fn(),
  insertInFile: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

const tool = buildStrReplaceTool(mockVfs as unknown as VirtualFileSystem);

// Tool shape

test("tool has id str_replace_editor", () => {
  expect(tool.id).toBe("str_replace_editor");
});

test("tool exposes an execute function", () => {
  expect(typeof tool.execute).toBe("function");
});

// view command

test("view calls viewFile with path and no range when view_range is omitted", async () => {
  mockVfs.viewFile.mockReturnValue("1\tline one");
  const result = await tool.execute({ command: "view", path: "/App.jsx" });
  expect(mockVfs.viewFile).toHaveBeenCalledWith("/App.jsx", undefined);
  expect(result).toBe("1\tline one");
});

test("view passes view_range to viewFile", async () => {
  mockVfs.viewFile.mockReturnValue("2\tline2\n3\tline3");
  await tool.execute({ command: "view", path: "/App.jsx", view_range: [2, 3] });
  expect(mockVfs.viewFile).toHaveBeenCalledWith("/App.jsx", [2, 3]);
});

test("view returns the viewFile result unchanged", async () => {
  mockVfs.viewFile.mockReturnValue("File not found: /missing.jsx");
  const result = await tool.execute({ command: "view", path: "/missing.jsx" });
  expect(result).toBe("File not found: /missing.jsx");
});

// create command

test("create calls createFileWithParents with path and file_text", async () => {
  mockVfs.createFileWithParents.mockReturnValue("File created: /App.jsx");
  const result = await tool.execute({
    command: "create",
    path: "/App.jsx",
    file_text: "export default function App() {}",
  });
  expect(mockVfs.createFileWithParents).toHaveBeenCalledWith(
    "/App.jsx",
    "export default function App() {}"
  );
  expect(result).toBe("File created: /App.jsx");
});

test("create defaults file_text to empty string when omitted", async () => {
  mockVfs.createFileWithParents.mockReturnValue("File created: /empty.jsx");
  await tool.execute({ command: "create", path: "/empty.jsx" });
  expect(mockVfs.createFileWithParents).toHaveBeenCalledWith("/empty.jsx", "");
});

test("create propagates error string from createFileWithParents", async () => {
  mockVfs.createFileWithParents.mockReturnValue("Error: File already exists: /App.jsx");
  const result = await tool.execute({
    command: "create",
    path: "/App.jsx",
    file_text: "content",
  });
  expect(result).toBe("Error: File already exists: /App.jsx");
});

// str_replace command

test("str_replace calls replaceInFile with path, old_str, and new_str", async () => {
  mockVfs.replaceInFile.mockReturnValue("Replaced 1 occurrence(s) of the string in /App.jsx");
  const result = await tool.execute({
    command: "str_replace",
    path: "/App.jsx",
    old_str: "Hello",
    new_str: "World",
  });
  expect(mockVfs.replaceInFile).toHaveBeenCalledWith("/App.jsx", "Hello", "World");
  expect(result).toContain("Replaced 1");
});

test("str_replace defaults old_str and new_str to empty strings when omitted", async () => {
  mockVfs.replaceInFile.mockReturnValue('Error: String not found in file: ""');
  await tool.execute({ command: "str_replace", path: "/App.jsx" });
  expect(mockVfs.replaceInFile).toHaveBeenCalledWith("/App.jsx", "", "");
});

test("str_replace propagates error string from replaceInFile", async () => {
  mockVfs.replaceInFile.mockReturnValue('Error: String not found in file: "missing"');
  const result = await tool.execute({
    command: "str_replace",
    path: "/App.jsx",
    old_str: "missing",
    new_str: "replacement",
  });
  expect(result).toContain("Error:");
});

// insert command

test("insert calls insertInFile with path, insert_line, and new_str", async () => {
  mockVfs.insertInFile.mockReturnValue("Text inserted at line 3 in /App.jsx");
  const result = await tool.execute({
    command: "insert",
    path: "/App.jsx",
    insert_line: 3,
    new_str: "// inserted comment",
  });
  expect(mockVfs.insertInFile).toHaveBeenCalledWith("/App.jsx", 3, "// inserted comment");
  expect(result).toBe("Text inserted at line 3 in /App.jsx");
});

test("insert defaults insert_line to 0 and new_str to empty string when omitted", async () => {
  mockVfs.insertInFile.mockReturnValue("Text inserted at line 0 in /App.jsx");
  await tool.execute({ command: "insert", path: "/App.jsx" });
  expect(mockVfs.insertInFile).toHaveBeenCalledWith("/App.jsx", 0, "");
});

test("insert propagates error string from insertInFile", async () => {
  mockVfs.insertInFile.mockReturnValue("Error: Invalid line number: 999. File has 5 lines.");
  const result = await tool.execute({
    command: "insert",
    path: "/App.jsx",
    insert_line: 999,
    new_str: "text",
  });
  expect(result).toContain("Error:");
});

// undo_edit command

test("undo_edit returns an error message without calling any VFS method", async () => {
  const result = await tool.execute({ command: "undo_edit", path: "/App.jsx" });
  expect(result).toContain("Error");
  expect(result).toContain("undo_edit");
  expect(mockVfs.viewFile).not.toHaveBeenCalled();
  expect(mockVfs.createFileWithParents).not.toHaveBeenCalled();
  expect(mockVfs.replaceInFile).not.toHaveBeenCalled();
  expect(mockVfs.insertInFile).not.toHaveBeenCalled();
});
