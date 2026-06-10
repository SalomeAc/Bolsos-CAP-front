import "./ProductCard.css";
import { Link } from "react-router-dom";
const getImageUrl = (url) => {
  if (!url) return "";

  // Si ya viene en formato correcto
  if (url.includes("uc?export=view&id=")) {
    return url;
  }

  // Links tipo file/d/ID/view
  const fileMatch = url.match(/\/d\/([^/]+)/);

  if (fileMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }

  return url;
};
export function ProductCard({ product }) {
  console.log(product);
  console.log(product.photo);
  console.log(getImageUrl(product.photo));
  return (
    <Link
      to={`/product/${product.slug || product.code}`}
      style={{ textDecoration: "none" }}
    >
      <article className="product-card">
        <div className="product-art" aria-hidden="true">
          {product.photo ? (
            <img src={getImageUrl(product.photo)} alt={product.name} />
          ) : (
            <span>{product.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="product-card-body">
          <div className="product-meta">
            <span>{product.type}</span>
          </div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <button className="product-card-button">Ver producto</button>
        </div>
      </article>
    </Link>
  );
}
