import { useState } from "react";
import { EditProductModal } from "../../components/ProductAdmin/EditProductModal.jsx";
import { DeleteConfirmationModal } from "../../components/ProductAdmin/DeleteConfirmationModal.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";
import { useProductsStore } from "../../store/useProductsStore.js";
import {
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
} from "../../services/productService.js";
import { Link, useNavigate } from "react-router-dom";
import "./ProductPage.css";

const splitList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatDimensions = (value) => {
  const [width, height, depth] = value.replace(/\s*cm\s*$/i, "").split("x").map((part) => part.trim());

  return [
    width ? `Ancho: ${width} cm` : null,
    height ? `Alto: ${height} cm` : null,
    depth ? `Fondo: ${depth} cm` : null,
  ].filter(Boolean);
};

const formatDimensionLabel = (value) => {
  const match = value.match(/^([0-9]+(?:\.[0-9]+)?)\s*(cm)?$/i);

  if (match) {
    return `${match[1]} cm`;
  }

  return value;
};

const getColorHex = (colorName) => {
  const normalized = colorName.toLowerCase();

  if (normalized.includes("arena")) return "#d7c4aa";
  if (normalized.includes("crema")) return "#f4eadf";
  if (normalized.includes("terracota")) return "#c96d4f";
  if (normalized.includes("cacao")) return "#7b4a2b";
  if (normalized.includes("verde")) return "#8cab75";
  if (normalized.includes("salvia")) return "#a6b88e";
  if (normalized.includes("beige")) return "#ead8bb";
  if (normalized.includes("dorado")) return "#d9b85f";
  if (normalized.includes("moka")) return "#8c6145";
  if (normalized.includes("rosa")) return "#d9a7bc";
  if (normalized.includes("polvo")) return "#e0b9cf";
  if (normalized.includes("vainilla")) return "#f4e5b8";
  if (normalized.includes("oliva")) return "#8f9457";

  return "#b49bcf";
};

export function ProductPage({ product }) {
  const navigate = useNavigate();
  const updateProductLocal = useProductsStore((state) => state.updateProduct);
  const deleteProductLocal = useProductsStore((state) => state.deleteProduct);
  const isAdmin = useAuthStore((state) => state.currentUser?.isAdmin);
  const [isSaving, setIsSaving] = useState(false);

  const materialOptions = splitList(product.materials);
  const dimensionOptions = formatDimensions(product.dimensions);
  const colorOptions = splitList(product.color);

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(materialOptions[0] ?? "");
  const [selectedDimension, setSelectedDimension] = useState(dimensionOptions[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] ?? "");

  if (!product) {
    return (
      <section className="empty-state">
        <span className="eyebrow">Producto no encontrado</span>
        <h1>Ese producto no existe o ya no está disponible.</h1>
        <Link className="button button-primary" to="/catalog">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const handleSaveProduct = async (updates) => {
    setIsSaving(true);

    try {
      if (product._id) {
        const updatedProduct = await updateProductApi(product._id, {
          ...product,
          ...updates,
        });
        updateProductLocal(product.slug, updatedProduct);
      } else {
        updateProductLocal(product.slug, updates);
      }

      setIsEditingModalOpen(false);
    } catch (error) {
      console.error(error);
      alert(`No se pudo actualizar el producto: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async (productToDelete) => {
    setIsDeletingLoading(true);

    try {
      if (productToDelete._id) {
        await deleteProductApi(productToDelete._id);
      }

      deleteProductLocal(productToDelete.slug);
      setIsDeletingModalOpen(false);
      navigate("/catalog");
    } catch (error) {
      console.error(error);
      alert(`No se pudo eliminar el producto: ${error.message}`);
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const getImageUrl = (url) => {
  if (!url) return "";

  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/(.*?)\//);

    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  console.log(product);

  return url;
};

  return (
    <section className="product-detail-layout">
      <article
        className="product-detail-visual"
        aria-hidden={product.photo ? "false" : "true"}
      >
        {product.photo ? (
          <img src={getImageUrl(product.photo)} alt={`Imagen de ${product.name}`} />
        ) : (
          <span>{product.name.slice(0, 2).toUpperCase()}</span>
        )}
      </article>

      <article className="product-detail-card">
        <div className="product-detail-card-header">
          <span className="eyebrow">{product.category}</span>
          {isAdmin && (
            <div className="product-detail-admin-inline">
              <button
                className="button-admin-edit"
                type="button"
                onClick={() => setIsEditingModalOpen(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                Editar
              </button>
              <button
                className="button-admin-delete"
                type="button"
                onClick={() => setIsDeletingModalOpen(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>
        <h1>{product.name}</h1>
        <p className="product-code">Código: {(product.slug || product._id || "producto").toUpperCase()}</p>
        <p>{product.description}</p>

        <div className="product-options">
          <div className="product-dropdown">
            <label className="product-dropdown-label" htmlFor="material-select">
              Material
            </label>
            <select
              id="material-select"
              className="product-select"
              value={selectedMaterial}
              onChange={(event) => setSelectedMaterial(event.target.value)}
            >
              {materialOptions.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>

          <div className="product-dropdown">
            <label className="product-dropdown-label" htmlFor="dimension-select">
              Dimensiones
            </label>
            <select
              id="dimension-select"
              className="product-select"
              value={selectedDimension}
              onChange={(event) => setSelectedDimension(event.target.value)}
            >
              {dimensionOptions.map((dimension) => (
                <option key={dimension} value={dimension}>
                  {formatDimensionLabel(dimension)}
                </option>
              ))}
            </select>
          </div>

          <div className="product-color-picker">
            <span className="product-dropdown-label">Color</span>
            <div className="color-swatches" role="list" aria-label="Colores disponibles">
              {colorOptions.map((color) => {
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch${isSelected ? " is-selected" : ""}`}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Seleccionar color ${color}`}
                    aria-pressed={isSelected}
                    title={color}
                  >
                    <span
                      className="color-swatch-chip"
                      style={{ backgroundColor: getColorHex(color) }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            <p className="selected-color-label">{selectedColor}</p>
          </div>

          <div className="product-care">
            <span className="product-dropdown-label">Cuidado</span>
            <p>{product.care}</p>
          </div>
        </div>

        <div className="hero-actions">
          <Link className="button button-primary" to="/catalog">
            Cotizar
          </Link>
        </div>
      </article>

      <EditProductModal
        open={isEditingModalOpen}
        product={product}
        onClose={() => setIsEditingModalOpen(false)}
        onSave={handleSaveProduct}
      />

      <DeleteConfirmationModal
        open={isDeletingModalOpen}
        product={product}
        onClose={() => setIsDeletingModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingLoading}
      />
    </section>
  );
}
