import type {
  AdminServiceContract,
} from '@/lib/admin/contracts';
import type { Product } from '@/types';
import {
  DEFAULT_SHIPPING_METHODS,
  getAllProductsForAdmin,
  getCategories,
  getCollections,
  getJournalArticles,
  upsertProduct,
} from '@/lib/services';

async function getDemoProduct(id: string): Promise<Product | null> {
  const products = await getAllProductsForAdmin(0);
  return products.find((product) => product.id === id || product.slug === id) ?? null;
}

/**
 * Explicit server-action demo adapter for the catalog only. Product mutations
 * live in the existing mock service's process memory and reset when that server
 * process restarts. Discount controls use the browser adapter so storefront
 * validation sees the same in-session store. Order/customer operations remain
 * in CommerceContext instead.
 */
export const demoAdminService: AdminServiceContract = {
  async getProducts() {
    return getAllProductsForAdmin(0);
  },

  async getProduct(id) {
    return getDemoProduct(id);
  },

  async saveProduct(product) {
    const id = product.id === '__new__'
      ? `prod-local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
      : product.id;
    return upsertProduct({ ...product, id }, 0);
  },

  async setProductStatus(id, status) {
    const product = await getDemoProduct(id);
    if (!product) throw new Error(`Product ${id} was not found in the local catalog.`);
    return upsertProduct({ ...product, status }, 0);
  },

  async updateInventory(id, inventoryCount, stockStatus) {
    if (!Number.isSafeInteger(inventoryCount) || inventoryCount < 0) {
      throw new Error('Catalog quantity must be a non-negative whole number.');
    }
    const product = await getDemoProduct(id);
    if (!product) throw new Error(`Product ${id} was not found in the local catalog.`);
    return upsertProduct({ ...product, inventoryCount, stockStatus }, 0);
  },

  async getCategories() {
    return getCategories(0);
  },

  async getCollections() {
    return getCollections(0);
  },

  async getJournalArticles() {
    return getJournalArticles(0);
  },

  async getShippingMethods() {
    return [...DEFAULT_SHIPPING_METHODS];
  },
};

export type NewAdminProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
