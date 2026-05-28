import { useEffect, useState } from "react";
import { Modal } from "../Modal/Modal.jsx";
import "./CreateProductModal.css";

const initialFormState = {
  name: "",
  description: "",
  color: "",
  dimensions: "",
  materials: "",
  type: "",
  photo: "",
};

const initialErrors = {
  name: "",
  description: "",
  color: "",
  dimensions: "",
  materials: "",
  type: "",
  photo: "",
};

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function CreateProductModal({ open, onClose, onCreate }) {
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrors);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(initialFormState);
    setErrors(initialErrors);
  }, [open]);

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

    if (!formState.dimensions.trim()) {
      nextErrors.dimensions = "Las dimensiones son obligatorias.";
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  function transformDriveUrl(url) {
  const match = url.match(/\/d\/([^/]+)/);

  if (!match) {
    return url;
  }

  return `https://drive.google.com/uc?export=view&id=${match[1]}`;
}

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate();
    const invalidFields = Object.values(nextErrors).filter(Boolean);

    if (invalidFields.length > 0) {
      setErrors(nextErrors);
      return;
    }

    const slug = slugify(formState.name);
    const newProduct = {
      slug: slug || `producto-${Date.now()}`,
      name: formState.name.trim(),
      description: formState.description.trim(),
      color: formState.color.trim(),
      dimensions: formState.dimensions.trim(),
      materials: formState.materials.trim(),
      type: formState.type.trim(),
      photo: transformDriveUrl(formState.photo.trim()),
    };

    onCreate(newProduct);
  };

  return (
    <Modal
      open={open}
      title="Crear nuevo producto"
      description="Registra un producto nuevo en el catálogo. Todos los campos son obligatorios y la imagen debe usar una URL válida."
      onClose={onClose}
    >
      <form className="create-product-form" onSubmit={handleSubmit} noValidate>
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

          <label className="form-field">
            <span>Color</span>
            <input
              name="color"
              value={formState.color}
              onChange={handleChange}
              placeholder="Ej. beige, terracota"
              autoComplete="off"
              required
            />
            {errors.color ? (
              <span className="field-error">{errors.color}</span>
            ) : null}
          </label>

          <label className="form-field">
            <span>Dimensiones</span>
            <input
              name="dimensions"
              value={formState.dimensions}
              onChange={handleChange}
              placeholder="Ej. 26 x 22 x 8 cm"
              autoComplete="off"
              required
            />
            {errors.dimensions ? (
              <span className="field-error">{errors.dimensions}</span>
            ) : null}
          </label>

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
            Agregar producto
          </button>
        </div>
      </form>
    </Modal>
  );
}
