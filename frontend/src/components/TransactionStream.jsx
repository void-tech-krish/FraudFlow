import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, AlertTriangle, Eye, Zap, X } from 'lucide-react';

export default function TransactionStream({ transactions, onSelectTransaction, isStreaming, externalSearchQuery, setExternalSearchQuery }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const activeSearch = (externalSearchQuery !== undefined && externalSearchQuery !== '') ? externalSearchQuery : localSearchQuery;
  const updateSearch = (val) => {
    if (setExternalSearchQuery) setExternalSearchQuery(val);
    setLocalSearchQuery(val);
  };

  const filteredTransactions = transactions.filter(tx => {
    const query = activeSearch.toLowerCase();
    const matchesSearch =
      tx.cardHolder.toLowerCase().includes(query) ||
      tx.cardNumber.includes(query) ||
      tx.merchant.toLowerCase().includes(query) ||
      tx.category.toLowerCase().includes(query) ||
      tx.location.toLowerCase().includes(query) ||
      tx.id.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (filterStatus === 'Fraud') return tx.riskLevel === 'Critical' || tx.status === 'Fraud Detected' || tx.riskScore >= 75;
    if (filterStatus === 'Suspicious') return (tx.riskScore >= 45 && tx.riskScore < 75) || tx.status === 'Suspicious';
    if (filterStatus === 'Legitimate') return tx.status === 'Legitimate' || tx.riskScore < 45;
    return true;
  });

  return (
    <div className="glass-panel rounded-3xl border border-[#292B23]/15 overflow-hidden shadow-md bg-[#E2DFCE]">
      {/* Table Header Controls */}
      <div className="p-4 lg:p-6 border-b border-[#292B23]/15 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E2DFCE]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl lg:text-3xl font-black text-[#292B23] tracking-tight flex items-center gap-2">
              <Zap className="w-7 h-7 text-[#BC4129] animate-pulse" />
              Live Transaction Stream
            </h2>
            {isStreaming && (
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/40 text-xs font-black uppercase tracking-wider animate-pulse shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BC4129]" />
                Live Stream
              </span>
            )}
          </div>
          <p className="text-base text-[#292B23]/90 mt-1 font-semibold">
            Real-time credit card telemetry evaluated by FraudFlow AI ensemble.
          </p>
        </div>

        {/* Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-80 group">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#292B23]/60 group-hover:text-[#BC4129] transition-colors" />
            <input
              type="text"
              placeholder="Filter card, user, ID..."
              value={activeSearch}
              onChange={(e) => updateSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#F0EDDF] border border-[#292B23]/25 text-base font-bold text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 transition-all shadow-inner"
            />
            {activeSearch && (
              <button
                onClick={() => updateSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#292B23]/60 hover:text-[#292B23] p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-[#F0EDDF] p-1.5 rounded-xl border border-[#292B23]/20 text-sm font-bold">
            {['All', 'Fraud', 'Suspicious', 'Legitimate'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-2 rounded-lg font-black transition-all cursor-pointer text-sm ${
                  filterStatus === status
                    ? 'bg-[#486789] text-[#F0EDDF] shadow-md border border-[#486789]'
                    : 'text-[#292B23]/70 hover:text-[#292B23] hover:bg-[#E2DFCE]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-base text-[#292B23]">
          <thead className="bg-[#E2DFCE] uppercase font-black text-[#292B23]/80 border-b border-[#292B23]/20 text-xs sm:text-sm tracking-wider select-none">
            <tr>
              <th className="py-4.5 px-6">Transaction ID</th>
              <th className="py-4.5 px-6">Cardholder</th>
              <th className="py-4.5 px-6">Merchant & Category</th>
              <th className="py-4.5 px-6">Location & IP</th>
              <th className="py-4.5 px-6 text-right">Amount</th>
              <th className="py-4.5 px-6 text-center">AI Risk Score</th>
              <th className="py-4.5 px-6 text-center">Status</th>
              <th className="py-4.5 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292B23]/15 font-sans">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#BC4129]/15 border border-[#BC4129]/30 flex items-center justify-center text-[#BC4129]">
                      <Search className="w-7 h-7" />
                    </div>
                    <span className="text-lg font-black text-[#292B23] block">No matching transactions</span>
                    <span className="text-sm text-[#292B23]/70 block font-semibold">Try clearing your search query or filter options.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isFraud = tx.riskScore >= 75 || tx.status === 'Fraud Detected';
                const isSuspicious = tx.riskScore >= 45 && tx.riskScore < 75;

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-[#F0EDDF]/80 transition-colors duration-150 cursor-pointer group"
                  >
                    {/* ID & Time */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="font-mono font-black text-[#BC4129] text-base sm:text-lg group-hover:text-[#486789] transition-colors">
                        {tx.id}
                      </div>
                      <div className="text-xs sm:text-sm text-[#292B23]/80 font-mono mt-0.5 font-bold">
                        {tx.timestamp.includes(' ') ? tx.timestamp.split(' ')[1] : tx.timestamp}
                      </div>
                    </td>

                    {/* Cardholder */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="font-black text-[#292B23] text-base sm:text-lg group-hover:text-[#BC4129] transition-colors">{tx.cardHolder}</div>
                      <div className="text-xs sm:text-sm text-[#292B23]/80 font-mono mt-0.5 font-semibold">{tx.cardNumber}</div>
                    </td>

                    {/* Merchant & Category */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="font-black text-[#292B23] text-base sm:text-lg">{tx.merchant}</div>
                      <div className="text-xs sm:text-sm font-black text-[#BC4129] mt-0.5">{tx.category}</div>
                    </td>

                    {/* Location */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="text-[#292B23]/90 font-bold text-sm sm:text-base truncate max-w-[220px]">{tx.location}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-4.5 px-6 text-right whitespace-nowrap font-mono font-black text-[#292B23] text-lg">
                      ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Risk Score */}
                    <td className="py-4.5 px-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono font-black text-sm bg-[#F0EDDF] border border-[#292B23]/25 shadow-inner">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isFraud
                              ? 'bg-[#BC4129] animate-pulse'
                              : isSuspicious
                              ? 'bg-[#BC4129]/80'
                              : 'bg-[#486789]'
                          }`}
                        />
                        <span
                          className={
                            isFraud
                              ? 'text-[#BC4129] font-black'
                              : isSuspicious
                              ? 'text-[#BC4129] font-black'
                              : 'text-[#486789] font-black'
                          }
                        >
                          {tx.riskScore}%
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4.5 px-6 text-center whitespace-nowrap">
                      {isFraud ? (
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/40 text-xs font-black tracking-wider uppercase">
                          ● FRAUD
                        </span>
                      ) : isSuspicious ? (
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BC4129]/10 text-[#BC4129] border border-[#BC4129]/30 text-xs font-black tracking-wider uppercase">
                          ● SUSPICIOUS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#486789]/15 text-[#486789] border border-[#486789]/30 text-xs font-black tracking-wider uppercase">
                          ● LEGITIMATE
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4.5 px-6 text-center whitespace-nowrap">
                      <button className="p-2.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/20 text-[#292B23]/80 hover:text-[#BC4129] hover:border-[#BC4129]/40 transition-all cursor-pointer">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
