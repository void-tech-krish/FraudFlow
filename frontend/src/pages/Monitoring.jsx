import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Monitoring() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/monitoring')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Model Monitoring</h1>
        <p className="text-slate-400">Drift metrics, KS tests, and alerts.</p>
      </header>
      
      {data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-400" />
                Latest Audit
              </h3>
              <p className="text-sm text-slate-300">
                {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
                <Activity size={18} className="text-indigo-400" />
                Prediction Drift (KS p-value)
              </h3>
              <p className="text-2xl font-semibold text-white">
                {data.prediction_drift?.ks_pvalue ? data.prediction_drift.ks_pvalue.toFixed(4) : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-400" />
                Performance PR-AUC
              </h3>
              <p className="text-2xl font-semibold text-white">
                {data.performance?.pr_auc ? (data.performance.pr_auc * 100).toFixed(2) + '%' : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg mt-6">
             <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
               <AlertTriangle size={18} className="text-amber-400" />
               Alerts
             </h3>
             {data.alerts && data.alerts.length > 0 ? (
               <div className="space-y-4">
                 {data.alerts.map((alert, idx) => (
                   <div key={idx} className={`p-4 rounded-xl border flex justify-between items-center ${alert.severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                     <div>
                       <p className={`font-bold ${alert.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                         {alert.category} - {alert.rule}
                       </p>
                       <p className="text-sm text-slate-300">Observed: {alert.observed_value.toFixed(4)} | Threshold: {alert.configured_threshold.toFixed(4)}</p>
                     </div>
                     <span className={`px-2 py-1 text-xs font-bold rounded ${alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                       {alert.severity}
                     </span>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-slate-300">No active alerts.</p>
             )}
          </div>
        </div>
      ) : (
        <p className="text-slate-400">Loading monitoring data...</p>
      )}
    </div>
  );
}
