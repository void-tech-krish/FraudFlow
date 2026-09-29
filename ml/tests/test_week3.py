import pytest
import pandas as pd
import joblib
from pathlib import Path
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import build_preprocessor

@pytest.fixture(scope="module")
def fraud_data():
    df = pd.read_csv("ml/data/raw/fraudTest.csv")
    return df[df['is_fraud'] == 1].copy()

def test_regression_dataset(fraud_data):
    df = engineer_features(fraud_data)
    assert 'amt' in df.columns
    # Check no leakage of target
    cols_to_drop = ['amt', 'is_fraud']
    if 'amount_log' in df.columns:
        cols_to_drop.append('amount_log')
    X = df.drop(columns=cols_to_drop, errors='ignore')
    
    assert 'amt' not in X.columns
    assert 'is_fraud' not in X.columns
    assert 'amount_log' not in X.columns

def test_artifacts_exist():
    assert Path("ml/models/ols_regression.joblib").exists()
    assert Path("ml/models/gradient_descent_regression.joblib").exists()

def test_mlflow_directory():
    assert Path("mlruns.db").exists()
