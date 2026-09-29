import time
import json
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

import sys
import os
sys.path.append(os.getcwd())
from api.app import app

def run_benchmark(num_requests=500):
    with TestClient(app) as client:
        print("Loading test data...")
        df = pd.read_csv("data/raw/fraudTest.csv", nrows=num_requests)
        
        print("Warming up...")
        for _ in range(5):
            client.post("/predict", json=df.iloc[0].fillna("").to_dict())
            
        print(f"Running benchmark with {num_requests} requests...")
        latencies = []
        errors = 0
        
        for i in range(num_requests):
            payload = df.iloc[i].fillna("").to_dict()
            if "Unnamed: 0" in payload:
                payload["Unnamed: 0"] = int(payload["Unnamed: 0"])
                
            start = time.perf_counter()
            resp = client.post("/predict", json=payload)
            end = time.perf_counter()
            
            if resp.status_code == 200:
                latencies.append((end - start) * 1000.0)
            else:
                if errors == 0:
                    print(f"Error {resp.status_code}: {resp.text}")
                errors += 1

    latencies = np.array(latencies)
    metrics = {
        "request_count": int(num_requests),
        "average_latency_ms": float(np.mean(latencies)),
        "median_latency_ms": float(np.median(latencies)),
        "p95_latency_ms": float(np.percentile(latencies, 95)),
        "p99_latency_ms": float(np.percentile(latencies, 99)),
        "max_latency_ms": float(np.max(latencies)),
        "error_count": errors,
        "sub_100ms_p99": bool(np.percentile(latencies, 99) < 100.0)
    }
    
    retraining_info = {
        "drift_trigger_available": True,
        "dry_run_available": True,
        "candidate_validation_available": True,
        "automatic_promotion": False
    }
    
    out = {**metrics, **retraining_info}
    
    os.makedirs("reports", exist_ok=True)
    with open("reports/phase12_serving_metrics.json", "w") as f:
        json.dump(out, f, indent=4)
        
    print("Benchmark complete:")
    print(json.dump(out, indent=4))
    
if __name__ == "__main__":
    run_benchmark()
