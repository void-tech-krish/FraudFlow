import React from 'react';

/**
 * Reusable Skeleton Loaders for FraudFlow
 * Cards, Tables, Charts, Prediction Result
 */

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-[#292B23]/15 bg-[#E2DFCE] space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 bg-[#C3C2AF] rounded w-24" />
        <div className="w-8 h-8 rounded-xl bg-[#C3C2AF]" />
      </div>
      <div className="h-7 bg-[#C3C2AF] rounded w-32" />
      <div className="h-3 bg-[#C3C2AF]/60 rounded w-20" />
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass-panel rounded-3xl border border-[#292B23]/15 bg-[#E2DFCE] overflow-hidden p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-[#C3C2AF] rounded w-48 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-3 border-b border-[#292B23]/15">
            <div className="h-4 bg-[#C3C2AF] rounded w-24" />
            <div className="h-4 bg-[#C3C2AF] rounded w-32" />
            <div className="h-4 bg-[#C3C2AF] rounded w-20" />
            <div className="h-4 bg-[#C3C2AF] rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-[#292B23]/15 bg-[#E2DFCE] space-y-4 animate-pulse">
      <div className="flex items-center justify-between border-b border-[#292B23]/15 pb-3">
        <div className="h-5 bg-[#C3C2AF] rounded w-40" />
        <div className="h-4 bg-[#C3C2AF] rounded w-20" />
      </div>
      <div className="h-60 bg-[#F0EDDF] rounded-2xl flex items-end justify-between p-4 gap-2 border border-[#292B23]/10">
        <div className="h-1/3 bg-[#C3C2AF] rounded w-full" />
        <div className="h-2/3 bg-[#C3C2AF] rounded w-full" />
        <div className="h-1/2 bg-[#C3C2AF] rounded w-full" />
        <div className="h-4/5 bg-[#C3C2AF] rounded w-full" />
        <div className="h-2/5 bg-[#C3C2AF] rounded w-full" />
      </div>
    </div>
  );
}

// Prediction Result Skeleton
export function PredictionSkeleton() {
  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#292B23]/15 bg-[#E2DFCE] space-y-6 animate-pulse min-h-[540px] flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#292B23]/15 pb-4">
        <div className="h-5 bg-[#C3C2AF] rounded w-36" />
        <div className="h-4 bg-[#C3C2AF] rounded w-16" />
      </div>
      <div className="my-auto space-y-4 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-[#C3C2AF]" />
        <div className="h-6 bg-[#C3C2AF] rounded w-48" />
        <div className="h-12 bg-[#C3C2AF] rounded-2xl w-full max-w-xs" />
      </div>
      <div className="h-4 bg-[#C3C2AF] rounded w-32 border-t border-[#292B23]/15 pt-3" />
    </div>
  );
}
