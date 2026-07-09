import { useEffect, useState, useRef, useMemo } from "react";
import {
  getLatestMessages,
  sendMessage,
  deleteMessage,
} from "../../services/messageService";
import { useAuthStore } from "../../store/useAuthStore";
import "./Chat.css";
import { SpeakButton } from "../SpeakButton/SpeakButton";
import { QuotationProductCard } from "./QuotationProductCard";
import {
  ChatQuotationOfferActions,
  getLatestQuotationOfferId,
  isQuotationOfferMessage,
} from "./ChatQuotationOfferActions";

export function Chat({
  quotationId,
  quotation,
  isAdmin = false,
  onQuotationUpdated,
  onRequestQuotationRefresh,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const authStore = useAuthStore();
  const userId = authStore.currentUser?.id;
  const token = authStore.authToken;

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const latestQuotationOfferId = useMemo(
    () => getLatestQuotationOfferId(messages),
    [messages],
  );

  const isAwaitingClientResponse =
    !quotation?.clientResponse?.decision &&
    (quotation?.finalQuotation?.amount ?? 0) > 0 &&
    !["aceptada", "rechazada"].includes(quotation?.status);

  const canRespondToOffer =
    !isAdmin &&
    Boolean(onQuotationUpdated && token) &&
    isAwaitingClientResponse &&
    (quotation?.status === "cotizada" ||
      messages.some((message) => isQuotationOfferMessage(message)));

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [quotationId, token]);

  useEffect(() => {
    if (!onRequestQuotationRefresh || !messages.length) {
      return;
    }

    const hasOfferMessage = messages.some((message) =>
      isQuotationOfferMessage(message),
    );

    if (
      hasOfferMessage &&
      quotation?.status !== "cotizada" &&
      !["aceptada", "rechazada"].includes(quotation?.status || "")
    ) {
      onRequestQuotationRefresh();
    }
  }, [messages, quotation?.status, onRequestQuotationRefresh]);

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

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

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
        {quotation && <QuotationProductCard quotation={quotation} />}
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
                {msgs.map((msg) => {
                  const isOfferMessage = isQuotationOfferMessage(msg);
                  const showOfferActions =
                    canRespondToOffer &&
                    isOfferMessage &&
                    msg._id === latestQuotationOfferId;

                  return (
                    <div
                      key={msg._id}
                      className={`chat-message ${
                        msg.isSystemMessage
                          ? "system"
                          : msg.sender._id === userId
                            ? "sent"
                            : "received"
                      }${isOfferMessage ? " chat-message--quotation-offer" : ""}`}
                    >
                      <div className="chat-message-header">
                        <SpeakButton
                          text={buildMessageText(msg)}
                          variant="inline"
                          label="Escuchar mensaje"
                        />
                        <span className="chat-sender-name">
                          {msg.isSystemMessage
                            ? "Sistema"
                            : msg.sender._id === userId
                              ? "Tú"
                              : msg.sender.firstName}
                        </span>
                        <span className="chat-message-time">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>

                      {isOfferMessage ? (
                        <div className="chat-message-offer-body">
                          <div className="chat-message-content">{msg.content}</div>
                          {showOfferActions && (
                            <ChatQuotationOfferActions
                              quotation={quotation}
                              token={token}
                              onQuotationUpdated={onQuotationUpdated}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="chat-message-content">{msg.content}</div>
                      )}

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

                      {msg.sender._id === userId && (
                        <button
                          className="chat-delete-btn"
                          onClick={() => handleDeleteMessage(msg._id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
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
