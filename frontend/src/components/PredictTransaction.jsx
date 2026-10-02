import React, { useState } from 'react';
import {
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  User,
  ShoppingBag,
  DollarSign,
  Search,
  Zap,
  Globe,
  Cpu
} from 'lucide-react';
import PredictionResult from './PredictionResult';

export default function PredictTransaction() {
  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    category: 'Electronics & Tech',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    customer: '',
    location: '',
    paymentMethod: 'Visa Credit Card (•••• 4821)'
  });

  // UI Result State: 'idle' | 'loading' | 'safe' | 'fraud'
  const [resultState, setResultState] = useState('idle');

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultState('loading');

    try {
      const amountVal = parseFloat(formData.amount) || 250.0;
      const payload = {
        trans_date_trans_time: `${formData.date} ${formData.time}:00`,
        cc_num: 1234567890123456,
        merchant: formData.merchant || "Unknown",
        category: formData.category || "misc_net",
        amt: amountVal,
        first: formData.customer.split(" ")[0] || "John",
        last: formData.customer.split(" ")[1] || "Doe",
        gender: "M",
        street: "123 Main St",
        city: formData.location.split(",")[0] || "New York",
        state: "NY",
        zip: 10001,
        lat: 40.7128,
        long: -74.0060,
        city_pop: 8000000,
        job: "Software Engineer",
        dob: "1990-01-01",
        trans_num: `TXN${Math.floor(Math.random() * 1000000)}`,
        unix_time: Math.floor(new Date(`${formData.date}T${formData.time}`).getTime() / 1000),
        merch_lat: 40.75,
        merch_long: -73.98
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }

      const data = await response.json();
      
      const isFraud = data.prediction === 1 || data.decision === 'fraud' || data.decision === 'block' || data.decision === 'review';
      
      setResultState(isFraud ? 'fraud' : 'safe');
    } catch (error) {
      console.error("Prediction Error:", error);
      setResultState('idle');
      alert("Failed to connect to the backend API.");
    }
  };

  const handleReset = () => {
    setResultState('idle');
  };

  const handleToggleDemoState = (newState) => {
    setResultState(newState);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#292B23]/15">
        <div>
          <div className="flex items-center space-x-2 text-[#BC4129] font-black text-sm uppercase tracking-widest mb-1">
            <Zap className="w-5 h-5 text-[#BC4129] animate-pulse" />
            <span>AI Risk Scoring Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#292B23] tracking-tight">
            Check a Transaction
          </h1>
          <p className="text-base sm:text-lg text-[#292B23]/90 mt-1 font-semibold">
            Analyze a transaction and identify potential fraud risk using AI.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2.5 bg-[#E2DFCE] px-5 py-3 rounded-2xl border border-[#292B23]/20 shadow-sm shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#486789] animate-ping" />
          <span className="text-sm font-black text-[#292B23] tracking-wide">
            Model Status: <span className="text-[#486789]">Online v2.4</span>
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDE — Transaction Form */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-[#292B23]/15 shadow-md relative overflow-hidden bg-[#E2DFCE] space-y-6">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#BC4129]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#486789]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between relative z-10 border-b border-[#292B23]/15 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#486789] p-0.5 shadow-md flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#F0EDDF]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#292B23] tracking-tight">
                  Transaction Details
                </h2>
                <p className="text-sm text-[#292B23]/80 font-semibold">
                  Input payment parameters for AI fraud evaluation
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#486789] bg-[#F0EDDF] border border-[#292B23]/20 px-3 py-1.5 rounded-full">
              Form Entry
            </span>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            
            {/* Amount & Merchant Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. Transaction Amount */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#292B23] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#486789]" />
                  Transaction Amount ($) <span className="text-[#BC4129]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-[#292B23]/60 text-base">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="e.g. 250.00"
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner font-mono"
                  />
                </div>
              </div>

              {/* 2. Merchant Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#292B23] flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#BC4129]" />
                  Merchant <span className="text-[#BC4129]">*</span>
                </label>
                <input
                  type="text"
                  name="merchant"
                  value={formData.merchant}
                  onChange={handleChange}
                  placeholder="e.g. Apple Store, Amazon"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner"
                />
              </div>

            </div>

            {/* Category & Customer Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 3. Category Select Dropdown */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#292B23] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#486789]" />
                  Category <span className="text-[#BC4129]">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner cursor-pointer"
                >
                  <option value="Electronics & Tech">Electronics & Tech</option>
                  <option value="Travel & Airlines">Travel & Airlines</option>
                  <option value="Luxury Retail">Luxury Retail</option>
                  <option value="Crypto Exchange">Crypto Exchange</option>
                  <option value="Online Gaming & Betting">Online Gaming & Betting</option>
                  <option value="Gas & Fuel">Gas & Fuel Station</option>
                  <option value="Restaurants & Food">Restaurants & Food</option>
                  <option value="Supermarket & Groceries">Supermarket & Groceries</option>
                </select>
              </div>

              {/* 4. Customer Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#292B23] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#BC4129]" />
                  Customer <span className="text-[#BC4129]">*</span>
                </label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  placeholder="e.g. Anil"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner"
                />
              </div>

            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 5. Transaction Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#292B23] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#486789]" />
                  Transaction Date <span className="text-[#BC4129]">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner cursor-pointer"
                />
              </div>

              {/* 6. Transaction Time */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#292B23] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#BC4129]" />
                  Transaction Time <span className="text-[#BC4129]">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner cursor-pointer"
                />
              </div>

            </div>

            {/* Location & Payment Instrument Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 7. Location */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#292B23] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#486789]" />
                  Location <span className="text-[#BC4129]">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. New York, USA"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner"
                />
              </div>

              {/* Payment Instrument */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#292B23] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#BC4129]" />
                  Payment Instrument
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner cursor-pointer"
                >
                  <option value="Visa Credit Card (•••• 4821)">Visa Credit Card (•••• 4821)</option>
                  <option value="Mastercard Debit (•••• 8192)">Mastercard Debit (•••• 8192)</option>
                  <option value="Apple Pay Mobile Wallet">Apple Pay Mobile Wallet</option>
                  <option value="Crypto Transfer">Crypto Transfer</option>
                </select>
              </div>

            </div>

            {/* Large CTA Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={resultState === 'loading'}
                className="w-full py-4 px-6 rounded-2xl font-black text-base tracking-wider uppercase text-[#F0EDDF] bg-[#486789] hover:bg-[#3b5572] shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 border border-[#486789] cursor-pointer disabled:opacity-50"
              >
                <Search className="w-5 h-5 text-[#F0EDDF] animate-bounce" />
                <span>🔍 CHECK TRANSACTION</span>
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT SIDE — Reusable Prediction Result Component */}
        <div className="lg:col-span-5">
          <PredictionResult
            resultState={resultState}
            data={{
              amount: formData.amount,
              merchant: formData.merchant,
              category: formData.category,
              customer: formData.customer,
              location: formData.location,
              date: formData.date,
              time: formData.time
            }}
            onReset={handleReset}
            onToggleState={handleToggleDemoState}
          />
        </div>

      </div>

    </div>
  );
}
