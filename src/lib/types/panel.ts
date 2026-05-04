export type EntityStatus = "active" | "paused";

export type MenuDiscountTarget = "simple" | "double";

export type MenuItemAdmin = {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt?: string;
  simplePrice: number;
  doublePrice: number;
  badgeText?: "Top" | "Nuevo";
  discountTarget?: MenuDiscountTarget;
  discountPercent?: number;
  status: EntityStatus;
};

export type DrinkItemAdmin = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  status: EntityStatus;
};

export type MenuModifierKind = "extra" | "remove" | "addon";

export type ExtraItemAdmin = {
  id: string;
  slug: string;
  label: string;
  priceDelta: number;
  kind: MenuModifierKind;
  sortOrder: number;
  status: EntityStatus;
};

export type HomeMediaType = "image" | "video";

export type HomeMediaAsset = {
  id: string;
  title: string;
  type: HomeMediaType;
  placement: "hero" | "gallery" | "story" | "footer";
  source: string;
  status: EntityStatus;
};

export type StoryContent = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type PromoCustomizationPolicy = "extras" | "observation-only";

export type PromoAdmin = {
  id: string;
  title: string;
  description: string;
  image: string;
  simplePrice: number;
  doublePrice: number;
  isCombo: boolean;
  durationDays: number;
  customizationPolicy: PromoCustomizationPolicy;
  badgeText?: string;
  linkedProductSlug?: string;
  status: EntityStatus;
};

export type SalesStatus = "paid" | "pending" | "cancelled";

export type PaymentMethod = "cash" | "transfer";

export type FulfillmentMethod = "pickup" | "delivery";

export type SaleRecordItem = {
  productId: string;
  productName: string;
  quantity: number;
  lineTotal: number;
  sizeLabel: "SIMPLE" | "DOBLE" | null;
};

export type SaleRecord = {
  id: string;
  createdAt: string;
  customerName: string;
  location: string;
  fulfillmentMethod: FulfillmentMethod;
  total: number;
  itemCount: number;
  items: SaleRecordItem[];
  paymentMethod: PaymentMethod;
  status: SalesStatus;
};

export type SalesFilters = {
  query: string;
  location: string;
  paymentMethod: "all" | PaymentMethod;
  status: "all" | SalesStatus;
  from: string;
  to: string;
};

export type MetricCard = {
  id: string;
  title: string;
  value: string;
  trend: string;
};
