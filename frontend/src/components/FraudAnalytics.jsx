import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { hourlyChartData, categoryRiskData } from '../data/mockData';
import { TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#486789', '#BC4129', '#C3C2AF', '#292B23'];

export default function FraudAnalytics() {
  const pieData = [
    { name: 'Low Risk (<20)', value: 78 },
    { name: 'Moderate (20-60)', value: 14 },
    { name: 'High Risk (60-80)', value: 5 },
    { name: 'Critical (>80)', value: 3 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Hourly Volume & Fraud Timeline Chart (2 Cols) */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#292B23] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#BC4129]" />
              Transaction Traffic & Fraud Detection Timeline
            </h3>
            <p className="text-xs text-[#292B23]/70">
              Comparing legitimate transaction volume against detected fraud events.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#486789]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#486789] inline-block" />
              Legitimate
            </span>
            <span className="flex items-center gap-1.5 text-[#BC4129]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#BC4129] inline-block" />
              Blocked Fraud
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#486789" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#486789" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BC4129" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#BC4129" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(41, 43, 35, 0.15)" />
              <XAxis dataKey="time" stroke="#292B23" tick={{ fontSize: 11 }} />
              <YAxis stroke="#292B23" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F0EDDF',
                  borderColor: 'rgba(41, 43, 35, 0.2)',
                  borderRadius: '12px',
                  color: '#292B23',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="legitimate" stroke="#486789" strokeWidth={2} fillOpacity={1} fill="url(#colorLegit)" name="Legitimate Count" />
              <Area type="monotone" dataKey="fraud" stroke="#BC4129" strokeWidth={2} fillOpacity={1} fill="url(#colorFraud)" name="Fraud Count" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution Pie Chart (1 Col) */}
      <div className="glass-panel rounded-2xl p-5 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#292B23] flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#BC4129]" />
            Risk Distribution
          </h3>
          <p className="text-xs text-[#292B23]/70">
            Categorization of current active traffic by risk tier.
          </p>
        </div>

        <div className="h-56 w-full my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F0EDDF',
                  borderColor: 'rgba(41, 43, 35, 0.2)',
                  borderRadius: '12px',
                  color: '#292B23',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#292B23]/15 text-[11px]">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
              <span className="text-[#292B23]/80 font-medium">{item.name}:</span>
              <span className="text-[#292B23] font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
