import React, { useState } from 'react';
import { Cpu, Sliders, Zap, CheckCircle2, AlertOctagon, Info, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { featureImportanceData } from '../data/mockData';

export default function AIModelInsights() {
  // Simulator State
  const [simAmount, setSimAmount] = useState(2500);
  const [simVelocity, setSimVelocity] = useState(6);
  const [simDistance, setSimDistance] = useState(1200);
  const [simVpn, setSimVpn] = useState(true);
  const [simNewDevice, setSimNewDevice] = useState(false);

  // Dynamic Simulated Risk Score Calculation
  const calculateSimulatedRisk = () => {
    let score = 5;
    if (simAmount > 1000) score += Math.min(30, Math.floor(simAmount / 200));
    if (simVelocity > 3) score += (simVelocity - 3) * 7;
    if (simDistance > 100) score += Math.min(35, Math.floor(simDistance / 100));
    if (simVpn) score += 25;
    if (simNewDevice) score += 15;
    return Math.min(99, Math.max(1, score));
  };

  const calculatedRisk = calculateSimulatedRisk();
  const getSimRiskLevel = (score) => {
    if (score >= 75) return { label: 'CRITICAL FRAUD RISK', color: 'text-[#BC4129] bg-[#BC4129]/10 border-[#BC4129]/30' };
    if (score >= 45) return { label: 'SUSPICIOUS / ELEVATED RISK', color: 'text-[#BC4129] bg-[#BC4129]/10 border-[#BC4129]/30' };
    return { label: 'LOW RISK / LEGITIMATE', color: 'text-[#486789] bg-[#486789]/10 border-[#486789]/30' };
  };

  const simLevel = getSimRiskLevel(calculatedRisk);

  return (
    <div className="space-y-6">
      
      {/* Model Health Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-[#292B23]/15 bg-[#E2DFCE] relative overflow-hidden shadow-md">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#BC4129] animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#BC4129]">
                AI Neural Core Engine
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#292B23] mt-1">
              XGBoost + Transformer Ensemble Model
            </h2>
            <p className="text-xs text-[#292B23]/70 max-w-xl mt-1">
              Model trained on over 50M credit card transactions with real-time SHAP feature importance explainability and adaptive threshold optimization.
            </p>
          </div>

          {/* Model Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F0EDDF] p-3 rounded-xl border border-[#292B23]/15 text-center">
              <span className="text-[10px] text-[#292B23]/70 font-semibold block uppercase">AUC-ROC</span>
              <span className="text-lg font-bold text-[#486789] font-mono">0.984</span>
            </div>
            <div className="bg-[#F0EDDF] p-3 rounded-xl border border-[#292B23]/15 text-center">
              <span className="text-[10px] text-[#292B23]/70 font-semibold block uppercase">Precision</span>
              <span className="text-lg font-bold text-[#486789] font-mono">99.4%</span>
            </div>
            <div className="bg-[#F0EDDF] p-3 rounded-xl border border-[#292B23]/15 text-center">
              <span className="text-[10px] text-[#292B23]/70 font-semibold block uppercase">Recall Rate</span>
              <span className="text-lg font-bold text-[#BC4129] font-mono">96.8%</span>
            </div>
            <div className="bg-[#F0EDDF] p-3 rounded-xl border border-[#292B23]/15 text-center">
              <span className="text-[10px] text-[#292B23]/70 font-semibold block uppercase">Inference</span>
              <span className="text-lg font-bold text-[#292B23] font-mono">12 ms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SHAP Feature Importance */}
        <div className="glass-panel rounded-2xl p-6 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#292B23] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#BC4129]" />
              SHAP Feature Importance Breakdown
            </h3>
            <p className="text-xs text-[#292B23]/70">
              Primary factors contributing to the AI model's fraud probability decision.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {featureImportanceData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#292B23]">{item.feature}</span>
                  <span className="font-mono font-bold text-[#BC4129]">{item.importance}% Weight</span>
                </div>
                <div className="w-full bg-[#F0EDDF] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#292B23]/15">
                  <div
                    className="h-full rounded-full bg-[#BC4129] transition-all duration-500"
                    style={{ width: `${item.importance * 2.2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 text-xs text-[#292B23] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#486789] shrink-0 mt-0.5" />
            <p>
              Distance anomaly and 5-minute transaction velocity account for 64% of total risk classification weight in the current active model release.
            </p>
          </div>
        </div>

        {/* Interactive AI Risk Simulator */}
        <div className="glass-panel rounded-2xl p-6 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#292B23] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#BC4129]" />
                Interactive Risk Prediction Simulator
              </h3>
              <p className="text-xs text-[#292B23]/70">
                Adjust synthetic transaction parameters to test live AI score response.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#BC4129]/10 text-[#BC4129] border border-[#BC4129]/30 text-[10px] font-mono font-bold">
              SIMULATOR ACTIVE
            </span>
          </div>

          {/* Controls */}
          <div className="space-y-4 text-xs">
            
            {/* Slider 1: Amount */}
            <div>
              <div className="flex justify-between font-semibold text-[#292B23] mb-1">
                <span>Transaction Amount ($)</span>
                <span className="font-mono text-[#BC4129]">${simAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10"
                max="10000"
                step="50"
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full accent-[#BC4129] bg-[#F0EDDF] rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Slider 2: Velocity */}
            <div>
              <div className="flex justify-between font-semibold text-[#292B23] mb-1">
                <span>5-Min Transaction Velocity</span>
                <span className="font-mono text-[#486789]">{simVelocity} Purchases</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={simVelocity}
                onChange={(e) => setSimVelocity(Number(e.target.value))}
                className="w-full accent-[#486789] bg-[#F0EDDF] rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Slider 3: Distance */}
            <div>
              <div className="flex justify-between font-semibold text-[#292B23] mb-1">
                <span>Distance Mismatch (Miles)</span>
                <span className="font-mono text-[#BC4129]">{simDistance} miles</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={simDistance}
                onChange={(e) => setSimDistance(Number(e.target.value))}
                className="w-full accent-[#BC4129] bg-[#F0EDDF] rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 cursor-pointer">
                <span className="text-[#292B23]">Anonymous VPN / Proxy</span>
                <input
                  type="checkbox"
                  checked={simVpn}
                  onChange={(e) => setSimVpn(e.target.checked)}
                  className="accent-[#BC4129] w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 cursor-pointer">
                <span className="text-[#292B23]">Unrecognized Device</span>
                <input
                  type="checkbox"
                  checked={simNewDevice}
                  onChange={(e) => setSimNewDevice(e.target.checked)}
                  className="accent-[#BC4129] w-4 h-4 rounded"
                />
              </label>
            </div>

          </div>

          {/* Calculated Output Result */}
          <div className="p-4 rounded-xl bg-[#F0EDDF] border border-[#292B23]/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#292B23]/70 uppercase font-semibold block">Predicted AI Risk Output</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${simLevel.color}`}>
                {simLevel.label}
              </span>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold font-mono text-[#292B23] tracking-tight">
                {calculatedRisk}<span className="text-sm text-[#292B23]/70">/100</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
