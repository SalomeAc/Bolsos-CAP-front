import { ProductCard } from "../../components/ProductCard/ProductCard.jsx";
import { Link } from "react-router-dom";
import "./HomePage.css";

export function HomePage({ products }) {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <div className="hero-copy">
          <img src="/banner-cuadrado.png" alt="Banner" />
        </div>

        <aside className="hero-panel">
          <span className="eyebrow">Accesorios artesanales</span>
          <h1>Bolsos en crochet hechos para destacar cada salida.</h1>
          <p>
            Hecho a mano. Texturas cálidas y piezas únicas — diseños que cuentan
            historias.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/catalog">
              Explorar catálogo
            </Link>
            <Link className="button button-secondary" to="/login">
              Iniciar sesión
            </Link>
          </div>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span className="eyebrow">Catálogo</span>
          <h2>Modelos destacados para inspirarte</h2>
        </div>
        <div className="product-grid product-grid--featured">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <div className="hero-actions">
          <Link className="button button-secondary" to="/catalog">
            +
          </Link>
        </div>
      </section>
    </div>
  );
}
