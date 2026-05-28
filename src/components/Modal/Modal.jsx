import { useEffect } from 'react'
import './Modal.css'

export function Modal({ open, title, description, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
      <div className="modal-shell">
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description ? (
              <p id="modal-description">{description}</p>
            ) : null}
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}
