import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpeakButton } from "./SpeakButton.jsx";

vi.mock("../../services/speechService.js", () => ({
  synthesizeSpeech: vi.fn(),
  stopSpeaking: vi.fn(),
}));

import { stopSpeaking, synthesizeSpeech } from "../../services/speechService.js";

describe("SpeakButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(synthesizeSpeech).mockResolvedValue(true);
  });

  it("reproduce texto inline", async () => {
    render(<SpeakButton text="Producto: Luna" label="Escuchar producto" />);

    fireEvent.click(screen.getByRole("button", { name: "Escuchar producto" }));

    await waitFor(() => {
      expect(synthesizeSpeech).toHaveBeenCalledWith("Producto: Luna");
    });
  });

  it("muestra error si no hay texto", () => {
    render(<SpeakButton text="   " />);

    fireEvent.click(screen.getByRole("button", { name: "Escuchar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No hay texto para reproducir",
    );
    expect(synthesizeSpeech).not.toHaveBeenCalled();
  });

  it("detiene reproducción cuando ya está hablando", async () => {
    let resolveSpeech;
    vi.mocked(synthesizeSpeech).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSpeech = resolve;
        }),
    );

    render(<SpeakButton text="Hola" variant="primary" />);

    const button = screen.getByRole("button", { name: "Escuchar" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute("aria-label", "Detener reproducción");
    });

    fireEvent.click(button);
    expect(stopSpeaking).toHaveBeenCalled();

    resolveSpeech?.(true);
  });

  it("ignora errores de interrupción", async () => {
    vi.mocked(synthesizeSpeech).mockRejectedValue(new Error("interrupted"));

    render(<SpeakButton text="Hola" />);
    fireEvent.click(screen.getByRole("button", { name: "Escuchar" }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
