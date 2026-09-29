import pytest
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from src.models.evaluate import calculate_metrics

def test_model_module_imports():
    from src.models import train_baseline, evaluate
    assert train_baseline is not None
    assert evaluate is not None

def test_logistic_regression_configurations():
    model_baseline = LogisticRegression(class_weight=None, solver="saga", max_iter=100, random_state=42)
    model_balanced = LogisticRegression(class_weight="balanced", solver="saga", max_iter=100, random_state=42)
    
    assert model_baseline.class_weight is None
    assert model_balanced.class_weight == "balanced"

def test_prediction_probabilities_and_metrics():
    # Synthetic tiny dataset
    y_true = np.array([0, 0, 0, 1, 1])
    y_prob = np.array([0.1, 0.4, 0.2, 0.9, 0.8])
    y_pred = (y_prob >= 0.5).astype(int)
    
    assert (y_prob >= 0).all() and (y_prob <= 1).all()
    
    metrics = calculate_metrics(y_true, y_pred, y_prob)
    
    required_keys = ['precision', 'recall', 'f1', 'pr_auc', 'roc_auc', 'tp', 'tn', 'fp', 'fn']
    for key in required_keys:
        assert key in metrics
        
    assert metrics['tp'] == 2
    assert metrics['tn'] == 3
    assert metrics['fp'] == 0
    assert metrics['fn'] == 0
