from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import boto3
import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="ShelterFlow API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AWS clients
bedrock = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

# DynamoDB tables
forecasts_table = dynamodb.Table(os.getenv('FORECASTS_TABLE', 'shelterflow-forecasts'))
metrics_table = dynamodb.Table(os.getenv('METRICS_TABLE', 'shelterflow-metrics'))

class ForecastRequest(BaseModel):
    shelter_id: str
    item_id: str
    start_date: str
    end_date: str

class ForecastResponse(BaseModel):
    shelter_id: str
    item_id: str
    predictions: List[float]
    confidence_intervals: List[dict]
    timestamp: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/forecast", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    try:
        # Fetch historical data from S3
        historical_data = fetch_historical_data(request.shelter_id, request.item_id)
        
        # Preprocess data
        processed_data = preprocess_data(historical_data)
        
        # Generate forecast using Bedrock
        forecast = await generate_bedrock_forecast(processed_data)
        
        # Store forecast in DynamoDB
        store_forecast(request.shelter_id, request.item_id, forecast)
        
        return forecast
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics")
async def get_metrics(shelter_id: str, item_id: str):
    try:
        response = metrics_table.get_item(
            Key={
                'shelter_id': shelter_id,
                'item_id': item_id
            }
        )
        return response.get('Item', {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def fetch_historical_data(shelter_id: str, item_id: str) -> pd.DataFrame:
    try:
        # In a real implementation, fetch from S3
        # For now, return dummy data
        dates = pd.date_range(end=datetime.now(), periods=30)
        data = pd.DataFrame({
            'date': dates,
            'usage': np.random.normal(100, 10, 30)
        })
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical data: {str(e)}")

def preprocess_data(data: pd.DataFrame) -> pd.DataFrame:
    try:
        # Resample to daily frequency and handle missing values
        data.set_index('date', inplace=True)
        data = data.resample('D').mean().fillna(method='ffill')
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error preprocessing data: {str(e)}")

async def generate_bedrock_forecast(data: pd.DataFrame) -> dict:
    try:
        # In a real implementation, use Bedrock TimeLLM
        # For now, return dummy forecast
        future_dates = pd.date_range(start=data.index[-1], periods=7)
        predictions = np.random.normal(100, 5, 7)
        confidence_intervals = [
            {
                'lower': pred - 10,
                'upper': pred + 10
            }
            for pred in predictions
        ]
        
        return {
            'predictions': predictions.tolist(),
            'confidence_intervals': confidence_intervals,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")

def store_forecast(shelter_id: str, item_id: str, forecast: dict):
    try:
        forecasts_table.put_item(
            Item={
                'shelter_id': shelter_id,
                'item_id': item_id,
                'forecast': forecast,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing forecast: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 