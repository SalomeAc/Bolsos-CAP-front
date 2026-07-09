export const QUOTATION_STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "cotizada_ia", label: "Cotizada (IA)" },
  { value: "en_revision", label: "En revisión" },
  { value: "cotizada", label: "Cotizada" },
  { value: "aceptada", label: "Aceptada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "en_produccion", label: "En producción" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

const STATUS_LABELS = Object.fromEntries(
  QUOTATION_STATUS_OPTIONS.map(({ value, label }) => [value, label]),
);

/** Etiqueta legible para mostrar en UI (sin guiones bajos). */
export function getQuotationStatusLabel(status) {
  if (!status) return "Sin estado";
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  return String(status).replace(/_/g, " ");
}
