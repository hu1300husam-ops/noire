import type {
  Address,
  Customer,
  CustomerSession,
  CustomerSessionIdentity,
  Order,
} from '@/types';

export type AuthenticatedCustomerSession = Extract<
  CustomerSession,
  { status: 'authenticated' }
>;

export type PrivateDispatchDiscipline =
  | 'acoustic-systems'
  | 'desk-architecture'
  | 'transit-field'
  | 'lighting';

export interface CustomerProfileRecord extends CustomerSessionIdentity {
  phone?: string;
}

export type CustomerProfileUpdate = Pick<
  CustomerProfileRecord,
  'firstName' | 'lastName' | 'email' | 'phone'
>;

export type CustomerPreferencesRecord = Customer['preferences'] & {
  email: string;
  disciplines: PrivateDispatchDiscipline[];
};

export type CustomerAddressInput = Omit<
  Address,
  'id' | 'isDefaultShipping' | 'isDefaultBilling'
> & {
  id?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
};

/**
 * Future authoritative customer-data boundary. This contract is intentionally
 * not backed by the mock admin customer store: there is no authenticated
 * identity to scope those records to in the current preview.
 */
export interface CustomerAccountProvider {
  getCustomerProfile(
    session: AuthenticatedCustomerSession
  ): Promise<CustomerProfileRecord | null>;
  getCustomerOrders(session: AuthenticatedCustomerSession): Promise<Order[]>;
  getCustomerAddresses(
    session: AuthenticatedCustomerSession
  ): Promise<Address[]>;
  updateCustomerProfile(
    session: AuthenticatedCustomerSession,
    profile: CustomerProfileUpdate
  ): Promise<CustomerProfileRecord>;
  updateCustomerAddress(
    session: AuthenticatedCustomerSession,
    address: CustomerAddressInput
  ): Promise<Address>;
  getCustomerPreferences(
    session: AuthenticatedCustomerSession
  ): Promise<CustomerPreferencesRecord | null>;
  updateCustomerPreferences(
    session: AuthenticatedCustomerSession,
    preferences: CustomerPreferencesRecord
  ): Promise<CustomerPreferencesRecord>;
}
