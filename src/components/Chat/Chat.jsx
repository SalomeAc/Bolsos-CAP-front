import { useEffect, useState, useRef } from "react";
import {
  getLatestMessages,
  sendMessage,
  deleteMessage,
} from "../../services/messageService";
import { useAuthStore } from "../../store/useAuthStore";
import "./Chat.css";
import { SpeakButton } from "../SpeakButton/SpeakButton";

export function Chat({ quotationId, quotation, isAdmin = false }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sender, setSender] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Obtener datos del usuario autenticado desde el store
  const authStore = useAuthStore();
  const userId = authStore.currentUser?.id;
  const token = authStore.authToken;
  const userName = `${authStore.currentUser?.firstName} ${authStore.currentUser?.lastName}`;

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll al final solo si el usuario está al final
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      // Solo scroll si está casi al final (menos de 100px del bottom)
      if (scrollHeight - scrollTop - clientHeight < 100) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar mensajes al montar el componente con polling para nuevos mensajes
  useEffect(() => {
    if (!quotationId || !token) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLatestMessages(quotationId, token, 100);
        setMessages((current) => {
          const currentIds = current.map((m) => m._id).join(",");
          const newIds = data.map((m) => m._id).join(",");

          if (currentIds === newIds) {
            return current;
          }

          return data;
        });
      } catch (err) {
        console.error("Error loading messages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Poll para nuevos mensajes cada 3 segundos
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [quotationId, token]);

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      setError("El mensaje no puede estar vacío");
      return;
    }

    if (!token || !quotationId) {
      setError("No hay sesión activa o cotización no válida");
      return;
    }

    try {
      setSending(true);
      setError(null);

      const message = await sendMessage(quotationId, newMessage, token);
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Eliminar mensaje
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este mensaje?")) {
      return;
    }

    try {
      setError(null);
      await deleteMessage(messageId, token);
      setMessages(messages.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error("Error deleting message:", err);
      setError(err.message);
    }
  };

  // Formatear hora
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  // Agrupar mensajes por fecha
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

  // Leer mensaje
  const buildMessageText = (msg) => {
    const sender = msg.isSystemMessage
      ? "Sistema"
      : msg.sender._id === userId
        ? "Tú"
        : msg.sender.firstName;

    return `${sender}: ${msg.content}`;
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={messagesContainerRef}>
        {quotation && (
          <div className="product-message-item">
            <div className="product-card-wrapper">
              {quotation.kind === "catalog" && quotation.product?.photo && (
                <div className="product-card-image-container">
                  <img
                    src={quotation.product.photo}
                    alt={quotation.product.name}
                    className="product-card-image"
                  />
                </div>
              )}

              {quotation.kind === "custom" &&
                quotation.customProduct?.photo && (
                  <div className="product-card-image-container">
                    <img
                      src={quotation.customProduct.photo}
                      alt="Producto Personalizado"
                      className="product-card-image"
                    />
                  </div>
                )}

              <div className="product-card-details">
                <h4 className="product-card-name">
                  {quotation.kind === "catalog"
                    ? quotation.product?.name || "Producto de Catálogo"
                    : "Producto Personalizado"}
                </h4>

                {quotation.kind === "catalog" &&
                  (quotation.customization?.color ||
                    quotation.customization?.size ||
                    quotation.customization?.type) && (
                    <p className="product-card-specs">
                      {quotation.customization?.color &&
                        `Color: ${quotation.customization.color}`}
                      {quotation.customization?.color &&
                        quotation.customization?.size &&
                        " • "}
                      {quotation.customization?.size &&
                        `Dimensiones: ${quotation.customization.size}`}
                      {(quotation.customization?.color ||
                        quotation.customization?.size) &&
                        quotation.customization?.type &&
                        " • "}
                      {quotation.customization?.type &&
                        `Material: ${quotation.customization.type}`}
                    </p>
                  )}

                {quotation.kind === "custom" && quotation.customProduct && (
                  <div
                    className="product-card-specs"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {quotation.customProduct.description && (
                      <p>
                        <strong>Descripción:</strong>{" "}
                        {quotation.customProduct.description}
                      </p>
                    )}
                    {quotation.customProduct.color && (
                      <p>
                        <strong>Color:</strong> {quotation.customProduct.color}
                      </p>
                    )}
                    {quotation.customProduct.dimensions && (
                      <p>
                        <strong>Dimensiones:</strong>{" "}
                        {quotation.customProduct.dimensions}
                      </p>
                    )}
                    {quotation.customProduct.materials &&
                      quotation.customProduct.materials.length > 0 && (
                        <p>
                          <strong>Materiales:</strong>{" "}
                          {quotation.customProduct.materials.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {loading && messages.length === 0 ? (
          <div className="chat-loading">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="chat-date-separator">{date}</div>
                {msgs.map((msg) => (
                  <div
                    key={msg._id}
                    className={`chat-message ${
                      msg.isSystemMessage
                        ? "system"
                        : msg.sender._id === userId
                          ? "sent"
                          : "received"
                    }`}
                  >
                    {/* HEADER */}
                    <div className="chat-message-header">
                      <SpeakButton
                        text={buildMessageText(msg)}
                        variant="inline"
                        label="Escuchar mensaje"
                      />
                      <span className="chat-sender-name">
                        {msg.sender._id === userId
                          ? "Tú"
                          : msg.sender.firstName}
                      </span>
                      <span className="chat-message-time">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* CONTENIDO (AQUÍ VAN LOS \n) */}
                    <div className="chat-message-content">{msg.content}</div>

                    {/* ATTACHMENTS */}
                    {msg.attachments?.length > 0 && (
                      <div className="chat-message-attachments">
                        {msg.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chat-attachment"
                          >
                            📎 Ver adjunto
                          </a>
                        ))}
                      </div>
                    )}

                    {/* DELETE BUTTON */}
                    {msg.sender._id === userId && (
                      <button
                        className="chat-delete-btn"
                        onClick={() => handleDeleteMessage(msg._id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {error && (
        <div className="chat-error">
          {error}
          <button
            className="chat-error-close"
            onClick={() => setError(null)}
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="chat-input"
          disabled={sending || !token}
          aria-label="Campo de mensaje"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim() || !token}
          className="chat-send-btn"
          aria-label="Enviar mensaje"
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
