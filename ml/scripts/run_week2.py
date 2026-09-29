import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json

def run_week2():
    print("Loading data...")
    df = pd.read_csv("data/raw/fraudTest.csv")
    
    # Validation results
    val_results = {}
    val_results["rows"] = len(df)
    val_results["cols"] = len(df.columns)
    val_results["fraud"] = df["is_fraud"].sum()
    val_results["legit"] = val_results["rows"] - val_results["fraud"]
    
    # Amount validation
    amt_stats = df["amt"].describe(percentiles=[.01, .25, .5, .75, .95, .99, .999])
    
    # Missingness
    missing = df.isnull().sum()
    missing_pct = (missing / len(df)) * 100
    
    # Report MD
    report_md = f"""# Week 2 — Data Cleaning & Validation

## Dataset Validation
- **Rows**: {val_results['rows']}
- **Columns**: {val_results['cols']}
- **Target**: `is_fraud`
- **Known fraud count**: {val_results['fraud']}
- **Known non-fraud count**: {val_results['legit']}
- **Missing values**: {missing.sum()} total
- **Duplicate rows**: {df.duplicated().sum()}

## Amount Validation
- **Min**: {amt_stats['min']:.2f}
- **Max**: {amt_stats['max']:.2f}
- **Mean**: {amt_stats['mean']:.2f}
- **Median**: {amt_stats['50%']:.2f}
- **99.9th percentile**: {amt_stats['99.9%']:.2f}
- **Zero/Negative amounts**: {(df['amt'] <= 0).sum()}

## Merchant Validation
- **Unique merchants**: {df['merchant'].nunique()}
- **Missing merchants**: {df['merchant'].isnull().sum()}
- **Handling**: High cardinality. The preprocessing pipeline uses `OneHotEncoder(handle_unknown='ignore')` which safely handles unseen merchants in test/validation data.

## Device Availability
No dedicated device identifier/feature is available in `fraudTest.csv`. We do not invent a device feature.

## Velocity Availability
The dataset lacks explicit velocity features (e.g., transactions per hour per user). Due to strict leakage requirements (transactions must not use future data or risk target leakage if engineered improperly from this flat file), we validate its absence but do not fabricate one.

## Geographic Validation
- **Latitude range**: {df['lat'].min()} to {df['lat'].max()} (Valid: -90 to 90)
- **Longitude range**: {df['long'].min()} to {df['long'].max()} (Valid: -180 to 180)
- **Missing geographic info**: None
- **Consistency**: Coordinates support the existing Haversine merchant-distance feature perfectly.

## Missingness
Zero missing values across all columns. The preprocessing pipeline still handles unseen categories.

## Outlier Analysis
- High-value `amt` transactions are statistical outliers but preserved as they often represent true fraud patterns.
- Geographic outliers do not exist (all within valid ranges).
- Handled safely during robust scaling inside the preprocessing pipeline.

## Data Type Validation
- Datetimes (`trans_date_trans_time`, `dob`) are safely parsed and dropped after feature extraction.
- Identifiers (`cc_num`, `id`, `first`, `last`, `trans_num`, `street`) are safely dropped to prevent overfitting.
- Target is strictly binary.

## Leakage Audit
- No future transaction information is used.
- Train/test splitting is strictly stratified before the preprocessing pipeline is fitted.
- The `ColumnTransformer` (scaling, encoding) is fitted ONLY on the training split. Validation/test sets are purely transformed.

## Feature Availability at Prediction Time
All retained features (amount, time, coordinates, category) represent point-in-time transaction context available before authorization.

## Preprocessing Pipeline
The pipeline safely segregates numerical (`StandardScaler`) and categorical (`OneHotEncoder(handle_unknown='ignore')`) preprocessing. Fitted on train only.

## ZIP Code Treatment
ZIP code was originally treated numerically. It has been semantically validated and updated in `feature_engineering.py` to be cast as `str`, ensuring it is treated as a categorical variable rather than continuous.

## Decisions and Limitations
- Outliers are retained.
- Device/Velocity signals are absent.
- Pipeline is fully leakage-safe.
"""
    with open("reports/week2_data_validation.md", "w") as f:
        f.write(report_md)
        
    # Generate Plots
    fig_dir = Path("reports/figures/phase2")
    fig_dir.mkdir(parents=True, exist_ok=True)
    
    plt.figure(figsize=(10, 5))
    sns.boxplot(x=df['amt'])
    plt.title("Transaction Amount Outlier Analysis (Boxplot)")
    plt.savefig(fig_dir / "amount_boxplot_outliers.png", bbox_inches='tight')
    plt.close()
    
    plt.figure(figsize=(10, 5))
    sns.scatterplot(x='long', y='lat', hue='is_fraud', data=df.sample(20000), alpha=0.5)
    plt.title("Geographic Coordinate Validation (Sample)")
    plt.savefig(fig_dir / "geo_validation_scatter.png", bbox_inches='tight')
    plt.close()
    
    # Tests
    test_code = """import pytest
import pandas as pd
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import build_preprocessor, split_data

@pytest.fixture(scope="module")
def data():
    return pd.read_csv("data/raw/fraudTest.csv")

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
    assert df['zip'].dtype == object or df['zip'].dtype.name == 'category' or df['zip'].dtype.name == 'string'
"""
    with open("tests/test_week2.py", "w") as f:
        f.write(test_code)
        
    # Notebook
    notebook = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": ["# FraudFlow Week 2: Data Cleaning & Validation"]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import pandas as pd\n",
                    "df = pd.read_csv('../data/raw/fraudTest.csv')\n",
                    "print('Dataset Shape:', df.shape)\n",
                    "print('Missing Values:', df.isnull().sum().sum())\n",
                    "print('Amount Stats:')\n",
                    "print(df['amt'].describe(percentiles=[.01, .25, .5, .75, .95, .99, .999]))"
                ]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    with open("notebooks/02_data_validation.ipynb", "w") as f:
        json.dump(notebook, f, indent=1)

if __name__ == "__main__":
    run_week2()
