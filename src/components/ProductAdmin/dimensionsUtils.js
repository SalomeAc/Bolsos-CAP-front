function createRow(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    width: "",
    height: "",
    depth: "",
    ...overrides,
  };
}

function parseSingleDimension(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/\s*cm\s*$/i, "");
  const parts = cleaned.split(/\s*x\s*/i).map((part) => part.trim());

  return createRow({
    width: parts[0] || "",
    height: parts[1] || "",
    depth: parts[2] || "",
  });
}

export function parseDimensionsValue(value) {
  if (!value) {
    return [createRow()];
  }

  const items = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) {
    return [createRow()];
  }

  return items.map((item) => parseSingleDimension(item));
}

export function serializeDimensions(rows = []) {
  return rows
    .filter((row) => row.width && row.height && row.depth)
    .map((row) => `${row.width} x ${row.height} x ${row.depth} cm`)
    .join(", ");
}

export function validateDimensionsValue(value) {
  const rows = parseDimensionsValue(value);
  const completeRows = rows.filter((row) => row.width && row.height && row.depth);

  if (!completeRows.length) {
    return "Agrega al menos un tamaño con ancho, alto y fondo.";
  }

  const hasPartial = rows.some(
    (row) =>
      (row.width || row.height || row.depth) &&
      !(row.width && row.height && row.depth),
  );

  if (hasPartial) {
    return "Completa ancho, alto y fondo en cada tamaño o elimina la fila incompleta.";
  }

  return "";
}
