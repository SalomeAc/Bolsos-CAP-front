import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { CatalogPage } from '../pages/CatalogPage/CatalogPage.jsx'
import { HomePage } from '../pages/HomePage/HomePage.jsx'
import { LoginPage } from '../pages/LoginPage/LoginPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage.jsx'
import { ProfilePage } from '../pages/ProfilePage/ProfilePage.jsx'
import { ProductPage } from '../pages/ProductPage/ProductPage.jsx'
import { products } from '../data/products.js'

function ProductRoute() {
  const { slug } = useParams()
  const activeProduct = products.find((product) => product.slug === slug)

  if (!activeProduct) {
    return <NotFoundPage />
  }

  return <ProductPage product={activeProduct} />
}

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage products={products} />} />
      <Route path="/catalog" element={<CatalogPage products={products} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/product/:slug" element={<ProductRoute />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
