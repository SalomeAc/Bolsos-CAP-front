import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isTokenExpired,
  selectReturnPath,
  selectToken,
  selectUser,
  useAuthStore,
} from "./useAuthStore.js";
import { jsonResponse } from "../test/mockFetch.js";

function makeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.signature`;
}

describe("useAuthStore", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useAuthStore.setState({
      currentUser: null,
      authToken: null,
      returnPath: null,
    });
  });

  it("isTokenExpired detecta expiración", () => {
    const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const expired = makeJwt({ exp: Math.floor(Date.now() / 1000) - 10 });

    expect(isTokenExpired(valid)).toBe(false);
    expect(isTokenExpired(expired)).toBe(true);
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired("token-invalido")).toBe(true);
  });

  it("signInWithGoogle guarda usuario y token", async () => {
    const credential = makeJwt({
      given_name: "Ana",
      family_name: "López",
      email: "ana@test.com",
      picture: "pic.png",
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        token: "session-token",
        user: {
          _id: "u1",
          firstName: "Ana",
          lastName: "López",
          email: "ana@test.com",
          isAdmin: true,
        },
      }),
    );

    const result = await useAuthStore.getState().signInWithGoogle(credential);

    expect(result.token).toBe("session-token");
    expect(useAuthStore.getState().authToken).toBe("session-token");
    expect(useAuthStore.getState().currentUser).toMatchObject({
      firstName: "Ana",
      isAdmin: true,
    });
  });

  it("signInWithGoogle propaga error del backend", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Credencial inválida" }, { ok: false, status: 401 }),
    );

    await expect(
      useAuthStore.getState().signInWithGoogle("bad-credential"),
    ).rejects.toThrow("Credencial inválida");
  });

  it("logout limpia sesión y returnPath", () => {
    useAuthStore.setState({
      currentUser: { firstName: "Ana" },
      authToken: "token",
      returnPath: "/cotizar",
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      currentUser: null,
      authToken: null,
      returnPath: null,
    });
  });

  it("expone selectores de conveniencia", () => {
    useAuthStore.setState({
      authToken: "token",
      currentUser: { firstName: "Ana" },
      returnPath: "/perfil",
    });

    const state = useAuthStore.getState();
    expect(selectToken(state)).toBe("token");
    expect(selectUser(state)).toMatchObject({ firstName: "Ana" });
    expect(selectReturnPath(state)).toBe("/perfil");
  });

  it("setReturnPath guarda la ruta de retorno", () => {
    useAuthStore.getState().setReturnPath("/catalog");
    expect(useAuthStore.getState().returnPath).toBe("/catalog");
  });
});
