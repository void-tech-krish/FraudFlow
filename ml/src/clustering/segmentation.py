import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
import joblib
from pathlib import Path

# The features we want to use for clustering (behavioral / numerical)
CLUSTERING_FEATURES = [
    'amt', 'amount_log', 'transaction_hour', 'transaction_day', 
    'transaction_month', 'transaction_day_of_week', 'is_weekend', 
    'customer_age', 'merchant_distance', 'lat', 'long', 'merch_lat', 
    'merch_long', 'city_pop'
]

class FraudSegmentation:
    def __init__(self, n_clusters=4, pca_components=None):
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=pca_components, random_state=42) if pca_components else PCA(random_state=42)
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.features = CLUSTERING_FEATURES
        self.pca_explained_variance_ = None
        self.pca_cumulative_variance_ = None
        self.fitted = False

    def get_clustering_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract only the clustering features."""
        missing = [col for col in self.features if col not in df.columns]
        if missing:
            raise ValueError(f"Missing clustering features in dataframe: {missing}")
        return df[self.features].copy()

    def fit(self, df_train: pd.DataFrame):
        """Fit scaler, PCA, and KMeans on training data only."""
        X = self.get_clustering_data(df_train)
        
        # Fit & transform scaler
        X_scaled = self.scaler.fit_transform(X)
        
        # Fit & transform PCA
        X_pca = self.pca.fit_transform(X_scaled)
        self.pca_explained_variance_ = self.pca.explained_variance_ratio_
        self.pca_cumulative_variance_ = np.cumsum(self.pca_explained_variance_)
        
        # Fit KMeans
        self.kmeans.fit(X_pca)
        self.fitted = True

    def predict(self, df: pd.DataFrame) -> np.ndarray:
        """Assign segment labels to data."""
        if not self.fitted:
            raise RuntimeError("Model is not fitted yet.")
        X = self.get_clustering_data(df)
        X_scaled = self.scaler.transform(X)
        X_pca = self.pca.transform(X_scaled)
        return self.kmeans.predict(X_pca)

    def evaluate_kmeans(self, df_train: pd.DataFrame, max_k=8):
        """Evaluate KMeans for k=2..max_k on training data."""
        X = self.get_clustering_data(df_train)
        X_scaled = self.scaler.fit_transform(X)
        X_pca = self.pca.fit_transform(X_scaled)
        
        results = []
        for k in range(2, max_k + 1):
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = km.fit_predict(X_pca)
            inertia = km.inertia_
            # Subsample for silhouette if dataset is very large
            if len(X_pca) > 50000:
                np.random.seed(42)
                idx = np.random.choice(len(X_pca), 50000, replace=False)
                sil_score = silhouette_score(X_pca[idx], labels[idx])
            else:
                sil_score = silhouette_score(X_pca, labels)
            
            results.append({
                "method": "kmeans",
                "parameters": f"k={k}",
                "number_of_clusters": k,
                "noise_points": 0,
                "silhouette_score": float(sil_score),
                "inertia": float(inertia)
            })
        return pd.DataFrame(results)
        
    def evaluate_dbscan(self, df_train: pd.DataFrame, configs=[(0.5, 5), (1.0, 10)]):
        """Evaluate DBSCAN on training data. Warning: Slow on very large data."""
        X = self.get_clustering_data(df_train)
        X_scaled = self.scaler.fit_transform(X)
        X_pca = self.pca.fit_transform(X_scaled)
        
        # Subsample heavily for DBSCAN evaluation to avoid memory/time explosion
        if len(X_pca) > 20000:
            np.random.seed(42)
            idx = np.random.choice(len(X_pca), 20000, replace=False)
            X_eval = X_pca[idx]
        else:
            X_eval = X_pca
            
        results = []
        for eps, min_samples in configs:
            db = DBSCAN(eps=eps, min_samples=min_samples, n_jobs=-1)
            labels = db.fit_predict(X_eval)
            
            n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
            n_noise = list(labels).count(-1)
            noise_pct = n_noise / len(labels)
            
            sil_score = None
            if n_clusters >= 2:
                # Mask noise for silhouette
                mask = labels != -1
                if sum(mask) > 0:
                    sil_score = silhouette_score(X_eval[mask], labels[mask])
                    
            results.append({
                "method": "dbscan",
                "parameters": f"eps={eps}, min_samples={min_samples}",
                "number_of_clusters": n_clusters,
                "noise_points": n_noise,
                "silhouette_score": float(sil_score) if sil_score is not None else None,
                "inertia": None
            })
        return pd.DataFrame(results)
        
    def create_cluster_profiles(self, df_train: pd.DataFrame, y_train: pd.Series) -> pd.DataFrame:
        if not self.fitted:
            raise RuntimeError("Model is not fitted yet.")
        labels = self.predict(df_train)
        df_profile = self.get_clustering_data(df_train).copy()
        df_profile['segment_id'] = labels
        df_profile['is_fraud'] = y_train.values
        
        profiles = []
        total_len = len(df_profile)
        for seg_id, group in df_profile.groupby('segment_id'):
            profiles.append({
                "segment_id": seg_id,
                "transaction_count": len(group),
                "percentage": len(group) / total_len * 100.0,
                "fraud_count": group['is_fraud'].sum(),
                "fraud_rate": group['is_fraud'].mean(),
                "average_amount": group['amt'].mean(),
                "median_amount": group['amt'].median(),
                "average_merchant_distance": group['merchant_distance'].mean(),
                "average_transaction_hour": group['transaction_hour'].mean()
            })
            
        return pd.DataFrame(profiles).sort_values(by="segment_id")

    def save_artifacts(self, models_dir: Path):
        joblib.dump(self.scaler, models_dir / "fraud_segmentation_scaler.joblib")
        joblib.dump(self.pca, models_dir / "fraud_segmentation_pca.joblib")
        joblib.dump(self.kmeans, models_dir / "fraud_segmentation_kmeans.joblib")

    def load_artifacts(self, models_dir: Path):
        self.scaler = joblib.load(models_dir / "fraud_segmentation_scaler.joblib")
        self.pca = joblib.load(models_dir / "fraud_segmentation_pca.joblib")
        self.kmeans = joblib.load(models_dir / "fraud_segmentation_kmeans.joblib")
        self.fitted = True
