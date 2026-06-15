import { test, expect, beforeEach } from "vitest";
import {
  setHasAnonWork,
  getHasAnonWork,
  getAnonWorkData,
  clearAnonWork,
} from "@/lib/anon-work-tracker";

const STORAGE_KEY = "uigen_has_anon_work";
const DATA_KEY = "uigen_anon_data";

beforeEach(() => {
  sessionStorage.clear();
});

// setHasAnonWork

test("setHasAnonWork stores data when messages array is non-empty", () => {
  setHasAnonWork([{ id: "1", role: "user", content: "Hello" }], {});
  expect(sessionStorage.getItem(STORAGE_KEY)).toBe("true");
});

test("setHasAnonWork stores data when fileSystemData has more than the root key", () => {
  setHasAnonWork([], { "/": {}, "/App.jsx": { content: "..." } });
  expect(sessionStorage.getItem(STORAGE_KEY)).toBe("true");
});

test("setHasAnonWork stores the serialized messages and fileSystemData", () => {
  const messages = [{ id: "1", role: "user", content: "Hello" }];
  const fileSystemData = { "/App.jsx": "content" };
  setHasAnonWork(messages, fileSystemData);
  const stored = JSON.parse(sessionStorage.getItem(DATA_KEY)!);
  expect(stored.messages).toEqual(messages);
  expect(stored.fileSystemData).toEqual(fileSystemData);
});

test("setHasAnonWork does not store when messages is empty and fileSystemData has only root", () => {
  setHasAnonWork([], { "/": {} });
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
});

test("setHasAnonWork does not store when both messages and fileSystemData are empty", () => {
  setHasAnonWork([], {});
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  expect(sessionStorage.getItem(DATA_KEY)).toBeNull();
});

// getHasAnonWork

test("getHasAnonWork returns false when nothing is stored", () => {
  expect(getHasAnonWork()).toBe(false);
});

test("getHasAnonWork returns true after setHasAnonWork with messages", () => {
  setHasAnonWork([{ id: "1" }], {});
  expect(getHasAnonWork()).toBe(true);
});

test("getHasAnonWork returns false when storage key is set to a non-true value", () => {
  sessionStorage.setItem(STORAGE_KEY, "false");
  expect(getHasAnonWork()).toBe(false);
});

// getAnonWorkData

test("getAnonWorkData returns null when nothing is stored", () => {
  expect(getAnonWorkData()).toBeNull();
});

test("getAnonWorkData returns null when DATA_KEY holds invalid JSON", () => {
  sessionStorage.setItem(DATA_KEY, "{ not valid json");
  expect(getAnonWorkData()).toBeNull();
});

test("getAnonWorkData returns parsed data after setHasAnonWork", () => {
  const messages = [{ id: "1", role: "user", content: "Hi" }];
  const fileSystemData = { "/App.jsx": "export default function App() {}" };
  setHasAnonWork(messages, fileSystemData);
  const data = getAnonWorkData();
  expect(data).not.toBeNull();
  expect(data!.messages).toEqual(messages);
  expect(data!.fileSystemData).toEqual(fileSystemData);
});

test("getAnonWorkData returns null when DATA_KEY is missing but STORAGE_KEY is set", () => {
  sessionStorage.setItem(STORAGE_KEY, "true");
  expect(getAnonWorkData()).toBeNull();
});

// clearAnonWork

test("clearAnonWork removes both storage keys", () => {
  setHasAnonWork([{ id: "1" }], {});
  clearAnonWork();
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  expect(sessionStorage.getItem(DATA_KEY)).toBeNull();
});

test("clearAnonWork is safe to call when nothing is stored", () => {
  expect(() => clearAnonWork()).not.toThrow();
});

test("getHasAnonWork returns false after clearAnonWork", () => {
  setHasAnonWork([{ id: "1" }], {});
  clearAnonWork();
  expect(getHasAnonWork()).toBe(false);
});

test("getAnonWorkData returns null after clearAnonWork", () => {
  setHasAnonWork([{ id: "1" }], { "/App.jsx": "content" });
  clearAnonWork();
  expect(getAnonWorkData()).toBeNull();
});
