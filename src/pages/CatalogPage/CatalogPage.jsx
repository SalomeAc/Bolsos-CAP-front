import { ProductCard } from '../../components/ProductCard/ProductCard.jsx'
import './CatalogPage.css'

export function CatalogPage({ products }) {
  return (
    <div className="page-stack">
      <section className="section-block">
        <div className="section-heading">
          <span className="eyebrow">Catálogo</span>
          <h1>Explora todos los bolsos disponibles.</h1>
          <p>
            Cada producto tiene su propia página con información básica para que luego
            puedas conectar inventario, tallas o compra en línea.
          </p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
