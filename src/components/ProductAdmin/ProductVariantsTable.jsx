import { useCallback, useEffect, useState } from "react";
import {
  fetchProductVariants,
  saveProductVariants,
  syncProductVariants,
} from "../../services/productVariantService.js";
import "./ProductVariantsTable.css";

const emptyVariant = {
  precio_total: 0,
  precio_material: 0,
  horas_trabajo: 0,
};

export function ProductVariantsTable({ productId, authToken, isActive }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadVariants = useCallback(async () => {
    if (!productId || !authToken) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchProductVariants(productId, authToken, {
        sync: true,
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
        precio_total: Number(variant.precio_total ?? 0),
        precio_material: Number(variant.precio_material ?? 0),
        horas_trabajo: Number(variant.horas_trabajo ?? 0),
      }));

      const updated = await saveProductVariants(productId, payload, authToken);
      setVariants(Array.isArray(updated) ? updated : variants);
      setSuccess("Precios guardados correctamente.");
    } catch (err) {
      setError(err.message || "No se pudieron guardar los precios.");
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
          Define el precio total, precio del material y horas de trabajo para
          cada combinación de color, material y dimensiones.
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
            {saving ? "Guardando..." : "Guardar precios"}
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
                      value={variant.precio_total ?? emptyVariant.precio_total}
                      onChange={(event) =>
                        handleFieldChange(index, "precio_total", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={variant.precio_material ?? emptyVariant.precio_material}
                      onChange={(event) =>
                        handleFieldChange(index, "precio_material", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={variant.horas_trabajo ?? emptyVariant.horas_trabajo}
                      onChange={(event) =>
                        handleFieldChange(index, "horas_trabajo", event.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
