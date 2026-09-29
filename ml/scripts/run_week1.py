import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json

def run_week1():
    print("Loading data...")
    df = pd.read_csv("data/raw/fraudTest.csv")
    
    # Create directory
    fig_dir = Path("reports/figures/phase1")
    fig_dir.mkdir(parents=True, exist_ok=True)
    
    print("Generating plots...")
    # 1. fraud_distribution.png
    plt.figure(figsize=(6, 4))
    sns.countplot(data=df, x='is_fraud')
    plt.title("Fraud vs Legitimate Transactions")
    plt.savefig(fig_dir / "fraud_distribution.png", bbox_inches='tight')
    plt.close()
    
    # 2. amount_histogram.png
    plt.figure(figsize=(8, 5))
    sns.histplot(df[df['amt'] < 500]['amt'], bins=50, kde=True)
    plt.title("Transaction Amount Distribution (amt < 500)")
    plt.savefig(fig_dir / "amount_histogram.png", bbox_inches='tight')
    plt.close()
    
    # 3. fraud_amount_boxplot.png
    plt.figure(figsize=(8, 5))
    sns.boxplot(data=df[df['amt'] < 1000], x='is_fraud', y='amt')
    plt.title("Transaction Amount by Fraud Class (amt < 1000)")
    plt.savefig(fig_dir / "fraud_amount_boxplot.png", bbox_inches='tight')
    plt.close()
    
    # 4. fraud_by_category.png
    plt.figure(figsize=(10, 6))
    fraud_df = df[df['is_fraud'] == 1]
    sns.countplot(data=fraud_df, y='category', order=fraud_df['category'].value_counts().index)
    plt.title("Fraudulent Transactions by Category")
    plt.savefig(fig_dir / "fraud_by_category.png", bbox_inches='tight')
    plt.close()
    
    # 5. fraud_by_hour.png
    df['trans_date_trans_time'] = pd.to_datetime(df['trans_date_trans_time'])
    df['hour'] = df['trans_date_trans_time'].dt.hour
    plt.figure(figsize=(10, 5))
    sns.countplot(data=df[df['is_fraud'] == 1], x='hour')
    plt.title("Fraudulent Transactions by Hour of Day")
    plt.savefig(fig_dir / "fraud_by_hour.png", bbox_inches='tight')
    plt.close()
    
    print("Generating Week 1 report...")
    report_md = """# FraudFlow Week 1 — Problem Framing

## Problem
We need to detect fraudulent credit card transactions to prevent financial loss and protect customers.

## Classification Target
is_fraud (0 = legitimate transaction, 1 = fraudulent transaction)

## Regression Target
fraud_loss_amount

## Available Loss Proxy
amt for fraudulent transactions. The dataset lacks a true "recovered amount" or "final financial loss" field, so we use `amt` as a proxy for the potential transaction amount at risk if the transaction is fraudulent. For legitimate transactions, the fraud-loss target is not applicable.

## Dataset Summary
- Total transactions: 555,719
- Legitimate transactions: 553,574
- Fraudulent transactions: 2,145

## Fraud Prevalence
~0.386%

## Initial EDA Findings
- The dataset is extremely imbalanced.
- Fraudulent transactions tend to have significantly higher amounts than legitimate ones.
- Certain categories (e.g., shopping_net, grocery_pos) show higher fraud counts.
- Fraud activity peaks late at night and early morning (e.g., 22:00 - 03:00).

## Irreducible-Error Floor
We cannot calculate a true irreducible-error floor from this dataset alone because of:
- Unobserved fraud signals (e.g., device IP, behavioral biometrics).
- Noisy labels (some legitimate transactions might be unreported fraud).
- Missing behavioral context.
- Unavailable true financial-loss information.
- Temporal/adversarial fraud changes (fraudsters actively adapt).
- Limitations of available transaction features.
This is a qualitative Week 1 framing. 

## Data Limitations
We do not have ground truth on fraudster intent or actual final financial loss after bank recoveries. `amt` is only a proxy for the amount at risk.

## Week 1 Conclusion
We have successfully framed the dual objectives: classifying `is_fraud` and estimating potential `fraud_loss_amount` (using `amt` as a proxy). The dataset is ready for feature engineering with a clear understanding of its severe imbalance and limitations.
"""
    with open("reports/week1_problem_framing.md", "w") as f:
        f.write(report_md)
        
    print("Generating tests...")
    test_code = """import pytest
import pandas as pd
from pathlib import Path

@pytest.fixture(scope="module")
def data():
    return pd.read_csv("data/raw/fraudTest.csv")

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
    assert Path("reports/week1_problem_framing.md").exists()
    
def test_figures_exist():
    fig_dir = Path("reports/figures/phase1")
    assert (fig_dir / "fraud_distribution.png").exists()
    assert (fig_dir / "amount_histogram.png").exists()
    assert (fig_dir / "fraud_amount_boxplot.png").exists()
    assert (fig_dir / "fraud_by_category.png").exists()
    assert (fig_dir / "fraud_by_hour.png").exists()
"""
    with open("tests/test_week1.py", "w") as f:
        f.write(test_code)
        
    print("Updating README.md...")
    readme_path = Path("README.md")
    content = readme_path.read_text(encoding="utf-8")
    if "## Week 1 — Problem Framing" not in content:
        week1_section = """
## Week 1 — Problem Framing
- **Fraud classification target:** `is_fraud` (0 = legitimate, 1 = fraud). Highly imbalanced (0.386% prevalence).
- **Expected loss regression target:** `fraud_loss_amount`.
- **Loss proxy limitation:** `amt` is used as a proxy for fraudulent transactions because true financial loss is unavailable.
- **Dataset statistics:** 555,719 transactions (2,145 fraud).
- **Initial EDA:** Generated distribution plots, hour/category analysis, and amount comparisons.
- **Irreducible-error floor framing:** Estimated qualitatively due to unobserved signals, noisy labels, and adversarial adaptation. No numerical estimate is invented.
- **Week 1 limitations:** True loss and intent are unknown; `amt` is only a proxy.
"""
        # Append before Phase 2 or just at the end. Since there's Phase 1, we can just append it.
        # It's better to append it to the end so we don't accidentally break markdown.
        with open("README.md", "a", encoding="utf-8") as f:
            f.write(week1_section)

    print("Generating notebook...")
    notebook = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": ["# FraudFlow Week 1: Problem Framing & EDA"]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 1. Problem Framing\\n",
                    "**Classification Target**: `is_fraud` (0 = legitimate, 1 = fraud)\\n",
                    "**Regression Target**: `fraud_loss_amount`\\n",
                    "**Available Loss Proxy**: `amt` for fraudulent transactions (actual recovered amount is unavailable)\\n",
                    "**Irreducible-Error Floor**: Qualitative assessment (unobserved signals, noisy labels, missing behavioral context). Cannot be numerically determined from this dataset.\\n",
                    "**Limitations**: We lack true financial loss data after recoveries, so `amt` is just a proxy."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import pandas as pd\\n",
                    "import matplotlib.pyplot as plt\\n",
                    "import seaborn as sns\\n",
                    "\\n",
                    "df = pd.read_csv('../data/raw/fraudTest.csv')\\n",
                    "print(f'Total transactions: {len(df)}')\\n",
                    "print(f'Fraudulent: {df.is_fraud.sum()}')\\n",
                    "print(f'Legitimate: {len(df) - df.is_fraud.sum()}')\\n",
                    "print(f'Fraud Prevalence: {df.is_fraud.mean():.4%}')"
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
    with open("notebooks/01_data_exploration.ipynb", "w") as f:
        json.dump(notebook, f, indent=1)

if __name__ == "__main__":
    run_week1()
