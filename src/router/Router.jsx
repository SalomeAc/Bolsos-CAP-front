import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { CatalogPage } from '../pages/CatalogPage/CatalogPage.jsx'
import { HomePage } from '../pages/HomePage/HomePage.jsx'
import { LoginPage } from '../pages/LoginPage/LoginPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage.jsx'
import { ProfilePage } from '../pages/ProfilePage/ProfilePage.jsx'
import { QuotationSummaryPage } from '../pages/QuotationSummaryPage/QuotationSummaryPage.jsx'
import { ProductPage } from '../pages/ProductPage/ProductPage.jsx'
import { useProductsStore } from '../store/useProductsStore.js'

function ProductRoute() {
  const { code } = useParams()
  const getProductByCode = useProductsStore((state) => state.getProductByCode)
  const activeProduct = getProductByCode(code)

  if (!activeProduct) {
    return <NotFoundPage />
  }

  return <ProductPage product={activeProduct} />
}

export default function Router() {
  const products = useProductsStore((state) => state.products)

  return (
    <Routes>
      <Route path="/" element={<HomePage products={products} />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/quotation-summary" element={<QuotationSummaryPage />} />
      <Route path="/product/:code" element={<ProductRoute />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
