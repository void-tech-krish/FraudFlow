import pytest
import pandas as pd
import numpy as np
from src.config import RAW_DATA_PATH
from src.data.loader import load_fraud_data
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import split_data, build_preprocessor

@pytest.fixture(scope="module")
def raw_data():
    return load_fraud_data()

@pytest.fixture(scope="module")
def engineered_data(raw_data):
    return engineer_features(raw_data)

def test_original_dataset_untouched(raw_data):
    assert 'is_fraud' in raw_data.columns
    assert 'trans_date_trans_time' in raw_data.columns
    assert 'cc_num' in raw_data.columns

def test_feature_engineering_creates_expected_columns(engineered_data):
    expected_cols = [
        'transaction_hour', 'transaction_day', 'transaction_month', 
        'transaction_day_of_week', 'is_weekend', 'customer_age', 
        'merchant_distance', 'amount_log'
    ]
    for col in expected_cols:
        assert col in engineered_data.columns, f"Missing feature {col}"

def test_identifiers_excluded(engineered_data):
    excluded = ['id', 'Unnamed: 0', 'cc_num', 'first', 'last', 'street', 'trans_num', 'dob', 'trans_date_trans_time']
    for col in excluded:
        assert col not in engineered_data.columns, f"Identifier {col} was not excluded"

def test_target_excluded_from_X(engineered_data):
    X_train, X_test, y_train, y_test = split_data(engineered_data)
    assert 'is_fraud' not in X_train.columns
    assert 'is_fraud' not in X_test.columns

def test_train_test_split_preserves_classes(engineered_data):
    X_train, X_test, y_train, y_test = split_data(engineered_data)
    
    train_fraud_rate = y_train.mean()
    test_fraud_rate = y_test.mean()
    
    # Check if the split stratification is approximately preserved
    assert np.isclose(train_fraud_rate, test_fraud_rate, rtol=0.1)

def test_preprocessing_pipeline_fits_and_transforms(engineered_data):
    X_train, X_test, y_train, y_test = split_data(engineered_data)
    
    preprocessor = build_preprocessor(X_train)
    
    # Fit only on train
    X_train_transformed = preprocessor.fit_transform(X_train)
    assert X_train_transformed is not None
    
    # Transform test
    X_test_transformed = preprocessor.transform(X_test)
    assert X_test_transformed is not None
    
    # Test unseen categories does not crash (handle_unknown='ignore')
    # Introduce a new category manually in a small dummy dataframe
    X_dummy = X_test.copy().head(1)
    if 'merchant' in X_dummy.columns:
        X_dummy['merchant'] = 'UNSEEN_MERCHANT_XYZ_123'
        X_dummy_transformed = preprocessor.transform(X_dummy)
        assert X_dummy_transformed is not None

