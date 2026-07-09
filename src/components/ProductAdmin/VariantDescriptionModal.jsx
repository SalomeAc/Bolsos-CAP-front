import { useEffect, useState } from "react";
import { Modal } from "../Modal/Modal.jsx";
import "./VariantDescriptionModal.css";

function getVariantLabel(variant) {
  if (!variant) return "";

  const label = [variant.color, variant.material, variant.dimensions]
    .filter(Boolean)
    .join(" · ");

  return label || variant.sku || "Variante";
}

export function VariantDescriptionModal({
  open,
  variant,
  onClose,
  onSave,
  isLoading,
}) {
  const [descriptionImagen, setDescriptionImagen] = useState(
    () => variant?.descriptionImagen ?? "",
  );

  useEffect(() => {
    if (!open || !variant) return;
    setDescriptionImagen(variant.descriptionImagen ?? "");
  }, [open, variant?._id, variant?.descriptionImagen]);

  if (!variant) return null;

  const variantLabel = getVariantLabel(variant);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(variant, descriptionImagen.trim());
  };

  return (
    <Modal
      open={open}
      title="Descripción de imagen"
      description={`Edita la descripción visual de ${variantLabel}.`}
      onClose={onClose}
      className="variant-description-modal"
    >
      <form className="variant-description-form" onSubmit={handleSubmit}>
        <label className="variant-description-field">
          <span>Descripción de imagen</span>
          <textarea
            rows={6}
            value={descriptionImagen}
            onChange={(event) => setDescriptionImagen(event.target.value)}
            placeholder="Describe colores, texturas, acabados u otros detalles visuales de esta variante..."
            disabled={isLoading}
          />
        </label>

        <div className="variant-description-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className="button button-primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
