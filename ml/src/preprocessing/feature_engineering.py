import pandas as pd
import numpy as np

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees).
    """
    # convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])

    # haversine formula 
    dlat = lat2 - lat1 
    dlon = lon2 - lon1 
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applies feature engineering to the raw dataset without modifying the original.
    """
    # Create a copy to avoid SettingWithCopyWarning and modifying original dataframe
    df = df.copy()
    
    # 1. Datetime Feature Engineering
    if 'trans_date_trans_time' in df.columns:
        trans_date = pd.to_datetime(df['trans_date_trans_time'])
        df['transaction_hour'] = trans_date.dt.hour
        df['transaction_day'] = trans_date.dt.day
        df['transaction_month'] = trans_date.dt.month
        df['transaction_day_of_week'] = trans_date.dt.dayofweek
        df['is_weekend'] = (df['transaction_day_of_week'] >= 5).astype(int)
        # 1b. Cyclical time and Time-of-day
        df['hour_sin'] = np.sin(2 * np.pi * df['transaction_hour'] / 24.0)
        df['hour_cos'] = np.cos(2 * np.pi * df['transaction_hour'] / 24.0)
        
        def get_time_of_day(hour):
            if 6 <= hour < 12:
                return 'Morning'
            elif 12 <= hour < 18:
                return 'Afternoon'
            elif 18 <= hour < 24:
                return 'Evening'
            else:
                return 'Night'
                
        df['time_of_day'] = df['transaction_hour'].apply(get_time_of_day)
        
        # 2. Customer Age
        if 'dob' in df.columns:
            dob = pd.to_datetime(df['dob'])
            # Calculate age in years based on transaction date
            age = (trans_date - dob).dt.days / 365.25
            df['customer_age'] = np.where(age >= 0, age.astype(int), 0) # Handle negative ages
            
            # 2b. Age buckets
            df['age_bucket'] = pd.cut(df['customer_age'], bins=[0, 25, 40, 60, 100], labels=['<25', '25-40', '40-60', '60+'], right=False)
            df['age_bucket'] = df['age_bucket'].astype(str)
            df.drop(columns=['dob'], inplace=True)
            
        df.drop(columns=['trans_date_trans_time'], inplace=True)
        
    # 3. Geographic Feature (Merchant Distance)
    if all(col in df.columns for col in ['lat', 'long', 'merch_lat', 'merch_long']):
        df['merchant_distance'] = haversine_distance(
            df['lat'], df['long'], df['merch_lat'], df['merch_long']
        )
        
    # 4. Transaction Amount Features
    if 'amt' in df.columns:
        # Avoid log(0) issues, although amt should be > 0. using log1p
        df['amount_log'] = np.log1p(df['amt'])
        
    # 5. Type Conversions
    if 'zip' in df.columns:
        df['zip'] = df['zip'].astype(str)
        
    # 6. Exclude identifiers and PII from the predictive model
    # Note: 'Unnamed: 0' is also an identifier/index usually found in CSVs
    exclude_columns = ['id', 'Unnamed: 0', 'cc_num', 'first', 'last', 'street', 'trans_num']
    existing_exclude = [col for col in exclude_columns if col in df.columns]
    if existing_exclude:
        df.drop(columns=existing_exclude, inplace=True)
        
    return df
