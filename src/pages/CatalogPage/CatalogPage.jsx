import { useEffect, useState } from "react";
import { ProductCard } from "../../components/ProductCard/ProductCard.jsx";
import { CreateProductModal } from "../../components/ProductAdmin/CreateProductModal.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";
import { useProductsStore } from "../../store/useProductsStore.js";
import {
  createProduct as createProductApi,
  fetchProducts
} from "../../services/productService.js";
import "./CatalogPage.css";

export function CatalogPage() {
  const products = useProductsStore((state) => state.products);
  const addProduct = useProductsStore((state) => state.addProduct);
  const isAdmin = useAuthStore((state) => state.currentUser?.isAdmin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setProducts = useProductsStore((state) => state.setProducts);

  useEffect(() => {

  async function loadProducts() {
    try {
      const data = await fetchProducts();
      setProducts(data);

    } catch (error) {

      console.error(error);

    }
  }

  loadProducts();

}, [setProducts]);

  const handleCreateProduct = async (product) => {
    try {
      const createdProduct = await createProductApi(product);
      addProduct(createdProduct);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert(`No se pudo crear el producto: ${error.message}`);
    }
  };

  return (
    <div className="page-stack">
      <section className="section-block">
        <div className="catalog-header">
          <div>
            <span className="eyebrow">Catálogo</span>
            <h1>Descubre la colección completa de bolsos artesanales</h1>
            <p>
              Cada pieza conserva su identidad propia y está lista para mostrar
              detalles, variantes e información útil en una experiencia limpia y
              coherente.
            </p>
          </div>

          {isAdmin ? (
            <div className="catalog-toolbar">
              <button
                className="button button-primary"
                type="button"
                onClick={() => setIsModalOpen(true)}
              >
                Crear nuevo producto
              </button>
            </div>
          ) : null}
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <CreateProductModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
}
