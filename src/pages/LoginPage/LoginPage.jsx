import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../../store/useAuthStore.js";
import { loginWithGoogle } from "../../services/authService.js";
import "./LoginPage.css";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const handleGoogleSignInSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const idToken = credentialResponse.credential;
      const response = await loginWithGoogle(idToken);
      setUser(response.user, response.token);
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInError = () => {
    setError("No se pudo iniciar sesión con Google");
  };

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <div className="auth-form">
          <div className="auth-form-header">
            <h2>Bienvenido</h2>
            <p>
              Inicia sesión con Google para continuar explorando nuestro
              catálogo hecho a mano.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSignInSuccess}
              onError={handleGoogleSignInError}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
