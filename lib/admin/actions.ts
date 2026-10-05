'use server';

import { demoAdminService } from '@/lib/admin/demo-admin-service';
import type { Product, ProductStatus, StockStatus } from '@/types';

/**
 * Server-action bridge to the local/demo adapter only. These operations have no
 * authentication or production authorization boundary and must not be deployed
 * as real administration until auth middleware and a durable backend are added.
 */
export async function loadAdminProducts(): Promise<Product[]> {
  return demoAdminService.getProducts();
}

export async function loadAdminProduct(id: string): Promise<Product | null> {
  return demoAdminService.getProduct(id);
}

export async function saveAdminProduct(product: Product): Promise<Product> {
  return demoAdminService.saveProduct(product);
}

export async function setAdminProductStatus(
  id: string,
  status: ProductStatus
): Promise<Product> {
  return demoAdminService.setProductStatus(id, status);
}

export async function updateAdminInventory(
  id: string,
  inventoryCount: number,
  stockStatus: StockStatus
): Promise<Product> {
  return demoAdminService.updateInventory(id, inventoryCount, stockStatus);
}

export async function loadAdminCategories() {
  return demoAdminService.getCategories();
}

export async function loadAdminCollections() {
  return demoAdminService.getCollections();
}

export async function loadAdminJournalArticles() {
  return demoAdminService.getJournalArticles();
}

export async function loadAdminShippingMethods() {
  return demoAdminService.getShippingMethods();
}
