export const CATEGORIES = [
  { id: 'all', name: 'All Products', nameTe: 'అన్ని ఉత్పత్తులు', icon: '🛒' },
  { id: 'grocery', name: 'Grocery & Spices', nameTe: 'కిరాణా & మసాలాలు', icon: '🌾' },
  { id: 'snacks', name: 'Snacks & Munchies', nameTe: 'స్నాక్స్ & మిక్చర్', icon: '🍿' },
  { id: 'milk', name: 'Milk & Dairy', nameTe: 'పాలు & డైరీ', icon: '🥛' },
  { id: 'drinks', name: 'Drinks & Beverages', nameTe: 'కూల్ డ్రింక్స్', icon: '🥤' },
  { id: 'icecreams', name: 'Ice Creams', nameTe: 'ఐస్ క్రీములు', icon: '🍦' },
  { id: 'pickles', name: 'Pickles & Preserves', nameTe: 'ఊరగాయలు', icon: '🫙' },
  { id: 'pooja', name: 'Pooja Items', nameTe: 'పూజా ద్రవ్యాలు', icon: '🪔' },
  { id: 'utilities', name: 'Bill Pay & Recharge', nameTe: 'బిల్లులు & రీఛార్జ్', icon: '⚡' },
];

export const INITIAL_PRODUCTS = [
  // Grocery
  {
    id: 'prod-1',
    name: 'Sona Masoori Raw Rice',
    nameTe: 'సోనా మసూరి బియ్యం',
    category: 'grocery',
    price: 340,
    mrp: 380,
    unit: '5 kg Bag',
    stock: 24,
    lowStockThreshold: 5,
    badge: 'Popular',
    description: 'Premium long-grain aged raw rice directly sourced from local rice mills.',
    image2D: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🌾',
    imageBg: '#F7F3EB',
    variants: [
      { unit: '1 kg Pack', price: 72, mrp: 80, stock: 35 },
      { unit: '5 kg Bag', price: 340, mrp: 380, stock: 24 },
      { unit: '10 kg Bag', price: 670, mrp: 750, stock: 15 },
      { unit: '25 kg Bag', price: 1650, mrp: 1850, stock: 8 }
    ]
  },
  {
    id: 'prod-2',
    name: 'Unpolished Toor Dal (Yellow Lentils)',
    nameTe: 'కందిపప్పు',
    category: 'grocery',
    price: 155,
    mrp: 175,
    unit: '1 kg Pack',
    stock: 12,
    lowStockThreshold: 5,
    badge: 'Best Quality',
    description: 'Protein-rich unpolished yellow split pulses free from added colors.',
    image2D: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🟡',
    imageBg: '#FDF6E2',
    variants: [
      { unit: '500g Pack', price: 80, mrp: 90, stock: 20 },
      { unit: '1 kg Pack', price: 155, mrp: 175, stock: 12 },
      { unit: '2 kg Pack', price: 305, mrp: 345, stock: 8 }
    ]
  },
  {
    id: 'prod-6',
    name: 'Aachi Guntur Red Chilli Powder',
    nameTe: 'గుంటూరు కారం పొడి',
    category: 'grocery',
    price: 85,
    mrp: 95,
    unit: '200g Box',
    stock: 18,
    lowStockThreshold: 5,
    badge: 'Fiery Spice',
    description: 'Fiery spice ground from hand-picked sun-dried Guntur chillies.',
    image2D: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🌶️',
    imageBg: '#FCEBEA',
    variants: [
      { unit: '100g Pack', price: 45, mrp: 50, stock: 25 },
      { unit: '200g Box', price: 85, mrp: 95, stock: 18 },
      { unit: '500g Pack', price: 205, mrp: 230, stock: 10 }
    ]
  },

  // Snacks & Munchies (Expanded basic snacks list)
  {
    id: 'prod-13',
    name: 'Kurkure Masala Munch Crispy Puffs',
    nameTe: 'కుర్‌కురే మసాలా మంచ్',
    category: 'snacks',
    price: 20,
    mrp: 20,
    unit: '85g Pack',
    stock: 45,
    lowStockThreshold: 10,
    badge: 'Best Seller',
    description: 'Crispy crunchy corn puff snack seasoned with chatpata Indian spices.',
    image2D: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🍿',
    imageBg: '#FFF0E5'
  },
  {
    id: 'prod-14',
    name: "Lay's Classic Salted Potato Chips",
    nameTe: 'లేస్ క్లాసిక్ పొటాటో చిప్స్',
    category: 'snacks',
    price: 20,
    mrp: 20,
    unit: '50g Pack',
    stock: 32,
    lowStockThreshold: 8,
    badge: 'Crunchy',
    description: 'Crispy thin sliced potato chips seasoned with sea salt.',
    image2D: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🥔',
    imageBg: '#FFFBE6'
  },
  {
    id: 'prod-15',
    name: "Haldiram's Nagpur Bhujia Sev",
    nameTe: 'హల్దీరామ్స్ నాగ్పూర్ భుజియా',
    category: 'snacks',
    price: 55,
    mrp: 60,
    unit: '150g Pouch',
    stock: 18,
    lowStockThreshold: 5,
    badge: 'Spicy Sev',
    description: 'Authentic spicy moth bean and chickpea flour crispy bhujia sev.',
    image2D: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🥨',
    imageBg: '#FAF3E0',
    variants: [
      { unit: '150g Pouch', price: 55, mrp: 60, stock: 18 },
      { unit: '400g Family Pack', price: 135, mrp: 150, stock: 12 },
      { unit: '1 kg Jumbo', price: 310, mrp: 350, stock: 6 }
    ]
  },
  {
    id: 'prod-16',
    name: 'Britannia Good Day Cashew Butter Biscuits',
    nameTe: 'బ్రిటానియా గుడ్ డే బిస్కెట్లు',
    category: 'snacks',
    price: 30,
    mrp: 30,
    unit: '120g Family Pack',
    stock: 25,
    lowStockThreshold: 6,
    badge: 'Tea Time',
    description: 'Rich crunchy butter cookies topped with real roasted cashew nuts.',
    image2D: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🍪',
    imageBg: '#F7EFE2'
  },
  {
    id: 'prod-17',
    name: 'Cadbury Dairy Milk Silk Chocolate Bar',
    nameTe: 'కాడ్‌బరీ డైరీ మిల్క్ సిల్క్',
    category: 'snacks',
    price: 90,
    mrp: 100,
    unit: '60g Bar',
    stock: 14,
    lowStockThreshold: 4,
    badge: 'Sweet Treat',
    description: 'Smooth, creamy milk chocolate bar melting seamlessly in your mouth.',
    image2D: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🍫',
    imageBg: '#F3E5F5'
  },
  {
    id: 'prod-18',
    name: 'Parle-G Gold Glucose Biscuits',
    nameTe: 'పార్లే-జి గ్లూకోజ్ బిస్కెట్లు',
    category: 'snacks',
    price: 10,
    mrp: 10,
    unit: '100g Pack',
    stock: 50,
    lowStockThreshold: 10,
    badge: 'Daily Classic',
    description: 'India\'s favorite energy-packed glucose biscuits for morning chai.',
    image2D: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🍪',
    imageBg: '#FFF8E1'
  },

  // Milk & Dairy
  {
    id: 'prod-3',
    name: 'Heritage Special Toned Fresh Milk',
    nameTe: 'హెరిటేజ్ టోన్డ్ పాలు',
    category: 'milk',
    price: 32,
    mrp: 34,
    unit: '500 ml Pouch',
    stock: 18,
    lowStockThreshold: 6,
    badge: 'Fresh Daily',
    description: 'Pasteurized homogenised toned milk delivered fresh every morning.',
    image2D: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🥛',
    imageBg: '#EBF4FC',
    variants: [
      { unit: '500 ml Pouch', price: 32, mrp: 34, stock: 18 },
      { unit: '1 Litre (2 Pouches)', price: 64, mrp: 68, stock: 15 }
    ]
  },
  {
    id: 'prod-10',
    name: 'Amul Pure Cow Ghee Jar',
    nameTe: 'అముల్ ఆవు నెయ్యి',
    category: 'milk',
    price: 330,
    mrp: 350,
    unit: '500 ml Jar',
    stock: 8,
    lowStockThreshold: 4,
    badge: 'Pure Ghee',
    description: 'Golden granular cow ghee crafted using classic butter churning methods.',
    image2D: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🧈',
    imageBg: '#FFF9E6',
    variants: [
      { unit: '200 ml Jar', price: 145, mrp: 155, stock: 15 },
      { unit: '500 ml Jar', price: 330, mrp: 350, stock: 8 },
      { unit: '1 Litre Tin', price: 640, mrp: 690, stock: 5 }
    ]
  },

  // Drinks & Beverages
  {
    id: 'prod-7',
    name: 'Thums Up Cold Carbonated Drink',
    nameTe: 'థమ్స్ అప్ కూల్ డ్రింక్ (750మి.లీ)',
    category: 'drinks',
    price: 40,
    mrp: 40,
    unit: '750 ml Bottle',
    stock: 35,
    lowStockThreshold: 10,
    badge: 'Chilled',
    description: 'Strong carbonated soft drink with an energetic fizzy flavor.',
    image2D: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🥤',
    imageBg: '#F0EAF5'
  },

  // Ice Creams
  {
    id: 'prod-5',
    name: 'Amul Real Milk Vanilla Ice Cream Tub',
    nameTe: 'అముల్ వెనిల్లా ఐస్ క్రీమ్ (1లీ)',
    category: 'icecreams',
    price: 190,
    mrp: 210,
    unit: '1 Litre Tub',
    stock: 0,
    lowStockThreshold: 3,
    badge: 'Out of Stock',
    description: 'Rich creamy vanilla ice cream prepared with 100% real milk cream.',
    image2D: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🍦',
    imageBg: '#FFF6E9'
  },

  // Pickles
  {
    id: 'prod-8',
    name: 'Priya Avakaya Spicy Mango Pickle',
    nameTe: 'ప్రియ ఆవకాయ మామిడికాయ పచ్చడి',
    category: 'pickles',
    price: 135,
    mrp: 150,
    unit: '500g Jar',
    stock: 9,
    lowStockThreshold: 3,
    badge: 'Authentic',
    description: 'Traditional Andhra spicy raw mango pickle made with pure sesame oil.',
    image2D: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🫙',
    imageBg: '#FCF3D7',
    variants: [
      { unit: '300g Glass Jar', price: 90, mrp: 100, stock: 14 },
      { unit: '500g Jar', price: 135, mrp: 150, stock: 9 },
      { unit: '1 kg Tub', price: 260, mrp: 290, stock: 5 }
    ]
  },

  // Pooja Items
  {
    id: 'prod-9',
    name: 'Mysore Sandal Premium Agarbatti',
    nameTe: 'మైసూర్ శాండల్ అగరబత్తి',
    category: 'pooja',
    price: 65,
    mrp: 75,
    unit: '1 Pack (100 Sticks)',
    stock: 15,
    lowStockThreshold: 5,
    badge: 'Divine Aroma',
    description: 'Pure sandalwood fragrant incense sticks for daily pooja rituals.',
    image2D: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🪔',
    imageBg: '#F5EFE6'
  },

  // Pure Desi Cow Ghee
  {
    id: 'prod-4',
    name: 'Pure Desi Cow Ghee',
    nameTe: 'స్వచ్ఛమైన ఆవు నెయ్యి',
    category: 'grocery',
    price: 320,
    mrp: 350,
    unit: '500 ml Jar',
    stock: 18,
    lowStockThreshold: 4,
    badge: '100% Pure',
    description: 'Traditional golden bilona-churned cow ghee with rich grainy texture and divine aroma.',
    image2D: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🧈',
    imageBg: '#FFFBEB',
    variants: [
      { unit: '200 ml Jar', price: 140, mrp: 150, stock: 12 },
      { unit: '500 ml Jar', price: 320, mrp: 350, stock: 18 },
      { unit: '1 Litre Tin', price: 620, mrp: 680, stock: 7 }
    ]
  },

  // Utility Bill Payments
  {
    id: 'prod-11',
    name: 'Electricity Bill Payment (TSSPDCL / APCPDCL)',
    nameTe: 'కరెంట్ బిల్లు చెల్లింపు',
    category: 'utilities',
    price: 0,
    mrp: 0,
    unit: 'Instant Bill Pay',
    stock: 999,
    lowStockThreshold: 0,
    badge: '0% Fee',
    description: 'Pay your monthly electricity bill instantly with direct consumer number confirmation.',
    image2D: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '⚡',
    imageBg: '#FEF9E7',
    isUtility: true,
    utilityType: 'electricity'
  },
  {
    id: 'prod-12',
    name: 'DTH Dish Recharge & Mobile Top-up',
    nameTe: 'డిటిహెచ్ & మొబైల్ రీఛార్జ్',
    category: 'utilities',
    price: 0,
    mrp: 0,
    unit: 'Instant Recharge',
    stock: 999,
    lowStockThreshold: 0,
    badge: 'Instant Cashback',
    description: 'Recharge Tata Play, Airtel DTH, Dish TV or prepaid mobile numbers.',
    image2D: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '📱',
    imageBg: '#EBF3FE',
    isUtility: true,
    utilityType: 'dth_mobile'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-9842',
    customerName: 'Kavitha Reddy',
    phone: '+91 98490 12345',
    address: 'Flat 402, Sai Residency, Jubilee Hills, Sector 3',
    items: [
      { id: 'prod-1', name: 'Sona Masoori Raw Rice (5kg)', quantity: 1, price: 340 },
      { id: 'prod-3', name: 'Heritage Special Toned Milk', quantity: 2, price: 32 }
    ],
    subtotal: 404,
    deliveryFee: 0,
    totalAmount: 404,
    deliveryType: 'Emergency',
    status: 'Out for Delivery',
    placedAt: '10:14 AM Today',
    deliveryWindow: 'Within 15 Mins',
    isEmergency: true,
    assignedRider: 'Raju M. (+91 91234 56789)',
    paymentMethod: 'UPI Online (abicharan07@axl • Ref: TXN-89421)'
  },
  {
    id: 'ORD-9841',
    customerName: 'Suresh Varma',
    phone: '+91 94401 88765',
    address: 'House 12-4-88, Market Street, Secunderabad',
    items: [
      { id: 'prod-4', name: 'Pure Desi Cow Ghee (500ml)', quantity: 1, price: 320 },
      { id: 'prod-9', name: 'Mysore Sandal Premium Agarbatti', quantity: 1, price: 65 }
    ],
    subtotal: 385,
    deliveryFee: 0,
    totalAmount: 385,
    deliveryType: 'Normal',
    status: 'Preparing',
    placedAt: '09:45 AM Today',
    deliveryWindow: '2:15 PM – 5:15 PM',
    isEmergency: false,
    assignedRider: 'Srinivas K. (+91 98765 43210)'
  }
];

export const TELUGU_TRANSLATIONS = {
  storeName: 'నిస్సి సూపర్ స్టోర్స్',
  tagline: 'మీ ఇంటి దరిచేరే స్పీడ్ కిరాణా',
  storeOpen: 'స్టోర్ ఓపెన్',
  storeClosed: 'స్టోర్ క్లోజ్',
  freeDeliveryOver199: '₹199 పైన ఉచిత డెలివరీ',
  normalSlot: 'సాధారణ సమయం 2:15–5:15 PM',
  trackOrder: 'ఆర్డర్ ట్రాకింగ్',
  admin: 'అడ్మిన్ ప్యానెల్',
  staffView: 'డెలివరీ స్టాఫ్',
  login: 'లాగిన్',
  logout: 'లాగ్ అవుట్',
  addToCart: 'కార్ట్‌కు జోడించు',
  outOfStock: 'స్టాక్ లేదు',
  lowStock: 'తక్కువ స్టాక్ ఉంది',
  inStock: 'స్టాక్ అందుబాటులో ఉంది',
  grandTotal: 'మొత్తం చెల్లింపు',
  proceedToCheckout: 'చెల్లింపుకు వెళ్లండి',
  placeOrder: 'ఆర్డర్ ఖరారు చేయండి',
  emergencyDelivery: '15-నిమిషాల అత్యవసర డెలివరీ',
  normalDelivery: 'సాధారణ డెలివరీ',
  searchPlaceholder: 'బియ్యం, పప్పు, పాలు, స్నాక్స్, ఊరగాయలు, పూజా సామగ్రి కోసం వెతకండి...'
};

export const SALES_TREND_DATA = [
  { time: '8 AM', orders: 12, revenue: 2840, emergency: 3 },
  { time: '10 AM', orders: 28, revenue: 6420, emergency: 8 },
  { time: '12 PM', orders: 45, revenue: 11200, emergency: 14 },
  { time: '2 PM', orders: 62, revenue: 16800, emergency: 19 },
  { time: '4 PM', orders: 84, revenue: 22400, emergency: 25 },
  { time: '6 PM', orders: 110, revenue: 29800, emergency: 36 },
  { time: '8 PM', orders: 135, revenue: 38200, emergency: 42 }
];

/**
 * Returns the pack size / weight variants available for a given product.
 * If the product has a custom variants array, it returns that.
 * Otherwise, it creates a fallback single-variant array using the product's base price, mrp, and unit.
 */
export function getProductVariants(product) {
  if (!product) return [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  const defaultProd = INITIAL_PRODUCTS.find((p) => p.id === product.id);
  if (defaultProd && Array.isArray(defaultProd.variants) && defaultProd.variants.length > 0) {
    return defaultProd.variants;
  }
  return [
    {
      unit: product.unit || '1 Unit',
      price: Number(product.price) || 0,
      mrp: Number(product.mrp ?? product.price) || 0,
      stock: Number(product.stock) || 0
    }
  ];
}
