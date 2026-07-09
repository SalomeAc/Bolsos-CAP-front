import { useEffect, useRef, useState } from "react";
import { Modal } from "../Modal/Modal.jsx";
import { ProductVariantsTable } from "./ProductVariantsTable.jsx";
import { DimensionsEditor } from "./DimensionsEditor.jsx";
import { DeletePhotoConfirmationModal } from "./DeletePhotoConfirmationModal.jsx";
import { validateDimensionsValue } from "./dimensionsUtils.js";
import {
  deleteProductPhoto,
  updateProductForm,
} from "../../services/productService.js";
import "./EditProductModal.css";
import "./CreateProductModal.css";
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

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function EditProductModal({
  open,
  product,
  authToken,
  onClose,
  onSave,
  onProductUpdate,
}) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("details");
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    color: "",
    dimensions: "",
    materials: "",
    type: "",
  });
  const [errors, setErrors] = useState(initialErrors);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState(null);
  const [isDeletePhotoModalOpen, setIsDeletePhotoModalOpen] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
    });
    setCurrentPhotoUrl(product.photo || "");
    setNewPhotoFile(null);
    setNewPhotoPreview(null);
    setErrors(initialErrors);
    setIsDeletePhotoModalOpen(false);
    setIsDeletingPhoto(false);
    setIsSubmitting(false);
    setSubmitError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, product]);

  useEffect(() => {
    return () => {
      if (newPhotoPreview) {
        URL.revokeObjectURL(newPhotoPreview);
      }
    };
  }, [newPhotoPreview]);

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

    if (!currentPhotoUrl.trim() && !newPhotoFile) {
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

    if (newPhotoPreview) {
      URL.revokeObjectURL(newPhotoPreview);
    }

    setNewPhotoFile(file);
    setNewPhotoPreview(file ? URL.createObjectURL(file) : null);
    setErrors((current) => ({ ...current, photo: "" }));
    setSubmitError("");
  };

  const handleClearNewPhoto = () => {
    if (newPhotoPreview) {
      URL.revokeObjectURL(newPhotoPreview);
    }

    setNewPhotoFile(null);
    setNewPhotoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmDeletePhoto = async () => {
    if (!product?._id || !authToken) {
      return;
    }

    setIsDeletingPhoto(true);
    setSubmitError("");

    try {
      const updatedProduct = await deleteProductPhoto(product._id, authToken);
      setCurrentPhotoUrl(updatedProduct.photo || "");
      onProductUpdate?.(updatedProduct);
      setIsDeletePhotoModalOpen(false);
    } catch (error) {
      setSubmitError(error.message || "No se pudo eliminar la imagen.");
      setIsDeletePhotoModalOpen(false);
    } finally {
      setIsDeletingPhoto(false);
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

    if (!product?._id || !authToken) {
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

      if (newPhotoFile) {
        formData.append("photo", newPhotoFile);
      }

      const updatedProduct = await updateProductForm(product._id, formData, authToken);
      onSave?.(updatedProduct);
    } catch (error) {
      setSubmitError(error.message || "No se pudo actualizar el producto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  const modalClassName = [
    "edit-product-modal",
    activeTab === "variants" ? "edit-product-modal--wide" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const showCurrentPhoto = Boolean(currentPhotoUrl) && !newPhotoPreview;
  const needsNewPhoto = !currentPhotoUrl.trim();

  return (
    <>
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

              <div className="form-field form-field--full">
                <span>Foto</span>

                {showCurrentPhoto ? (
                  <div className="edit-product-photo-preview">
                    <div className="photo-preview-slot">
                      <div className="photo-preview-box photo-preview-box--filled">
                        <div className="photo-preview-media">
                          <img
                            src={currentPhotoUrl}
                            alt={`Vista previa de ${formState.name || "producto"}`}
                          />
                        </div>
                        <button
                          type="button"
                          className="photo-preview-clear edit-product-photo__clear"
                          onClick={() => setIsDeletePhotoModalOpen(true)}
                          disabled={isDeletingPhoto || isSubmitting}
                          aria-label="Eliminar imagen"
                          title="Eliminar imagen"
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
                      </div>
                    </div>
                  </div>
                ) : null}

                {needsNewPhoto || newPhotoPreview ? (
                  <div className="edit-product-photo-upload">
                    {needsNewPhoto ? (
                      <p className="form-field__hint">
                        Sube una nueva imagen para este producto.
                      </p>
                    ) : null}

                    <div className="photo-upload-row">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        aria-label="Subir nueva imagen del producto"
                      />
                      {newPhotoPreview ? (
                        <div className="photo-preview-slot">
                          <div className="photo-preview-box photo-preview-box--filled">
                            <div className="photo-preview-media">
                              <img
                                src={newPhotoPreview}
                                alt="Vista previa de la nueva imagen"
                              />
                            </div>
                            <button
                              type="button"
                              className="photo-preview-clear edit-product-photo__clear"
                              onClick={handleClearNewPhoto}
                              aria-label="Quitar nueva imagen"
                              title="Quitar nueva imagen"
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
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}


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
              <button
                className="button button-primary"
                type="submit"
                disabled={isSubmitting || isDeletingPhoto}
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
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

      <DeletePhotoConfirmationModal
        open={isDeletePhotoModalOpen}
        productName={formState.name || product.name}
        onClose={() => setIsDeletePhotoModalOpen(false)}
        onConfirm={handleConfirmDeletePhoto}
        isLoading={isDeletingPhoto}
      />
    </>
  );
}
