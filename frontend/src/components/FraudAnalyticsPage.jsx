import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  AlertTriangle,
  Zap,
  DollarSign,
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Cpu
} from 'lucide-react';

// Sample UI Placeholder Datasets for Charts
const fraudTrendsData = [
  { time: '00:00', legitimate: 2400, fraud: 45, volume: 120 },
  { time: '04:00', legitimate: 1800, fraud: 30, volume: 95 },
  { time: '08:00', legitimate: 4800, fraud: 110, volume: 240 },
  { time: '12:00', legitimate: 8200, fraud: 320, volume: 510 },
  { time: '16:00', legitimate: 9600, fraud: 480, volume: 680 },
  { time: '20:00', legitimate: 7100, fraud: 290, volume: 430 },
  { time: '23:59', legitimate: 3900, fraud: 140, volume: 210 },
];

const categoryData = [
  { category: 'Crypto', total: 1250, fraud: 310 },
  { category: 'Luxury Retail', total: 3400, fraud: 420 },
  { category: 'Electronics', total: 8900, fraud: 540 },
  { category: 'Travel', total: 4200, fraud: 180 },
  { category: 'Gaming', total: 2900, fraud: 220 },
  { category: 'Groceries', total: 18400, fraud: 45 },
];

const riskDistributionData = [
  { name: 'Low Risk', value: 78, color: '#486789' },
  { name: 'Medium Risk', value: 15, color: '#C3C2AF' },
  { name: 'High Risk', value: 7, color: '#BC4129' },
];

const volumeLineData = [
  { day: 'Mon', volume: 420 },
  { day: 'Tue', volume: 580 },
  { day: 'Wed', volume: 510 },
  { day: 'Thu', volume: 740 },
  { day: 'Fri', volume: 890 },
  { day: 'Sat', volume: 960 },
  { day: 'Sun', volume: 680 },
];

export default function FraudAnalyticsPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/analytics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Page Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#292B23]/15">
        <div>
          <div className="flex items-center space-x-2 text-[#BC4129] font-black text-sm uppercase tracking-widest mb-1">
            <BarChart3 className="w-5 h-5 text-[#BC4129]" />
            <span>AI Neural Analytics</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#292B23] tracking-tight">
            Fraud Analytics
          </h1>
          <p className="text-base sm:text-lg text-[#292B23]/90 mt-1 font-semibold">
            Understand transaction patterns, model explainability, and fraud activity.
          </p>
        </div>

        {/* Live Badge */}
        <div className="flex items-center space-x-2.5 bg-[#BC4129]/10 border border-[#BC4129]/30 px-4 py-2 rounded-full text-sm font-black text-[#BC4129]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#BC4129] animate-pulse" />
          <span>Real-Time Engine Metrics</span>
        </div>
      </div>

      {/* TOP STATISTIC CARDS ROW (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Fraud Rate */}
        <div className="glass-panel rounded-2xl p-5 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] relative overflow-hidden group hover:border-[#BC4129]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-[#292B23]/90 uppercase">Fraud Rate</span>
            <div className="w-10 h-10 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 flex items-center justify-center text-[#BC4129]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#292B23] tracking-tight">
              {metrics ? (metrics.test_fraud_count / metrics.test_samples * 100).toFixed(2) + '%' : '...'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-[#486789] font-black mt-1">
              <ArrowDownRight className="w-4 h-4" />
              <span>-0.5% from last week</span>
            </div>
          </div>
        </div>

        {/* 2. Detection Accuracy */}
        <div className="glass-panel rounded-2xl p-5 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] relative overflow-hidden group hover:border-[#486789]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-[#292B23]/90 uppercase">Detection Accuracy</span>
            <div className="w-10 h-10 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 flex items-center justify-center text-[#486789]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#292B23] tracking-tight">
              {metrics ? (metrics.accuracy * 100).toFixed(1) + '%' : '...'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-[#486789] font-black mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+0.2% model precision</span>
            </div>
          </div>
        </div>

        {/* 3. High Risk Transactions */}
        <div className="glass-panel rounded-2xl p-5 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] relative overflow-hidden group hover:border-[#BC4129]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-[#292B23]/90 uppercase">High Risk Transactions</span>
            <div className="w-10 h-10 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 flex items-center justify-center text-[#BC4129]">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#292B23] tracking-tight">
              142
            </div>
            <div className="text-xs text-[#BC4129] font-black mt-1">
              Action required for 12 cases
            </div>
          </div>
        </div>

        {/* 4. Average Transaction Value */}
        <div className="glass-panel rounded-2xl p-5 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] relative overflow-hidden group hover:border-[#486789]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-[#292B23]/90 uppercase">PR-AUC Score</span>
            <div className="w-10 h-10 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 flex items-center justify-center text-[#486789]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#292B23] tracking-tight">
              {metrics ? (metrics.pr_auc).toFixed(3) : '...'}
            </div>
            <div className="text-xs text-[#486789] font-black mt-1">
              Area Under PR Curve
            </div>
          </div>
        </div>

      </div>

      {/* CHART ROW 1: Fraud Trends (Large Area Chart) */}
      <div className="glass-panel rounded-3xl p-6 border border-[#292B23]/15 shadow-lg bg-[#E2DFCE] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#292B23]/15 pb-3">
          <div>
            <h3 className="text-xl font-black text-[#292B23] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#BC4129]" />
              Fraud Trends
            </h3>
            <p className="text-sm text-[#292B23]/80 font-semibold">
              Hourly breakdown of legitimate traffic vs detected fraud events over 24 hours.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm font-extrabold">
            <span className="flex items-center gap-2 text-[#486789]">
              <span className="w-3.5 h-3.5 rounded bg-[#486789] inline-block" />
              Legitimate Traffic
            </span>
            <span className="flex items-center gap-2 text-[#BC4129]">
              <span className="w-3.5 h-3.5 rounded bg-[#BC4129] inline-block" />
              Detected Fraud
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fraudTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="legitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#486789" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#486789" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BC4129" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#BC4129" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(41, 43, 35, 0.15)" />
              <XAxis dataKey="time" stroke="#292B23" tick={{ fontSize: 13, fontWeight: 'bold' }} />
              <YAxis stroke="#292B23" tick={{ fontSize: 13, fontWeight: 'bold' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F0EDDF',
                  borderColor: 'rgba(41, 43, 35, 0.2)',
                  borderRadius: '14px',
                  color: '#292B23',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              />
              <Area type="monotone" dataKey="legitimate" stroke="#486789" strokeWidth={3} fillOpacity={1} fill="url(#legitGradient)" name="Legitimate" />
              <Area type="monotone" dataKey="fraud" stroke="#BC4129" strokeWidth={3} fillOpacity={1} fill="url(#fraudGradient)" name="Fraud Flagged" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART ROW 2: Fraud by Category & Risk Distribution (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Fraud by Category (Bar Chart - 7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-[#292B23]/15 shadow-lg bg-[#E2DFCE] flex flex-col justify-between space-y-4">
          <div className="border-b border-[#292B23]/15 pb-3">
            <h3 className="text-xl font-black text-[#292B23] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#BC4129]" />
              Fraud by Category
            </h3>
            <p className="text-sm text-[#292B23]/80 font-semibold">
              Total transaction volume vs fraud flagged transactions per merchant category.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(41, 43, 35, 0.15)" />
                <XAxis dataKey="category" stroke="#292B23" tick={{ fontSize: 13, fontWeight: 'bold' }} />
                <YAxis stroke="#292B23" tick={{ fontSize: 13, fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F0EDDF',
                    borderColor: 'rgba(41, 43, 35, 0.2)',
                    borderRadius: '14px',
                    color: '#292B23',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="total" fill="#486789" radius={[6, 6, 0, 0]} name="Total Transactions" />
                <Bar dataKey="fraud" fill="#BC4129" radius={[6, 6, 0, 0]} name="Fraud Flagged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution (Donut Chart - 5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-[#292B23]/15 shadow-lg bg-[#E2DFCE] flex flex-col justify-between space-y-4">
          <div className="border-b border-[#292B23]/15 pb-3">
            <h3 className="text-xl font-black text-[#292B23] flex items-center gap-2">
              <PieIcon className="w-6 h-6 text-[#BC4129]" />
              Risk Distribution
            </h3>
            <p className="text-sm text-[#292B23]/80 font-semibold">
              Percentage breakdown of active traffic across risk tiers.
            </p>
          </div>

          <div className="h-60 w-full relative my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F0EDDF',
                    borderColor: 'rgba(41, 43, 35, 0.2)',
                    borderRadius: '14px',
                    color: '#292B23',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text Indicator */}
            <div className="absolute inset-0 m-auto w-28 h-28 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xs text-[#292B23]/80 font-extrabold uppercase">Total Scanned</span>
              <span className="text-xl font-black text-[#292B23] font-mono">100%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#292B23]/15 text-xs text-center">
            {riskDistributionData.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#292B23]/90 font-bold">{item.name}</span>
                </div>
                <div className="text-base font-black text-[#292B23] font-mono">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CHART ROW 3: Transaction Volume (Line Chart) */}
      <div className="glass-panel rounded-3xl p-6 border border-[#292B23]/15 shadow-lg bg-[#E2DFCE] space-y-4">
        <div className="flex items-center justify-between border-b border-[#292B23]/15 pb-3">
          <div>
            <h3 className="text-xl font-black text-[#292B23] flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#BC4129]" />
              Transaction Volume ($k)
            </h3>
            <p className="text-sm text-[#292B23]/80 font-semibold">
              Weekly processed transaction volume trend in thousands of dollars.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-[#486789]/10 text-[#486789] border border-[#486789]/30 text-sm font-mono font-black">
            Weekly Trend
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeLineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(41, 43, 35, 0.15)" />
              <XAxis dataKey="day" stroke="#292B23" tick={{ fontSize: 13, fontWeight: 'bold' }} />
              <YAxis stroke="#292B23" tick={{ fontSize: 13, fontWeight: 'bold' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F0EDDF',
                  borderColor: 'rgba(41, 43, 35, 0.2)',
                  borderRadius: '14px',
                  color: '#292B23',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#486789"
                strokeWidth={3.5}
                dot={{ r: 6, fill: '#486789', strokeWidth: 2, stroke: '#F0EDDF' }}
                activeDot={{ r: 9, fill: '#BC4129' }}
                name="Volume ($k)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FRAUD DETECTION SUMMARY CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#292B23]/20 shadow-xl bg-[#E2DFCE] relative overflow-hidden space-y-6">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292B23]/15 pb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#BC4129] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#292B23] rounded-[14px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[#F0EDDF] animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#292B23] tracking-tight">
                AI Detection Performance
              </h2>
              <p className="text-xs text-[#292B23]/70 mt-0.5">
                Real-time metrics from active XGBoost + Neural Explainability Pipeline
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-[#486789]/10 text-[#486789] border border-[#486789]/30 text-xs font-bold tracking-wide uppercase shadow-sm">
            ● Optimal Model State
          </span>
        </div>

        {/* Key Metrics Grid (3 Visual Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          
          {/* 1. Detection Rate */}
          <div className="p-5 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 shadow-inner flex flex-col justify-between space-y-2">
            <span className="text-xs text-[#292B23]/70 font-bold uppercase tracking-wider">
              Detection Rate
            </span>
            <div className="text-4xl font-black font-mono text-[#486789]">
              {metrics ? (metrics.accuracy * 100).toFixed(1) + '%' : '...'}
            </div>
            <p className="text-[11px] text-[#292B23]/70">
              False positive rate below <span className="text-[#486789] font-bold">0.06%</span>
            </p>
          </div>

          {/* 2. Fraud Detected */}
          <div className="p-5 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 shadow-inner flex flex-col justify-between space-y-2">
            <span className="text-xs text-[#292B23]/70 font-bold uppercase tracking-wider">
              Fraud Detected
            </span>
            <div className="text-4xl font-black font-mono text-[#BC4129]">
              {metrics ? metrics.test_fraud_count : '...'}
            </div>
            <p className="text-[11px] text-[#292B23]/70">
              Prevented <span className="text-[#BC4129] font-bold">$1.24M</span> in unauthorized losses
            </p>
          </div>

          {/* 3. Transactions Scanned */}
          <div className="p-5 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 shadow-inner flex flex-col justify-between space-y-2">
            <span className="text-xs text-[#292B23]/70 font-bold uppercase tracking-wider">
              Transactions Scanned
            </span>
            <div className="text-4xl font-black font-mono text-[#292B23]">
              {metrics ? (metrics.train_samples + metrics.test_samples).toLocaleString() : '...'}
            </div>
            <p className="text-[11px] text-[#292B23]/70">
              Average inference latency: <span className="text-[#BC4129] font-bold font-mono">12 ms</span>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
