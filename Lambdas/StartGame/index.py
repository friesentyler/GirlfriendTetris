import boto3
from boto3.dynamodb.conditions import Key, Attr
import uuid
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('DeploymentStack-TempTable85935BBC-FHUB9N780SFL')

def handler(event, context):
    id = str(uuid.uuid4())
    table.put_item(
        Item={
            'pk': id,
            'PlayerId': id,
        }
    )

    return {
        "statusCode": 200,
        "body": json.dumps(id)
    }
