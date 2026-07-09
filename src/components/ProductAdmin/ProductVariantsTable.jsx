import { useCallback, useEffect, useState } from "react";
import {
  deleteProductVariant,
  fetchProductVariants,
  saveProductVariants,
  syncProductVariants,
} from "../../services/productVariantService.js";
import { DeleteVariantConfirmationModal } from "./DeleteVariantConfirmationModal.jsx";
import { VariantDescriptionModal } from "./VariantDescriptionModal.jsx";
import "./ProductVariantsTable.css";

const emptyVariant = {
  totalPrice: 0,
  materialPrice: 0,
  workHours: 6,
};

export function ProductVariantsTable({ productId, authToken, isActive }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState(null);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [variantToDescribe, setVariantToDescribe] = useState(null);
  const [savingDescriptionVariantId, setSavingDescriptionVariantId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadVariants = useCallback(async () => {
    if (!productId || !authToken) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchProductVariants(productId, authToken, {
        sync: false,
      });
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las variantes.");
    } finally {
      setLoading(false);
    }
  }, [productId, authToken]);

  useEffect(() => {
    if (isActive) {
      loadVariants();
    }
  }, [isActive, loadVariants]);

  const handleFieldChange = (index, field, value) => {
    setVariants((current) =>
      current.map((variant, idx) =>
        idx === index
          ? {
              ...variant,
              [field]: value === "" ? 0 : Number(value),
            }
          : variant,
      ),
    );
    setSuccess("");
  };

  const handleSync = async () => {
    if (!productId || !authToken) return;

    setSyncing(true);
    setError("");
    setSuccess("");

    try {
      const result = await syncProductVariants(productId, authToken);
      setVariants(Array.isArray(result?.variants) ? result.variants : []);
      setSuccess("Combinaciones sincronizadas.");
    } catch (err) {
      setError(err.message || "No se pudieron sincronizar las variantes.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteRequest = (variant) => {
    if (!variant?._id) return;
    setVariantToDelete(variant);
  };

  const handleCloseDeleteModal = () => {
    if (deletingVariantId) return;
    setVariantToDelete(null);
  };

  const handleConfirmDelete = async (variant) => {
    if (!productId || !authToken || !variant?._id) return;

    setDeletingVariantId(variant._id);
    setError("");
    setSuccess("");

    try {
      await deleteProductVariant(productId, variant._id, authToken);
      setVariants((current) =>
        current.filter((item) => item._id !== variant._id),
      );
      setSuccess("Variante eliminada correctamente.");
      setVariantToDelete(null);
    } catch (err) {
      setError(err.message || "No se pudo eliminar la variante.");
    } finally {
      setDeletingVariantId(null);
    }
  };

  const handleOpenDescriptionModal = (variant) => {
    if (!variant?._id) return;

    const latestVariant =
      variants.find((item) => String(item._id) === String(variant._id)) ??
      variant;

    setVariantToDescribe(latestVariant);
  };

  const handleCloseDescriptionModal = () => {
    if (savingDescriptionVariantId) return;
    setVariantToDescribe(null);
  };

  const handleSaveDescription = async (variant, descriptionImagen) => {
    if (!productId || !authToken || !variant?._id) return;

    setSavingDescriptionVariantId(variant._id);
    setError("");
    setSuccess("");

    try {
      const payload = [
        {
          _id: variant._id,
          color: variant.color,
          material: variant.material,
          dimensions: variant.dimensions,
          totalPrice: Number(variant.totalPrice ?? 0),
          materialPrice: Number(variant.materialPrice ?? 0),
          workHours: Number(variant.workHours ?? 6),
          descriptionImagen: descriptionImagen || null,
        },
      ];

      const updated = await saveProductVariants(productId, payload, authToken);
      const savedVariant = Array.isArray(updated)
        ? updated.find((item) => String(item._id) === String(variant._id))
        : null;

      setVariants((current) =>
        current.map((item) =>
          item._id === variant._id
            ? {
                ...item,
                descriptionImagen:
                  (savedVariant?.descriptionImagen ?? descriptionImagen) || null,
              }
            : item,
        ),
      );
      setSuccess("Descripción de imagen guardada.");
      setVariantToDescribe(null);
    } catch (err) {
      setError(err.message || "No se pudo guardar la descripción de imagen.");
    } finally {
      setSavingDescriptionVariantId(null);
    }
  };

  const handleSave = async () => {
    if (!productId || !authToken) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = variants.map((variant) => ({
        _id: variant._id,
        color: variant.color,
        material: variant.material,
        dimensions: variant.dimensions,
        totalPrice: Number(variant.totalPrice ?? 0),
        materialPrice: Number(variant.materialPrice ?? 0),
        workHours: Number(variant.workHours ?? 6),
        descriptionImagen: variant.descriptionImagen ?? null,
      }));

      const updated = await saveProductVariants(productId, payload, authToken);
      setVariants(Array.isArray(updated) ? updated : variants);
      setSuccess("Variantes guardadas correctamente.");
    } catch (err) {
      setError(err.message || "No se pudieron guardar las variantes.");
    } finally {
      setSaving(false);
    }
  };

  if (!productId) {
    return (
      <p className="variants-table__empty">
        Guarda el producto primero para gestionar variantes y precios.
      </p>
    );
  }

  return (
    <div className="variants-table">
      <div className="variants-table__toolbar">
        <p>
          Define el precio total, el precio del material y las horas de trabajo
          para cada combinación de color, material y dimensiones.
        </p>
        <div className="variants-table__actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={handleSync}
            disabled={syncing || loading}
          >
            {syncing ? "Sincronizando..." : "Sincronizar combinaciones"}
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={handleSave}
            disabled={saving || loading || variants.length === 0}
          >
            {saving ? "Guardando..." : "Guardar variantes"}
          </button>
        </div>
      </div>

      {error ? <p className="variants-table__feedback variants-table__feedback--error">{error}</p> : null}
      {success ? (
        <p className="variants-table__feedback variants-table__feedback--success">{success}</p>
      ) : null}

      {loading ? (
        <p className="variants-table__empty">Cargando variantes...</p>
      ) : variants.length === 0 ? (
        <p className="variants-table__empty">
          No hay variantes. Usa &quot;Sincronizar combinaciones&quot; para
          generarlas a partir de los colores, materiales y dimensiones del
          producto.
        </p>
      ) : (
        <div className="variants-table__scroll">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Color</th>
                <th>Material</th>
                <th>Dimensiones</th>
                <th>Precio total</th>
                <th>Precio material</th>
                <th>Horas trabajo</th>
                <th>Desc. imagen</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={variant._id || `${variant.sku}-${index}`}>
                  <td>{variant.sku || "—"}</td>
                  <td>{variant.color}</td>
                  <td>{variant.material}</td>
                  <td>{variant.dimensions}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={variant.totalPrice ?? emptyVariant.totalPrice}
                      onChange={(event) =>
                        handleFieldChange(index, "totalPrice", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={variant.materialPrice ?? emptyVariant.materialPrice}
                      onChange={(event) =>
                        handleFieldChange(index, "materialPrice", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={variant.workHours ?? emptyVariant.workHours}
                      onChange={(event) =>
                        handleFieldChange(index, "workHours", event.target.value)
                      }
                    />
                  </td>
                  <td className="variants-table__icon-cell">
                    <button
                      type="button"
                      className={`variants-table__description-btn${
                        variant.descriptionImagen ? " has-description" : ""
                      }`}
                      onClick={() => handleOpenDescriptionModal(variant)}
                      disabled={saving || syncing || loading}
                      aria-label={
                        variant.descriptionImagen
                          ? `Editar descripción de imagen de ${variant.sku || "variante"}`
                          : `Agregar descripción de imagen de ${variant.sku || "variante"}`
                      }
                      title={
                        variant.descriptionImagen
                          ? "Editar descripción de imagen"
                          : "Agregar descripción de imagen"
                      }
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </button>
                  </td>
                  <td className="variants-table__actions-cell">
                    <button
                      type="button"
                      className="button button-danger variants-table__delete"
                      onClick={() => handleDeleteRequest(variant)}
                      disabled={
                        deletingVariantId === variant._id ||
                        saving ||
                        syncing ||
                        loading
                      }
                      aria-label={`Eliminar variante ${variant.sku || index + 1}`}
                    >
                      {deletingVariantId === variant._id
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <DeleteVariantConfirmationModal
        open={Boolean(variantToDelete)}
        variant={variantToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={Boolean(deletingVariantId)}
      />
      <VariantDescriptionModal
        key={variantToDescribe?._id ?? "variant-description-closed"}
        open={Boolean(variantToDescribe)}
        variant={variantToDescribe}
        onClose={handleCloseDescriptionModal}
        onSave={handleSaveDescription}
        isLoading={Boolean(savingDescriptionVariantId)}
      />
    </div>
  );
}
