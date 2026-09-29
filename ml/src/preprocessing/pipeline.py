import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split

def split_data(df: pd.DataFrame, target_col='is_fraud'):
    """
    Performs a stratified train/test split.
    Uses 80% training, 20% testing, stratify=y, random_state=42.
    """
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in DataFrame.")
        
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    return X_train, X_test, y_train, y_test

def build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    """
    Builds a scikit-learn ColumnTransformer for preprocessing.
    Categorical features get OneHotEncoded with handle_unknown='ignore'.
    Numerical features get StandardScaled.
    """
    # Identify numerical and categorical columns
    categorical_cols = X.select_dtypes(include=['object', 'category', 'str']).columns.tolist()
    numerical_cols = X.select_dtypes(include=['int64', 'float64', 'int32']).columns.tolist()
    
    # Define transformers
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    # Combine using ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ],
        remainder='passthrough'
    )
    
    return preprocessor
