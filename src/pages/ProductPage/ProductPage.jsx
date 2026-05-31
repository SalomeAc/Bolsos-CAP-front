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

const splitList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .map((v) => String(v).trim())
      .filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const mergeLists = (...values) =>
  values.flatMap((value) => splitList(value)).filter(Boolean);

const formatDimensions = (value) => {
  // value can be an array of dimension strings or a single string like '20 x 15 x 6 cm'
  const toParts = (v) => {
    if (!v) return [];
    const cleaned = String(v).replace(/\s*cm\s*$/i, "");
    const [width, height, depth] = cleaned
      .split("x")
      .map((part) => part.trim());
    return [
      width ? `Ancho: ${width} cm` : null,
      height ? `Alto: ${height} cm` : null,
      depth ? `Fondo: ${depth} cm` : null,
    ].filter(Boolean);
  };

  if (Array.isArray(value)) {
    return value.map((v) => toParts(v).join(" — "));
  }

  return toParts(value);
};

const formatDimensionLabel = (value) => {
  const normalizedValue = Array.isArray(value)
    ? value.join(" x ")
    : String(value);
  const match = normalizedValue.match(/^([0-9]+(?:\.[0-9]+)?)\s*(cm)?$/i);

  if (match) {
    return `${match[1]} cm`;
  }

  return normalizedValue;
};

const getColorHex = (colorName) => {
  const normalized = String(
    Array.isArray(colorName) ? colorName.join(" ") : colorName,
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const colorMap = {
    negro: "#000000",
    blanco: "#ffffff",
    gris: "#808080",
    plata: "#c0c0c0",
    azul: "#1f5aa6",
    celeste: "#8ecae6",
    rojo: "#d62828",
    naranja: "#f77f00",
    amarillo: "#fcbf49",
    verde: "#2f855a",
    marron: "#7b4a2b",
    cafe: "#7b4a2b",
    cacao: "#7b4a2b",
    beige: "#ead8bb",
    crema: "#f4eadf",
    arena: "#d7c4aa",
    terracota: "#c96d4f",
    dorado: "#d9b85f",
    moka: "#8c6145",
    rosa: "#d9a7bc",
    polvo: "#e0b9cf",
    vainilla: "#f4e5b8",
    oliva: "#8f9457",
    salvia: "#a6b88e",
    lila: "#a299c1",
  };

  const exactMatch = colorMap[normalized];
  if (exactMatch) return exactMatch;

  if (normalized.includes("arena")) return colorMap.arena;
  if (normalized.includes("crema")) return colorMap.crema;
  if (normalized.includes("terracota")) return colorMap.terracota;
  if (normalized.includes("cacao")) return colorMap.cacao;
  if (normalized.includes("verde")) return colorMap.verde;
  if (normalized.includes("salvia")) return colorMap.salvia;
  if (normalized.includes("beige")) return colorMap.beige;
  if (normalized.includes("dorado")) return colorMap.dorado;
  if (normalized.includes("moka")) return colorMap.moka;
  if (normalized.includes("rosa")) return colorMap.rosa;
  if (normalized.includes("polvo")) return colorMap.polvo;
  if (normalized.includes("vainilla")) return colorMap.vainilla;
  if (normalized.includes("oliva")) return colorMap.oliva;

  return "#b8b8b8";
};

const getColorText = (colorName) => {
  if (Array.isArray(colorName)) {
    return colorName.filter(Boolean).join(", ");
  }

  return String(colorName || "");
};

export function ProductPage({ product }) {
  const navigate = useNavigate();
  const updateProductLocal = useProductsStore((state) => state.updateProduct);
  const deleteProductLocal = useProductsStore((state) => state.deleteProduct);
  const isAdmin = useAuthStore((state) => state.currentUser?.isAdmin);
  const authToken = useAuthStore((state) => state.authToken);
  const [isSaving, setIsSaving] = useState(false);

  console.log("PRODUCT RAW:", product);

  const materialOptions = splitList(product.materials);
  const dimensionOptions = splitList(product.dimensions || product.dimension);
  console.log(
    "DIMENSION OPTIONS RAW:",
    product.dimensions || product.dimension,
  );
  const colorOptions = mergeLists(product.color, product.colors);

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(
    materialOptions[0] ?? "",
  );
  const [selectedDimension, setSelectedDimension] = useState(
    dimensionOptions[0] ?? "",
  );
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
        const updatedProduct = await updateProductApi(
          product._id,
          {
            ...product,
            ...updates,
          },
          authToken,
        );
        updateProductLocal(product.code || product._id, updatedProduct);
      } else {
        updateProductLocal(product.code || product._id, updates);
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
        await deleteProductApi(productToDelete._id, authToken);
      }

      deleteProductLocal(productToDelete.code || productToDelete._id);
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

    // Si ya viene en formato correcto
    if (url.includes("uc?export=view&id=")) {
      return url;
    }

    // Links tipo file/d/ID/view
    const fileMatch = url.match(/\/d\/([^/]+)/);

    if (fileMatch?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
    }

    return url;
  };

  return (
    <section className="product-detail-layout">
      <article
        className="product-detail-visual"
        aria-hidden={product.photo ? "false" : "true"}
      >
        {product.photo ? (
          <img
            src={getImageUrl(product.photo)}
            alt={product.name}
            onError={(e) => {
              console.log("ERROR CARGANDO:", product.photo);
              console.log("URL FINAL:", getImageUrl(product.photo));
            }}
          />
        ) : (
          <span>{product.name.slice(0, 2).toUpperCase()}</span>
        )}
      </article>

      <article className="product-detail-card">
        <div className="product-detail-card-header">
          <span className="eyebrow">{product.type}</span>
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
        <p className="product-code">
          Código: {(product.code || product._id || "producto").toUpperCase()}
        </p>
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
            <label
              className="product-dropdown-label"
              htmlFor="dimension-select"
            >
              Dimensiones
            </label>
            <select
              id="dimension-select"
              className="product-select"
              value={selectedDimension}
              onChange={(event) => setSelectedDimension(event.target.value)}
            >
              {dimensionOptions.map((dimension) => {
                const dimensionValue = Array.isArray(dimension)
                  ? dimension.join(" x ")
                  : String(dimension);

                return (
                  <option key={dimensionValue} value={dimensionValue}>
                    {formatDimensionLabel(dimensionValue)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="product-color-picker">
            <span className="product-dropdown-label">Color</span>
            {colorOptions.length > 0 ? (
              <>
                <div
                  className="color-swatches"
                  role="list"
                  aria-label="Colores disponibles"
                >
                  {colorOptions.map((color) => {
                    const colorLabel = getColorText(color);
                    const isSelected = selectedColor === colorLabel;

                    return (
                      <button
                        key={colorLabel}
                        type="button"
                        className={`color-swatch color-swatch--labeled${isSelected ? " is-selected" : ""}`}
                        onClick={() => {
                          setSelectedColor(colorLabel);
                        }}
                        aria-label={`Seleccionar color ${colorLabel}`}
                        aria-pressed={isSelected}
                        title={colorLabel}
                      >
                        <span
                          className="color-swatch-chip"
                          style={{ backgroundColor: getColorHex(colorLabel) }}
                          aria-hidden="true"
                        />
                        <span className="color-swatch-label">{colorLabel}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="selected-color-label">
                  {selectedColor || colorOptions[0]}
                </p>
              </>
            ) : (
              <p className="selection-empty-state">
                No hay colores disponibles.
              </p>
            )}
          </div>
        </div>

        <div className="hero-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }

              navigate("/catalog");
            }}
          >
            Volver
          </button>
          {!isAdmin && (
            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                const payload = {
                  productId: product._id || product.id,
                  code: product.code || product.slug,
                  name: product.name,
                  type: product.type,
                  price: product.price,
                  photo: product.photo,
                  category: product.category,
                  materials: product.materials,
                  colors: product.colors,
                  dimensions: product.dimensions,
                  selectedMaterial,
                  selectedDimension,
                  selectedColor: selectedColor || colorOptions[0] || "",
                };

                if (!authToken) {
                  navigate("/login");
                  return;
                }

                navigate("/quotation-summary", {
                  state: {
                    summary: payload,
                  },
                });
              }}
            >
              Realizar cotización
            </button>
          )}
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
