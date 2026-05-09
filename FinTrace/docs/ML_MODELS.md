# ML Models Guide

## Overview

FinTrace uses multiple machine learning models working together to detect fraudulent transactions and suspicious patterns in banking networks.

## Models

### 1. Isolation Forest (Unsupervised)

**Purpose**: Detect statistical anomalies without labeled data

**How it works**:
- Randomly selects features and split points
- Isolates anomalies in fewer steps than normal points
- Scores based on path length in isolation trees

**When to use**:
- New, unlabeled transaction data
- Detecting novel fraud patterns
- Quick real-time anomaly detection

### 2. Random Forest (Supervised)

**Purpose**: Classify transactions as fraudulent or legitimate using historical data

**How it works**:
- Ensemble of decision trees
- Each tree trained on random subset of data and features
- Final classification via majority voting

**When to use**:
- When labeled historical fraud data is available
- High-confidence fraud detection
- Feature importance analysis

### 3. Feature Engineering

Features extracted for ML models:

#### Transaction Features
- `transaction_amount`: Dollar amount of transaction
- `transaction_frequency`: Number of transactions in time window
- `transfer_velocity`: Transactions per hour/day

#### Account Features
- `account_age`: Days since account opening
- `balance_anomaly`: Current balance vs historical average
- `average_transaction_size`: Mean transaction amount

#### Behavioral Features
- `geographic_deviation`: Transaction location vs customer profile
- `device_mismatch`: Device/IP different from profile
- `time_anomaly`: Transaction at unusual time
- `velocity_anomaly`: Unusual transaction rate

#### KYC Features
- `kyc_status`: Verification status
- `kyc_income_mismatch`: Transaction vs declared income
- `profile_completeness`: % of profile information filled

#### Network Features
- `network_density`: How many accounts connected
- `suspicious_neighbors`: % of connected accounts flagged
- `path_depth`: Hops from account in fraud rings

## Training

### Data Requirements
- Minimum 10,000 transactions
- 5-10% positive (fraud) cases for balanced learning
- 2+ years of historical data recommended

### Pipeline

```python
1. Data Collection
   ↓
2. Feature Engineering
   ↓
3. Data Splitting (70/20/10 train/val/test)
   ↓
4. Model Training
   ↓
5. Hyperparameter Tuning
   ↓
6. Model Evaluation
   ↓
7. Deployment
```

## Prediction

### Input
Transaction with features (see Feature Engineering)

### Processing
1. Feature scaling (normalization)
2. Pass through Isolation Forest
3. Pass through Random Forest
4. Combine scores with weights

### Output
```json
{
  "fraud_probability": 0.87,
  "anomaly_score": 0.82,
  "risk_level": "high",
  "features": {
    "transaction_amount": 15000,
    "device_mismatch": true,
    "geographic_deviation": true
  },
  "explanation": "High transaction amount with device and geographic mismatch"
}
```

## Risk Levels

| Fraud Probability | Risk Level | Action |
|---|---|---|
| 0.9 - 1.0 | Critical | Block immediately, investigate |
| 0.7 - 0.9 | High | Flag alert, require review |
| 0.4 - 0.7 | Medium | Log for monitoring, may freeze |
| 0.0 - 0.4 | Low | Allow, routine logging |

## Model Updating

### Periodic Retraining
- **Frequency**: Weekly or bi-weekly
- **Trigger**: After collecting significant new data
- **Process**: Retrain models with latest 6-12 months data

### Drift Detection
- Monitor model performance degradation
- If accuracy drops >5%, trigger retraining
- Compare new model predictions vs old

### A/B Testing
- Deploy new model to 10% of traffic
- Monitor false positive/negative rates
- Gradual rollout if performance improves

## Evaluation Metrics

### Classification Metrics
- **Precision**: % of flagged transactions that are actually fraud
- **Recall**: % of actual fraud cases detected
- **F1-Score**: Harmonic mean of precision and recall
- **ROC-AUC**: Area under ROC curve (0.5-1.0, higher is better)

### Business Metrics
- **True Positive Rate**: Fraud correctly detected
- **False Positive Rate**: Legitimate flagged as fraud
- **Cost of missed fraud**: Impact of undetected fraud
- **Cost of false positives**: Customer impact of false alerts

## Thresholds

Model outputs probability, but actionable threshold is configurable:

```
fraud_probability >= 0.9 → CRITICAL (block)
fraud_probability >= 0.7 → HIGH (review required)
fraud_probability >= 0.4 → MEDIUM (log and monitor)
fraud_probability < 0.4 → LOW (allow)
```

Adjust thresholds based on:
- Risk appetite
- False positive tolerance
- Detection sensitivity needed

## Example Training Data

```csv
amount,frequency,account_age,velocity,geographic_deviation,device_mismatch,balance_anomaly,kyc_status,is_fraud
5000,2,365,1,0,0,0,verified,0
15000,10,30,5,1,1,1,pending,1
1000,1,180,0,0,0,0,verified,0
50000,3,7,8,1,0,1,rejected,1
3500,4,120,2,0,1,0,verified,0
```

## API Endpoints

```
POST /predict
  Input: MLPredictionRequest
  Output: MLPredictionResponse

POST /batch-predict
  Input: List[MLPredictionRequest]
  Output: List[MLPredictionResponse]

GET /model/status
  Output: Model health and performance metrics

POST /model/retrain
  Trigger manual model retraining
```

## Performance

- **Latency**: <100ms per prediction
- **Throughput**: 1000+ predictions/second
- **Model Size**: 10-50 MB (depending on tree depth)
- **Memory**: 500MB to 2GB per service instance

## Security

- Models stored encrypted
- Predictions logged for audit
- Feature values validated
- API requires authentication
- Rate limiting enforced
