# SPACE HEALTH MONITO — AI/ML Analytics Engine
**Leads:** AI/ML Developer 1 (Data Engineering) & AI/ML Developer 2 (Machine Learning)  
**Tech Stack:** Python 3, Vectorized Isolation Forest, JSON-RPC HTTP microservice.

## Overview
The Python ML microservice runs on port 5050 as an independent daemon. It provides:
1. **Isolation Forest Anomaly Detection:** Ensemble of 50 decision trees, subsample size 128, tree depth 10.
2. **Contributing Indicators Attribution:** Decomposes anomaly scores into percentage contribution weights ($w_i = z_i^2 / \sum z_j^2 \times 100$).
3. **Adaptive Baseline Imputation:** Imputes missing biometrics from personal resting baselines with an explicit epistemic uncertainty penalty.
4. **Dynamic Z-Score Threshold:** Configurable sensitivity slider (1.0 to 3.5σ).

### Running Independently
```bash
python3 server_ml.py
# Verify:
curl http://127.0.0.1:5050/api/ml/model-status
```
