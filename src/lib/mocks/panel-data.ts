import type {
  HomeMediaAsset,
  MetricCard,
  MenuItemAdmin,
  PromoAdmin,
  SaleRecord,
  SalesFilters,
  StoryContent,
} from "@/lib/types/panel";

export const initialMenuItems: MenuItemAdmin[] = [
  {
    id: "menu-locura",
    name: "Locura",
    description: "Pan brioche, carne, tybo, jamon, huevo y papas.",
    image: "/images/order/locura.webp",
    simplePrice: 7800,
    doublePrice: 12000,
    discountTarget: "double",
    discountPercent: 10,
    status: "active",
  },
  {
    id: "menu-snotty",
    name: "Snotty",
    description: "Cheddar, mermelada de bacon y papas incluidas.",
    image: "/images/order/snotty.webp",
    simplePrice: 8600,
    doublePrice: 13000,
    status: "active",
  },
  {
    id: "menu-peligrosa",
    name: "Peligrosa",
    description: "Cheddar, bacon, cebolla caramelizada y mayo casera.",
    image: "/images/order/peligrosa.webp",
    simplePrice: 8200,
    doublePrice: 12500,
    discountTarget: "simple",
    discountPercent: 15,
    status: "paused",
  },
];

export const initialHomeMedia: HomeMediaAsset[] = [
  {
    id: "media-hero-01",
    title: "Hero principal",
    type: "image",
    placement: "hero",
    source: "/images/home/logosnotty.png",
    status: "active",
  },
  {
    id: "media-story-01",
    title: "Bloque historia video",
    type: "video",
    placement: "story",
    source: "/images/home/home-reel.mp4",
    status: "active",
  },
  {
    id: "media-gallery-01",
    title: "Video alternativo home",
    type: "image",
    placement: "footer",
    source: "/images/home/logosnotty.png",
    status: "paused",
  },
];

export const initialStoryContent: StoryContent = {
  id: "story-main",
  title: "Nuestra Historia",
  body: "Snottyburger arranco como una cocina chica obsesionada por hacer la burger perfecta: pan suave, carne con sello propio y salsas caseras. Hoy seguimos con la misma regla: todo fresco, sin atajos y con sabor real.",
  updatedAt: "2026-04-26T15:32:00.000Z",
};

export const initialPromos: PromoAdmin[] = [];

export const initialSales: SaleRecord[] = [
  {
    id: "sale-10021",
    createdAt: "2026-04-30T20:21:00.000Z",
    customerName: "Luna Perez",
    location: "Palermo",
    fulfillmentMethod: "delivery",
    total: 25800,
    itemCount: 3,
    items: [
      { productId: "classic-burger", productName: "Classic Burger", quantity: 2, lineTotal: 17200, sizeLabel: "SIMPLE" },
      { productId: "fries-rustic", productName: "Papas Rusticas", quantity: 1, lineTotal: 8600, sizeLabel: null },
    ],
    paymentMethod: "transfer",
    status: "paid",
  },
  {
    id: "sale-10022",
    createdAt: "2026-04-30T20:47:00.000Z",
    customerName: "Mauro Diaz",
    location: "Microcentro",
    fulfillmentMethod: "pickup",
    total: 12400,
    itemCount: 2,
    items: [
      { productId: "snotty-burger", productName: "Snotty Burger", quantity: 1, lineTotal: 8400, sizeLabel: "SIMPLE" },
      { productId: "coke-lata", productName: "Coca Cola Lata", quantity: 1, lineTotal: 4000, sizeLabel: null },
    ],
    paymentMethod: "transfer",
    status: "pending",
  },
  {
    id: "sale-10023",
    createdAt: "2026-04-30T21:12:00.000Z",
    customerName: "Valentina Rios",
    location: "Caballito",
    fulfillmentMethod: "delivery",
    total: 9800,
    itemCount: 1,
    items: [{ productId: "smash-burger", productName: "Smash Burger", quantity: 1, lineTotal: 9800, sizeLabel: "DOBLE" }],
    paymentMethod: "cash",
    status: "cancelled",
  },
];

export const initialSalesFilters: SalesFilters = {
  query: "",
  location: "all",
  paymentMethod: "all",
  status: "all",
  from: "",
  to: "",
};

export const initialMetrics: MetricCard[] = [
  {
    id: "metric-month-revenue",
    title: "Facturacion mensual",
    value: "$4.8M",
    trend: "+12.4% vs mes anterior",
  },
  {
    id: "metric-ticket",
    title: "Ticket promedio",
    value: "$13.200",
    trend: "+4.1% semanal",
  },
  {
    id: "metric-conversion",
    title: "Conversion online",
    value: "6.7%",
    trend: "+0.8pp",
  },
];
