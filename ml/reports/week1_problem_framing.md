# FraudFlow Week 1 — Problem Framing

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
