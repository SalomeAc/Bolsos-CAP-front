import { useEffect, useRef, useState } from "react";
import { Modal } from "../Modal/Modal.jsx";
import { DimensionsEditor } from "./DimensionsEditor.jsx";
import { validateDimensionsValue } from "./dimensionsUtils.js";
import { createProductForm } from "../../services/productService.js";
import "./CreateProductModal.css";
import "./DimensionsEditor.css";

const initialFormState = {
  name: "",
  description: "",
  color: "",
  dimensions: "",
  materials: "",
  type: "",
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

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function CreateProductModal({ open, onClose, authToken, onCreated }) {
  const fileInputRef = useRef(null);
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrors);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(initialFormState);
    setErrors(initialErrors);
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsSubmitting(false);
    setSubmitError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

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

    if (!photoFile) {
      nextErrors.photo = "Debes subir una imagen del producto.";
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

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrors((current) => ({
          ...current,
          photo: "Solo se permiten imágenes JPG, PNG, WEBP o GIF.",
        }));
        event.target.value = "";
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setErrors((current) => ({
          ...current,
          photo: "La imagen no puede superar 5 MB.",
        }));
        event.target.value = "";
        return;
      }
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
    setErrors((current) => ({ ...current, photo: "" }));
  };

  const handleClearPhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(null);
    setPhotoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const nextErrors = validate();
    const invalidFields = Object.values(nextErrors).filter(Boolean);

    if (invalidFields.length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!authToken) {
      setSubmitError("Debes iniciar sesión como administradora.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", formState.name.trim());
      formData.append("description", formState.description.trim());
      formData.append("color", formState.color.trim());
      formData.append("dimensions", formState.dimensions.trim());
      formData.append("materials", formState.materials.trim());
      formData.append("type", formState.type.trim());
      formData.append("photo", photoFile);

      const createdProduct = await createProductForm(formData, authToken);
      onCreated?.(createdProduct);
    } catch (error) {
      setSubmitError(error.message || "No se pudo crear el producto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Crear nuevo producto"
      description="Registra un producto nuevo en el catálogo. Todos los campos son obligatorios, incluida la imagen."
      onClose={onClose}
      className="create-product-modal"
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

          <div className="form-field form-field--full">
            <span>Foto</span>
            <div className="photo-upload-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                aria-label="Subir imagen del producto"
                required
              />
              <div className="photo-preview-slot">
                <div
                  className={`photo-preview-box${photoPreview ? " photo-preview-box--filled" : ""}`}
                  aria-label={
                    photoPreview
                      ? "Vista previa de la imagen cargada"
                      : "Sin imagen cargada"
                  }
                >
                  {photoPreview ? (
                    <>
                      <div className="photo-preview-media">
                        <img src={photoPreview} alt="" />
                      </div>
                      <button
                        type="button"
                        className="photo-preview-clear"
                        onClick={handleClearPhoto}
                        aria-label="Quitar foto"
                        title="Quitar foto"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          width="10"
                          height="10"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 2l8 8M10 2L2 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <span className="photo-preview-placeholder" aria-hidden="true">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>
            {errors.photo ? (
              <span className="field-error">{errors.photo}</span>
            ) : null}
          </div>

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

        {submitError ? (
          <span className="field-error">{submitError}</span>
        ) : null}

        <div className="form-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Agregando..." : "Agregar producto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
