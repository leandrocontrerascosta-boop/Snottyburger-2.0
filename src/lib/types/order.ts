export type CategoryId = "burgers" | "drinks" | "promos";

export type ModifierChoice = {
  id: string;
  label: string;
  priceDelta: number;
  kind: "extra" | "remove" | "addon";
};

export type ModifierGroup = {
  id: string;
  title: string;
  description?: string;
  type: "multi" | "single";
  choices: ModifierChoice[];
};

export type Product = {
  id: string;
  sourceId?: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  createdAt?: string;
  image: string;
  featured?: boolean;
  badgeText?: "Top" | "Nuevo";
  modifierGroups: ModifierGroup[];
};

export type Category = {
  id: CategoryId;
  label: string;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  area: string;
  hours: string;
  phone: string;
  whatsappPhone?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type PromoBanner = {
  id: string;
  iconText: string;
  leadingText: string;
  accentText: string;
};

export type PromoDeal = {
  id: string;
  productId?: string;
  promoProductId?: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  ctaLabel: string;
  promoLabel: string;
  originalPrice?: number;
};

export type ProductCustomization = {
  quantity: number;
  selectedChoiceIds: string[];
  note?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  selectedChoiceIds: string[];
  note?: string;
};