import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomQuotationForm } from "../../services/quotationService.js";
import { useAuthStore } from "../../store/useAuthStore.js";
import "./CotizarPage.css";

const REQUIRED_ERROR = "Este campo es obligatorio y no puede estar vacío";

const initialFormState = {
  dimensions: "",
  color: "#d4c2ff",
  material: "",
  observaciones: "",
};

const initialErrors = {
  dimensions: "",
  color: "",
  material: "",
};

export function CotizarPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.authToken);
  const isAdmin = useAuthStore((state) => state.currentUser?.isAdmin);

  const colorInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrors);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleColorChange = (event) => {
    setFormState((current) => ({ ...current, color: event.target.value }));
    setErrors((current) => ({ ...current, color: "" }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setSubmitError("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
        event.target.value = "";
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setSubmitError("La imagen no puede superar 5 MB.");
        event.target.value = "";
        return;
      }
    }

    setSubmitError("");

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
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

  const validate = () => {
    const nextErrors = { ...initialErrors };

    if (!formState.dimensions.trim()) {
      nextErrors.dimensions = REQUIRED_ERROR;
    }

    if (!formState.color.trim()) {
      nextErrors.color = REQUIRED_ERROR;
    }

    if (!formState.material.trim()) {
      nextErrors.material = REQUIRED_ERROR;
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const nextErrors = validate();
    const hasErrors = Object.values(nextErrors).some(Boolean);

    if (hasErrors) {
      setErrors(nextErrors);
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("dimensions", formState.dimensions.trim());
      formData.append("color", formState.color);
      formData.append("material", formState.material.trim());

      const observaciones = formState.observaciones.trim();
      if (observaciones) {
        formData.append("observaciones", observaciones);
      }

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const createdQuotation = await createCustomQuotationForm(formData, token);
      const quotationId = createdQuotation?._id || createdQuotation?.id;

      navigate("/mis-cotizaciones", {
        replace: true,
        state: { selectedQuotationId: quotationId },
      });
    } catch (error) {
      setSubmitError(error.message || "No se pudo enviar la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmin) {
    navigate("/cotizaciones", { replace: true });
    return null;
  }

  return (
    <section className="cotizar-layout">
      <article className="cotizar-card">
        <span className="eyebrow">Cotizaciones</span>
        <h1>Cotizar bolso personalizado</h1>
        <p>
          Cuéntanos cómo quieres tu bolso. Revisaremos tu solicitud y te
          responderemos por Mis Cotizaciones.
        </p>

        <form className="cotizar-form" onSubmit={handleSubmit} noValidate>
          <div className="cotizar-form-grid">
            {/* Dimensiones */}
            <label className="cotizar-field">
              <span className="cotizar-field-label">Dimensiones *</span>
              <input
                type="text"
                name="dimensions"
                value={formState.dimensions}
                onChange={handleChange}
                placeholder="largo x ancho x alto"
                className={errors.dimensions ? "input--error" : ""}
                autoComplete="off"
              />
              {errors.dimensions ? (
                <span className="field-error">{errors.dimensions}</span>
              ) : null}
            </label>

            {/* Material */}
            <label className="cotizar-field">
              <span className="cotizar-field-label">Material *</span>
              <input
                type="text"
                name="material"
                value={formState.material}
                onChange={handleChange}
                placeholder="Lana"
                className={errors.material ? "input--error" : ""}
                autoComplete="off"
              />
              {errors.material ? (
                <span className="field-error">{errors.material}</span>
              ) : null}
            </label>

            {/* Color */}
            <div className="cotizar-field">
              <span className="cotizar-field-label">Color *</span>
              <div
                className={`color-picker-wrapper${errors.color ? " input--error" : ""}`}
              >
                <input
                  ref={colorInputRef}
                  type="color"
                  name="color"
                  value={formState.color}
                  onChange={handleColorChange}
                  className="color-picker-input"
                  aria-label="Seleccionar color"
                />
                <button
                  type="button"
                  className="color-picker-trigger"
                  onClick={() => colorInputRef.current?.click()}
                  aria-label="Abrir selector de color"
                >
                  <span
                    className="color-picker-swatch"
                    style={{ backgroundColor: formState.color }}
                    aria-hidden="true"
                  />
                  <span className="color-picker-hint">Toca para elegir color</span>
                </button>
              </div>
              {errors.color ? (
                <span className="field-error">{errors.color}</span>
              ) : null}
            </div>

            {/* Foto (opcional) */}
            <div className="cotizar-field">
              <span className="cotizar-field-label">
                Foto <span>(opcional)</span>
              </span>
              <div className="photo-upload-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  aria-label="Subir foto de referencia"
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
            </div>

            {/* Observaciones (opcional) + micrófono */}
            <div className="cotizar-field cotizar-field--full">
              <span className="cotizar-field-label">
                Observaciones <span>(opcional)</span>
              </span>
              <div className="observaciones-row">
                <textarea
                  name="observaciones"
                  value={formState.observaciones}
                  onChange={handleChange}
                  placeholder="Detalles adicionales sobre tu bolso..."
                  rows={4}
                />
                <button
                  type="button"
                  className="mic-button"
                  aria-label="Dictar observaciones (próximamente)"
                  title="Dictado por voz (próximamente)"
                  disabled
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {submitError ? (
            <p className="submit-error" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="cotizar-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigate("/mis-cotizaciones")}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              className="button button-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}