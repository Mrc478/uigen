import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { useRouter } from "next/navigation";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

const mockPush = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useRouter as any).mockReturnValue({ push: mockPush });
  (getAnonWorkData as any).mockReturnValue(null);
  (getProjects as any).mockResolvedValue([]);
  (createProject as any).mockResolvedValue({ id: "new-project-id" });
});

afterEach(() => {
  cleanup();
});

// Initial state

test("isLoading starts as false", () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.isLoading).toBe(false);
});

test("exposes signIn, signUp, and isLoading", () => {
  const { result } = renderHook(() => useAuth());
  expect(typeof result.current.signIn).toBe("function");
  expect(typeof result.current.signUp).toBe("function");
  expect(typeof result.current.isLoading).toBe("boolean");
});

// signIn — happy paths

test("signIn calls the action with email and password", async () => {
  (signInAction as any).mockResolvedValue({ success: false, error: "Invalid credentials" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signIn("user@example.com", "password123");
  });

  expect(signInAction).toHaveBeenCalledWith("user@example.com", "password123");
});

test("signIn returns the action result to the caller", async () => {
  (signInAction as any).mockResolvedValue({ success: false, error: "Invalid credentials" });

  const { result } = renderHook(() => useAuth());
  let authResult: any;
  await act(async () => {
    authResult = await result.current.signIn("user@example.com", "bad-pass");
  });

  expect(authResult).toEqual({ success: false, error: "Invalid credentials" });
});

test("signIn navigates to the most recent project on success", async () => {
  (signInAction as any).mockResolvedValue({ success: true });
  (getProjects as any).mockResolvedValue([{ id: "project-123" }, { id: "project-456" }]);

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signIn("user@example.com", "password");
  });

  expect(mockPush).toHaveBeenCalledWith("/project-123");
});

test("signIn creates a new project and navigates to it when no projects exist", async () => {
  (signInAction as any).mockResolvedValue({ success: true });
  (getProjects as any).mockResolvedValue([]);
  (createProject as any).mockResolvedValue({ id: "brand-new-project" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signIn("user@example.com", "password");
  });

  expect(createProject).toHaveBeenCalled();
  expect(mockPush).toHaveBeenCalledWith("/brand-new-project");
});

test("signIn saves anonymous work as a new project when anon data exists", async () => {
  (signInAction as any).mockResolvedValue({ success: true });
  (getAnonWorkData as any).mockReturnValue({
    messages: [{ id: "1", role: "user", content: "Hello" }],
    fileSystemData: { "/App.jsx": "content" },
  });
  (createProject as any).mockResolvedValue({ id: "anon-project" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signIn("user@example.com", "password");
  });

  expect(createProject).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: [{ id: "1", role: "user", content: "Hello" }],
      data: { "/App.jsx": "content" },
    })
  );
  expect(clearAnonWork).toHaveBeenCalled();
  expect(mockPush).toHaveBeenCalledWith("/anon-project");
});

test("signIn does not create project from anon data when messages are empty", async () => {
  (signInAction as any).mockResolvedValue({ success: true });
  (getAnonWorkData as any).mockReturnValue({ messages: [], fileSystemData: {} });
  (getProjects as any).mockResolvedValue([{ id: "existing" }]);

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signIn("user@example.com", "password");
  });

  expect(mockPush).toHaveBeenCalledWith("/existing");
  expect(clearAnonWork).not.toHaveBeenCalled();
});

// signIn — failure paths

test("signIn does not navigate when the action fails", async () => {
  (signInAction as any).mockResolvedValue({ success: false, error: "Bad credentials" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signIn("user@example.com", "wrong");
  });

  expect(mockPush).not.toHaveBeenCalled();
});

// signIn — loading state

test("signIn sets isLoading to true while the action is in-flight, then resets it", async () => {
  let resolveAction!: (v: any) => void;
  (signInAction as any).mockReturnValue(new Promise((r) => (resolveAction = r)));

  const { result } = renderHook(() => useAuth());

  let signInPromise: Promise<any>;
  act(() => {
    signInPromise = result.current.signIn("user@example.com", "password");
  });

  expect(result.current.isLoading).toBe(true);

  await act(async () => {
    resolveAction({ success: false, error: "bad" });
    await signInPromise!;
  });

  expect(result.current.isLoading).toBe(false);
});

test("signIn resets isLoading to false even when action rejects", async () => {
  (signInAction as any).mockRejectedValue(new Error("Network error"));

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    try {
      await result.current.signIn("user@example.com", "password");
    } catch {
      // expected
    }
  });

  expect(result.current.isLoading).toBe(false);
});

// signUp — happy paths

test("signUp calls the action with email and password", async () => {
  (signUpAction as any).mockResolvedValue({ success: false, error: "Email taken" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signUp("new@example.com", "password123");
  });

  expect(signUpAction).toHaveBeenCalledWith("new@example.com", "password123");
});

test("signUp returns the action result to the caller", async () => {
  (signUpAction as any).mockResolvedValue({ success: false, error: "Email taken" });

  const { result } = renderHook(() => useAuth());
  let authResult: any;
  await act(async () => {
    authResult = await result.current.signUp("taken@example.com", "password123");
  });

  expect(authResult).toEqual({ success: false, error: "Email taken" });
});

test("signUp navigates after a successful registration", async () => {
  (signUpAction as any).mockResolvedValue({ success: true });
  (createProject as any).mockResolvedValue({ id: "signup-project" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signUp("new@example.com", "password123");
  });

  expect(mockPush).toHaveBeenCalled();
});

// signUp — failure paths

test("signUp does not navigate when the action fails", async () => {
  (signUpAction as any).mockResolvedValue({ success: false, error: "Email already registered" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signUp("taken@example.com", "password123");
  });

  expect(mockPush).not.toHaveBeenCalled();
});

test("signUp saves anonymous work as a new project when anon data exists", async () => {
  (signUpAction as any).mockResolvedValue({ success: true });
  (getAnonWorkData as any).mockReturnValue({
    messages: [{ id: "1", role: "user", content: "Hello" }],
    fileSystemData: { "/App.jsx": "content" },
  });
  (createProject as any).mockResolvedValue({ id: "anon-signup-project" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signUp("new@example.com", "password123");
  });

  expect(createProject).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: [{ id: "1", role: "user", content: "Hello" }],
      data: { "/App.jsx": "content" },
    })
  );
  expect(clearAnonWork).toHaveBeenCalled();
  expect(mockPush).toHaveBeenCalledWith("/anon-signup-project");
});

test("signUp navigates to the most recent project when one exists", async () => {
  (signUpAction as any).mockResolvedValue({ success: true });
  (getProjects as any).mockResolvedValue([{ id: "first" }, { id: "second" }]);

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signUp("new@example.com", "password123");
  });

  expect(mockPush).toHaveBeenCalledWith("/first");
});

// signUp — loading state

test("signUp sets isLoading to true while the action is in-flight, then resets it", async () => {
  let resolveAction!: (v: any) => void;
  (signUpAction as any).mockReturnValue(new Promise((r) => (resolveAction = r)));

  const { result } = renderHook(() => useAuth());

  let signUpPromise: Promise<any>;
  act(() => {
    signUpPromise = result.current.signUp("new@example.com", "password123");
  });

  expect(result.current.isLoading).toBe(true);

  await act(async () => {
    resolveAction({ success: false, error: "taken" });
    await signUpPromise!;
  });

  expect(result.current.isLoading).toBe(false);
});

test("signUp resets isLoading to false after completion", async () => {
  (signUpAction as any).mockResolvedValue({ success: true });
  (createProject as any).mockResolvedValue({ id: "p1" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signUp("new@example.com", "password123");
  });

  expect(result.current.isLoading).toBe(false);
});

test("signUp resets isLoading to false even when action rejects", async () => {
  (signUpAction as any).mockRejectedValue(new Error("Server error"));

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    try {
      await result.current.signUp("new@example.com", "password123");
    } catch {
      // expected
    }
  });

  expect(result.current.isLoading).toBe(false);
});

// post-sign-in routing — shared behaviour

test("getProjects is not called when anon work is saved", async () => {
  (signInAction as any).mockResolvedValue({ success: true });
  (getAnonWorkData as any).mockReturnValue({
    messages: [{ id: "1", role: "user", content: "Hi" }],
    fileSystemData: {},
  });
  (createProject as any).mockResolvedValue({ id: "anon-p" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signIn("user@example.com", "password");
  });

  expect(getProjects).not.toHaveBeenCalled();
});

test("new fallback project name begins with 'New Design #'", async () => {
  (signInAction as any).mockResolvedValue({ success: true });
  (getProjects as any).mockResolvedValue([]);
  (createProject as any).mockResolvedValue({ id: "fallback" });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.signIn("user@example.com", "password");
  });

  expect(createProject).toHaveBeenCalledWith(
    expect.objectContaining({ name: expect.stringMatching(/^New Design #\d+$/) })
  );
});
