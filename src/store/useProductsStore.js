import { create } from 'zustand'
import { products as initialProducts } from '../data/products.js'

/**
 * @typedef {Object} Product
 * @property {string} slug
 * @property {string} name
 * @property {string} category
 * @property {string} price
 * @property {string} description
 * @property {string} materials
 * @property {string} colors
 * @property {string} dimensions
 * @property {string} [image]
 */

export const useProductsStore = create((set, get) => ({
  products: initialProducts,

  addProduct: (product) => {
    set((state) => ({ products: [product, ...state.products] }))
  },

  updateProduct: (slug, updates) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.slug === slug ? { ...product, ...updates } : product
      ),
    }))
  },

  deleteProduct: (slug) => {
    set((state) => ({
      products: state.products.filter((product) => product.slug !== slug),
    }))
  },

  getProductBySlug: (slug) => {
    return get().products.find((product) => product.slug === slug)
  },
}))
