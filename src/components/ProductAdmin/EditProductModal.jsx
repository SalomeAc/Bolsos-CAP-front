import { useEffect, useState } from "react";
import { Modal } from "../Modal/Modal.jsx";
import { ProductVariantsTable } from "./ProductVariantsTable.jsx";
import { DimensionsEditor } from "./DimensionsEditor.jsx";
import { validateDimensionsValue } from "./dimensionsUtils.js";
import "./EditProductModal.css";
import "./DimensionsEditor.css";
import "./ProductVariantsTable.css";

const initialErrors = {
  name: "",
  description: "",
  color: "",
  dimensions: "",
  materials: "",
  type: "",
  photo: "",
};

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function EditProductModal({
  open,
  product,
  authToken,
  onClose,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    color: "",
    dimensions: "",
    materials: "",
    type: "",
    photo: "",
  });
  const [errors, setErrors] = useState(initialErrors);

  useEffect(() => {
    if (!open || !product) {
      return;
    }

    setActiveTab("details");
    setFormState({
      name: product.name || "",
      description: product.description || "",
      color: Array.isArray(product.color) ? product.color.join(", ") : product.color || "",
      dimensions: Array.isArray(product.dimensions) ? product.dimensions.join(", ") : product.dimensions || "",
      materials: Array.isArray(product.materials) ? product.materials.join(", ") : product.materials || "",
      type: product.type || "",
      photo: product.photo || "",
    });
    setErrors(initialErrors);
  }, [open, product]);

  const validate = () => {
    const nextErrors = { ...initialErrors };

    if (formState.name.trim().length < 4) {
      nextErrors.name = "Ingresa un nombre válido de al menos 4 caracteres.";
    }

    if (formState.description.trim().length < 20) {
      nextErrors.description =
        "La descripción debe tener al menos 20 caracteres.";
    }

    if (!formState.color.trim()) {
      nextErrors.color = "El color es obligatorio.";
    }

    const dimensionsError = validateDimensionsValue(formState.dimensions);
    if (dimensionsError) {
      nextErrors.dimensions = dimensionsError;
    }

    if (!formState.materials.trim()) {
      nextErrors.materials = "Los materiales son obligatorios.";
    }

    if (!formState.type.trim()) {
      nextErrors.type = "El tipo de producto es obligatorio.";
    }

    if (!formState.photo.trim() || !isValidUrl(formState.photo.trim())) {
      nextErrors.photo = "Ingresa una URL de imagen válida.";
    }

    return nextErrors;
  };

  const handleDimensionsChange = (value) => {
    setFormState((current) => ({ ...current, dimensions: value }));
    setErrors((current) => ({ ...current, dimensions: "" }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate();
    const invalidFields = Object.values(nextErrors).filter(Boolean);

    if (invalidFields.length > 0) {
      setErrors(nextErrors);
      return;
    }

    const updatedProduct = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      color: formState.color.trim(),
      dimensions: formState.dimensions.trim(),
      materials: formState.materials.trim(),
      type: formState.type.trim(),
      photo: formState.photo.trim(),
    };

    onSave(updatedProduct);
  };

  if (!product) return null;

  const modalClassName = [
    "edit-product-modal",
    activeTab === "variants" ? "edit-product-modal--wide" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Modal
      open={open}
      title="Editar producto"
      description={
        activeTab === "details"
          ? "Actualiza la información del producto. Todos los campos son obligatorios."
          : "Configura el precio total y el precio del material por combinación."
      }
      onClose={onClose}
      className={modalClassName}
    >
      <div className="edit-product-tabs">
        <button
          type="button"
          className={`edit-product-tab${activeTab === "details" ? " is-active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Datos del producto
        </button>
        <button
          type="button"
          className={`edit-product-tab${activeTab === "variants" ? " is-active" : ""}`}
          onClick={() => setActiveTab("variants")}
        >
          Variantes y precios
        </button>
      </div>

      {activeTab === "details" ? (
        <form className="edit-product-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <label className="form-field">
              <span>Nombre</span>
              <input
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Ej. Bolso Luna"
                autoComplete="off"
                required
              />
              {errors.name ? (
                <span className="field-error">{errors.name}</span>
              ) : null}
            </label>

            <label className="form-field">
              <span>Tipo</span>
              <input
                name="type"
                value={formState.type}
                onChange={handleChange}
                placeholder="Ej. morral, cartera, bolso"
                autoComplete="off"
                required
              />
              {errors.type ? (
                <span className="field-error">{errors.type}</span>
              ) : null}
            </label>

            <label className="form-field form-field--full">
              <span>Colores</span>
              <input
                name="color"
                value={formState.color}
                onChange={handleChange}
                placeholder="Separa con comas. Ej. beige, terracota, negro"
                autoComplete="off"
                required
              />
              <p className="form-field__hint">
                Escribe un color por opción, separados por comas.
              </p>
              {errors.color ? (
                <span className="field-error">{errors.color}</span>
              ) : null}
            </label>

            <DimensionsEditor
              value={formState.dimensions}
              onChange={handleDimensionsChange}
              error={errors.dimensions}
            />

            <label className="form-field form-field--full">
              <span>Materiales</span>
              <input
                name="materials"
                value={formState.materials}
                onChange={handleChange}
                placeholder="Ej. algodón, forro textil"
                autoComplete="off"
                required
              />
              {errors.materials ? (
                <span className="field-error">{errors.materials}</span>
              ) : null}
            </label>

            <label className="form-field form-field--full">
              <span>Foto (URL)</span>
              <input
                name="photo"
                value={formState.photo}
                onChange={handleChange}
                placeholder="https://..."
                autoComplete="off"
                required
              />
              {errors.photo ? (
                <span className="field-error">{errors.photo}</span>
              ) : null}
            </label>

            <label className="form-field form-field--full">
              <span>Descripción</span>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                placeholder="Describe el producto en detalle"
                rows="4"
                required
              />
              {errors.description ? (
                <span className="field-error">{errors.description}</span>
              ) : null}
            </label>
          </div>

          <div className="form-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button className="button button-primary" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>
      ) : (
        <ProductVariantsTable
          productId={product._id}
          authToken={authToken}
          isActive={open && activeTab === "variants"}
        />
      )}
    </Modal>
  );
}
