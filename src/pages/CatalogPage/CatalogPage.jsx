import { useEffect, useState } from "react";
import { ProductCard } from "../../components/ProductCard/ProductCard.jsx";
import { CreateProductModal } from "../../components/ProductAdmin/CreateProductModal.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";
import { useProductsStore } from "../../store/useProductsStore.js";
import {
  createProduct as createProductApi,
  fetchProducts,
} from "../../services/productService.js";
import "./CatalogPage.css";
import { recognizeSpeech } from "../../services/speechService";

export function CatalogPage() {
  const products = useProductsStore((state) => state.products);
  const addProduct = useProductsStore((state) => state.addProduct);
  const isAdmin = useAuthStore((state) => state.currentUser?.isAdmin);
  const authToken = useAuthStore((state) => state.authToken);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setProducts = useProductsStore((state) => state.setProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProducts = products.filter((product) =>
    `${product.name ?? ""} ${product.description ?? ""}`
      .toLowerCase()
      .includes((searchTerm ?? "").toLowerCase()),
  );
  const handleVoiceSearch = async () => {
    try {
      const text = await recognizeSpeech();
      setSearchTerm(text);
    } catch (error) {
      console.error(error);
    }
  };

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
      const createdProduct = await createProductApi(product, authToken);
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
        <div className="catalog-search">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="voice-search-button"
            type="button"
            onClick={handleVoiceSearch}
          >
            <span className="iconamoon--microphone-bold"></span>
          </button>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
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
