export interface Product {
  id: string;
  name: string;
  category: "running" | "sandals" | "formal" | "casual" | "kids";
  price: number;
  colors: string[];
  sizes: number[];
  description: string;
  occasions: string[];
  features: string[];
  rating: number;
  reviews: number;
  bestseller?: boolean;
  new?: boolean;
  stock: Record<string, Record<number, number>>;
}

export const PRODUCTS: Product[] = [
  {
    id: "SS-001",
    name: "CloudWalk Pro",
    category: "running",
    price: 189,
    colors: ["midnight black", "pearl white", "coral sunset"],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    description:
      "Our best-selling running shoe engineered for Singapore's heat. Breathable mesh upper, responsive cushioning, and anti-slip outsole — perfect for East Coast Park runs or your morning jog at MacRitchie Reservoir.",
    occasions: ["running", "gym", "casual"],
    features: ["moisture-wicking", "arch support", "anti-slip", "breathable mesh", "heel counter"],
    rating: 4.8,
    reviews: 234,
    bestseller: true,
    stock: {
      "midnight black": { 38: 5, 39: 3, 40: 8, 41: 2, 42: 6, 43: 4 },
      "pearl white": { 37: 4, 38: 7, 39: 5, 40: 3, 41: 9, 42: 2 },
      "coral sunset": { 37: 2, 38: 3, 39: 6, 40: 4, 41: 3 },
    },
  },
  {
    id: "SS-002",
    name: "Tropica Slide",
    category: "sandals",
    price: 79,
    colors: ["tan", "navy", "terracotta", "white"],
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
    description:
      "The ultimate Singapore sandal. Contoured footbed, quick-dry straps, and non-slip sole handle everything from hawker centre visits to weekend beach trips at Sentosa.",
    occasions: ["beach", "casual", "everyday", "travel"],
    features: ["quick-dry", "non-slip sole", "contoured footbed", "adjustable strap", "water-resistant"],
    rating: 4.6,
    reviews: 412,
    bestseller: true,
    stock: {
      tan: { 37: 12, 38: 8, 39: 15, 40: 10, 41: 6, 42: 9 },
      navy: { 38: 5, 39: 7, 40: 11, 41: 8, 42: 4 },
      terracotta: { 36: 3, 37: 9, 38: 6, 39: 4, 40: 7 },
      white: { 37: 2, 38: 3, 39: 5, 40: 3, 41: 4 },
    },
  },
  {
    id: "SS-003",
    name: "Executive Step",
    category: "formal",
    price: 259,
    colors: ["classic black", "cognac brown"],
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    description:
      "Crafted for Singapore's CBD professionals. Full-grain leather upper, memory foam insole, and a slim profile that looks sharp from Raffles Place to client meetings.",
    occasions: ["office", "formal", "business dinner"],
    features: ["full-grain leather", "memory foam insole", "goodyear welt", "rubber heel cap", "antimicrobial lining"],
    rating: 4.7,
    reviews: 98,
    stock: {
      "classic black": { 40: 3, 41: 5, 42: 4, 43: 2, 44: 3 },
      "cognac brown": { 40: 2, 41: 4, 42: 3, 43: 1, 44: 2 },
    },
  },
  {
    id: "SS-004",
    name: "Urban Drift",
    category: "casual",
    price: 139,
    colors: ["cloud grey", "warm beige", "olive green", "dusty rose"],
    sizes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    description:
      "Effortlessly stylish for Singapore's cafe-hopping culture. Clean silhouette, cushioned insole, and versatile colourways that pair with everything from Tiong Bahru brunch fits to Haji Lane outfits.",
    occasions: ["casual", "shopping", "cafe", "dating", "travel"],
    features: ["cushioned insole", "canvas upper", "rubber outsole", "breathable"],
    rating: 4.5,
    reviews: 567,
    new: true,
    stock: {
      "cloud grey": { 37: 8, 38: 12, 39: 15, 40: 10, 41: 7, 42: 5 },
      "warm beige": { 36: 4, 37: 9, 38: 11, 39: 8, 40: 6, 41: 4 },
      "olive green": { 38: 5, 39: 7, 40: 9, 41: 6, 42: 4 },
      "dusty rose": { 35: 3, 36: 6, 37: 8, 38: 10, 39: 7, 40: 5 },
    },
  },
  {
    id: "SS-005",
    name: "Mini Bounce",
    category: "kids",
    price: 89,
    colors: ["rainbow splash", "dino green", "sky blue", "bubblegum pink"],
    sizes: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    description:
      "Built for Singapore's active kids — whether they're running at the void deck, navigating a wet market, or playing at Jurong Lake Gardens. Machine-washable, velcro closure, extra toe protection.",
    occasions: ["school", "playground", "sports day", "everyday"],
    features: ["machine-washable", "velcro closure", "toe bumper", "anti-slip", "lightweight", "wide toe box"],
    rating: 4.9,
    reviews: 189,
    bestseller: true,
    stock: {
      "rainbow splash": { 28: 6, 29: 8, 30: 10, 31: 7, 32: 5 },
      "dino green": { 27: 4, 28: 7, 29: 9, 30: 6, 31: 4 },
      "sky blue": { 29: 5, 30: 8, 31: 9, 32: 7, 33: 4 },
      "bubblegum pink": { 27: 3, 28: 5, 29: 7, 30: 9, 31: 6, 32: 4 },
    },
  },
  {
    id: "SS-006",
    name: "SweatFree Trainer",
    category: "running",
    price: 149,
    colors: ["electric blue", "neon lime", "stealth grey"],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    description:
      "Designed specifically for Singapore's humidity. Knit upper with venting channels, moisture-wicking liner, and a lightweight sole that keeps your feet cool through even the sweatiest HIIT session.",
    occasions: ["gym", "running", "training", "casual"],
    features: ["knit upper", "ventilation channels", "moisture-wicking liner", "lightweight", "flexible sole"],
    rating: 4.6,
    reviews: 143,
    new: true,
    stock: {
      "electric blue": { 39: 4, 40: 6, 41: 5, 42: 3, 43: 4 },
      "neon lime": { 38: 3, 39: 5, 40: 7, 41: 4, 42: 2 },
      "stealth grey": { 39: 6, 40: 8, 41: 9, 42: 7, 43: 5 },
    },
  },
];

export const SIZE_GUIDE = {
  women: [
    { sg: 35, eu: 35, us: "5", uk: "3", cm: 22.0 },
    { sg: 36, eu: 36, us: "5.5", uk: "3.5", cm: 22.5 },
    { sg: 37, eu: 37, us: "6.5", uk: "4.5", cm: 23.5 },
    { sg: 38, eu: 38, us: "7.5", uk: "5.5", cm: 24.0 },
    { sg: 39, eu: 39, us: "8.5", uk: "6.5", cm: 25.0 },
    { sg: 40, eu: 40, us: "9", uk: "7", cm: 25.5 },
    { sg: 41, eu: 41, us: "10", uk: "8", cm: 26.5 },
  ],
  men: [
    { sg: 39, eu: 39, us: "6.5", uk: "6", cm: 25.0 },
    { sg: 40, eu: 40, us: "7", uk: "6.5", cm: 25.5 },
    { sg: 41, eu: 41, us: "8", uk: "7.5", cm: 26.0 },
    { sg: 42, eu: 42, us: "9", uk: "8.5", cm: 26.5 },
    { sg: 43, eu: 43, us: "10", uk: "9.5", cm: 27.5 },
    { sg: 44, eu: 44, us: "11", uk: "10.5", cm: 28.0 },
    { sg: 45, eu: 45, us: "12", uk: "11.5", cm: 29.0 },
  ],
};

// Mock orders for demo
export const MOCK_ORDERS: Record<string, object> = {
  "SS10234": {
    id: "SS10234",
    status: "shipped",
    estimatedDelivery: "Tomorrow, 2–6 PM",
    courier: "NinjaVan",
    trackingNumber: "NV-8821934-SG",
    items: [{ product: "CloudWalk Pro", color: "midnight black", size: 42, qty: 1 }],
    address: "Blk 123, Tampines Ave 1, #05-67, Singapore 521123",
  },
  "SS10198": {
    id: "SS10198",
    status: "processing",
    estimatedDelivery: "3–5 business days",
    items: [{ product: "Tropica Slide", color: "tan", size: 39, qty: 1 }],
  },
  "SS10055": {
    id: "SS10055",
    status: "delivered",
    deliveredAt: "3 days ago",
    items: [{ product: "Urban Drift", color: "warm beige", size: 38, qty: 2 }],
  },
};
