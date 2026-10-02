import React from 'react';
import { DollarSign, ShieldAlert, Cpu, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KPICards({ stats }) {
  const cards = [
    {
      title: "Total Volume Scanned",
      value: `$${stats.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.totalCount.toLocaleString()} Transactions Today`,
      change: "+14.2%",
      isPositive: true,
      icon: DollarSign,
      glowColor: "bg-[#E2DFCE]",
      borderColor: "border-[#292B23]/15 hover:border-[#BC4129]/40",
      iconBg: "bg-[#F0EDDF] text-[#BC4129] border-[#292B23]/15",
    },
    {
      title: "Fraud Prevention Value",
      value: `$${stats.fraudBlockedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.fraudCount} Threat Transactions Blocked`,
      change: "99.2% Blocked",
      isPositive: true,
      icon: ShieldAlert,
      glowColor: "bg-[#E2DFCE]",
      borderColor: "border-[#292B23]/15 hover:border-[#BC4129]/40",
      iconBg: "bg-[#F0EDDF] text-[#BC4129] border-[#292B23]/15",
    },
    {
      title: "AI Precision & Accuracy",
      value: "99.4%",
      subtitle: "XGBoost + Neural Ensemble",
      change: "0.02% FP Rate",
      isPositive: true,
      icon: Cpu,
      glowColor: "bg-[#E2DFCE]",
      borderColor: "border-[#292B23]/15 hover:border-[#486789]/40",
      iconBg: "bg-[#F0EDDF] text-[#486789] border-[#292B23]/15",
    },
    {
      title: "Active Security Alerts",
      value: stats.criticalAlerts.toString(),
      subtitle: "Requires Analyst Action",
      change: "2 Critical",
      isPositive: false,
      icon: AlertTriangle,
      glowColor: "bg-[#E2DFCE]",
      borderColor: "border-[#292B23]/15 hover:border-[#BC4129]/40",
      iconBg: "bg-[#F0EDDF] text-[#BC4129] border-[#292B23]/15",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-panel rounded-2xl p-5 border relative overflow-hidden ${card.glowColor} ${card.borderColor} shadow-md hover:shadow-lg hover:scale-[1.015] transition-all duration-300 group cursor-default`}
          >
            {/* Ambient Accent Glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#BC4129]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#BC4129]/10 transition-all duration-300" />

            {/* Top Row: Title & Icon Badge */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs sm:text-sm font-black text-[#292B23]/90 uppercase tracking-wider leading-snug">
                {card.title}
              </p>

              <div className={`p-2.5 rounded-xl border ${card.iconBg} shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Middle Row: Large Metric Value */}
            <div className="mt-3 mb-1">
              <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black font-mono text-[#292B23] tracking-tight group-hover:text-[#BC4129] transition-colors leading-none">
                {card.value}
              </h3>
            </div>

            {/* Bottom Row: Subtitle & Trend Change Tag */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-1.5 pt-3 border-t border-[#292B23]/15">
              <span className="text-xs sm:text-sm text-[#292B23] font-bold leading-tight">
                {card.subtitle}
              </span>

              <span
                className={`flex items-center text-xs sm:text-sm font-black shrink-0 ${
                  card.isPositive ? 'text-[#486789]' : 'text-[#BC4129]'
                }`}
              >
                {card.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-0.5" />
                )}
                {card.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
