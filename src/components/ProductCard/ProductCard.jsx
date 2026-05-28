import './ProductCard.css'
import { Link } from 'react-router-dom'
const getImageUrl = (url) => {
  if (!url) return "";

  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/(.*?)\//);

    if (match?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  return url;
};
export function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-art" aria-hidden="true">
        {product.photo ? (
          <img
  src={getImageUrl(product.photo)}
  alt={product.name}
/>
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
