import {
  Navigate,
  Route,
  Routes,
  useParams,
  useLocation,
} from "react-router-dom";
import { CatalogPage } from "../pages/CatalogPage/CatalogPage.jsx";
import { HomePage } from "../pages/HomePage/HomePage.jsx";
import { LoginPage } from "../pages/LoginPage/LoginPage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage/NotFoundPage.jsx";
import { ProfilePage } from "../pages/ProfilePage/ProfilePage.jsx";
import { QuotationSummaryPage } from "../pages/QuotationSummaryPage/QuotationSummaryPage.jsx";
import { QuotationDetailPage } from "../pages/QuotationDetailPage/QuotationDetailPage.jsx";
import { AdminMessagesPage } from "../pages/AdminMessagesPage/AdminMessagesPage.jsx";
import { CotizacionesPage } from "../pages/CotizacionesPage/CotizacionesPage.jsx";
import { MisCotizacionesPage } from "../pages/MisCotizacionesPage/MisCotizacionesPage.jsx";
import { ProductPage } from "../pages/ProductPage/ProductPage.jsx";
import { useProductsStore } from "../store/useProductsStore.js";
import { useAuthStore, isTokenExpired } from "../store/useAuthStore.js";
import { CotizarPage } from "../pages/CotizarPage/CotizarPage.jsx";

function ProductRoute() {
  const { code } = useParams();
  const getProductByCode = useProductsStore((state) => state.getProductByCode);
  const getProductBySlug = useProductsStore((state) => state.getProductBySlug);

  // Intenta buscar por slug primero (datos locales), luego por code (datos de API)
  const activeProduct = getProductBySlug(code) || getProductByCode(code);

  if (!activeProduct) {
    return <NotFoundPage />;
  }

  return <ProductPage product={activeProduct} />;
}

// Componente protegido que guarda la página anterior si no está logueado
function ProtectedRoute({ element, requiresAuth = false }) {
  const token = useAuthStore((state) => state.authToken);
  const logout = useAuthStore((state) => state.logout)
  const setReturnPath = useAuthStore((state) => state.setReturnPath);
  const location = useLocation();

  if (requiresAuth) {
    if (!token) {
      setReturnPath(location.pathname)
      return <Navigate to="/login" replace />
    }

    if (isTokenExpired(token)) {
      setReturnPath(location.pathname)
      logout()
      return <Navigate to="/login" replace />
    }
  }

  return element;
}

export default function Router() {
  const products = useProductsStore((state) => state.products);

  return (
    <Routes>
      <Route path="/" element={<HomePage products={products} />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute element={<ProfilePage />} requiresAuth={true} />
        }
      />
      <Route
        path="/quotation-summary"
        element={
          <ProtectedRoute
            element={<QuotationSummaryPage />}
            requiresAuth={true}
          />
        }
      />
      <Route
        path="/quotation/:quotationId"
        element={
          <ProtectedRoute
            element={<QuotationDetailPage />}
            requiresAuth={true}
          />
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute element={<AdminMessagesPage />} requiresAuth={true} />
        }
      />
      <Route
        path="/cotizaciones"
        element={
          <ProtectedRoute element={<CotizacionesPage />} requiresAuth={true} />
        }
      />
      <Route
        path="/mis-cotizaciones"
        element={
          <ProtectedRoute
            element={<MisCotizacionesPage />}
            requiresAuth={true}
          />
        }
      />
      <Route
        path="/cotizar"
        element={
          <ProtectedRoute element={<CotizarPage />} requiresAuth={true} />
        }
      />
      <Route path="/product/:code" element={<ProductRoute />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
