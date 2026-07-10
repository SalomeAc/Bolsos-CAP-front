import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCustomQuotationForm,
  createQuotation,
  getAllQuotations,
  getMyQuotations,
  getQuotation,
  getQuotationTraceability,
  respondQuotation,
  setFinalQuotation,
  updateQuotationStatus,
} from "./quotationService.js";
import { jsonResponse } from "../test/mockFetch.js";

describe("quotationService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("getQuotation obtiene detalle", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ _id: "q1" }));

    const quotation = await getQuotation("q1", "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/quotations/q1"),
      expect.any(Object),
    );
    expect(quotation._id).toBe("q1");
  });

  it("getMyQuotations y getAllQuotations usan rutas distintas", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([{ _id: "mine" }]))
      .mockResolvedValueOnce(jsonResponse([{ _id: "all" }]));

    const mine = await getMyQuotations("token");
    const all = await getAllQuotations("token");

    expect(mine[0]._id).toBe("mine");
    expect(all[0]._id).toBe("all");
  });

  it("createQuotation publica payload JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ _id: "new" }));

    await createQuotation({ productId: "p1" }, "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/quotations"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ productId: "p1" }),
      }),
    );
  });

  it("respondQuotation acepta string o payload", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ status: "aceptada" }))
      .mockResolvedValueOnce(jsonResponse({ status: "propuesta" }));

    await respondQuotation("q1", "aceptada", "token");
    await respondQuotation("q1", { decision: "propuesta", amount: 100 }, "token");

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/quotations/q1/respond"),
      expect.objectContaining({
        body: JSON.stringify({ decision: "aceptada" }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ decision: "propuesta", amount: 100 }),
      }),
    );
  });

  it("updateQuotationStatus y setFinalQuotation actualizan cotización", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ status: "cotizada" }))
      .mockResolvedValueOnce(jsonResponse({ finalQuotation: { amount: 120000 } }));

    await updateQuotationStatus("q1", "cotizada", "token");
    await setFinalQuotation("q1", { amount: 120000 }, "token");

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/status"),
      expect.objectContaining({ method: "PUT" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/quote"),
      expect.any(Object),
    );
  });

  it("getQuotationTraceability consulta trazabilidad", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ events: [] }));

    await getQuotationTraceability("q1", "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/traceability"),
      expect.any(Object),
    );
  });

  it("createCustomQuotationForm envía multipart sin Content-Type manual", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ _id: "custom" }));
    const formData = new FormData();
    formData.append("color", "Rojo");

    await createCustomQuotationForm(formData, "token");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body).toBe(formData);
    expect(options.headers.Authorization).toBe("Bearer token");
    expect(options.headers["Content-Type"]).toBeUndefined();
  });
});
