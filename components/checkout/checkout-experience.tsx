'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  CreditCard,
  Info,
  LockKeyhole,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Tag,
  Truck,
} from 'lucide-react';
import type {
  Address,
  CartItem,
  CartValidationIssue,
  OrderTotals,
  PaymentMethod,
  ShippingMethod,
} from '@/types';
import {
  finalizeOrder,
  getShippingMethods,
  validateCartForCheckout,
  validateDeliveryAddress,
  validateDiscountCode,
  validateOrderTotals,
} from '@/lib/services';
import { useCommerce } from '@/lib/context/commerce-context';
import { useCheckout, type CheckoutAddressDraft } from '@/lib/context/checkout-context';
import { Button, EmptyState, Input, PriceDisplay, TechnicalCode } from '@/components/ui';
import { Container } from '@/components/layout';
import { formatPrice } from '@/lib/utils';
import { CheckoutSkeleton } from './checkout-skeleton';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Switzerland',
  'Japan',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Saudi Arabia',
  'Yemen',
  'Netherlands',
  'Italy',
  'Spain',
  'Singapore',
  'South Korea',
  'Hong Kong',
  'Sweden',
  'Norway',
  'Denmark',
  'Other / International',
];

type FieldErrors = Record<string, string>;
type AddressField = keyof CheckoutAddressDraft;

interface CheckoutExperienceProps {
  initialShippingMethods: ShippingMethod[];
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function passesLuhn(value: string): boolean {
  const digits = value.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function identifyCardBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^(6011|65|64[4-9])/.test(digits)) return 'Discover';
  return 'Card';
}

function getFieldError(errors: FieldErrors, key: string): string | undefined {
  return errors[key];
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  type = 'text',
  autoComplete,
  placeholder,
  required = true,
  disabled,
  inputMode,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}) {
  return (
    <Input
      id={id}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      error={error}
      hint={hint}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      inputMode={inputMode}
      maxLength={maxLength}
    />
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="w-full space-y-2">
      <label
        htmlFor={id}
        className="block font-mono text-label uppercase tracking-[0.12em] text-foreground"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`h-11 w-full rounded-xs border bg-surface px-3.5 text-body text-foreground transition-colors focus:border-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-danger' : 'border-border'}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="font-mono text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionHeading({
  number,
  title,
  detail,
  id,
  requiredLabel = 'Required for local order record',
}: {
  number: string;
  title: string;
  detail: string;
  id: string;
  requiredLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-start gap-4">
        <span className="pt-1 font-mono text-label tabular-nums text-foreground-subtle">
          {`${number} //`}
        </span>
        <div>
          <h2 id={id} tabIndex={-1} className="font-display text-xl text-foreground outline-none">
            {title}
          </h2>
          <p className="mt-1.5 text-small text-foreground-muted">{detail}</p>
        </div>
      </div>
      <TechnicalCode>{requiredLabel}</TechnicalCode>
    </div>
  );
}

function SectionFrame({
  children,
  id,
  onFocusCapture,
  className = '',
}: {
  children: React.ReactNode;
  id: string;
  onFocusCapture: () => void;
  className?: string;
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      onFocusCapture={onFocusCapture}
      className={`scroll-mt-28 border border-border bg-surface p-5 sm:p-7 lg:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
      {children}
    </p>
  );
}

function AllocationLines({
  items,
  lineTotals,
}: {
  items: CartItem[];
  lineTotals: Record<string, number>;
}) {
  return (
    <ul className="divide-y divide-border">
      {items.map((item, index) => (
        <li key={item.id} className="grid grid-cols-[68px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-4">
          <Link
            href={`/product/${item.slug}`}
            aria-label={`View ${item.name}`}
            className="relative aspect-[4/5] overflow-hidden bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <Image
              src={item.image}
              alt=""
              fill
              sizes="76px"
              className="object-cover"
            />
          </Link>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
              <div className="min-w-0 flex-1">
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">
                  {`${String(index + 1).padStart(2, '0')} // ${item.modelNumber}`}
                </p>
                <Link
                  href={`/product/${item.slug}`}
                  className="block break-words font-display text-sm leading-snug text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {item.name}
                </Link>
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-foreground">
                {formatPrice(lineTotals[item.id] ?? 0)}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-muted">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full border border-border-strong/40"
                  style={{ backgroundColor: item.selectedColor.hex }}
                />
                {item.selectedColor.name}
              </span>
              {item.selectedOption && (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="break-words">
                    {item.selectedOption.label}
                    {item.selectedOption.priceDelta !== 0 && (
                      <span className="ml-1 font-mono text-[9px]">({item.selectedOption.priceDelta > 0 ? '+' : ''}{formatPrice(item.selectedOption.priceDelta)})</span>
                    )}
                  </span>
                </>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-foreground-subtle">
              <span>QTY {String(item.quantity).padStart(2, '0')}</span>
              <span>{formatPrice(item.price)} / UNIT</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TotalsLedger({
  totals,
  discountCode,
  shippingMethod,
  compact = false,
}: {
  totals: OrderTotals;
  discountCode?: string;
  shippingMethod: ShippingMethod;
  compact?: boolean;
}) {
  return (
    <dl className={`space-y-3 border-t border-border ${compact ? 'pt-4' : 'pt-5'}`}>
      <div className="flex items-center justify-between gap-4 text-small">
        <dt className="text-foreground-muted">Subtotal</dt>
        <dd className="font-mono tabular-nums text-foreground">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.discountAmount > 0 && (
        <div className="flex items-center justify-between gap-4 text-small">
          <dt className="min-w-0 text-foreground-muted">
            Privilege <span className="font-mono text-[10px]">{discountCode}</span>
          </dt>
          <dd className="shrink-0 font-mono tabular-nums text-success">−{formatPrice(totals.discountAmount)}</dd>
        </div>
      )}
      <div className="flex items-start justify-between gap-4 text-small">
        <dt className="min-w-0 text-foreground-muted">
          <span className="block">Courier estimate // demo</span>
          <span className="mt-0.5 block text-[10px] leading-relaxed text-foreground-subtle">
            {shippingMethod.name}
          </span>
        </dt>
        <dd className="shrink-0 font-mono tabular-nums text-foreground">
          {totals.shippingCost === 0 ? 'DEMO INCLUDED' : formatPrice(totals.shippingCost)}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4 text-small">
        <dt className="text-foreground-muted">Duties &amp; tax estimate</dt>
        <dd className="font-mono tabular-nums text-foreground">
          {totals.taxAmount === 0 ? 'PENDING' : formatPrice(totals.taxAmount)}
        </dd>
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
        <dt>
          <span className="block font-display text-base text-foreground">Estimated total</span>
          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">USD // tax subject to destination</span>
        </dt>
        <dd className="shrink-0 text-right">
          <PriceDisplay price={totals.total} size={compact ? 'lg' : 'xl'} />
        </dd>
      </div>
    </dl>
  );
}

function makeAddress(
  draft: CheckoutAddressDraft,
  id: string,
  label: string,
  isDefaultShipping: boolean,
  isDefaultBilling: boolean,
  fallbackPhone: string
): Address {
  return {
    id,
    label,
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    company: draft.company.trim() || undefined,
    line1: draft.line1.trim(),
    line2: draft.line2.trim() || undefined,
    city: draft.city.trim(),
    state: draft.state.trim(),
    postalCode: draft.postalCode.trim(),
    country: draft.country.trim(),
    phone: draft.phone.trim() || fallbackPhone.trim(),
    isDefaultShipping,
    isDefaultBilling,
  };
}

function validateAddressDraft(
  address: CheckoutAddressDraft,
  prefix: string,
  fallbackPhone: string,
  errors: FieldErrors
) {
  const required: Array<{ field: AddressField; label: string }> = [
    { field: 'firstName', label: 'First name' },
    { field: 'lastName', label: 'Last name' },
    { field: 'country', label: 'Country' },
    { field: 'line1', label: 'Street address' },
    { field: 'city', label: 'City' },
    { field: 'state', label: 'State / Province' },
    { field: 'postalCode', label: 'Postal code' },
  ];
  for (const field of required) {
    if (!address[field.field].trim()) {
      errors[`${prefix}.${field.field}`] = `${field.label} is required.`;
    }
  }
  const phone = address.phone.trim() || fallbackPhone.trim();
  if (!phone) {
    errors[`${prefix}.phone`] = 'A delivery phone number is required.';
  } else if (!validatePhone(phone)) {
    errors[`${prefix}.phone`] = 'Enter an international phone number with 7–15 digits.';
  }
}

function CartIssuePanel({
  issues,
  onRemove,
  onApply,
}: {
  issues: CartValidationIssue[];
  onRemove: (itemId: string) => void;
  onApply: (issue: CartValidationIssue) => void;
}) {
  if (issues.length === 0) return null;
  return (
    <div
      id="cart-integrity"
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="mb-6 scroll-mt-28 border border-danger/40 bg-danger/5 p-5 outline-none sm:p-6"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="font-mono text-label uppercase tracking-[0.15em] text-danger">
            Manifest validation // action required
          </h2>
          <ul className="mt-3 space-y-4">
            {issues.map((issue, index) => (
              <li key={`${issue.itemId}-${issue.type}-${index}`} className="border-t border-danger/15 pt-3">
                <p className="text-small leading-relaxed text-foreground">{issue.message}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(issue.type === 'product_unavailable' ||
                    issue.type === 'out_of_stock' ||
                    issue.type === 'color_unavailable' ||
                    issue.type === 'option_unavailable') && issue.itemId !== 'empty' && (
                    <button
                      type="button"
                      onClick={() => onRemove(issue.itemId)}
                      className="min-h-11 border-b border-foreground px-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      Remove affected line
                    </button>
                  )}
                  {issue.type === 'quantity_adjusted' && issue.suggestedQuantity !== undefined && (
                    <button
                      type="button"
                      onClick={() => onApply(issue)}
                      className="min-h-11 border-b border-foreground px-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      Apply available quantity
                    </button>
                  )}
                  {issue.type === 'price_updated' && issue.updatedPrice !== undefined && (
                    <button
                      type="button"
                      onClick={() => onApply(issue)}
                      className="min-h-11 border-b border-foreground px-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      Accept current valuation
                    </button>
                  )}
                  {(issue.type === 'quantity_adjusted' && issue.suggestedQuantity === undefined) && (
                    <Link
                      href="/cart"
                      className="inline-flex min-h-11 items-center border-b border-foreground px-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      Review quantities in bag
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Link href="/cart" className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] underline underline-offset-4">
            Return to allocation bag <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CheckoutExperience({
  initialShippingMethods,
}: CheckoutExperienceProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const {
    cart,
    isCartHydrated,
    cartCount,
    cartLineTotals,
    cartSubtotal,
    discountAmount,
    appliedDiscount,
    selectedShippingMethod,
    setSelectedShippingMethod,
    shippingEstimateCost,
    taxAmount,
    cartTotal,
    orderTotals,
    removeFromCart,
    syncCartItemFromValidation,
    applyDiscountCode,
    removeDiscountCode,
    clearCart,
    recordPlacedOrder,
  } = useCommerce();
  const {
    customer,
    shippingAddress,
    billingAddress,
    billingSameAsShipping,
    selectedShippingMethodId,
    activeSection,
    notes,
    isCheckoutHydrated,
    setCustomer,
    setShippingAddress,
    setBillingAddress,
    setBillingSameAsShipping,
    setSelectedShippingMethodId,
    setActiveSection,
    setNotes,
    paymentState,
    setPaymentState,
    clearCheckoutDraft,
  } = useCheckout();

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(initialShippingMethods);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingServiceError, setShippingServiceError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [cartIssues, setCartIssues] = useState<CartValidationIssue[]>([]);
  const [generalError, setGeneralError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [paymentCardholder, setPaymentCardholder] = useState('');
  const [reviewPaymentMethod, setReviewPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showTaxNote, setShowTaxNote] = useState(false);
  const [orderAttemptStatus, setOrderAttemptStatus] = useState('');

  const cardNumberRef = useRef<HTMLInputElement | null>(null);
  const expiryRef = useRef<HTMLInputElement | null>(null);
  const cvcRef = useRef<HTMLInputElement | null>(null);
  const reviewRef = useRef<HTMLElement | null>(null);
  const actionLock = useRef(false);

  const selectedShippingOption = useMemo(
    () => shippingMethods.find((method) => method.id === selectedShippingMethodId) ?? null,
    [shippingMethods, selectedShippingMethodId]
  );

  useEffect(() => {
    let active = true;
    setIsLoadingShipping(true);
    setShippingServiceError('');
    void getShippingMethods(shippingAddress.country, 0, cartSubtotal, appliedDiscount?.type === 'free_shipping')
      .then((methods) => {
        if (!active) return;
        setShippingMethods(methods);
        if (methods.length === 0) {
          setShippingServiceError('No demo delivery estimates are available for this destination. Check the selected country or return to your bag.');
          return;
        }
        const contextMethod = methods.find((method) => method.id === selectedShippingMethod.id);
        const chosenMethod = methods.find((method) => method.id === selectedShippingMethodId) ?? contextMethod ?? methods[0];
        if (chosenMethod) {
          setSelectedShippingMethodId(chosenMethod.id);
          if (
            selectedShippingMethod.id !== chosenMethod.id ||
            selectedShippingMethod.baseCost !== chosenMethod.baseCost ||
            selectedShippingMethod.name !== chosenMethod.name ||
            selectedShippingMethod.quotedCost !== chosenMethod.quotedCost
          ) {
            setSelectedShippingMethod(chosenMethod);
          }
        }
      })
      .catch(() => {
        if (!active) return;
        setShippingServiceError('Courier estimates could not be retrieved. Retry the shipping service or return to your bag.');
      })
      .finally(() => {
        if (active) setIsLoadingShipping(false);
      });
    return () => {
      active = false;
    };
  }, [
    shippingAddress.country,
    cartSubtotal,
    appliedDiscount?.type,
    selectedShippingMethod.id,
    selectedShippingMethod.name,
    selectedShippingMethod.baseCost,
    selectedShippingMethod.quotedCost,
    selectedShippingMethodId,
    setSelectedShippingMethod,
    setSelectedShippingMethodId,
  ]);

  useEffect(() => {
    if (!isCheckoutHydrated || !shippingMethods.length) return;
    if (shippingMethods.some((method) => method.id === selectedShippingMethod.id)) {
      if (selectedShippingMethodId !== selectedShippingMethod.id) {
        setSelectedShippingMethodId(selectedShippingMethod.id);
      }
    }
  }, [
    isCheckoutHydrated,
    shippingMethods,
    selectedShippingMethod.id,
    selectedShippingMethodId,
    setSelectedShippingMethodId,
  ]);

  const clearFieldError = useCallback((key: string) => {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const setCustomerField = useCallback(
    (field: keyof typeof customer, value: string) => {
      const nextCustomer = { ...customer, [field]: value };
      setCustomer(nextCustomer);
      if (field === 'firstName' || field === 'lastName') {
        const nextShipping = {
          ...shippingAddress,
          [field]: value,
        };
        setShippingAddress(nextShipping);
        if (billingSameAsShipping) setBillingAddress(nextShipping);
      }
      if (field === 'phone' && !shippingAddress.phone) {
        const nextShipping = { ...shippingAddress, phone: value };
        setShippingAddress(nextShipping);
        if (billingSameAsShipping) setBillingAddress(nextShipping);
      }
      clearFieldError(`customer.${field}`);
    },
    [
      billingSameAsShipping,
      customer,
      shippingAddress,
      setCustomer,
      setShippingAddress,
      setBillingAddress,
      clearFieldError,
    ]
  );

  const setAddressField = useCallback(
    (target: 'shipping' | 'billing', field: AddressField, value: string) => {
      const setter = target === 'shipping' ? setShippingAddress : setBillingAddress;
      const currentAddress = target === 'shipping' ? shippingAddress : billingAddress;
      const nextAddress = { ...currentAddress, [field]: value };
      setter(nextAddress);
      if (target === 'shipping' && billingSameAsShipping) {
        setBillingAddress(nextAddress);
      }
      clearFieldError(`${target}.${field}`);
      if (field === 'country') {
        setGeneralError('');
        setReviewPaymentMethod(null);
      }
    },
    [
      billingAddress,
      billingSameAsShipping,
      shippingAddress,
      setShippingAddress,
      setBillingAddress,
      clearFieldError,
    ]
  );

  const handleShippingSelection = (methodId: string) => {
    const method = shippingMethods.find((candidate) => candidate.id === methodId);
    setSelectedShippingMethodId(methodId);
    if (method) setSelectedShippingMethod(method);
    setReviewPaymentMethod(null);
    setGeneralError('');
  };

  const buildFieldErrors = useCallback((): FieldErrors => {
    const nextErrors: FieldErrors = {};
    const identityFields: Array<keyof typeof customer> = ['firstName', 'lastName', 'email', 'phone'];
    for (const field of identityFields) {
      if (!customer[field].trim()) {
        const label = field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'email' ? 'Email' : 'Phone';
        nextErrors[`customer.${field}`] = `${label} is required.`;
      }
    }
    if (customer.email.trim() && !validateEmail(customer.email)) {
      nextErrors['customer.email'] = 'Enter a valid email address, such as studio@example.com.';
    }
    if (customer.phone.trim() && !validatePhone(customer.phone)) {
      nextErrors['customer.phone'] = 'Enter an international phone number with 7–15 digits.';
    }

    validateAddressDraft(shippingAddress, 'shipping', customer.phone, nextErrors);
    if (!billingSameAsShipping) {
      validateAddressDraft(billingAddress, 'billing', customer.phone, nextErrors);
    }

    if (!paymentCardholder.trim()) {
      nextErrors['payment.cardholder'] = 'Cardholder name is required.';
    }
    const cardRaw = cardNumberRef.current?.value.trim() ?? '';
    const cardDigits = cardRaw.replace(/[\s-]/g, '');
    if (!passesLuhn(cardDigits)) {
      nextErrors['payment.cardNumber'] = 'Enter a valid 13–19 digit sandbox card number.';
    }
    const expiryValue = expiryRef.current?.value.trim() ?? '';
    const expiryMatch = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiryValue);
    if (!expiryMatch) {
      nextErrors['payment.expiry'] = 'Enter expiry in MM/YY format.';
    } else {
      const month = Number(expiryMatch[1]);
      const year = 2000 + Number(expiryMatch[2]);
      const now = new Date();
      if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        nextErrors['payment.expiry'] = 'This card has expired. Use a future sandbox expiry date.';
      }
    }
    const cvcDigits = cvcRef.current?.value.trim() ?? '';
    if (!/^\d{3,4}$/.test(cvcDigits)) {
      nextErrors['payment.cvc'] = 'Enter the 3–4 digit security code for the sandbox card.';
    }
    return nextErrors;
  }, [customer, shippingAddress, billingSameAsShipping, billingAddress, paymentCardholder]);

  const focusFirstError = useCallback((errors: FieldErrors) => {
    const first = Object.keys(errors)[0];
    if (!first) return;
    const fieldId = first === 'payment.cardNumber' ? 'payment-card-number' : first.replaceAll('.', '-');
    window.requestAnimationFrame(() => {
      const element = document.getElementById(fieldId);
      if (element instanceof HTMLElement) {
        element.focus();
        element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }, [reducedMotion]);

  const setValidationError = useCallback((message: string, step: 'client' | 'delivery' | 'settlement' | 'review' = 'review') => {
    setGeneralError(message);
    setActiveSection(step);
    const target = step === 'client' ? 'client-information' : step === 'delivery' ? 'delivery-address' : step === 'settlement' ? 'secure-settlement' : 'checkout-general-error';
    window.requestAnimationFrame(() => {
      const element = document.getElementById(target);
      if (element instanceof HTMLElement) {
        element.focus();
        element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }, [reducedMotion, setActiveSection]);

  const runPreflight = useCallback(async (): Promise<PaymentMethod | null> => {
    setGeneralError('');
    setCartIssues([]);
    setFieldErrors({});

    if (cart.length === 0) {
      setValidationError('Your allocation bag is empty. Add an instrument before continuing.', 'client');
      return null;
    }

    const errors = buildFieldErrors();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstField = Object.keys(errors)[0];
      const step = firstField.startsWith('customer.') ? 'client' : firstField.startsWith('shipping.') || firstField.startsWith('billing.') ? 'delivery' : 'settlement';
      setActiveSection(step);
      focusFirstError(errors);
      return null;
    }

    if (isLoadingShipping || shippingServiceError || shippingMethods.length === 0 || !selectedShippingOption) {
            setValidationError(shippingServiceError || (isLoadingShipping ? 'Demo delivery estimates are still refreshing for this destination. Wait for the updated options, then continue.' : 'A demo delivery estimate is not available for this destination. Retry the estimate lookup.'), 'delivery');
      return null;
    }

    if (selectedShippingMethod.id !== selectedShippingOption.id) {
      setSelectedShippingMethod(selectedShippingOption);
      setValidationError('The demo delivery estimate changed. Review the revised total, then continue.', 'delivery');
      return null;
    }

    try {
      const shippingAddressRecord = makeAddress(
        shippingAddress,
        'checkout-shipping',
        'Delivery Address',
        true,
        billingSameAsShipping,
        customer.phone
      );
      const billingAddressRecord = billingSameAsShipping
        ? { ...shippingAddressRecord, id: 'checkout-billing', label: 'Billing Address', isDefaultShipping: false, isDefaultBilling: true }
        : makeAddress(
            billingAddress,
            'checkout-billing',
            'Billing Address',
            false,
            true,
            customer.phone
          );

      const addressResults = await Promise.all([
        validateDeliveryAddress(shippingAddressRecord, 0),
        ...(billingSameAsShipping ? [] : [validateDeliveryAddress(billingAddressRecord, 0)]),
      ]);
      if (!addressResults[0].valid || (addressResults[1] && !addressResults[1].valid)) {
        const addressErrors: FieldErrors = {};
        const mapServiceErrors = (result: (typeof addressResults)[number], prefix: 'shipping' | 'billing') => {
          for (const [key, message] of Object.entries(result.fieldErrors ?? {})) {
            const fieldKey = key === 'line1' ? 'line1' : key === 'line2' ? 'line2' : key;
            addressErrors[`${prefix}.${fieldKey}`] = message;
          }
        };
        if (!addressResults[0].valid) mapServiceErrors(addressResults[0], 'shipping');
        if (addressResults[1] && !addressResults[1].valid) mapServiceErrors(addressResults[1], 'billing');
        setFieldErrors(addressErrors);
        setActiveSection('delivery');
        focusFirstError(addressErrors);
        setPaymentState('failed');
        return null;
      }

      const cartValidation = await validateCartForCheckout(cart, 0);
      if (!cartValidation.valid) {
        setCartIssues(cartValidation.issues);
        setPaymentState('failed');
        window.requestAnimationFrame(() => {
          const target = document.getElementById('cart-integrity');
          if (target instanceof HTMLElement) {
            target.focus();
            target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
          }
        });
        return null;
      }

      if (appliedDiscount) {
        const discountCheck = await validateDiscountCode(appliedDiscount.code, cartSubtotal);
        if (!discountCheck.valid || Math.abs(discountCheck.discountAmount - discountAmount) > 0.01) {
          removeDiscountCode();
          setPromoError(true);
          setPromoMessage(discountCheck.message || 'The allocation code changed. It has been removed; review your revised total.');
          setPaymentState('failed');
          setValidationError('The allocation privilege could not be confirmed and has been removed. Review the updated total before continuing.', 'review');
          return null;
        }
      }

      const totalValidation = validateOrderTotals(orderTotals);
      if (
        !totalValidation.valid ||
        orderTotals.subtotal !== cartSubtotal ||
        orderTotals.discountAmount !== discountAmount ||
        orderTotals.shippingCost !== shippingEstimateCost ||
        orderTotals.taxAmount !== taxAmount ||
        orderTotals.total !== cartTotal
      ) {
        setPaymentState('failed');
        setValidationError(totalValidation.message || 'The allocation total changed. Review the updated summary.', 'review');
        return null;
      }

      const cardDigits = cardNumberRef.current?.value.replace(/\D/g, '') ?? '';
      const safeMethod: PaymentMethod = {
        id: 'demo-method',
        provider: 'demo',
        type: 'card',
        brand: identifyCardBrand(cardDigits),
        last4: cardDigits.slice(-4),
        cardholderName: paymentCardholder.trim(),
      };
      setReviewPaymentMethod(safeMethod);
      setPaymentState('ready_for_review');
      return safeMethod;
    } catch (error) {
      setPaymentState('failed');
      setValidationError(
        error instanceof Error
          ? `Checkout validation failed: ${error.message}`
          : 'Checkout validation could not be completed. Retry or return to your bag.',
        'review'
      );
      return null;
    }
  }, [
    cart,
    cartSubtotal,
    discountAmount,
    appliedDiscount,
    shippingAddress,
    billingAddress,
    billingSameAsShipping,
    customer,
    selectedShippingOption,
    selectedShippingMethod,
    shippingMethods.length,
    shippingServiceError,
    isLoadingShipping,
    orderTotals,
    shippingEstimateCost,
    taxAmount,
    cartTotal,
    paymentCardholder,
    buildFieldErrors,
    focusFirstError,
    reducedMotion,
    removeDiscountCode,
    setActiveSection,
    setPaymentState,
    setSelectedShippingMethod,
    setValidationError,
  ]);

  const handleReview = async () => {
    if (actionLock.current || isWorking) return;
    actionLock.current = true;
    setIsWorking(true);
    try {
      const safePaymentMethod = await runPreflight();
      if (!safePaymentMethod) return;
      setActiveSection('review');
      window.requestAnimationFrame(() => {
        reviewRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    } finally {
      actionLock.current = false;
      setIsWorking(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (actionLock.current || isWorking) return;
    actionLock.current = true;
    setIsWorking(true);
    setOrderAttemptStatus('Revalidating inventory, courier, privilege code, and settlement architecture…');
    try {
      const safePaymentMethod = await runPreflight();
      if (!safePaymentMethod) return;

      const shippingMethod = shippingMethods.find((method) => method.id === selectedShippingMethodId);
      if (!shippingMethod) {
        setValidationError('Selected courier method could not be resolved. Choose an available method and retry.', 'delivery');
        return;
      }

      const shippingAddressRecord = makeAddress(
        shippingAddress,
        'checkout-shipping',
        'Delivery Address',
        true,
        billingSameAsShipping,
        customer.phone
      );
      const billingAddressRecord = billingSameAsShipping
        ? { ...shippingAddressRecord, id: 'checkout-billing', label: 'Billing Address', isDefaultShipping: false, isDefaultBilling: true }
        : makeAddress(
            billingAddress,
            'checkout-billing',
            'Billing Address',
            false,
            true,
            customer.phone
          );

      setPaymentState('intent_created');
      const result = await finalizeOrder({
        customer,
        shippingAddress: shippingAddressRecord,
        billingAddress: billingAddressRecord,
        shippingMethod,
        paymentMethod: safePaymentMethod,
        items: cart,
        totals: orderTotals,
        discountCode: appliedDiscount?.code,
        notes: notes.trim() || undefined,
      });

      if (result.paymentResult.status === 'declined') {
        setPaymentState('failed');
        setActiveSection('settlement');
        setValidationError(
          result.paymentResult.errorMessage ?? 'Settlement could not be authorized by the demonstration adapter. The allocation bag remains unchanged.',
          'settlement'
        );
        return;
      }
      if (!result.order) {
        throw new Error('No allocation record was returned. Your bag remains available to retry.');
      }

      // The local adapter records a pending order only. It never asserts that a
      // bank authorized or captured funds; the order is clearly marked pending.
      setPaymentState('provider_required');
      recordPlacedOrder(result.order);
      clearCart(true);
      clearCheckoutDraft();
      router.push(`/order/${encodeURIComponent(result.order.id)}/confirmation`);
    } catch (error) {
      setPaymentState('failed');
      setValidationError(
        error instanceof Error
          ? `${error.message} Your allocation bag has been preserved; review the details and retry.`
          : 'The order service is unavailable. Your allocation bag has been preserved; retry or return to the bag.',
        'review'
      );
    } finally {
      actionLock.current = false;
      setIsWorking(false);
      setOrderAttemptStatus('');
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeSection === 'review') {
      void handlePlaceOrder();
    } else {
      void handleReview();
    }
  };

  const scrollToSection = (section: 'client' | 'delivery' | 'settlement') => {
    const ids = {
      client: 'client-information',
      delivery: 'delivery-address',
      settlement: 'secure-settlement',
    } as const;
    setActiveSection(section);
    window.requestAnimationFrame(() => {
      const target = document.getElementById(ids[section]);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        target.querySelector('h2')?.focus();
      }
    });
  };

  const applyPromo = async () => {
    if (!promoCode.trim() || isApplyingPromo) return;
    setIsApplyingPromo(true);
    setPromoError(false);
    setPromoMessage('');
    try {
      const result = await applyDiscountCode(promoCode);
      setPromoMessage(result.message);
      setPromoError(!result.valid);
      if (result.valid) {
        setPromoCode('');
        setReviewPaymentMethod(null);
      }
    } catch {
      setPromoError(true);
      setPromoMessage('Allocation privilege service is unavailable. Try again shortly.');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleCartIssueApply = (issue: CartValidationIssue) => {
    syncCartItemFromValidation(issue.itemId, {
      quantity: issue.suggestedQuantity,
      price: issue.updatedPrice,
    });
    setCartIssues((current) => current.filter((item) => item.itemId !== issue.itemId));
    setGeneralError('Updated allocation details are in the bag. Review the refreshed total and continue.');
  };

  const handleCartIssueRemove = (itemId: string) => {
    removeFromCart(itemId);
    setCartIssues((current) => current.filter((item) => item.itemId !== itemId));
  };

  const handleCardFieldChange = (field: string) => {
    clearFieldError(`payment.${field}`);
    setReviewPaymentMethod(null);
    setPaymentState('not_started');
    setGeneralError('');
  };

  const toggleBillingSame = (same: boolean) => {
    setBillingSameAsShipping(same);
    if (!same && !billingAddress.line1 && !billingAddress.city) {
      setBillingAddress({ ...shippingAddress });
    }
    setReviewPaymentMethod(null);
  };

  const checkoutReady = isCartHydrated && isCheckoutHydrated;

  if (!checkoutReady) return <CheckoutSkeleton />;

  if (cart.length === 0) {
    return (
      <section className="bg-background pb-section-md pt-10 sm:pt-14">
        <Container size="wide">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <TechnicalCode>NOIRÉ // DEMO CHECKOUT</TechnicalCode>
            <Link href="/cart" className="inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.13em] text-foreground-muted hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Return to allocation bag
            </Link>
          </div>
          <EmptyState
            code="CHECKOUT // NO ACTIVE MANIFEST"
            title="An allocation requires an instrument."
            description="Your bag is empty or a local demo record has already been created. Return to the archive to select an instrument before starting the browser-local checkout demonstration."
            icon={<CreditCard className="h-6 w-6" aria-hidden="true" />}
            primaryAction={
              <Link href="/shop">
                <Button withArrow="right">Explore the archive</Button>
              </Link>
            }
            secondaryAction={
              <Link href="/cart" className="inline-flex min-h-11 items-center border-b border-foreground font-mono text-[10px] uppercase tracking-[0.13em]">
                Review allocation bag
              </Link>
            }
            className="min-h-[340px]"
          />
        </Container>
      </section>
    );
  }

  const itemCountLabel = `${String(cartCount).padStart(2, '0')} UNIT${cartCount === 1 ? '' : 'S'}`;
  const promoThresholdMessage =
    appliedDiscount?.minOrderAmount && cartSubtotal < appliedDiscount.minOrderAmount
      ? `Minimum order value ${formatPrice(appliedDiscount.minOrderAmount)} required.`
      : '';

  return (
    <main id="main-content" className="bg-background pb-28 text-foreground lg:pb-0">
      <div className="surface-obsidian border-b border-border py-3.5">
        <Container size="wide" className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-inverse/70 sm:text-[10px]">
            <span className="shrink-0">Manifest</span>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate text-foreground-inverse">Demo Checkout</span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-inverse/60 sm:text-[10px]">
            CHECKOUT // NR-{new Date().getFullYear()} · {itemCountLabel}
          </span>
        </Container>
      </div>

      <Container size="wide" className="py-8 sm:py-12 lg:py-14">
        <header className="mb-8 border-b border-border pb-7 sm:mb-10 sm:pb-9">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="mb-3 font-mono text-label uppercase tracking-[0.16em] text-foreground-subtle">NOIRÉ // PRIVATE CLIENT COMMISSION</p>
              <h1 className="font-display text-h1 leading-[1.04] text-foreground">Checkout demonstration<span className="text-accent">.</span></h1>
              <p className="mt-3 max-w-2xl text-small leading-relaxed text-foreground-muted sm:text-body">
                Review the contact details, provisional courier estimate, and masked demo payment method. No payment or fulfillment service is connected.
              </p>
            </div>
            <Link href="/cart" className="inline-flex min-h-11 items-center gap-2 border-b border-border-strong/70 font-mono text-[10px] uppercase tracking-[0.13em] text-foreground-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Edit allocation bag
            </Link>
          </div>

          <nav aria-label="Checkout dossier sections" className="mt-7 grid grid-cols-2 border-y border-border sm:grid-cols-4">
            {([
              ['client', '01', 'Client'],
              ['delivery', '02', 'Delivery'],
              ['settlement', '03', 'Settlement'],
              ['review', '04', 'Review'],
            ] as const).map(([section, number, label]) => (
              <button
                key={section}
                type="button"
                onClick={() => section === 'review' ? void handleReview() : scrollToSection(section)}
                aria-current={activeSection === section ? 'step' : undefined}
                className={`flex min-h-12 items-center gap-2 border-b-2 px-2 text-left font-mono text-[9px] uppercase tracking-[0.12em] transition-colors sm:px-4 ${activeSection === section ? 'border-foreground text-foreground' : 'border-transparent text-foreground-subtle hover:text-foreground'}`}
              >
                <span>{`${number} //`}</span><span>{label}</span>
              </button>
            ))}
          </nav>
        </header>

        <CartIssuePanel issues={cartIssues} onRemove={handleCartIssueRemove} onApply={handleCartIssueApply} />

        {generalError && (
          <div
            id="checkout-general-error"
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="mb-6 scroll-mt-28 border border-danger/35 bg-danger/5 p-4 outline-none sm:p-5"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-mono text-label uppercase tracking-[0.13em] text-danger">Settlement needs attention</p>
                <p className="mt-1.5 text-small leading-relaxed text-foreground">{generalError}</p>
                <Link href="/cart" className="mt-2 inline-flex min-h-11 items-center border-b border-foreground font-mono text-[10px] uppercase tracking-[0.12em]">Review bag and continue</Link>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} noValidate>
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
            <div className="min-w-0 space-y-6 lg:col-span-7 xl:col-span-8">
              <SectionFrame
                id="client-information"
                onFocusCapture={() => setActiveSection('client')}
              >
                <SectionHeading
                  number="01"
                  title="Client information"
                  detail="Contact details attached only to this browser-local demo order record."
                  id="client-heading"
                  requiredLabel="Required for local record"
                />
                <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                  <Field
                    id="customer-firstName"
                    label="First name"
                    value={customer.firstName}
                    onChange={(value) => setCustomerField('firstName', value)}
                    error={getFieldError(fieldErrors, 'customer.firstName')}
                    autoComplete="given-name"
                    disabled={isWorking}
                  />
                  <Field
                    id="customer-lastName"
                    label="Last name"
                    value={customer.lastName}
                    onChange={(value) => setCustomerField('lastName', value)}
                    error={getFieldError(fieldErrors, 'customer.lastName')}
                    autoComplete="family-name"
                    disabled={isWorking}
                  />
                  <Field
                    id="customer-email"
                    label="Email address"
                    value={customer.email}
                    onChange={(value) => setCustomerField('email', value)}
                    error={getFieldError(fieldErrors, 'customer.email')}
                    hint="The browser-local demo order record will be associated with this email."
                    type="email"
                    autoComplete="email"
                    disabled={isWorking}
                  />
                  <Field
                    id="customer-phone"
                    label="Phone"
                    value={customer.phone}
                    onChange={(value) => setCustomerField('phone', value)}
                    error={getFieldError(fieldErrors, 'customer.phone')}
                    hint="Include a country code for consistent local record formatting."
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    disabled={isWorking}
                  />
                </div>
                <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-[11px] leading-relaxed text-foreground-subtle">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Client profile prefill is supported by the checkout state contract; authenticated customer details can populate this dossier when account services are connected.
                </p>
              </SectionFrame>

              <SectionFrame
                id="delivery-address"
                onFocusCapture={() => setActiveSection('delivery')}
              >
                <SectionHeading
                  number="02"
                  title="Delivery address"
                  detail="Destination details remain in the browser-local demo order; no delivery provider is connected."
                  id="delivery-heading"
                  requiredLabel="Required for local record"
                />
                <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                  <Field
                    id="shipping-firstName"
                    label="First name"
                    value={shippingAddress.firstName}
                    onChange={(value) => setAddressField('shipping', 'firstName', value)}
                    error={getFieldError(fieldErrors, 'shipping.firstName')}
                    autoComplete="shipping given-name"
                    disabled={isWorking}
                  />
                  <Field
                    id="shipping-lastName"
                    label="Last name"
                    value={shippingAddress.lastName}
                    onChange={(value) => setAddressField('shipping', 'lastName', value)}
                    error={getFieldError(fieldErrors, 'shipping.lastName')}
                    autoComplete="shipping family-name"
                    disabled={isWorking}
                  />
                  <SelectField
                    id="shipping-country"
                    label="Country / Region"
                    value={shippingAddress.country}
                    onChange={(value) => setAddressField('shipping', 'country', value)}
                    options={COUNTRIES.map((country) => ({ value: country, label: country }))}
                    error={getFieldError(fieldErrors, 'shipping.country')}
                    disabled={isWorking}
                  />
                  <Field
                    id="shipping-company"
                    label="Company / Studio"
                    value={shippingAddress.company}
                    onChange={(value) => setAddressField('shipping', 'company', value)}
                    error={getFieldError(fieldErrors, 'shipping.company')}
                    autoComplete="organization"
                    required={false}
                    disabled={isWorking}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      id="shipping-line1"
                      label="Address"
                      value={shippingAddress.line1}
                      onChange={(value) => setAddressField('shipping', 'line1', value)}
                      error={getFieldError(fieldErrors, 'shipping.line1')}
                      autoComplete="shipping address-line1"
                      disabled={isWorking}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Field
                      id="shipping-line2"
                      label="Apartment / Suite / Floor"
                      value={shippingAddress.line2}
                      onChange={(value) => setAddressField('shipping', 'line2', value)}
                      error={getFieldError(fieldErrors, 'shipping.line2')}
                      autoComplete="shipping address-line2"
                      required={false}
                      disabled={isWorking}
                    />
                  </div>
                  <Field
                    id="shipping-city"
                    label="City"
                    value={shippingAddress.city}
                    onChange={(value) => setAddressField('shipping', 'city', value)}
                    error={getFieldError(fieldErrors, 'shipping.city')}
                    autoComplete="shipping address-level2"
                    disabled={isWorking}
                  />
                  <Field
                    id="shipping-state"
                    label="State / Province"
                    value={shippingAddress.state}
                    onChange={(value) => setAddressField('shipping', 'state', value)}
                    error={getFieldError(fieldErrors, 'shipping.state')}
                    autoComplete="shipping address-level1"
                    disabled={isWorking}
                  />
                  <Field
                    id="shipping-postalCode"
                    label="Postal code"
                    value={shippingAddress.postalCode}
                    onChange={(value) => setAddressField('shipping', 'postalCode', value)}
                    error={getFieldError(fieldErrors, 'shipping.postalCode')}
                    autoComplete="shipping postal-code"
                    disabled={isWorking}
                  />
                  <Field
                    id="shipping-phone"
                    label="Delivery phone"
                    value={shippingAddress.phone || customer.phone}
                    onChange={(value) => setAddressField('shipping', 'phone', value)}
                    error={getFieldError(fieldErrors, 'shipping.phone')}
                    autoComplete="shipping tel"
                    type="tel"
                    inputMode="tel"
                    hint="Stored only in this browser-local demo order; no courier service is connected."
                    disabled={isWorking}
                  />
                </div>

                <aside role="note" className="mt-6 border-t border-border pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">Browser-local demo storage</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-foreground-muted">
                    Contact and address drafts are kept in this tab&apos;s session storage. A placed demo order, including its contact and address details, is retained in this browser&apos;s local storage. These browser stores are not account-protected or encrypted by this application; use test contact details only.
                  </p>
                </aside>

                <div className="mt-7 border-t border-border pt-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <PanelLabel>Delivery estimate // demo</PanelLabel>
                      <h3 className="mt-1.5 font-display text-base text-foreground">Demo delivery estimate</h3>
                    </div>
                    {isLoadingShipping && <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle"><RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />Refreshing demo estimates</span>}
                  </div>

                  {shippingServiceError && (
                    <div role="alert" className="mb-4 border border-danger/30 bg-danger/5 p-4">
                      <p className="text-small text-foreground">{shippingServiceError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShippingServiceError('');
                          void getShippingMethods(shippingAddress.country, 0, cartSubtotal, appliedDiscount?.type === 'free_shipping')
                            .then((methods) => {
                              setShippingMethods(methods);
                              if (methods[0]) handleShippingSelection(methods[0].id);
                            })
                            .catch(() => setShippingServiceError('Demo delivery estimates remain unavailable. Retry later or return to your bag.'));
                        }}
                        className="mt-2 inline-flex min-h-11 items-center gap-2 border-b border-foreground font-mono text-[10px] uppercase tracking-[0.12em]"
                      >
                        Retry demo estimate lookup <RefreshCw className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  <fieldset disabled={isWorking || isLoadingShipping || shippingMethods.length === 0}>
                    <legend className="sr-only">Select a shipping method</legend>
                    <div className="divide-y divide-border border-y border-border">
                      {shippingMethods.map((method) => {
                        const checked = selectedShippingMethodId === method.id;
                        const methodCost =
                          method.id === selectedShippingMethod.id
                            ? shippingEstimateCost
                            : method.quotedCost ?? method.baseCost;
                        return (
                          <label
                            key={method.id}
                            className={`grid min-h-[82px] cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-3 py-4 transition-colors ${checked ? 'bg-surface-muted/50' : ''}`}
                          >
                            <input
                              type="radio"
                              name="shipping-method"
                              value={method.id}
                              checked={checked}
                              onChange={() => handleShippingSelection(method.id)}
                              className="mt-1 h-4 w-4 accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                            />
                            <span className="min-w-0">
                              <span className="block break-words font-mono text-[10px] uppercase tracking-[0.11em] text-foreground">{method.name}</span>
                              <span className="mt-1 block text-[11px] leading-relaxed text-foreground-muted">{method.estimatedWindow}</span>
                              <span className="mt-1 block text-[10px] leading-relaxed text-foreground-subtle">{method.description}</span>
                            </span>
                            <span className="shrink-0 text-right font-mono text-xs tabular-nums text-foreground">
                              {methodCost === 0 ? 'DEMO INCLUDED' : formatPrice(methodCost)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-foreground-subtle">
                    <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Static local demo estimates only: no live quote, insurance policy, booking, tracking, or dispatch is connected.
                  </p>
                </div>
              </SectionFrame>

              <SectionFrame
                id="secure-settlement"
                onFocusCapture={() => setActiveSection('settlement')}
              >
                <SectionHeading
                  number="03"
                  title="Payment demonstration"
                  detail="No payment provider is connected. This preview can create a pending local record only."
                  id="settlement-heading"
                  requiredLabel="Sandbox input required"
                />
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border border-border p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-surface-muted" aria-hidden="true">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-foreground">Payment card</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-foreground-muted">Card fields are an isolated demo UI seam. A production integration must replace them with provider-hosted Elements.</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.11em] text-foreground-subtle">
                    <LockKeyhole className="h-3 w-3" aria-hidden="true" /> Demo adapter · no charge
                  </span>
                </div>

                <div className="border border-accent/25 bg-accent/5 p-4 text-[11px] leading-relaxed text-foreground-muted">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent">Security boundary // read before entry</p>
                  <p className="mt-2">
                    This frontend is not connected to a payment provider. Do not enter a real card. The local adapter accepts sandbox-only values for layout and failure-path testing; it stores no card number, security code, expiry, or provider token in application state or browser storage, and it does not authorize or capture funds.
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-foreground-subtle">Sandbox path: a Luhn-valid test number ending in 0002 triggers a decline.</p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="payment-cardholder" className="mb-2 block font-mono text-label uppercase tracking-[0.12em] text-foreground">Cardholder name</label>
                    <input
                      id="payment-cardholder"
                      type="text"
                      value={paymentCardholder}
                      onChange={(event) => {
                        setPaymentCardholder(event.target.value);
                        handleCardFieldChange('cardholder');
                      }}
                      autoComplete="off"
                      maxLength={120}
                      required
                      disabled={isWorking}
                      aria-invalid={Boolean(fieldErrors['payment.cardholder'])}
                      aria-describedby={fieldErrors['payment.cardholder'] ? 'payment-cardholder-error' : undefined}
                      className={`h-11 w-full rounded-xs border bg-surface px-3.5 text-body text-foreground focus:outline-none ${fieldErrors['payment.cardholder'] ? 'border-danger focus:border-danger' : 'border-border focus:border-foreground'}`}
                    />
                    {fieldErrors['payment.cardholder'] && <p id="payment-cardholder-error" role="alert" className="mt-2 font-mono text-caption text-danger">{fieldErrors['payment.cardholder']}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="payment-card-number" className="mb-2 block font-mono text-label uppercase tracking-[0.12em] text-foreground">Card number</label>
                    <input
                      ref={cardNumberRef}
                      id="payment-card-number"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={23}
                      placeholder="Sandbox card number"
                      required
                      disabled={isWorking}
                      aria-invalid={Boolean(fieldErrors['payment.cardNumber'])}
                      aria-describedby={fieldErrors['payment.cardNumber'] ? 'payment-card-number-error' : 'payment-sandbox-hint'}
                      onChange={() => handleCardFieldChange('cardNumber')}
                      className={`h-11 w-full rounded-xs border bg-surface px-3.5 font-mono text-sm tracking-[0.1em] text-foreground placeholder:font-sans placeholder:tracking-normal focus:outline-none ${fieldErrors['payment.cardNumber'] ? 'border-danger focus:border-danger' : 'border-border focus:border-foreground'}`}
                    />
                    {fieldErrors['payment.cardNumber'] && <p id="payment-card-number-error" role="alert" className="mt-2 font-mono text-caption text-danger">{fieldErrors['payment.cardNumber']}</p>}
                  </div>
                  <div>
                    <label htmlFor="payment-expiry" className="mb-2 block font-mono text-label uppercase tracking-[0.12em] text-foreground">Expiry // MM/YY</label>
                    <input
                      ref={expiryRef}
                      id="payment-expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={5}
                      placeholder="MM/YY"
                      required
                      disabled={isWorking}
                      aria-invalid={Boolean(fieldErrors['payment.expiry'])}
                      aria-describedby={fieldErrors['payment.expiry'] ? 'payment-expiry-error' : undefined}
                      onChange={() => handleCardFieldChange('expiry')}
                      className={`h-11 w-full rounded-xs border bg-surface px-3.5 font-mono text-sm tracking-[0.1em] text-foreground placeholder:font-sans placeholder:tracking-normal focus:outline-none ${fieldErrors['payment.expiry'] ? 'border-danger focus:border-danger' : 'border-border focus:border-foreground'}`}
                    />
                    {fieldErrors['payment.expiry'] && <p id="payment-expiry-error" role="alert" className="mt-2 font-mono text-caption text-danger">{fieldErrors['payment.expiry']}</p>}
                  </div>
                  <div>
                    <label htmlFor="payment-cvc" className="mb-2 block font-mono text-label uppercase tracking-[0.12em] text-foreground">Security code // CVC</label>
                    <input
                      ref={cvcRef}
                      id="payment-cvc"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      placeholder="•••"
                      required
                      disabled={isWorking}
                      aria-invalid={Boolean(fieldErrors['payment.cvc'])}
                      aria-describedby={fieldErrors['payment.cvc'] ? 'payment-cvc-error' : undefined}
                      onChange={() => handleCardFieldChange('cvc')}
                      className={`h-11 w-full rounded-xs border bg-surface px-3.5 font-mono text-sm tracking-[0.1em] text-foreground placeholder:font-sans placeholder:tracking-normal focus:outline-none ${fieldErrors['payment.cvc'] ? 'border-danger focus:border-danger' : 'border-border focus:border-foreground'}`}
                    />
                    {fieldErrors['payment.cvc'] && <p id="payment-cvc-error" role="alert" className="mt-2 font-mono text-caption text-danger">{fieldErrors['payment.cvc']}</p>}
                  </div>
                </div>
                <p id="payment-sandbox-hint" className="mt-3 text-[10px] leading-relaxed text-foreground-subtle">
                  Raw entry remains in these isolated, uncontrolled fields only. The service receives a masked demo method (brand and last four); raw PAN, CVC, and expiry never enter React state, CommerceContext, sessionStorage, or localStorage. A live release must use the payment provider&apos;s hosted Elements.
                </p>

                <div className="mt-6 border-t border-border pt-5">
                  <label className="flex min-h-12 cursor-pointer items-start gap-3 text-small text-foreground">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(event) => toggleBillingSame(event.target.checked)}
                      disabled={isWorking}
                      className="mt-0.5 h-4 w-4 accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    />
                    <span>Billing address is the same as delivery address</span>
                  </label>
                </div>

                {!billingSameAsShipping && (
                  <div className="mt-5 border-t border-border pt-6">
                    <div className="mb-5">
                      <PanelLabel>Billing // separate destination</PanelLabel>
                      <h3 className="mt-1.5 font-display text-base text-foreground">Billing address</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                      <Field id="billing-firstName" label="First name" value={billingAddress.firstName} onChange={(value) => setAddressField('billing', 'firstName', value)} error={getFieldError(fieldErrors, 'billing.firstName')} autoComplete="billing given-name" disabled={isWorking} />
                      <Field id="billing-lastName" label="Last name" value={billingAddress.lastName} onChange={(value) => setAddressField('billing', 'lastName', value)} error={getFieldError(fieldErrors, 'billing.lastName')} autoComplete="billing family-name" disabled={isWorking} />
                      <SelectField id="billing-country" label="Country / Region" value={billingAddress.country} onChange={(value) => setAddressField('billing', 'country', value)} options={COUNTRIES.map((country) => ({ value: country, label: country }))} error={getFieldError(fieldErrors, 'billing.country')} disabled={isWorking} />
                      <Field id="billing-company" label="Company / Studio" value={billingAddress.company} onChange={(value) => setAddressField('billing', 'company', value)} error={getFieldError(fieldErrors, 'billing.company')} autoComplete="billing organization" required={false} disabled={isWorking} />
                      <div className="sm:col-span-2"><Field id="billing-line1" label="Address" value={billingAddress.line1} onChange={(value) => setAddressField('billing', 'line1', value)} error={getFieldError(fieldErrors, 'billing.line1')} autoComplete="billing address-line1" disabled={isWorking} /></div>
                      <div className="sm:col-span-2"><Field id="billing-line2" label="Apartment / Suite / Floor" value={billingAddress.line2} onChange={(value) => setAddressField('billing', 'line2', value)} error={getFieldError(fieldErrors, 'billing.line2')} autoComplete="billing address-line2" required={false} disabled={isWorking} /></div>
                      <Field id="billing-city" label="City" value={billingAddress.city} onChange={(value) => setAddressField('billing', 'city', value)} error={getFieldError(fieldErrors, 'billing.city')} autoComplete="billing address-level2" disabled={isWorking} />
                      <Field id="billing-state" label="State / Province" value={billingAddress.state} onChange={(value) => setAddressField('billing', 'state', value)} error={getFieldError(fieldErrors, 'billing.state')} autoComplete="billing address-level1" disabled={isWorking} />
                      <Field id="billing-postalCode" label="Postal code" value={billingAddress.postalCode} onChange={(value) => setAddressField('billing', 'postalCode', value)} error={getFieldError(fieldErrors, 'billing.postalCode')} autoComplete="billing postal-code" disabled={isWorking} />
                      <Field id="billing-phone" label="Phone" value={billingAddress.phone || customer.phone} onChange={(value) => setAddressField('billing', 'phone', value)} error={getFieldError(fieldErrors, 'billing.phone')} autoComplete="billing tel" type="tel" inputMode="tel" disabled={isWorking} />
                    </div>
                  </div>
                )}

                <div className="mt-6 border-t border-border pt-5">
                  <label htmlFor="checkout-notes" className="mb-2 block font-mono text-label uppercase tracking-[0.12em] text-foreground">Private dispatch note <span className="text-foreground-subtle">{'// optional'}</span></label>
                  <textarea
                    id="checkout-notes"
                    rows={3}
                    maxLength={500}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    disabled={isWorking}
                    placeholder="Access notes, preferred receiving window, or commissioning detail"
                    className="w-full resize-y border border-border bg-surface px-3.5 py-3 text-small text-foreground placeholder:text-foreground-subtle focus:border-foreground focus:outline-none disabled:opacity-50"
                  />
                  <p className="mt-2 text-[10px] text-foreground-subtle">{notes.length} / 500 characters</p>
                </div>
              </SectionFrame>

              {activeSection === 'review' && (
                <section
                  id="final-review"
                  ref={reviewRef}
                  tabIndex={-1}
                  aria-labelledby="review-heading"
                  className="scroll-mt-28 border border-foreground bg-surface p-5 outline-none sm:p-7 lg:p-8"
                >
                  <SectionHeading
                    number="04"
                    title="Final review"
                    detail="Review the contact, demo delivery estimate, masked sandbox method, and instruments before saving a browser-local record. No payment or fulfillment operation will occur."
                    id="review-heading"
                    requiredLabel="Demo-only review"
                  />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ReviewBlock
                      title="Client"
                      editLabel="Edit client"
                      onEdit={() => scrollToSection('client')}
                    >
                      <p className="text-small font-medium text-foreground">{customer.firstName} {customer.lastName}</p>
                      <p className="mt-1 break-all text-small text-foreground-muted">{customer.email}</p>
                      <p className="mt-1 text-small text-foreground-muted">{customer.phone}</p>
                    </ReviewBlock>
                    <ReviewBlock
                      title="Delivery"
                      editLabel="Edit address"
                      onEdit={() => scrollToSection('delivery')}
                    >
                      <p className="text-small font-medium text-foreground">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      {shippingAddress.company && <p className="mt-1 text-small text-foreground-muted">{shippingAddress.company}</p>}
                      <p className="mt-1 break-words text-small text-foreground-muted">{shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}</p>
                      <p className="mt-1 text-small text-foreground-muted">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                      <p className="mt-1 text-small text-foreground-muted">{shippingAddress.country}</p>
                    </ReviewBlock>
                    {!billingSameAsShipping && (
                      <ReviewBlock
                        title="Billing address"
                        editLabel="Edit billing"
                        onEdit={() => scrollToSection('settlement')}
                      >
                        <p className="text-small font-medium text-foreground">{billingAddress.firstName} {billingAddress.lastName}</p>
                        <p className="mt-1 break-words text-small text-foreground-muted">{billingAddress.line1}{billingAddress.line2 ? `, ${billingAddress.line2}` : ''}</p>
                        <p className="mt-1 text-small text-foreground-muted">{billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}</p>
                        <p className="mt-1 text-small text-foreground-muted">{billingAddress.country}</p>
                      </ReviewBlock>
                    )}
                    <ReviewBlock
                      title="Courier method"
                      editLabel="Edit delivery"
                      onEdit={() => scrollToSection('delivery')}
                    >
                      <p className="text-small font-medium text-foreground">{selectedShippingOption?.name ?? 'Unavailable'}</p>
                      <p className="mt-1 text-small text-foreground-muted">{selectedShippingOption?.estimatedWindow}</p>
                      <p className="mt-1 text-small text-foreground-muted">{selectedShippingOption?.estimatedDispatch}</p>
                    </ReviewBlock>
                    <ReviewBlock
                      title="Settlement method"
                      editLabel="Edit payment"
                      onEdit={() => scrollToSection('settlement')}
                    >
                      <p className="text-small font-medium text-foreground">
                        {reviewPaymentMethod ? `${reviewPaymentMethod.brand} •••• ${reviewPaymentMethod.last4}` : 'Re-enter sandbox card details to review'}
                      </p>
                      <p className="mt-1 text-small text-foreground-muted">No live authorization or capture will occur in this demo.</p>
                    </ReviewBlock>
                  </div>

                  <div className="mt-6 border-t border-border pt-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <PanelLabel>Items // {itemCountLabel}</PanelLabel>
                        <h3 className="mt-1.5 font-display text-base text-foreground">In this allocation</h3>
                      </div>
                      <Link href="/cart" className="inline-flex min-h-11 items-center border-b border-border-strong/70 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-muted">Edit items</Link>
                    </div>
                    <AllocationLines items={cart} lineTotals={cartLineTotals} />
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-6 border-t border-border pt-5 sm:grid-cols-2">
                    <div>
                      <PanelLabel>Applied privilege</PanelLabel>
                      <p className="mt-2 text-small text-foreground">
                        {appliedDiscount ? `${appliedDiscount.code} — ${appliedDiscount.description}` : 'No allocation code applied'}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <PanelLabel>Tax telemetry</PanelLabel>
                      <p className="mt-2 text-small text-foreground">{taxAmount === 0 ? 'Calculated by destination service when connected.' : formatPrice(taxAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-border pt-5">
                    <TotalsLedger
                      totals={orderTotals}
                      discountCode={appliedDiscount?.code}
                      shippingMethod={selectedShippingMethod}
                      compact
                    />
                  </div>

                  <div className="mt-6 border border-accent/30 bg-accent/5 p-4 text-[11px] leading-relaxed text-foreground-muted">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent">Demo settlement // pending</p>
                    <p className="mt-2">Place Allocation creates a pending allocation record for frontend verification. It does not charge a card, reserve live inventory, or initiate fulfillment. Settlement must be confirmed by a real provider before this order can be marked paid.</p>
                  </div>
                </section>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                <Link href="/cart" className="inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to bag
                </Link>
                <p className="flex items-center gap-2 text-[10px] text-foreground-subtle"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Encrypted provider boundary required for production</p>
              </div>
            </div>

            <aside className="min-w-0 lg:col-span-5 xl:col-span-4">
              <div className="border border-border bg-surface p-5 sm:p-7 lg:sticky lg:top-28 lg:p-8">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <PanelLabel>Allocation manifest // browser-local demo</PanelLabel>
                    <h2 className="mt-2 font-display text-h3 text-foreground">Summary</h2>
                  </div>
                  <span className="font-mono text-[10px] tabular-nums text-foreground-subtle">{itemCountLabel}</span>
                </div>

                <div className="max-h-[40vh] overflow-y-auto overscroll-contain pr-1">
                  <AllocationLines items={cart} lineTotals={cartLineTotals} />
                </div>

                <div className="border-t border-border pt-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden="true" />
                    <PanelLabel>Allocation privilege code</PanelLabel>
                  </div>
                  {appliedDiscount ? (
                    <div className="border border-success/30 bg-success/5 p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-xs uppercase tracking-[0.12em] text-success">{appliedDiscount.code}</p>
                          <p className="mt-1 text-[10px] leading-relaxed text-foreground-muted">{appliedDiscount.description}</p>
                          {promoThresholdMessage && <p className="mt-2 text-[10px] text-danger">{promoThresholdMessage}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            removeDiscountCode();
                            setPromoMessage('Allocation code removed.');
                            setPromoError(false);
                          }}
                          className="min-h-11 shrink-0 border-b border-border-strong font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-muted hover:text-danger"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <Input
                          id="checkout-promo-code"
                          label="Code"
                          value={promoCode}
                          onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              void applyPromo();
                            }
                          }}
                          placeholder="ENTER CODE"
                          autoComplete="off"
                          disabled={isWorking || isApplyingPromo}
                        />
                      </div>
                      <Button type="button" variant="outline" size="md" isLoading={isApplyingPromo} onClick={() => void applyPromo()} disabled={!promoCode.trim() || isWorking} className="h-11 px-3.5">
                        Apply
                      </Button>
                    </div>
                  )}
                  {promoMessage && (
                    <p role={promoError ? 'alert' : 'status'} className={`mt-2 text-[10px] leading-relaxed ${promoError ? 'text-danger' : 'text-success'}`}>{promoMessage}</p>
                  )}
                </div>

                <div className="mt-5">
                  <TotalsLedger
                    totals={orderTotals}
                    discountCode={appliedDiscount?.code}
                    shippingMethod={selectedShippingMethod}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowTaxNote((shown) => !shown)}
                  aria-expanded={showTaxNote}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 text-left font-mono text-[9px] uppercase tracking-[0.11em] text-foreground-subtle hover:text-foreground"
                >
                  <Info className="h-3 w-3" aria-hidden="true" /> Tax calculation architecture
                </button>
                {showTaxNote && (
                  <p className="mb-3 border-l border-border-strong pl-3 text-[10px] leading-relaxed text-foreground-subtle">
                    Tax is intentionally shown as a pending estimate in this frontend. A destination-aware tax provider must return an authoritative quote before live order finalization.
                  </p>
                )}

                {orderAttemptStatus && <p role="status" className="mt-3 text-[10px] leading-relaxed text-foreground-muted">{orderAttemptStatus}</p>}
                {paymentState === 'failed' && <p role="status" className="mt-3 text-[10px] leading-relaxed text-danger">The prior attempt did not complete. Your bag remains available; review the flagged section and retry.</p>}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isWorking}
                  disabled={cart.length === 0 || isLoadingShipping || Boolean(shippingServiceError) || !shippingMethods.length}
                  rightIcon={!isWorking ? <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> : undefined}
                  className="mt-5 min-h-12"
                >
                  {activeSection === 'review' ? 'Place Allocation' : 'Review & Place Order'}
                </Button>
                <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-subtle">
                  Demo only // no charge or live authorization
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                  <div className="px-1"><ShieldCheck className="mx-auto h-4 w-4 text-foreground-muted" aria-hidden="true" /><span className="mt-2 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Demo<br />adapter</span></div>
                  <div className="border-x border-border px-1"><MapPin className="mx-auto h-4 w-4 text-foreground-muted" aria-hidden="true" /><span className="mt-2 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Courier<br />estimate</span></div>
                  <div className="px-1"><LockKeyhole className="mx-auto h-4 w-4 text-foreground-muted" aria-hidden="true" /><span className="mt-2 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">No payment<br />token stored</span></div>
                </div>
              </div>
            </aside>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background px-4 pt-3 lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">{`${itemCountLabel} // EST. TOTAL`}</p>
                <PriceDisplay price={cartTotal} size="md" />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isWorking}
                disabled={cart.length === 0 || isLoadingShipping || Boolean(shippingServiceError) || !shippingMethods.length}
                withArrow={activeSection === 'review' ? undefined : 'right'}
                className="min-h-12 max-w-[58%] px-4 text-[10px] leading-tight"
              >
                {activeSection === 'review' ? 'Place Allocation' : 'Review & Place Order'}
              </Button>
            </div>
          </div>
        </form>
      </Container>
    </main>
  );
}

function ReviewBlock({
  title,
  editLabel,
  onEdit,
  children,
}: {
  title: string;
  editLabel: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 border-b border-border pb-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <PanelLabel>{title}</PanelLabel>
        <button type="button" onClick={onEdit} className="inline-flex min-h-11 items-center gap-1 border-b border-border-strong/70 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
          {editLabel} <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
      {children}
    </section>
  );
}
