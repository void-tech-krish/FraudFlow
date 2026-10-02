import React from 'react';
import { Shield, Activity, Bell, Zap, Sliders, Cpu, Play, Pause, Layers, AlertTriangle } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isStreaming, setIsStreaming, unreadAlertsCount }) {
  return (
    <header className="sticky top-0 z-40 bg-[#F0EDDF]/90 backdrop-blur-md border-b border-[#292B23]/15 px-4 lg:px-10 py-3 transition-all">
      <div className="max-w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Status Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#486789] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#F0EDDF] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#BC4129] animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-[#292B23]">
                  Fraud<span className="text-[#BC4129]">Flow</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-[#486789]/15 text-[#486789] border border-[#486789]/30">
                  AI v2.4 Pro
                </span>
              </div>
              <p className="text-xs text-[#292B23]/70 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#486789] animate-ping inline-block" />
                <span>Real-Time Fraud Intelligence Engine</span>
              </p>
            </div>
          </div>

          {/* Streaming Toggle Mobile */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isStreaming
                ? 'bg-[#486789]/15 text-[#486789] border-[#486789]/30'
                : 'bg-[#BC4129]/15 text-[#BC4129] border-[#BC4129]/30'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isStreaming ? 'Live Stream' : 'Paused'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-[#486789] text-[#F0EDDF] shadow-md'
                : 'text-[#292B23]/70 hover:text-[#292B23] hover:bg-[#E2DFCE]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Monitor & Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'insights'
                ? 'bg-[#486789] text-[#F0EDDF] shadow-md'
                : 'text-[#292B23]/70 hover:text-[#292B23] hover:bg-[#E2DFCE]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Neural Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('workbench')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all relative ${
              activeTab === 'workbench'
                ? 'bg-[#486789] text-[#F0EDDF] shadow-md'
                : 'text-[#292B23]/70 hover:text-[#292B23] hover:bg-[#E2DFCE]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Investigation Cases</span>
            {unreadAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#BC4129] text-[#F0EDDF] text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'rules'
                ? 'bg-[#486789] text-[#F0EDDF] shadow-md'
                : 'text-[#292B23]/70 hover:text-[#292B23] hover:bg-[#E2DFCE]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Security Rules</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isStreaming
                ? 'bg-[#486789]/15 text-[#486789] border-[#486789]/30 hover:bg-[#486789]/25'
                : 'bg-[#BC4129]/15 text-[#BC4129] border-[#BC4129]/30 hover:bg-[#BC4129]/25'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Stream Active' : 'Stream Paused'}</span>
          </button>

          <div className="h-4 w-px bg-[#292B23]/20" />

          <div className="flex items-center space-x-2 bg-[#E2DFCE] px-3 py-1.5 rounded-xl border border-[#292B23]/15">
            <Zap className="w-4 h-4 text-[#BC4129]" />
            <span className="text-xs text-[#292B23]/70 font-medium">Latency:</span>
            <span className="text-xs font-mono text-[#486789] font-semibold">12ms</span>
          </div>

          <div className="relative">
            <button className="p-2 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 text-[#292B23]/70 hover:text-[#292B23] transition-all cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#BC4129] animate-ping" />
          </div>
        </div>

      </div>
    </header>
  );
}
