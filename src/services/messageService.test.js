import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteMessage,
  getLatestMessages,
  getMessagesByQuotation,
  sendMessage,
} from "./messageService.js";
import { jsonResponse } from "../test/mockFetch.js";

describe("messageService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("getMessagesByQuotation consulta todos los mensajes", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([{ _id: "m1" }]));

    const messages = await getMessagesByQuotation("q1", "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/messages/q1/all"),
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
      }),
    );
    expect(messages).toHaveLength(1);
  });

  it("getLatestMessages respeta el límite", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

    await getLatestMessages("q1", "token", 10);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("limit=10"),
      expect.any(Object),
    );
  });

  it("sendMessage publica contenido y adjuntos", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ _id: "m2" }));

    const created = await sendMessage("q1", "Hola", "token", ["file.png"]);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/messages/q1"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          quotationId: "q1",
          content: "Hola",
          attachments: ["file.png"],
        }),
      }),
    );
    expect(created._id).toBe("m2");
  });

  it("deleteMessage elimina por id", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ deleted: true }));

    await deleteMessage("m1", "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/messages/m1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("deleteMessage propaga errores HTTP", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Forbidden" }, { ok: false, status: 403 }),
    );

    await expect(deleteMessage("m1", "token")).rejects.toThrow("Forbidden");
  });

  it("getMessagesByQuotation propaga error con campo error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: "Sin permisos" }, { ok: false, status: 403 }),
    );

    await expect(getMessagesByQuotation("q1", "token")).rejects.toThrow("Sin permisos");
  });
});
