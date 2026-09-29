import pytest
import pandas as pd
from pathlib import Path
from src.clustering.segmentation import FraudSegmentation, CLUSTERING_FEATURES
from src.data.loader import load_fraud_data
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import split_data

@pytest.fixture(scope="module")
def sample_data():
    df = load_fraud_data().head(1000)
    df = engineer_features(df)
    X_train, _, y_train, _ = split_data(df)
    return X_train, y_train

def test_fraud_segmentation_fit_predict(sample_data):
    X_train, y_train = sample_data
    seg = FraudSegmentation(n_clusters=2, pca_components=5)
    seg.fit(X_train)
    
    assert seg.fitted, "Segmentation should be fitted"
    assert hasattr(seg.pca, "components_"), "PCA should be fitted"
    assert hasattr(seg.kmeans, "cluster_centers_"), "KMeans should be fitted"
    
    labels = seg.predict(X_train)
    assert len(labels) == len(X_train), "Labels length should match"
    assert not pd.isna(labels).any(), "No NaN labels allowed"

def test_fraud_segmentation_artifacts():
    models_dir = Path("ml/models")
    assert (models_dir / "fraud_segmentation_scaler.joblib").exists()
    assert (models_dir / "fraud_segmentation_pca.joblib").exists()
    assert (models_dir / "fraud_segmentation_kmeans.joblib").exists()

def test_phase7_reports_exist():
    reports_dir = Path("ml/reports")
    assert (reports_dir / "phase7_cluster_profiles.csv").exists()
    assert (reports_dir / "phase7_clustering_results.csv").exists()
    assert (reports_dir / "phase7_pca_results.json").exists()
