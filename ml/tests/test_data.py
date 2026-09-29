import pytest
from src.config import RAW_DATA_PATH
from src.data.loader import load_fraud_data

def test_dataset_file_exists():
    assert RAW_DATA_PATH.exists(), f"Dataset not found at {RAW_DATA_PATH}"

def test_dataset_can_be_loaded():
    df = load_fraud_data()
    assert df is not None
    assert not df.empty, "Dataset is empty"

def test_is_fraud_column_exists():
    df = load_fraud_data()
    assert "is_fraud" in df.columns, "'is_fraud' column is missing"

def test_target_contains_expected_binary_values():
    df = load_fraud_data()
    unique_vals = df["is_fraud"].unique()
    assert set(unique_vals).issubset({0, 1}), "Target contains values other than 0 and 1"

def test_dataset_contains_rows():
    df = load_fraud_data()
    assert len(df) > 0, "Dataset contains 0 rows"
