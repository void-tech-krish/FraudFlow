import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    average_precision_score, roc_auc_score, accuracy_score,
    confusion_matrix, precision_recall_curve, roc_curve, ConfusionMatrixDisplay
)
from sklearn.inspection import permutation_importance
from pathlib import Path

def calculate_metrics(y_true, y_pred, y_prob):
    """
    Calculate essential classification metrics for highly imbalanced data.
    """
    metrics = {
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "pr_auc": float(average_precision_score(y_true, y_prob)),
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "accuracy": float(accuracy_score(y_true, y_pred))
    }
    
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    metrics["tp"] = int(tp)
    metrics["tn"] = int(tn)
    metrics["fp"] = int(fp)
    metrics["fn"] = int(fn)
    
    return metrics

def plot_confusion_matrix(y_true, y_pred, title, save_path):
    cm = confusion_matrix(y_true, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Legitimate", "Fraud"])
    
    fig, ax = plt.subplots(figsize=(6, 5))
    disp.plot(cmap="Blues", ax=ax, values_format="d")
    ax.set_title(title)
    
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(save_path, bbox_inches='tight')
    plt.close(fig)

def plot_precision_recall_curve(y_true, y_probs_dict, title, save_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    
    for label, y_prob in y_probs_dict.items():
        precision, recall, _ = precision_recall_curve(y_true, y_prob)
        ap = average_precision_score(y_true, y_prob)
        ax.plot(recall, precision, label=f"{label} (AP = {ap:.3f})")
        
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_title(title)
    ax.legend()
    ax.grid(True, linestyle="--", alpha=0.6)
    
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(save_path, bbox_inches='tight')
    plt.close(fig)

def plot_roc_curve(y_true, y_probs_dict, title, save_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    
    for label, y_prob in y_probs_dict.items():
        fpr, tpr, _ = roc_curve(y_true, y_prob)
        auc = roc_auc_score(y_true, y_prob)
        ax.plot(fpr, tpr, label=f"{label} (AUC = {auc:.3f})")
        
    ax.plot([0, 1], [0, 1], color="black", linestyle="--")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title(title)
    ax.legend()
    ax.grid(True, linestyle="--", alpha=0.6)
    
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(save_path, bbox_inches='tight')
    plt.close(fig)

def extract_feature_importance(model_pipeline, save_path=None, plot_path=None, top_n=20):
    preprocessor = model_pipeline.named_steps['preprocessor']
    classifier = model_pipeline.named_steps['classifier']
    
    # Get feature names from preprocessor
    feature_names = preprocessor.get_feature_names_out()
    importances = classifier.feature_importances_
    
    df_imp = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    }).sort_values(by='importance', ascending=False)
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        df_imp.to_csv(save_path, index=False)
        
    if plot_path:
        Path(plot_path).parent.mkdir(parents=True, exist_ok=True)
        top_df = df_imp.head(top_n)
        
        fig, ax = plt.subplots(figsize=(10, 8))
        ax.barh(top_df['feature'][::-1], top_df['importance'][::-1], color='steelblue')
        ax.set_xlabel('Feature Importance')
        ax.set_title(f'Top {top_n} Feature Importances')
        plt.tight_layout()
        plt.savefig(plot_path)
        plt.close(fig)
        
    return df_imp

def calculate_permutation_importance(model_pipeline, X, y, n_repeats=3, random_state=42, n_jobs=-1, save_path=None, plot_path=None, top_n=20):
    result = permutation_importance(
        model_pipeline, X, y, n_repeats=n_repeats, random_state=random_state, n_jobs=n_jobs, scoring='average_precision'
    )
    
    df_imp = pd.DataFrame({
        'feature': X.columns,
        'importance_mean': result.importances_mean,
        'importance_std': result.importances_std
    }).sort_values(by='importance_mean', ascending=False)
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        df_imp.to_csv(save_path, index=False)
        
    if plot_path:
        Path(plot_path).parent.mkdir(parents=True, exist_ok=True)
        top_df = df_imp.head(top_n)
        
        fig, ax = plt.subplots(figsize=(10, 8))
        ax.barh(top_df['feature'][::-1], top_df['importance_mean'][::-1], xerr=top_df['importance_std'][::-1], color='coral')
        ax.set_xlabel('Permutation Importance (Mean AP decrease)')
        ax.set_title(f'Top {top_n} Permutation Importances')
        plt.tight_layout()
        plt.savefig(plot_path)
        plt.close(fig)
        
    return df_imp

from sklearn.model_selection import StratifiedKFold
import numpy as np

def cross_validate_model(model_pipeline, X, y, n_splits=3, random_state=42):
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    results = []
    
    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y), 1):
        X_train_fold = X.iloc[train_idx]
        y_train_fold = y.iloc[train_idx]
        X_val_fold = X.iloc[val_idx]
        y_val_fold = y.iloc[val_idx]
        
        # Fit on fold train
        model_pipeline.fit(X_train_fold, y_train_fold)
        
        # Predict on fold val
        y_prob = model_pipeline.predict_proba(X_val_fold)[:, 1]
        y_pred = model_pipeline.predict(X_val_fold)
        
        metrics = calculate_metrics(y_val_fold, y_pred, y_prob)
        metrics['fold'] = fold
        results.append(metrics)
        
    return pd.DataFrame(results)

def summarize_cv_results(cv_results_df):
    summary = {}
    for col in ['precision', 'recall', 'f1', 'pr_auc', 'roc_auc', 'accuracy']:
        summary[f'{col}_mean'] = cv_results_df[col].mean()
        summary[f'{col}_std'] = cv_results_df[col].std()
    return pd.Series(summary)

def calculate_honest_baseline(y_true):
    # Predict all 0 (legitimate)
    y_pred = np.zeros_like(y_true)
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    
    return {
        'fraud_prevalence': float(y_true.mean()),
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1': float(f1)
    }

def apply_one_standard_error_rule(cv_summaries, complexity_metric='max_depth', performance_metric='pr_auc_mean', std_metric='pr_auc_std', n_folds=3):
    best_candidate = cv_summaries.loc[cv_summaries[performance_metric].idxmax()]
    best_mean = best_candidate[performance_metric]
    best_std = best_candidate[std_metric]
    standard_error = best_std / np.sqrt(n_folds)
    
    threshold = best_mean - standard_error
    
    # Sort by complexity ascending (simpler is first)
    cv_summaries_sorted = cv_summaries.sort_values(by=complexity_metric, ascending=True)
    
    # Find simplest candidate above threshold
    for _, row in cv_summaries_sorted.iterrows():
        if row[performance_metric] >= threshold:
            selected_candidate = row
            break
            
    return {
        'best_mean': float(best_mean),
        'best_candidate_depth': float(best_candidate[complexity_metric]),
        'standard_error': float(standard_error),
        'threshold': float(threshold),
        'selected_depth': float(selected_candidate[complexity_metric])
    }
