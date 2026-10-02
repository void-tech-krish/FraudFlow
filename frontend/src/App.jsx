import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import KPICards from './components/KPICards';
import TransactionStream from './components/TransactionStream';
import FraudAnalytics from './components/FraudAnalytics';
import FraudAnalyticsPage from './components/FraudAnalyticsPage';
import AIModelInsights from './components/AIModelInsights';
import PredictTransaction from './components/PredictTransaction';
import TransactionsPage from './components/TransactionsPage';
import InvestigationWorkbench from './components/InvestigationWorkbench';
import RulesEngine from './components/RulesEngine';
import SettingsPage from './components/SettingsPage';
import TransactionDetailModal from './components/TransactionDetailModal';

import {
  initialTransactions,
  mockNames,
  mockMerchants,
  mockCategories,
  mockLocations
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isStreaming, setIsStreaming] = useState(true);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated Real-Time Transaction Generator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const isFraudSim = Math.random() < 0.25;
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomMerchant = mockMerchants[Math.floor(Math.random() * mockMerchants.length)];
      const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
      const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
      
      const amount = isFraudSim
        ? Number((Math.random() * 4000 + 800).toFixed(2))
        : Number((Math.random() * 250 + 5).toFixed(2));

      const riskScore = isFraudSim
        ? Math.floor(Math.random() * 25 + 75)
        : Math.floor(Math.random() * 20 + 1);

      const status = isFraudSim ? "Fraud Detected" : "Legitimate";
      const riskLevel = isFraudSim ? "Critical" : "Low";

      const newTx = {
        id: `TX-${Math.floor(90000 + Math.random() * 9999)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        cardHolder: randomName,
        cardNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
        merchant: randomMerchant,
        category: randomCategory,
        amount: amount,
        location: randomLocation,
        riskScore: riskScore,
        status: status,
        riskLevel: riskLevel,
        aiReasoning: isFraudSim
          ? ["High value amount anomaly", "Location IP distance mismatch", "Rapid velocity trigger"]
          : ["Normal behavioral signature", "Low risk merchant"]
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 29)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Derived KPI Statistics
  const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCount = transactions.length * 1420;
  const fraudTransactions = transactions.filter(t => t.riskScore >= 75 || t.status === 'Fraud Detected');
  const fraudBlockedValue = fraudTransactions.reduce((acc, curr) => acc + curr.amount, 0) * 12;
  const criticalAlerts = fraudTransactions.length;

  const handleActionComplete = (caseId, actionType) => {
    setTransactions(prev => prev.map(t => t.id === caseId ? { ...t, status: actionType } : t));
  };

  return (
    <div className="min-h-screen bg-[#F0EDDF] text-[#292B23] flex flex-col lg:flex-row font-sans selection:bg-[#BC4129] selection:text-[#F0EDDF]">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Layout Container */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen pt-14 lg:pt-0">
        
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Workspace Container */}
        <main className="flex-1 max-w-full w-full mx-auto px-4 lg:px-6 py-6 space-y-6">
          
          {/* Top KPI Cards Row */}
          <KPICards
            stats={{
              totalVolume,
              totalCount,
              fraudBlockedValue,
              fraudCount: fraudTransactions.length * 8,
              criticalAlerts
            }}
          />

          {/* 1. Dashboard View */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <TransactionStream
                transactions={transactions}
                onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                isStreaming={isStreaming}
                externalSearchQuery={searchQuery}
                setExternalSearchQuery={setSearchQuery}
              />
              <FraudAnalytics />
            </div>
          )}

          {/* 2. Predict Transaction View */}
          {activeTab === 'predict' && (
            <PredictTransaction />
          )}

          {/* 3. Transactions View */}
          {activeTab === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              externalSearchQuery={searchQuery}
              setExternalSearchQuery={setSearchQuery}
            />
          )}

          {/* 4. Analytics View */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <FraudAnalyticsPage />
              <AIModelInsights />
              <InvestigationWorkbench
                transactions={transactions}
                onActionComplete={handleActionComplete}
              />
            </div>
          )}

          {/* 5. Settings View */}
          {activeTab === 'settings' && (
            <SettingsPage />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-[#292B23]/15 bg-[#E2DFCE] py-5 px-4 lg:px-10 mt-12 text-sm text-[#292B23]/80">
          <div className="max-w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#292B23] text-base">FraudFlow Intelligence Platform</span>
              <span>•</span>
              <span className="font-medium">AI CyberSecurity SaaS UI</span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded bg-[#F0EDDF] border border-[#292B23]/20 text-[#292B23]">React 19</span>
              <span className="px-2.5 py-1 rounded bg-[#F0EDDF] border border-[#292B23]/20 text-[#292B23]">Vite</span>
              <span className="px-2.5 py-1 rounded bg-[#F0EDDF] border border-[#292B23]/20 text-[#292B23]">Tailwind CSS</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

    </div>
  );
}
