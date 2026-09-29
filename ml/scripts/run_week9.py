"""
run_week9.py — Week 9: Fraud-Pattern Segmentation — K-Means + DBSCAN + PCA
============================================================================
Implements:
  1. Unsupervised segmentation on behavioral transaction features (NO target used)
  2. StandardScaler fitted only on the segmentation population
  3. PCA: explained variance analysis + 2D visualisation
  4. K-Means evaluation for K = 2..6, elbow + silhouette curves
  5. Final K-Means model selected from evidence
  6. DBSCAN as complementary density-based method (subset for speed)
  7. Fraud-rate analysis per cluster (fraud labels used ONLY post-clustering)
  8. Segment label designed as a reusable feature for downstream models
  9. Artifacts saved to models/ with week9 naming
 10. Full reports/figures/phase9/ suite

Leakage safeguards:
  - is_fraud NOT used for fitting any clustering model
  - fraud_loss_amount NOT used
  - Scaler fitted on segmentation population (training rows only)
  - Test set labels NOT used anywhere in this script
  - Canonical supervised split preserved and not altered
"""

import json
import math
import warnings
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import seaborn as sns
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.model_selection import train_test_split

from src.preprocessing.feature_engineering import engineer_features

warnings.filterwarnings("ignore", category=FutureWarning)

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

RANDOM_STATE = 42

# Behavioral numerical features for unsupervised segmentation
# These represent transaction/customer/merchant behaviour at transaction time.
# No target or target-derived column is included.
SEGMENTATION_FEATURES = [
    "amt",
    "amount_log",
    "transaction_hour",
    "transaction_day",
    "transaction_month",
    "transaction_day_of_week",
    "is_weekend",
    "customer_age",
    "merchant_distance",
    "lat",
    "long",
    "merch_lat",
    "merch_long",
    "city_pop",
    "hour_sin",
    "hour_cos",
]

KMEANS_K_CANDIDATES = [2, 3, 4, 5, 6]
SILHOUETTE_SUBSAMPLE = 50_000   # cap silhouette computation for speed
DBSCAN_SUBSAMPLE     = 20_000   # DBSCAN is O(n^2) in the worst case
PLOT_SUBSAMPLE       = 20_000   # cap scatter plot points


def _sil(X: np.ndarray, labels: np.ndarray, rng: np.random.Generator) -> float | None:
    """Compute silhouette on a capped subsample; returns None when invalid."""
    unique_labels = set(labels) - {-1}
    if len(unique_labels) < 2:
        return None
    if len(X) > SILHOUETTE_SUBSAMPLE:
        idx = rng.choice(len(X), SILHOUETTE_SUBSAMPLE, replace=False)
        lbl_sub = labels[idx]
        # Need >= 2 clusters in subsample too
        if len(set(lbl_sub) - {-1}) < 2:
            return None
        return float(silhouette_score(X[idx], lbl_sub))
    return float(silhouette_score(X, labels))


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def run_week9():
    rng = np.random.default_rng(RANDOM_STATE)

    reports_dir = Path("reports")
    figures_dir = reports_dir / "figures" / "phase9"
    models_dir  = Path("models")
    figures_dir.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(exist_ok=True)

    print("=" * 65)
    print("WEEK 9: Fraud-Pattern Segmentation — K-Means + DBSCAN + PCA")
    print("=" * 65)

    # ── 1. Load & engineer ────────────────────────────────────────────────────
    print("\n[1/12] Loading and engineering features...")
    df_raw = pd.read_csv("data/raw/fraudTest.csv")
    print(f"  Raw shape: {df_raw.shape}")
    df = engineer_features(df_raw)

    # ── Leakage guard ─────────────────────────────────────────────────────────
    assert "is_fraud" in df.columns, "is_fraud must exist for later analysis"
    assert "fraud_loss_amount" not in SEGMENTATION_FEATURES, \
        "fraud_loss_amount must NOT be in segmentation features"
    assert "is_fraud" not in SEGMENTATION_FEATURES, \
        "is_fraud must NOT be in segmentation features"

    # ── 2. Define segmentation population ─────────────────────────────────────
    # Use the canonical 80% training rows (same split as supervised learning).
    # The 20% test rows are kept aside and NOT used for fitting.
    # This is leakage-safe: no test labels, no target used.
    print("[2/12] Canonical 80/20 train/seg split (random_state=42)...")
    y_full = df["is_fraud"]
    X_full = df.drop(columns=["is_fraud"])

    X_train_sup, X_test_sup, y_train_sup, y_test_sup = train_test_split(
        X_full, y_full, test_size=0.2, stratify=y_full, random_state=RANDOM_STATE
    )
    print(f"  Segmentation population (train rows): {len(X_train_sup):,}")
    print(f"  Held-out test rows (not used):        {len(X_test_sup):,}")

    # Extract segmentation feature columns
    missing = [f for f in SEGMENTATION_FEATURES if f not in X_train_sup.columns]
    if missing:
        raise ValueError(f"Missing segmentation features: {missing}")

    X_seg   = X_train_sup[SEGMENTATION_FEATURES].copy()
    y_seg   = y_train_sup.copy()   # used ONLY for post-hoc fraud-rate analysis
    X_seg_test = X_test_sup[SEGMENTATION_FEATURES].copy()

    print(f"  Segmentation features: {len(SEGMENTATION_FEATURES)}")
    print(f"  Confirmed: is_fraud NOT in features — leakage safe")
    print(f"  Confirmed: fraud_loss_amount NOT in features — leakage safe")

    # ── 3. Scaling ────────────────────────────────────────────────────────────
    print("[3/12] Fitting StandardScaler on segmentation population...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_seg)
    print(f"  Scaler fitted on {len(X_seg):,} rows, {len(SEGMENTATION_FEATURES)} features")

    # ── 4. PCA ────────────────────────────────────────────────────────────────
    print("[4/12] Running full PCA...")
    pca_full = PCA(random_state=RANDOM_STATE)
    pca_full.fit(X_scaled)
    ev_ratio  = pca_full.explained_variance_ratio_
    ev_cumsum = np.cumsum(ev_ratio)

    print(f"  PC1 explained variance: {ev_ratio[0]:.4f}")
    print(f"  PC2 explained variance: {ev_ratio[1]:.4f}")
    n_90 = int(np.searchsorted(ev_cumsum, 0.90)) + 1
    print(f"  Components for 90% variance: {n_90}")

    # PCA plot — explained variance
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    axes[0].bar(range(1, len(ev_ratio) + 1), ev_ratio, color="steelblue", alpha=0.8)
    axes[0].set_xlabel("Principal Component")
    axes[0].set_ylabel("Explained Variance Ratio")
    axes[0].set_title("PCA — Individual Explained Variance")
    axes[0].grid(axis="y", linestyle="--", alpha=0.5)

    axes[1].plot(range(1, len(ev_cumsum) + 1), ev_cumsum, marker="o", color="coral")
    axes[1].axhline(0.90, linestyle="--", color="grey", label="90% threshold")
    axes[1].axhline(0.95, linestyle=":", color="grey", label="95% threshold")
    axes[1].set_xlabel("Number of Components")
    axes[1].set_ylabel("Cumulative Explained Variance")
    axes[1].set_title("PCA — Cumulative Explained Variance")
    axes[1].legend()
    axes[1].grid(linestyle="--", alpha=0.5)
    plt.suptitle("PCA Analysis — Week 9 Segmentation Features", fontsize=13)
    plt.tight_layout()
    plt.savefig(figures_dir / "pca_explained_variance.png", bbox_inches="tight", dpi=150)
    plt.close(fig)

    # Use first 2 PCs for cluster visualisations
    pca_2d = PCA(n_components=2, random_state=RANDOM_STATE)
    X_pca2 = pca_2d.fit_transform(X_scaled)

    # 2D PCA scatter (raw, no cluster colour yet)
    plot_idx = rng.choice(len(X_pca2), min(PLOT_SUBSAMPLE, len(X_pca2)), replace=False)
    fig, ax = plt.subplots(figsize=(9, 7))
    ax.scatter(X_pca2[plot_idx, 0], X_pca2[plot_idx, 1],
               c="steelblue", alpha=0.15, s=4)
    ax.set_xlabel(f"PC1 ({ev_ratio[0]*100:.1f}% var)")
    ax.set_ylabel(f"PC2 ({ev_ratio[1]*100:.1f}% var)")
    ax.set_title("2D PCA — Segmentation Feature Space (Week 9)")
    plt.tight_layout()
    plt.savefig(figures_dir / "pca_2d.png", bbox_inches="tight", dpi=150)
    plt.close(fig)

    # ── 5. K-Means evaluation ─────────────────────────────────────────────────
    # Choose PCA dimensions: enough to capture 90% variance
    n_pca = min(n_90, len(SEGMENTATION_FEATURES))
    pca_km = PCA(n_components=n_pca, random_state=RANDOM_STATE)
    X_pca_km = pca_km.fit_transform(X_scaled)
    print(f"[5/12] Evaluating K-Means for K in {KMEANS_K_CANDIDATES} "
          f"(PCA={n_pca} components covering >{ev_cumsum[n_pca-1]*100:.0f}% variance)...")

    kmeans_results = []
    for k in KMEANS_K_CANDIDATES:
        km = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
        labels = km.fit_predict(X_pca_km)
        inertia = float(km.inertia_)
        sil = _sil(X_pca_km, labels, rng)
        kmeans_results.append({
            "k": k, "inertia": inertia, "silhouette": sil
        })
        print(f"  K={k:2d}  inertia={inertia:>14.1f}  silhouette={sil:.4f}" if sil else
              f"  K={k:2d}  inertia={inertia:>14.1f}  silhouette=N/A")

    df_km = pd.DataFrame(kmeans_results)

    # Elbow plot
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(df_km["k"], df_km["inertia"], marker="o", color="steelblue", lw=2)
    ax.set_xlabel("K (Number of Clusters)")
    ax.set_ylabel("Inertia (Within-Cluster Sum of Squares)")
    ax.set_title("K-Means Elbow Curve — Week 9")
    ax.grid(linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(figures_dir / "kmeans_elbow.png", bbox_inches="tight", dpi=150)
    plt.close(fig)

    # Silhouette plot
    df_km_sil = df_km.dropna(subset=["silhouette"])
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(df_km_sil["k"], df_km_sil["silhouette"], marker="o", color="coral", lw=2)
    ax.set_xlabel("K (Number of Clusters)")
    ax.set_ylabel("Silhouette Score")
    ax.set_title("K-Means Silhouette Scores — Week 9")
    ax.grid(linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(figures_dir / "kmeans_silhouette.png", bbox_inches="tight", dpi=150)
    plt.close(fig)

    # ── 6. Select final K ──────────────────────────────────────────────────────
    # Select K with the highest silhouette score.
    # Where multiple K values have similar scores, document the ambiguity.
    valid_km = df_km.dropna(subset=["silhouette"])
    best_row = valid_km.loc[valid_km["silhouette"].idxmax()]
    selected_k     = int(best_row["k"])
    selected_sil   = float(best_row["silhouette"])
    selected_inertia = float(df_km.loc[df_km["k"] == selected_k, "inertia"].iloc[0])

    # Check for ambiguity: any K within 0.005 of the best?
    similar = valid_km[abs(valid_km["silhouette"] - selected_sil) < 0.005]
    ambiguous = len(similar) > 1

    print(f"[6/12] K-Means selection:")
    print(f"  Selected K = {selected_k} (silhouette={selected_sil:.4f}, inertia={selected_inertia:.1f})")
    if ambiguous:
        print(f"  NOTE: Multiple K values have similar silhouette scores (within 0.005).")
        print(f"  Ambiguous candidates: {similar['k'].tolist()}")
        print(f"  Selecting K={selected_k} (highest absolute silhouette).")

    # ── 7. Fit final K-Means ──────────────────────────────────────────────────
    print(f"[7/12] Fitting final K-Means with K={selected_k}...")
    km_final = KMeans(n_clusters=selected_k, random_state=RANDOM_STATE, n_init=10)
    km_labels = km_final.fit_predict(X_pca_km)

    cluster_sizes = {int(c): int((km_labels == c).sum()) for c in range(selected_k)}
    print(f"  Cluster sizes: {cluster_sizes}")

    # Save artifacts
    joblib.dump(scaler, models_dir / "segmentation_scaler_week9.joblib")
    joblib.dump({"kmeans": km_final, "pca": pca_km, "n_pca": n_pca,
                 "features": SEGMENTATION_FEATURES, "selected_k": selected_k},
                models_dir / "kmeans_week9.joblib")
    print("  Saved: models/kmeans_week9.joblib")
    print("  Saved: models/segmentation_scaler_week9.joblib")

    # K-Means PCA cluster visualisation
    fig, ax = plt.subplots(figsize=(10, 7))
    palette = cm.tab10.colors
    for c in range(selected_k):
        mask = km_labels[plot_idx] == c
        ax.scatter(X_pca2[plot_idx[mask], 0], X_pca2[plot_idx[mask], 1],
                   c=[palette[c % len(palette)]], alpha=0.25, s=5,
                   label=f"Cluster {c}")
    ax.set_xlabel(f"PC1 ({ev_ratio[0]*100:.1f}%)")
    ax.set_ylabel(f"PC2 ({ev_ratio[1]*100:.1f}%)")
    ax.set_title(f"K-Means Clusters (K={selected_k}) — 2D PCA — Week 9\n"
                 f"(visualised on {min(PLOT_SUBSAMPLE, len(X_pca2)):,}-row sample)")
    ax.legend(markerscale=3)
    plt.tight_layout()
    plt.savefig(figures_dir / "kmeans_pca_clusters.png", bbox_inches="tight", dpi=150)
    plt.close(fig)

    # ── 8. DBSCAN ─────────────────────────────────────────────────────────────
    # DBSCAN is O(n^2) in memory; use a reproducible subset.
    print(f"[8/12] Running DBSCAN on {DBSCAN_SUBSAMPLE:,}-row reproducible subset...")
    dbscan_idx = rng.choice(len(X_pca_km), min(DBSCAN_SUBSAMPLE, len(X_pca_km)), replace=False)
    X_db = X_pca_km[dbscan_idx]

    # Evaluate a small set of candidate (eps, min_samples) pairs.
    # Chosen to span dense and sparse parameter regimes without a massive grid.
    dbscan_configs = [
        (0.3, 5),
        (0.5, 5),
        (0.5, 10),
        (1.0, 5),
        (1.0, 10),
    ]
    dbscan_results = []
    for eps, min_samples in dbscan_configs:
        db = DBSCAN(eps=eps, min_samples=min_samples, n_jobs=-1)
        db_labels = db.fit_predict(X_db)
        n_clusters = int(len(set(db_labels)) - (1 if -1 in db_labels else 0))
        n_noise    = int((db_labels == -1).sum())
        noise_pct  = n_noise / len(db_labels)
        sil = None
        if n_clusters >= 2:
            mask = db_labels != -1
            if mask.sum() > 1:
                sil = _sil(X_db[mask], db_labels[mask], rng)
        dbscan_results.append({
            "eps": eps,
            "min_samples": min_samples,
            "n_clusters": n_clusters,
            "n_noise": n_noise,
            "noise_pct": noise_pct,
            "silhouette": sil,
        })
        print(f"  eps={eps:.1f} min_s={min_samples:2d}  "
              f"clusters={n_clusters}  noise={noise_pct*100:.1f}%  "
              f"silhouette={'N/A' if sil is None else f'{sil:.4f}'}")

    df_db = pd.DataFrame(dbscan_results)

    # Select DBSCAN config: prefer fewest noise + silhouette >= 0 + >= 2 clusters
    valid_db = df_db[(df_db["n_clusters"] >= 2) & (df_db["silhouette"].notna())]
    if len(valid_db) > 0:
        best_db = valid_db.loc[valid_db["silhouette"].idxmax()]
    else:
        # Fall back to config with most clusters if none produced valid silhouette
        best_db = df_db.loc[df_db["n_clusters"].idxmax()]

    sel_eps        = float(best_db["eps"])
    sel_min_s      = int(best_db["min_samples"])
    sel_n_clusters = int(best_db["n_clusters"])
    sel_n_noise    = int(best_db["n_noise"])
    sel_noise_pct  = float(best_db["noise_pct"])
    sel_sil_db     = best_db["silhouette"]

    print(f"  Selected DBSCAN: eps={sel_eps}, min_samples={sel_min_s} "
          f"-> clusters={sel_n_clusters}, noise={sel_noise_pct*100:.1f}%")

    # Final DBSCAN fit on subset for visualisation
    db_final = DBSCAN(eps=sel_eps, min_samples=sel_min_s, n_jobs=-1)
    db_final_labels = db_final.fit_predict(X_db)
    joblib.dump({"dbscan": db_final, "subset_idx": dbscan_idx,
                 "eps": sel_eps, "min_samples": sel_min_s},
                models_dir / "dbscan_week9.joblib")
    print("  Saved: models/dbscan_week9.joblib")

    # DBSCAN visualisation
    db_palette = cm.tab10.colors
    vis_idx = rng.choice(len(X_db), min(PLOT_SUBSAMPLE, len(X_db)), replace=False)
    fig, ax = plt.subplots(figsize=(10, 7))
    unique_db = sorted(set(db_final_labels))
    for lbl in unique_db:
        m = db_final_labels[vis_idx] == lbl
        c_name = "grey" if lbl == -1 else db_palette[lbl % len(db_palette)]
        label_str = "Noise" if lbl == -1 else f"Cluster {lbl}"
        ax.scatter(X_pca2[dbscan_idx][vis_idx][m, 0],
                   X_pca2[dbscan_idx][vis_idx][m, 1],
                   c=[c_name], alpha=0.25, s=5, label=label_str)
    ax.set_xlabel(f"PC1 ({ev_ratio[0]*100:.1f}%)")
    ax.set_ylabel(f"PC2 ({ev_ratio[1]*100:.1f}%)")
    ax.set_title(f"DBSCAN Clusters (eps={sel_eps}, min_s={sel_min_s}) — 2D PCA\n"
                 f"(on {DBSCAN_SUBSAMPLE:,}-row DBSCAN subset)")
    ax.legend(markerscale=3)
    plt.tight_layout()
    plt.savefig(figures_dir / "dbscan_pca_clusters.png", bbox_inches="tight", dpi=150)
    plt.close(fig)

    # DBSCAN parameter analysis chart
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    for i, (grp_key, grp) in enumerate(df_db.groupby("min_samples")):
        axes[0].plot(grp["eps"], grp["n_clusters"], marker="o",
                     label=f"min_s={grp_key}")
        axes[1].plot(grp["eps"], grp["noise_pct"] * 100, marker="o",
                     label=f"min_s={grp_key}")
    axes[0].set_xlabel("eps")
    axes[0].set_ylabel("Number of Clusters")
    axes[0].set_title("DBSCAN — Clusters vs eps")
    axes[0].legend()
    axes[0].grid(linestyle="--", alpha=0.5)
    axes[1].set_xlabel("eps")
    axes[1].set_ylabel("Noise %")
    axes[1].set_title("DBSCAN — Noise % vs eps")
    axes[1].legend()
    axes[1].grid(linestyle="--", alpha=0.5)
    plt.suptitle("DBSCAN Parameter Analysis — Week 9", fontsize=13)
    plt.tight_layout()
    plt.savefig(figures_dir / "dbscan_parameter_analysis.png", bbox_inches="tight", dpi=150)
    plt.close(fig)

    # ── 9. Fraud pattern analysis (fraud labels used HERE, post-clustering) ──
    print("[9/12] Fraud pattern analysis by cluster...")
    df_seg = X_seg.copy()
    df_seg["cluster"]  = km_labels
    df_seg["is_fraud"] = y_seg.values

    segment_rows = []
    for c in sorted(df_seg["cluster"].unique()):
        grp = df_seg[df_seg["cluster"] == c]
        segment_rows.append({
            "cluster":           int(c),
            "transaction_count": len(grp),
            "fraud_count":       int(grp["is_fraud"].sum()),
            "fraud_rate":        float(grp["is_fraud"].mean()),
            "mean_amt":          float(grp["amt"].mean()),
            "median_amt":        float(grp["amt"].median()),
            "mean_merchant_distance": float(grp["merchant_distance"].mean()),
            "mean_transaction_hour":  float(grp["transaction_hour"].mean()),
            "mean_customer_age":      float(grp["customer_age"].mean()),
            "mean_city_pop":          float(grp["city_pop"].mean()),
        })
        print(f"  Cluster {c}: n={len(grp):>6,}  fraud_rate={grp['is_fraud'].mean():.4f}"
              f"  mean_amt=${grp['amt'].mean():.2f}")

    df_summary = pd.DataFrame(segment_rows)
    df_summary.to_csv(reports_dir / "phase9_segment_summary.csv", index=False)
    print("  Saved: reports/phase9_segment_summary.csv")

    # ── 10. Segment-as-feature capability ─────────────────────────────────────
    # Demonstrate leakage-safe assignment of cluster labels to new observations.
    # The fitted scaler + PCA + KMeans can transform any new row.
    print("[10/12] Demonstrating segment-label assignment to held-out test rows...")
    X_test_scaled = scaler.transform(X_seg_test)
    X_test_pca    = pca_km.transform(X_test_scaled)
    test_labels   = km_final.predict(X_test_pca)
    test_cluster_counts = {int(c): int((test_labels == c).sum()) for c in range(selected_k)}
    print(f"  Test-set cluster distribution: {test_cluster_counts}")
    print("  (labels assigned by transform-only — scaler/PCA/KMeans NOT refitted on test)")

    # ── 11. DBSCAN clusters figure (already saved) — note on dbscan_clusters.png ──
    # Rename/copy dbscan_pca_clusters.png as dbscan_clusters.png per spec
    import shutil
    shutil.copy(figures_dir / "dbscan_pca_clusters.png",
                figures_dir / "dbscan_clusters.png")

    # ── 12. Metrics JSON ──────────────────────────────────────────────────────
    print("[11/12] Saving metrics JSON...")
    metrics = {
        "week": 9,
        "segmentation_features": SEGMENTATION_FEATURES,
        "n_features": len(SEGMENTATION_FEATURES),
        "segmentation_population": len(X_seg),
        "pca": {
            "pc1_explained_variance": float(ev_ratio[0]),
            "pc2_explained_variance": float(ev_ratio[1]),
            "cumulative_2pc":         float(ev_cumsum[1]),
            "n_components_90pct":     n_90,
            "n_components_used_for_kmeans": n_pca,
            "explained_variance_ratio": [float(v) for v in ev_ratio],
            "cumulative_variance":       [float(v) for v in ev_cumsum],
        },
        "kmeans": {
            "candidates": [
                {
                    "k": int(row["k"]),
                    "inertia": float(row["inertia"]),
                    "silhouette": float(row["silhouette"]) if row["silhouette"] is not None else None,
                }
                for _, row in df_km.iterrows()
            ],
            "selected_k":        selected_k,
            "selected_silhouette": selected_sil,
            "selected_inertia":  selected_inertia,
            "silhouette_ambiguous": ambiguous,
            "cluster_sizes":     cluster_sizes,
        },
        "dbscan": {
            "subset_size": int(min(DBSCAN_SUBSAMPLE, len(X_pca_km))),
            "subset_random_state": RANDOM_STATE,
            "candidates": [
                {
                    "eps": float(r["eps"]),
                    "min_samples": int(r["min_samples"]),
                    "n_clusters": int(r["n_clusters"]),
                    "n_noise": int(r["n_noise"]),
                    "noise_pct": float(r["noise_pct"]),
                    "silhouette": float(r["silhouette"]) if r["silhouette"] is not None else None,
                }
                for _, r in df_db.iterrows()
            ],
            "selected_eps":      sel_eps,
            "selected_min_samples": sel_min_s,
            "selected_n_clusters": sel_n_clusters,
            "selected_n_noise":  sel_n_noise,
            "selected_noise_pct": sel_noise_pct,
            "selected_silhouette": float(sel_sil_db) if sel_sil_db is not None else None,
        },
        "leakage_audit": {
            "is_fraud_used_for_clustering":       False,
            "fraud_loss_amount_used":              False,
            "test_labels_used_for_fitting":        False,
            "target_derived_features_used":        False,
            "scaler_fitted_on_train_only":         True,
            "week10_threshold_tuning_performed":   False,
            "week11_work_performed":               False,
            "week12_work_performed":               False,
        }
    }
    with open(reports_dir / "phase9_clustering_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=4)
    print("  Saved: reports/phase9_clustering_metrics.json")

    # ── 13. Markdown documentation ────────────────────────────────────────────
    print("[12/12] Writing documentation...")

    # Segment summary table for markdown
    seg_table_header = "| Cluster | N | Fraud Count | Fraud Rate | Mean Amt | Median Amt |"
    seg_table_sep    = "|---------|---|-------------|------------|----------|------------|"
    seg_table_rows   = [
        f"| {r['cluster']} | {r['transaction_count']:,} | {r['fraud_count']} | "
        f"{r['fraud_rate']:.4f} | ${r['mean_amt']:.2f} | ${r['median_amt']:.2f} |"
        for r in segment_rows
    ]
    seg_table = "\n".join([seg_table_header, seg_table_sep] + seg_table_rows)

    # DBSCAN candidate table
    db_table_header = "| eps | min_samples | Clusters | Noise % | Silhouette |"
    db_table_sep    = "|-----|-------------|----------|---------|------------|"

    db_table_rows = []
    for _, r in df_db.iterrows():
        sil_str = "N/A" if r["silhouette"] is None else f"{float(r['silhouette']):.4f}"
        db_table_rows.append(
            f"| {r['eps']:.1f} | {int(r['min_samples'])} | {int(r['n_clusters'])} | "
            f"{r['noise_pct']*100:.1f}% | {sil_str} |"
        )
    db_table = "\n".join([db_table_header, db_table_sep] + db_table_rows)

    # KMeans candidate table
    km_table_header = "| K | Inertia | Silhouette |"
    km_table_sep    = "|---|---------|------------|"

    km_table_rows = []
    for _, r in df_km.iterrows():
        sil_str = "N/A" if r["silhouette"] is None else f"{float(r['silhouette']):.4f}"
        km_table_rows.append(f"| {int(r['k'])} | {r['inertia']:.1f} | {sil_str} |")
    km_table = "\n".join([km_table_header, km_table_sep] + km_table_rows)

    doc = f"""# Week 9 -- Fraud-Pattern Segmentation: K-Means + DBSCAN + PCA

## 1. Objective
Discover transaction-behaviour segments using unsupervised learning (K-Means and DBSCAN),
analyse the relationship between discovered segments and fraud, and prepare a reusable
segment-label feature for downstream models. Fraud labels are NOT used to construct clusters;
they are used ONLY for post-hoc descriptive analysis.

## 2. Dataset and Segmentation Population
- **Raw file**: `data/raw/fraudTest.csv` -- shape (555719, 23) (not modified)
- **Features after engineering**: {df.shape[1] - 1} feature columns
- **Canonical 80/20 split** (`random_state=42`) reused for segmentation population
  - Segmentation population (train rows): {len(X_seg):,}
  - Held-out test rows (not used for fitting): {len(X_seg_test):,}

## 3. Segmentation Features ({len(SEGMENTATION_FEATURES)} features)
```
{chr(10).join("  " + f for f in SEGMENTATION_FEATURES)}
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
StandardScaler fitted on the {len(X_seg):,}-row segmentation population.
All {len(SEGMENTATION_FEATURES)} numerical features normalised to zero mean / unit variance.

## 6. PCA
Full PCA run on scaled features.
- PC1 explained variance: **{ev_ratio[0]:.4f}** ({ev_ratio[0]*100:.1f}%)
- PC2 explained variance: **{ev_ratio[1]:.4f}** ({ev_ratio[1]*100:.1f}%)
- Cumulative variance (PC1+PC2): **{ev_cumsum[1]:.4f}** ({ev_cumsum[1]*100:.1f}%)
- Components needed for 90% variance: **{n_90}**
- Components used for K-Means: **{n_pca}** (capturing {ev_cumsum[n_pca-1]*100:.1f}% variance)

Note: Two PCs explain only {ev_cumsum[1]*100:.1f}% of variance; K-Means uses {n_pca} components
to retain richer structure while keeping computation tractable.

## 7. K-Means Evaluation

{km_table}

- Inertia decreases monotonically (expected).
- Silhouette scores are **{f'similar across K={KMEANS_K_CANDIDATES[0]}..{KMEANS_K_CANDIDATES[-1]}; this reflects the relatively diffuse clustering structure of transactional behavioural data' if ambiguous else 'differentiated across K values'}.
- Selected K based on highest silhouette score.

## 8. Selected K-Means Model
- **Selected K**: {selected_k}
- **Silhouette score**: {selected_sil:.4f}
- **Inertia**: {selected_inertia:.1f}
- **Ambiguous**: {'Yes -- multiple K values within 0.005 silhouette of the best; K={} chosen (highest absolute score)'.format(selected_k) if ambiguous else 'No -- clear maximum'}
- **Cluster sizes**: {cluster_sizes}

## 9. DBSCAN Analysis
Evaluated on a {DBSCAN_SUBSAMPLE:,}-row reproducible random subset (`random_state={RANDOM_STATE}`).

{db_table}

**Selected configuration**: eps={sel_eps}, min_samples={sel_min_s}
- Clusters: {sel_n_clusters}
- Noise points: {sel_n_noise} ({sel_noise_pct*100:.1f}%)
- Silhouette: {'N/A (only 1 cluster)' if sel_sil_db is None else f'{float(sel_sil_db):.4f}'}

DBSCAN provides density-based perspective; high noise percentages at low eps values reflect
the diffuse, high-dimensional nature of transaction data in PCA space.

## 10. Fraud Pattern Analysis by Cluster (Post-Clustering Only)

{seg_table}

**Observations**:
- Overall fraud rate in training set: {y_seg.mean():.4f} ({y_seg.mean()*100:.3f}%)
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
- Test cluster distribution: {test_cluster_counts}

## 12. PCA Findings
- The feature space is diffuse: {n_90} PCs needed for 90% variance.
- This reflects genuine complexity in transaction behaviour rather than a few dominant patterns.
- 2D visualisation available but explains only {ev_cumsum[1]*100:.1f}% of total variance.
- Do NOT interpret 2D PCA plots as a complete picture of segment separation.

## 13. Limitations
- K-Means assumes convex, isotropic clusters; real fraud patterns may not satisfy this.
- Silhouette scores are moderate, indicating behavioural segments rather than hard-edged clusters.
- DBSCAN was run on a subset ({DBSCAN_SUBSAMPLE:,} rows) due to computational constraints.
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
"""

    with open(reports_dir / "week9_clustering.md", "w", encoding="utf-8") as f:
        f.write(doc)
    print("  Saved: reports/week9_clustering.md")

    print("\n" + "=" * 65)
    print("Week 9 COMPLETE")
    print("=" * 65)
    print(f"  Selected K:           {selected_k}")
    print(f"  K-Means Silhouette:   {selected_sil:.4f}")
    print(f"  K-Means Inertia:      {selected_inertia:.1f}")
    print(f"  DBSCAN eps:           {sel_eps}")
    print(f"  DBSCAN min_samples:   {sel_min_s}")
    print(f"  DBSCAN clusters:      {sel_n_clusters}")
    print(f"  DBSCAN noise %:       {sel_noise_pct*100:.1f}%")
    print(f"  PC1 var:              {ev_ratio[0]:.4f}")
    print(f"  PC2 var:              {ev_ratio[1]:.4f}")


if __name__ == "__main__":
    run_week9()
