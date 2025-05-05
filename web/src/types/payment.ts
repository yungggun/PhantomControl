export interface BillingProps {
  amount_paid: number;
  status: "paid" | "unpaid" | "trial";
  currency: string;
  createdAt: number;
}

export type Filter = "all" | "paid" | "open" | "trial";

export type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

export interface Plan {
  id: string;
  object: "plan";
  active: boolean;
  aggregate_usage: string | null;
  amount: number;
  amount_decimal: string;
  billing_scheme: "per_unit" | "tiered";
  created: number;
  currency: string;
  interval: "day" | "week" | "month" | "year";
  interval_count: number;
  livemode: boolean;
  metadata: Record<string, string>;
  meter: string | null;
  nickname: string | null;
  product: string;
  tiers_mode: string | null;
  transform_usage: string | null;
  trial_period_days: number | null;
  usage_type: "licensed" | "metered";
}

export interface Subscription {
  billing_cycle_anchor: number;
  cancel_at_period_end: boolean;
  collection_method: "charge_automatically" | "send_invoice";
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: string[];
  description: string | null;
  latest_invoice: string;
  livemode: boolean;
  plan: Plan;
  quantity: number;
  status: SubscriptionStatus;
}

export interface Product {
  active: boolean;
  attributes: string[];
  default_price: string;
  description: string | null;
  images: string[];
  name: string;
  type: "service" | "good";
}

export interface CardDetails {
  brand: string;
  country: string;
  display_brand: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: "credit" | "debit" | "prepaid" | "unknown";
  generated_from: string | null;
  last4: string;
  regulated_status: string;
  wallet: string | null;
}

export interface PaymentMethod {
  id: string;
  object: "payment_method";
  allow_redisplay: string;
  billing_details: {
    address: {
      city: string;
      country: string;
      line1: string;
      line2: string | null;
      postal_code: string;
      state: string | null;
    };
    email: string;
    name: string;
    phone: string | null;
  };
  created: number;
  customer: string;
  livemode: boolean;
  metadata: Record<string, string>;
  type: "card";
  card: CardDetails;
}

export interface StripeResponse {
  subscription: Subscription;
  product: Product;
  paymentMethod: PaymentMethod;
}
