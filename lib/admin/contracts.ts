import type {
  Category,
  Collection,
  Discount,
  DiscountStatus,
  JournalArticle,
  Order,
  Product,
  ProductStatus,
  StockStatus,
  ShippingMethod,
} from '@/types';

export type AdminDataMode = 'local-demo';

export type AdminMutationResult<T> =
  | { ok: true; data: T; mode: AdminDataMode; message: string }
  | { ok: false; mode: AdminDataMode; message: string };

/**
 * Backend-facing boundary for catalog operations. The current implementation
 * calls the existing NOIRÉ demo service; replace that adapter with the
 * authenticated server repository when one exists.
 */
export interface AdminDiscountServiceContract {
  getDiscounts(): Promise<Discount[]>;
  saveDiscount(discount: Discount): Promise<Discount>;
  setDiscountStatus(id: string, status: DiscountStatus): Promise<Discount>;
}

export interface AdminServiceContract {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  saveProduct(product: Product): Promise<Product>;
  setProductStatus(id: string, status: Product['status']): Promise<Product>;
  updateInventory(
    id: string,
    inventoryCount: number,
    stockStatus: StockStatus
  ): Promise<Product>;
  getCategories(): Promise<Category[]>;
  getCollections(): Promise<Collection[]>;
  getJournalArticles(): Promise<JournalArticle[]>;
  getShippingMethods(): Promise<ShippingMethod[]>;
}

/** A display projection built only from browser-local CommerceContext orders. */
export interface GuestClientLedgerEntry {
  id: string;
  anchorOrderId: string;
  name: string;
  email?: string;
  phone?: string;
  orderCount: number;
  totalValue: number;
  lastOrderAt: string;
  orders: Order[];
}

/** Content configuration remains a browser-local draft and is never published. */
export interface LocalContentDraft {
  featuredCollectionId: string | null;
  featuredProductIds: string[];
  journalArticleIds: string[];
  navigationCollectionIds: string[];
  announcementText: string;
  savedAt: string | null;
}

export const EMPTY_LOCAL_CONTENT_DRAFT: LocalContentDraft = {
  featuredCollectionId: null,
  featuredProductIds: [],
  journalArticleIds: [],
  navigationCollectionIds: [],
  announcementText: '',
  savedAt: null,
};

export interface AdminOrderFilterState {
  query: string;
  orderStatus: 'all' | Order['status'];
  paymentStatus: 'all' | Order['paymentStatus'];
  fromDate: string;
  toDate: string;
}

export interface AdminProductFilterState {
  query: string;
  category: 'all' | Product['category'];
  productStatus: 'all' | ProductStatus;
  stockStatus: 'all' | StockStatus;
}
