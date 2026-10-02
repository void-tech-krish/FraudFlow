import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  FileText,
  CheckCircle2,
  MapPin,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  ShieldX
} from 'lucide-react';

export default function InvestigationWorkbench({ transactions, onActionComplete }) {
  const flaggedCases = transactions.filter(
    (tx) => tx.riskScore >= 45 || tx.status === 'Fraud Detected' || tx.status === 'Suspicious'
  );

  const [selectedCase, setSelectedCase] = useState(flaggedCases[0] || transactions[0]);
  const [actionFeedback, setActionFeedback] = useState(null);

  const handleCaseAction = (actionType) => {
    setActionFeedback({
      caseId: selectedCase.id,
      action: actionType,
      timestamp: new Date().toLocaleTimeString()
    });

    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);

    if (onActionComplete) {
      onActionComplete(selectedCase.id, actionType);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-[#486789] text-[#F0EDDF] font-bold text-xs flex items-center justify-between shadow-md animate-in slide-in-from-top-2 border border-[#486789]">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#F0EDDF]" />
            <span>
              Case <strong className="font-mono">{actionFeedback.caseId}</strong> updated to: <strong>{actionFeedback.action}</strong>
            </span>
          </div>
          <span className="text-[10px] opacity-80 font-mono">{actionFeedback.timestamp}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Flagged Cases Queue */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#292B23] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#BC4129]" />
              High-Risk Investigation Queue
            </h3>
            <p className="text-xs text-[#292B23]/70 mt-0.5">
              Transactions flagged by AI ensemble requiring analyst review.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
            {flaggedCases.map((item) => {
              const isSelected = selectedCase?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F0EDDF] border-[#BC4129] shadow-md'
                      : 'bg-[#F0EDDF]/60 border-[#292B23]/15 hover:border-[#BC4129]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#BC4129]">{item.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.riskScore >= 75
                          ? 'bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/30'
                          : 'bg-[#486789]/15 text-[#486789] border border-[#486789]/30'
                      }`}
                    >
                      Risk: {item.riskScore}%
                    </span>
                  </div>

                  <div className="mt-2 text-xs">
                    <div className="font-bold text-[#292B23]">{item.cardHolder}</div>
                    <div className="text-[#292B23]/70 flex justify-between mt-1">
                      <span>{item.merchant}</span>
                      <span className="font-mono font-bold text-[#292B23]">
                        ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Deep Dive Inspector (2 Cols) */}
        {selectedCase && (
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-7 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-6 flex flex-col justify-between">
            
            {/* Case Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#292B23]/15 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xl text-[#BC4129]">{selectedCase.id}</span>
                    <span className="px-3 py-1 rounded-full bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/30 text-xs font-extrabold uppercase">
                      {selectedCase.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#292B23]/70 mt-1 font-mono">
                    Flagged on {selectedCase.timestamp}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#292B23]/60 block uppercase font-bold tracking-wider">AI Risk Score</span>
                  <span className="text-2xl font-mono font-black text-[#BC4129]">
                    {selectedCase.riskScore}%
                  </span>
                </div>
              </div>

              {/* User & Transaction Profile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 space-y-2 text-xs">
                  <div className="text-[#292B23]/60 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#486789]" />
                    Cardholder Profile
                  </div>
                  <div className="text-sm font-bold text-[#292B23]">{selectedCase.cardHolder}</div>
                  <div className="text-[#292B23]/80 font-mono flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#292B23]/50" />
                    {selectedCase.cardNumber}
                  </div>
                  <div className="text-[#292B23]/70 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#292B23]/50" />
                    {selectedCase.location}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 space-y-2 text-xs">
                  <div className="text-[#292B23]/60 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#BC4129]" />
                    Transaction Telemetry
                  </div>
                  <div className="text-sm font-bold text-[#292B23]">{selectedCase.merchant}</div>
                  <div className="text-[#BC4129] font-semibold">{selectedCase.category}</div>
                  <div className="text-base font-mono font-bold text-[#292B23] pt-1">
                    ${selectedCase.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* AI Risk Reasoning Signals */}
              <div className="mt-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#292B23]">
                  Neural Model Risk Breakdown & Triggers
                </h4>
                <div className="space-y-2">
                  {selectedCase.aiReasoning && selectedCase.aiReasoning.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#BC4129]/10 border border-[#BC4129]/20 text-xs text-[#BC4129] flex items-center gap-2.5 font-medium"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#BC4129] shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analyst Action Buttons */}
            <div className="pt-4 border-t border-[#292B23]/15 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => handleCaseAction('APPROVED (Legitimate)')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#486789]/15 hover:bg-[#486789]/25 text-[#486789] border border-[#486789]/30 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Transaction
              </button>

              <button
                onClick={() => handleCaseAction('ESCALATED to Compliance')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#292B23]/10 hover:bg-[#292B23]/20 text-[#292B23] border border-[#292B23]/30 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Request 2FA / Escalate
              </button>

              <button
                onClick={() => handleCaseAction('BLOCKED & CARD SUSPENDED')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#BC4129] hover:bg-[#a53721] text-[#F0EDDF] text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border border-[#BC4129] cursor-pointer"
              >
                <ShieldX className="w-4 h-4" />
                Block & Freeze Card
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
