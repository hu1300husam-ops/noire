import type { AdminDiscountServiceContract } from '@/lib/admin/contracts';
import { getDiscounts, upsertDiscount } from '@/lib/mock-api';
import type { Discount, DiscountStatus } from '@/types';

/**
 * Browser-local admin adapter for the existing demo discount store. It shares
 * the same module memory read by storefront validateDiscountCode; data resets
 * on a full page reload and is never a durable or production discount service.
 */
export const browserDemoDiscountService: AdminDiscountServiceContract = {
  async getDiscounts() {
    return getDiscounts(0);
  },

  async saveDiscount(discount: Discount) {
    const id = discount.id === '__new__'
      ? `disc-local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
      : discount.id;
    return upsertDiscount({ ...discount, id }, 0);
  },

  async setDiscountStatus(id: string, status: DiscountStatus) {
    const discount = (await getDiscounts(0)).find((candidate) => candidate.id === id);
    if (!discount) throw new Error(`Discount ${id} was not found in this browser’s demo store.`);
    return upsertDiscount({ ...discount, status }, 0);
  },
};
