import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HistorialCotizacionesPage } from "./HistorialCotizacionesPage.jsx";
import { updateQuotationStatus } from "../../services/quotationService";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

const { mockQuotations } = vi.hoisted(() => ({
  mockQuotations: [
    {
      _id: "q1",
      status: "pendiente",
      createdAt: "2026-01-10T10:00:00.000Z",
      kind: "custom",
      user: { firstName: "Ana", lastName: "López", email: "ana@test.com" },
      customProduct: { description: "Bolso artesanal" },
    },
    {
      _id: "q2",
      status: "en_produccion",
      createdAt: "2026-01-11T10:00:00.000Z",
      kind: "catalog",
      user: { firstName: "Luis", lastName: "Pérez", email: "luis@test.com" },
      product: { name: "Bolso clásico" },
    },
  ],
}));

vi.mock("../../store/useAuthStore", () => ({
  useAuthStore: (selector) =>
    selector({
      authToken: "admin-token",
      currentUser: { isAdmin: true },
    }),
}));

vi.mock("../../services/quotationService", () => ({
  getAllQuotations: vi.fn().mockResolvedValue(mockQuotations),
  updateQuotationStatus: vi.fn(),
}));

vi.mock("../../components/Modal/Modal.jsx", () => ({
  Modal: ({ open, children }) => (open ? <div>{children}</div> : null),
}));

vi.mock("../../components/VoiceButton/VoiceButton", () => ({
  default: ({ onResult }) => (
    <button
      type="button"
      data-testid="voice-button"
      onClick={() => onResult("pendiente Ana")}
    >
      Voz
    </button>
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <HistorialCotizacionesPage />
    </MemoryRouter>,
  );

describe("HistorialCotizacionesPage voz (HU-38)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigate.mockReset();
  });

  it("muestra cotizaciones cargadas", async () => {
    renderPage();

    expect(await screen.findByText("Ana López")).toBeInTheDocument();
    expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
  });

  it("filtra por comando de voz con estado y nombre", async () => {
    renderPage();
    await screen.findByText("Ana López");

    fireEvent.click(screen.getByTestId("voice-button"));

    await waitFor(() => {
      expect(screen.getByText("Ana López")).toBeInTheDocument();
      expect(screen.queryByText("Luis Pérez")).not.toBeInTheDocument();
    });

    const voiceBadge = document.querySelector(".voice-badge");
    expect(voiceBadge).toHaveTextContent("Pendiente");
  });

  it("filtra por nombre de cliente en la búsqueda manual", async () => {
    renderPage();
    await screen.findByText("Ana López");

    fireEvent.change(screen.getByLabelText("Buscar cliente"), {
      target: { value: "Luis" },
    });

    await waitFor(() => {
      expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
      expect(screen.queryByText("Ana López")).not.toBeInTheDocument();
    });
  });

  it("filtra por estado en el selector manual", async () => {
    renderPage();
    await screen.findByText("Ana López");

    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "en_produccion" },
    });

    await waitFor(() => {
      expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
      expect(screen.queryByText("Ana López")).not.toBeInTheDocument();
    });
  });

  it("navega al chat administrativo desde una fila", async () => {
    renderPage();
    await screen.findByText("Ana López");

    fireEvent.click(screen.getByRole("button", { name: "Abrir chat de Ana López" }));

    expect(navigate).toHaveBeenCalledWith("/cotizaciones", {
      state: { selectedQuotationId: "q1" },
    });
  });

  it("confirma cambio de estado de cotización", async () => {
    vi.mocked(updateQuotationStatus).mockResolvedValueOnce({ _id: "q1", status: "cotizada" });
    renderPage();
    await screen.findByText("Ana López");

    fireEvent.change(screen.getByLabelText("Estado de Ana López"), {
      target: { value: "cotizada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    await waitFor(() => {
      expect(updateQuotationStatus).toHaveBeenCalledWith("q1", "cotizada", "admin-token");
    });
  });
});
