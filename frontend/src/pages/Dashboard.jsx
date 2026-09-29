import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  
  useEffect(() => {
    // We assume backend runs on localhost:8000
    const fetchData = async () => {
      try {
        const [healthRes, monRes] = await Promise.all([
          axios.get('http://localhost:8000/health').catch(() => ({ data: null })),
          axios.get('http://localhost:8000/monitoring').catch(() => ({ data: null }))
        ]);
        if(healthRes.data) setHealth(healthRes.data);
        if(monRes.data) setMonitoring(monRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = monitoring?.prediction_drift ? [
    { feature: 'KS p-value', driftScore: monitoring.prediction_drift.ks_pvalue },
    { feature: 'Ref Mean Prob', driftScore: monitoring.prediction_drift.ref_mean_prob * 100 },
    { feature: 'Cur Mean Prob', driftScore: monitoring.prediction_drift.cur_mean_prob * 100 }
  ] : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Monitor</h1>
        <p className="text-slate-400">Real-time status of the FraudFlow Champion Model.</p>
      </header>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Model Status</h3>
            <div className={`p-2 rounded-lg ${health?.model_loaded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {health?.model_loaded ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            </div>
          </div>
          <p className="text-2xl font-semibold text-white">
            {health?.model_loaded ? 'Online' : 'Offline'}
          </p>
          <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
            <Activity size={14} /> Champion XGBoost active
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Decision Threshold</h3>
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Server size={20} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-white">
            {health?.threshold || '0.11'}
          </p>
          <p className="text-sm text-slate-400 mt-2">Cost-optimized</p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">KS P-Value</h3>
            <div className={`p-2 rounded-lg ${(monitoring?.prediction_drift?.ks_pvalue || 1) < 0.05 ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Activity size={20} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-white">
            {monitoring?.prediction_drift?.ks_pvalue?.toFixed(4) || 'N/A'}
          </p>
          <p className="text-sm text-slate-400 mt-2">Data Drift Check</p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Retraining Needed?</h3>
            <div className={`p-2 rounded-lg ${monitoring?.alerts?.length > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-xl font-semibold text-white">
            {monitoring?.alerts?.length > 0 ? 'Alerts Triggered' : 'No Action'}
          </p>
          <button 
            className="mt-3 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-full transition-colors border border-rose-500/20 w-full"
            onClick={() => axios.post('http://localhost:8000/retrain/dry-run').then(r => alert('Dry run triggered! Check console.'))}
          >
            Trigger Retraining
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <Activity size={18} className="text-indigo-400" />
          Feature Drift Monitor
        </h3>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDrift" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="feature" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="driftScore" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorDrift)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Loading monitoring data... (ensure backend is running)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
