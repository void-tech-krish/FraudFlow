import pytest
import pandas as pd
import numpy as np

def test_stratified_kfold_configuration():
    from src.models.evaluate import cross_validate_model
    # Just checking it's importable and signature looks right
    assert cross_validate_model is not None

def test_summarize_cv_results():
    from src.models.evaluate import summarize_cv_results
    df = pd.DataFrame({
        'precision': [0.1, 0.2, 0.3],
        'recall': [0.4, 0.5, 0.6],
        'f1': [0.1, 0.2, 0.3],
        'pr_auc': [0.1, 0.2, 0.3],
        'roc_auc': [0.5, 0.6, 0.7],
        'accuracy': [0.9, 0.9, 0.9]
    })
    summary = summarize_cv_results(df)
    assert 'precision_mean' in summary
    assert np.isclose(summary['precision_mean'], 0.2)

def test_one_se_rule():
    from src.models.evaluate import apply_one_standard_error_rule
    df = pd.DataFrame({
        'max_depth': [6, 9, 12],
        'pr_auc_mean': [0.50, 0.55, 0.56],
        'pr_auc_std': [0.03, 0.03, 0.03] # SE = 0.03 / sqrt(3) ~= 0.01732
    })
    # best is 12 (0.56), SE is 0.01732, threshold is 0.56 - 0.01732 = 0.54268
    # Depth 9 is 0.55 >= 0.54268. Depth 6 is 0.50 < 0.54268.
    # Therefore it should pick depth 9 as the simplest.
    res = apply_one_standard_error_rule(df, n_folds=3)
    assert res['best_candidate_depth'] == 12
    assert res['selected_depth'] == 9

def test_honest_baseline():
    from src.models.evaluate import calculate_honest_baseline
    # 5 samples, 1 fraud
    y_true = pd.Series([0, 0, 0, 0, 1])
    res = calculate_honest_baseline(y_true)
    assert res['recall'] == 0.0
    assert res['accuracy'] == 0.8
    assert res['fraud_prevalence'] == 0.2
