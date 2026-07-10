import { describe, expect, it } from "vitest";
import {
  parseDimensionsValue,
  serializeDimensions,
  validateDimensionsValue,
} from "./dimensionsUtils.js";

describe("dimensionsUtils", () => {
  it("parseDimensionsValue retorna una fila vacía sin valor", () => {
    const rows = parseDimensionsValue("");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ width: "", height: "", depth: "" });
  });

  it("parseDimensionsValue separa múltiples dimensiones", () => {
    const rows = parseDimensionsValue("20 x 15 x 8, 25 x 20 x 10");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ width: "20", height: "15", depth: "8" });
    expect(rows[1]).toMatchObject({ width: "25", height: "20", depth: "10" });
  });

  it("parseDimensionsValue quita sufijo cm", () => {
    const rows = parseDimensionsValue("20 x 15 x 8 cm");
    expect(rows[0]).toMatchObject({ width: "20", height: "15", depth: "8" });
  });

  it("serializeDimensions une filas completas", () => {
    const result = serializeDimensions([
      { width: "20", height: "15", depth: "8" },
      { width: "25", height: "", depth: "10" },
    ]);
    expect(result).toBe("20 x 15 x 8");
  });

  it("validateDimensionsValue exige al menos una fila completa", () => {
    expect(validateDimensionsValue("")).toContain("al menos un tamaño");
    expect(validateDimensionsValue("20 x 15 x 8")).toBe("");
  });

  it("validateDimensionsValue detecta filas incompletas", () => {
    const message = validateDimensionsValue("20 x 15, 25 x 20 x 10");
    expect(message).toContain("Completa ancho");
  });

  it("parseDimensionsValue devuelve fila vacía con comas sueltas", () => {
    const rows = parseDimensionsValue(", ,");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ width: "", height: "", depth: "" });
  });
});
