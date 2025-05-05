import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('DeploymentStack-HighscoreTable1ADCD888-JPBPJIAZT2Z9')

def handler(event, context):
    response = table.scan()
    items = response.get('Items', [])

    return {
        "statusCode": 200,
        "body": json.dumps(items)
    }
