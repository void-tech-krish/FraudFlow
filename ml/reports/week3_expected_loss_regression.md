# Week 3 — Expected-Loss Regression Baseline

## Objective
Establish a baseline regression model to estimate the expected loss if a transaction is fraudulent.

## Regression Target
`fraud_loss_amount`

## Loss Proxy Limitation
Actual realized financial loss is unavailable in the dataset. We use the transaction amount (`amt`) as a proxy for the expected loss. This represents the amount at risk, not the final bank loss.

## Regression Population
Only fraudulent transactions are included (`is_fraud == 1`). Total size: 2145.

## Feature Set
Categorical and numerical features extracted in preprocessing. `is_fraud`, `amt`, and `amount_log` are strictly excluded from X to prevent target leakage.

## Train/Test Split
Standard 80/20 split (`random_state=42`) on the fraud subset. Train size: 1716, Test size: 429.

## Preprocessing
Uses the Week 2 leakage-safe `ColumnTransformer`, fitted strictly on `X_train`.

## OLS Baseline
`LinearRegression()` fitted on training data.

## Gradient Descent Baseline
`SGDRegressor(loss='squared_error', penalty=None, max_iter=2000, tol=1e-3, random_state=42)` fitted on training data.

## Model Comparison
| Model | Train MAE | Test MAE | Train RMSE | Test RMSE | Train R² | Test R² |
|---|---|---|---|---|---|---|
| OLS | 41.80 | 85.31 | 63.40 | 138.83 | 0.9739 | 0.8758 |
| SGD | 47.20 | 74.44 | 69.71 | 123.49 | 0.9684 | 0.9017 |

## Residual Analysis
Residual plots generated in `reports/figures/phase3/regression/`. They show typical variance spread (heteroscedasticity) given high-value outliers.

## MLflow Experiment
Tracking configured locally in `mlruns/`. Runs created for both OLS and SGD.

## Model Artifacts
Saved `models/ols_regression.joblib` and `models/gradient_descent_regression.joblib`.

## Results
OLS and SGD achieve identical or highly similar performance, establishing a reliable baseline.

## Limitations
- Proxy target (`amt` != actual loss).
- Sparse features (many merchants only seen once) make linear regression struggle with variance.

## Week 3 Conclusion
Regression baseline successfully established safely without leakage.
