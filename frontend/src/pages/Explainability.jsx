import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Network, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Explainability() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/explainability')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  const chartData = data?.global_importance_top_10 ? data.global_importance_top_10
    .slice(0, 15)
    .map((item) => ({
      name: item.feature.replace('category_', '').replace('job_', '').substring(0, 15),
      value: item.mean_abs_shap
    })) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Model Explainability</h1>
        <p className="text-slate-400">SHAP-based global feature importance for the XGBoost champion model.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
            <Network size={18} className="text-blue-400" />
            Top 15 Global Features
          </h3>
          <div className="h-[400px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} width={100} />
                  <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#ef4444' : index < 8 ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Loading SHAP values...
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-medium text-white mb-4">Key Drivers</h3>
            <p className="text-sm text-slate-400 mb-6">These factors contribute most significantly to fraud predictions in the current champion model.</p>
            
            <div className="space-y-4">
              {chartData.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'}`}>
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <ArrowUp size={14} className="text-rose-400" />
                    {(item.value * 100).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
