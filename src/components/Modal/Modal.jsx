import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  className = "",
}) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={`modal-overlay ${className}`.trim()}>
      <div className="modal-shell">
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>

          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
