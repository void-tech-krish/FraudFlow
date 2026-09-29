# Week 8 -- XGBoost + Early Stopping + SHAP Explainability

## 1. Objective
Train an XGBoost classifier for fraud detection, use early stopping driven by an internal
validation split, handle severe class imbalance via `scale_pos_weight`, evaluate on the
untouched test set, and generate SHAP explanations to understand model decisions.

## 2. Dataset and Split
- **Raw file**: `data/raw/fraudTest.csv` -- shape (555719, 23) (not modified)
- **Features after engineering**: 26 columns
- **Canonical split**: 80/20 stratified, `random_state=42`
  - Train: 444,575 rows | Fraud: 1716 (0.3860%)
  - Test:  111,144 rows  | Fraud: 429 (0.3860%)

## 3. Class Imbalance
Fraud prevalence is approximately 0.3860% -- extreme positive-class minority.
The `scale_pos_weight` parameter compensates by weighting each fraud sample more heavily.

## 4. scale_pos_weight
Calculated **exclusively from the internal training sub-set** (never from test data):

```
neg_count (legit, internal train) = 354,287
pos_count (fraud, internal train) = 1,373
scale_pos_weight = 354287 / 1373 = 258.038602
```

## 5. XGBoost Configuration
```python
XGBClassifier(
    objective="binary:logistic",
    eval_metric="aucpr",
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=6,
    min_child_weight=5,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.0,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    tree_method="hist",
    scale_pos_weight=258.038602,
    early_stopping_rounds=50,
)
```

## 6. Internal Validation Split
To avoid touching the test set during early stopping:

```
Training data (444,575 rows)
    +-- Internal train: 355,660 rows (80%)
    +-- Internal val:   88,915 rows  (20%)
```

Both splits are stratified (`random_state=42`) to preserve the ~0.39% fraud rate.

## 7. Early Stopping Methodology
- `early_stopping_rounds=50`: training halts if validation `aucpr` does not
  improve for 50 consecutive rounds.
- `eval_set=[(X_int_train, y_int_train), (X_int_val, y_int_val)]` -- internal sets only.
- The final test set is completely withheld.

## 8. Best Iteration
| Attribute | Value |
|-----------|-------|
| Best iteration (0-indexed) | **992** |
| Trees used after early stopping | **993** |
| Best validation PR-AUC | **0.925929** |

## 9. Final Test Metrics (threshold = 0.5)
| Metric | Value |
|--------|-------|
| Accuracy | 0.998659 |
| Precision | 0.772374 |
| Recall | 0.925408 |
| F1 | 0.841994 |
| **PR-AUC** (primary) | **0.945335** |
| ROC-AUC | 0.998546 |

## 10. Confusion Matrix Interpretation
| | Predicted Legit | Predicted Fraud |
|--|--|--|
| **Actual Legit** | TN = 110,598 | FP = 117 |
| **Actual Fraud** | FN = 32 | TP = 397 |

- **397 true positives**: fraud transactions correctly flagged.
- **32 false negatives**: fraud missed -- the primary concern in fraud detection.
- **117 false positives**: legitimate transactions incorrectly flagged for review.
- **110,598 true negatives**: legitimate transactions correctly cleared.

## 11. PR-AUC Interpretation
PR-AUC = **0.9453** is the primary metric. For a dataset with only
0.3860% fraud, a naive "predict all legitimate" classifier would achieve
PR-AUC ~= 0.0039. The XGBoost model achieves 0.9453,
indicating strong ability to rank fraud transactions highly.

## 12. SHAP Methodology
- **Explainer**: `shap.TreeExplainer` (exact tree SHAP, no approximation)
- **Sample**: 5,000 rows randomly sampled from the test set (`random_state=42`)
- **Features**: the 3023 transformed pipeline features
  (scaled numerics + one-hot-encoded categoricals; feature names sanitized to
  remove XGBoost-forbidden characters: `[`, `]`, `<`)
- **Output**: mean absolute SHAP values per feature across all explained rows

## 13. Top SHAP Features (Actual Results)
  1. `amt` -- mean |SHAP| = 3.629145
  2. `unix_time` -- mean |SHAP| = 0.899255
  3. `hour_cos` -- mean |SHAP| = 0.790506
  4. `amount_log` -- mean |SHAP| = 0.765749
  5. `city_pop` -- mean |SHAP| = 0.631757
  6. `customer_age` -- mean |SHAP| = 0.619114
  7. `transaction_day` -- mean |SHAP| = 0.460107
  8. `lat` -- mean |SHAP| = 0.432556
  9. `transaction_hour` -- mean |SHAP| = 0.373688
  10. `long` -- mean |SHAP| = 0.325123

## 14. Model Comparison
PR-AUC is highlighted as the **primary metric** for this fraud-detection task.

| Model | Precision | Recall | F1 | **PR-AUC** | ROC-AUC |
|-------|-----------|--------|----|-----------|---------|
| Logistic Regression | 0.8462 | 0.1538 | 0.2604 | **0.4444** | 0.8764 |
| Logistic Regression (Balanced) | 0.0506 | 0.8741 | 0.0956 | **0.2352** | 0.9765 |
| Decision Tree | 0.1470 | 0.9068 | 0.2530 | **0.4080** | 0.9266 |
| Random Forest | 0.0787 | 0.9044 | 0.1448 | **0.6488** | 0.9747 |
| XGBoost (Week 8) | 0.7724 | 0.9254 | 0.8420 | **0.9453** | 0.9985 |

> Note: Logistic Regression metrics are from Phase 3 (different pipeline version).
> All tree-model metrics use the canonical Week 8 pipeline configuration.

## 15. Leakage Checks
| Check | Status |
|-------|--------|
| `is_fraud` not in features | CONFIRMED (dropped before split) |
| `fraud_loss_amount` not in features | CONFIRMED (asserted at runtime) |
| Test data not used in training | CONFIRMED: only X_int_train/X_int_val used for model.fit() |
| Test data not used for early stopping | CONFIRMED: eval_set uses internal splits only |
| `scale_pos_weight` from training data only | CONFIRMED: computed from y_int_train |
| Preprocessor fitted on training data only | CONFIRMED: preprocessor.fit_transform(X_train) |
| No threshold tuning | CONFIRMED: fixed at 0.5 |
| No Week 9/10+ work | CONFIRMED: scope restricted to Week 8 |

## 16. Reproducibility
- All random operations use `random_state=42`
- XGBoost `random_state=42` + `tree_method="hist"` ensures deterministic training
- SHAP sample drawn with `random_state=42`
- Pipeline seeded via scikit-learn's `random_state` parameter

## 17. Limitations
- XGBoost predictions outside training distribution bounds may degrade
- SHAP computed on 5,000 test rows (not the full ~111K) for computational feasibility
- No threshold optimization (reserved for Week 10)
- Model is a black-box; SHAP provides post-hoc, not causal, explanations
- `fraud_loss_amount` is a **regression proxy target** from earlier weeks and is
  explicitly excluded from the classification feature set
