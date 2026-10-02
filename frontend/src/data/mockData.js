export const initialTransactions = [
  {
    id: "TX-94821",
    timestamp: "2026-09-30 22:12:04",
    cardHolder: "Sarah Jenkins",
    cardNumber: "•••• 4821",
    merchant: "Luxury Watches Direct",
    category: "Luxury Goods",
    amount: 3499.00,
    location: "Miami, FL (IP: London, UK)",
    riskScore: 94,
    status: "Fraud Detected",
    riskLevel: "Critical",
    aiReasoning: ["Geo-IP anomaly (Physical FL vs IP London)", "High-velocity purchase ($3.5k)", "New merchant category for user"]
  },
  {
    id: "TX-94820",
    timestamp: "2026-09-30 22:11:45",
    cardHolder: "David Miller",
    cardNumber: "•••• 1092",
    merchant: "Whole Foods Market",
    category: "Groceries",
    amount: 84.20,
    location: "Austin, TX",
    riskScore: 3,
    status: "Legitimate",
    riskLevel: "Low",
    aiReasoning: ["Matches daily purchasing pattern", "Trusted merchant", "Known device fingerprint"]
  },
  {
    id: "TX-94819",
    timestamp: "2026-09-30 22:10:12",
    cardHolder: "Elena Rostova",
    cardNumber: "•••• 8301",
    merchant: "CryptoEx Online",
    category: "Digital Exchange",
    amount: 1250.00,
    location: "New York, NY (IP: Proxy Network)",
    riskScore: 88,
    status: "Fraud Detected",
    riskLevel: "High",
    aiReasoning: ["Anonymous proxy detected", "Crypto exchange transaction", "Cardholder 1st time digital trade"]
  },
  {
    id: "TX-94818",
    timestamp: "2026-09-30 22:08:50",
    cardHolder: "Marcus Vance",
    cardNumber: "•••• 7734",
    merchant: "Apple Store Regent St",
    category: "Electronics",
    amount: 1899.00,
    location: "London, UK",
    riskScore: 62,
    status: "Suspicious",
    riskLevel: "Medium",
    aiReasoning: ["Higher than usual amount", "Location matches last check-in", "Device OS mismatch"]
  },
  {
    id: "TX-94817",
    timestamp: "2026-09-30 22:07:33",
    cardHolder: "Emily Chen",
    cardNumber: "•••• 3910",
    merchant: "Starbucks Coffee",
    category: "Dining",
    amount: 6.75,
    location: "Seattle, WA",
    riskScore: 1,
    status: "Legitimate",
    riskLevel: "Low",
    aiReasoning: ["Regular morning routine", "Low risk amount", "Verified biometrics"]
  },
  {
    id: "TX-94816",
    timestamp: "2026-09-30 22:05:01",
    cardHolder: "Robert Taylor",
    cardNumber: "•••• 9023",
    merchant: "Best Buy Electronics",
    category: "Electronics",
    amount: 649.99,
    location: "Chicago, IL",
    riskScore: 12,
    status: "Legitimate",
    riskLevel: "Low",
    aiReasoning: ["Frequent shopper profile", "Local store terminal ID"]
  },
  {
    id: "TX-94815",
    timestamp: "2026-09-30 22:03:40",
    cardHolder: "Carlos Rodriguez",
    cardNumber: "•••• 5519",
    merchant: "Online Gaming Vault",
    category: "Digital Entertainment",
    amount: 499.00,
    location: "Los Angeles, CA (IP: Lagos, NG)",
    riskScore: 91,
    status: "Fraud Detected",
    riskLevel: "Critical",
    aiReasoning: ["Improbable travel speed (LA to Lagos in 5 mins)", "Card testing signature", "Multiple failed PIN attempts prior"]
  },
  {
    id: "TX-94814",
    timestamp: "2026-09-30 22:01:15",
    cardHolder: "Jessica Taylor",
    cardNumber: "•••• 2281",
    merchant: "Target Supercenter",
    category: "Retail",
    amount: 142.50,
    location: "Minneapolis, MN",
    riskScore: 4,
    status: "Legitimate",
    riskLevel: "Low",
    aiReasoning: ["Standard household purchase", "Location consistency 100%"]
  }
];

export const hourlyChartData = [
  { time: "16:00", legitimate: 4200, fraud: 120, totalAmount: 185000 },
  { time: "17:00", legitimate: 5100, fraud: 95, totalAmount: 220000 },
  { time: "18:00", legitimate: 6800, fraud: 210, totalAmount: 310000 },
  { time: "19:00", legitimate: 7400, fraud: 180, totalAmount: 345000 },
  { time: "20:00", legitimate: 8200, fraud: 340, totalAmount: 410000 },
  { time: "21:00", legitimate: 9100, fraud: 490, totalAmount: 480000 },
  { time: "22:00", legitimate: 6400, fraud: 280, totalAmount: 320000 },
];

export const featureImportanceData = [
  { feature: "Distance from Last Transaction", importance: 38, category: "Behavioral" },
  { feature: "Transaction Velocity (5m)", importance: 26, category: "Frequency" },
  { feature: "Amount Anomaly Score", importance: 18, category: "Financial" },
  { feature: "IP Geolocation Mismatch", importance: 11, category: "Network" },
  { feature: "Device Fingerprint Change", importance: 5, category: "Technical" },
  { feature: "Merchant Risk Rating", importance: 2, category: "Contextual" }
];

export const categoryRiskData = [
  { category: "Crypto & Digital", total: 1250, fraud: 310, riskRate: "24.8%" },
  { category: "Luxury Retail", total: 3400, fraud: 420, riskRate: "12.35%" },
  { category: "Electronics", total: 8900, fraud: 540, riskRate: "6.06%" },
  { category: "Travel & Airlines", total: 4200, fraud: 180, riskRate: "4.28%" },
  { category: "Groceries & Supermarket", total: 18400, fraud: 45, riskRate: "0.24%" },
];

export const initialRules = [
  {
    id: "RULE-101",
    name: "High Velocity Overseas Multi-Transaction",
    condition: "Amount > $1,000 AND IP Country != Card Issuing Country",
    action: "BLOCK & FLAG",
    status: "Active",
    triggerCount: 142
  },
  {
    id: "RULE-102",
    name: "Crypto Exchange First-Time Spike",
    condition: "Merchant Category == Crypto AND User Account Age < 30 days",
    action: "REQUIRE 2FA",
    status: "Active",
    triggerCount: 89
  },
  {
    id: "RULE-103",
    name: "Improbable Physical Travel Velocity",
    condition: "Distance between consecutive transactions > 500 miles within 15 mins",
    action: "BLOCK & FLAG",
    status: "Active",
    triggerCount: 312
  },
  {
    id: "RULE-104",
    name: "Micro Card Testing Sequence",
    condition: "3+ transactions < $2.00 within 60 seconds followed by > $500",
    action: "SUSPEND CARD",
    status: "Active",
    triggerCount: 57
  }
];

export const mockNames = ["Alex Vance", "Sophia Martinez", "Liam O'Connor", "Zoe Kravitz", "Ethan Hunt", "Maya Lin", "Benjamin Hayes", "Chloe Dubois"];
export const mockMerchants = ["Amazon Global", "Steam Games Store", "Rolex Boutique", "Binance Pay", "Uber Luxury", "Nordstrom", "Target Online", "Delta Airlines"];
export const mockCategories = ["Digital Goods", "Luxury Goods", "Travel", "Retail", "Digital Exchange", "Transportation"];
export const mockLocations = ["San Francisco, CA", "New York, NY", "London, UK (IP: Moscow, RU)", "Tokyo, JP", "Paris, FR (IP: Lagos, NG)", "Chicago, IL", "Toronto, CA"];
