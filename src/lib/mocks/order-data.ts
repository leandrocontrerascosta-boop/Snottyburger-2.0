import type { Category, Location, Product, PromoBanner, PromoDeal } from "@/lib/types/order";

export const categories: Category[] = [
  { id: "burgers", label: "Burgers" },
  { id: "drinks", label: "Bebidas" },
];

const burgerModifiers = [
  {
    id: "fries-type",
    title: "Tipo de papas",
    description: "Elegi como queres las papas incluidas.",
    type: "single" as const,
    choices: [
      { id: "fries-seasoned", label: "Sazonadas", priceDelta: 0, kind: "addon" as const },
      { id: "fries-plain", label: "Sin sazon", priceDelta: 0, kind: "addon" as const },
    ],
  },
  {
    id: "extras",
    title: "Extras",
    type: "multi" as const,
    choices: [
      { id: "extra-cheddar", label: "Queso cheddar", priceDelta: 1000, kind: "extra" as const },
      { id: "extra-mayo-pot", label: "Pote de mayo", priceDelta: 600, kind: "extra" as const },
      { id: "extra-egg", label: "Huevo", priceDelta: 500, kind: "extra" as const },
      { id: "extra-bacon", label: "Bacon", priceDelta: 800, kind: "extra" as const },
      {
        id: "extra-patty-double-cheese",
        label: "Medallon extra (con doble queso)",
        priceDelta: 3500,
        kind: "addon" as const,
      },
    ],
  },
];

function createBurgerModifiers(doublePrice: number, basePrice: number) {
  return [
    {
      id: "burger-size",
      title: "Version",
      type: "multi" as const,
      choices: [
        { id: `make-double-${basePrice}`, label: "Hacer doble", priceDelta: doublePrice - basePrice, kind: "addon" as const },
      ],
    },
    ...burgerModifiers,
  ];
}

export const products: Product[] = [
  {
    id: "locura",
    categoryId: "burgers",
    name: "Locura",
    description: "Pan brioche, medallon de carne, queso tybo, jamon, lechuga, tomate, huevo, mayo casera, dip de mayo y papas.",
    price: 9000,
    image: "/images/order/locura.webp",
    featured: true,
    modifierGroups: createBurgerModifiers(12000, 9000),
  },
  {
    id: "suavecita",
    categoryId: "burgers",
    name: "Suavecita",
    description: "Pan brioche, medallon de carne, queso cheddar Milkaut, ketchup, cebolla morada, mayo casera, dip de mayo y papas.",
    price: 9000,
    image: "/images/order/suavecita.webp",
    modifierGroups: createBurgerModifiers(12000, 9000),
  },
  {
    id: "peligrosa",
    categoryId: "burgers",
    name: "Peligrosa",
    description: "Pan brioche, medallon de carne, queso cheddar Milkaut, bacon, cebolla caramelizada, mayo casera, dip de mayo y papas.",
    price: 9500,
    image: "/images/order/peligrosa.webp",
    modifierGroups: createBurgerModifiers(12500, 9500),
  },
  {
    id: "snotty",
    categoryId: "burgers",
    name: "Snotty",
    description: "Pan brioche, medallon de carne, queso cheddar Milkaut, mermelada de bacon, mayo casera, dip de mayo y papas.",
    price: 10000,
    image: "/images/order/snotty.webp",
    modifierGroups: createBurgerModifiers(13000, 10000),
  },
  {
    id: "moquera",
    categoryId: "burgers",
    name: "Moquera",
    description: "Pan brioche, medallon de carne, queso cheddar Milkaut, queso azul, cebolla caramelizada, mayo casera, dip de mayo y papas.",
    price: 9500,
    image: "/images/order/moquera.webp",
    modifierGroups: createBurgerModifiers(12500, 9500),
  },
  {
    id: "descontrolada",
    categoryId: "burgers",
    name: "Descontrolada",
    description: "Pan brioche, medallon de carne, queso cheddar Milkaut, bacon, lechuga, cebolla morada, tomate, mayo casera, dip de mayo y papas.",
    price: 9500,
    image: "/images/order/descontrolada.webp",
    modifierGroups: createBurgerModifiers(12500, 9500),
  },
  {
    id: "pepsi-can",
    categoryId: "drinks",
    name: "Pepsi lata",
    description: "Latita de Pepsi bien fria para acompanar cualquiera de las burgers.",
    price: 2000,
    image: "/images/order/pepsi-can-v2.webp",
    modifierGroups: [],
  },
  {
    id: "coca-cola-500",
    categoryId: "drinks",
    name: "Coca Cola 500ml",
    description: "Botella individual de Coca Cola 500ml servida bien fria.",
    price: 2500,
    image: "/images/order/coca-cola-500-v2.webp",
    modifierGroups: [],
  },
];

export const recommendations = ["pepsi-can", "coca-cola-500"];

export const locations: Location[] = [
  {
    id: "catamarca-centro",
    name: "Snottyburger Catamarca",
    address: "Waldino Correa 493",
    area: "San Fernando del Valle de Catamarca, Catamarca",
    hours: "Lunes a Lunes · 20:00 a 01:00",
    phone: "(383) 456-7788",
    whatsappPhone: "543834567788",
    coordinates: { lat: -28.4543661, lng: -65.7517903 },
  },
];

export const promoBanner: PromoBanner = {
  id: "rewards",
  iconText: "SB",
  leadingText: "Cuando todo es casero,",
  accentText: "Cada mordisco tiene sentido.",
};

export const promoDeals: PromoDeal[] = [
  {
    id: "deal-locura-week",
    productId: "locura",
    title: "Locura Week",
    description: "Nuestra signature con papas incluidas a precio bomba por tiempo limitado.",
    image: "/images/order/locura.webp",
    badge: "-20%",
    ctaLabel: "Ver detalle",
    promoLabel: "$7.200",
    originalPrice: 9000,
  },
  {
    id: "deal-snotty-combo",
    productId: "snotty",
    title: "Snotty Combo",
    description: "Snotty + bebida lata en combo especial para romperla al mediodia.",
    image: "/images/order/snotty.webp",
    badge: "Combo",
    ctaLabel: "Ver detalle",
    promoLabel: "$11.900",
    originalPrice: 12000,
  },
  {
    id: "deal-peligrosa-2x1",
    productId: "peligrosa",
    title: "Peligrosa 2x1",
    description: "Ideal para compartir: segunda burger con 100% off en horario promo.",
    image: "/images/order/peligrosa.webp",
    badge: "2x1",
    ctaLabel: "Ver detalle",
    promoLabel: "Desde $9.500",
  },
  {
    id: "deal-moquera-blue",
    productId: "moquera",
    title: "Moquera Blue",
    description: "Con queso azul y caramelizada, rebajada para fanes de sabores intensos.",
    image: "/images/order/moquera.webp",
    badge: "-15%",
    ctaLabel: "Ver detalle",
    promoLabel: "$8.075",
    originalPrice: 9500,
  },
  {
    id: "deal-descontrolada-combo",
    productId: "descontrolada",
    title: "Descontrolada Combo",
    description: "Burger cargada + bebida en un combo agresivo para cena de finde.",
    image: "/images/order/descontrolada.webp",
    badge: "Combo",
    ctaLabel: "Ver detalle",
    promoLabel: "$11.300",
    originalPrice: 12000,
  },
  {
    id: "deal-suavecita-lunch",
    productId: "suavecita",
    title: "Suavecita Lunch",
    description: "Promo de mediodia para una clasica equilibrada y bien casera.",
    image: "/images/order/suavecita.webp",
    badge: "-10%",
    ctaLabel: "Ver detalle",
    promoLabel: "$8.100",
    originalPrice: 9000,
  },
];