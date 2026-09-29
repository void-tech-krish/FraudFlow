import pandas as pd
from src.data.loader import load_fraud_data
from src.utils.logger import get_logger

logger = get_logger(__name__)

def run_basic_checks(df: pd.DataFrame):
    """
    Runs basic validation checks on the dataset.
    """
    logger.info("=== Dataset Validation Report ===")
    
    # Dataset shape
    logger.info(f"Shape: {df.shape}")
    
    # Duplicate rows
    duplicates = df.duplicated().sum()
    logger.info(f"Duplicate rows: {duplicates}")
    
    # Missing values
    missing = df.isnull().sum()
    if missing.sum() > 0:
        logger.info(f"Missing values by column:\n{missing[missing > 0]}")
    else:
        logger.info("No missing values found.")
    
    # Data types
    logger.info("Data types:")
    for col, dtype in df.dtypes.items():
         logger.info(f"  {col}: {dtype}")
    
    # Target column existence and distribution
    if "is_fraud" in df.columns:
        logger.info("Target column 'is_fraud' exists.")
        unique_vals = df["is_fraud"].unique()
        logger.info(f"Unique values of is_fraud: {unique_vals}")
        
        fraud_count = df["is_fraud"].sum()
        non_fraud_count = len(df) - fraud_count
        fraud_percentage = (fraud_count / len(df)) * 100
        
        logger.info("=== Target Analysis ===")
        logger.info(f"Fraud: {fraud_count}")
        logger.info(f"Non-fraud: {non_fraud_count}")
        logger.info(f"Fraud percentage: {fraud_percentage:.4f}%")
        logger.info("NOTE: Because fraud is highly imbalanced, accuracy alone should not be treated as the primary evaluation metric in later phases.")
    else:
        logger.warning("Target column 'is_fraud' NOT found.")
        
    # Transaction amount checks
    if "amt" in df.columns:
        neg_amts = (df["amt"] < 0).sum()
        zero_amts = (df["amt"] == 0).sum()
        logger.info(f"Negative transaction amounts: {neg_amts}")
        logger.info(f"Zero transaction amounts: {zero_amts}")
        
    logger.info("=== End of Validation Report ===")

if __name__ == "__main__":
    df = load_fraud_data()
    run_basic_checks(df)
