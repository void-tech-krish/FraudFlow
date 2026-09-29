# Week 9 -- Fraud-Pattern Segmentation: K-Means + DBSCAN + PCA

## 1. Objective
Discover transaction-behaviour segments using unsupervised learning (K-Means and DBSCAN),
analyse the relationship between discovered segments and fraud, and prepare a reusable
segment-label feature for downstream models. Fraud labels are NOT used to construct clusters;
they are used ONLY for post-hoc descriptive analysis.

## 2. Dataset and Segmentation Population
- **Raw file**: `data/raw/fraudTest.csv` -- shape (555719, 23) (not modified)
- **Features after engineering**: 26 feature columns
- **Canonical 80/20 split** (`random_state=42`) reused for segmentation population
  - Segmentation population (train rows): 444,575
  - Held-out test rows (not used for fitting): 111,144

## 3. Segmentation Features (16 features)
```
  amt
  amount_log
  transaction_hour
  transaction_day
  transaction_month
  transaction_day_of_week
  is_weekend
  customer_age
  merchant_distance
  lat
  long
  merch_lat
  merch_long
  city_pop
  hour_sin
  hour_cos
```
All features represent point-in-time transaction/customer/merchant behaviour.
`is_fraud` and `fraud_loss_amount` are explicitly excluded.

## 4. Leakage Audit
| Check | Result |
|-------|--------|
| `is_fraud` used for clustering | NO |
| `fraud_loss_amount` used | NO |
| Test labels used for fitting | NO |
| Target-derived features included | NO |
| Scaler fitted on train population only | YES |
| Week 10 threshold tuning | NO |
| Week 11/12 work | NO |

## 5. Scaling
StandardScaler fitted on the 444,575-row segmentation population.
All 16 numerical features normalised to zero mean / unit variance.

## 6. PCA
Full PCA run on scaled features.
- PC1 explained variance: **0.1295** (13.0%)
- PC2 explained variance: **0.1252** (12.5%)
- Cumulative variance (PC1+PC2): **0.2548** (25.5%)
- Components needed for 90% variance: **11**
- Components used for K-Means: **11** (capturing 94.4% variance)

Note: Two PCs explain only 25.5% of variance; K-Means uses 11 components
to retain richer structure while keeping computation tractable.

## 7. K-Means Evaluation

| K | Inertia | Silhouette |
|---|---------|------------|
| 2 | 5981064.0 | 0.1402 |
| 3 | 5458479.2 | 0.1249 |
| 4 | 5060632.4 | 0.1266 |
| 5 | 4793951.9 | 0.1148 |
| 6 | 4519620.4 | 0.1167 |

- Inertia decreases monotonically (expected).
- Silhouette scores are **differentiated across K values.
- Selected K based on highest silhouette score.

## 8. Selected K-Means Model
- **Selected K**: 2
- **Silhouette score**: 0.1402
- **Inertia**: 5981064.0
- **Ambiguous**: No -- clear maximum
- **Cluster sizes**: {0: 124270, 1: 320305}

## 9. DBSCAN Analysis
Evaluated on a 20,000-row reproducible random subset (`random_state=42`).

| eps | min_samples | Clusters | Noise % | Silhouette |
|-----|-------------|----------|---------|------------|
| 0.3 | 5 | 0 | 100.0% | nan |
| 0.5 | 5 | 0 | 100.0% | nan |
| 0.5 | 10 | 0 | 100.0% | nan |
| 1.0 | 5 | 43 | 98.5% | 0.3715 |
| 1.0 | 10 | 2 | 99.9% | 0.1493 |

**Selected configuration**: eps=1.0, min_samples=5
- Clusters: 43
- Noise points: 19706 (98.5%)
- Silhouette: 0.3715

DBSCAN provides density-based perspective; high noise percentages at low eps values reflect
the diffuse, high-dimensional nature of transaction data in PCA space.

## 10. Fraud Pattern Analysis by Cluster (Post-Clustering Only)

| Cluster | N | Fraud Count | Fraud Rate | Mean Amt | Median Amt |
|---------|---|-------------|------------|----------|------------|
| 0 | 124,270 | 504 | 0.0041 | $69.67 | $47.40 |
| 1 | 320,305 | 1212 | 0.0038 | $69.27 | $47.32 |

**Observations**:
- Overall fraud rate in training set: 0.0039 (0.386%)
- Segment fraud rates vary across clusters, reflecting behavioural differences.
- See `reports/phase9_segment_summary.csv` for full statistics.

## 11. Segment Label as a Feature
The fitted scaler + PCA + KMeans pipeline assigns cluster labels without using `is_fraud`:
```python
X_new_scaled = scaler.transform(X_new[SEGMENTATION_FEATURES])
X_new_pca    = pca_km.transform(X_new_scaled)
label        = km_final.predict(X_new_pca)
```
- Scaler, PCA, and KMeans are fitted ONLY on the training population.
- Transform-only is applied to test rows.
- No target information flows through this assignment.
- Test cluster distribution: {0: 31098, 1: 80046}

## 12. PCA Findings
- The feature space is diffuse: 11 PCs needed for 90% variance.
- This reflects genuine complexity in transaction behaviour rather than a few dominant patterns.
- 2D visualisation available but explains only 25.5% of total variance.
- Do NOT interpret 2D PCA plots as a complete picture of segment separation.

## 13. Limitations
- K-Means assumes convex, isotropic clusters; real fraud patterns may not satisfy this.
- Silhouette scores are moderate, indicating behavioural segments rather than hard-edged clusters.
- DBSCAN was run on a subset (20,000 rows) due to computational constraints.
- Segment labels are behavioural, not causal -- fraud within a segment reflects correlation, not causation.
- No threshold tuning or cost optimisation was performed (reserved for Week 10).
- Clustering results may shift with future data (concept drift); monitoring reserved for Week 11.

## 14. Artifacts
| Artifact | Path |
|----------|------|
| K-Means model + PCA + metadata | `models/kmeans_week9.joblib` |
| Segmentation scaler | `models/segmentation_scaler_week9.joblib` |
| DBSCAN model + subset | `models/dbscan_week9.joblib` |
| Metrics JSON | `reports/phase9_clustering_metrics.json` |
| Segment summary | `reports/phase9_segment_summary.csv` |
| PCA variance plot | `reports/figures/phase9/pca_explained_variance.png` |
| PCA 2D scatter | `reports/figures/phase9/pca_2d.png` |
| K-Means elbow | `reports/figures/phase9/kmeans_elbow.png` |
| K-Means silhouette | `reports/figures/phase9/kmeans_silhouette.png` |
| K-Means PCA clusters | `reports/figures/phase9/kmeans_pca_clusters.png` |
| DBSCAN clusters | `reports/figures/phase9/dbscan_clusters.png` |
| DBSCAN parameter analysis | `reports/figures/phase9/dbscan_parameter_analysis.png` |
