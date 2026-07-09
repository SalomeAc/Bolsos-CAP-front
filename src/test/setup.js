import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

Element.prototype.scrollIntoView = vi.fn();

if (typeof globalThis.crypto?.randomUUID !== "function") {
  globalThis.crypto.randomUUID = () =>
    `test-${Math.random().toString(36).slice(2, 11)}`;
}
