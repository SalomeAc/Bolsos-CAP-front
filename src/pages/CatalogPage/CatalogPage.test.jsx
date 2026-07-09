import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CatalogPage } from "./CatalogPage.jsx";
import { fetchProducts } from "../../services/productService.js";

const mockProducts = [
  { _id: "p1", name: "Bolso Luna", description: "Artesanal en lana" },
  { _id: "p2", name: "Bolso Sol", description: "De algodón" },
];

const setProducts = vi.fn();
const authState = vi.hoisted(() => ({ isAdmin: false }));

vi.mock("../../store/useProductsStore.js", () => ({
  useProductsStore: (selector) =>
    selector({
      products: mockProducts,
      addProduct: vi.fn(),
      setProducts,
    }),
}));

vi.mock("../../store/useAuthStore.js", () => ({
  useAuthStore: (selector) =>
    selector({
      currentUser: { isAdmin: authState.isAdmin },
      authToken: "token",
    }),
}));

vi.mock("../../services/productService.js", () => ({
  fetchProducts: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../components/ProductCard/ProductCard.jsx", () => ({
  ProductCard: ({ product }) => <div data-testid="product-card">{product.name}</div>,
}));

vi.mock("../../components/ProductAdmin/CreateProductModal.jsx", () => ({
  CreateProductModal: () => null,
}));

vi.mock("../../components/VoiceButton/VoiceButton", () => ({
  default: ({ onResult, onStart, onEnd }) => (
    <button
      type="button"
      data-testid="voice-button"
      onClick={() => {
        onStart?.();
        onResult("Luna.");
        onEnd?.();
      }}
    >
      Voz
    </button>
  ),
}));

describe("CatalogPage voz (HU-37)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filtra productos al escribir en la búsqueda", () => {
    render(<CatalogPage />);

    const input = screen.getByPlaceholderText("Buscar producto...");
    fireEvent.change(input, { target: { value: "luna" } });

    expect(screen.getByText("Bolso Luna")).toBeInTheDocument();
    expect(screen.queryByText("Bolso Sol")).not.toBeInTheDocument();
  });

  it("normaliza el texto de voz y filtra el catálogo", () => {
    render(<CatalogPage />);

    fireEvent.click(screen.getByTestId("voice-button"));

    const input = screen.getByPlaceholderText("Buscar producto...");
    expect(input).toHaveValue("Luna");
    expect(screen.getByText("Bolso Luna")).toBeInTheDocument();
    expect(screen.queryByText("Bolso Sol")).not.toBeInTheDocument();
  });

  it("carga productos al montar la página", async () => {
    vi.mocked(fetchProducts).mockResolvedValueOnce([{ _id: "p9", name: "Nuevo" }]);
    render(<CatalogPage />);

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalled();
      expect(setProducts).toHaveBeenCalledWith([{ _id: "p9", name: "Nuevo" }]);
    });
  });
});

describe("CatalogPage admin", () => {
  it("muestra acción de crear producto para administradores", () => {
    authState.isAdmin = true;
    render(<CatalogPage />);

    expect(screen.getByRole("button", { name: "Crear nuevo producto" })).toBeInTheDocument();
    authState.isAdmin = false;
  });
});
