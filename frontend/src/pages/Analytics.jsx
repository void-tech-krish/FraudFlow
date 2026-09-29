import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, BarChart2, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/analytics')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  const metricsData = data ? [
    { name: 'PR-AUC', value: data.pr_auc * 100 },
    { name: 'ROC-AUC', value: data.roc_auc * 100 },
    { name: 'F1 Score', value: data.f1 * 100 },
    { name: 'Precision', value: data.precision * 100 },
    { name: 'Recall', value: data.recall * 100 }
  ] : [];

  const cmData = data ? [
    { name: 'True Positive (Fraud Caught)', value: data.tp },
    { name: 'False Negative (Fraud Missed)', value: data.fn },
    { name: 'False Positive (False Alarm)', value: data.fp }
  ] : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Model Analytics</h1>
        <p className="text-slate-400">Offline metrics from the model evaluation phase.</p>
      </header>
      {data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h3 className="text-slate-400 font-medium">PR-AUC</h3>
              <p className="text-2xl font-semibold text-white">{(data.pr_auc * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h3 className="text-slate-400 font-medium">ROC-AUC</h3>
              <p className="text-2xl font-semibold text-white">{(data.roc_auc * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h3 className="text-slate-400 font-medium">F1 Score</h3>
              <p className="text-2xl font-semibold text-white">{(data.f1 * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h3 className="text-slate-400 font-medium">Precision / Recall</h3>
              <p className="text-2xl font-semibold text-white">
                {(data.precision * 100).toFixed(1)}% / {(data.recall * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <BarChart2 size={18} className="text-blue-400" />
                Performance Metrics (%)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip 
                      cursor={{fill: '#334155', opacity: 0.4}}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {metricsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Activity size={18} className="text-rose-400" />
                Fraud Detection Results (Confusion Matrix)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cmData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 11}} width={140} />
                    <Tooltip 
                      cursor={{fill: '#334155', opacity: 0.4}}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {cmData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444', '#f59e0b'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-64 items-center justify-center text-slate-500">
          Loading analytics... (ensure backend is running)
        </div>
      )}
    </div>
  );
}
