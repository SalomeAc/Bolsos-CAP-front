import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../../services/authService.js";
import "./ProfilePage.css";

export function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Cargar perfil al montar el componente
  useEffect(() => {
    if (!currentUser || !token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(token);
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
        });
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const updatedProfile = await updateUserProfile(token, formData);
      setUser(updatedProfile, token);
      setIsEditing(false);
      alert("Perfil actualizado exitosamente");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!currentUser) {
    return <div>Redirigiendo...</div>;
  }

  return (
    <section className="profile-layout">
      <article className="profile-card profile-card--highlight">
        <span className="eyebrow">Perfil</span>
        <h1>Perfil de {currentUser.firstName || "Usuario"}</h1>
        <p>Gestiona tu información personal y preferencias.</p>
      </article>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-grid">
        <article className="profile-card">
          <h2>Datos básicos</h2>
          {!isEditing ? (
            <ul>
              <li>
                Nombre: {formData.firstName} {formData.lastName}
              </li>
              <li>Correo: {formData.email}</li>
              <li>Teléfono: {formData.phone || "No registrado"}</li>
              <li>Dirección: {formData.address || "No registrada"}</li>
            </ul>
          ) : (
            <form onSubmit={handleSaveProfile}>
              <input
                type="text"
                name="firstName"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <textarea
                name="address"
                placeholder="Dirección"
                value={formData.address}
                onChange={handleInputChange}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancelar
              </button>
            </form>
          )}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-edit">
              Editar perfil
            </button>
          )}
        </article>

        <article className="profile-card">
          <h2>Cuenta</h2>
          <ul>
            <li>Proveedor: {currentUser.authProvider || "Local"}</li>
            <li>Estado: Activa</li>
          </ul>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </article>
      </div>
    </section>
  );
}
