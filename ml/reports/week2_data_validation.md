# Week 2 — Data Cleaning & Validation

## Dataset Validation
- **Rows**: 555719
- **Columns**: 23
- **Target**: `is_fraud`
- **Known fraud count**: 2145
- **Known non-fraud count**: 553574
- **Missing values**: 0 total
- **Duplicate rows**: 0

## Amount Validation
- **Min**: 1.00
- **Max**: 22768.11
- **Mean**: 69.39
- **Median**: 47.29
- **99.9th percentile**: 1572.72
- **Zero/Negative amounts**: 0

## Merchant Validation
- **Unique merchants**: 693
- **Missing merchants**: 0
- **Handling**: High cardinality. The preprocessing pipeline uses `OneHotEncoder(handle_unknown='ignore')` which safely handles unseen merchants in test/validation data.

## Device Availability
No dedicated device identifier/feature is available in `fraudTest.csv`. We do not invent a device feature.

## Velocity Availability
The dataset lacks explicit velocity features (e.g., transactions per hour per user). Due to strict leakage requirements (transactions must not use future data or risk target leakage if engineered improperly from this flat file), we validate its absence but do not fabricate one.

## Geographic Validation
- **Latitude range**: 20.0271 to 65.6899 (Valid: -90 to 90)
- **Longitude range**: -165.6723 to -67.9503 (Valid: -180 to 180)
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
