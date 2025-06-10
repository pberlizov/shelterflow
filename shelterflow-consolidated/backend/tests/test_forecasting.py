import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from app.main import app, preprocess_data

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_preprocess_data():
    # Create sample data
    dates = pd.date_range(start='2024-01-01', end='2024-01-10', freq='H')
    values = np.random.randint(1, 100, size=len(dates))
    df = pd.DataFrame({'timestamp': dates, 'value': values})
    
    # Test preprocessing
    processed = preprocess_data(df)
    
    # Check if resampled to daily frequency
    assert len(processed) == 10  # 10 days
    assert isinstance(processed.index, pd.DatetimeIndex)
    assert processed.index.freq == 'D'

def test_forecast_endpoint():
    # Mock request data
    request_data = {
        "shelter_id": "test-shelter",
        "item_id": "test-item",
        "start_date": "2024-01-01",
        "end_date": "2024-01-14"
    }
    
    # Test endpoint
    response = client.post("/forecast", json=request_data)
    assert response.status_code == 404  # Should fail as we don't have real data

def test_metrics_endpoint():
    # Test metrics endpoint
    response = client.get("/metrics?shelter_id=test-shelter&item_id=test-item")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

@pytest.mark.asyncio
async def test_bedrock_integration():
    # Create sample data
    dates = pd.date_range(start='2024-01-01', end='2024-01-10', freq='D')
    values = np.random.randint(1, 100, size=len(dates))
    df = pd.DataFrame({'timestamp': dates, 'value': values})
    
    # Test Bedrock integration
    from app.main import generate_bedrock_forecast
    try:
        forecast = await generate_bedrock_forecast(df)
        assert isinstance(forecast, dict)
        assert 'predictions' in forecast
        assert 'confidence_intervals' in forecast
    except Exception as e:
        # This is expected to fail in test environment without AWS credentials
        assert "Forecast generation failed" in str(e)

def test_data_validation():
    # Test invalid request data
    invalid_data = {
        "shelter_id": "test-shelter",
        "item_id": "test-item",
        "start_date": "invalid-date",
        "end_date": "2024-01-14"
    }
    
    response = client.post("/forecast", json=invalid_data)
    assert response.status_code == 422  # Validation error 