import { ProductCard } from '../../components/ProductCard/ProductCard.jsx'
import { Link } from 'react-router-dom'
import './HomePage.css'

export function HomePage({ products }) {
  const featuredProducts = products.slice(0, 3)

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Ecommerce artesanal</span>
          <h1>Bolsos en crochet hechos para destacar cada salida.</h1>
          <p>
            Una base visual lista para presentar tu marca con una navegación simple,
            catálogo y páginas individuales de producto.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/catalog">
              Explorar catálogo
            </Link>
            <Link className="button button-secondary" to="/login">
              Iniciar sesión
            </Link>
          </div>
        </div>

        <aside className="hero-panel">
          <div>
            <span>Hecho a mano</span>
            <strong>Texturas cálidas, diseño limpio y piezas únicas.</strong>
          </div>
          <ul>
            <li>Catálogo con tarjetas visuales</li>
            <li>Detalle individual por producto</li>
            <li>Inicio de sesión con Google</li>
          </ul>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span className="eyebrow">Destacados</span>
          <h2>Modelos seleccionados para abrir la tienda.</h2>
        </div>
        <div className="product-grid product-grid--featured">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
