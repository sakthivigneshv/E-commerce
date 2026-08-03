const bcrypt = require('bcryptjs');

// Seed products for VizHop
const initialProducts = [
  {
    _id: "prod_1",
    title: "Ultra-Sound Noise Cancelling Headphones",
    description: "Experience premium active noise cancellation, 40-hour battery life, and crystal-clear acoustic clarity with ultra-comfortable memory foam earcups.",
    price: 2499.00,
    originalPrice: 2999.00,
    discountPercentage: 17,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 25,
    rating: 4.8,
    numReviews: 42,
    badge: "Best Seller",
    reviews: [
      { _id: "rev_1", userName: "Alex Johnson", rating: 5, comment: "Incredible sound quality and battery life! The noise cancellation is unbelievable.", createdAt: new Date("2026-07-15") },
      { _id: "rev_2", userName: "Sarah Lee", rating: 4, comment: "Very comfortable for long work hours. Highly recommended!", createdAt: new Date("2026-07-20") }
    ]
  },
  {
    _id: "prod_2",
    title: "Apex Smart Watch Pro Series 8",
    description: "Advanced health tracking with ECG, SPO2 monitoring, GPS, OLED retina display, and water resistance up to 50 meters.",
    price: 3499.00,
    originalPrice: 4299.00,
    discountPercentage: 18,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 18,
    rating: 4.7,
    numReviews: 29,
    badge: "Trending",
    reviews: [
      { _id: "rev_3", userName: "Michael Brown", rating: 5, comment: "Sleek design and super accurate health stats. Love it!", createdAt: new Date("2026-06-10") }
    ]
  },
  {
    _id: "prod_3",
    title: "Pro-Cam 4K Drone Aerial Imaging",
    description: "Capture breathtaking 4K HDR footage with 3-axis gimbal stabilization, 30-min flight time, and obstacle detection.",
    price: 14999.00,
    originalPrice: 17999.00,
    discountPercentage: 16,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 8,
    rating: 4.9,
    numReviews: 19,
    badge: "Hot Deal",
    reviews: []
  },
  {
    _id: "prod_4",
    title: "Minimalist Leather Travel Backpack",
    description: "Handcrafted top-grain leather backpack with dedicated 15-inch laptop compartment, waterproof lining, and ergonomic shoulder straps.",
    price: 1999.00,
    originalPrice: 2499.00,
    discountPercentage: 20,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 30,
    rating: 4.6,
    numReviews: 34,
    badge: "New",
    reviews: []
  },
  {
    _id: "prod_5",
    title: "Smart Espresso & Coffee Maker",
    description: "Barista-quality espresso at home with touch controls, built-in conical burr grinder, and automatic milk frothing wand.",
    price: 5999.00,
    originalPrice: 6999.00,
    discountPercentage: 14,
    category: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 12,
    rating: 4.8,
    numReviews: 56,
    badge: "Best Seller",
    reviews: []
  },
  {
    _id: "prod_6",
    title: "Mechanical RGB Gaming Keyboard",
    description: "Tactile mechanical switches, customizable per-key RGB backlighting, aluminum top plate, and detachable Type-C braided cable.",
    price: 2999.00,
    originalPrice: 3499.00,
    discountPercentage: 14,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 45,
    rating: 4.5,
    numReviews: 88,
    badge: "Trending",
    reviews: []
  }
];

// Initial Banners
const initialBanners = [
  {
    _id: "banner_1",
    title: "Next-Gen Tech Extravaganza",
    subtitle: "Up to 40% OFF on premium headphones, smartwatches, and gadgets.",
    imageUrl: "https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=1200&q=80",
    linkUrl: "/shop?category=Audio",
    active: true
  },
  {
    _id: "banner_2",
    title: "Elevate Your Lifestyle",
    subtitle: "Discover handcrafted fashion accessories & smart home innovations.",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    linkUrl: "/shop?category=Fashion",
    active: true
  }
];

// Initial Categories
const initialCategories = [
  { _id: "cat_1", name: "Electronics", description: "Gadgets, computing & accessories", icon: "Laptop", imageUrl: "https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=400&q=80" },
  { _id: "cat_2", name: "Audio", description: "Headphones, speakers & acoustic gear", icon: "Headphones", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" },
  { _id: "cat_3", name: "Wearables", description: "Smartwatches, fitness bands & tracking", icon: "Watch", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80" },
  { _id: "cat_4", name: "Fashion", description: "Bags, footwear & premium apparel", icon: "ShoppingBag", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80" },
  { _id: "cat_5", name: "Home & Kitchen", description: "Appliances, smart home & decor", icon: "Coffee", imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebe02f2a6e4?auto=format&fit=crop&w=400&q=80" }
];

// Pre-seeded SuperAdmin user and Demo Seller
const defaultAdminUser = {
  _id: "user_admin_creator",
  name: "Sakthi Vijayaraj",
  email: "sakthivijayarajkrv@gmail.com",
  phone: "7358409336",
  passwordHash: bcrypt.hashSync("admin123", 10),
  role: "ADMIN",
  sellerStatus: "VERIFIED",
  storeName: "VizHop Official SuperAdmin",
  storeDescription: "Official Platform Administrator Store",
  isEmailVerified: true,
  isMobileVerified: true,
  emailOTP: null,
  mobileOTP: null,
  address: { street: "Admin HQ", city: "Chennai", state: "TN", zip: "600001", country: "India" }
};

const defaultSellerUser = {
  _id: "user_demo_seller",
  name: "TechTrends Electronics",
  email: "seller@techtrends.com",
  phone: "9876543210",
  passwordHash: bcrypt.hashSync("seller123", 10),
  role: "SELLER",
  sellerStatus: "PENDING",
  storeName: "TechTrends Gadgets & Audio",
  storeDescription: "Authorized retailer for premium sound, drones, and wearable electronics.",
  businessEmail: "contact@techtrends.com",
  businessPhone: "9876543210",
  verificationDoc: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
  isEmailVerified: true,
  isMobileVerified: true,
  emailOTP: null,
  mobileOTP: null,
  address: { street: "10 Innovation Hub", city: "Bengaluru", state: "KA", zip: "560001", country: "India" }
};

// Store container - Includes pre-seeded Admin and demo Seller
const store = {
  users: [defaultAdminUser, defaultSellerUser],
  products: [...initialProducts],
  banners: [...initialBanners],
  categories: [...initialCategories],
  carts: {}, // userId -> { items: [], totalAmount: 0 }
  orders: [],
  announcement: "🚀 Free shipping on all orders over $50! Use code VIZHOP2026"
};

module.exports = store;
