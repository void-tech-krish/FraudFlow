import React from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle, MapPin, CreditCard, User, Clock, Cpu } from 'lucide-react';

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;

  const isFraud = transaction.riskScore >= 75 || transaction.status === 'Fraud Detected';
  const isSuspicious = transaction.riskScore >= 40 && transaction.riskScore < 75;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292B23]/60 backdrop-blur-sm">
      <div className="glass-panel max-w-xl w-full rounded-2xl p-6 border border-[#292B23]/20 shadow-2xl space-y-6 relative overflow-hidden bg-[#F0EDDF] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#292B23]/15 pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-[#BC4129]">{transaction.id}</span>
              {isFraud ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/30 text-xs font-semibold">
                  Fraud Detected
                </span>
              ) : isSuspicious ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#BC4129]/10 text-[#BC4129] border border-[#BC4129]/20 text-xs font-semibold">
                  Suspicious Activity
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#486789]/15 text-[#486789] border border-[#486789]/30 text-xs font-semibold">
                  Legitimate Transaction
                </span>
              )}
            </div>
            <p className="text-xs text-[#292B23]/70 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#292B23]/50" />
              {transaction.timestamp}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 text-[#292B23]/70 hover:text-[#292B23] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score & Main Stats */}
        <div className="p-4 rounded-xl bg-[#E2DFCE] border border-[#292B23]/15 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-[#292B23]/60 uppercase font-semibold block">Transaction Amount</span>
            <span className="text-2xl font-mono font-bold text-[#292B23]">
              ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#292B23]/60 uppercase font-semibold block">AI Risk Score</span>
            <span className={`text-2xl font-mono font-extrabold ${
              isFraud ? 'text-[#BC4129]' : isSuspicious ? 'text-[#BC4129]' : 'text-[#486789]'
            }`}>
              {transaction.riskScore}<span className="text-xs text-[#292B23]/50">/100</span>
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#E2DFCE]/60 border border-[#292B23]/15 space-y-1">
            <span className="text-[#292B23]/60 font-semibold block">Cardholder</span>
            <span className="text-[#292B23] font-bold block">{transaction.cardHolder}</span>
            <span className="text-[#292B23]/70 font-mono text-[11px] block">{transaction.cardNumber}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#E2DFCE]/60 border border-[#292B23]/15 space-y-1">
            <span className="text-[#292B23]/60 font-semibold block">Merchant & Category</span>
            <span className="text-[#292B23] font-bold block">{transaction.merchant}</span>
            <span className="text-[#BC4129] font-medium text-[11px] block">{transaction.category}</span>
          </div>
        </div>

        {/* Location & Network */}
        <div className="p-3.5 rounded-xl bg-[#E2DFCE]/60 border border-[#292B23]/15 text-xs space-y-1">
          <span className="text-[#292B23]/60 font-semibold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#486789]" />
            Location & IP Geolocation
          </span>
          <span className="text-[#292B23] font-medium block">{transaction.location}</span>
        </div>

        {/* AI Triggers */}
        {transaction.aiReasoning && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#292B23] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#BC4129]" />
              AI Decision Explanation
            </span>
            <div className="space-y-1.5">
              {transaction.aiReasoning.map((r, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#BC4129]/10 border border-[#BC4129]/20 text-xs text-[#BC4129] font-medium">
                  • {r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#486789] hover:bg-[#3b5572] text-[#F0EDDF] font-bold text-xs shadow-md cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
