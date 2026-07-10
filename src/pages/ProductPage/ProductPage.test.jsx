import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProductPage } from "./ProductPage.jsx";

const navigate = vi.fn();
const authState = vi.hoisted(() => ({ isAdmin: false, authToken: "token" }));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

const product = {
  _id: "p1",
  code: "luna",
  name: "Bolso Luna",
  type: "Hombro",
  description: "Bolso artesanal tejido a mano",
  materials: ["Lana", "Algodón"],
  dimensions: ["20 x 15 x 8", "25 x 20 x 10"],
  color: ["Rojo", "Azul"],
  price: 120000,
  photo: "https://drive.google.com/file/d/abc123/view",
};

vi.mock("../../store/useAuthStore.js", () => ({
  useAuthStore: (selector) =>
    selector({
      currentUser: { isAdmin: authState.isAdmin },
      authToken: authState.authToken,
    }),
}));

vi.mock("../../store/useProductsStore.js", () => ({
  useProductsStore: (selector) =>
    selector({
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
    }),
}));

vi.mock("../../services/productService.js", () => ({
  deleteProduct: vi.fn(),
}));

vi.mock("../../components/ProductAdmin/EditProductModal.jsx", () => ({
  EditProductModal: () => null,
}));

vi.mock("../../components/ProductAdmin/DeleteConfirmationModal.jsx", () => ({
  DeleteConfirmationModal: () => null,
}));

vi.mock("../../components/SpeakButton/SpeakButton.jsx", () => ({
  SpeakButton: ({ text }) => (
    <span data-testid="product-speak-text">{text}</span>
  ),
}));

describe("ProductPage TTS (HU-36)", () => {
  beforeEach(() => {
    navigate.mockReset();
    authState.isAdmin = false;
    authState.authToken = "token";
  });

  it("genera descripción de voz con la selección actual", () => {
    render(
      <MemoryRouter>
        <ProductPage product={product} />
      </MemoryRouter>,
    );

    const spoken = screen.getAllByTestId("product-speak-text")[0].textContent;

    expect(spoken).toContain("Producto: Bolso Luna");
    expect(spoken).toContain("Material: Lana");
    expect(spoken).toContain("Color: Rojo");
    expect(spoken).toContain("Precio: 120000");
  });

  it("actualiza la descripción al cambiar material y color", () => {
    render(
      <MemoryRouter>
        <ProductPage product={product} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Material"), {
      target: { value: "Algodón" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar color Azul" }));

    const spoken = screen.getAllByTestId("product-speak-text")[0].textContent;
    expect(spoken).toContain("Material: Algodón");
    expect(spoken).toContain("Color: Azul");
  });

  it("normaliza imagen de Google Drive y muestra código del producto", () => {
    render(
      <MemoryRouter>
        <ProductPage product={product} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://drive.google.com/uc?export=view&id=abc123",
    );
    expect(screen.getByText("Código: LUNA")).toBeInTheDocument();
  });

  it("navega al resumen de cotización con la selección actual", () => {
    render(
      <MemoryRouter>
        <ProductPage product={product} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Dimensiones"), {
      target: { value: "25 x 20 x 10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Realizar cotización" }));

    expect(navigate).toHaveBeenCalledWith("/quotation-summary", {
      state: {
        summary: expect.objectContaining({
          name: "Bolso Luna",
          selectedMaterial: "Lana",
          selectedDimension: "25 x 20 x 10",
          selectedColor: "Rojo",
        }),
      },
    });
  });

  it("muestra acciones de administrador", () => {
    authState.isAdmin = true;

    render(
      <MemoryRouter>
        <ProductPage product={product} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /Editar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Eliminar/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Realizar cotización" })).not.toBeInTheDocument();
  });
});
