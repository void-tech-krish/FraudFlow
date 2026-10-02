import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Zap,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Predict Transaction', icon: Zap },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsOpen(false); // Close mobile drawer when clicked
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-5 text-[#292B23] select-none bg-[#F0EDDF]">
      
      {/* Top Brand Section */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-[#292B23]/15">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#BC4129] p-0.5 shadow-md shadow-[#BC4129]/20">
              <div className="w-full h-full bg-[#292B23] rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#F0EDDF]" />
              </div>
            </div>

            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#292B23] flex items-center gap-1">
                Fraud<span className="text-[#BC4129]">Flow</span>
              </span>
              <span className="text-xs text-[#292B23]/70 uppercase tracking-widest font-bold block mt-0.5">
                Security Engine
              </span>
            </div>
          </div>

          {/* Close button for Mobile Drawer */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-[#E2DFCE] border border-[#292B23]/15 text-[#292B23] hover:text-[#BC4129]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="mt-6 space-y-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-lg font-extrabold transition-all duration-200 group relative cursor-pointer ${
                  isActive
                    ? 'bg-[#BC4129] text-[#F0EDDF] shadow-md border border-[#BC4129]'
                    : 'text-[#292B23]/80 hover:text-[#292B23] hover:bg-[#E2DFCE]'
                }`}
              >
                {/* Active Glowing Pill Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#292B23] rounded-r-full" />
                )}

                <div className="flex items-center space-x-4">
                  <Icon className={`w-6 h-6 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-[#F0EDDF]' : 'text-[#BC4129] group-hover:text-[#292B23]'
                  }`} />
                  <span className="tracking-wide text-lg font-extrabold">{item.label}</span>
                </div>

                <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'text-[#F0EDDF] opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-[#292B23]'
                }`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: AI MODEL Status */}
      <div className="pt-4 border-t border-[#292B23]/15">
        <div className="p-4 rounded-xl bg-[#E2DFCE] border border-[#292B23]/15 shadow-inner flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-[#BC4129] animate-ping absolute" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#BC4129] relative" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#292B23]/70 block">
                AI MODEL
              </span>
              <span className="text-base font-black text-[#BC4129] tracking-wider">
                ● SYSTEM READY
              </span>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-[#BC4129] animate-pulse" />
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Top Hamburger Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#F0EDDF]/95 backdrop-blur-xl border-b border-[#292B23]/15 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-7 h-7 text-[#BC4129]" />
          <span className="font-black text-2xl text-[#292B23]">FraudFlow</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-[#E2DFCE] border border-[#292B23]/15 text-[#292B23] hover:text-[#BC4129]"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-[#292B23]/50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-80 bg-[#F0EDDF] border-r border-[#292B23]/15 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-72 bg-[#F0EDDF] border-r border-[#292B23]/15 z-30 shadow-md">
        {navContent}
      </aside>
    </>
  );
}
