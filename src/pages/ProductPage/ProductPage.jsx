import { ProductCard } from '../../components/ProductCard/ProductCard.jsx'
import { Link } from 'react-router-dom'
import './ProductPage.css'

export function ProductPage({ product }) {
  if (!product) {
    return (
      <section className="empty-state">
        <span className="eyebrow">Producto no encontrado</span>
        <h1>Ese producto no existe o ya no está disponible.</h1>
        <Link className="button button-primary" to="/catalog">
          Volver al catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="product-detail-layout">
      <article className="product-detail-visual" aria-hidden={product.image ? 'false' : 'true'}>
        {product.image ? (
          <img src={product.image} alt={`Imagen de ${product.name}`} />
        ) : (
          <span>{product.name.slice(0, 2).toUpperCase()}</span>
        )}
      </article>

      <article className="product-detail-card">
        <span className="eyebrow">{product.category}</span>
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
        <p>La tarjeta del producto se reutiliza en el catálogo para mantener la estructura consistente.</p>
        <ProductCard product={product} />
      </aside>
    </section>
  )
}
