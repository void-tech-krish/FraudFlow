import os
import pandas as pd
import numpy as np
import json
from pathlib import Path
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, average_precision_score, roc_auc_score, accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import build_preprocessor

def eval_clf(y_true, probs, preds):
    return {
        "Precision": precision_score(y_true, preds, zero_division=0),
        "Recall": recall_score(y_true, preds, zero_division=0),
        "F1": f1_score(y_true, preds, zero_division=0),
        "PR-AUC": average_precision_score(y_true, probs),
        "ROC-AUC": roc_auc_score(y_true, probs)
    }

def run_week5():
    print("Loading data...")
    df_raw = pd.read_csv("data/raw/fraudTest.csv")
    
    print("Engineering features...")
    df_clf = engineer_features(df_raw)
    
    y = df_clf['is_fraud']
    cols_to_drop = ['is_fraud']
    X = df_clf.drop(columns=cols_to_drop, errors='ignore')
    
    print("Train/Test split...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    print("Setting up CV...")
    skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    
    models = {
        "Logistic Regression": LogisticRegression(class_weight=None, random_state=42, max_iter=1000),
        "Balanced Logistic Regression": LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        "Decision Tree (depth 6)": DecisionTreeClassifier(max_depth=6, random_state=42),
        "Decision Tree (depth 9)": DecisionTreeClassifier(max_depth=9, random_state=42),
        "Decision Tree (depth 12)": DecisionTreeClassifier(max_depth=12, random_state=42)
    }
    
    cv_results = []
    
    for fold, (train_idx, val_idx) in enumerate(skf.split(X_train, y_train)):
        print(f"Fold {fold+1} / 3...")
        X_tr = X_train.iloc[train_idx]
        y_tr = y_train.iloc[train_idx]
        X_val = X_train.iloc[val_idx]
        y_val = y_train.iloc[val_idx]
        
        preprocessor = build_preprocessor(X_tr)
        X_tr_proc = preprocessor.fit_transform(X_tr)
        X_val_proc = preprocessor.transform(X_val)
        
        for name, model in models.items():
            print(f"  Training {name}...")
            model.fit(X_tr_proc, y_tr)
            preds = model.predict(X_val_proc)
            probs = model.predict_proba(X_val_proc)[:, 1]
            
            metrics = eval_clf(y_val, probs, preds)
            res = {"Model": name, "Fold": fold+1, **metrics}
            cv_results.append(res)
            
    df_cv = pd.DataFrame(cv_results)
    
    Path("reports").mkdir(exist_ok=True)
    df_cv.to_csv("reports/phase5_cv_results.csv", index=False)
    
    # Summary
    summary = []
    for model_name in models.keys():
        m_df = df_cv[df_cv['Model'] == model_name]
        mean_prauc = m_df['PR-AUC'].mean()
        std_prauc = m_df['PR-AUC'].std()
        se_prauc = std_prauc / np.sqrt(len(m_df))
        
        summary.append({
            "Model": model_name,
            "Mean PR-AUC": mean_prauc,
            "Std": std_prauc,
            "Std Error": se_prauc,
            "Mean ROC-AUC": m_df['ROC-AUC'].mean(),
            "Mean Precision": m_df['Precision'].mean(),
            "Mean Recall": m_df['Recall'].mean(),
            "Mean F1": m_df['F1'].mean()
        })
        
    df_summary = pd.DataFrame(summary)
    df_summary.to_csv("reports/phase5_cv_summary.csv", index=False)
    
    # Decision tree depth specific
    dt_names = ["Decision Tree (depth 6)", "Decision Tree (depth 9)", "Decision Tree (depth 12)"]
    df_dt = df_summary[df_summary['Model'].isin(dt_names)].copy()
    df_dt['Max Depth'] = [6, 9, 12]
    df_dt[['Max Depth', 'Mean PR-AUC', 'Std', 'Std Error']].to_csv("reports/phase5_decision_tree_cv.csv", index=False)
    
    # One-SE Rule
    best_idx = df_summary['Mean PR-AUC'].idxmax()
    best_row = df_summary.loc[best_idx]
    best_model = best_row['Model']
    best_prauc = best_row['Mean PR-AUC']
    best_se = best_row['Std Error']
    one_se_threshold = best_prauc - best_se
    
    qualifying = df_summary[df_summary['Mean PR-AUC'] >= one_se_threshold].copy()
    
    # Complexity ordering: Logistic Regression < Balanced Logistic Regression < Decision Tree < Random Forest
    complexity = {
        "Logistic Regression": 1,
        "Balanced Logistic Regression": 2,
        "Decision Tree (depth 6)": 3,
        "Decision Tree (depth 9)": 4,
        "Decision Tree (depth 12)": 5,
        "Random Forest": 6
    }
    
    qualifying['Complexity'] = qualifying['Model'].map(complexity)
    qualifying = qualifying.sort_values('Complexity')
    selected_model_name = qualifying.iloc[0]['Model']
    
    # Honest baseline
    # Predict majority class (0) for everyone in test set
    fraud_prevalence = y_train.mean()
    honest_preds = np.zeros(len(y_test))
    honest_probs = np.zeros(len(y_test))
    
    honest_metrics = {
        "Accuracy": accuracy_score(y_test, honest_preds),
        "Precision": precision_score(y_test, honest_preds, zero_division=0),
        "Recall": recall_score(y_test, honest_preds, zero_division=0),
        "F1": f1_score(y_test, honest_preds, zero_division=0),
        "PR-AUC": average_precision_score(y_test, honest_probs),
        "Fraud Prevalence": fraud_prevalence
    }
    
    with open("reports/phase5_honest_baseline.json", "w") as f:
        json.dump(honest_metrics, f, indent=4)
        
    # Final Model Selection Evaluation
    print(f"Final selected model: {selected_model_name}")
    final_model = models[selected_model_name]
    
    # Train on FULL training set
    preprocessor = build_preprocessor(X_train)
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)
    
    final_model.fit(X_train_proc, y_train)
    final_preds = final_model.predict(X_test_proc)
    final_probs = final_model.predict_proba(X_test_proc)[:, 1]
    
    final_metrics = eval_clf(y_test, final_probs, final_preds)
    final_metrics["Accuracy"] = accuracy_score(y_test, final_preds)
    
    # Save selection report
    sel_report = {
        "best_mean_prauc": best_prauc,
        "best_model": best_model,
        "best_model_se": best_se,
        "one_se_threshold": one_se_threshold,
        "qualifying_models": qualifying['Model'].tolist(),
        "selected_model": selected_model_name,
        "selection_rule": "Select simplest model within 1 standard error of the best model (Complexity: LR < BLR < DT(6) < DT(9) < DT(12) < RF)",
        "final_untouched_test_metrics": final_metrics
    }
    with open("reports/phase5_model_selection.json", "w") as f:
        json.dump(sel_report, f, indent=4)
        
    Path("models").mkdir(exist_ok=True)
    joblib.dump(final_model, f"models/selected_model_week5.joblib")
    
    # Plotting
    fig_dir = Path("reports/figures/phase5")
    fig_dir.mkdir(parents=True, exist_ok=True)
    
    plt.figure(figsize=(10, 6))
    sns.barplot(data=df_cv, x='PR-AUC', y='Model')
    plt.title('CV PR-AUC by Model')
    plt.savefig(fig_dir / 'cv_prauc_by_model.png', bbox_inches='tight')
    plt.close()
    
    plt.figure(figsize=(8, 5))
    plt.errorbar(df_dt['Max Depth'], df_dt['Mean PR-AUC'], yerr=df_dt['Std Error'], fmt='-o')
    plt.title('Decision Tree Depth vs Mean PR-AUC')
    plt.xlabel('Max Depth')
    plt.ylabel('Mean PR-AUC')
    plt.grid(True)
    plt.savefig(fig_dir / 'dt_depth_vs_prauc.png', bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    run_week5()
