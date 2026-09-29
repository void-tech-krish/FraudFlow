# Week 4 — Feature Engineering Review

## Existing Features Reviewed
- `transaction_hour`, `transaction_day`, `transaction_month`, `transaction_day_of_week`, `is_weekend`: Retained. Extremely useful for identifying temporal fraud trends.
- `customer_age`: Retained.
- `merchant_distance`: Retained. Leakage safe, valid Haversine calculation.
- `amount_log`: Retained. Crucial for handling extreme transaction values.

## New Features Added
- `hour_sin` / `hour_cos`: Cyclical encoding of `transaction_hour`. Solves the discontinuity between 23:00 and 00:00.
- `time_of_day`: Categorical bucketing (Night, Morning, Afternoon, Evening). Captures non-linear behavioral shifts.
- `age_bucket`: Categorical bucketing of `customer_age` (<25, 25-40, 40-60, 60+).

## Features Rejected
- **Velocity features (transactions per window)**: Rejected. Deriving these across the entire flat file implies peeking into future transactions (target leakage) or requires complex sequential windowing not supported by the current standard pipeline structure.

## Leakage Checks
All added features (`hour_sin`, `hour_cos`, `time_of_day`, `age_bucket`) depend solely on point-in-time transaction details (`trans_date_trans_time` and `dob`). They contain zero future information and zero target leakage.

## Final Feature List Update
The newly engineered features are processed by the existing pipeline (numerics scaled, categoricals one-hot encoded).
