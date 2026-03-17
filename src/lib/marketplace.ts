export const ITEM_CATEGORIES = [
  "Food",
  "Electronics",
  "Gadgets",
  "Books",
  "Clothing",
  "Shoes",
  "Furniture",
  "Appliances",
  "Baby items",
  "School supplies",
  "Kitchen items",
  "Medication",
  "Beauty & Personal Care",
  "Other",
] as const;

export const ITEM_FEED_CATEGORIES = ["All", ...ITEM_CATEGORIES] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍚",
  Electronics: "🔌",
  Gadgets: "📱",
  Books: "📚",
  Clothing: "🧥",
  Shoes: "👟",
  Furniture: "🪑",
  Appliances: "🍳",
  "Baby items": "🍼",
  "School supplies": "✏️",
  "Kitchen items": "🍳",
  Medication: "💊",
  "Beauty & Personal Care": "🧴",
  Other: "📦",
};

export const NIGERIA_LOCATION_OPTIONS: Record<string, string[]> = {
  Lagos: ["Ikeja", "Yaba", "Lekki", "Surulere", "Ajah", "Ikorodu"],
  Abuja: ["Wuse", "Garki", "Maitama", "Kubwa", "Asokoro", "Lugbe"],
  Oyo: ["Ibadan", "Ogbomosho", "Oyo Town", "Saki"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Eleme"],
  Kano: ["Nassarawa", "Fagge", "Dala"],
};