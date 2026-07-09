import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Chat } from "./Chat.jsx";
import { deleteMessage, getLatestMessages, sendMessage } from "../../services/messageService";

const { messages } = vi.hoisted(() => ({
  messages: [
    {
      _id: "m1",
      content: "Hola, ¿cuánto cuesta?",
      isSystemMessage: false,
      sender: { _id: "user-1", firstName: "Ana" },
      createdAt: "2026-01-10T12:00:00.000Z",
    },
    {
      _id: "m2",
      content: "Tu cotización está lista.",
      isSystemMessage: true,
      sender: { _id: "admin-1", firstName: "Admin" },
      createdAt: "2026-01-10T12:05:00.000Z",
    },
  ],
}));

vi.mock("../../services/messageService", () => ({
  getLatestMessages: vi.fn().mockResolvedValue(messages),
  sendMessage: vi.fn(),
  deleteMessage: vi.fn(),
}));

vi.mock("../../store/useAuthStore", () => ({
  useAuthStore: () => ({
    currentUser: { id: "user-1" },
    authToken: "token",
  }),
}));

vi.mock("./QuotationProductCard", () => ({
  QuotationProductCard: () => null,
}));

vi.mock("./ChatQuotationOfferActions", () => ({
  ChatQuotationOfferActions: () => null,
  getLatestQuotationOfferId: () => null,
  isQuotationOfferMessage: () => false,
}));

vi.mock("../SpeakButton/SpeakButton", () => ({
  SpeakButton: ({ text }) => (
    <span data-testid="speak-text">{text}</span>
  ),
}));

describe("Chat TTS (HU-35)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLatestMessages).mockResolvedValue(messages);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("arma el texto de escucha para mensajes propios y del sistema", async () => {
    render(
      <Chat
        quotationId="q1"
        quotation={{ _id: "q1", status: "cotizada" }}
        isAdmin={false}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("speak-text")).toHaveLength(2);
    });

    const spokenTexts = screen
      .getAllByTestId("speak-text")
      .map((node) => node.textContent);

    expect(spokenTexts).toContain("Tú: Hola, ¿cuánto cuesta?");
    expect(spokenTexts).toContain("Sistema: Tu cotización está lista.");
  });

  it("usa el nombre del remitente para mensajes de otros usuarios", async () => {
    vi.mocked(getLatestMessages).mockResolvedValueOnce([
      {
        _id: "m4",
        content: "Hola Ana",
        isSystemMessage: false,
        sender: { _id: "admin-2", firstName: "Carlos" },
        createdAt: "2026-01-10T12:10:00.000Z",
      },
    ]);

    render(
      <Chat quotationId="q1" quotation={{ _id: "q1", status: "cotizada" }} isAdmin={false} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("speak-text")).toHaveTextContent("Carlos: Hola Ana");
    });
  });

  it("envía mensajes y valida contenido vacío", async () => {
    vi.mocked(sendMessage).mockResolvedValueOnce({
      _id: "m3",
      content: "Gracias",
      isSystemMessage: false,
      sender: { _id: "user-1", firstName: "Ana" },
      createdAt: "2026-01-10T12:10:00.000Z",
    });

    render(
      <Chat quotationId="q1" quotation={{ _id: "q1", status: "cotizada" }} isAdmin={false} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Hola, ¿cuánto cuesta?")).toBeInTheDocument();
    });

    fireEvent.submit(document.querySelector(".chat-input-form"));
    expect(screen.getByText("El mensaje no puede estar vacío")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Escribe tu mensaje..."), {
      target: { value: "Gracias" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith("q1", "Gracias", "token");
      expect(screen.getByText("Gracias")).toBeInTheDocument();
    });
  });

  it("elimina mensajes cuando el usuario confirma", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(deleteMessage).mockResolvedValueOnce({ deleted: true });

    render(
      <Chat quotationId="q1" quotation={{ _id: "q1", status: "cotizada" }} isAdmin={false} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Hola, ¿cuánto cuesta?")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "✕" }));

    await waitFor(() => {
      expect(deleteMessage).toHaveBeenCalledWith("m1", "token");
      expect(screen.queryByText("Hola, ¿cuánto cuesta?")).not.toBeInTheDocument();
    });
  });
});
