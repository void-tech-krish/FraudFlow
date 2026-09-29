import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Zap, Server } from 'lucide-react';

export default function Transactions() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const mockTransaction = {
    trans_date_trans_time: "2020-06-21 12:14:25",
    cc_num: 2291160000000000,
    merchant: "fraud_Kirlin and Sons",
    category: "personal_care",
    amt: 2.86,
    first: "Jeff",
    last: "Elliott",
    gender: "M",
    street: "351 Darlene Green",
    city: "Binghamton",
    state: "NY",
    zip: 13902,
    lat: 42.1009,
    long: -75.864,
    city_pop: 90240,
    job: "Mechanical engineer",
    dob: "1968-03-19",
    trans_num: "2da90c7d741462f4835848bb2203decc",
    unix_time: 1371816865,
    merch_lat: 41.5177,
    merch_long: -75.2917
  };

  const testPrediction = async (isFraudScenario = false) => {
    setLoading(true);
    // Tweak amounts or merchants to simulate fraud vs non-fraud
    const tx = { ...mockTransaction };
    if (isFraudScenario) {
      tx.amt = 1500.25; // Large amount often triggers fraud depending on model
      tx.category = "shopping_net";
      tx.merch_lat = 10.0; // Far away
    }

    try {
      const res = await axios.post('http://localhost:8000/predict', tx);
      setResult({ tx, res: res.data });
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Fraud Prediction</h1>
        <p className="text-slate-400">Test the real-time inference latency and accuracy.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white mb-4">Simulate Transaction</h2>
            <p className="text-sm text-slate-400 mb-6">Send a mock transaction payload to the FastAPI backend running the XGBoost champion model.</p>
            
            <div className="flex gap-4">
              <button 
                disabled={loading}
                onClick={() => testPrediction(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl font-medium transition-colors border border-slate-600 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <ShieldCheck size={18} className="text-emerald-400" />
                Normal Tx
              </button>
              <button 
                disabled={loading}
                onClick={() => testPrediction(true)}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 px-4 rounded-xl font-medium transition-colors border border-rose-500 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <ShieldAlert size={18} />
                Fraud Tx
              </button>
            </div>
          </div>
        </div>

        <div>
          {result && (
            <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${result.res.decision === 'decline' ? 'bg-rose-900/20 border-rose-500/30' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Inference Result</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${result.res.decision === 'decline' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {result.res.decision}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-700/50 pb-4">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Fraud Probability</p>
                    <p className="text-3xl font-light text-white">{(result.res.fraud_probability * 100).toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Latency</p>
                    <p className="text-xl font-light text-slate-300 flex items-center justify-end gap-1">
                      <Zap size={16} className="text-amber-400" />
                      {result.res.latency_ms.toFixed(1)} ms
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2 mt-4">Payload Snippet</p>
                  <pre className="bg-slate-900/80 p-4 rounded-xl text-xs text-slate-300 overflow-x-auto border border-slate-800">
                    {JSON.stringify({
                      amt: result.tx.amt,
                      category: result.tx.category,
                      merchant: result.tx.merchant
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
