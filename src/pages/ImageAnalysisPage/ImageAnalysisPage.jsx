import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.js";
import { analyzeBagImage } from "../../services/imageAnalysisService.js";
import "./ImageAnalysisPage.css";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function ConfidenceBar({ value }) {
  return (
    <div className="analysis-confidence-bar" aria-hidden="true">
      <span style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function TagList({ items, emptyMessage }) {
  if (!items?.length) {
    return <p className="analysis-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="analysis-tag-list">
      {items.map((item) => (
        <li key={`${item.name}-${item.confidence}`} className="analysis-tag">
          <div className="analysis-tag-header">
            <span className="analysis-tag-name">{item.name}</span>
            <span className="analysis-tag-confidence">{item.confidence}%</span>
          </div>
          <ConfidenceBar value={item.confidence} />
        </li>
      ))}
    </ul>
  );
}

function ColorList({ colors }) {
  if (!colors?.length) {
    return <p className="analysis-empty">No se detectaron colores dominantes.</p>;
  }

  return (
    <ul className="analysis-color-list">
      {colors.map((color) => (
        <li key={`${color.name}-${color.confidence}`} className="analysis-color-item">
          <span
            className="analysis-color-swatch"
            style={{
              backgroundColor: color.hexCode || "#e8e0f0",
            }}
            aria-hidden="true"
          />
          <div className="analysis-color-info">
            <span className="analysis-color-name">{color.name}</span>
            <span className="analysis-color-meta">
              {color.source === "dominant" ? "Dominante" : "Etiqueta"} · {color.confidence}%
              {color.hexCode ? ` · ${color.hexCode}` : ""}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AnalysisSection({ title, children }) {
  return (
    <section className="analysis-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ImageAnalysisPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.authToken);
  const userIsAdmin = useAuthStore((state) => state.currentUser?.isAdmin);

  const fileInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [showAllLabels, setShowAllLabels] = useState(false);

  useEffect(() => {
    if (!userIsAdmin) navigate("/");
  }, [userIsAdmin, navigate]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setError("");
    setAnalysis(null);

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
        event.target.value = "";
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("La imagen no puede superar 5 MB.");
        event.target.value = "";
        return;
      }
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleClearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setAnalysis(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!photoFile || !token) return;

    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await analyzeBagImage(token, photoFile);
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err.message || "No se pudo analizar la imagen.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!userIsAdmin) return null;

  return (
    <div className="image-analysis-page">
      <header className="analysis-header">
        <div>
          <span className="analysis-eyebrow">Herramienta admin</span>
          <h1>Análisis de imagen</h1>
          <p>
            Sube una foto de un bolso para detectar tipo, colores, material,
            accesorios y tamaño estimado mediante AI.
          </p>
        </div>
      </header>

      <section className="analysis-upload-card">
        <div className="analysis-upload-grid">
          <div className="analysis-upload-controls">
            <span className="analysis-field-label">Imagen del bolso</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhotoChange}
              aria-label="Subir imagen para análisis"
            />
            <div
              className={`analysis-preview-box${photoPreview ? " analysis-preview-box--filled" : ""}`}
            >
              {photoPreview ? (
                <>
                  <div className="analysis-preview-media">
                    <img src={photoPreview} alt="Vista previa del bolso" />
                  </div>
                  <button
                    type="button"
                    className="analysis-preview-clear"
                    onClick={handleClearPhoto}
                    aria-label="Quitar imagen"
                    title="Quitar imagen"
                  >
                    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
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
                <span className="analysis-preview-placeholder" aria-hidden="true">
                  Sin imagen
                </span>
              )}
            </div>
            <p className="analysis-upload-hint">
              Formatos: JPG, PNG, WEBP, GIF · Máximo 5 MB
            </p>
          </div>

          <div className="analysis-upload-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={handleAnalyze}
              disabled={!photoFile || isAnalyzing}
            >
              {isAnalyzing ? "Analizando…" : "Analizar imagen"}
            </button>
            {photoFile ? (
              <button
                type="button"
                className="button button-secondary"
                onClick={handleClearPhoto}
                disabled={isAnalyzing}
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </div>

        {error ? <p className="analysis-error">{error}</p> : null}
      </section>

      {isAnalyzing ? (
        <div className="analysis-loading" role="status">
          <div className="analysis-loading-spinner" aria-hidden="true" />
          <p>Procesando imagen con Rekognition…</p>
        </div>
      ) : null}

      {analysis ? (
        <div className="analysis-results">
          <div className="analysis-results-grid">
            <AnalysisSection title="Tipo de bolso">
              <TagList
                items={analysis.bagTypes}
                emptyMessage="No se identificó un tipo de bolso específico."
              />
            </AnalysisSection>

            <AnalysisSection title="Colores">
              <ColorList colors={analysis.colors} />
            </AnalysisSection>

            <AnalysisSection title="Material">
              <TagList
                items={analysis.materials}
                emptyMessage="No se detectó material con suficiente confianza."
              />
            </AnalysisSection>

            <AnalysisSection title="Tamaño estimado">
              <TagList
                items={analysis.size}
                emptyMessage="No se pudo estimar el tamaño."
              />
            </AnalysisSection>

            <AnalysisSection title="Accesorios y detalles">
              <TagList
                items={analysis.accessories}
                emptyMessage="No se detectaron accesorios o detalles."
              />
            </AnalysisSection>

            {analysis.imageInfo?.quality ? (
              <AnalysisSection title="Calidad de imagen">
                <ul className="analysis-quality-list">
                  <li>
                    <span>Brillo</span>
                    <strong>{analysis.imageInfo.quality.brightness}%</strong>
                  </li>
                  <li>
                    <span>Nitidez</span>
                    <strong>{analysis.imageInfo.quality.sharpness}%</strong>
                  </li>
                  <li>
                    <span>Contraste</span>
                    <strong>{analysis.imageInfo.quality.contrast}%</strong>
                  </li>
                </ul>
              </AnalysisSection>
            ) : null}
          </div>

          {analysis.allLabels?.length ? (
            <section className="analysis-section analysis-section--full">
              <div className="analysis-section-header">
                <h2>Todas las etiquetas detectadas</h2>
                <button
                  type="button"
                  className="button button-secondary analysis-toggle-labels"
                  onClick={() => setShowAllLabels((current) => !current)}
                >
                  {showAllLabels ? "Ocultar" : "Ver todas"}
                </button>
              </div>
              {showAllLabels ? (
                <ul className="analysis-labels-table">
                  {analysis.allLabels.map((label) => (
                    <li key={`${label.name}-${label.confidence}`}>
                      <span className="analysis-label-name">{label.name}</span>
                      <span className="analysis-label-confidence">
                        {label.confidence}%
                      </span>
                      {label.parents?.length ? (
                        <span className="analysis-label-parents">
                          {label.parents.join(" · ")}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="analysis-empty">
                  {analysis.allLabels.length} etiquetas detectadas. Pulsa &quot;Ver todas&quot; para el detalle.
                </p>
              )}
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
