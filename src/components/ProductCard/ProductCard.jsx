import './ProductCard.css'
import { Link } from 'react-router-dom'

export function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-art" aria-hidden="true">
        {product.image ? (
          <img src={product.image} alt={`Imagen de ${product.name}`} />
        ) : (
          <span>{product.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-meta">
          <span>{product.category}</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <Link to={`/product/${product.slug}`}>Ver producto</Link>
      </div>
    </article>
  )
}
