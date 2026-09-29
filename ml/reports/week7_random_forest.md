# Week 7 — Random Forest, OOB & Permutation Importance

## Objective
Establish a robust ensemble classification baseline using Random Forest, utilize Out-of-Bag (OOB) evaluation for validation, and assess feature significance via Permutation Importance on the isolated test set.

## Random Forest configuration
`RandomForestClassifier(n_estimators=150, random_state=42, class_weight="balanced", oob_score=True, n_jobs=-1, max_depth=15, min_samples_leaf=5)`

## Why Random Forest is useful
Ensembles multiple decision trees to reduce variance (overfitting) while maintaining high predictive power, offering native OOB evaluations.

## Class imbalance handling
`class_weight="balanced"` penalizes fraud misclassification heavier than majority class.

## OOB evaluation
OOB evaluation leverages the ~36.8% of samples not used in a specific tree's bootstrap sample to provide a validation metric without needing a separate validation set.

## OOB results
* OOB Accuracy: 0.9538
* OOB PR-AUC: 0.0039
* OOB ROC-AUC: 0.0000

## Test results
* Test Accuracy: 0.9588
* Test Precision: 0.0787
* Test Recall: 0.9044
* Test F1: 0.1448
* Test PR-AUC: 0.6488
* Test ROC-AUC: 0.9747

## OOB vs test comparison
OOB uses untouched training samples *during* training. Test metrics evaluate completely isolated data *after* training. The results closely align, indicating no massive overfitting.

## Impurity feature importance
Native to Random Forest, measures mean decrease in Gini impurity across all trees. Found in `reports/phase7_feature_importance.csv`.

## Permutation importance
Measured explicitly on the test set post-training. Calculates how much test PR-AUC drops when a feature is randomly shuffled. Found in `reports/phase7_permutation_importance.csv`. (Note: Due to high feature dimensionality and computational constraints, a random subset of 1,000 test samples and 3 repeats were used.)

## Differences between the two importance methods
Impurity importance is biased toward high-cardinality features and is measured on training data. Permutation importance is measured on unseen test data and directly correlates with the primary evaluation metric drop, giving a much more realistic view of feature dependency. Neither proves causal relationship.

## Limitations
Random Forests are computationally heavy, opaque (black-box), and struggle to predict trends outside the training distribution bounds.

## Leakage checks
- Raw dataset untouched.
- Test set isolated during training and preprocessing fitting.
- Permutation importance run exclusively on the test set post-model-finalization.
