import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowDown,
  ArrowUp,
  SlidersHorizontal,
  Download,
  Eye
} from 'lucide-react';
import { initialTransactions } from '../data/mockData';

// Extended realistic mock transaction dataset for rich UI pagination & filtering
const extendedTransactionsData = [
  ...initialTransactions,
  {
    id: "TX-94813",
    timestamp: "2026-09-30 21:58:20",
    cardHolder: "Nathaniel Brooks",
    cardNumber: "•••• 9182",
    merchant: "Steam Games Store",
    category: "Digital Entertainment",
    amount: 59.99,
    location: "Seattle, WA",
    riskScore: 2,
    status: "Legitimate",
    riskLevel: "Low",
    aiReasoning: ["Standard gaming purchase", "Regular device IP"]
  },
  {
    id: "TX-94812",
    timestamp: "2026-09-30 21:52:10",
    cardHolder: "Amara Okafor",
    cardNumber: "•••• 3391",
    merchant: "Rolex Boutique NYC",
    category: "Luxury Goods",
    amount: 14200.00,
    location: "New York, NY (IP: Hong Kong, HK)",
    riskScore: 98,
    status: "Fraud Detected",
    riskLevel: "Critical",
    aiReasoning: ["High-value luxury transaction", "Impossible travel velocity", "New high-risk IP"]
  },
  {
    id: "TX-94811",
    timestamp: "2026-09-30 21:45:00",
    cardHolder: "Liam Gallagher",
    cardNumber: "•••• 5102",
    merchant: "Binance Pay",
    category: "Digital Exchange",
    amount: 2500.00,
    location: "Manchester, UK",
    riskScore: 79,
    status: "Fraud Detected",
    riskLevel: "High",
    aiReasoning: ["Unusual crypto transfer volume", "First time digital exchange interaction"]
  },
  {
    id: "TX-94810",
    timestamp: "2026-09-30 21:30:15",
    cardHolder: "Sophia Chen",
    cardNumber: "•••• 8821",
    merchant: "Delta Air Lines",
    category: "Travel",
    amount: 840.50,
    location: "Atlanta, GA",
    riskScore: 54,
    status: "Suspicious",
    riskLevel: "Medium",
    aiReasoning: ["Last minute flight booking", "Verified cardholder name"]
  },
  {
    id: "TX-94809",
    timestamp: "2026-09-30 21:15:40",
    cardHolder: "Oliver Wright",
    cardNumber: "•••• 1920",
    merchant: "Nordstrom Fashion",
    category: "Retail",
    amount: 320.00,
    location: "Chicago, IL",
    riskScore: 8,
    status: "Legitimate",
    riskLevel: "Low",
    aiReasoning: ["Verified billing address", "Standard purchase behavior"]
  },
  {
    id: "TX-94808",
    timestamp: "2026-09-30 21:02:11",
    cardHolder: "Isabella Rossi",
    cardNumber: "•••• 6201",
    merchant: "Shell Gas Station",
    category: "Gas & Fuel",
    amount: 45.30,
    location: "Miami, FL",
    riskScore: 5,
    status: "Legitimate",
    riskLevel: "Low",
    aiReasoning: ["Frequent local station fill-up", "Chip-and-PIN verified"]
  },
  {
    id: "TX-94807",
    timestamp: "2026-09-30 20:48:30",
    cardHolder: "Victor Hugo",
    cardNumber: "•••• 7712",
    merchant: "Apple Online Store",
    category: "Electronics",
    amount: 2499.00,
    location: "Paris, FR (IP: Toronto, CA)",
    riskScore: 86,
    status: "Fraud Detected",
    riskLevel: "High",
    aiReasoning: ["IP location mismatch", "High amount electronics purchase"]
  },
  {
    id: "TX-94806",
    timestamp: "2026-09-30 20:30:00",
    cardHolder: "Hannah Abbott",
    cardNumber: "•••• 4410",
    merchant: "Trader Joe's",
    category: "Groceries",
    amount: 112.45,
    location: "Boston, MA",
    riskScore: 2,
    status: "Legitimate",
    riskLevel: "Low",
    aiReasoning: ["Regular weekly grocery shop", "Biometrics authorized"]
  }
];

export default function TransactionsPage({
  transactions = extendedTransactionsData,
  onSelectTransaction,
  externalSearchQuery,
  setExternalSearchQuery
}) {
  // Filter & Search Controls State
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;
  const setSearchQuery = setExternalSearchQuery || setLocalSearchQuery;

  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'amount_desc' | 'amount_asc' | 'risk_desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Combine parent live transactions with default extended mock data if available
  const allData = transactions && transactions.length > 0 ? transactions : extendedTransactionsData;

  // Extract unique categories for dropdown filter
  const categoriesList = useMemo(() => {
    const set = new Set(allData.map(t => t.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [allData]);

  // Filter & Sort Pipeline
  const filteredTransactions = useMemo(() => {
    return allData
      .filter((t) => {
        // Search query matching ID, merchant, customer, location
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          t.id.toLowerCase().includes(q) ||
          t.merchant.toLowerCase().includes(q) ||
          t.cardHolder.toLowerCase().includes(q) ||
          (t.location && t.location.toLowerCase().includes(q));

        // Status Filter
        const matchesStatus =
          statusFilter === 'All' ||
          (statusFilter === 'Legitimate' && t.status === 'Legitimate') ||
          (statusFilter === 'Fraud' && (t.status === 'Fraud Detected' || t.riskScore >= 75)) ||
          (statusFilter === 'Suspicious' && (t.status === 'Suspicious' || (t.riskScore >= 45 && t.riskScore < 75)));

        // Category Filter
        const matchesCategory =
          categoryFilter === 'All' || t.category === categoryFilter;

        return matchesQuery && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        if (sortBy === 'risk_desc') return b.riskScore - a.riskScore;
        // Default 'newest' by ID / timestamp
        return b.id.localeCompare(a.id);
      });
  }, [allData, searchQuery, statusFilter, categoryFilter, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const currentSafePage = Math.min(currentPage, totalPages);
  const startIndex = (currentSafePage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setDateFilter('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Helper for status badge styling
  const renderStatusBadge = (status, riskScore) => {
    const isFraud = status === 'Fraud Detected' || riskScore >= 75;
    const isSuspicious = status === 'Suspicious' || (riskScore >= 45 && riskScore < 75);

    if (isFraud) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/40 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#BC4129] animate-pulse" />
          ● FRAUD
        </span>
      );
    }

    if (isSuspicious) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#BC4129]/10 text-[#BC4129] border border-[#BC4129]/30 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#BC4129]" />
          ● SUSPICIOUS
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#486789]/15 text-[#486789] border border-[#486789]/30 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#486789]" />
        ● LEGITIMATE
      </span>
    );
  };

  // Helper for Risk Score styling (Low -> blue, Medium/High -> red)
  const renderRiskScore = (score) => {
    let colorClass = 'text-[#486789]';
    let bgBarClass = 'bg-[#486789]';
    let label = 'Low';

    if (score >= 75) {
      colorClass = 'text-[#BC4129]';
      bgBarClass = 'bg-[#BC4129]';
      label = 'High';
    } else if (score >= 45) {
      colorClass = 'text-[#BC4129]';
      bgBarClass = 'bg-[#BC4129]/80';
      label = 'Medium';
    }

    return (
      <div className="flex items-center space-x-3 min-w-[120px]">
        <div className="w-14 bg-[#F0EDDF] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#292B23]/15 shrink-0">
          <div
            className={`h-full rounded-full ${bgBarClass} transition-all duration-500`}
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>
        <div className="font-mono text-sm font-bold flex items-center gap-1">
          <span className={colorClass}>{score}%</span>
          <span className={`text-[10px] uppercase px-1 rounded border font-semibold opacity-80 ${colorClass}`}>
            {label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#292B23]/15">
        <div>
          <div className="flex items-center space-x-2 text-[#BC4129] font-black text-base uppercase tracking-widest mb-1">
            <CreditCard className="w-5 h-5 text-[#BC4129]" />
            <span>Audit & Monitoring</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#292B23] tracking-tight">
            Transactions
          </h1>
          <p className="text-base sm:text-lg text-[#292B23]/90 mt-1 font-semibold">
            Monitor and review transaction activity in real-time.
          </p>
        </div>

        {/* Header Stats Counter Badge */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#E2DFCE] px-5 py-3 rounded-2xl border border-[#292B23]/20 shadow-sm text-base text-[#292B23] font-extrabold">
            <span className="text-[#292B23]/80 font-bold">Total Activity: </span>
            <span className="font-mono font-black text-[#BC4129] text-lg ml-1">
              {filteredTransactions.length}
            </span>
          </div>
        </div>
      </div>

      {/* TOP CONTROL SECTION — Filters & Search */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
          
          {/* 1. Search Box (Lg: 4 cols) */}
          <div className="lg:col-span-4 relative group">
            <Search className="w-5.5 h-5.5 absolute left-4 top-1/2 -translate-y-1/2 text-[#292B23]/60 group-hover:text-[#BC4129] transition-colors" />
            <input
              type="text"
              placeholder="Search transactions (Cmd+K)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 hover:border-[#292B23]/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#292B23]/60 hover:text-[#292B23] font-black text-base"
              >
                ✕
              </button>
            )}
          </div>

          {/* 2. Status Filter Dropdown (Lg: 2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-3.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 hover:border-[#292B23]/40 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Legitimate">Legitimate</option>
              <option value="Fraud">Fraud Detected</option>
              <option value="Suspicious">Suspicious</option>
            </select>
          </div>

          {/* 3. Category Filter Dropdown (Lg: 2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-3.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 hover:border-[#292B23]/40 transition-all cursor-pointer"
            >
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Filter Dropdown (Lg: 2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3.5 py-3.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 hover:border-[#292B23]/40 transition-all cursor-pointer"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* 5. Sort Button (Lg: 2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-3.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-black text-[#486789] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 hover:border-[#292B23]/40 transition-all cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="risk_desc">Risk Score: Highest</option>
            </select>
          </div>

        </div>

        {/* Filter Summary Tags & Reset */}
        {(searchQuery || statusFilter !== 'All' || categoryFilter !== 'All' || dateFilter !== 'All') && (
          <div className="flex items-center justify-between pt-3 border-t border-[#292B23]/15 text-base">
            <div className="flex items-center space-x-2 text-[#292B23] font-semibold">
              <span>Active Filters:</span>
              {statusFilter !== 'All' && (
                <span className="px-3 py-1 rounded-lg bg-[#F0EDDF] text-[#BC4129] border border-[#BC4129]/30 font-black">
                  Status: {statusFilter}
                </span>
              )}
              {categoryFilter !== 'All' && (
                <span className="px-3 py-1 rounded-lg bg-[#F0EDDF] text-[#BC4129] border border-[#BC4129]/30 font-black">
                  Cat: {categoryFilter}
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 rounded-lg bg-[#F0EDDF] text-[#BC4129] border border-[#BC4129]/30 font-black">
                  "{searchQuery}"
                </span>
              )}
            </div>

            <button
              onClick={resetFilters}
              className="text-[#BC4129] hover:text-[#292B23] text-base font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

      </div>

      {/* LARGE RESPONSIVE TRANSACTION TABLE */}
      <div className="glass-panel rounded-3xl border border-[#292B23]/15 shadow-md overflow-hidden bg-[#E2DFCE]">
        
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#E2DFCE] border-b border-[#292B23]/20 text-xs sm:text-sm font-black uppercase tracking-wider text-[#292B23]/80 select-none">
                <th className="py-4.5 px-6">Transaction ID</th>
                <th className="py-4.5 px-6">Date</th>
                <th className="py-4.5 px-6">Merchant</th>
                <th className="py-4.5 px-6">Category</th>
                <th className="py-4.5 px-6 text-right">Amount</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6">Risk Score</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#292B23]/10 text-base">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                    className="hover:bg-[#F0EDDF]/70 transition-colors duration-150 cursor-pointer group"
                  >
                    
                    {/* 1. Transaction ID */}
                    <td className="py-5 px-6 font-mono font-black text-base sm:text-lg text-[#BC4129] group-hover:text-[#486789] transition-colors">
                      {tx.id}
                    </td>

                    {/* 2. Date */}
                    <td className="py-5 px-6 text-[#292B23]/90 font-mono text-sm sm:text-base font-bold">
                      {tx.timestamp}
                    </td>

                    {/* 3. Merchant & Customer */}
                    <td className="py-5 px-6">
                      <div className="font-black text-lg text-[#292B23] group-hover:text-[#BC4129] transition-colors">
                        {tx.merchant}
                      </div>
                      <div className="text-xs sm:text-sm text-[#292B23]/80 font-bold">
                        {tx.cardHolder} ({tx.cardNumber})
                      </div>
                    </td>

                    {/* 4. Category */}
                    <td className="py-5 px-6">
                      <span className="px-3.5 py-1.5 rounded-lg bg-[#F0EDDF] border border-[#292B23]/20 text-[#292B23] text-xs sm:text-sm font-black">
                        {tx.category || 'General'}
                      </span>
                    </td>

                    {/* 5. Amount */}
                    <td className="py-5 px-6 text-right font-mono font-black text-[#292B23] text-lg sm:text-xl">
                      ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* 6. Status Badge */}
                    <td className="py-5 px-6">
                      {renderStatusBadge(tx.status, tx.riskScore)}
                    </td>

                    {/* 7. Risk Score Meter */}
                    <td className="py-5 px-6">
                      {renderRiskScore(tx.riskScore)}
                    </td>

                  </tr>
                ))
              ) : (
                /* EMPTY STATE */
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-[#BC4129]/10 border border-[#BC4129]/30 flex items-center justify-center text-[#BC4129]">
                        <Search className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#292B23]">No matching transactions</h3>
                        <p className="text-base text-[#292B23]/80 mt-1 font-semibold">
                          No transaction records match your search criteria or selected filters.
                        </p>
                      </div>
                      <button
                        onClick={resetFilters}
                        className="px-6 py-3 rounded-xl bg-[#486789] text-[#F0EDDF] hover:bg-[#385270] text-base font-black transition-all cursor-pointer shadow-md"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* PAGINATION & FOOTER CONTROLS */}
        <div className="py-5 px-6 bg-[#E2DFCE] border-t border-[#292B23]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-base text-[#292B23]/90">
          
          {/* Showing Count */}
          <div className="font-bold">
            Showing{' '}
            <span className="font-black text-[#292B23]">
              {filteredTransactions.length > 0 ? startIndex + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-black text-[#292B23]">
              {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}
            </span>{' '}
            of <span className="font-black text-[#BC4129]">{filteredTransactions.length}</span> transactions
          </div>

          {/* Page Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentSafePage === 1}
              className="p-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-[#292B23] hover:text-[#BC4129] disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <span className="px-5 py-2 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-mono font-black text-[#292B23]">
              Page {currentSafePage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentSafePage === totalPages}
              className="p-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-[#292B23] hover:text-[#BC4129] disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
