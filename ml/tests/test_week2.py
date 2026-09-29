import pytest
import pandas as pd
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import build_preprocessor, split_data

@pytest.fixture(scope="module")
def data():
    return pd.read_csv("ml/data/raw/fraudTest.csv")

def test_raw_dataset_exists(data):
    assert len(data) > 0

def test_target_is_binary(data):
    assert set(data['is_fraud'].unique()) == {0, 1}

def test_preprocessing_pipeline_fit_transform(data):
    df = engineer_features(data.head(5000))
    X_train, X_test, y_train, y_test = split_data(df)
    preprocessor = build_preprocessor(X_train)
    
    # Fit on train
    preprocessor.fit(X_train)
    
    # Transform test
    X_test_transformed = preprocessor.transform(X_test)
    assert X_test_transformed.shape[0] == len(X_test)

def test_zip_is_categorical(data):
    df = engineer_features(data.head(100))
    assert df['zip'].dtype == object or 'str' in df['zip'].dtype.name or 'category' in df['zip'].dtype.name
