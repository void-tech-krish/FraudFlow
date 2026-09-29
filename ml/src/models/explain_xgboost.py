import joblib
import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import shap

from src.data.loader import load_fraud_data
from src.preprocessing.feature_engineering import engineer_features
from src.preprocessing.pipeline import split_data

def explain_xgboost():
    print("Loading data...")
    df = load_fraud_data()
    
    print("Engineering features...")
    df = engineer_features(df)
    
    print("Splitting data...")
    _, X_test, _, _ = split_data(df)
    
    models_dir = Path("models")
    artifacts = joblib.load(models_dir / "xgboost_fraud.joblib")
    model = artifacts["model"]
    preprocessor = artifacts["preprocessor"]
    feature_names = artifacts["feature_names"]
    
    print("Transforming test data...")
    X_test_transformed = preprocessor.transform(X_test)
    
    if hasattr(X_test_transformed, "toarray"):
        X_test_transformed = X_test_transformed.toarray()
        
    X_test_df = pd.DataFrame(X_test_transformed, columns=feature_names)
    
    sample_size = 5000
    if len(X_test_df) > sample_size:
        X_sample = X_test_df.sample(n=sample_size, random_state=42)
    else:
        X_sample = X_test_df
        
    print(f"Running SHAP on sample of size {len(X_sample)}...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(X_sample)
    
    reports_dir = Path("reports")
    figures_dir = reports_dir / "figures" / "phase6"
    figures_dir.mkdir(parents=True, exist_ok=True)
    
    print("Calculating feature importance...")
    
    # shap_values.values shape is typically (n_samples, n_features)
    # sometimes (n_samples, n_features, n_classes) for multiclass but xgboost binary is usually 2D.
    vals = shap_values.values
    if len(vals.shape) == 3:
        vals = vals[:, :, 1] # Take positive class if 3D
        
    mean_abs_shap = np.abs(vals).mean(axis=0)
    
    df_shap_imp = pd.DataFrame({
        "feature": feature_names,
        "mean_abs_shap": mean_abs_shap
    }).sort_values(by="mean_abs_shap", ascending=False)
    
    df_shap_imp.to_csv(reports_dir / "phase6_shap_feature_importance.csv", index=False)
    
    print("Generating SHAP plots...")
    fig = plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_sample, show=False)
    plt.tight_layout()
    plt.savefig(figures_dir / "phase6_shap_summary.png", bbox_inches='tight')
    plt.close(fig)
    
    fig = plt.figure(figsize=(10, 8))
    shap.plots.bar(shap_values, show=False)
    plt.tight_layout()
    plt.savefig(figures_dir / "phase6_shap_bar.png", bbox_inches='tight')
    plt.close(fig)
    
    print("SHAP explanation complete.")

if __name__ == "__main__":
    explain_xgboost()
