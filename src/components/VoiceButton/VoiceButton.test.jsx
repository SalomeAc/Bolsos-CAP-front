import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VoiceButton from "./VoiceButton.jsx";

vi.mock("../../services/speechService", () => ({
  recognizeSpeech: vi.fn(),
}));

import { recognizeSpeech } from "../../services/speechService";

describe("VoiceButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("entrega texto reconocido y ejecuta callbacks", async () => {
    const onResult = vi.fn();
    const onStart = vi.fn();
    const onEnd = vi.fn();
    vi.mocked(recognizeSpeech).mockResolvedValue("Bolso luna");

    render(
      <VoiceButton onResult={onResult} onStart={onStart} onEnd={onEnd} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Activar reconocimiento de voz" }),
    );

    expect(onStart).toHaveBeenCalled();
    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith("Bolso luna");
      expect(onEnd).toHaveBeenCalled();
    });
  });

  it("ignora clics mientras escucha", async () => {
    let resolveSpeech;
    vi.mocked(recognizeSpeech).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSpeech = resolve;
        }),
    );

    render(<VoiceButton onResult={vi.fn()} />);

    const button = screen.getByRole("button", {
      name: "Activar reconocimiento de voz",
    });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(recognizeSpeech).toHaveBeenCalledTimes(1);

    resolveSpeech?.("ok");
    await waitFor(() => {
      expect(button).toHaveAttribute(
        "aria-label",
        "Activar reconocimiento de voz",
      );
    });
  });

  it("tolera errores de reconocimiento sin romper la UI", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(recognizeSpeech).mockRejectedValue(new Error("mic denied"));

    render(<VoiceButton onResult={vi.fn()} onEnd={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Activar reconocimiento de voz" }),
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
