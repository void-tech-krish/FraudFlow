import React, { useState, useEffect } from 'react';
import {
  Database,
  Filter,
  LineChart,
  GitMerge,
  Cpu,
  Dumbbell,
  BarChart2,
  Trophy,
  Zap,
  Target,
  Activity,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function MLPipelinePage() {
  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/ml-pipeline`)
      .then(r => r.json())
      .then(data => {
        setPipelineData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#292B23]/70">
        <Activity className="w-8 h-8 animate-spin text-[#BC4129] mb-4" />
        <p className="font-bold text-sm tracking-widest uppercase">Loading Pipeline Artifacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-[#BC4129]/10 border border-[#BC4129]/30 text-[#BC4129]">
        <h3 className="font-bold text-lg mb-2">Failed to load ML Pipeline Data</h3>
        <p className="text-sm font-mono">{error}</p>
      </div>
    );
  }

  const {
    dataset,
    data_cleaning,
    eda,
    feature_engineering,
    preprocessing,
    models,
    champion,
    explainability,
    threshold,
    monitoring,
    retraining
  } = pipelineData;

  const renderSection = (num, title, icon, content, explanation) => (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-[#292B23]/15 shadow-md bg-[#E2DFCE] relative overflow-hidden group hover:border-[#486789]/30 transition-all">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#F0EDDF] border border-[#292B23]/15 flex items-center justify-center text-[#486789] shrink-0 font-black text-lg font-mono">
          {num}
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#292B23] tracking-tight flex items-center gap-2">
            {icon}
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#292B23]/70 mt-1 font-semibold leading-relaxed max-w-3xl">
            {explanation}
          </p>
        </div>
      </div>
      <div className="bg-[#F0EDDF] rounded-2xl p-4 sm:p-6 border border-[#292B23]/15 shadow-inner">
        {content}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#292B23]/15">
        <div>
          <div className="flex items-center space-x-2 text-[#486789] font-black text-sm uppercase tracking-widest mb-1">
            <GitMerge className="w-5 h-5 text-[#486789]" />
            <span>Architecture Overview</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#292B23] tracking-tight">
            ML Pipeline
          </h1>
          <p className="text-base sm:text-lg text-[#292B23]/90 mt-1 font-semibold max-w-2xl">
            Complete Machine Learning Workflow from raw transactions to production monitoring.
          </p>
        </div>
      </div>

      {/* 01 - Data Ingestion */}
      {renderSection(
        '01',
        'Data Ingestion',
        <Database className="w-6 h-6 text-[#486789]" />,
        dataset ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#292B23]/60">Total Training Samples</span>
              <div className="text-2xl font-black font-mono text-[#292B23]">{dataset.total_train_samples?.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#292B23]/60">Training Fraud</span>
              <div className="text-2xl font-black font-mono text-[#BC4129]">{dataset.train_fraud_count?.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#292B23]/60">Total Test Samples</span>
              <div className="text-2xl font-black font-mono text-[#292B23]">{dataset.total_test_samples?.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#292B23]/60">Test Fraud</span>
              <div className="text-2xl font-black font-mono text-[#BC4129]">{dataset.test_fraud_count?.toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Initial loading of transaction data and basic target distribution profiling."
      )}

      {/* 02 - Data Cleaning */}
      {renderSection(
        '02',
        'Data Cleaning & Validation',
        <Filter className="w-6 h-6 text-[#486789]" />,
        data_cleaning ? (
          <pre className="text-[11px] sm:text-xs font-mono text-[#292B23]/80 whitespace-pre-wrap overflow-x-auto">
            {data_cleaning}
          </pre>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Validation of missing values, duplicates, datatypes, and data quality checks."
      )}

      {/* 03 - EDA */}
      {renderSection(
        '03',
        'Exploratory Data Analysis',
        <LineChart className="w-6 h-6 text-[#486789]" />,
        eda?.figures?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eda.figures.map((fig, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border border-[#292B23]/15 bg-white">
                <img src={`${import.meta.env.VITE_API_URL}/figures/${fig}`} alt={fig} className="w-full h-auto object-contain" />
                <div className="p-2 bg-[#E2DFCE] text-[10px] font-mono font-bold text-center border-t border-[#292B23]/15">
                  {fig.split('/').pop()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Visualizations explaining feature distributions, fraud relationships, and geographic/temporal trends."
      )}

      {/* 04 - Feature Engineering */}
      {renderSection(
        '04',
        'Feature Engineering',
        <Cpu className="w-6 h-6 text-[#486789]" />,
        feature_engineering ? (
          <pre className="text-[11px] sm:text-xs font-mono text-[#292B23]/80 whitespace-pre-wrap overflow-x-auto">
            {feature_engineering}
          </pre>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Creation of new signals, such as temporal patterns, rolling velocities, and geographic distances."
      )}

      {/* 05 - Preprocessing */}
      {renderSection(
        '05',
        'Data Preprocessing',
        <GitMerge className="w-6 h-6 text-[#486789]" />,
        preprocessing ? (
          <pre className="text-[11px] sm:text-xs font-mono text-[#292B23]/80 whitespace-pre-wrap overflow-x-auto">
            {preprocessing}
          </pre>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Scaling, categorical encoding, and structure preparation via scikit-learn pipelines."
      )}

      {/* 06 - Model Training & 07 - Model Comparison */}
      {renderSection(
        '06 & 07',
        'Model Training & Comparison',
        <Dumbbell className="w-6 h-6 text-[#486789]" />,
        models ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">Best Model Choice:</span>
              <span className="px-2 py-1 rounded bg-[#BC4129]/10 text-[#BC4129] font-mono font-bold">{models.best_model}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">Selection Rule:</span>
              <span className="text-[#292B23]/80">{models.selection_rule}</span>
            </div>
            {models.final_untouched_test_metrics && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(models.final_untouched_test_metrics).map(([k, v]) => (
                  <div key={k} className="p-3 bg-white rounded-xl border border-[#292B23]/15 text-center">
                    <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">{k}</span>
                    <span className="block text-lg font-black font-mono text-[#486789]">{(v).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Training multiple algorithms (Logistic Regression, Decision Trees, Random Forests, XGBoost) and evaluating on cross-validation sets."
      )}

      {/* 08 - XGBoost Champion */}
      {renderSection(
        '08',
        'XGBoost Champion',
        <Trophy className="w-6 h-6 text-[#BC4129]" />,
        champion ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase text-[#292B23]/60">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">PR-AUC</span>
                  <span className="block text-xl font-black font-mono text-[#BC4129]">{champion.pr_auc?.toFixed(4)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">ROC-AUC</span>
                  <span className="block text-xl font-black font-mono text-[#BC4129]">{champion.roc_auc?.toFixed(4)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">F1 Score</span>
                  <span className="block text-xl font-black font-mono text-[#BC4129]">{champion.f1?.toFixed(4)}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">Recall</span>
                  <span className="block text-xl font-black font-mono text-[#BC4129]">{champion.recall?.toFixed(4)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase text-[#292B23]/60 mb-4">Hyperparameters</h4>
              <pre className="text-[10px] sm:text-xs font-mono bg-white p-4 rounded-xl border border-[#292B23]/15 whitespace-pre-wrap">
                {JSON.stringify(champion.hyperparameters, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Final selected production model configuration and test set evaluation."
      )}

      {/* 09 - SHAP Explainability */}
      {renderSection(
        '09',
        'SHAP Explainability',
        <Zap className="w-6 h-6 text-[#486789]" />,
        explainability?.local_explanations?.[0]?.top_positive_contributors ? (
          <div className="space-y-3">
            {explainability.local_explanations[0].top_positive_contributors.map((feat, idx) => {
              const maxVal = explainability.local_explanations[0].top_positive_contributors[0].contribution;
              const pct = ((feat.contribution / maxVal) * 100).toFixed(1);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{feat.feature}</span>
                    <span className="text-[#486789] font-mono">{pct}%</span>
                  </div>
                  <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#292B23]/15">
                    <div className="h-full bg-[#486789]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Game-theoretic SHAP (SHapley Additive exPlanations) revealing feature impact on the model's output."
      )}

      {/* 10 - Threshold Optimization */}
      {renderSection(
        '10',
        'Threshold & Cost Optimization',
        <Target className="w-6 h-6 text-[#486789]" />,
        threshold ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Optimal Classification Threshold:</span>
              <span className="px-3 py-1 rounded-full bg-[#BC4129] text-[#F0EDDF] font-mono font-black shadow-md">
                0.11
              </span>
            </div>
            {threshold.validation_comparison && threshold.validation_comparison.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15 text-center">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">Expected Cost</span>
                  <span className="block text-lg font-black font-mono text-[#486789]">
                    ${threshold.validation_comparison[0]["Expected Cost"]?.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15 text-center">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">False Positives</span>
                  <span className="block text-lg font-black font-mono text-[#486789]">
                    {threshold.validation_comparison[0]["FP Count"]}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15 text-center">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">False Negatives</span>
                  <span className="block text-lg font-black font-mono text-[#BC4129]">
                    {threshold.validation_comparison[0]["FN Count"]}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15 text-center">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">Cost per Tx</span>
                  <span className="block text-lg font-black font-mono text-[#486789]">
                    ${threshold.validation_comparison[0]["Cost per Tx"]?.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Tuning the decision boundary to minimize the expected monetary cost of false positives vs fraud losses."
      )}

      {/* 11 - Monitoring */}
      {renderSection(
        '11',
        'Model Monitoring',
        <Activity className="w-6 h-6 text-[#486789]" />,
        monitoring ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#292B23]/15">
              <span className="font-bold text-sm">Monitoring Status</span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${monitoring.alerts?.some(a => a.severity === 'CRITICAL') ? 'bg-[#BC4129]/20 text-[#BC4129]' : 'bg-[#486789]/20 text-[#486789]'}`}>
                {monitoring.alerts?.some(a => a.severity === 'CRITICAL') ? 'ALERTS DETECTED' : 'HEALTHY'}
              </span>
            </div>
            {monitoring.performance && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">Current PR-AUC</span>
                  <span className="block text-lg font-black font-mono text-[#486789]">{monitoring.performance.pr_auc?.toFixed(4) || 'N/A'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">Precision</span>
                  <span className="block text-lg font-black font-mono text-[#486789]">{monitoring.performance.precision?.toFixed(4) || 'N/A'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#292B23]/15">
                  <span className="block text-[10px] font-bold uppercase text-[#292B23]/60">Recall</span>
                  <span className="block text-lg font-black font-mono text-[#BC4129]">{monitoring.performance.recall?.toFixed(4) || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Continuous tracking of concept drift, data drift, and performance degradation in production."
      )}

      {/* 12 - Retraining Readiness */}
      {renderSection(
        '12',
        'Retraining Readiness',
        <RefreshCw className="w-6 h-6 text-[#486789]" />,
        retraining ? (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {[...retraining].reverse().map((log, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-[#292B23]/15 text-xs font-mono space-y-2">
                <div className="flex justify-between font-bold text-[#292B23]">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span className={log.promotion_decision === 'PROMOTED' ? 'text-[#486789]' : 'text-[#BC4129]'}>
                    {log.promotion_decision}
                  </span>
                </div>
                <p className="text-[#292B23]/70">Trigger: {log.trigger_reason}</p>
                <div className="flex gap-4 pt-2 border-t border-[#292B23]/10">
                  <span>Dry Run: {log.dry_run ? 'YES' : 'NO'}</span>
                  <span>Validation: {log.validation_result}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#292B23]/60">Not available in current ML reports</p>
        ),
        "Automated triggers and dry-run candidate model evaluations before production deployment."
      )}

    </div>
  );
}
