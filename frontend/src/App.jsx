import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Activity, ShieldAlert, Cpu, BarChart2, RefreshCw } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Explainability from './pages/Explainability';
import Analytics from './pages/Analytics';
import Monitoring from './pages/Monitoring';
import Retraining from './pages/Retraining';
import MLGallery from './pages/MLGallery';
import { Image as ImageIcon } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 shadow-xl z-10 flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
            <div className="bg-rose-500 p-2 rounded-lg text-white shadow-lg shadow-rose-500/20">
              <ShieldAlert size={24} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              FraudFlow
            </h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white">
              <LayoutDashboard size={20} className="text-indigo-400" />
              <span>Dashboard</span>
            </Link>
            <Link to="/transactions" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white">
              <ShieldAlert size={20} className="text-emerald-400" />
              <span>Fraud Prediction</span>
            </Link>
            <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white">
              <BarChart2 size={20} className="text-blue-400" />
              <span>Analytics</span>
            </Link>
            <Link to="/explainability" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white">
              <Cpu size={20} className="text-amber-400" />
              <span>Explainability</span>
            </Link>
            <Link to="/monitoring" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white">
              <Activity size={20} className="text-purple-400" />
              <span>Monitoring</span>
            </Link>
            <Link to="/gallery" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white">
              <ImageIcon size={20} className="text-pink-400" />
              <span>ML Reports Gallery</span>
            </Link>
            <Link to="/retraining" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white">
              <RefreshCw size={20} className="text-rose-400" />
              <span>Retraining</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} FraudFlow AI
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-900/50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/explainability" element={<Explainability />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/retraining" element={<Retraining />} />
            <Route path="/gallery" element={<MLGallery />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
