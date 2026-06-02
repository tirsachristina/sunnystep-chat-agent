import Anthropic from "@anthropic-ai/sdk";
import { PRODUCTS, SIZE_GUIDE, MOCK_ORDERS, type Product } from "./catalog.js";

// ─── Tool definitions (sent to Claude) ───────────────────────────────────────

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Search the SunnyStep catalogue. Use for finding shoes by category, occasion, style, price, or features. Always call this before recommending products.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["running", "sandals", "formal", "casual", "kids", "any"],
          description: "Shoe category",
        },
        max_price: {
          type: "number",
          description: "Maximum price in SGD",
        },
        occasion: {
          type: "string",
          description: "Use case: running, office, beach, casual, school, gym, travel, etc.",
        },
        features: {
          type: "array",
          items: { type: "string" },
          description: "Required features: breathable, non-slip, waterproof, etc.",
        },
        bestsellers_only: {
          type: "boolean",
          description: "Return only bestselling products",
        },
        new_arrivals_only: {
          type: "boolean",
          description: "Return only new arrivals",
        },
      },
      required: [],
    },
  },
  {
    name: "get_product_details",
    description:
      "Get full details for a specific product including stock levels by size and colour. Use when a customer asks about a specific product.",
    input_schema: {
      type: "object" as const,
      properties: {
        product_id: {
          type: "string",
          description: "Product ID, e.g. SS-001",
        },
        color: {
          type: "string",
          description: "Optional: specific colour to check",
        },
        size: {
          type: "number",
          description: "Optional: specific size to check availability",
        },
      },
      required: ["product_id"],
    },
  },
  {
    name: "get_size_recommendation",
    description:
      "Recommend the right SunnyStep size based on the customer's measurements or sizes in other brands. Always use this when a customer asks about sizing.",
    input_schema: {
      type: "object" as const,
      properties: {
        gender: {
          type: "string",
          enum: ["women", "men", "kids"],
          description: "Customer's gender for sizing chart",
        },
        foot_length_cm: {
          type: "number",
          description: "Foot length in centimetres",
        },
        current_size_system: {
          type: "string",
          enum: ["us", "uk", "eu", "sg", "cm"],
          description: "Size system the customer currently uses",
        },
        current_size: {
          type: "string",
          description: "Customer's current size in their size system",
        },
        fit_preference: {
          type: "string",
          enum: ["true-to-size", "slightly-loose", "slightly-tight"],
          description: "How the customer prefers their fit",
        },
      },
      required: ["gender"],
    },
  },
  {
    name: "lookup_order",
    description:
      "Look up order status for a customer. Requires an order ID (format: SS followed by 5 digits, e.g. SS10234).",
    input_schema: {
      type: "object" as const,
      properties: {
        order_id: {
          type: "string",
          description: "SunnyStep order ID, e.g. SS10234",
        },
      },
      required: ["order_id"],
    },
  },
  {
    name: "check_return_eligibility",
    description:
      "Check if an order is eligible for return or exchange under SunnyStep's 30-day policy.",
    input_schema: {
      type: "object" as const,
      properties: {
        order_id: {
          type: "string",
          description: "Order ID to check",
        },
        reason: {
          type: "string",
          enum: ["wrong_size", "defective", "changed_mind", "wrong_item"],
          description: "Reason for return",
        },
      },
      required: ["order_id", "reason"],
    },
  },
];

// ─── Tool handlers ────────────────────────────────────────────────────────────

function searchProducts(input: {
  category?: string;
  max_price?: number;
  occasion?: string;
  features?: string[];
  bestsellers_only?: boolean;
  new_arrivals_only?: boolean;
}): object {
  let results = [...PRODUCTS];

  if (input.category && input.category !== "any") {
    results = results.filter((p) => p.category === input.category);
  }
  if (input.max_price) {
    results = results.filter((p) => p.price <= input.max_price!);
  }
  if (input.occasion) {
    const occ = input.occasion.toLowerCase();
    results = results.filter((p) =>
      p.occasions.some((o) => o.toLowerCase().includes(occ)) ||
      p.description.toLowerCase().includes(occ)
    );
  }
  if (input.features && input.features.length > 0) {
    results = results.filter((p) =>
      input.features!.some((f) =>
        p.features.some((pf) => pf.toLowerCase().includes(f.toLowerCase()))
      )
    );
  }
  if (input.bestsellers_only) {
    results = results.filter((p) => p.bestseller);
  }
  if (input.new_arrivals_only) {
    results = results.filter((p) => p.new);
  }

  return {
    count: results.length,
    products: results.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: `SGD ${p.price}`,
      rating: p.rating,
      reviews: p.reviews,
      colors: p.colors,
      sizes_available: p.sizes,
      bestseller: p.bestseller ?? false,
      new_arrival: p.new ?? false,
      summary: p.description.split(".")[0] + ".",
    })),
  };
}

function getProductDetails(input: {
  product_id: string;
  color?: string;
  size?: number;
}): object {
  const product = PRODUCTS.find((p) => p.id === input.product_id);
  if (!product) {
    return { error: `Product ${input.product_id} not found` };
  }

  let stockInfo: object = product.stock;
  if (input.color) {
    const colorKey = input.color.toLowerCase();
    const matchedColor = Object.keys(product.stock).find((c) =>
      c.toLowerCase().includes(colorKey)
    );
    if (matchedColor) {
      stockInfo = { [matchedColor]: product.stock[matchedColor] };
      if (input.size) {
        const qty = product.stock[matchedColor][input.size] ?? 0;
        stockInfo = {
          [matchedColor]: {
            [input.size]: qty,
            available: qty > 0,
            low_stock: qty > 0 && qty <= 3,
          },
        };
      }
    } else {
      return { error: `Colour "${input.color}" not found for ${product.name}` };
    }
  }

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: `SGD ${product.price}`,
    description: product.description,
    colors: product.colors,
    sizes_available: product.sizes,
    occasions: product.occasions,
    features: product.features,
    rating: product.rating,
    reviews: `${product.reviews} verified reviews`,
    bestseller: product.bestseller ?? false,
    new_arrival: product.new ?? false,
    stock: stockInfo,
    care_instructions: "Wipe clean with damp cloth. Air dry only. Do not machine wash (except Mini Bounce).",
    warranty: "6 months against manufacturing defects",
    free_returns: "30-day free returns for unworn items",
  };
}

function getSizeRecommendation(input: {
  gender: "women" | "men" | "kids";
  foot_length_cm?: number;
  current_size_system?: string;
  current_size?: string;
  fit_preference?: string;
}): object {
  const chart = input.gender === "kids"
    ? SIZE_GUIDE.women  // approximate kids sizing
    : SIZE_GUIDE[input.gender];

  let recommendedSize: number | null = null;
  let notes = "";

  if (input.foot_length_cm) {
    const entry = chart.find((s) => s.cm >= input.foot_length_cm!) ??
      chart[chart.length - 1];
    recommendedSize = entry.sg;
    notes = `Based on ${input.foot_length_cm}cm foot length, your SunnyStep size is ${recommendedSize}.`;

    if (input.fit_preference === "slightly-loose") {
      recommendedSize = Math.min(recommendedSize + 1, 45);
      notes += " Sized up 1 for a roomier fit.";
    } else if (input.fit_preference === "slightly-tight") {
      notes += " This is already your exact size; going down is not recommended.";
    }
  } else if (input.current_size && input.current_size_system) {
    const sys = input.current_size_system as keyof (typeof chart)[0];
    const entry = chart.find(
      (s) => String((s as Record<string, unknown>)[sys]) === String(input.current_size)
    );
    if (entry) {
      recommendedSize = entry.sg;
      notes = `Your ${input.current_size_system.toUpperCase()} ${input.current_size} converts to SunnyStep size ${recommendedSize}.`;
    } else {
      notes = `Couldn't match ${input.current_size_system.toUpperCase()} ${input.current_size} exactly. Please measure your foot length for the most accurate fit.`;
    }
  }

  return {
    recommended_sg_size: recommendedSize,
    size_chart: chart.slice(0, 6),
    notes,
    fit_tip:
      "For running shoes, we recommend your true size or half a size up. For sandals and casual shoes, true to size. If between sizes, go up.",
    measure_guide:
      "To measure: stand on paper, trace your foot, measure heel to longest toe in cm.",
    in_store:
      "Visit us at Vivo City #02-34, ION Orchard #B2-01, or JEM #03-12 for a professional fitting.",
  };
}

function lookupOrder(input: { order_id: string }): object {
  const order = MOCK_ORDERS[input.order_id.toUpperCase()];
  if (!order) {
    return {
      found: false,
      message: `No order found with ID ${input.order_id}. Please double-check the order number in your confirmation email, or contact us at hello@sunnystep.sg.`,
    };
  }
  return { found: true, ...order };
}

function checkReturnEligibility(input: {
  order_id: string;
  reason: string;
}): object {
  const order = MOCK_ORDERS[input.order_id.toUpperCase()] as Record<string, unknown> | undefined;
  if (!order) {
    return { eligible: false, message: "Order not found." };
  }

  const status = order.status as string;

  if (status === "processing") {
    return {
      eligible: false,
      message:
        "Your order is still being processed. Once it ships, you'll have 30 days to request a return.",
    };
  }

  if (input.reason === "defective") {
    return {
      eligible: true,
      return_type: "free_return_or_exchange",
      instructions:
        "Defective items are covered under our 6-month warranty. Please take photos of the defect and email them to hello@sunnystep.sg with your order number. We'll arrange a free pickup and send a replacement within 3–5 business days.",
    };
  }

  return {
    eligible: true,
    return_type: input.reason === "changed_mind" ? "exchange_or_store_credit" : "full_refund",
    conditions: ["Item must be unworn with original tags attached", "Original packaging required"],
    instructions:
      "Log in to your account at sunnystep.sg/returns or visit any of our 3 stores in Singapore. Free returns for all Singapore orders.",
    refund_timeline: "Refunds processed within 5–7 business days after we receive the item.",
  };
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export function executeTool(name: string, input: Record<string, unknown>): string {
  try {
    let result: object;

    switch (name) {
      case "search_products":
        result = searchProducts(input as Parameters<typeof searchProducts>[0]);
        break;
      case "get_product_details":
        result = getProductDetails(input as Parameters<typeof getProductDetails>[0]);
        break;
      case "get_size_recommendation":
        result = getSizeRecommendation(input as Parameters<typeof getSizeRecommendation>[0]);
        break;
      case "lookup_order":
        result = lookupOrder(input as Parameters<typeof lookupOrder>[0]);
        break;
      case "check_return_eligibility":
        result = checkReturnEligibility(input as Parameters<typeof checkReturnEligibility>[0]);
        break;
      default:
        result = { error: `Unknown tool: ${name}` };
    }

    return JSON.stringify(result, null, 2);
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}
