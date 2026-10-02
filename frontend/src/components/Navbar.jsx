import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, CheckCircle2, Activity } from 'lucide-react';

export default function Navbar({ activeTab = 'overview', title, searchQuery = '', setSearchQuery }) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Sync external & local query
  const queryValue = setSearchQuery !== undefined ? searchQuery : localQuery;
  const handleQueryChange = (val) => {
    if (setSearchQuery) setSearchQuery(val);
    else setLocalQuery(val);
  };

  // Keyboard shortcut listener (Cmd+K or Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Map activeTab to human readable page title
  const getPageTitle = () => {
    if (title) return title;
    switch (activeTab) {
      case 'overview':
        return 'Dashboard';
      case 'predict':
        return 'Predict Transaction';
      case 'transactions':
        return 'Transactions';
      case 'analytics':
        return 'Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const pageTitle = getPageTitle();

  return (
    <header className="sticky top-0 z-30 bg-[#F0EDDF]/90 backdrop-blur-xl border-b border-[#292B23]/15 px-4 lg:px-8 py-4 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between gap-3 lg:gap-6">
        
        {/* Left: Page Title & Live Indicator */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl lg:text-4xl font-black text-[#292B23] tracking-tight">
              {pageTitle}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-black uppercase tracking-wider rounded-full bg-[#BC4129]/15 text-[#BC4129] border border-[#BC4129]/40">
              <span className="w-3 h-3 rounded-full bg-[#BC4129] animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Center: Search Box (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-6">
          <div className="relative w-full group">
            <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-[#292B23]/60 group-hover:text-[#BC4129] transition-colors duration-200" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search card, user, ID, merchant, location..."
              value={queryValue}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-[#E2DFCE] border border-[#292B23]/25 text-lg font-bold text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 hover:border-[#292B23]/40 transition-all duration-200 shadow-inner"
            />
            {queryValue ? (
              <button
                onClick={() => handleQueryChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#292B23]/60 hover:text-[#292B23] p-1 rounded-full hover:bg-[#F0EDDF] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-[#292B23]/70 bg-[#F0EDDF] px-2.5 py-0.5 rounded border border-[#292B23]/20 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Mobile Search Toggle, AI Status */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          
          {/* Mobile Search Expand Icon Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2.5 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 text-[#292B23] hover:text-[#BC4129] hover:border-[#BC4129]/40 transition-all duration-200"
            title="Toggle Search"
          >
            <Search className="w-6 h-6" />
          </button>

          {/* AI Model Status Badge */}
          <div className="hidden sm:flex items-center space-x-2.5 bg-[#E2DFCE] hover:bg-[#E2DFCE]/80 px-4 py-2.5 rounded-xl border border-[#292B23]/20 shadow-sm transition-all duration-200 group cursor-default">
            <span className="w-3 h-3 rounded-full bg-[#486789] animate-pulse" />
            <span className="text-base font-black text-[#486789] group-hover:text-[#292B23] tracking-wide transition-colors">
              ● AI Model Ready
            </span>
          </div>

          {/* Mobile Compact AI Indicator */}
          <div className="sm:hidden flex items-center bg-[#486789]/10 px-2.5 py-1.5 rounded-lg border border-[#486789]/20" title="● AI Model Ready">
            <span className="w-2.5 h-2.5 rounded-full bg-[#486789] animate-pulse" />
          </div>

        </div>

      </div>

      {/* Responsive Collapsible Mobile Search Input Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#292B23]/15 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="relative w-full">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BC4129]" />
            <input
              type="text"
              placeholder="Search card, user, ID, merchant..."
              value={queryValue}
              onChange={(e) => handleQueryChange(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#E2DFCE] border border-[#BC4129]/40 text-sm font-semibold text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:ring-2 focus:ring-[#BC4129]/20 shadow-inner"
            />
            {queryValue && (
              <button
                onClick={() => handleQueryChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#292B23]/60 hover:text-[#292B23] p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

