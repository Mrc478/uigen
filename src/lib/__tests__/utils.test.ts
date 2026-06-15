import { test, expect } from "vitest";
import { cn } from "@/lib/utils";

test("merges multiple class strings", () => {
  expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
});

test("returns empty string with no arguments", () => {
  expect(cn()).toBe("");
});

test("skips falsy values", () => {
  expect(cn("base", false && "hidden", undefined, null as any, "end")).toBe("base end");
});

test("resolves tailwind padding conflict — later class wins", () => {
  expect(cn("p-2", "p-4")).toBe("p-4");
});

test("resolves tailwind text color conflict — later class wins", () => {
  expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
});

test("resolves tailwind background color conflict — later class wins", () => {
  expect(cn("bg-white", "bg-gray-100")).toBe("bg-gray-100");
});

test("handles object syntax — includes keys with truthy values", () => {
  expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500");
});

test("handles array syntax", () => {
  expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
});

test("combines object, array, and string syntax", () => {
  const result = cn("base", ["array-class"], { conditional: true });
  expect(result).toBe("base array-class conditional");
});

test("handles empty string inputs without adding extra spaces", () => {
  expect(cn("foo", "", "bar")).toBe("foo bar");
});
