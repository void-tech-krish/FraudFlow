import React, { useState } from 'react';
import { Sliders, Plus, Power, Trash2, X } from 'lucide-react';
import { initialRules } from '../data/mockData';

export default function RulesEngine() {
  const [rules, setRules] = useState(initialRules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const [newRuleAction, setNewRuleAction] = useState('BLOCK & FLAG');

  const toggleRuleStatus = (ruleId) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r));
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleName || !newRuleCondition) return;

    const created = {
      id: `RULE-${Math.floor(100 + Math.random() * 900)}`,
      name: newRuleName,
      condition: newRuleCondition,
      action: newRuleAction,
      status: "Active",
      triggerCount: 0
    };

    setRules([created, ...rules]);
    setNewRuleName('');
    setNewRuleCondition('');
    setShowAddModal(false);
  };

  const deleteRule = (ruleId) => {
    setRules(rules.filter(r => r.id !== ruleId));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-[#292B23]/15 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md bg-[#E2DFCE]">
        <div>
          <h2 className="text-xl font-extrabold text-[#292B23] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#BC4129]" />
            Security Rules Engine & Policy Manager
          </h2>
          <p className="text-xs text-[#292B23]/70 mt-1">
            Configure automated policy rules that run in parallel with the AI neural model.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-3 rounded-2xl bg-[#486789] hover:bg-[#3b5572] text-[#F0EDDF] text-xs font-extrabold flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border border-[#486789] cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Security Rule
        </button>
      </div>

      {/* Rules List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isActive = rule.status === 'Active';
          return (
            <div
              key={rule.id}
              className={`glass-panel rounded-3xl p-5 border transition-all duration-300 ${
                isActive
                  ? 'border-[#292B23]/20 bg-[#E2DFCE] shadow-md'
                  : 'border-[#292B23]/10 opacity-60 bg-[#E2DFCE]/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#BC4129]">{rule.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isActive
                          ? 'bg-[#486789]/15 text-[#486789] border border-[#486789]/30'
                          : 'bg-[#292B23]/10 text-[#292B23]/60'
                      }`}
                    >
                      {rule.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#292B23] mt-1.5">{rule.name}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleRuleStatus(rule.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#486789]/15 text-[#486789] border-[#486789]/30 hover:bg-[#486789]/25'
                        : 'bg-[#F0EDDF] text-[#292B23]/50 border-[#292B23]/20 hover:text-[#292B23]'
                    }`}
                    title={isActive ? "Pause Rule" : "Activate Rule"}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 rounded-xl bg-[#F0EDDF] border border-[#292B23]/20 text-[#292B23]/60 hover:text-[#BC4129] hover:border-[#BC4129]/40 transition-all cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Condition Box */}
              <div className="mt-3 p-3 rounded-2xl bg-[#F0EDDF] font-mono text-xs text-[#292B23] border border-[#292B23]/15 shadow-inner">
                <span className="text-[10px] text-[#292B23]/60 block uppercase font-sans font-bold mb-1">
                  Rule Logic Condition
                </span>
                {rule.condition}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#292B23]/15 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#292B23]/70">Action:</span>
                  <span className="font-bold text-[#BC4129] px-2.5 py-0.5 rounded-lg bg-[#BC4129]/10 border border-[#BC4129]/30 text-[11px]">
                    {rule.action}
                  </span>
                </div>

                <div className="text-[#292B23]/70 font-mono text-[11px]">
                  Triggers Today: <span className="text-[#292B23] font-bold">{rule.triggerCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292B23]/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-[#292B23]/20 shadow-2xl space-y-4 bg-[#F0EDDF]">
            <div className="flex items-center justify-between border-b border-[#292B23]/15 pb-3">
              <h3 className="text-lg font-bold text-[#292B23]">Add Security Policy Rule</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 text-[#292B23]/70 hover:text-[#292B23]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#292B23] font-bold mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Overseas Large Purchase Limit"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-[#292B23] font-bold mb-1">Condition Expression</label>
                <textarea
                  placeholder="e.g. Amount > $5,000 AND Device == New"
                  value={newRuleCondition}
                  onChange={(e) => setNewRuleCondition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 text-[#292B23] placeholder-[#292B23]/50 focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 font-mono h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-[#292B23] font-bold mb-1">Target Action</label>
                <select
                  value={newRuleAction}
                  onChange={(e) => setNewRuleAction(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 text-[#292B23] focus:outline-none focus:border-[#BC4129] focus:ring-2 focus:ring-[#BC4129]/20 font-semibold cursor-pointer"
                >
                  <option value="BLOCK & FLAG">BLOCK & FLAG</option>
                  <option value="REQUIRE 2FA">REQUIRE 2FA</option>
                  <option value="SUSPEND CARD">SUSPEND CARD</option>
                  <option value="FLAG FOR REVIEW">FLAG FOR MANUAL REVIEW</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#E2DFCE] border border-[#292B23]/20 text-[#292B23] hover:bg-[#d5d2c1] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#486789] hover:bg-[#3b5572] text-[#F0EDDF] font-extrabold shadow-md cursor-pointer"
                >
                  Save & Enable Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
