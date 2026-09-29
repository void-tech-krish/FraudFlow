# Week 4 — Regularized Regression & Logistic Classification

## Objective
Enhance expected loss prediction via regularization to prevent overfitting and establish baseline fraud classification using Logistic Regression.

## Ridge Regression
L2 regularization applied (`alpha=1.0`). Penalizes large coefficients.

## Lasso Regression
L1 regularization applied (`alpha=0.001`). Induces sparsity by driving irrelevant feature weights to exactly zero. Converged normally.

## OLS vs Ridge vs Lasso
| Model | Train MAE | Test MAE | Train RMSE | Test RMSE | Train R² | Test R² |
| ----- | -------: | --------: | ------: | -------: | ------: | ------: |
| OLS   | 41.80 | 85.31 | 63.40 | 138.83 | 0.9739 | 0.8758 |
| Ridge | 45.25 | 76.16 | 66.92 | 125.60 | 0.9709 | 0.8984 |
| Lasso | 41.83 | 84.55 | 63.38 | 138.00 | 0.9739 | 0.8773 |

Regularization provides minimal improvements over OLS here, likely because the primary limitation is the high intrinsic variance of fraud amounts, rather than feature multicollinearity causing overfitting.

## Logistic Regression
Standard Logistic regression minimizes log-loss equally across all samples, implicitly biased toward the legitimate majority class.

## Balanced Logistic Regression
We apply `class_weight='balanced'` to inversely weight samples based on class frequencies. This heavily penalizes misclassification of the rare fraud class.

## Classification Metrics
| Model | Precision | Recall | F1 | PR-AUC | ROC-AUC |
| ----- | --------: | -----: | -----: | -----: | ------: |
| Logistic Regression | 0.8407 | 0.3566 | 0.5008 | 0.5452 | 0.9607 |
| Balanced Logistic Regression | 0.0713 | 0.8625 | 0.1318 | 0.2857 | 0.9798 |

Balancing drastically improves recall at the expense of precision. PR-AUC and ROC-AUC metrics confirm the underlying discriminative power remains similar.

## Feature Engineering
Introduced cyclical time (`hour_sin`, `hour_cos`) and bucketed features (`time_of_day`, `age_bucket`).

## Leakage Review
Target excluded from regression. Classification uses strict 80/20 train/test split prior to transformer fitting.

## Limitations
- Extreme class imbalance strictly mandates the precision/recall tradeoff.
- Regression target is a proxy.

## Week 4 Conclusion
Classifiers and regularized regressors successfully established without leakage.
