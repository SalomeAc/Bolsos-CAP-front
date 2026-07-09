import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function buildCustomPreview(customProduct) {
  if (!customProduct) return "";

  const parts = [
    customProduct.materials?.length
      ? customProduct.materials.join(", ")
      : null,
    customProduct.color,
    customProduct.dimensions,
  ].filter(Boolean);

  return parts.join(" · ");
}

export function QuotationProductCard({ quotation }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [quotation?._id]);

  const isCatalog = quotation?.kind === "catalog";
  const isCustom = quotation?.kind === "custom";
  const product = quotation?.product;
  const customProduct = quotation?.customProduct;

  const catalogPath = useMemo(() => {
    if (!isCatalog || !product) return null;
    return product.slug || product.code || null;
  }, [isCatalog, product]);

  const customPreview = useMemo(
    () => buildCustomPreview(customProduct),
    [customProduct],
  );

  if (!quotation) return null;

  const handleCardClick = () => {
    if (isCatalog && catalogPath) {
      navigate(`/product/${catalogPath}`);
      return;
    }
    if (isCustom) {
      setExpanded((value) => !value);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleCardClick();
  };

  return (
    <div className="product-message-item">
      <article
        className={`product-card-wrapper${expanded ? " is-expanded" : ""}${isCatalog && catalogPath ? " is-catalog-link" : ""}${isCustom ? " is-custom-expandable" : ""}`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isCustom ? expanded : undefined}
        aria-label={
          isCatalog
            ? `Ver ${product?.name || "producto"} en el catálogo`
            : expanded
              ? "Ocultar detalles del producto personalizado"
              : "Ver detalles del producto personalizado"
        }
      >
        {isCatalog && product?.photo && (
          <div className="product-card-image-container">
            <img
              src={product.photo}
              alt={product.name}
              className="product-card-image"
            />
          </div>
        )}

        {isCustom && customProduct?.photo && (
          <div className="product-card-image-container">
            <img
              src={customProduct.photo}
              alt="Producto personalizado"
              className="product-card-image"
            />
          </div>
        )}

        <div className="product-card-details">
          <div className="product-card-title-row">
            <h4 className="product-card-name">
              {isCatalog
                ? product?.name || "Producto de catálogo"
                : "Bolso personalizado"}
            </h4>
            {isCustom && (
              <span className={`product-card-chevron${expanded ? " open" : ""}`} />
            )}
          </div>

          {isCatalog && (
            <>
              {(quotation.customization?.color ||
                quotation.customization?.size ||
                quotation.customization?.type ||
                quotation.customization?.material) && (
                <p className="product-card-specs product-card-specs--preview">
                  {[
                    quotation.customization?.color &&
                      `Color: ${quotation.customization.color}`,
                    quotation.customization?.size &&
                      `Dim.: ${quotation.customization.size}`,
                    quotation.customization?.type &&
                      `Tipo: ${quotation.customization.type}`,
                    quotation.customization?.material &&
                      `Material: ${quotation.customization.material}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {catalogPath && (
                <span className="product-card-footnote product-card-footnote--link">
                  Ver en catálogo →
                </span>
              )}
            </>
          )}

          {isCustom && customProduct && (
            <>
              {!expanded ? (
                <>
                  {customProduct.description && (
                    <p className="product-card-specs product-card-specs--preview">
                      {customProduct.description}
                    </p>
                  )}
                  {customPreview && (
                    <p className="product-card-specs product-card-specs--preview">
                      {customPreview}
                    </p>
                  )}
                  <span className="product-card-footnote">
                    ··· Ver más detalles
                  </span>
                </>
              ) : (
                <div className="product-card-specs product-card-specs--full">
                  {customProduct.description && (
                    <p>
                      <strong>Descripción:</strong> {customProduct.description}
                    </p>
                  )}
                  {customProduct.color && (
                    <p>
                      <strong>Color:</strong> {customProduct.color}
                    </p>
                  )}
                  {customProduct.dimensions && (
                    <p>
                      <strong>Dimensiones:</strong> {customProduct.dimensions}
                    </p>
                  )}
                  {customProduct.materials?.length > 0 && (
                    <p>
                      <strong>Materiales:</strong>{" "}
                      {customProduct.materials.join(", ")}
                    </p>
                  )}
                  {customProduct.descriptionImagen && (
                    <p>
                      <strong>Foto (IA):</strong>{" "}
                      {customProduct.descriptionImagen}
                    </p>
                  )}
                  {quotation.notes && (
                    <p>
                      <strong>Observaciones:</strong> {quotation.notes}
                    </p>
                  )}
                  {customProduct.photo && (
                    <a
                      href={customProduct.photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="product-card-photo-link"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Ver foto de referencia
                    </a>
                  )}
                  <span className="product-card-footnote">Ver menos</span>
                </div>
              )}
            </>
          )}
        </div>
      </article>
    </div>
  );
}
