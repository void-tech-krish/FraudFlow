import pytest
import pandas as pd
from pathlib import Path

@pytest.fixture(scope="module")
def data():
    return pd.read_csv("ml/data/raw/fraudTest.csv")

def test_dataset_loads(data):
    assert not data.empty, "Dataset should not be empty"
    assert len(data) == 555719, "Dataset should have 555,719 rows"

def test_classification_target(data):
    assert 'is_fraud' in data.columns, "is_fraud must exist"
    assert set(data['is_fraud'].unique()) == {0, 1}, "is_fraud must be binary"
    assert data['is_fraud'].sum() == 2145, "Fraud count must be exactly 2145"

def test_regression_target(data):
    assert 'amt' in data.columns, "amt (loss proxy) must exist"
    
def test_documentation_exists():
    assert Path("ml/reports/week1_problem_framing.md").exists()
    
def test_figures_exist():
    fig_dir = Path("ml/reports/figures/phase1")
    assert (fig_dir / "fraud_distribution.png").exists()
    assert (fig_dir / "amount_histogram.png").exists()
    assert (fig_dir / "fraud_amount_boxplot.png").exists()
    assert (fig_dir / "fraud_by_category.png").exists()
    assert (fig_dir / "fraud_by_hour.png").exists()
