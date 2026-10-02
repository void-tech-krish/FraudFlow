import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Activity,
  ArrowUpRight,
  Info
} from 'lucide-react';

/**
 * PredictionResult Component
 * Reusable prediction result card with two visual states (SAFE STATE & FRAUD STATE)
 * 
 * Props:
 * - resultState: 'idle' | 'safe' | 'fraud' | 'loading'
 * - data: Optional object containing ML prediction data (e.g. { riskScore, status, summary, warningMessage })
 * - onReset: Function callback to reset state back to idle
 * - onToggleState: Function callback to switch demo states
 */
export default function PredictionResult({
  resultState = 'idle',
  data = null,
  onReset,
  onToggleState
}) {

  // Default values for Safe State
  const safeData = {
    riskScore: data?.riskScore ?? 4.2,
    statusText: 'LEGITIMATE TRANSACTION',
    riskLabel: 'LOW RISK',
    amount: data?.amount ? `$${parseFloat(data.amount).toFixed(2)}` : '$250.00',
    merchant: data?.merchant || 'Apple Store',
    category: data?.category || 'Electronics & Tech',
    customer: data?.customer || 'Anil',
    location: data?.location || 'New York, USA',
    timestamp: data?.date && data?.time ? `${data.date} at ${data.time}` : 'Today, 14:30',
    summaryText: 'Transaction matches normal behavioral baseline & verified merchant signatures.'
  };

  // Default values for Fraud State
  const fraudData = {
    riskScore: data?.riskScore ?? 97.4,
    statusText: 'FRAUD DETECTED',
    riskLabel: 'HIGH RISK',
    warningMessage: data?.warningMessage || 'This transaction requires additional verification.',
    amount: data?.amount ? `$${parseFloat(data.amount).toFixed(2)}` : '$3,450.00',
    merchant: data?.merchant || 'Global Crypto Exchange',
    category: data?.category || 'Crypto Exchange',
    customer: data?.customer || 'Anil',
    location: data?.location || 'Lagos, Nigeria (Proxy IP)',
    timestamp: data?.date && data?.time ? `${data.date} at ${data.time}` : 'Today, 03:14',
    summaryText: 'Rapid location velocity anomaly and unrecognized device signature detected.'
  };

  const isSafe = resultState === 'safe';
  const isFraud = resultState === 'fraud';
  const isLoading = resultState === 'loading';
  const isIdle = resultState === 'idle';

  return (
    <div
      className={`glass-panel rounded-3xl p-6 sm:p-8 border shadow-md relative overflow-hidden backdrop-blur-xl flex flex-col justify-between min-h-[560px] transition-all duration-500 ease-in-out bg-[#E2DFCE] ${
        isSafe
          ? 'border-[#486789]/40'
          : isFraud
          ? 'border-[#BC4129]/40'
          : 'border-[#292B23]/15'
      }`}
    >
      {/* Background Ambient Glow Effects */}
      {isSafe && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#486789]/10 rounded-full blur-3xl pointer-events-none transition-all duration-700" />
      )}
      {isFraud && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BC4129]/10 rounded-full blur-3xl pointer-events-none transition-all duration-700" />
      )}

      {/* Top Header & Demo State Switchers */}
      <div className="flex items-center justify-between border-b border-[#292B23]/15 pb-4 relative z-10">
        <div className="flex items-center space-x-2">
          {isSafe && <ShieldCheck className="w-6 h-6 text-[#486789]" />}
          {isFraud && <ShieldAlert className="w-6 h-6 text-[#BC4129] animate-pulse" />}
          {isIdle && <Sparkles className="w-6 h-6 text-[#BC4129]" />}
          <h2 className="text-xl font-black text-[#292B23] tracking-tight">
            Prediction Result
          </h2>
        </div>

        {/* Demo State Toggle Buttons */}
        <div className="flex items-center space-x-1.5 bg-[#F0EDDF] p-1 rounded-xl border border-[#292B23]/20 text-xs font-bold">
          <button
            onClick={() => onToggleState && onToggleState('safe')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isSafe
                ? 'bg-[#486789] text-[#F0EDDF] font-black shadow-sm'
                : 'text-[#292B23]/70 hover:text-[#292B23] hover:bg-[#E2DFCE]'
            }`}
            title="Preview Safe State"
          >
            Safe State
          </button>
          <button
            onClick={() => onToggleState && onToggleState('fraud')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isFraud
                ? 'bg-[#BC4129] text-[#F0EDDF] font-black shadow-sm'
                : 'text-[#292B23]/70 hover:text-[#292B23] hover:bg-[#E2DFCE]'
            }`}
            title="Preview Fraud State"
          >
            Fraud State
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. IDLE STATE — Waiting for transaction */}
      {/* ---------------------------------------------------- */}
      {isIdle && (
        <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300 relative z-10">
          <div className="relative group cursor-default">
            <div className="w-24 h-24 rounded-3xl bg-[#F0EDDF] border border-[#292B23]/20 flex items-center justify-center text-5xl relative z-10 shadow-inner">
              🔮
            </div>
          </div>

          <div className="space-y-2 max-w-xs">
            <h3 className="text-2xl font-black text-[#292B23] tracking-tight">
              Waiting for transaction
            </h3>
            <p className="text-sm text-[#292B23]/80 font-semibold leading-relaxed">
              Enter transaction details and click <span className="text-[#BC4129] font-black">"Check Transaction"</span>.
            </p>
          </div>

          {/* Quick Demo Preview Helpers */}
          <div className="pt-3 flex items-center gap-2">
            <span className="text-xs text-[#292B23]/70 uppercase font-bold">Try UI States:</span>
            <button
              onClick={() => onToggleState && onToggleState('safe')}
              className="px-3 py-1.5 rounded-lg bg-[#486789]/15 text-[#486789] border border-[#486789]/30 text-xs font-black hover:bg-[#486789]/25 transition-all cursor-pointer"
            >
              Test Safe (4.2%)
            </button>
            <button
              onClick={() => onToggleState && onToggleState('fraud')}
              className="px-3 py-1.5 rounded-lg bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/30 text-xs font-black hover:bg-[#BC4129]/25 transition-all cursor-pointer"
            >
              Test Fraud (97.4%)
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LOADING STATE */}
      {/* ---------------------------------------------------- */}
      {isLoading && (
        <div className="my-auto py-16 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300 relative z-10">
          <div className="w-16 h-16 rounded-full border-4 border-[#292B23]/20 border-t-[#BC4129] animate-spin" />
          <h3 className="text-xl font-black text-[#292B23]">Analyzing Transaction Risk...</h3>
          <p className="text-sm text-[#292B23]/80 font-semibold">Evaluating fraud probability & anomaly vectors</p>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. SAFE STATE — LEGITIMATE TRANSACTION */}
      {/* ---------------------------------------------------- */}
      {isSafe && (
        <div className="my-auto space-y-5 animate-in fade-in zoom-in-95 duration-500 relative z-10">
          
          {/* Large Circular Icon & Status Text */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#F0EDDF] border-2 border-[#486789] flex items-center justify-center shadow-inner relative z-10 text-[#486789] text-4xl font-extrabold">
                ✓
              </div>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#486789] tracking-tight">
                {safeData.statusText}
              </h3>
              <p className="text-sm text-[#292B23]/80 mt-0.5 font-bold">
                AI Confidence: <span className="text-[#486789] font-black font-mono">99.8%</span>
              </p>
            </div>
          </div>

          {/* Risk Score Box & Indicator Bar */}
          <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/20 shadow-inner space-y-3">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#292B23]/70 uppercase font-bold tracking-wider block">
                  Risk Score
                </span>
                <div className="text-4xl font-black font-mono text-[#486789] tracking-tight">
                  {safeData.riskScore}%
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-[#486789]/15 text-[#486789] border border-[#486789]/30 text-xs font-black tracking-wider">
                {safeData.riskLabel}
              </span>
            </div>

            {/* Progress / Risk Indicator Bar */}
            <div className="space-y-1">
              <div className="w-full h-3 bg-[#E2DFCE] rounded-full border border-[#292B23]/20 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#486789] transition-all duration-1000 ease-out"
                  style={{ width: `${safeData.riskScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#292B23]/60 font-mono">
                <span>0% (Safe)</span>
                <span>100% (Fraud)</span>
              </div>
            </div>

          </div>

          {/* Transaction Summary Card */}
          <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 space-y-2.5">
            <span className="text-[10px] text-[#292B23]/60 uppercase font-bold tracking-wider block border-b border-[#292B23]/15 pb-1.5">
              Transaction Summary
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#292B23]/60 block text-[10px]">Amount</span>
                <span className="font-bold text-[#292B23] font-mono">{safeData.amount}</span>
              </div>
              <div>
                <span className="text-[#292B23]/60 block text-[10px]">Merchant</span>
                <span className="font-semibold text-[#292B23] truncate block">{safeData.merchant}</span>
              </div>
              <div>
                <span className="text-[#292B23]/60 block text-[10px]">Customer</span>
                <span className="font-semibold text-[#292B23]">{safeData.customer}</span>
              </div>
              <div>
                <span className="text-[#292B23]/60 block text-[10px]">Location</span>
                <span className="font-semibold text-[#292B23] truncate block">{safeData.location}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#486789] pt-1 border-t border-[#292B23]/10 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#486789] shrink-0" />
              <span>{safeData.summaryText}</span>
            </p>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. FRAUD STATE — FRAUD DETECTED */}
      {/* ---------------------------------------------------- */}
      {isFraud && (
        <div className="my-auto space-y-5 animate-in fade-in zoom-in-95 duration-500 relative z-10">
          
          {/* Large Red Warning Icon & Status Text */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#F0EDDF] border-2 border-[#BC4129] flex items-center justify-center shadow-inner relative z-10 text-[#BC4129] text-4xl font-extrabold animate-bounce">
                ⚠
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#BC4129] tracking-tight">
                {fraudData.statusText}
              </h3>
              <p className="text-xs text-[#BC4129] mt-0.5 font-bold">
                Critical Threat Anomaly Triggered
              </p>
            </div>
          </div>

          {/* Risk Score Box & Progress Indicator Bar */}
          <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#BC4129]/30 shadow-inner space-y-3">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#292B23]/60 uppercase font-bold tracking-wider block">
                  Risk Score
                </span>
                <div className="text-3xl font-black font-mono text-[#BC4129] tracking-tight">
                  {fraudData.riskScore}%
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/30 text-xs font-black tracking-wider animate-pulse">
                {fraudData.riskLabel}
              </span>
            </div>

            {/* Red Progress / Risk Indicator Bar */}
            <div className="space-y-1">
              <div className="w-full h-3 bg-[#E2DFCE] rounded-full border border-[#292B23]/20 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#BC4129] transition-all duration-1000 ease-out"
                  style={{ width: `${fraudData.riskScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#292B23]/60 font-mono">
                <span>0% (Safe)</span>
                <span className="text-[#BC4129] font-bold">100% (Critical)</span>
              </div>
            </div>

          </div>

          {/* Warning Message Box */}
          <div className="p-4 rounded-2xl bg-[#BC4129]/10 border border-[#BC4129]/30 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#BC4129] shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-xs font-extrabold text-[#BC4129]">
                {fraudData.warningMessage}
              </p>
              <p className="text-[11px] text-[#292B23]/80 mt-1">
                Automated freeze policy applied. Immediate supervisor review recommended.
              </p>
            </div>
          </div>

          {/* Transaction Summary Card */}
          <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 space-y-2">
            <span className="text-[10px] text-[#292B23]/60 uppercase font-bold tracking-wider block border-b border-[#292B23]/15 pb-1.5">
              Transaction Summary
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#292B23]/60 block text-[10px]">Amount</span>
                <span className="font-bold text-[#BC4129] font-mono">{fraudData.amount}</span>
              </div>
              <div>
                <span className="text-[#292B23]/60 block text-[10px]">Merchant</span>
                <span className="font-semibold text-[#292B23] truncate block">{fraudData.merchant}</span>
              </div>
              <div>
                <span className="text-[#292B23]/60 block text-[10px]">Customer</span>
                <span className="font-semibold text-[#292B23]">{fraudData.customer}</span>
              </div>
              <div>
                <span className="text-[#292B23]/60 block text-[10px]">Location</span>
                <span className="font-semibold text-[#BC4129] truncate block">{fraudData.location}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Footer Controls: Reset & System Metadata */}
      <div className="pt-4 border-t border-[#292B23]/15 flex items-center justify-between relative z-10 text-[11px] text-[#292B23]/70">
        {!isIdle ? (
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 text-xs text-[#BC4129] hover:underline font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Assessment</span>
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-[#292B23]/60">
            <Info className="w-3.5 h-3.5 text-[#BC4129]" />
            UI Modular Component
          </span>
        )}

        <span className="font-mono font-bold text-[#486789]">FraudFlow ML v2.4</span>
      </div>

    </div>
  );
}
