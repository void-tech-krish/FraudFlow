# FraudFlow

A machine-learning system that detects fraudulent credit-card transactions and later provides a real-time fraud risk score.

## Problem

Credit-card fraud is a highly imbalanced classification problem where fraudulent transactions represent a very small fraction of total transactions.

## Dataset

Sparkov-simulated credit-card transaction dataset.

Dataset file:
`data/raw/fraudTest.csv`

## Current Phase

Phase 1 — Data Foundation and Exploratory Analysis.

## Planned ML Pipeline

Data → Preprocessing → Feature Engineering → Baseline → Random Forest → XGBoost → Evaluation → Explainability → Real-Time Fraud Scoring

## Planned Evaluation

Precision, Recall, F1, PR-AUC, ROC-AUC and confusion matrix.

## Project Structure

- `data/`: Contains raw and processed data.
- `notebooks/`: Jupyter notebooks for data exploration.
- `src/`: Source code for the project, including data loading and preprocessing.
- `tests/`: Unit tests.
- `reports/`: Contains generated figures and reports.

## How to Run

1. **Create virtual environment**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Install requirements**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Run the data validation script**
   ```powershell
   python src/preprocessing/basic_checks.py
   ```

4. **Run tests**
   ```powershell
   pytest tests/
   ```

5. **Open Jupyter Notebook**
   ```powershell
   jupyter notebook notebooks/01_data_exploration.ipynb
   ```

## Phase 2 � Feature Engineering

**Excluded Identifiers:** id, cc_num, first, last, street, trans_num are excluded from the model to prevent data leakage and overfitting.
**Datetime Features:** Extracted 	ransaction_hour, transaction_day, transaction_month, transaction_day_of_week, is_weekend from 	rans_date_trans_time before dropping it.
**Customer Age:** Extracted customer_age using dob and transaction date. 
**Merchant Distance:** Created merchant_distance using Haversine distance from customer and merchant coordinates.
**Amount Transformation:** Added mount_log using log1p on transaction amount.
**Categorical Encoding:** We use a scikit-learn ColumnTransformer with OneHotEncoder(handle_unknown='ignore') applied solely on the categorical columns.
**Train/Test Split:** Implemented a reusable stratified split function (80/20) ensuring identical class distribution and keeping test data untouched during preprocessing.
**Leakage Prevention:** 
- The target is_fraud is strictly excluded from X.
- The raw dataset is loaded via a copy; the original file remains untouched.
- ColumnTransformer is fitted *only* on the training split.
**Why SMOTE is not yet applied:** Oversampling will be evaluated strictly on the training set during the final model pipeline to prevent data leakage and over-optimistic test evaluation. The test set maintains the true highly imbalanced distribution.

## Phase 3 � Logistic Regression Baseline

Logistic Regression is used as the baseline because it provides a strong, interpretable foundation for binary classification before moving to complex tree-based models. In fraud detection, class imbalance is extreme (fraud represents ~0.38% of this dataset). Accuracy is therefore misleading, which is why we evaluate Precision, Recall, F1, PR-AUC, and ROC-AUC. 

We trained two models:
1. **Normal Logistic Regression**: Weights all samples equally.
2. **Class-Weighted Logistic Regression (class_weight='balanced')**: Heavily penalizes misclassifications on the minority fraud class.

**Why PR-AUC?** PR-AUC (Average Precision) focuses strictly on the positive (fraud) class, making it the most reliable single metric for highly imbalanced datasets compared to ROC-AUC, which can be inflated by the massive number of True Negatives.

- **Trained Models**: Saved in the models/ directory as logistic_regression_baseline.joblib and logistic_regression_balanced.joblib.
- **Evaluation Reports**: Metrics are saved in 
eports/phase3_metrics.json, and ROC/PR-AUC/Confusion Matrix plots are stored in 
eports/figures/phase3/.

## Phase 4 � Decision Tree and Random Forest

In Phase 4, we evaluate tree-based models capable of capturing non-linear relationships. We use class-weighting instead of resampling to handle the severe class imbalance and avoid generating large dense arrays for efficiency.

**Configurations:**
- **Decision Tree**: max_depth=12, min_samples_leaf=10, class_weight='balanced'.
- **Random Forest**: 150 estimators, max_depth=15, min_samples_leaf=5, class_weight='balanced', with OOB scoring enabled.

**Important findings:**
- The Random Forest achieves significantly better Precision (~11.8%) and PR-AUC (~69.9%) compared to the Decision Tree and the balanced Logistic Regression, while maintaining a strong Recall (~76%).
- Feature Importance shows that transaction amount (e.g., mount_log, mt), transaction timing (	ransaction_hour), and merchant categories (category) are dominant indicators of fraud.
- Random Forest Permutation Importance, which evaluates actual performance drops on a 20k validation subset when features are shuffled, confirms that category, mt, and 	ransaction_hour carry the highest predictive power in this dataset. Permutation importance is a safer metric than the built-in impurity-based importance for identifying actual predictive impact on the test set.

**Model Artifacts:**
- models/decision_tree.joblib
- models/random_forest.joblib
- Generated metrics and importance tables can be found in 
eports/.


## Phase 5 - Cross Validation

**Methodology:**
- Implemented 3-fold Stratified Cross-Validation on the training data only. 
- The test set was intentionally left completely untouched to prevent data leakage and provide an unbiased final evaluation.

**Models Evaluated:**
- Logistic Regression
- Class-Weighted (Balanced) Logistic Regression
- Decision Tree
- Random Forest

**Metrics:**
Evaluated Precision, Recall, F1, PR-AUC, ROC-AUC, and Accuracy for each fold. We continue to use PR-AUC (Average Precision) as our primary metric due to extreme class imbalance.

**Honest Baseline:**
We created a naïve baseline that simply predicts every transaction as non-fraud (legitimate).
- Accuracy: 99.61%
- Precision: 0.0
- Recall: 0.0
- F1: 0.0
- Fraud Prevalence: ~0.386%
This confirms that accuracy is a misleading metric for this dataset.

**Decision Tree Depth Experiment and One-SE Rule:**
We evaluated Decision Tree models with max_depth set to 6, 9, and 12. 
- Depth 6 PR-AUC: ~0.2117
- Depth 9 PR-AUC: ~0.2382
- Depth 12 PR-AUC: ~0.3785
Using the One-Standard-Error rule on PR-AUC, we selected the simplest model whose mean performance was within one standard error of the highest-performing tree. The best mean PR-AUC was 0.3785 (Depth 12) with a standard error of 0.0052. The threshold was 0.3734. The simplest depth meeting this threshold is Depth 12.

**Limitations and Tradeoffs:**
Cross-validation provides a robust estimate of model stability across folds but increases computational cost significantly compared to a single train-validation split. The hyperparameter search was limited to a few specific tree depths to conserve resources.

## Phase 7 — Fraud Pattern Clustering & Segmentation

**Methodology:**
- We implemented clustering techniques (K-Means and DBSCAN) on behavioral transaction features to discover latent fraud patterns and transaction segments.
- Features included numerical indicators such as transaction amount, hour, geographic coordinates, and merchant distance. High-cardinality identifiers were excluded.
- The features were standardized using StandardScaler and reduced using PCA (Principal Component Analysis). All transformations were fitted **strictly on the training dataset** to prevent data leakage, and original raw files remained unmodified.

**Models Evaluated:**
- **K-Means:** Evaluated across k=2 through k=8 using Inertia and Silhouette scores. K=4 was selected based on diagnostic tradeoffs and interpretability.
- **DBSCAN:** Evaluated for alternative density-based clustering, but K-Means was preferred as the primary segmentation method because it provides a native predict method for unseen test samples.

**Results:**
- Generated cluster profiles detailing the size, average transaction amount, and fraud rate per segment.
- The resulting K-Means segment label is designed to be a reusable feature for downstream models.
- Note: Clustering is descriptive and exploratory. The discovered segments do not definitively "cause" fraud, nor were they optimized using test set labels.

## Week 1 — Problem Framing
- **Fraud classification target:** is_fraud (0 = legitimate, 1 = fraud). Highly imbalanced (0.386% prevalence).
- **Expected loss regression target:** raud_loss_amount.
- **Loss proxy limitation:** mt is used as a proxy for fraudulent transactions because true financial loss is unavailable.
- **Dataset statistics:** 555,719 transactions (2,145 fraud).
- **Initial EDA:** Generated distribution plots, hour/category analysis, and amount comparisons.
- **Irreducible-error floor framing:** Estimated qualitatively due to unobserved signals, noisy labels, and adversarial adaptation. No numerical estimate is invented.
- **Week 1 limitations:** True loss and intent are unknown; mt is only a proxy.

## Week 2 — Data Cleaning & Validation
- **Dataset Validation:** Confirmed 555,719 rows, 23 columns. Binary target is_fraud.
- **Amount Validation:** Statistically analyzed. Outliers retained as they represent potential fraud.
- **Merchant Validation:** High cardinality safely handled using OneHotEncoder(handle_unknown='ignore').
- **Device & Velocity:** No dedicated identifiers exist in the raw dataset. Velocity excluded to maintain strict leakage-safety.
- **Geographic Validation:** Coordinates within valid physical limits (-90 to 90 lat, -180 to 180 long).
- **Missingness:** Zero missing values.
- **Leakage Audit:** All retained features are point-in-time metrics. Data split before scaling/encoding.
- **Preprocessing Pipeline:** Numerics isolated to StandardScaler, categoricals to OneHotEncoder. Fitted strictly on train set.
- **ZIP Treatment:** ZIP code re-casted from numerical to string for proper categorical representation.

## Week 3 — Expected-Loss Regression Baseline
- **Regression objective:** Estimate expected loss if a transaction is fraudulent.
- **Target/Proxy:** mt (proxy for financial loss).
- **Regression population:** Fraudulent transactions only (is_fraud=1).
- **Models:** OLS Linear Regression and Gradient Descent (SGDRegressor).
- **Evaluation:** MAE, RMSE, R².
- **MLflow:** Local tracking implemented (mlruns.db).
- **Artifacts:** ols_regression.joblib and gradient_descent_regression.joblib saved.
- **Limitations:** Extreme variance in transaction amounts limits linear model accuracy. The target is a proxy.

## Week 4 — Regularized Models & Logistic Classification
- **Ridge/Lasso:** L2 and L1 regularization applied to expected loss baseline.
- **Classification:** Standard and Balanced Logistic Regression models trained on all transactions.
- **Feature Engineering:** Added cyclical time encoding (hour_sin, hour_cos) and categorical bucket features (	ime_of_day, ge_bucket).
- **Evaluation:** Evaluated regression metrics and classification metrics (Precision, Recall, F1, PR-AUC, ROC-AUC).
- **Leakage:** Strict point-in-time calculation preserved.

## Week 5 — Cross-Validation & Honest Baseline
- **CV Methodology:** 3-fold StratifiedKFold. Primary metric: PR-AUC. Test-set rigorously isolated.
- **Decision Tree Depth:** Evaluated depths 6, 9, 12, Random Forest, Logistic Regression.
- **One-SE Rule:** Applied to select the simplest model within 1 std error of the best (Random Forest was unequivocally best and selected).
- **Honest Baseline:** Predicts majority class. Zero precision/recall; accurately reflects null-hypothesis performance.

## Week 6 — Decision Tree
- **Model:** DecisionTreeClassifier(random_state=42, class_weight='balanced', max_depth=12, min_samples_leaf=10)
- **Class Imbalance:** Handled natively via class_weight='balanced', boosting recall.
- **Evaluation:** Precision: 0.1470, Recall: 0.9068, F1: 0.2530, PR-AUC: 0.4080, ROC-AUC: 0.9266.
- **Insights:** Top features heavily leverage temporal/categorical variables. See 
eports/figures/phase6 for visualizations.

## Week 7 � Random Forest, OOB & Permutation Importance
- **Model:** RandomForestClassifier(n_estimators=150, random_state=42, class_weight='balanced', oob_score=True, n_jobs=-1, max_depth=15, min_samples_leaf=5)
- **Class Imbalance:** Handled via class_weight='balanced', ensuring minority-class misclassification is penalized proportionally.
- **OOB Evaluation:** Out-of-Bag samples (~36.8% of training data per tree) used as a free internal validation set. OOB Accuracy: 0.9538. Note: OOB PR-AUC/ROC-AUC reflect degenerate behavior on the OOB fold under extreme class imbalance (0.386% fraud); the OOB decision function assigns near-zero probability to the minority class on OOB folds.
- **Test Evaluation (threshold=0.5):** Accuracy=0.9588, Precision=0.0787, Recall=0.9044, F1=0.1448, PR-AUC=0.6488, ROC-AUC=0.9747.
- **Impurity Feature Importance:** amount_log, amt, hour_cos, transaction_hour dominate. Saved to reports/phase7_feature_importance.csv.
- **Permutation Importance (PR-AUC decrease):** amt and amount_log are the top two features. Permutation run on 1,000-sample test subset with n_repeats=3. Saved to reports/phase7_permutation_importance.csv.
- **Leakage Checks:** Raw dataset untouched (555,719 x 23). Preprocessor fit on training data only. Test set isolated throughout. No threshold tuning performed.
- **Artifacts:** models/random_forest_week7.joblib, reports/phase7_metrics.json, reports/figures/phase7/.


## Week 9 -- Fraud-Pattern Segmentation: K-Means + DBSCAN + PCA

### Objective
Discover transaction-behaviour segments using unsupervised learning.
Segment labels prepared as reusable, leakage-safe features for downstream models.

### Segmentation Features (16 features)
amt, amount_log, transaction_hour, transaction_day, transaction_month,
transaction_day_of_week, is_weekend, customer_age, merchant_distance,
lat, long, merch_lat, merch_long, city_pop, hour_sin, hour_cos.
is_fraud and fraud_loss_amount explicitly excluded.

### K-Means Methodology
- StandardScaler fitted on training population (444,575 rows) only.
- PCA applied: 11 components capturing >94% variance.
- Candidate K: 2, 3, 4, 5, 6. Selection by silhouette score.

### Candidate K Values (Actual Results)
K=2: inertia=5,981,064 silhouette=0.1402 (SELECTED)
K=3: inertia=5,458,479 silhouette=0.1249
K=4: inertia=5,060,632 silhouette=0.1266
K=5: inertia=4,793,952 silhouette=0.1148
K=6: inertia=4,519,620 silhouette=0.1167

### Selected K: 2
- K-Means Silhouette: 0.1402
- K-Means Inertia: 5,981,064
- Cluster sizes: {0: 124,270 | 1: 320,305}
- Moderate silhouette reflects diffuse nature of transactional behavioral data.

### DBSCAN Results (eps=1.0, min_samples=5)
- Evaluated on 20,000-row reproducible subset (random_state=42)
- Clusters: 43 | Noise: 98.5% | Silhouette: 0.3715
- High noise reflects diffuse density in PCA-reduced space.

### PCA Findings
- PC1: 0.1295 (12.95%), PC2: 0.1252 (12.52%)
- Cumulative PC1+PC2: 0.2547 (25.47%)
- Components for 90% variance: 11

### Segment Fraud-Rate Analysis
Cluster 0: N=124,270 | fraud_rate=0.0041 | mean_amt=.67
Cluster 1: N=320,305 | fraud_rate=0.0038 | mean_amt=.27
Overall training fraud rate: 0.0039 (0.386%)

### Leakage Safeguards
- is_fraud NOT used for clustering (verified at runtime and in tests)
- fraud_loss_amount NOT used (verified at runtime and in tests)
- Scaler fitted ONLY on training rows
- Test set not used during fit
- No Week 10 threshold tuning performed

### Artifacts
- models/kmeans_week9.joblib
- models/segmentation_scaler_week9.joblib
- models/dbscan_week9.joblib
- reports/phase9_clustering_metrics.json
- reports/phase9_segment_summary.csv
- reports/week9_clustering.md
- reports/figures/phase9/ (7 figures)


## Week 10 -- Cost-Aware Fraud Decision Optimization

### Objective
Cost-aware decision optimization is necessary to balance the operational waste of false positives against the direct financial loss of false negatives. We explicitly optimize a decision threshold to minimize total monetary cost.

### Cost Framework
- **False Positives (FP)**: Configured operational cost of \.00 per FP representing manual review, customer friction, or decline cost.
- **False Negatives (FN)**: Monetary fraud loss. If raud_loss_amount is unavailable, transaction mt is used as the proxy.
- **Expected Monetary Cost**: Total cost = (FP count * \.00) + Sum(FN raud_loss_amount).

### Model Comparison (Validation Set)
| Model | PR-AUC | Precision | Recall | F1 | Expected Cost | FP | FN |
|-------|--------|-----------|--------|----|---------------|----|----|
| XGBoost | 0.9259 | 0.4554 | 0.9387 | 0.6133 | \,937.68 | 385 | 21 |
| Logistic Regression | 0.3209 | 0.1770 | 0.8483 | 0.2929 | \,909.60 | 1353 | 52 |
| Decision Tree | 0.4409 | 0.3352 | 0.8600 | 0.4824 | \,341.09 | 585 | 48 |
| Random Forest | 0.6594 | 0.2405 | 0.8513 | 0.3750 | \,203.73 | 922 | 51 |

### Threshold Optimization
- **Search Range**: 0.01 to 0.99 (step 0.01).
- **Methodology**: Evaluated thresholds solely on an internal 20% validation split from the training dataset.
- **Selected Threshold**: 0.11 (XGBoost).
- **Expected Validation Cost**: \,937.68.

### Calibration
Calibration is assessed via the Brier Score.
- **XGBoost**: 0.0011 (Highly calibrated)
- **Decision Tree**: 0.0182
- **Logistic Regression**: 0.0305
- **Random Forest**: 0.0831
Because XGBoost's uncalibrated output produced an extremely low Brier score and a well-optimized threshold, no artificial post-calibration scaling was strictly necessary, and the uncalibrated probability predictions were retained.

### Final Test Results (Untouched Test Set)
Evaluated purely out-of-sample:
- **PR-AUC**: 0.9453
- **Precision**: 0.4865
- **Recall**: 0.9627
- **F1**: 0.6463
- **False Positives**: 436
- **False Negatives**: 16
- **False Positive Cost**: \,180.00
- **False Negative Loss**: \,107.64
- **Total Expected Cost**: \,287.64

### Leakage Safeguards
- **is_fraud**: Explicitly excluded from all model predictive features. Checked via assertions.
- **fraud_loss_amount**: Explicitly excluded from features.
- **Test Set Safety**: Test data was completely isolated and not used for threshold sweeping, calibration, or internal validation calculations.



## Week 11 -- Model Explainability & Fraud Decision Insights

### Objective
Provide deep transparency into the production XGBoost model without degrading performance or rebuilding pipelines. The goal is to mathematically map feature values directly to probability shifts (SHAP values) so stakeholders and operations teams can trust, audit, and interpret both high-level strategies and individual transaction flags.

### Method
- **Explainer**: \shap.TreeExplainer\ applied directly against the trained XGBoost model (binary logistic loss).
- **Sample Strategy**: Explanations were drawn deterministically from a 5,000-row stratified random sample isolated in the pre-defined test set.
- **Output Space**: Log-odds margin.

### Global Feature Importance
The absolute magnitude of SHAP contributions across the validation sample consistently ranks the features that drive the largest swings in fraud probability.

1. **merchant_distance** (Mean \|SHAP\|: ~1.2)
2. **amount_log**
3. **amt**
4. **transaction_hour**
5. **city_pop**

*Note: SHAP distributes credit fairly across correlated features. Features like \mt\ and \mount_log\ both receive high importance.*

### Local Explainability & Consistency
Every transaction explanation is mathematically proven:
\Base Value + Sum(SHAP Values) == Model Margin Output (Log-Odds)
- **High-Risk Transaction**: Predicted well above the 0.11 operational threshold. Major contributors typically include massive physical separation (\merchant_distance\) and abnormally large transaction amounts.
- **Low-Risk Transaction**: Legitimate transactions firmly anchored below the threshold by routine locations, small values, and typical timing.
- **Borderline Transaction**: Transactions exactly on the 0.11 threshold wire, where opposing features completely neutralize each other (e.g., high merchant distance offset completely by a remarkably small transaction amount).

### Leakage Safeguards
- \is_fraud\ explicitly excluded from all SHAP explanation matrices.
- \raud_loss_amount\ explicitly excluded from all explanation features.
- No ground truth labels were supplied to the explainer logic at any point. Feature importance rests solely on the model's learned mathematical function (x)$.

### Limitations
1. **Not Causal**: Explainability metrics define correlation to risk as modeled by XGBoost, not real-world causation.
2. **Local vs Global Variance**: A top global feature (e.g., \merchant_distance\) might mathematically contribute nothing to a specific localized transaction if the merchant was local.

### Testing
- **Week 11 Tests**: 100% Passed. Checked mathematical tolerance (<1e-4) on SHAP reconstruction and isolated feature audits.
- **Full Suite**: 176 Passed. Zero regressions recorded against Weeks 1–10.



## Week 12 -- Model Monitoring, Data Drift & Performance Degradation Detection

### Objective
Maintain production integrity of the frozen Week 8 XGBoost model by deploying a monitoring pipeline to detect input feature distribution drift, probability distribution shifts, and downstream financial/performance decay when ground-truth labels arrive.

### Monitoring Architecture
- **Reference Window**: A fixed, documented 20,000-row sample from the canonical training dataset.
- **Current Window**: A 20,000-row sample representing incoming latest data.
- **Data Quality**: Validates structural integrity (missing columns, null percentages) before executing mathematical drift checks.
- **Feature Drift**: Uses Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) tests to quantify distributional shifts on individual numerical and categorical features.
- **Prediction Drift**: Employs the KS test on the output probabilities \P(Y=1|X)\ to detect bulk shifting in decisioning.

### Label-Based Performance Monitoring
Operates seamlessly across two modes:
- **Unlabeled Mode**: Limits monitoring strictly to PSI, data quality, and distribution shifts when ground-truth labels are delayed.
- **Labeled Mode**: Calculates realized PR-AUC, Precision, Recall, and Confusion matrices once labels are definitively settled.

### Monetary Cost Monitoring
Tracks exactly how much the model costs the business in production based on the predefined Cost Framework (Week 10):
\Total Cost = (FP * \.00) + Sum(FN fraud_loss_amount)
### Alert Engine
Triggers alerts using configurable threshold rules. Severity levels: \INFO\, \WARNING\, \CRITICAL\.
Categories:
- \DATA_QUALITY- \FEATURE_DRIFT- \PREDICTION_DRIFT- \PERFORMANCE_DEGRADATION- \COST_INCREASE
### Artifacts and Persistence
- eports/monitoring/latest_monitoring_report.json\: The detailed outcome of the current run.
- eports/monitoring/monitoring_history.jsonl\: Append-only structured log of all historical executions to avoid silent overwrites.
- eports/monitoring/feature_drift_report.csv\: Table of all features, their PSI, p-values, and assigned severity.
- eports/monitoring/figures/prediction_drift.png\: Visual histogram overlapping Reference vs. Current output probabilities.

### Leakage and Model Safety
- The Week 8 XGBoost model was preserved entirely unmodified.
- The Week 10 operational threshold (0.11) remained identical.
- Target variables \is_fraud\ and \raud_loss_amount\ were explicitly isolated and excluded from model inputs and drift processing.
- The pipeline does not support automated retraining or dynamic threshold tuning, enforcing human-in-the-loop ML operations.

### Testing
- **Week 12 Tests**: 100% Passed. Includes validations on PSI calculations and artifact structure.
- **Full Suite**: 180 Passed. Zero regressions introduced against Weeks 1–11.


## Production: FastAPI Serving & Retraining Trigger
### API Endpoints
- /health: Returns model loaded status and current threshold (locked at 0.11).
- /predict: Real-time sub-100ms inference endpoint. Applies preprocessing, evaluates XGBoost probability, and outputs approve/decline.

### Automated Retraining
- The scripts/retrain.py triggers an automated retraining simulation when eports/monitoring/latest_monitoring_report.json logs CRITICAL alerts (e.g. pr_auc_drop). Promotion of new models is gated pending human review.

 # #   G e t t i n g   S t a r t e d 
 
 # # #   1 .   E n v i r o n m e n t   S e t u p   ( B a c k e n d ) 
 
 \ \ \  a s h 
 #   C r e a t e   a   v i r t u a l   e n v i r o n m e n t 
 p y t h o n   - m   v e n v   . v e n v 
 
 #   A c t i v a t e   i t 
 #   O n   W i n d o w s : 
 . v e n v \ S c r i p t s \ a c t i v a t e 
 #   O n   L i n u x / M a c : 
 s o u r c e   . v e n v / b i n / a c t i v a t e 
 
 #   I n s t a l l   d e p e n d e n c i e s 
 p i p   i n s t a l l   - r   r e q u i r e m e n t s . t x t 
 \ \ \ 
 
 # # #   2 .   F r o n t e n d   S e t u p 
 
 \ \ \  a s h 
 c d   f r o n t e n d 
 n p m   i n s t a l l 
 n p m   r u n   d e v 
 \ \ \ 
 
 # # #   3 .   R u n n i n g   t h e   A P I 
 
 \ \ \  a s h 
 u v i c o r n   a p i . a p p : a p p   - - h o s t   0 . 0 . 0 . 0   - - p o r t   8 0 0 0   - - r e l o a d 
 \ \ \ 
 
 -   B a c k e n d   U R L :   h t t p : / / 1 2 7 . 0 . 0 . 1 : 8 0 0 0 
 -   S w a g g e r   U I :   h t t p : / / 1 2 7 . 0 . 0 . 1 : 8 0 0 0 / d o c s 
 -   F r o n t e n d   U R L :   h t t p : / / l o c a l h o s t : 5 1 7 3 
 
 E n v i r o n m e n t   V a r i a b l e s   ( F r o n t e n d   i n   \  r o n t e n d / . e n v \ ) : 
 \ V I T E _ A P I _ U R L = h t t p : / / 1 2 7 . 0 . 0 . 1 : 8 0 0 0 \ 
  
 