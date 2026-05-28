import { Modal } from "../Modal/Modal.jsx";
import "./DeleteConfirmationModal.css";

export function DeleteConfirmationModal({
  open,
  product,
  onClose,
  onConfirm,
  isLoading,
}) {
  const handleConfirm = () => {
    onConfirm(product);
  };

  if (!product) return null;

  return (
    <Modal
      open={open}
      title="Eliminar producto"
      description="Esta acción no se puede deshacer."
      onClose={onClose}
    >
      <div className="delete-confirmation-content">
        <div className="delete-warning">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>
            ¿Estás seguro de que deseas eliminar el producto{" "}
            <strong>{product.name}</strong>?
          </p>
        </div>

        <div className="delete-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className="button button-danger"
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
