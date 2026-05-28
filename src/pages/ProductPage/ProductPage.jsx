import { useState } from "react";
import { ProductCard } from "../../components/ProductCard/ProductCard.jsx";
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

export function ProductPage({ product }) {
  const navigate = useNavigate();
  const updateProductLocal = useProductsStore((state) => state.updateProduct);
  const deleteProductLocal = useProductsStore((state) => state.deleteProduct);
  const isAdmin = useAuthStore((state) => state.currentUser?.isAdmin);

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <section className="product-detail-layout">
      <article
        className="product-detail-visual"
        aria-hidden={product.image ? "false" : "true"}
      >
        {product.image ? (
          <img src={product.image} alt={`Imagen de ${product.name}`} />
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
        <p className="price-tag">{product.price}</p>
        <p>{product.description}</p>

        <dl className="product-specs">
          <div>
            <dt>Materiales</dt>
            <dd>{product.materials}</dd>
          </div>
          <div>
            <dt>Colores</dt>
            <dd>{product.colors}</dd>
          </div>
          <div>
            <dt>Dimensiones</dt>
            <dd>{product.dimensions}</dd>
          </div>
          <div>
            <dt>Cuidados</dt>
            <dd>{product.care}</dd>
          </div>
        </dl>

        <div className="hero-actions">
          <Link className="button button-primary" to="/catalog">
            Volver al catálogo
          </Link>
          <Link className="button button-secondary" to="/profile">
            Ver perfil
          </Link>
        </div>
      </article>

      <aside className="related-panel">
        <span className="eyebrow">Sugerencia</span>
        <p>
          La tarjeta del producto se reutiliza en el catálogo para mantener la
          estructura consistente.
        </p>
        <ProductCard product={product} />
      </aside>

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
