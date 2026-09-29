import json
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

from src.data.loader import load_fraud_data
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import split_data, build_preprocessor
from src.models.evaluate import (
    cross_validate_model,
    summarize_cv_results,
    calculate_honest_baseline,
    apply_one_standard_error_rule
)

def run_cross_validation():
    print("Loading data...")
    df = load_fraud_data()
    
    print("Engineering features...")
    df = engineer_features(df)
    
    print("Splitting data...")
    # Get the split but discard test set for model selection phase
    X_train, _, y_train, _ = split_data(df)
    
    # Models to cross-validate
    models = {
        "logistic_regression": LogisticRegression(
            class_weight=None, solver="saga", max_iter=1000, random_state=42
        ),
        "logistic_regression_balanced": LogisticRegression(
            class_weight="balanced", solver="saga", max_iter=1000, random_state=42
        ),
        "decision_tree": DecisionTreeClassifier(
            random_state=42, class_weight="balanced", max_depth=12, min_samples_leaf=10
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=150, random_state=42, class_weight="balanced", oob_score=True, n_jobs=-1, max_depth=15, min_samples_leaf=5
        )
    }
    
    print("Cross-validating 4 models...")
    all_fold_results = []
    all_summaries = []
    
    for name, clf in models.items():
        print(f"  CV for {name}...")
        pipeline = Pipeline(steps=[
            ("preprocessor", build_preprocessor(X_train)),
            ("classifier", clf)
        ])
        
        cv_res = cross_validate_model(pipeline, X_train, y_train, n_splits=3, random_state=42)
        cv_res['model'] = name
        all_fold_results.append(cv_res)
        
        summary = summarize_cv_results(cv_res)
        summary['model'] = name
        all_summaries.append(summary)
        
    df_fold_results = pd.concat(all_fold_results, ignore_index=True)
    df_summaries = pd.DataFrame(all_summaries)
    
    # Sort summaries by pr_auc_mean descending
    df_summaries = df_summaries.sort_values(by='pr_auc_mean', ascending=False)
    
    reports_dir = Path("reports")
    reports_dir.mkdir(exist_ok=True)
    df_fold_results.to_csv(reports_dir / "phase5_cv_results.csv", index=False)
    df_summaries.to_csv(reports_dir / "phase5_cv_summary.csv", index=False)
    
    # Decision Tree complexity candidates
    print("Cross-validating Decision Tree complexity candidates (depth 6, 9, 12)...")
    dt_candidates = [6, 9, 12]
    dt_summaries = []
    for depth in dt_candidates:
        print(f"  CV for depth {depth}...")
        clf = DecisionTreeClassifier(random_state=42, class_weight="balanced", max_depth=depth, min_samples_leaf=10)
        pipeline = Pipeline(steps=[
            ("preprocessor", build_preprocessor(X_train)),
            ("classifier", clf)
        ])
        cv_res = cross_validate_model(pipeline, X_train, y_train, n_splits=3, random_state=42)
        summary = summarize_cv_results(cv_res)
        summary['max_depth'] = depth
        dt_summaries.append(summary)
        
    df_dt_cv = pd.DataFrame(dt_summaries)
    df_dt_cv.to_csv(reports_dir / "phase5_decision_tree_cv.csv", index=False)
    
    print("Applying one-standard-error rule...")
    one_se_res = apply_one_standard_error_rule(
        df_dt_cv, complexity_metric='max_depth', performance_metric='pr_auc_mean', std_metric='pr_auc_std', n_folds=3
    )
    print(one_se_res)
    
    print("Calculating honest baseline...")
    baseline_res = calculate_honest_baseline(y_train)
    with open(reports_dir / "phase5_honest_baseline.json", "w") as f:
        json.dump(baseline_res, f, indent=4)
        
    print("Generating visualizations...")
    figures_dir = reports_dir / "figures" / "phase5"
    figures_dir.mkdir(parents=True, exist_ok=True)
    
    # Plot 1: CV PR-AUC
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(df_summaries['model'], df_summaries['pr_auc_mean'], yerr=df_summaries['pr_auc_std'], capsize=5, color='skyblue')
    ax.set_ylabel('Mean PR-AUC')
    ax.set_title('Cross-Validated PR-AUC across Models')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(figures_dir / "phase5_cv_pr_auc.png")
    plt.close(fig)
    
    # Plot 2: Decision Tree Complexity vs PR-AUC
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.errorbar(df_dt_cv['max_depth'], df_dt_cv['pr_auc_mean'], yerr=df_dt_cv['pr_auc_std'], fmt='-o', capsize=5, label='Mean PR-AUC')
    ax.axhline(one_se_res['threshold'], color='r', linestyle='--', label=f"1-SE Threshold ({one_se_res['threshold']:.4f})")
    ax.axvline(one_se_res['selected_depth'], color='g', linestyle=':', label=f"Selected Depth ({one_se_res['selected_depth']})")
    ax.set_xlabel('Max Depth')
    ax.set_ylabel('Mean PR-AUC')
    ax.set_title('Decision Tree Complexity vs PR-AUC (1-SE Rule)')
    ax.legend()
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    plt.savefig(figures_dir / "phase5_decision_tree_depth_vs_pr_auc.png")
    plt.close(fig)
    
    # Plot 3: Fold Stability
    fig, ax = plt.subplots(figsize=(10, 6))
    for model_name in df_fold_results['model'].unique():
        model_folds = df_fold_results[df_fold_results['model'] == model_name]
        ax.plot(model_folds['fold'], model_folds['pr_auc'], marker='o', label=model_name)
    ax.set_xlabel('Fold')
    ax.set_ylabel('PR-AUC')
    ax.set_title('Fold-Level PR-AUC Stability')
    ax.set_xticks([1, 2, 3])
    ax.legend()
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    plt.savefig(figures_dir / "phase5_fold_pr_auc.png")
    plt.close(fig)
    
    print("Phase 5 validation complete.")

if __name__ == "__main__":
    run_cross_validation()
