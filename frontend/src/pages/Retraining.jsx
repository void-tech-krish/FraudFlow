import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCw, Play, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Retraining() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runDryRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:8000/retrain/dry-run');
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Model Retraining</h1>
        <p className="text-slate-400">Evaluate candidates and dry-run promotion pipeline.</p>
      </header>

      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Retraining Dry Run</h3>
            <p className="text-sm text-slate-400">
              Trigger a test run of the retraining script. It will train a candidate model, compare it against the champion, and log the results without automatic promotion to production.
            </p>
          </div>
          <button 
            onClick={runDryRun}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} />}
            {loading ? 'Running...' : 'Run Dry-Run'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 mb-8">
          <AlertTriangle className="text-rose-400 mt-1" size={20} />
          <div>
            <h4 className="text-rose-400 font-bold">Error executing retraining</h4>
            <p className="text-rose-300/80 text-sm">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Dry Run Result</h3>
            <div className="flex items-center gap-2 mb-4">
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${result.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                 Status: {result.status}
               </span>
            </div>
            
            {result.latest_audit && result.latest_audit.timestamp && (
              <div className="mb-4 bg-slate-900/50 p-4 rounded-xl">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  Audit Log Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Action:</span> 
                    <span className="text-slate-200 ml-2">{result.latest_audit.action}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span> 
                    <span className="text-slate-200 ml-2">{result.latest_audit.status}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Details:</span> 
                    <span className="text-slate-200 ml-2">{result.latest_audit.details}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Script Output</h4>
              <pre className="bg-slate-900/80 p-4 rounded-xl text-xs text-slate-300 overflow-x-auto border border-slate-800 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {result.output}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
