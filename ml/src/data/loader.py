import pandas as pd
from src.config import RAW_DATA_PATH
from src.utils.logger import get_logger

logger = get_logger(__name__)

def load_fraud_data() -> pd.DataFrame:
    """
    Loads the fraud dataset and prints basic information.
    """
    logger.info(f"Loading data from {RAW_DATA_PATH}")
    if not RAW_DATA_PATH.exists():
        logger.error(f"Dataset not found at {RAW_DATA_PATH}")
        raise FileNotFoundError(f"Dataset not found at {RAW_DATA_PATH}")

    df = pd.read_csv(RAW_DATA_PATH)
    
    logger.info(f"Number of rows: {df.shape[0]}")
    logger.info(f"Number of columns: {df.shape[1]}")
    logger.info(f"Column names: {list(df.columns)}")
    
    missing_vals = df.isnull().sum().sum()
    logger.info(f"Missing values (total): {missing_vals}")
    
    if "is_fraud" in df.columns:
        logger.info("Target distribution (is_fraud):")
        logger.info(f"\n{df['is_fraud'].value_counts(dropna=False)}")
    else:
        logger.warning("'is_fraud' column not found in dataset.")

    return df
