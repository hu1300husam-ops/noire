import type { CustomerSession } from '@/types';

export interface CustomerSessionProvider {
  getSession(): Promise<CustomerSession>;
}

/**
 * Phase 9 preview adapter: no login, token, cookie, or customer identity is
 * created. Replace this resolver with the real identity provider when one is
 * available; keep the account UI consuming only the `CustomerSession` contract.
 */
export const previewCustomerSessionProvider: CustomerSessionProvider = {
  async getSession() {
    return { status: 'guest', source: 'preview' };
  },
};
