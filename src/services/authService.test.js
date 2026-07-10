import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getUserProfile,
  loginWithGoogle,
  registerUser,
  updateUserProfile,
} from "./authService.js";
import { jsonResponse } from "../test/mockFetch.js";

describe("authService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("loginWithGoogle envía credencial y devuelve datos", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ token: "jwt", user: { email: "a@test.com" } }),
    );

    const result = await loginWithGoogle("google-token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/users/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ idToken: "google-token" }),
      }),
    );
    expect(result.token).toBe("jwt");
  });

  it("getUserProfile usa Authorization Bearer", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ firstName: "Ana" }));

    const profile = await getUserProfile("token-1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/users/user-profile"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-1",
        }),
      }),
    );
    expect(profile.firstName).toBe("Ana");
  });

  it("updateUserProfile envía PUT con perfil", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));

    await updateUserProfile("token-1", { firstName: "Luis" });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/users/update-profile"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ firstName: "Luis" }),
      }),
    );
  });

  it("registerUser propaga errores del servidor", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Correo ya registrado" }, { ok: false, status: 400 }),
    );

    await expect(registerUser({ email: "a@test.com" })).rejects.toThrow(
      "Correo ya registrado",
    );
  });

  it("loginWithGoogle usa statusText cuando la respuesta no es JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: { get: () => "text/plain" },
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(loginWithGoogle("token")).rejects.toThrow("Internal Server Error");
  });
});
