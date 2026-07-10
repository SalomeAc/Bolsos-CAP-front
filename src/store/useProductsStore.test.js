import { beforeEach, describe, expect, it } from "vitest";
import { useProductsStore } from "./useProductsStore.js";

describe("useProductsStore", () => {
  beforeEach(() => {
    useProductsStore.setState({ products: [] });
  });

  it("setProducts reemplaza el catálogo", () => {
    useProductsStore.getState().setProducts([{ slug: "luna", name: "Luna" }]);

    expect(useProductsStore.getState().products).toHaveLength(1);
  });

  it("addProduct antepone el producto nuevo", () => {
    useProductsStore.setState({
      products: [{ slug: "sol", name: "Sol" }],
    });

    useProductsStore.getState().addProduct({ slug: "luna", name: "Luna" });

    expect(useProductsStore.getState().products.map((p) => p.slug)).toEqual([
      "luna",
      "sol",
    ]);
  });

  it("updateProduct actualiza por slug o code", () => {
    useProductsStore.setState({
      products: [{ code: "A1", name: "Viejo" }],
    });

    useProductsStore.getState().updateProduct("A1", { name: "Nuevo" });

    expect(useProductsStore.getState().products[0].name).toBe("Nuevo");
  });

  it("deleteProduct elimina por slug o code", () => {
    useProductsStore.setState({
      products: [
        { slug: "luna", name: "Luna" },
        { code: "SOL", name: "Sol" },
      ],
    });

    useProductsStore.getState().deleteProduct("luna");
    useProductsStore.getState().deleteProduct("SOL");

    expect(useProductsStore.getState().products).toHaveLength(0);
  });

  it("getProductBySlug y getProductByCode resuelven productos", () => {
    useProductsStore.setState({
      products: [
        { slug: "luna", code: "LUNA", name: "Luna" },
      ],
    });

    const store = useProductsStore.getState();
    expect(store.getProductBySlug("luna")?.name).toBe("Luna");
    expect(store.getProductByCode("LUNA")?.name).toBe("Luna");
    expect(store.getProductByCode("luna")?.name).toBe("Luna");
  });
});
