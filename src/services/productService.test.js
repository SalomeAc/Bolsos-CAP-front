import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createProduct,
  createProductForm,
  deleteProduct,
  deleteProductPhoto,
  fetchProducts,
  getProductByCode,
  updateProduct,
  updateProductForm,
} from "./productService.js";
import { jsonResponse } from "../test/mockFetch.js";

describe("productService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("fetchProducts lista catálogo", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([{ _id: "p1" }]));

    const products = await fetchProducts();

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/products"));
    expect(products).toHaveLength(1);
  });

  it("createProduct normaliza campos de texto a arreglos", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ _id: "p2" }));

    await createProduct(
      {
        name: "Bolso",
        description: "Desc",
        type: "Hombro",
        color: "Rojo, Azul",
        dimensions: "20 x 15 x 8",
        materials: "Lana",
        photo: "url",
      },
      "token",
    );

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload.color).toEqual(["Rojo", "Azul"]);
    expect(payload.materials).toEqual(["Lana"]);
    expect(payload.dimensions).toEqual(["20 x 15 x 8"]);
  });

  it("getProductByCode hace fallback al listado cuando falla la búsqueda directa", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(
        jsonResponse([
          { code: "BLOOM", name: "Bolso Bloom" },
          { code: "LUNA", name: "Bolso Luna" },
        ]),
      );

    const result = await getProductByCode("BLOOM");

    expect(result).toEqual([{ code: "BLOOM", name: "Bolso Bloom" }]);
  });

  it("getProductByCode puede resolver por nombre en el fallback", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(
        jsonResponse([{ code: "X1", name: "Bolso Bloom" }]),
      );

    const result = await getProductByCode("bloom");

    expect(result).toEqual([{ code: "X1", name: "Bolso Bloom" }]);
  });

  it("getProductByCode devuelve arreglo vacío si no hay coincidencias", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(jsonResponse([]));

    await expect(getProductByCode("NOPE")).resolves.toEqual([]);
  });

  it("getProductByCode lanza error si el fallback también falla", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("network"))
      .mockRejectedValueOnce(new Error("network"));

    await expect(getProductByCode("NOPE")).rejects.toThrow(
      "No se encontró producto con código: NOPE",
    );
  });

  it("updateProduct y deleteProduct usan id en la ruta", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ _id: "p1" }))
      .mockResolvedValueOnce(jsonResponse({ deleted: true }));

    await updateProduct("p1", { name: "Nuevo", color: ["Rojo"] }, "token");
    await deleteProduct("p1", "token");

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/products/p1"),
      expect.objectContaining({ method: "PUT" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/products/p1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("createProductForm y updateProductForm envían FormData", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ _id: "p3" }))
      .mockResolvedValueOnce(jsonResponse({ _id: "p3" }));

    const createData = new FormData();
    const updateData = new FormData();

    await createProductForm(createData, "token");
    await updateProductForm("p3", updateData, "token");

    expect(vi.mocked(fetch).mock.calls[0][1].body).toBe(createData);
    expect(vi.mocked(fetch).mock.calls[1][1].body).toBe(updateData);
  });

  it("deleteProductPhoto elimina foto", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));

    await deleteProductPhoto("p1", "token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/products/p1/photo"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
