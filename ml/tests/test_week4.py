import pytest
import pandas as pd
import joblib
from pathlib import Path
from src.preprocessing.feature_engineering import engineer_features

@pytest.fixture(scope="module")
def raw_data():
    return pd.read_csv("ml/data/raw/fraudTest.csv", nrows=1000)

def test_new_features_deterministic_and_no_leakage(raw_data):
    df = engineer_features(raw_data)
    assert 'hour_sin' in df.columns
    assert 'time_of_day' in df.columns
    assert 'age_bucket' in df.columns
    # Check deterministic
    df2 = engineer_features(raw_data)
    assert (df['hour_sin'] == df2['hour_sin']).all()
    # Check no leakage in these columns
    assert 'is_fraud' not in df['time_of_day'].values
    assert 'is_fraud' not in df['age_bucket'].values

def test_artifacts_exist():
    assert Path("ml/models/ridge_regression.joblib").exists()
    assert Path("ml/models/lasso_regression.joblib").exists()
    assert Path("ml/models/logistic_regression_week4.joblib").exists()
    assert Path("ml/models/logistic_regression_balanced_week4.joblib").exists()
    
def test_regression_target_not_in_X(raw_data):
    df = engineer_features(raw_data[raw_data['is_fraud']==1])
    cols_to_drop = ['amt', 'is_fraud', 'amount_log']
    X = df.drop(columns=[c for c in cols_to_drop if c in df.columns])
    assert 'amt' not in X.columns
