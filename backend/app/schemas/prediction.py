from pydantic import BaseModel, Field
from typing import Optional

class TransactionInput(BaseModel):
    trans_date_trans_time: str
    cc_num: int
    merchant: str
    category: str
    amt: float
    first: str
    last: str
    gender: str
    street: str
    city: str
    state: str
    zip: int
    lat: float
    long: float
    city_pop: int
    job: str
    dob: str
    trans_num: str
    unix_time: int
    merch_lat: float
    merch_long: float
    is_fraud: Optional[int] = None
    fraud_loss_amount: Optional[float] = None
    Unnamed_0: Optional[int] = Field(None, alias="Unnamed: 0")

class PredictionResponse(BaseModel):
    fraud_probability: float
    prediction: int
    decision: str
    latency_ms: float
