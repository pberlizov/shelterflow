import json
import boto3
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')
iot = boto3.client('iot-data')

# Get environment variables
FORECASTS_TABLE = os.environ['FORECASTS_TABLE']
ORDER_QUEUE_URL = os.environ['ORDER_QUEUE_URL']

def get_forecast(shelter_id: str, item_id: str) -> Dict:
    """Fetch the latest forecast from DynamoDB."""
    table = dynamodb.Table(FORECASTS_TABLE)
    response = table.get_item(
        Key={
            'shelter_id': shelter_id,
            'item_id': item_id
        }
    )
    return response.get('Item', {})

def get_inventory_level(shelter_id: str, item_id: str) -> float:
    """Fetch current inventory level from IoT Greengrass shadow."""
    try:
        response = iot.get_thing_shadow(
            thingName=f"{shelter_id}-{item_id}"
        )
        shadow = json.loads(response['payload'].read())
        return float(shadow['state']['reported']['inventory_level'])
    except Exception as e:
        print(f"Error fetching inventory: {str(e)}")
        return 0.0

def generate_purchase_order(
    shelter_id: str,
    item_id: str,
    forecast: Dict,
    current_inventory: float,
    threshold: float = 0.2  # 20% buffer
) -> Optional[Dict]:
    """Generate a purchase order if needed."""
    if not forecast or 'forecast' not in forecast:
        return None

    predictions = forecast['forecast']['predictions']
    if not predictions:
        return None

    # Calculate average daily usage from forecast
    avg_daily_usage = sum(p['value'] for p in predictions) / len(predictions)
    
    # Calculate days until stockout
    days_until_stockout = current_inventory / avg_daily_usage if avg_daily_usage > 0 else float('inf')
    
    # Generate order if inventory will deplete within threshold
    if days_until_stockout < (14 + threshold * 14):  # 14 days + buffer
        order_quantity = max(avg_daily_usage * 14 - current_inventory, 0)
        
        return {
            'shelter_id': shelter_id,
            'item_id': item_id,
            'order_quantity': round(order_quantity, 2),
            'current_inventory': current_inventory,
            'forecasted_usage': avg_daily_usage,
            'days_until_stockout': round(days_until_stockout, 1),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    return None

def send_to_queue(order: Dict):
    """Send purchase order to SQS queue."""
    try:
        sqs.send_message(
            QueueUrl=ORDER_QUEUE_URL,
            MessageBody=json.dumps(order)
        )
        print(f"Order sent to queue: {order['item_id']}")
    except Exception as e:
        print(f"Error sending to queue: {str(e)}")

def lambda_handler(event, context):
    """Main Lambda handler."""
    try:
        # Get list of shelters and items (in production, this would come from a database)
        shelters = ['shelter-1', 'shelter-2']  # Example shelters
        items = ['blankets', 'food', 'hygiene']  # Example items
        
        orders_generated = 0
        
        for shelter_id in shelters:
            for item_id in items:
                # Get forecast and inventory
                forecast = get_forecast(shelter_id, item_id)
                current_inventory = get_inventory_level(shelter_id, item_id)
                
                # Generate purchase order if needed
                order = generate_purchase_order(
                    shelter_id=shelter_id,
                    item_id=item_id,
                    forecast=forecast,
                    current_inventory=current_inventory
                )
                
                if order:
                    send_to_queue(order)
                    orders_generated += 1
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Processed {len(shelters) * len(items)} items',
                'orders_generated': orders_generated
            })
        }
        
    except Exception as e:
        print(f"Error in procurement agent: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        } 