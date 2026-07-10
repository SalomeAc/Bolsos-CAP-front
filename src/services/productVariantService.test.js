import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteProductVariant,
  fetchProductVariants,
  saveProductVariants,
  syncProductVariants,
} from "./productVariantService.js";
import { jsonResponse } from "../test/mockFetch.js";

describe("productVariantService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("fetchProductVariants puede pedir sync", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

    await fetchProductVariants("p1", "token", { sync: true });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/products/p1/variants?sync=true"),
      expect.any(Object),
    );
  });

  it("saveProductVariants envía variantes", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));
    const variants = [{ sku: "A" }];

    await saveProductVariants("p1", variants, "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/products/p1/variants"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ variants }),
      }),
    );
  });

  it("syncProductVariants hace POST", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ synced: 2 }));

    await syncProductVariants("p1", "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/variants/sync"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("deleteProductVariant elimina variante", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ deleted: true }));

    await deleteProductVariant("p1", "v1", "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/products/p1/variants/v1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
