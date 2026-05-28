import { useState } from 'react'
import { ProductCard } from '../../components/ProductCard/ProductCard.jsx'
import { CreateProductModal } from '../../components/ProductAdmin/CreateProductModal.jsx'
import { useAuthStore } from '../../store/useAuthStore.js'
import { useProductsStore } from '../../store/useProductsStore.js'
import './CatalogPage.css'

export function CatalogPage() {
  const products = useProductsStore((state) => state.products)
  const addProduct = useProductsStore((state) => state.addProduct)
  const isAdmin = useAuthStore((state) => state.currentUser?.isAdmin)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateProduct = (product) => {
    addProduct(product)
  }

  return (
    <div className="page-stack">
      <section className="section-block">
        <div className="catalog-header">
          <div>
            <span className="eyebrow">Catálogo</span>
            <h1>Explora todos los bolsos disponibles.</h1>
            <p>
              Cada producto tiene su propia página con información básica para que luego
              puedas conectar inventario, tallas o compra en línea.
            </p>
          </div>

          {isAdmin ? (
            <div className="catalog-toolbar">
              <button className="button button-primary" type="button" onClick={() => setIsModalOpen(true)}>
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
  )
}
