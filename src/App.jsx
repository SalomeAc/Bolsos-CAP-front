import { useEffect } from "react";
import { HashRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Navigation } from "./components/Navigation/Navigation.jsx";
import Router from "./router/Router.jsx";
import { useProductsStore } from "./store/useProductsStore.js";
import { fetchProducts } from "./services/productService.js";
import "./App.css";

function App() {
  const setProducts = useProductsStore((state) => state.setProducts);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    fetchProducts()
      .then((backendProducts) => {
        if (Array.isArray(backendProducts) && backendProducts.length > 0) {
          setProducts(backendProducts);
        }
      })
      .catch((error) => {
        console.warn(
          "No se pudieron cargar los productos desde el backend:",
          error.message,
        );
      });
  }, [setProducts]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <HashRouter>
        <div className="app-shell">
          <Navigation />
          <main className="app-main">
            <Router />
          </main>
        </div>
      </HashRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
