import { useEffect, useState } from "react";
import {
  parseDimensionsValue,
  serializeDimensions,
} from "./dimensionsUtils.js";
import "./DimensionsEditor.css";

export function DimensionsEditor({ value, onChange, error }) {
  const [rows, setRows] = useState(() => parseDimensionsValue(value));

  useEffect(() => {
    setRows(parseDimensionsValue(value));
  }, [value]);

  const updateRows = (nextRows) => {
    setRows(nextRows);
    onChange(serializeDimensions(nextRows));
  };

  const handleRowChange = (rowId, field, fieldValue) => {
    updateRows(
      rows.map((row) =>
        row.id === rowId ? { ...row, [field]: fieldValue } : row,
      ),
    );
  };

  const handleAddRow = () => {
    updateRows([...rows, ...parseDimensionsValue("")]);
  };

  const handleRemoveRow = (rowId) => {
    if (rows.length === 1) {
      updateRows(parseDimensionsValue(""));
      return;
    }

    updateRows(rows.filter((row) => row.id !== rowId));
  };

  return (
    <div className="dimensions-editor form-field form-field--full">
      <div className="dimensions-editor__header">
        <span>Tamaños disponibles</span>
        <p className="dimensions-editor__hint">
          Indica las medidas en centímetros. Puedes agregar varios tamaños si el
          producto tiene más de una opción.
        </p>
      </div>

      <div className="dimensions-editor__list">
        {rows.map((row, index) => {
          const preview =
            row.width && row.height && row.depth
              ? `${row.width} x ${row.height} x ${row.depth} cm`
              : null;

          return (
            <div key={row.id} className="dimensions-editor__row">
              <div className="dimensions-editor__row-title">
                Tamaño {index + 1}
                {preview ? (
                  <span className="dimensions-editor__preview">{preview}</span>
                ) : null}
              </div>

              <div className="dimensions-editor__inputs">
                <label>
                  <span>Ancho</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="26"
                    value={row.width}
                    onChange={(event) =>
                      handleRowChange(row.id, "width", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span>Alto</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="22"
                    value={row.height}
                    onChange={(event) =>
                      handleRowChange(row.id, "height", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span>Fondo</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="8"
                    value={row.depth}
                    onChange={(event) =>
                      handleRowChange(row.id, "depth", event.target.value)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="dimensions-editor__remove"
                  onClick={() => handleRemoveRow(row.id)}
                  aria-label={`Eliminar tamaño ${index + 1}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="dimensions-editor__add"
        onClick={handleAddRow}
      >
        + Agregar otro tamaño
      </button>

      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
