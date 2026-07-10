import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CotizarPage } from "./CotizarPage.jsx";
import { createCustomQuotationForm } from "../../services/quotationService.js";

const navigate = vi.fn();

const authState = vi.hoisted(() => ({
  authToken: "token",
  isAdmin: false,
}));

const dictationState = {
  isListening: false,
  interimText: "",
  speechError: null,
  toggleListening: vi.fn(),
  clearSpeechError: vi.fn(),
  onFinalText: null,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../../store/useAuthStore.js", () => ({
  useAuthStore: (selector) =>
    selector({
      authToken: authState.authToken,
      currentUser: { isAdmin: authState.isAdmin },
    }),
}));

vi.mock("../../services/quotationService.js", () => ({
  createCustomQuotationForm: vi.fn(),
}));

vi.mock("../../hooks/useAzureDictation.js", () => ({
  useAzureDictation: ({ onFinalText }) => {
    dictationState.onFinalText = onFinalText;
    return {
      isListening: dictationState.isListening,
      interimText: dictationState.interimText,
      speechError: dictationState.speechError,
      toggleListening: dictationState.toggleListening,
      clearSpeechError: dictationState.clearSpeechError,
    };
  },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <CotizarPage />
    </MemoryRouter>,
  );

describe("CotizarPage dictado (HU-34)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dictationState.onFinalText = null;
    navigate.mockReset();
    authState.authToken = "token";
    authState.isAdmin = false;
    global.URL.createObjectURL = vi.fn(() => "blob:preview");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("concatena texto dictado en observaciones", async () => {
    renderPage();

    const textarea = screen.getByPlaceholderText("Detalles adicionales sobre tu bolso...");
    fireEvent.change(textarea, { target: { value: "Necesito asas" } });

    dictationState.onFinalText?.("largas y resistentes");

    await waitFor(() => {
      expect(textarea).toHaveValue("Necesito asas largas y resistentes");
    });
  });

  it("agrega dictado cuando observaciones está vacío", async () => {
    renderPage();

    dictationState.onFinalText?.("Urgente para regalo");

    const textarea = screen.getByPlaceholderText("Detalles adicionales sobre tu bolso...");
    await waitFor(() => {
      expect(textarea).toHaveValue("Urgente para regalo");
    });
  });

  it("muestra errores de validación al enviar vacío", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(screen.getAllByText("Este campo es obligatorio y no puede estar vacío").length).toBeGreaterThanOrEqual(2);
    expect(createCustomQuotationForm).not.toHaveBeenCalled();
  });

  it("envía cotización válida y navega al historial del cliente", async () => {
    vi.mocked(createCustomQuotationForm).mockResolvedValueOnce({ _id: "q-new" });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("largo x ancho x alto"), {
      target: { name: "dimensions", value: "20 x 15 x 8" },
    });
    fireEvent.change(screen.getByPlaceholderText("Lana"), {
      target: { name: "material", value: "Lana" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => {
      expect(createCustomQuotationForm).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith("/mis-cotizaciones", {
        replace: true,
        state: { selectedQuotationId: "q-new" },
      });
    });
  });

  it("rechaza archivos con tipo no permitido", () => {
    renderPage();

    const fileInput = screen.getByLabelText("Subir foto de referencia");
    const file = new File(["img"], "foto.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText("Solo se permiten imágenes JPG, PNG, WEBP o GIF.")).toBeInTheDocument();
  });

  it("redirige a cotizaciones si el usuario es admin", () => {
    authState.isAdmin = true;
    renderPage();

    expect(navigate).toHaveBeenCalledWith("/cotizaciones", { replace: true });
  });

  it("permite dictar y limpiar errores de voz", () => {
    dictationState.isListening = true;
    dictationState.interimText = "detalle";
    dictationState.speechError = "Micrófono bloqueado";

    renderPage();

    expect(screen.getByText(/Escuchando: detalle/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Detener dictado" }));
    expect(dictationState.toggleListening).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(dictationState.clearSpeechError).toHaveBeenCalled();

    dictationState.isListening = false;
    dictationState.interimText = "";
    dictationState.speechError = null;
  });
});
