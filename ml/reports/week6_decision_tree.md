# Week 6 — Decision Tree

## Why Decision Tree is used
Provides strong baseline for non-linear modeling, easily handles mixed data types natively, and allows direct inspection of feature importance and decision boundaries.

## Model configuration
`DecisionTreeClassifier(random_state=42, class_weight='balanced', max_depth=12, min_samples_leaf=10)`
Depth is restricted to prevent massive overfitting. Leaves are restricted to ensure minimum node representation.

## Training data
444575 samples (1716 fraud instances). Split completely independently from test data.

## Test data
111144 samples (429 fraud instances). Remained completely untouched during CV, selection, and training.

## Class imbalance handling
We used `class_weight='balanced'`, which scales weight of each class inversely proportional to frequency, strongly penalizing false negatives.

## Evaluation metrics
* Accuracy: 0.9793
* Precision: 0.1470
* Recall: 0.9068
* F1 Score: 0.2530
* PR-AUC: 0.4080
* ROC-AUC: 0.9266

## PR-AUC interpretation
PR-AUC is 0.4080. This is the primary metric indicating how well the model discriminates fraud among positive predictions without being inflated by the massive count of true negatives.

## Confusion matrix interpretation
Matrix saved at `reports/figures/phase6/confusion_matrix.png`. The 'balanced' class weight ensures high recall (fewer False Negatives), but naturally induces more False Positives (lower precision).

## Feature importance
Extracted natively via `.feature_importances_`. Top features heavily split early in the tree, typically representing transactional velocity or extreme amounts. Documented in `reports/phase6_feature_importance.csv`. Note: feature importance represents split criterion usefulness, NOT causal probability.

## Comparison with Week 5
Week 5 CV (Depth 12) PR-AUC was ~0.591.
Week 6 Test PR-AUC is 0.4080.
*Note: CV score is a validation estimate; Week 6 is a true hold-out test.*

## Limitations
Decision trees remain prone to overfitting (even with depth limits), yield axis-aligned boundaries that can fail to capture diagonal relationships, and offer high variance (small data changes can alter tree structure heavily).

## Leakage Checks
- Raw dataset unmodified.
- Test set strictly excluded from `.fit()` in model and preprocessing.
- No future velocity variables included.
- `is_fraud` strictly dropped from `X`.
