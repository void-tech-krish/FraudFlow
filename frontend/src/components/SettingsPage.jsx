import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Layout,
  Sparkles,
  Bell,
  AlertTriangle,
  Cpu,
  Server,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Shield,
  Radio,
  Zap,
  Check,
  RefreshCw,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  // Appearance State
  const [appearance, setAppearance] = useState({
    darkMode: true,
    compactMode: false,
    animations: true
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    fraudAlerts: true,
    highRiskAlerts: true,
    systemNotifications: true
  });

  // Save Toast State
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Retraining State
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState(null);

  const handleRetrainDryRun = async () => {
    setIsRetraining(true);
    setRetrainResult(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/retrain/dry-run`, {
        method: 'POST',
      });
      const data = await response.json();
      setRetrainResult(data);
    } catch (err) {
      console.error(err);
      setRetrainResult({ status: 'error', detail: err.message });
    } finally {
      setIsRetraining(false);
    }
  };

  const toggleAppearance = (key) => {
    setAppearance((prev) => ({ ...prev, [key]: !prev[key] }));
    triggerSavedNotice();
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    triggerSavedNotice();
  };

  const triggerSavedNotice = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#292B23]/15">
        <div>
          <div className="flex items-center space-x-2 text-[#BC4129] font-bold text-xs uppercase tracking-widest mb-1">
            <SettingsIcon className="w-4 h-4 text-[#BC4129]" />
            <span>Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292B23] tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#292B23]/70 mt-1">
            Manage your FraudFlow dashboard preferences.
          </p>
        </div>

        {/* Save Notice Pill */}
        {showSavedToast && (
          <div className="flex items-center space-x-2 bg-[#486789]/15 border border-[#486789]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#486789] animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5 text-[#486789]" />
            <span>Preferences Auto-Saved</span>
          </div>
        )}
      </div>

      {/* Main Grid Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN — Appearance & Notifications */}
        <div className="space-y-6">
          
          {/* SECTION 1: Appearance */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#292B23]/15 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#486789] p-0.5 shadow-md flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#F0EDDF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#292B23] tracking-tight">
                  Appearance
                </h2>
                <p className="text-xs text-[#292B23]/70">
                  Customize theme styling, display density, and transition visual effects.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 hover:border-[#BC4129]/40 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#486789]/15 border border-[#486789]/30 flex items-center justify-center text-[#486789] shrink-0">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#292B23] block">Dark Mode</span>
                    <span className="text-[11px] text-[#292B23]/70 block mt-0.5 font-medium">High contrast dark glassmorphism theme</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appearance.darkMode}
                    onChange={() => toggleAppearance('darkMode')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#C3C2AF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BC4129] shadow-inner"></div>
                </label>
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 hover:border-[#BC4129]/40 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#486789]/15 border border-[#486789]/30 flex items-center justify-center text-[#486789] shrink-0">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#292B23] block">Compact Mode</span>
                    <span className="text-[11px] text-[#292B23]/70 block mt-0.5 font-medium">Reduce padding & table line heights for dense views</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appearance.compactMode}
                    onChange={() => toggleAppearance('compactMode')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#C3C2AF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BC4129] shadow-inner"></div>
                </label>
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 hover:border-[#BC4129]/40 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#486789]/15 border border-[#486789]/30 flex items-center justify-center text-[#486789] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#292B23] block">Animations</span>
                    <span className="text-[11px] text-[#292B23]/70 block mt-0.5 font-medium">Enable micro-interactions and chart pulse transitions</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appearance.animations}
                    onChange={() => toggleAppearance('animations')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#C3C2AF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BC4129] shadow-inner"></div>
                </label>
              </div>

            </div>
          </div>

          {/* SECTION 2: Notifications */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#292B23]/15 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#BC4129] p-0.5 shadow-md flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#F0EDDF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#292B23] tracking-tight">
                  Notifications
                </h2>
                <p className="text-xs text-[#292B23]/70">
                  Configure real-time alert triggers and system push notifications.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              
              {/* Fraud Alerts */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 hover:border-[#BC4129]/40 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#BC4129]/15 border border-[#BC4129]/30 flex items-center justify-center text-[#BC4129] shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#292B23] block">Fraud Alerts</span>
                    <span className="text-[11px] text-[#292B23]/70 block mt-0.5 font-medium">Instant popup notifications for flagged fraudulent transactions</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.fraudAlerts}
                    onChange={() => toggleNotification('fraudAlerts')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#C3C2AF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BC4129] shadow-inner"></div>
                </label>
              </div>

              {/* High Risk Alerts */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 hover:border-[#BC4129]/40 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#BC4129]/15 border border-[#BC4129]/30 flex items-center justify-center text-[#BC4129] shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#292B23] block">High Risk Alerts</span>
                    <span className="text-[11px] text-[#292B23]/70 block mt-0.5 font-medium">Notify when transactions exceed 75% risk threshold</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.highRiskAlerts}
                    onChange={() => toggleNotification('highRiskAlerts')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#C3C2AF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BC4129] shadow-inner"></div>
                </label>
              </div>

              {/* System Notifications */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 hover:border-[#BC4129]/40 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#486789]/15 border border-[#486789]/30 flex items-center justify-center text-[#486789] shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#292B23] block">System Notifications</span>
                    <span className="text-[11px] text-[#292B23]/70 block mt-0.5 font-medium">Model update logs, security audit reports, and maintenance notices</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.systemNotifications}
                    onChange={() => toggleNotification('systemNotifications')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#C3C2AF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BC4129] shadow-inner"></div>
                </label>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN — AI Model & System Status */}
        <div className="space-y-6">
          
          {/* SECTION 3: AI Model */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#292B23]/15 pb-4 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#486789] p-0.5 shadow-md flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-[#F0EDDF] animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#292B23] tracking-tight">
                    Fraud Detection Model
                  </h2>
                  <p className="text-xs text-[#292B23]/70">
                    Active ML inference architecture & model metadata
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#486789]/15 text-[#486789] border border-[#486789]/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#486789] animate-pulse" />
                ● Ready
              </span>
            </div>

            {/* AI Model UI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
              
              {/* Model Name */}
              <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 space-y-1">
                <span className="text-[10px] text-[#292B23]/60 uppercase font-semibold block">Model Architecture</span>
                <span className="text-sm font-extrabold text-[#292B23] block">FraudFlow AI</span>
                <span className="text-[11px] text-[#BC4129] font-medium block">XGBoost + SHAP Explainability</span>
              </div>

              {/* Version */}
              <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 space-y-1">
                <span className="text-[10px] text-[#292B23]/60 uppercase font-semibold block">Active Version</span>
                <span className="text-sm font-extrabold text-[#486789] font-mono block">v1.0</span>
                <span className="text-[11px] text-[#292B23]/70 block">Release: Sept 2026</span>
              </div>

            </div>

            {/* Model Information Notice */}
            <div className="p-3.5 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 text-xs text-[#292B23] flex flex-col gap-2.5 relative z-10">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#BC4129] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-bold text-[#292B23]">Model Operations:</span> The current active model is the champion. You can trigger a candidate validation dry-run below.
                </p>
              </div>
              <div className="pt-2 border-t border-[#292B23]/15">
                <button
                  onClick={handleRetrainDryRun}
                  disabled={isRetraining}
                  className="px-4 py-2 w-full rounded-xl bg-[#486789] hover:bg-[#3b5572] text-[#F0EDDF] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRetraining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isRetraining ? 'Running Dry-Run Validation...' : 'Run Retraining Dry-Run'}
                </button>
              </div>
              {retrainResult && (
                <div className="p-3 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 mt-2 font-mono text-[10px] overflow-auto max-h-32">
                  <span className="font-bold text-[#292B23] uppercase mb-1 block">Validation Result:</span>
                  {retrainResult.status === 'success' ? (
                    <div>
                      <p>Trigger Reason: {retrainResult.latest_audit?.trigger_reason || 'Manual Dry Run'}</p>
                      <p className="text-[#BC4129]">Decision: {retrainResult.latest_audit?.promotion_decision || 'DECLINED'}</p>
                      <pre className="mt-2 text-[#486789]">{retrainResult.output}</pre>
                    </div>
                  ) : (
                    <p className="text-[#BC4129]">Error: {retrainResult.detail}</p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* SECTION 4: System Operational Status */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#292B23]/15 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#486789] p-0.5 shadow-md flex items-center justify-center">
                <Server className="w-5 h-5 text-[#F0EDDF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#292B23] tracking-tight">
                  System Health & Connectivity
                </h2>
                <p className="text-xs text-[#292B23]/70">
                  Frontend runtime state and backend API integration status
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              
              {/* Frontend Status */}
              <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#486789]/15 border border-[#486789]/30 flex items-center justify-center text-[#486789]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#292B23] block">Frontend Status</span>
                    <span className="text-[10px] text-[#292B23]/70 block">React 19 + Vite UI Engine</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#486789]/15 text-[#486789] border border-[#486789]/30">
                  <span className="w-2 h-2 rounded-full bg-[#486789] animate-pulse" />
                  ● Operational
                </span>
              </div>

              {/* API Status */}
              <div className="p-4 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#BC4129]/15 border border-[#BC4129]/30 flex items-center justify-center text-[#BC4129]">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#292B23] block">API Status</span>
                    <span className="text-[10px] text-[#292B23]/70 block">REST / WebSocket Backend Endpoint</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/30">
                  <span className="w-2 h-2 rounded-full bg-[#BC4129]" />
                  ● Not Connected
                </span>
              </div>

            </div>

            <div className="p-3.5 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 text-xs text-[#292B23]/80 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#BC4129] shrink-0 mt-0.5" />
              <p>
                API endpoints are currently unlinked. The application is operating in frontend standalone mode.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
