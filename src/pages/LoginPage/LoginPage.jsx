import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.js";
import "./LoginPage.css";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

  const handleGoogleSignIn = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      signInWithGoogle();
      navigate("/profile");
    }, 500);
  };

  return (
    <section className="auth-layout">
      <div className="auth-card auth-card--center" aria-live="polite">
        <div className="auth-visual">
          <div className="brand-mark">
            <img className="brand-mark" src="/icon.png" alt="Bolsos Cap" />
          </div>
          <div className="visual-copy">
            <h2>Bolsos Cap</h2>
            <p>Accede con Google para continuar — sin contraseñas.</p>
          </div>
        </div>

        <div className="auth-form">
          <div className="auth-form-header">
            <h2>Inicia sesión</h2>
            <p className="muted">Usa tu cuenta de Google</p>
          </div>

          <button
            className="button button-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M21 12.23c0-.68-.06-1.33-.18-1.96H12v3.71h5.6c-.24 1.3-.98 2.4-2.08 3.14v2.62h3.36c1.96-1.8 3.1-4.47 3.1-7.51z"
                fill="#4285F4"
              />
              <path
                d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.36-2.62c-.94.64-2.14 1.02-3.26 1.02-2.5 0-4.62-1.68-5.38-3.95H3.12v2.48C4.77 19.9 8.06 22 12 22z"
                fill="#34A853"
              />
              <path
                d="M6.62 13.01A6.6 6.6 0 0 1 6.4 12c0-.33.03-.66.07-.98V8.54H3.12A9.99 9.99 0 0 0 2 12c0 1.6.38 3.12 1.12 4.46l3.5-3.45z"
                fill="#FBBC05"
              />
              <path
                d="M12 7.5c1.47 0 2.8.5 3.85 1.48l2.9-2.9C16.94 4.6 14.7 3.5 12 3.5 8.06 3.5 4.77 5.6 3.12 8.54l3.5 2.59C7.38 9.18 9.5 7.5 12 7.5z"
                fill="#EA4335"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <p className="muted small" style={{ marginTop: 12 }}>
            Al ingresar con Google aceptas nuestros términos y condiciones.
          </p>
        </div>
      </div>
    </section>
  );
}
