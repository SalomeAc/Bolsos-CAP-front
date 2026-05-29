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
      <article className="profile-card profile-card--highlight profile-card--single">
        <span className="eyebrow">Perfil</span>
        <h1>{currentUser ? `Perfil de ${currentUser.name}` : 'Perfil de cliente'}</h1>
        <p>
          {currentUser
            ? 'Estos son los datos básicos de tu cuenta.'
            : 'Inicia sesión para ver tus datos básicos.'}
        </p>

        <h2>Datos básicos</h2>
        <ul>
          <li>Nombre: {currentUser?.name || 'pendiente de conexión'}</li>
          <li>Correo: {currentUser?.email || 'pendiente de conexión'}</li>
        </ul>
      </article>
    </section>
  );
}
